import { useEffect, useMemo, useReducer, useState } from 'react';
import { CardDialog } from './components/CardDialog';
import { Column } from './components/Column';
import { Icon } from './components/ui';
import { seedBoard } from './data/seed';
import { matches, newId, reducer, todayIso } from './lib/board';
import { loadBoard, saveBoard } from './lib/storage';
import { useTheme } from './lib/theme';
import { COLUMNS, type Board, type ColumnId } from './types';

/** Maps an index in the visible (filtered) list to an index in the full column order. */
function boardIndex(board: Board, query: string, cardId: string, to: ColumnId, visibleIndex: number): number {
  const full = board.order[to].filter((id) => id !== cardId);
  const anchor = full.filter((id) => matches(board.cards[id]!, query))[visibleIndex];
  return anchor === undefined ? full.length : full.indexOf(anchor);
}

type Dialog = { mode: 'new'; column: ColumnId } | { mode: 'edit'; id: string } | null;

export default function App() {
  const today = useMemo(todayIso, []);
  const [board, dispatch] = useReducer(reducer, undefined, () => loadBoard() ?? seedBoard(today));
  const [theme, toggleTheme] = useTheme();
  const [query, setQuery] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);

  useEffect(() => saveBoard(board), [board]);

  const all = Object.keys(board.cards).length;
  const done = board.order.done.length;
  const editing = dialog?.mode === 'edit' ? board.cards[dialog.id] ?? null : null;
  const close = () => setDialog(null);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden="true" />
          <div>
            <h1>Flow</h1>
            <p>
              {all} cards · {all ? Math.round((done / all) * 100) : 0}% done
            </p>
          </div>
        </div>
        <label className="search">
          <Icon name="search" />
          <input type="search" placeholder="Search cards" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search cards" />
        </label>
        <button type="button" className="icon-btn" aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggleTheme}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setDialog({ mode: 'new', column: 'todo' })}>
          <Icon name="plus" /> New card
        </button>
      </header>

      <main className="board">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            total={board.order[col.id].length}
            cards={board.order[col.id].map((id) => board.cards[id]!).filter((c) => matches(c, query))}
            today={today}
            draggingId={draggingId}
            onAdd={() => setDialog({ mode: 'new', column: col.id })}
            onOpen={(id) => setDialog({ mode: 'edit', id })}
            onMove={(cardId, to, index) => dispatch({ type: 'move', cardId, to, index: boardIndex(board, query, cardId, to, index) })}
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
          />
        ))}
      </main>

      <CardDialog
        card={editing}
        open={dialog !== null}
        onClose={close}
        onSave={(values) => {
          if (dialog?.mode === 'new') dispatch({ type: 'add', column: dialog.column, card: { id: newId(), ...values } });
          if (editing) dispatch({ type: 'update', card: { id: editing.id, ...values } });
          close();
        }}
        onDelete={editing ? () => {
          dispatch({ type: 'delete', cardId: editing.id });
          close();
        } : undefined}
      />
    </div>
  );
}
