'use client';

import { useState } from 'react';
import type { GeneratedSection } from '@/types';
import { cn } from '@/lib/utils';
import { GripVertical, Edit2, Eye, EyeOff } from 'lucide-react';

interface SectionEditorProps {
  sections: GeneratedSection[];
  onUpdate: (sections: GeneratedSection[]) => void;
}

export function SectionEditor({ sections, onUpdate }: SectionEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const toggleVisibility = (id: string) => {
    const next = new Set(hiddenIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setHiddenIds(next);
  };

  const updateSection = (id: string, updates: Partial<GeneratedSection>) => {
    onUpdate(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  return (
    <div className="space-y-2">
      <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider px-1 mb-3">
        セクション ({sections.length})
      </h3>
      {sections
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <div
            key={section.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-all',
              hiddenIds.has(section.id)
                ? 'border-white/5 bg-white/2 opacity-50'
                : 'border-white/10 bg-white/5'
            )}
          >
            <GripVertical className="w-4 h-4 text-white/20 flex-shrink-0 cursor-grab" />
            <div className="flex-1 min-w-0">
              {editingId === section.id ? (
                <input
                  autoFocus
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                  className="w-full bg-transparent text-white text-sm border-b border-purple-500 outline-none pb-0.5"
                />
              ) : (
                <span className="text-white text-sm truncate block">{section.title}</span>
              )}
            </div>
            <button
              onClick={() => setEditingId(editingId === section.id ? null : section.id)}
              className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleVisibility(section.id)}
              className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
            >
              {hiddenIds.has(section.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        ))}
    </div>
  );
}
