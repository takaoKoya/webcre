export type SiteType = 'lp' | 'website' | 'full-package';

export type Industry =
  | 'restaurant' | 'beauty' | 'medical' | 'legal'
  | 'realestate' | 'education' | 'it' | 'fitness'
  | 'retail' | 'construction' | 'other';

export type Tone =
  | 'modern' | 'natural' | 'pop' | 'luxury' | 'corporate' | 'minimal';

export type Goal =
  | 'inquiry' | 'reservation' | 'branding' | 'recruitment' | 'ec-sales';

export type OptionalFeature =
  | 'reservation' | 'contact-form' | 'blog' | 'gallery' | 'ec' | 'sns';

export type FontFamily = 'gothic' | 'serif';

export type PageSlug =
  | 'index' | 'services' | 'about' | 'access' | 'contact'
  | 'blog' | 'gallery' | 'pricing' | 'faq' | 'recruit' | 'privacy'
  | 'tokushoho' | 'reservation';

export interface SnsLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  line?: string;
  youtube?: string;
  tiktok?: string;
}

export interface SeoMeta {
  title?: string;
  description?: string;
  ogpImage?: string;
  canonicalUrl?: string;
}

export interface ProjectConfig {
  siteType: SiteType;
  industry: Industry;
  tone: Tone;
  fontFamily: FontFamily;
  colorPalette: { primary: string; secondary: string; accent: string; };
  targetAudience: { ageRange: string; gender: string; region: string; };
  goals: Goal[];
  features: OptionalFeature[];
  businessName: string;
  businessDescription: string;
  referenceUrl?: string;
  selectedPages?: PageSlug[];   // Phase 2: which pages to generate
  // Phase 3 fields
  formspreeId?: string;         // Formspree form ID or email
  ga4Id?: string;               // Google Analytics 4 Measurement ID
  snsLinks?: SnsLinks;          // SNS account URLs
  seoMeta?: SeoMeta;            // SEO meta tags
  reservationUrl?: string;      // External reservation service URL (Calendly, etc.)
  contactEmail?: string;        // Contact email for forms
}

export interface GeneratedSection {
  id: string;
  type: 'hero' | 'services' | 'about' | 'gallery' | 'pricing' | 'testimonials' | 'cta' | 'access' | 'faq' | 'news';
  title: string;
  content: string;
  order: number;
}

// Phase 2: multi-page support
export interface SitePage {
  id: string;
  slug: PageSlug;
  title: string;
  sections: GeneratedSection[];
  html: string;
  isHome: boolean;
}

export interface GeneratedSite {
  id: string;
  config: ProjectConfig;
  sections: GeneratedSection[];   // top-page sections (backward compat)
  html: string;                   // top-page HTML (backward compat)
  css: string;
  status: 'draft' | 'preview' | 'published';
  deployUrl?: string;
  createdAt: string;
  // Phase 2 fields
  pages?: SitePage[];
  navigation?: { label: string; href: string; }[];
}

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface WizardState {
  currentStep: WizardStep;
  config: Partial<ProjectConfig>;
}
