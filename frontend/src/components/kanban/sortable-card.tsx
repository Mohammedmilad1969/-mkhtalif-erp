'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KanbanCard from './kanban-card';

interface KanbanItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: { label: string; variant?: string };
  metadata?: { label: string; value: string }[];
}

interface SortableCardProps {
  item: KanbanItem;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onClick?: (id: string) => void;
}

export default function SortableCard({ item, selected, onToggleSelect, onClick }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard
        item={item}
        selected={selected}
        onToggleSelect={onToggleSelect}
        onClick={isDragging ? undefined : onClick}
      />
    </div>
  );
}
