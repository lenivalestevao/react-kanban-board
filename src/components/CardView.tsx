import type { DragEvent } from 'react';
import { dueState } from '../lib/board';
import { COLUMNS, type Card, type ColumnId } from '../types';
import { Avatar, Icon, IconButton } from './ui';

interface Props {
  card: Card;
  column: ColumnId;
  today: string;
  dragging: boolean;
  onOpen: () => void;
  onMove: (to: ColumnId) => void;
  onDragStart: (e: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

const dueText = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

export function CardView({ card, column, today, dragging, onOpen, onMove, onDragStart, onDragEnd }: Props) {
  const idx = COLUMNS.findIndex((c) => c.id === column);
  const prev = COLUMNS[idx - 1];
  const next = COLUMNS[idx + 1];
  const due = dueState(card.due, today);

  return (
    <article className={`card ${dragging ? 'dragging' : ''}`} data-card draggable onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="card-top">
        <span className={`prio prio-${card.priority}`}>{card.priority}</span>
        <div className="card-moves">
          <IconButton label={prev ? `Move to ${prev.title}` : 'Already first'} disabled={!prev} onClick={() => prev && onMove(prev.id)}>
            <Icon name="left" size={14} />
          </IconButton>
          <IconButton label={next ? `Move to ${next.title}` : 'Already last'} disabled={!next} onClick={() => next && onMove(next.id)}>
            <Icon name="right" size={14} />
          </IconButton>
        </div>
      </div>
      <button type="button" className="card-title" onClick={onOpen}>
        {card.title}
      </button>
      {card.description && <p className="card-desc">{card.description}</p>}
      {card.labels.length > 0 && (
        <div className="labels">
          {card.labels.map((l) => (
            <span key={l} className="label">
              {l}
            </span>
          ))}
        </div>
      )}
      <div className="card-foot">
        {card.due ? (
          <span className={`due due-${due}`}>
            <Icon name="clock" size={13} />
            {dueText(card.due)}
          </span>
        ) : (
          <span />
        )}
        <Avatar name={card.assignee} />
      </div>
    </article>
  );
}
