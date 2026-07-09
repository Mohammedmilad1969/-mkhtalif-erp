'use client';

import { useState, useRef, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanCard from './kanban-card';
import SortableCard from './sortable-card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface KanbanItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: { label: string; variant?: string };
  metadata?: { label: string; value: string }[];
}

interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onItemClick?: (id: string) => void;
  onItemMove?: (itemId: string, newColumnId: string) => void;
  onSelectStage?: (stageId: string) => void;
}

function ColumnDropzone({ columnId, hasItems }: { columnId: string; hasItems: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${columnId}` });
  if (hasItems) return null;
  return (
    <div
      ref={setNodeRef}
      className={`h-14 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
        isOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'
      }`}
    >
      <p className="text-xs text-muted-foreground">Drop here</p>
    </div>
  );
}

export default function KanbanBoard({ columns, selectedIds, onToggleSelect, onItemClick, onItemMove, onSelectStage }: KanbanBoardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  const findColumn = useCallback(
    (itemId: string): string | null => {
      for (const col of columns) {
        if (col.items.some((i) => i.id === itemId)) return col.id;
      }
      return null;
    },
    [columns]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    const colId = findColumn(id);
    if (!colId) return;
    const col = columns.find((c) => c.id === colId);
    const item = col?.items.find((i) => i.id === id);
    if (item) {
      setActiveItem(item);
      setActiveColumn(colId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const fromCol = findColumn(activeId);
    let toCol: string | null = null;

    const isColumnId = columns.some((c) => c.id === overId);
    if (isColumnId) {
      toCol = overId;
    } else if (typeof overId === 'string' && overId.startsWith('column-')) {
      toCol = overId.replace('column-', '');
    } else {
      const overContainer = over.data.current?.sortable?.containerId;
      if (overContainer) toCol = overContainer as string;
      const overItemCol = findColumn(overId);
      if (!toCol && overItemCol) toCol = overItemCol;
    }

    if (!toCol) toCol = fromCol;

    if (fromCol && toCol && fromCol !== toCol) {
      onItemMove?.(activeId, toCol);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 px-8 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {columns.map((column) => (
            <div key={column.id} className="kanban-column" style={{ minWidth: 280, width: 280 }}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  {onToggleSelect && column.items.length > 0 && (
                    <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onSelectStage?.(column.id); }}>
                      <Checkbox
                        checked={column.items.length > 0 && column.items.every((i) => selectedIds?.has(i.id))}
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-semibold">{column.title}</h3>
                </div>
                <Badge variant="secondary">{column.items.length}</Badge>
              </div>
              <SortableContext
                items={column.items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
                id={column.id}
              >
                <div className="space-y-2 min-h-[60px]">
                  {column.items.map((item) => (
                    <SortableCard
                      key={item.id}
                      item={item}
                      selected={selectedIds?.has(item.id)}
                      onToggleSelect={onToggleSelect}
                      onClick={onItemClick}
                    />
                  ))}
                  <ColumnDropzone columnId={column.id} hasItems={column.items.length > 0} />
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="kanban-card opacity-90" style={{ width: 280 }}>
            <KanbanCard item={activeItem} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
