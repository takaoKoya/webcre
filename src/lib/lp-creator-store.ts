import { create } from 'zustand';
import type { ToneAnalysis } from '@/app/api/analyze-site/route';
import type { LPInput } from '@/app/api/generate-lp-from-site/route';

export type LPCreatorStep = 1 | 2 | 3 | 4 | 5;

export interface LPCreatorState {
  step: LPCreatorStep;
  // Step 1 input
  inputMode: 'url' | 'image';
  url: string;
  imageBase64: string;
  imageName: string;
  // Step 2 result
  toneAnalysis: ToneAnalysis | null;
  analyzeLoading: boolean;
  analyzeError: string | null;
  // Step 3 LP details
  businessName: string;
  lpPurpose: string;
  targetAudience: string;
  sellingPoints: [string, string, string];
  catchphraseHint: string;
  // Step 4 CV settings
  cvGoal: LPInput['cvGoal'];
  cvButtonText: string;
  cvUrl: string;
  contactEmail: string;
  // Step 5 result
  generatedHtml: string;
  generateLoading: boolean;
  generateError: string | null;
}

interface LPCreatorActions {
  setStep: (step: LPCreatorStep) => void;
  setInputMode: (mode: 'url' | 'image') => void;
  setUrl: (url: string) => void;
  setImage: (base64: string, name: string) => void;
  setToneAnalysis: (tone: ToneAnalysis) => void;
  setAnalyzeLoading: (v: boolean) => void;
  setAnalyzeError: (e: string | null) => void;
  setBusinessName: (v: string) => void;
  setLpPurpose: (v: string) => void;
  setTargetAudience: (v: string) => void;
  setSellingPoint: (idx: 0 | 1 | 2, v: string) => void;
  setCatchphraseHint: (v: string) => void;
  setCvGoal: (v: LPInput['cvGoal']) => void;
  setCvButtonText: (v: string) => void;
  setCvUrl: (v: string) => void;
  setContactEmail: (v: string) => void;
  setGeneratedHtml: (html: string) => void;
  setGenerateLoading: (v: boolean) => void;
  setGenerateError: (e: string | null) => void;
  reset: () => void;
}

const initial: LPCreatorState = {
  step: 1,
  inputMode: 'url',
  url: '',
  imageBase64: '',
  imageName: '',
  toneAnalysis: null,
  analyzeLoading: false,
  analyzeError: null,
  businessName: '',
  lpPurpose: '',
  targetAudience: '',
  sellingPoints: ['', '', ''],
  catchphraseHint: '',
  cvGoal: 'inquiry',
  cvButtonText: 'お問い合わせはこちら',
  cvUrl: '',
  contactEmail: '',
  generatedHtml: '',
  generateLoading: false,
  generateError: null,
};

export const useLPCreatorStore = create<LPCreatorState & LPCreatorActions>(set => ({
  ...initial,
  setStep: step => set({ step }),
  setInputMode: inputMode => set({ inputMode }),
  setUrl: url => set({ url }),
  setImage: (imageBase64, imageName) => set({ imageBase64, imageName }),
  setToneAnalysis: toneAnalysis => set({ toneAnalysis }),
  setAnalyzeLoading: analyzeLoading => set({ analyzeLoading }),
  setAnalyzeError: analyzeError => set({ analyzeError }),
  setBusinessName: businessName => set({ businessName }),
  setLpPurpose: lpPurpose => set({ lpPurpose }),
  setTargetAudience: targetAudience => set({ targetAudience }),
  setSellingPoint: (idx, v) => set(s => {
    const pts = [...s.sellingPoints] as [string, string, string];
    pts[idx] = v;
    return { sellingPoints: pts };
  }),
  setCatchphraseHint: catchphraseHint => set({ catchphraseHint }),
  setCvGoal: cvGoal => set({ cvGoal }),
  setCvButtonText: cvButtonText => set({ cvButtonText }),
  setCvUrl: cvUrl => set({ cvUrl }),
  setContactEmail: contactEmail => set({ contactEmail }),
  setGeneratedHtml: generatedHtml => set({ generatedHtml }),
  setGenerateLoading: generateLoading => set({ generateLoading }),
  setGenerateError: generateError => set({ generateError }),
  reset: () => set(initial),
}));
