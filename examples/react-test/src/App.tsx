import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { GravityAd } from '@gravity-ai/react';
import type { AdResponse, GravityAdVariant, GravityAdSlotProps } from '@gravity-ai/react';

// ── Mock ad ──────────────────────────────────────────────────────
const MOCK_AD: AdResponse = {
  brandName: 'Gravity',
  title: 'AI-Native Advertising',
  adText: 'Monetize your AI platform with contextual ads that feel native to the conversation.',
  cta: 'Learn More',
  url: 'https://trygravity.ai',
  favicon: 'https://www.trygravity.ai/favicon.png',
  clickUrl: 'https://trygravity.ai',
  impUrl: '',
};

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

// ── Presets ──────────────────────────────────────────────────────
interface PresetColors { bg: string; fg: string; muted: string; border: string; cta: string; shadow: string; }
interface Preset {
  label: string;
  variant: GravityAdVariant;
  radius: number;
  borderWidth: number;
  light: PresetColors;
  dark: PresetColors;
}

const EMPTY: PresetColors = { bg: '', fg: '', muted: '', border: '', cta: '', shadow: '' };

const PRESETS: Preset[] = [
  { label: 'Default', variant: 'card', radius: 10, borderWidth: 1, light: EMPTY, dark: EMPTY },
  { label: 'Midnight', variant: 'card', radius: 10, borderWidth: 1,
    light: { bg: '#0F172A', fg: '#E2E8F0', muted: '#94A3B8', border: '#1E293B', cta: '#38BDF8', shadow: '0 2px 12px rgba(0,0,0,0.4)' },
    dark:  { bg: '#0F172A', fg: '#E2E8F0', muted: '#94A3B8', border: '#1E293B', cta: '#38BDF8', shadow: '0 2px 12px rgba(0,0,0,0.4)' },
  },
  { label: 'Emerald', variant: 'card', radius: 10, borderWidth: 1,
    light: { bg: '#F0FDF4', fg: '#14532D', muted: '#4D7C5F', border: '#BBF7D0', cta: '#16A34A', shadow: '' },
    dark:  { bg: '#052E16', fg: '#DCFCE7', muted: '#86EFAC', border: '#14532D', cta: '#16A34A', shadow: '0 1px 4px rgba(0,0,0,0.3)' },
  },
  { label: 'Brutalist', variant: 'card', radius: 0, borderWidth: 2,
    light: { bg: '#FFFFFF', fg: '#000000', muted: '#444444', border: '#000000', cta: '#DC2626', shadow: 'none' },
    dark:  { bg: '#000000', fg: '#FFFFFF', muted: '#AAAAAA', border: '#FFFFFF', cta: '#DC2626', shadow: 'none' },
  },
  { label: 'Inline', variant: 'inline', radius: 10, borderWidth: 1, light: EMPTY, dark: EMPTY },
  { label: 'Minimal', variant: 'minimal', radius: 0, borderWidth: 0, light: EMPTY, dark: EMPTY },
];

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

function buildCustomSlotProps(p: { bg: string; fg: string; muted: string; borderColor: string; cta: string }): GravityAdSlotProps | undefined {
  if (!p.bg && !p.fg && !p.muted && !p.borderColor && !p.cta) return undefined;
  return {
    ...(p.bg || p.borderColor ? { container: { style: { ...(p.bg ? { background: p.bg } : {}), ...(p.borderColor ? { borderColor: p.borderColor } : {}) } } } : {}),
    ...(p.fg ? { brand: { style: { color: p.fg } }, title: { style: { color: p.fg } } } : {}),
    ...(p.muted ? { text: { style: { color: p.muted } }, label: { style: { color: p.muted, borderColor: p.borderColor || undefined } } } : {}),
    ...(p.cta ? { cta: { style: { background: p.cta } } } : {}),
  };
}

function buildCode(mode: 'light' | 'dark', v: GravityAdVariant, lt: string, p: { bg: string; fg: string; muted: string; cta: string; borderColor: string; borderWidth: number; shadow: string; radius: number }): string {
  const hasCustom = p.bg || p.fg || p.muted || p.cta || p.borderColor;
  const useDarkBase = mode === 'dark' && !hasCustom;
  const l: string[] = [`<GravityAd`, `  ad={ad}`];
  if (v !== 'card') l.push(`  variant="${v}"`);
  if (lt === '') l.push(`  showLabel={false}`);
  else if (lt !== 'Sponsored') l.push(`  labelText="${lt}"`);
  const styleParts: string[] = [];
  if (p.radius !== 10) styleParts.push(`borderRadius: ${p.radius}`);
  if (p.shadow) styleParts.push(`boxShadow: '${p.shadow}'`);
  if (p.borderWidth !== 1) styleParts.push(`borderWidth: ${p.borderWidth}`);
  if (styleParts.length) l.push(`  style={{ ${styleParts.join(', ')} }}`);
  if (useDarkBase || hasCustom) {
    l.push(`  slotProps={{`);
    if (useDarkBase) {
      if (v === 'minimal') {
        l.push(`    container: { style: { background: 'transparent', borderColor: 'transparent', boxShadow: 'none' } },`);
      } else {
        l.push(`    container: { style: { background: '#18181B', borderColor: '#3F3F46', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' } },`);
      }
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
      if (p.muted) l.push(`    label: { style: { color: '${p.muted}'${p.borderColor ? `, borderColor: '${p.borderColor}'` : ''} } },`);
      if (p.cta) l.push(`    cta: { style: { background: '${p.cta}' } },`);
    }
    l.push(`  }}`);
  }
  l.push(`/>`);
  return l.join('\n');
}

