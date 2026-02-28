import { useState, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { GravityAd } from '@gravity-ai/react';
import type { AdResponse, GravityAdVariant, GravityAdSlotProps } from '@gravity-ai/react';

// ── Templates ────────────────────────────────────────────────────
interface PresetColors { bg: string; fg: string; muted: string; border: string; cta: string; ctaFg: string; shadow: string; }
interface Template {
  label: string;
  brandName: string; title: string; adText: string; cta: string; favicon: string;
  variant: GravityAdVariant; radius: number; borderWidth: number;
  showBrand: boolean; showTitle: boolean; showCta: boolean; showLabel: boolean; labelText: string;
  light: PresetColors; dark: PresetColors;
}

const E: PresetColors = { bg: '', fg: '', muted: '', border: '', cta: '', ctaFg: '', shadow: '' };
const gfav = (d: string) => `https://www.google.com/s2/favicons?domain=${d}&sz=128`;

const TEMPLATES: Template[] = [
  // ── Gravity — default clean card
  { label: 'Gravity',
    brandName: 'Gravity', title: 'AI-Native Advertising',
    adText: 'Monetize your AI platform with contextual ads that feel native to the conversation.',
    cta: 'Learn More', favicon: 'https://www.trygravity.ai/favicon.png',
    variant: 'card', radius: 10, borderWidth: 0.5,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },

  // ── Apple — premium minimal, no CTA, no label
  { label: 'Apple',
    brandName: 'Apple', title: 'iPhone Air',
    adText: 'The thinnest product we\'ve ever created. Impossibly thin. Incredibly capable.',
    cta: 'Buy', favicon: gfav('apple.com'),
    variant: 'card', radius: 16, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: false, showLabel: false, labelText: '',
    light: { bg: '#F5F5F7', fg: '#1D1D1F', muted: '#6E6E73', border: 'transparent', cta: '', ctaFg: '', shadow: 'none' },
    dark:  { bg: '#1D1D1F', fg: '#F5F5F7', muted: '#A1A1A6', border: '#2D2D2D', cta: '', ctaFg: '', shadow: 'none' } },

  // ── Vercel — sleek dark, white CTA with black text
  { label: 'Vercel',
    brandName: 'Vercel', title: 'Ship Faster',
    adText: 'Deploy instantly with zero config. Optimized for performance at every scale.',
    cta: 'Start Building', favicon: gfav('vercel.com'),
    variant: 'card', radius: 8, borderWidth: 0.5,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Ad',
    light: { bg: '#000000', fg: '#EDEDED', muted: '#888888', border: '#333333', cta: '#FFFFFF', ctaFg: '#000000', shadow: 'none' },
    dark:  { bg: '#000000', fg: '#EDEDED', muted: '#888888', border: '#333333', cta: '#FFFFFF', ctaFg: '#000000', shadow: 'none' } },

  // ── Spotify — dark with green accent
  { label: 'Spotify',
    brandName: 'Spotify', title: 'Music for Every Moment',
    adText: 'Discover new music, podcasts, and audiobooks. Personalized just for you.',
    cta: 'Get Premium', favicon: gfav('spotify.com'),
    variant: 'card', radius: 8, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: '#121212', fg: '#FFFFFF', muted: '#B3B3B3', border: '#282828', cta: '#1DB954', ctaFg: '', shadow: 'none' },
    dark:  { bg: '#121212', fg: '#FFFFFF', muted: '#B3B3B3', border: '#282828', cta: '#1DB954', ctaFg: '', shadow: 'none' } },

  // ── Coca-Cola — brutalist, red background, white CTA
  { label: 'Coca-Cola',
    brandName: 'Coca-Cola', title: 'Share a Coke',
    adText: 'Nothing beats the refreshing taste of an ice-cold Coca-Cola. Available everywhere.',
    cta: 'Find Yours', favicon: gfav('cocacola.com'),
    variant: 'card', radius: 0, borderWidth: 2,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: '#E61F29', fg: '#FFFFFF', muted: '#FFD4D4', border: '#FFFFFF', cta: '#FFFFFF', ctaFg: '#E61F29', shadow: 'none' },
    dark:  { bg: '#E61F29', fg: '#FFFFFF', muted: '#FFD4D4', border: '#FFFFFF', cta: '#FFFFFF', ctaFg: '#E61F29', shadow: 'none' } },

  // ── Shopify — dark green, lime accent
  { label: 'Shopify',
    brandName: 'Shopify', title: 'Start Selling Online',
    adText: 'Build your online store in minutes. Trusted by millions of businesses worldwide.',
    cta: 'Start Free Trial', favicon: gfav('shopify.com'),
    variant: 'card', radius: 10, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: '#004C3F', fg: '#FFFFFF', muted: '#B5E8D5', border: '#006B54', cta: '#95BF47', ctaFg: '#004C3F', shadow: 'none' },
    dark:  { bg: '#004C3F', fg: '#FFFFFF', muted: '#B5E8D5', border: '#006B54', cta: '#95BF47', ctaFg: '#004C3F', shadow: 'none' } },

  // ── Notion — warm editorial, no CTA
  { label: 'Notion',
    brandName: 'Notion', title: 'Your Connected Workspace',
    adText: 'Write, plan, and organize in one tool. Loved by teams at startups and Fortune 500s.',
    cta: 'Try Notion', favicon: gfav('notion.so'),
    variant: 'card', radius: 10, borderWidth: 0.5,
    showBrand: true, showTitle: true, showCta: false, showLabel: true, labelText: 'Sponsored',
    light: { bg: '#FFFFFF', fg: '#37352F', muted: '#787774', border: '#E3E2DE', cta: '', ctaFg: '', shadow: '' },
    dark:  { bg: '#2F3437', fg: '#E8E8E2', muted: '#9B9A97', border: '#4B4B4B', cta: '', ctaFg: '', shadow: '' } },

  // ── Cloudflare — professional, orange accent
  { label: 'Cloudflare',
    brandName: 'Cloudflare', title: 'The Web Performance Company',
    adText: 'Make your site faster, safer, and more reliable with our global network.',
    cta: 'Get Started Free', favicon: gfav('cloudflare.com'),
    variant: 'card', radius: 10, borderWidth: 0.5,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: '#FFFFFF', fg: '#1A1A1A', muted: '#666666', border: '#E5E5E5', cta: '#F6821F', ctaFg: '', shadow: '' },
    dark:  { bg: '#1A1A1A', fg: '#FFFFFF', muted: '#AAAAAA', border: '#333333', cta: '#F6821F', ctaFg: '', shadow: '' } },

  // ── YouTube — inline notification, red accent
  { label: 'YouTube',
    brandName: 'YouTube', title: 'Trending Now',
    adText: 'Watch the latest videos from your favorite creators. New content every day.',
    cta: 'Watch Now', favicon: gfav('youtube.com'),
    variant: 'inline', radius: 12, borderWidth: 0.5,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'Ad',
    light: { bg: '#FFFFFF', fg: '#0F0F0F', muted: '#606060', border: '#E5E5E5', cta: '#FF0000', ctaFg: '', shadow: '' },
    dark:  { bg: '#0F0F0F', fg: '#FFFFFF', muted: '#AAAAAA', border: '#333333', cta: '#FF0000', ctaFg: '', shadow: '' } },

  // ── Deel — purple accent
  { label: 'Deel',
    brandName: 'Deel', title: 'Global Payroll & HR',
    adText: 'Hire, pay, and manage your team worldwide. Compliance handled in 150+ countries.',
    cta: 'Book a Demo', favicon: gfav('deel.com'),
    variant: 'card', radius: 12, borderWidth: 0.5,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: '#FFFFFF', fg: '#1A1035', muted: '#6B5E7A', border: '#E5E0F0', cta: '#7C3AED', ctaFg: '', shadow: '' },
    dark:  { bg: '#1A1035', fg: '#FFFFFF', muted: '#A899BD', border: '#2E2050', cta: '#8B5CF6', ctaFg: '', shadow: '' } },

  // ── ElevenLabs — dark techy, indigo accent
  { label: 'ElevenLabs',
    brandName: 'ElevenLabs', title: 'AI Voice Generation',
    adText: 'Create natural-sounding speech in any voice and language. Trusted by millions of creators.',
    cta: 'Try Free', favicon: gfav('elevenlabs.io'),
    variant: 'card', radius: 10, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: false, showLabel: true, labelText: 'Sponsored',
    light: { bg: '#0A0A0A', fg: '#FFFFFF', muted: '#999999', border: '#222222', cta: '#6366F1', ctaFg: '', shadow: 'none' },
    dark:  { bg: '#0A0A0A', fg: '#FFFFFF', muted: '#999999', border: '#222222', cta: '#6366F1', ctaFg: '', shadow: 'none' } },

  // ── Samsung — premium dark, Galaxy style
  { label: 'Samsung',
    brandName: 'Samsung', title: 'Galaxy S25 Ultra',
    adText: 'The most powerful Galaxy yet. AI-powered features that transform how you create.',
    cta: 'Pre-Order', favicon: gfav('samsung.com'),
    variant: 'card', radius: 14, borderWidth: 0,
    showBrand: false, showTitle: true, showCta: true, showLabel: false, labelText: '',
    light: { bg: '#000000', fg: '#FFFFFF', muted: '#AAAAAA', border: '#1A1A1A', cta: '#1428A0', ctaFg: '', shadow: 'none' },
    dark:  { bg: '#000000', fg: '#FFFFFF', muted: '#AAAAAA', border: '#1A1A1A', cta: '#1428A0', ctaFg: '', shadow: 'none' } },

  // ── Netflix — dark with red, compact
  { label: 'Netflix',
    brandName: 'Netflix', title: 'New on Netflix',
    adText: 'Stream thousands of movies, series, and originals. Something new every week.',
    cta: 'Join Now', favicon: gfav('netflix.com'),
    variant: 'card', radius: 4, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Ad',
    light: { bg: '#141414', fg: '#FFFFFF', muted: '#B3B3B3', border: '#2A2A2A', cta: '#E50914', ctaFg: '', shadow: 'none' },
    dark:  { bg: '#141414', fg: '#FFFFFF', muted: '#B3B3B3', border: '#2A2A2A', cta: '#E50914', ctaFg: '', shadow: 'none' } },

  // ── Airbnb — warm coral accent
  { label: 'Airbnb',
    brandName: 'Airbnb', title: 'Find Your Next Stay',
    adText: 'Book unique homes, experiences, and places around the world.',
    cta: 'Explore', favicon: gfav('airbnb.com'),
    variant: 'card', radius: 12, borderWidth: 0.5,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: '#FFFFFF', fg: '#222222', muted: '#717171', border: '#DDDDDD', cta: '#FF5A5F', ctaFg: '', shadow: '' },
    dark:  { bg: '#222222', fg: '#FFFFFF', muted: '#B0B0B0', border: '#444444', cta: '#FF5A5F', ctaFg: '', shadow: '' } },

  // ── Nike — bold, minimal, just do it
  { label: 'Nike',
    brandName: 'Nike', title: 'Just Do It',
    adText: 'New arrivals in running. Lightweight shoes engineered for your fastest mile yet.',
    cta: 'Shop Now', favicon: gfav('nike.com'),
    variant: 'card', radius: 0, borderWidth: 0,
    showBrand: false, showTitle: true, showCta: true, showLabel: false, labelText: '',
    light: { bg: '#111111', fg: '#FFFFFF', muted: '#BBBBBB', border: 'transparent', cta: '#FFFFFF', ctaFg: '#111111', shadow: 'none' },
    dark:  { bg: '#111111', fg: '#FFFFFF', muted: '#BBBBBB', border: 'transparent', cta: '#FFFFFF', ctaFg: '#111111', shadow: 'none' } },

  // ── Amazon — clean with orange accent
  { label: 'Amazon',
    brandName: 'Amazon', title: 'Deal of the Day',
    adText: 'Limited-time savings on top-rated products. Free delivery with Prime.',
    cta: 'Shop Deals', favicon: gfav('amazon.com'),
    variant: 'inline', radius: 8, borderWidth: 0.5,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: '#FFFFFF', fg: '#0F1111', muted: '#565959', border: '#D5D9D9', cta: '#FF9900', ctaFg: '#0F1111', shadow: '' },
    dark:  { bg: '#131921', fg: '#FFFFFF', muted: '#B0B0B0', border: '#3B4149', cta: '#FF9900', ctaFg: '#0F1111', shadow: '' } },
];

