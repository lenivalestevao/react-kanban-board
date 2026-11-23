import { useState, type DragEvent } from 'react';
import type { Card, ColumnId } from '../types';
import { CardView } from './CardView';
import { Icon } from './ui';

interface Props {
  id: ColumnId;
  title: string;
  cards: Card[];
  total: number;
  today: string;
  draggingId: string | null;
  onAdd: () => void;
  onOpen: (id: string) => void;
  onMove: (cardId: string, to: ColumnId, index: number) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

/** Index to insert at, from the pointer position over the cards already in the column. */
function dropIndex(list: HTMLElement, clientY: number): number {
  const els = [...list.querySelectorAll<HTMLElement>('[data-card]:not(.dragging)')];
  const i = els.findIndex((el) => {
    const r = el.getBoundingClientRect();
    return clientY < r.top + r.height / 2;
  });
  return i === -1 ? els.length : i;
}

export function Column({ id, title, cards, total, today, draggingId, onAdd, onOpen, onMove, onDragStart, onDragEnd }: Props) {
  const [over, setOver] = useState<number | null>(null);
  const filtered = cards.length !== total;

  const handleOver = (e: DragEvent<HTMLDivElement>) => {
    if (!draggingId) return;
    e.preventDefault();
    setOver(dropIndex(e.currentTarget, e.clientY));
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    if (!draggingId) return;
    e.preventDefault();
    onMove(draggingId, id, dropIndex(e.currentTarget, e.clientY));
    setOver(null);
  };

  return (
    <section className="column" aria-label={title}>
      <header className="column-head">
        <h2>{title}</h2>
        <span className="count">{filtered ? `${cards.length}/${total}` : total}</span>
        <button type="button" className="icon-btn add-btn" aria-label={`Add card to ${title}`} onClick={onAdd}>
          <Icon name="plus" />
        </button>
      </header>
      <div className={`cards ${over !== null ? 'over' : ''}`} onDragOver={handleOver} onDragLeave={() => setOver(null)} onDrop={handleDrop}>
        {cards.map((card, i) => (
          <div key={card.id} className="slot">
            {over === i && draggingId !== card.id && <div className="drop-line" />}
            <CardView
              card={card}
              column={id}
              today={today}
              dragging={draggingId === card.id}
              onOpen={() => onOpen(card.id)}
              onMove={(to) => onMove(card.id, to, Number.MAX_SAFE_INTEGER)}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', card.id);
                e.dataTransfer.effectAllowed = 'move';
                onDragStart(card.id);
              }}
              onDragEnd={() => {
                setOver(null);
                onDragEnd();
              }}
            />
          </div>
        ))}
        {over !== null && over >= cards.length && <div className="drop-line" />}
        {cards.length === 0 && over === null && <p className="empty">{filtered ? 'No matching cards' : 'Drop cards here'}</p>}
      </div>
    </section>
  );
}
