'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, User, Star, XCircle } from 'lucide-react';

interface KanbanItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: { label: string; variant?: string };
  metadata?: { label: string; value: string }[];
}

interface KanbanCardProps {
  item: KanbanItem;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onClick?: (id: string) => void;
}

export default function KanbanCard({ item, selected, onToggleSelect, onClick }: KanbanCardProps) {
  return (
    <div
      className="kanban-card"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(item.id);
      }}
    >
      <div className="flex items-start gap-2 mb-2">
        {onToggleSelect && (
          <div
            className="pt-0.5"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(item.id);
            }}
          >
            <Checkbox checked={selected} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium leading-tight truncate">{item.title}</h4>
        </div>
        {item.badge && (
          <Badge variant={item.badge.variant || 'default'} className="ml-1 shrink-0">
            {item.badge.label}
          </Badge>
        )}
      </div>
      {item.subtitle && (
        <p className="text-xs text-muted-foreground mb-2 truncate">{item.subtitle}</p>
      )}
      {item.metadata && item.metadata.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {item.metadata.map((meta, i) => (
            <span key={i} className="text-xs text-muted-foreground flex items-center gap-1">
              {meta.label === 'assignee' && <User className="h-3 w-3" />}
              {meta.label === 'time' && <Clock className="h-3 w-3" />}
              {meta.label === 'score' && <Star className="h-3 w-3 text-yellow-500" />}
              {meta.label === 'lost' && <XCircle className="h-3 w-3 text-destructive" />}
              {meta.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
