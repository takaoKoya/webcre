'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { GeneratedSection } from '@/types';
import { cn } from '@/lib/utils';

interface SortableSectionListProps {
  sections: GeneratedSection[];
  selectedId: string | null;
  onUpdate: (sections: GeneratedSection[]) => void;
  onSelect: (section: GeneratedSection) => void;
  onDeleteRequest?: (id: string) => void;
}

const SECTION_TYPE_ICONS: Record<GeneratedSection['type'], string> = {
  hero: '🦸',
  services: '🛠️',
  about: '👥',
  gallery: '🖼️',
  pricing: '💰',
  testimonials: '💬',
  cta: '📣',
  access: '📍',
  faq: '❓',
  news: '📰',
};

interface SortableItemProps {
  section: GeneratedSection;
  isSelected: boolean;
  isHidden: boolean;
  onSelect: (section: GeneratedSection) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteRequest?: (id: string) => void;
}

function SortableItem({
  section,
  isSelected,
  isHidden,
  onSelect,
  onToggleVisibility,
  onDeleteRequest,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer select-none group',
        isSelected
          ? 'border-purple-500/50 bg-purple-500/10'
          : isHidden
          ? 'border-white/5 bg-white/2 opacity-50'
          : 'border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20'
      )}
      onClick={() => onSelect(section)}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Icon */}
      <span className="text-sm flex-shrink-0" aria-hidden>
        {SECTION_TYPE_ICONS[section.type] ?? '📄'}
      </span>

      {/* Title */}
      <span
        className={cn(
          'flex-1 text-sm truncate',
          isSelected ? 'text-white' : 'text-white/70'
        )}
      >
        {section.title}
      </span>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {onDeleteRequest && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(section.id);
            }}
            className="text-white/20 hover:text-red-400 transition-colors p-0.5 rounded"
            title="削除"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(section.id);
          }}
          className="text-white/30 hover:text-white/70 transition-colors"
          title={isHidden ? '表示する' : '非表示にする'}
        >
          {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export function SortableSectionList({
  sections,
  selectedId,
  onUpdate,
  onSelect,
  onDeleteRequest,
}: SortableSectionListProps) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const ids = sorted.map((s) => s.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((s) => s.id === active.id);
    const newIndex = sorted.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order: i + 1,
    }));
    onUpdate(reordered);
  };

  const toggleVisibility = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider px-1 mb-3">
        セクション ({sections.length})
      </h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {sorted.map((section) => (
              <SortableItem
                key={section.id}
                section={section}
                isSelected={section.id === selectedId}
                isHidden={hiddenIds.has(section.id)}
                onSelect={onSelect}
                onToggleVisibility={toggleVisibility}
                onDeleteRequest={onDeleteRequest}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
