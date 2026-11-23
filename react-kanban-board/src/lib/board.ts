import { COLUMNS, type Board, type Card, type ColumnId } from '../types';

const columnIds = COLUMNS.map((c) => c.id);

export function findColumn(board: Board, cardId: string): ColumnId | null {
  return columnIds.find((c) => board.order[c].includes(cardId)) ?? null;
}

/** Moves a card to a column at an index (clamped). Works within the same column too. */
export function moveCard(board: Board, cardId: string, to: ColumnId, index: number): Board {
  const from = findColumn(board, cardId);
  if (!from) return board;
  const order = { ...board.order };
  order[from] = order[from].filter((id) => id !== cardId);
  const target = [...order[to]];
  const at = Math.max(0, Math.min(index, target.length));
  target.splice(at, 0, cardId);
  order[to] = target;
  return { ...board, order };
}

export function addCard(board: Board, column: ColumnId, card: Card): Board {
  return {
    cards: { ...board.cards, [card.id]: card },
    order: { ...board.order, [column]: [...board.order[column], card.id] },
  };
}

export function updateCard(board: Board, card: Card): Board {
  if (!board.cards[card.id]) return board;
  return { ...board, cards: { ...board.cards, [card.id]: card } };
}

export function deleteCard(board: Board, cardId: string): Board {
  const { [cardId]: _removed, ...cards } = board.cards;
  const order = { ...board.order };
  for (const c of columnIds) order[c] = order[c].filter((id) => id !== cardId);
  return { cards, order };
}

/** Case-insensitive match on title, description, assignee and labels. */
export function matches(card: Card, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [card.title, card.description, card.assignee, ...card.labels].some((s) => s.toLowerCase().includes(q));
}

export type DueState = 'none' | 'overdue' | 'soon' | 'ok';

const DAY = 86_400_000;
const utc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

/** Overdue before today, "soon" within two days, otherwise ok. */
export function dueState(due: string | null, today: string): DueState {
  if (!due) return 'none';
  const days = Math.round((utc(due) - utc(today)) / DAY);
  if (days < 0) return 'overdue';
  return days <= 2 ? 'soon' : 'ok';
}

export function addDays(iso: string, days: number): string {
  return new Date(utc(iso) + days * DAY).toISOString().slice(0, 10);
}

export const todayIso = (): string => new Date().toISOString().slice(0, 10);

export function newId(): string {
  return `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function parseLabels(text: string): string[] {
  return [...new Set(text.split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 4);
}

export type Action =
  | { type: 'move'; cardId: string; to: ColumnId; index: number }
  | { type: 'add'; column: ColumnId; card: Card }
  | { type: 'update'; card: Card }
  | { type: 'delete'; cardId: string }
  | { type: 'reset'; board: Board };

export function reducer(board: Board, action: Action): Board {
  switch (action.type) {
    case 'move':
      return moveCard(board, action.cardId, action.to, action.index);
    case 'add':
      return addCard(board, action.column, action.card);
    case 'update':
      return updateCard(board, action.card);
    case 'delete':
      return deleteCard(board, action.cardId);
    case 'reset':
      return action.board;
  }
}