// ── Mode-aware swatch sets ───────────────────────────────────────
const SWATCHES = {
  bg:     { light: ['#FFFFFF','#F4F4F5','#F0FDF4','#0F172A','#1e1b4b'], dark: ['#18181B','#09090B','#0F172A','#052E16','#1e1b4b'] },
  fg:     { light: ['#18181B','#000000','#14532D','#0F172A','#71717A'], dark: ['#FAFAFA','#E2E8F0','#DCFCE7','#e0e7ff','#A1A1AA'] },
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
  const [ad, setAd] = useState<AdResponse | null>(MOCK_AD);
  const [preset, setPreset] = useState(0);
  const [labelText, setLabelText] = useState('Sponsored');
  const [variant, setVariant] = useState<GravityAdVariant>('card');
  const [bg, setBg] = useState('');
  const [fg, setFg] = useState('');
  const [muted, setMuted] = useState('');
  const [borderColor, setBorderColor] = useState('');
  const [borderWidth, setBorderWidth] = useState(1);
  const [cta, setCta] = useState('');
  const [shadow, setShadow] = useState('');
  const [radius, setRadius] = useState(10);

  useEffect(() => { document.body.setAttribute('data-mode', mode); }, [mode]);

  const applyPreset = (i: number, m: 'light' | 'dark' = mode) => {
    const p = PRESETS[i];
    const c = m === 'dark' ? p.dark : p.light;
    setPreset(i); setVariant(p.variant); setRadius(p.radius); setBorderWidth(p.borderWidth);
    setBg(c.bg); setFg(c.fg); setMuted(c.muted); setBorderColor(c.border);
    setCta(c.cta); setShadow(c.shadow);
  };

  const switchMode = (m: 'light' | 'dark') => {
    setMode(m);
    applyPreset(preset, m);
  };

  const showLabel = labelText !== '';
  const customSlots = buildCustomSlotProps({ bg, fg, muted, borderColor, cta });
  const hasCustomColors = !!(bg || fg || muted || borderColor || cta);
  const baseSlots = mode === 'dark' && !hasCustomColors ? darkAdSlots(variant) : undefined;
  const slotProps = mergeSlotProps(baseSlots, customSlots);

  const containerStyle: CSSProperties = {
    ...(radius !== 10 ? { borderRadius: radius } : {}),
    ...(shadow ? { boxShadow: shadow } : {}),
    ...(borderWidth !== 1 ? { borderWidth } : {}),
  };

  const code = buildCode(mode, variant, labelText, { bg, fg, muted, cta, borderColor, borderWidth, shadow, radius });

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
        {/* Preview */}
        <div style={{
          background: 'var(--subtle)', borderRadius: 8,
          padding: variant === 'minimal' ? '24px 32px' : 24,
          transition: 'background 200ms',
        }}>
          <GravityAd
            ad={ad} variant={variant} showLabel={showLabel} labelText={labelText || undefined}
            slotProps={slotProps} style={containerStyle} disableImpressionTracking
            fallback={<div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', border: '1px dashed var(--border)', borderRadius: 6, fontSize: 12 }}>
              ad is null — fallback renders here
            </div>}
          />
        </div>

        {/* Presets */}
        <Panel title="Presets">
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {PRESETS.map((p, i) => <button key={p.label} onClick={() => applyPreset(i)} style={S.pill(preset === i)}>{p.label}</button>)}
          </div>
        </Panel>

        {/* Customize */}
        <Panel title="Customize">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={S.grid(3)}>
              <div><div style={S.fieldLabel}>Variant</div><Seg options={['card','inline','minimal']} value={variant} onChange={v => setVariant(v as GravityAdVariant)} /></div>
              <div><div style={S.fieldLabel}>Ad data</div><Seg options={['Sample','null']} value={ad ? 'Sample' : 'null'} onChange={v => setAd(v === 'null' ? null : MOCK_AD)} /></div>
              <div><div style={S.fieldLabel}>Label text <span style={{ opacity: 0.5 }}>(empty = hidden)</span></div><input value={labelText} onChange={e => setLabelText(e.target.value)} style={S.input} placeholder="Sponsored" /></div>
            </div>
            <div style={S.grid(3)}>
              <div><div style={S.fieldLabel}>Radius — {radius}px</div><input type="range" min={0} max={24} value={radius} onChange={e => setRadius(Number(e.target.value))} /></div>
              <div><div style={S.fieldLabel}>Border width — {borderWidth}px</div><input type="range" min={0} max={4} value={borderWidth} onChange={e => setBorderWidth(Number(e.target.value))} /></div>
              <div />
            </div>
            <div style={S.sep} />
            <div style={S.grid(2)}>
              <ColorPicker label="Background" value={bg} onChange={setBg} swatches={SWATCHES.bg[mode]} />
              <ColorPicker label="Text" value={fg} onChange={setFg} swatches={SWATCHES.fg[mode]} />
            </div>
            <div style={S.grid(2)}>
              <ColorPicker label="CTA" value={cta} onChange={setCta} swatches={SWATCHES.cta[mode]} />
              <ColorPicker label="Border" value={borderColor} onChange={setBorderColor} swatches={SWATCHES.border[mode]} />
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
