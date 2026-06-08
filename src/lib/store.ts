import { create } from 'zustand';
import type { ProjectConfig, WizardStep, GeneratedSite } from '@/types';

interface WizardStore {
  currentStep: WizardStep;
  config: Partial<ProjectConfig>;
  generatedSite: Partial<GeneratedSite> | null;
  // Undo/Redo history
  history: Partial<GeneratedSite>[];
  historyIndex: number;

  setStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateConfig: (updates: Partial<ProjectConfig>) => void;
  setGeneratedSite: (site: Partial<GeneratedSite> | null) => void;
  // History actions
  pushHistory: (site: Partial<GeneratedSite>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  reset: () => void;
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  currentStep: 1,
  config: {},
  generatedSite: null,
  history: [],
  historyIndex: -1,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(5, state.currentStep + 1) as WizardStep,
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1) as WizardStep,
    })),

  updateConfig: (updates) =>
    set((state) => ({
      config: { ...state.config, ...updates },
    })),

  setGeneratedSite: (site) => set({ generatedSite: site }),

  pushHistory: (site) =>
    set((state) => {
      // Truncate forward history on new edit
      const truncated = state.history.slice(0, state.historyIndex + 1);
      const next = [...truncated, site];
      // Keep history at most 50 entries
      const capped = next.length > 50 ? next.slice(next.length - 50) : next;
      return {
        generatedSite: site,
        history: capped,
        historyIndex: capped.length - 1,
      };
    }),

  undo: () =>
    set((state) => {
      const idx = state.historyIndex - 1;
      if (idx < 0) return {};
      return {
        historyIndex: idx,
        generatedSite: state.history[idx],
      };
    }),

  redo: () =>
    set((state) => {
      const idx = state.historyIndex + 1;
      if (idx >= state.history.length) return {};
      return {
        historyIndex: idx,
        generatedSite: state.history[idx],
      };
    }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  reset: () =>
    set({ currentStep: 1, config: {}, generatedSite: null, history: [], historyIndex: -1 }),
}));
