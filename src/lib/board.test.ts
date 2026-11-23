import { describe, expect, it } from 'vitest';
import { seedBoard } from '../data/seed';
import { addCard, addDays, deleteCard, dueState, matches, moveCard, parseLabels, reducer, updateCard } from './board';

const today = '2026-11-23';
const board = seedBoard(today);

describe('moveCard', () => {
  it('moves a card to another column at an index', () => {
    const next = moveCard(board, 'seed_1', 'doing', 1);
    expect(next.order.todo).not.toContain('seed_1');
    expect(next.order.doing[1]).toBe('seed_1');
  });
  it('reorders inside the same column', () => {
    const next = moveCard(board, 'seed_1', 'todo', 3);
    expect(next.order.todo).toEqual(['seed_2', 'seed_3', 'seed_1']);
  });
  it('clamps the index and never duplicates a card', () => {
    const next = moveCard(board, 'seed_1', 'done', 999);
    expect(next.order.done[next.order.done.length - 1]).toBe('seed_1');
    const count = Object.values(next.order).flat().filter((id) => id === 'seed_1').length;
    expect(count).toBe(1);
  });
  it('ignores unknown cards and does not mutate', () => {
    expect(moveCard(board, 'nope', 'done', 0)).toBe(board);
    expect(board.order.todo).toHaveLength(3);
  });
});

describe('add, update, delete', () => {
  const card = { id: 'x1', title: 'New', description: '', priority: 'low' as const, assignee: '', due: null, labels: [] };
  it('adds to the end of a column', () => {
    expect(addCard(board, 'review', card).order.review[board.order.review.length]).toBe('x1');
  });
  it('updates in place', () => {
    const next = updateCard(addCard(board, 'review', card), { ...card, title: 'Renamed' });
    expect(next.cards.x1!.title).toBe('Renamed');
  });
  it('deletes from cards and columns', () => {
    const next = deleteCard(board, 'seed_1');
    expect(next.cards.seed_1).toBeUndefined();
    expect(Object.values(next.order).flat()).not.toContain('seed_1');
  });
  it('the reducer routes actions', () => {
    expect(reducer(board, { type: 'delete', cardId: 'seed_2' }).cards.seed_2).toBeUndefined();
  });
});

describe('helpers', () => {
  it('classifies due dates', () => {
    expect(dueState(null, today)).toBe('none');
    expect(dueState('2026-11-22', today)).toBe('overdue');
    expect(dueState('2026-11-23', today)).toBe('soon');
    expect(dueState('2026-11-25', today)).toBe('soon');
    expect(dueState('2026-11-26', today)).toBe('ok');
  });
  it('adds days across month ends', () => {
    expect(addDays('2026-11-29', 3)).toBe('2026-12-02');
    expect(addDays('2026-11-23', -23)).toBe('2026-10-31');
  });
  it('searches title, assignee and labels', () => {
    const c = board.cards.seed_4!;
    expect(matches(c, 'PRICING')).toBe(true);
    expect(matches(c, 'lucas')).toBe(true);
    expect(matches(c, 'design')).toBe(true);
    expect(matches(c, 'zzz')).toBe(false);
    expect(matches(c, '  ')).toBe(true);
  });
  it('parses unique labels, max four', () => {
    expect(parseLabels('a, b, a, , c, d, e')).toEqual(['a', 'b', 'c', 'd']);
  });
});