// ── Dark mode ad defaults ────────────────────────────────────────
function darkAdSlots(variant: GravityAdVariant): GravityAdSlotProps {
  return {
    container: { style: {
      background: variant === 'minimal' ? 'transparent' : '#18181B',
      borderColor: variant === 'minimal' ? 'transparent' : '#3F3F46',
      boxShadow: variant === 'minimal' ? 'none' : '0 1px 4px rgba(0,0,0,0.3)',
    } },
    brand: { style: { color: '#FAFAFA' } },
    title: { style: { color: '#FAFAFA' } },
    text: { style: { color: '#A1A1AA' } },
    label: { style: { color: '#A1A1AA', borderColor: '#3F3F46' } },
  };
}

// ── Helpers ──────────────────────────────────────────────────────
function mergeSlotProps(base: GravityAdSlotProps | undefined, custom: GravityAdSlotProps | undefined): GravityAdSlotProps | undefined {
  if (!base && !custom) return undefined;
  if (!base) return custom;
  if (!custom) return base;
  const result: GravityAdSlotProps = { ...base };
  for (const key of Object.keys(custom) as (keyof GravityAdSlotProps)[]) {
    const b = base[key];
    const c = custom[key];
    if (c) {
      result[key] = { style: { ...(b?.style || {}), ...(c.style || {}) }, className: c.className || b?.className };
    }
  }
  return result;
}

