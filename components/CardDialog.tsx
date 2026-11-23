import { useEffect, useRef, useState, type FormEvent } from 'react';
import { parseLabels } from '../lib/board';
import { PRIORITIES, type Card, type Priority } from '../types';
import { Icon } from './ui';

interface Props {
  /** The card to edit, or null when creating. */
  card: Card | null;
  open: boolean;
  onSave: (values: Omit<Card, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function CardDialog({ card, open, onSave, onDelete, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignee, setAssignee] = useState('');
  const [due, setDue] = useState('');
  const [labels, setLabels] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setTitle(card?.title ?? '');
      setDescription(card?.description ?? '');
      setPriority(card?.priority ?? 'medium');
      setAssignee(card?.assignee ?? '');
      setDue(card?.due ?? '');
      setLabels(card?.labels.join(', ') ?? '');
      setError('');
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, card]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Give the card a title.');
      return;
    }
    onSave({ title: title.trim(), description: description.trim(), priority, assignee: assignee.trim(), due: due || null, labels: parseLabels(labels) });
  };

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <form onSubmit={submit} noValidate>
        <header className="dialog-head">
          <h2>{card ? 'Edit card' : 'New card'}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </header>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!error} autoFocus />
          {error && <span className="error">{error}</span>}
        </label>
        <label>
          Description
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="row">
          <label>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label>
            Due date
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
        </div>
        <div className="row">
          <label>
            Assignee
            <input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Name" />
          </label>
          <label>
            Labels
            <input value={labels} onChange={(e) => setLabels(e.target.value)} placeholder="Design, Web" />
          </label>
        </div>
        <footer className="dialog-foot">
          {onDelete && (
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              <Icon name="trash" /> Delete
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </footer>
      </form>
    </dialog>
  );
}
