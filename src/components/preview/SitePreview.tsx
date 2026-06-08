'use client';

import { Monitor, Tablet, Smartphone } from 'lucide-react';
import type { GeneratedSite } from '@/types';

type ViewMode = 'desktop' | 'tablet' | 'mobile';

interface SitePreviewProps {
  site: Partial<GeneratedSite>;
  viewMode?: ViewMode;
  viewSizes?: Record<ViewMode, { width: string; icon: React.ComponentType<{ className?: string }> }>;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
}

const DEFAULT_VIEW_SIZES: Record<ViewMode, { width: string; icon: React.ComponentType<{ className?: string }> }> = {
  desktop: { width: '100%', icon: Monitor },
  tablet: { width: '768px', icon: Tablet },
  mobile: { width: '375px', icon: Smartphone },
};

export function SitePreview({ site, viewMode = 'desktop', viewSizes, iframeRef }: SitePreviewProps) {
  const sizes = viewSizes ?? DEFAULT_VIEW_SIZES;
  const { width } = sizes[viewMode];

  // Inject scroll-sync listener into iframe HTML
  const scrollScript = `
<script>
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'scrollToSection') {
    var el = document.getElementById(e.data.sectionId) || document.querySelector('[data-section="' + e.data.sectionId + '"]');
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
});
</script>`;

  const htmlWithScript = site.html
    ? site.html.replace('</body>', `${scrollScript}\n</body>`)
    : '';

  return (
    <div className="flex flex-col h-full">
      {/* Mock browser chrome */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 mx-4 max-w-xs">
          <div className="bg-white/5 rounded-md px-3 py-1 text-white/30 text-xs text-center truncate">
            {site.config?.businessName ?? 'preview'}.webcre.app
          </div>
        </div>
        <div className="w-12" />
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-[#080b10] flex justify-center p-4">
        <div
          className="transition-all duration-300 bg-white rounded-lg overflow-hidden shadow-2xl flex-shrink-0"
          style={{ width, minHeight: '600px' }}
        >
          {site.html ? (
            <iframe
              ref={iframeRef}
              srcDoc={`<style>${site.css ?? ''}</style>${htmlWithScript}`}
              className="w-full h-full border-0"
              style={{ minHeight: '600px' }}
              title="Site preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 min-h-[600px]">
              <div className="text-center">
                <div className="text-5xl mb-3">🎨</div>
                <p className="text-sm">プレビューがここに表示されます</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
