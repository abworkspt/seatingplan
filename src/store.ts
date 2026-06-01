import { INITIAL_GUESTS, type Guest } from './data/guests';

export interface Table {
  id: string;
  label: string;
  seats: (string | null)[];
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
  | { type: 'ADD_TABLE' }
  | { type: 'REMOVE_TABLE'; tableId: string }
  | { type: 'RENAME_TABLE'; tableId: string; label: string }
  | { type: 'LOAD'; state: AppState };

function createInitialTables(): Table[] {
  return Array.from({ length: 16 }, (_, i) => ({
    id: `table-${i + 1}`,
    label: `Mesa ${i + 1}`,
    seats: Array(8).fill(null),
  }));
}

export function getInitialState(): AppState {
  try {
    const saved = localStorage.getItem('seatingplan');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { guests: INITIAL_GUESTS, tables: createInitialTables() };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD':
      return action.state;

    case 'ASSIGN_GUEST': {
      const { guestId, tableId, seatIndex } = action;
      // Remove from current seat if any
      const tables = state.tables.map(t => ({
        ...t,
        seats: t.seats.map(s => (s === guestId ? null : s)),
      }));
      // Place in new seat
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
      // Who is currently in the target seat?
      const targetTable = state.tables.find(t => t.id === toTableId);
      const displacedId = targetTable?.seats[toSeatIndex] ?? null;

      // Find current seat of moving guest
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
          // If displaced guest needs to go to fromSeat (swap)
          if (displacedId && fromTableId === toTableId && fromSeatIndex !== null) {
            seats[fromSeatIndex] = displacedId;
          }
        }
        if (t.id === fromTableId && fromSeatIndex !== null && t.id !== toTableId) {
          seats[fromSeatIndex] = displacedId; // null or swapped
        }
        return { ...t, seats };
      });

      const guests = state.guests.map(g => {
        if (g.id === guestId) return { ...g, tableId: toTableId, seatIndex: toSeatIndex };
        if (g.id === displacedId && fromTableId) return { ...g, tableId: fromTableId, seatIndex: fromSeatIndex ?? undefined };
        return g;
      });

      return { ...state, guests, tables };
    }

    case 'SET_COMPANION': {
      // Make guestId a companion of mainGuestId
      // Also ensure the guest is no longer marked as main
      const guests = state.guests.map(g => {
        if (g.id === action.guestId) {
          return { ...g, isMain: false, mainGuestId: action.mainGuestId };
        }
        // If this guest was previously a companion of guestId, detach it
        if (g.mainGuestId === action.guestId) {
          return { ...g, isMain: true, mainGuestId: undefined };
        }
        return g;
      });
      return { ...state, guests };
    }

    case 'REMOVE_COMPANION': {
      // Detach guest from its main, make it a standalone main guest
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
      // Remove from any seat
      const tables = state.tables.map(t => ({
        ...t,
        seats: t.seats.map(s => (s === action.guestId ? null : s)),
      }));
      // Detach any companions that referenced this guest as main
      const guests = state.guests
        .filter(g => g.id !== action.guestId)
        .map(g => g.mainGuestId === action.guestId
          ? { ...g, isMain: true, mainGuestId: undefined }
          : g
        );
      return { ...state, guests, tables };
    }

    case 'ADD_TABLE': {
      const num = state.tables.length + 1;
      const table: Table = {
        id: `table-${Date.now()}`,
        label: `Mesa ${num}`,
        seats: Array(8).fill(null),
      };
      return { ...state, tables: [...state.tables, table] };
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

    default:
      return state;
  }
}
