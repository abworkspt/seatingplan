import { INITIAL_GUESTS, type Guest } from './data/guests';

let idCounter = 0;
function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch { /* ignore */ }
  idCounter += 1;
  return `${Date.now()}-${idCounter}-${Math.floor(Math.random() * 1e6)}`;
}

export interface Table {
  id: string;
  label: string;
  seats: (string | null)[];
  shape: 'rectangular' | 'circular';
  x: number;
  y: number;
}

export interface AppState {
  guests: Guest[];
  tables: Table[];
}

type Action =
  | { type: 'ASSIGN_GUEST'; guestId: string; tableId: string; seatIndex: number }
  | { type: 'UNASSIGN_GUEST'; guestId: string }
  | { type: 'MOVE_GUEST'; guestId: string; toTableId: string; toSeatIndex: number }
  | { type: 'SET_COMPANION'; guestId: string; mainGuestId: string }
  | { type: 'REMOVE_COMPANION'; guestId: string }
  | { type: 'ADD_GUEST'; name: string; guestType: 'adult' | 'child' | 'baby'; mainGuestId?: string }
  | { type: 'DELETE_GUEST'; guestId: string }
  | { type: 'RENAME_GUEST'; guestId: string; name: string }
  | { type: 'ADD_TABLES'; count: number; shape: 'rectangular' | 'circular'; seatCount: number }
  | { type: 'REMOVE_TABLE'; tableId: string }
  | { type: 'RENAME_TABLE'; tableId: string; label: string }
  | { type: 'MOVE_TABLE'; tableId: string; x: number; y: number }
  | { type: 'SET_TABLE_SHAPE'; tableId: string; shape: 'rectangular' | 'circular' }
  | { type: 'EDIT_TABLE'; tableId: string; label: string; shape: 'rectangular' | 'circular'; seatCount: number }
  | { type: 'LOAD'; state: AppState };

const COL_LEFT = 20;
const COL_RIGHT = 430;
const ROW_H = 190;

function getDefaultPosition(n: number): { x: number; y: number } {
  if (n <= 8) {
    // Right column, Mesa 8 at top (y=20), Mesa 1 at bottom
    return { x: COL_RIGHT, y: (8 - n) * ROW_H + 20 };
  } else {
    // Left column, Mesa 16 at top (y=20), Mesa 9 at bottom
    return { x: COL_LEFT, y: (16 - n) * ROW_H + 20 };
  }
}

function createInitialTables(): Table[] {
  return Array.from({ length: 16 }, (_, i) => {
    const n = i + 1;
    return {
      id: `table-${n}`,
      label: `Mesa ${n}`,
      seats: Array(8).fill(null),
      shape: 'rectangular' as const,
      ...getDefaultPosition(n),
    };
  });
}

// Migrate tables that may be missing shape/x/y (legacy data)
function migrateTable(t: Record<string, unknown>): Table {
  const num = parseInt(String(t.label ?? '').replace(/\D/g, '')) || 1;
  const clamped = Math.min(Math.max(num, 1), 32);
  const pos = getDefaultPosition(clamped);
  return {
    id: t.id as string,
    label: t.label as string,
    seats: (t.seats as (string | null)[]) ?? Array(8).fill(null),
    shape: (t.shape as 'rectangular' | 'circular') ?? 'rectangular',
    x: typeof t.x === 'number' ? t.x : pos.x,
    y: typeof t.y === 'number' ? t.y : pos.y,
  };
}

function migrateState(s: Partial<AppState>): AppState {
  return {
    guests: s.guests ?? INITIAL_GUESTS,
    tables: (s.tables ?? createInitialTables()).map(t =>
      migrateTable(t as unknown as Record<string, unknown>)
    ),
  };
}

