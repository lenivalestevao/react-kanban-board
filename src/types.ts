export type Priority = 'low' | 'medium' | 'high';
export type ColumnId = 'todo' | 'doing' | 'review' | 'done';

export interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  assignee: string;
  /** ISO date (YYYY-MM-DD) or null. */
  due: string | null;
  labels: string[];
}

export interface Board {
  /** Card ids per column, in display order. */
  order: Record<ColumnId, string[]>;
  cards: Record<string, Card>;
}

export const COLUMNS: readonly { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high'];
