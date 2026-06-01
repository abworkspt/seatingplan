import React, { useReducer, useState, useEffect, useRef } from 'react';
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { reducer, getInitialState } from './store';
import type { Guest } from './data/guests';
import { useIsMobile } from './hooks/useIsMobile';
import GuestList from './components/GuestList';
import GuestCard from './components/GuestCard';
import FloorPlan from './components/FloorPlan';
import SeatPicker from './components/SeatPicker';
import './App.css';

interface PickerTarget { tableId: string; seatIndex: number; }

const APP_SECRET = import.meta.env.VITE_APP_SECRET;

async function fetchState() {
  const headers: Record<string, string> = {};
  if (APP_SECRET) headers['x-app-secret'] = APP_SECRET;
  const res = await fetch('/api/state', { headers });
  if (res.status === 204) return null; // no data yet
  if (!res.ok) throw new Error('Failed to load state');
  return res.json();
}

async function saveState(data: unknown) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (APP_SECRET) headers['x-app-secret'] = APP_SECRET;
  await fetch('/api/state', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const [mobileTab, setMobileTab] = useState<'sala' | 'lista'>('sala');
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [syncing, setSyncing] = useState(false);
  const isMobile = useIsMobile();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);

  // Load from DB on mount
  useEffect(() => {
    fetchState().then(data => {
      if (data) {
        dispatch({ type: 'LOAD', state: data });
      }
      isFirstLoad.current = false;
    }).catch(() => {
      // fall back to localStorage if API unavailable
      isFirstLoad.current = false;
    });
  }, []);

  // Save to DB (debounced 1.5s) + localStorage as fallback
  useEffect(() => {
    if (isFirstLoad.current) return;
    localStorage.setItem('seatingplan', JSON.stringify(state));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSyncing(true);
      saveState(state).finally(() => setSyncing(false));
    }, 1500);
  }, [state]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveGuest(event.active.data.current?.guest ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveGuest(null);
    const { active, over } = event;
    if (!over) return;
    const guestId = active.id as string;
    const overId = over.id as string;

    if (overId.startsWith('guest-target::')) {
      const mainGuestId = overId.replace('guest-target::', '');
      if (mainGuestId !== guestId)
        dispatch({ type: 'SET_COMPANION', guestId, mainGuestId });
      return;
    }

    const parts = overId.split('::');
    if (parts.length === 2) {
      const [tableId, seatIndexStr] = parts;
      const seatIndex = parseInt(seatIndexStr, 10);
      const targetTable = state.tables.find(t => t.id === tableId);
      const currentOccupant = targetTable?.seats[seatIndex];
      if (currentOccupant && currentOccupant !== guestId)
        dispatch({ type: 'MOVE_GUEST', guestId, toTableId: tableId, toSeatIndex: seatIndex });
      else if (!currentOccupant)
        dispatch({ type: 'ASSIGN_GUEST', guestId, tableId, seatIndex });
    }
  };

  const assignedGuestIds = new Set<string>(
    state.tables.flatMap(t => t.seats.filter((s): s is string => s !== null))
  );

  const guestListProps = {
    guests: state.guests,
    assignedIds: assignedGuestIds,
    onRemoveCompanion: (guestId: string) => dispatch({ type: 'REMOVE_COMPANION', guestId }),
    onDeleteGuest: (guestId: string) => dispatch({ type: 'DELETE_GUEST', guestId }),
    onAddGuest: (name: string, guestType: 'adult' | 'child' | 'baby', mainGuestId?: string) =>
      dispatch({ type: 'ADD_GUEST', name, guestType, mainGuestId }),
    onRenameGuest: (guestId: string, name: string) => dispatch({ type: 'RENAME_GUEST', guestId, name }),
  };

  const floorPlanProps = {
    tables: state.tables,
    guests: state.guests,
    onAddTable: () => dispatch({ type: 'ADD_TABLE' }),
    onRemoveTable: (id: string) => dispatch({ type: 'REMOVE_TABLE', tableId: id }),
    onRenameTable: (id: string, label: string) => dispatch({ type: 'RENAME_TABLE', tableId: id, label }),
    onUnassign: (guestId: string) => dispatch({ type: 'UNASSIGN_GUEST', guestId }),
    onSeatTap: isMobile ? (tableId: string, seatIndex: number) => setPickerTarget({ tableId, seatIndex }) : undefined,
  };

  const pickerTable = pickerTarget ? state.tables.find(t => t.id === pickerTarget.tableId) ?? null : null;
  const pickerGuest = pickerTarget && pickerTable
    ? state.guests.find(g => g.id === pickerTable.seats[pickerTarget.seatIndex]) ?? null
    : null;
  const unassignedCount = state.guests.filter(g => !assignedGuestIds.has(g.id)).length;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="app">
        <header className="app-header">
          <h1>Seating Plan — Casamento</h1>
          <div className="header-actions">
            {syncing && <span className="sync-indicator">A guardar…</span>}
            <button className="export-btn" onClick={() => window.print()}>Exportar PDF</button>
          </div>
        </header>

        {isMobile ? (
          /* ── MOBILE ── */
          <>
            <div className="mobile-body">
              <div className={`mobile-panel ${mobileTab === 'sala' ? 'visible' : 'hidden'}`}>
                <FloorPlan {...floorPlanProps} />
              </div>
              <div className={`mobile-panel ${mobileTab === 'lista' ? 'visible' : 'hidden'}`}>
                <GuestList {...guestListProps} />
              </div>
            </div>
            <nav className="mobile-tabs">
              <button className={`mobile-tab ${mobileTab === 'sala' ? 'active' : ''}`} onClick={() => setMobileTab('sala')}>
                Sala
              </button>
              <button className={`mobile-tab ${mobileTab === 'lista' ? 'active' : ''}`} onClick={() => setMobileTab('lista')}>
                Convidados
                {unassignedCount > 0 && <span className="tab-badge">{unassignedCount}</span>}
              </button>
            </nav>
          </>
        ) : (
          /* ── DESKTOP ── */
          <div className="app-body">
            <GuestList {...guestListProps} />
            <FloorPlan {...floorPlanProps} />
          </div>
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeGuest && <GuestCard guest={activeGuest} compact />}
      </DragOverlay>

      {pickerTarget && pickerTable && (
        <SeatPicker
          table={pickerTable}
          seatIndex={pickerTarget.seatIndex}
          guests={state.guests}
          currentGuest={pickerGuest}
          assignedIds={assignedGuestIds}
          onAssign={guestId => dispatch({ type: 'ASSIGN_GUEST', guestId, tableId: pickerTarget.tableId, seatIndex: pickerTarget.seatIndex })}
          onUnassign={() => pickerGuest && dispatch({ type: 'UNASSIGN_GUEST', guestId: pickerGuest.id })}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </DndContext>
  );
}
