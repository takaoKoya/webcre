'use client';

import { cn } from '@/lib/utils';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#1e293b', '#334155', '#475569', '#f8fafc',
];

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-white/60 text-sm">{label}</label>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border-2 border-white/20 shadow-md flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          id={`color-${label}`}
        />
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={cn(
                'w-6 h-6 rounded-full transition-all duration-150',
                value === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d1117] scale-110' : 'hover:scale-105'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