export function getInitialState(): AppState {
  try {
    const saved = localStorage.getItem('seatingplan');
    if (saved) return migrateState(JSON.parse(saved));
  } catch {}
  return { guests: INITIAL_GUESTS, tables: createInitialTables() };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD':
      return migrateState(action.state as Partial<AppState>);

    case 'ASSIGN_GUEST': {
      const { guestId, tableId, seatIndex } = action;
      const tables = state.tables.map(t => ({
        ...t,
        seats: t.seats.map(s => (s === guestId ? null : s)),
      }));
      const newTables = tables.map(t => {
        if (t.id !== tableId) return t;
        const seats = [...t.seats];
        seats[seatIndex] = guestId;
        return { ...t, seats };
      });
      const guests = state.guests.map(g =>
        g.id === guestId ? { ...g, tableId, seatIndex } : g
      );
      return { ...state, guests, tables: newTables };
    }

    case 'UNASSIGN_GUEST': {
      const tables = state.tables.map(t => ({
        ...t,
        seats: t.seats.map(s => (s === action.guestId ? null : s)),
      }));
      const guests = state.guests.map(g =>
        g.id === action.guestId ? { ...g, tableId: undefined, seatIndex: undefined } : g
      );
      return { ...state, guests, tables };
    }

    case 'MOVE_GUEST': {
      const { guestId, toTableId, toSeatIndex } = action;
      const targetTable = state.tables.find(t => t.id === toTableId);
      const displacedId = targetTable?.seats[toSeatIndex] ?? null;

      let fromTableId: string | null = null;
      let fromSeatIndex: number | null = null;
      for (const t of state.tables) {
        const idx = t.seats.indexOf(guestId);
        if (idx !== -1) { fromTableId = t.id; fromSeatIndex = idx; break; }
      }

      const tables = state.tables.map(t => {
        const seats = [...t.seats];
        if (t.id === toTableId) {
          seats[toSeatIndex] = guestId;
          if (displacedId && fromTableId === toTableId && fromSeatIndex !== null) {
            seats[fromSeatIndex] = displacedId;
          }
        }
        if (t.id === fromTableId && fromSeatIndex !== null && t.id !== toTableId) {
          seats[fromSeatIndex] = displacedId;
        }
        return { ...t, seats };
      });

      const guests = state.guests.map(g => {
        if (g.id === guestId) return { ...g, tableId: toTableId, seatIndex: toSeatIndex };
        if (g.id === displacedId && fromTableId)
          return { ...g, tableId: fromTableId, seatIndex: fromSeatIndex ?? undefined };
        return g;
      });

      return { ...state, guests, tables };
    }

    case 'SET_COMPANION': {
      // Making a guest a companion also removes them from any seat they occupy,
      // so the list and the floor plan never disagree.
      const tables = state.tables.map(t => ({
        ...t,
        seats: t.seats.map(s => (s === action.guestId ? null : s)),
      }));
      const guests = state.guests.map(g => {
        if (g.id === action.guestId)
          return { ...g, isMain: false, mainGuestId: action.mainGuestId, tableId: undefined, seatIndex: undefined };
        if (g.mainGuestId === action.guestId) return { ...g, isMain: true, mainGuestId: undefined };
        return g;
      });
      return { ...state, guests, tables };
    }

    case 'REMOVE_COMPANION': {
      const guests = state.guests.map(g =>
        g.id === action.guestId ? { ...g, isMain: true, mainGuestId: undefined } : g
      );
      return { ...state, guests };
    }

    case 'ADD_GUEST': {
      const newGuest: Guest = {
        id: `g-${Date.now()}`,
        name: action.name,
        type: action.guestType,
        isMain: !action.mainGuestId,
        mainGuestId: action.mainGuestId,
      };
      return { ...state, guests: [...state.guests, newGuest] };
    }

    case 'RENAME_GUEST': {
      const guests = state.guests.map(g =>
        g.id === action.guestId ? { ...g, name: action.name } : g
      );
      return { ...state, guests };
    }

    case 'DELETE_GUEST': {
      const tables = state.tables.map(t => ({
        ...t,
        seats: t.seats.map(s => (s === action.guestId ? null : s)),
      }));
      const guests = state.guests
        .filter(g => g.id !== action.guestId)
        .map(g =>
          g.mainGuestId === action.guestId ? { ...g, isMain: true, mainGuestId: undefined } : g
        );
      return { ...state, guests, tables };
    }

    case 'ADD_TABLES': {
      const count = Math.max(1, Math.min(50, action.count));
      const seatCount = Math.max(1, Math.min(20, action.seatCount));
      const existingNums = state.tables.map(t => parseInt(t.label.replace(/\D/g, '')) || 0);
      let maxNum = existingNums.length ? Math.max(...existingNums) : 0;
      const newTables: Table[] = [];
      for (let i = 0; i < count; i++) {
        maxNum++;
        const x = 240 + (i % 8) * 26;
        const y = 40 + (i % 8) * 26 + Math.floor(i / 8) * 240;
        newTables.push({
          id: `table-${newId()}`,
          label: `Mesa ${maxNum}`,
          seats: Array(seatCount).fill(null),
          shape: action.shape,
          x,
          y,
        });
      }
      return { ...state, tables: [...state.tables, ...newTables] };
    }

    case 'REMOVE_TABLE': {
      const table = state.tables.find(t => t.id === action.tableId);
      if (!table) return state;
      const occupants = table.seats.filter(Boolean) as string[];
      const tables = state.tables.filter(t => t.id !== action.tableId);
      const guests = state.guests.map(g =>
        occupants.includes(g.id) ? { ...g, tableId: undefined, seatIndex: undefined } : g
      );
      return { ...state, guests, tables };
    }

    case 'RENAME_TABLE': {
      const tables = state.tables.map(t =>
        t.id === action.tableId ? { ...t, label: action.label } : t
      );
      return { ...state, tables };
    }

    case 'MOVE_TABLE': {
      const tables = state.tables.map(t =>
        t.id === action.tableId ? { ...t, x: action.x, y: action.y } : t
      );
      return { ...state, tables };
    }

    case 'SET_TABLE_SHAPE': {
      const tables = state.tables.map(t =>
        t.id === action.tableId ? { ...t, shape: action.shape } : t
      );
      return { ...state, tables };
    }

    case 'EDIT_TABLE': {
      const seatCount = Math.max(1, Math.min(20, action.seatCount));
      let removedGuestIds: string[] = [];
      const tables = state.tables.map(t => {
        if (t.id !== action.tableId) return t;
        let seats = [...t.seats];
        if (seatCount < seats.length) {
          // Shrinking: guests sitting in the removed (trailing) seats get unassigned
          removedGuestIds = seats.slice(seatCount).filter(Boolean) as string[];
          seats = seats.slice(0, seatCount);
        } else if (seatCount > seats.length) {
          seats = [...seats, ...Array(seatCount - seats.length).fill(null)];
        }
        return { ...t, label: action.label, shape: action.shape, seats };
      });
      const guests = removedGuestIds.length
        ? state.guests.map(g =>
            removedGuestIds.includes(g.id) ? { ...g, tableId: undefined, seatIndex: undefined } : g
          )
        : state.guests;
      return { ...state, guests, tables };
    }

    default:
      return state;
  }
}