function buildCustomSlotProps(p: { bg: string; fg: string; muted: string; borderColor: string; cta: string; ctaFg: string }): GravityAdSlotProps | undefined {
  if (!p.bg && !p.fg && !p.muted && !p.borderColor && !p.cta && !p.ctaFg) return undefined;
  return {
    ...(p.bg || p.borderColor ? { container: { style: { ...(p.bg ? { background: p.bg } : {}), ...(p.borderColor ? { borderColor: p.borderColor } : {}) } } } : {}),
    ...(p.fg ? { brand: { style: { color: p.fg } }, title: { style: { color: p.fg } } } : {}),
    ...(p.muted ? { text: { style: { color: p.muted } }, label: { style: { color: p.muted, borderColor: p.borderColor || undefined } } } : {}),
    ...(p.cta || p.ctaFg ? { cta: { style: { ...(p.cta ? { background: p.cta } : {}), ...(p.ctaFg ? { color: p.ctaFg } : {}) } } } : {}),
  };
}

function buildCode(
  mode: 'light' | 'dark', v: GravityAdVariant, showLabel: boolean, lt: string,
  showBrand: boolean, showTitle: boolean, showCta: boolean,
  p: { bg: string; fg: string; muted: string; cta: string; ctaFg: string; borderColor: string; borderWidth: number; shadow: string; radius: number },
): string {
  const hasCustom = p.bg || p.fg || p.muted || p.cta || p.ctaFg || p.borderColor;
  const useDarkBase = mode === 'dark' && !hasCustom;
  const l: string[] = [`<GravityAd`, `  ad={ad}`];
  if (v !== 'card') l.push(`  variant="${v}"`);
  if (!showLabel) l.push(`  showLabel={false}`);
  else if (lt && lt !== 'Sponsored') l.push(`  labelText="${lt}"`);
  const styleParts: string[] = [];
  if (p.radius !== 10) styleParts.push(`borderRadius: ${p.radius}`);
  if (p.shadow) styleParts.push(`boxShadow: '${p.shadow}'`);
  if (p.borderWidth !== 1) styleParts.push(`borderWidth: ${p.borderWidth}`);
  if (styleParts.length) l.push(`  style={{ ${styleParts.join(', ')} }}`);
  if (useDarkBase || hasCustom) {
    l.push(`  slotProps={{`);
    if (useDarkBase) {
      l.push(`    container: { style: { background: '#18181B', borderColor: '#3F3F46' } },`);
      l.push(`    brand: { style: { color: '#FAFAFA' } },`);
      l.push(`    title: { style: { color: '#FAFAFA' } },`);
      l.push(`    text: { style: { color: '#A1A1AA' } },`);
      l.push(`    label: { style: { color: '#A1A1AA', borderColor: '#3F3F46' } },`);
    } else {
      if (p.bg) l.push(`    container: { style: { background: '${p.bg}'${p.borderColor ? `, borderColor: '${p.borderColor}'` : ''} } },`);
      else if (p.borderColor) l.push(`    container: { style: { borderColor: '${p.borderColor}' } },`);
      if (p.fg) l.push(`    brand: { style: { color: '${p.fg}' } },`);
      if (p.fg) l.push(`    title: { style: { color: '${p.fg}' } },`);
      if (p.muted) l.push(`    text: { style: { color: '${p.muted}' } },`);
      if (p.cta || p.ctaFg) {
        const cp: string[] = [];
        if (p.cta) cp.push(`background: '${p.cta}'`);
        if (p.ctaFg) cp.push(`color: '${p.ctaFg}'`);
        l.push(`    cta: { style: { ${cp.join(', ')} } },`);
      }
    }
    l.push(`  }}`);
  }
  l.push(`/>`);

  const hidden: string[] = [];
  if (!showBrand) hidden.push('brandName', 'favicon');
  if (!showTitle) hidden.push('title');
  if (!showCta) hidden.push('cta');
  if (hidden.length) {
    l.push('');
    l.push(`// The component auto-hides missing ad fields.`);
    l.push(`// This layout omits: ${hidden.join(', ')}`);
  }

  return l.join('\n');
}

