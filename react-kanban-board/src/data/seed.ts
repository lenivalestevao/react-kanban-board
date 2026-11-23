import { addDays } from '../lib/board';
import type { Board, Card, ColumnId } from '../types';

export function seedBoard(today: string): Board {
  const rows: [ColumnId, Omit<Card, 'id'>][] = [
    ['todo', { title: 'Write onboarding email sequence', description: 'Three emails over the first week.', priority: 'medium', assignee: 'Marta Oliveira', due: addDays(today, 5), labels: ['Marketing'] }],
    ['todo', { title: 'Audit accessibility on checkout', description: 'Keyboard paths and contrast.', priority: 'high', assignee: 'Kenji Watanabe', due: addDays(today, 2), labels: ['A11y', 'Web'] }],
    ['todo', { title: 'Plan Q1 roadmap workshop', description: '', priority: 'low', assignee: 'Priya Nair', due: null, labels: ['Planning'] }],
    ['doing', { title: 'Redesign pricing page', description: 'New plan comparison and FAQ.', priority: 'high', assignee: 'Lucas Ferreira', due: addDays(today, 1), labels: ['Design', 'Web'] }],
    ['doing', { title: 'Migrate billing webhooks', description: 'Move to the new events API.', priority: 'medium', assignee: 'Amelia Brown', due: addDays(today, 7), labels: ['Backend'] }],
    ['review', { title: 'Dark mode for settings screens', description: 'Contrast pass pending.', priority: 'medium', assignee: 'Diego Alvarez', due: addDays(today, 3), labels: ['Design'] }],
    ['review', { title: 'Fix CSV export encoding', description: 'UTF-8 with BOM for Excel.', priority: 'low', assignee: 'Sofia Rossi', due: addDays(today, -1), labels: ['Bug'] }],
    ['done', { title: 'Set up error monitoring', description: '', priority: 'medium', assignee: 'Noah Fischer', due: addDays(today, -4), labels: ['Backend'] }],
    ['done', { title: 'Publish changelog page', description: '', priority: 'low', assignee: 'Aiko Tanaka', due: addDays(today, -6), labels: ['Docs'] }],
  ];
  const board: Board = { cards: {}, order: { todo: [], doing: [], review: [], done: [] } };
  rows.forEach(([column, card], i) => {
    const id = `seed_${i + 1}`;
    board.cards[id] = { id, ...card };
    board.order[column].push(id);
  });
  return board;
}
