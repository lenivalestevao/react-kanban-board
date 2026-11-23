import { COLUMNS, type Board } from '../types';

const KEY = 'flow-board-v1';

function isBoard(value: unknown): value is Board {
  if (typeof value !== 'object' || value === null) return false;
  const b = value as Board;
  if (typeof b.cards !== 'object' || b.cards === null || typeof b.order !== 'object' || b.order === null) return false;
  return COLUMNS.every((c) => Array.isArray(b.order[c.id]) && b.order[c.id].every((id) => id in b.cards));
}

export function loadBoard(): Board | null {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isBoard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveBoard(board: Board): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(board));
  } catch {
    /* storage full or unavailable: the board keeps working in memory */
  }
}