// ── Mode-aware swatch sets ───────────────────────────────────────
const SWATCHES = {
  bg:     { light: ['#FFFFFF','#F4F4F5','#F0FDF4','#0F172A','#1e1b4b'], dark: ['#18181B','#09090B','#0F172A','#052E16','#1e1b4b'] },
  fg:     { light: ['#18181B','#000000','#14532D','#0F172A','#71717A'], dark: ['#FAFAFA','#E2E8F0','#DCFCE7','#e0e7ff','#A1A1AA'] },
  muted:  { light: ['#71717A','#52525B','#18181B','#94A3B8','#444444'], dark: ['#A1A1AA','#D4D4D8','#FAFAFA','#94A3B8','#71717A'] },
  cta:    { light: ['#2563EB','#16A34A','#7c3aed','#DC2626','#18181B'], dark: ['#2563EB','#38BDF8','#16A34A','#7c3aed','#DC2626'] },
  border: { light: ['#E4E4E7','#D4D4D8','#BBF7D0','#000000','transparent'], dark: ['#3F3F46','#52525B','#14532D','#FFFFFF','transparent'] },
};

// ── Styles ───────────────────────────────────────────────────────
const S = {
  card: (): CSSProperties => ({
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 8, overflow: 'hidden', transition: 'background 200ms, border-color 200ms',
  }),
  cardInner: { padding: 16 } as CSSProperties,
  sectionLabel: {
    fontSize: 10, fontWeight: 600, color: 'var(--muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
  } as CSSProperties,
  pill: (active: boolean): CSSProperties => ({
    padding: '5px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6,
    border: '1px solid', cursor: 'pointer', transition: 'all 100ms', fontFamily: 'inherit',
    borderColor: active ? 'var(--accent)' : 'var(--border)',
    background: active ? 'rgba(37,99,235,0.08)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--muted)',
  }),
  seg: (active: boolean): CSSProperties => ({
    padding: '5px 12px', fontSize: 12, fontWeight: 500, borderRadius: 5,
    border: 'none', cursor: 'pointer', transition: 'all 100ms', fontFamily: 'inherit',
    background: active ? 'rgba(37,99,235,0.1)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--muted)',
  }),
  segGroup: {
    display: 'inline-flex', gap: 1, background: 'var(--subtle)',
    borderRadius: 6, padding: 2, transition: 'background 200ms',
  } as CSSProperties,
  fieldLabel: { fontSize: 11, color: 'var(--muted)', marginBottom: 6 } as CSSProperties,
  input: {
    width: '100%', padding: '6px 10px', borderRadius: 6,
    border: '1px solid var(--border)', background: 'var(--subtle)',
    color: 'var(--fg)', fontSize: 12, outline: 'none', fontFamily: 'inherit',
    transition: 'background 200ms, border-color 200ms, color 200ms',
  } as CSSProperties,
  swatch: (c: string, active: boolean): CSSProperties => ({
    width: 20, height: 20, borderRadius: 4, background: c === 'transparent' ? undefined : c, cursor: 'pointer',
    border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    transition: 'border-color 100ms', flexShrink: 0,
    ...(c === 'transparent' ? {
      backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
      backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
    } : {}),
  }),
  grid: (cols: number): CSSProperties => ({
    display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16,
  }),
  sep: { height: 1, background: 'var(--border)', margin: '4px 0', transition: 'background 200ms' } as CSSProperties,
  code: {
    fontSize: 12, lineHeight: 1.7, color: 'var(--muted)',
    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
    background: 'var(--subtle)', borderRadius: 8,
    padding: 16, overflow: 'auto', whiteSpace: 'pre', margin: 0,
    transition: 'background 200ms, color 200ms',
  } as CSSProperties,
};

