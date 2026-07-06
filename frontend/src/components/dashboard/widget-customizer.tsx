'use client';

import { useState, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2 } from 'lucide-react';
import { AVAILABLE_WIDGETS, getDefaultWidgets, type WidgetDefinition } from './widget-registry';

interface WidgetItem {
  widgetType: string;
  title: string;
  isVisible: boolean;
  sortOrder: number;
}

interface WidgetCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgets: WidgetItem[];
  onSave: (widgets: WidgetItem[]) => Promise<void>;
  saving?: boolean;
}

function SortableWidgetRow({
  widget,
  def,
  onToggle,
}: {
  widget: WidgetItem;
  def?: WidgetDefinition;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.widgetType,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = def?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-card ${isDragging ? 'shadow-lg' : ''}`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{widget.title}</p>
        <p className="text-xs text-muted-foreground capitalize">{widget.widgetType.replace(/_/g, ' ')}</p>
      </div>
      <Switch checked={widget.isVisible} onCheckedChange={onToggle} />
    </div>
  );
}

export function WidgetCustomizer({ open, onOpenChange, widgets, onSave, saving }: WidgetCustomizerProps) {
  const [items, setItems] = useState<WidgetItem[]>([]);

  useState(() => {
    if (open) {
      setItems(widgets.length > 0 ? [...widgets].sort((a, b) => a.sortOrder - b.sortOrder) : getDefaultWidgets());
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.widgetType === active.id);
      const newIndex = prev.findIndex((i) => i.widgetType === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const result = [...prev];
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result.map((item, i) => ({ ...item, sortOrder: i }));
    });
  }, []);

  const handleToggle = useCallback((widgetType: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.widgetType === widgetType ? { ...item, isVisible: !item.isVisible } : item,
      ),
    );
  }, []);

  const handleSave = () => {
    onSave(items);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Drag widgets to reorder, toggle visibility. Changes are saved per user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4 max-h-[60vh] overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.widgetType)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableWidgetRow
                  key={item.widgetType}
                  widget={item}
                  def={AVAILABLE_WIDGETS.find((w) => w.widgetType === item.widgetType)}
                  onToggle={() => handleToggle(item.widgetType)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