// ── UI primitives ────────────────────────────────────────────────
function Panel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div style={S.card()}>
      <div style={S.cardInner}>
        {title && <div style={S.sectionLabel}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

function Seg({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={S.segGroup}>
      {options.map(o => <button key={o} onClick={() => onChange(o)} style={S.seg(value === o)}>{o}</button>)}
    </div>
  );
}

function ColorPicker({ label, value, onChange, swatches }: { label: string; value: string; onChange: (c: string) => void; swatches: string[] }) {
  return (
    <div>
      <div style={S.fieldLabel}>{label}</div>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => onChange('')} style={{ ...S.pill(value === ''), padding: '2px 8px', fontSize: 10 }}>Auto</button>
        {swatches.map(c => <div key={c} onClick={() => onChange(c)} style={S.swatch(c, value === c)} />)}
        <label style={{ position: 'relative', width: 20, height: 20, cursor: 'pointer', flexShrink: 0 }}>
          <input type="color" value={value || '#ffffff'} onChange={e => onChange(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
          <div style={{ ...S.swatch('var(--subtle)', false), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
        </label>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────
function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  // Ad content
  const [adNull, setAdNull] = useState(false);
  const [brandName, setBrandName] = useState(TEMPLATES[0].brandName);
  const [adTitle, setAdTitle] = useState(TEMPLATES[0].title);
  const [adBody, setAdBody] = useState(TEMPLATES[0].adText);
  const [ctaText, setCtaText] = useState(TEMPLATES[0].cta);
  const [faviconUrl, setFaviconUrl] = useState(TEMPLATES[0].favicon);
  const fileRef = useRef<HTMLInputElement>(null);

  // Template & layout
  const [template, setTemplate] = useState(0);
  const [variant, setVariant] = useState<GravityAdVariant>('card');
  const [radius, setRadius] = useState(10);
  const [borderWidth, setBorderWidth] = useState(0.5);

  // Content visibility
  const [showBrand, setShowBrand] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [showCta, setShowCta] = useState(true);
  const [showLabel, setShowLabel] = useState(true);
  const [labelText, setLabelText] = useState('Sponsored');

  // Colors
  const [bg, setBg] = useState('');
  const [fg, setFg] = useState('');
  const [muted, setMuted] = useState('');
  const [borderColor, setBorderColor] = useState('');
  const [cta, setCta] = useState('');
  const [ctaFg, setCtaFg] = useState('');
  const [shadow, setShadow] = useState('');

  useEffect(() => { document.body.setAttribute('data-mode', mode); }, [mode]);

  const applyTemplate = (i: number, m: 'light' | 'dark' = mode) => {
    const t = TEMPLATES[i];
    const c = m === 'dark' ? t.dark : t.light;
    setTemplate(i); setAdNull(false);
    setBrandName(t.brandName); setAdTitle(t.title);
    setAdBody(t.adText); setCtaText(t.cta); setFaviconUrl(t.favicon);
    setVariant(t.variant); setRadius(t.radius); setBorderWidth(t.borderWidth);
    setShowBrand(t.showBrand); setShowTitle(t.showTitle);
    setShowCta(t.showCta); setShowLabel(t.showLabel); setLabelText(t.labelText);
    setBg(c.bg); setFg(c.fg); setMuted(c.muted); setBorderColor(c.border);
    setCta(c.cta); setCtaFg(c.ctaFg); setShadow(c.shadow);
  };

  const switchMode = (m: 'light' | 'dark') => {
    const preserveNullAd = adNull;
    setMode(m);
    applyTemplate(template, m);
    if (preserveNullAd) setAdNull(true);
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFaviconUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Build ad
  const ad: AdResponse | null = adNull ? null : {
    brandName, title: adTitle, adText: adBody, cta: ctaText,
    url: 'https://example.com', favicon: faviconUrl,
    clickUrl: 'https://example.com', impUrl: '',
  };

  const maskedAd = ad ? {
    ...ad,
    brandName: showBrand ? ad.brandName : undefined,
    favicon: showBrand ? ad.favicon : undefined,
    title: showTitle ? ad.title : undefined,
    cta: showCta ? ad.cta : undefined,
  } : null;

  const customSlots = buildCustomSlotProps({ bg, fg, muted, borderColor, cta, ctaFg });
  const hasCustomColors = !!(bg || fg || muted || borderColor || cta || ctaFg);
  const baseSlots = mode === 'dark' && !hasCustomColors ? darkAdSlots(variant) : undefined;
  const slotProps = mergeSlotProps(baseSlots, customSlots);

  const containerStyle: CSSProperties = {
    ...(radius !== 10 ? { borderRadius: radius } : {}),
    ...(shadow ? { boxShadow: shadow } : {}),
    borderWidth,
  };

  const code = buildCode(mode, variant, showLabel, labelText, showBrand, showTitle, showCta, { bg, fg, muted, cta, ctaFg, borderColor, borderWidth, shadow, radius });

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, padding: '12px 0',
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, transition: 'background 200ms, border-color 200ms',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="https://www.trygravity.ai/favicon.png" alt="" style={{ width: 22, height: 22, borderRadius: 5 }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Gravity</span>
          <span style={{ color: 'var(--border)', margin: '0 2px' }}>/</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>React SDK Playground</span>
        </div>
        <Seg options={['Light', 'Dark']} value={mode === 'light' ? 'Light' : 'Dark'} onChange={v => switchMode(v === 'Light' ? 'light' : 'dark')} />
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Preview — fixed height */}
        <div style={{
          background: 'var(--subtle)', borderRadius: 8,
          padding: variant === 'minimal' ? '0 32px' : 24,
          height: 220, overflow: 'hidden',
          display: 'flex', alignItems: 'center',
          transition: 'background 200ms',
        }}>
          <div style={{ width: '100%' }}>
            <GravityAd
              ad={maskedAd} variant={variant} showLabel={showLabel} labelText={labelText || undefined}
              slotProps={slotProps} style={containerStyle} disableImpressionTracking
              fallback={<div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', border: '1px dashed var(--border)', borderRadius: 6, fontSize: 12 }}>
                ad is null — fallback renders here
              </div>}
            />
          </div>
        </div>

        {/* Templates */}
        <Panel title="Templates">
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {TEMPLATES.map((t, i) => (
              <button key={t.label} onClick={() => applyTemplate(i)} style={S.pill(!adNull && template === i)}>
                {t.label}
              </button>
            ))}
            <button onClick={() => setAdNull(true)} style={S.pill(adNull)}>None</button>
          </div>
        </Panel>

        {/* Ad Content */}
        {!adNull && (
          <Panel title="Ad Content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={S.grid(2)}>
                <div>
                  <div style={S.fieldLabel}>Brand name</div>
                  <input value={brandName} onChange={e => setBrandName(e.target.value)} style={S.input} placeholder="Brand" />
                </div>
                <div>
                  <div style={S.fieldLabel}>Headline</div>
                  <input value={adTitle} onChange={e => setAdTitle(e.target.value)} style={S.input} placeholder="Headline" />
                </div>
              </div>
              <div style={S.grid(2)}>
                <div>
                  <div style={S.fieldLabel}>Body text</div>
                  <input value={adBody} onChange={e => setAdBody(e.target.value)} style={S.input} placeholder="Ad body text" />
                </div>
                <div>
                  <div style={S.fieldLabel}>CTA text</div>
                  <input value={ctaText} onChange={e => setCtaText(e.target.value)} style={S.input} placeholder="Learn More" />
                </div>
              </div>
              <div>
                <div style={S.fieldLabel}>Favicon</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {faviconUrl && (
                    <img src={faviconUrl} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'contain', flexShrink: 0 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                  <input value={faviconUrl} onChange={e => setFaviconUrl(e.target.value)}
                    style={{ ...S.input, flex: 1 }} placeholder="https://example.com/favicon.png" />
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFaviconUpload} style={{ display: 'none' }} />
                  <button onClick={() => fileRef.current?.click()} style={{ ...S.pill(false), flexShrink: 0 }}>Upload</button>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* Customize */}
        <Panel title="Customize">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={S.fieldLabel}>Content</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => setShowBrand(!showBrand)} style={S.pill(showBrand)}>Brand</button>
                <button onClick={() => setShowTitle(!showTitle)} style={S.pill(showTitle)}>Headline</button>
                <button onClick={() => setShowCta(!showCta)} style={S.pill(showCta)}>CTA</button>
                <button onClick={() => setShowLabel(!showLabel)} style={S.pill(showLabel)}>Label</button>
                {showLabel && (
                  <input value={labelText} onChange={e => setLabelText(e.target.value)}
                    style={{ ...S.input, width: 100, marginLeft: 4 }} placeholder="Sponsored" />
                )}
              </div>
            </div>
            <div style={S.sep} />
            <div style={S.grid(3)}>
              <div><div style={S.fieldLabel}>Variant</div><Seg options={['card','inline','minimal']} value={variant} onChange={v => setVariant(v as GravityAdVariant)} /></div>
              <div><div style={S.fieldLabel}>Radius — {radius}px</div><input type="range" min={0} max={24} value={radius} onChange={e => setRadius(Number(e.target.value))} /></div>
              <div><div style={S.fieldLabel}>Border width — {borderWidth}px</div><input type="range" min={0} max={4} step={0.5} value={borderWidth} onChange={e => setBorderWidth(Number(e.target.value))} /></div>
            </div>
            <div style={S.sep} />
            <div style={S.grid(2)}>
              <ColorPicker label="Heading" value={fg} onChange={setFg} swatches={SWATCHES.fg[mode]} />
              <ColorPicker label="Body" value={muted} onChange={setMuted} swatches={SWATCHES.muted[mode]} />
            </div>
            <div style={S.grid(2)}>
              <ColorPicker label="Background" value={bg} onChange={setBg} swatches={SWATCHES.bg[mode]} />
              <ColorPicker label="CTA" value={cta} onChange={setCta} swatches={SWATCHES.cta[mode]} />
            </div>
            <div style={S.grid(2)}>
              <ColorPicker label="Border" value={borderColor} onChange={setBorderColor} swatches={SWATCHES.border[mode]} />
              <div />
            </div>
          </div>
        </Panel>

        {/* Code */}
        <Panel title="Code">
          <pre style={S.code}>
            <span style={{ opacity: 0.4 }}>{"import { GravityAd } from '@gravity-ai/react';\n\n"}</span>
            {code}
          </pre>
        </Panel>
      </div>
    </div>
  );
}

export default App;
