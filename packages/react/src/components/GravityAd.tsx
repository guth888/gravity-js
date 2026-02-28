import React, { useState } from 'react';
import type { GravityAdProps, GravityAdSlotProps } from '../types';
import { useAdTracking } from '../hooks/useAdTracking';

const FOCUS_STYLE_KEY = '__gravity_ad_focus__';

function injectFocusStyle() {
  if (
    typeof document === 'undefined' ||
    (document as any)[FOCUS_STYLE_KEY]
  ) {
    return;
  }
  (document as any)[FOCUS_STYLE_KEY] = true;
  const s = document.createElement('style');
  s.textContent =
    '[data-gravity-ad]:focus-visible{outline:2px solid #2563EB;outline-offset:2px}';
  document.head.appendChild(s);
}

// ---------------------------------------------------------------------------
// Default styles — plain React.CSSProperties objects.
// Every visual value is visible here. No indirection, no CSS variables.
// ---------------------------------------------------------------------------

const FONT =
  'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';

const defaults = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    padding: 0,
    background: '#FFFFFF',
    color: '#18181B',
    border: '1px solid #E4E4E7',
    borderRadius: 10,
    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.04),0 1px 6px 0 rgba(0,0,0,0.06)',
    fontFamily: FONT,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'box-shadow 150ms ease, transform 150ms ease',
    boxSizing: 'border-box',
    lineHeight: 1.5,
    position: 'relative',
    overflow: 'hidden',
  } as React.CSSProperties,

  containerHover: {
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)',
    transform: 'translateY(-1px)',
  } as React.CSSProperties,

  inner: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: '14px 16px 16px',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } as React.CSSProperties,

  favicon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    objectFit: 'contain',
    flexShrink: 0,
  } as React.CSSProperties,

  brand: {
    fontSize: 13,
    fontWeight: 600,
    color: '#18181B',
    lineHeight: 1,
  } as React.CSSProperties,

  label: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    color: '#71717A',
    lineHeight: 1,
    marginLeft: 'auto',
    padding: '2px 6px',
    border: '1px solid #E4E4E7',
    borderRadius: 4,
  } as React.CSSProperties,

  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  } as React.CSSProperties,

  title: {
    fontSize: 14,
    fontWeight: 500,
    color: '#18181B',
    margin: 0,
    lineHeight: 1.4,
  } as React.CSSProperties,

  text: {
    fontSize: 13,
    color: '#71717A',
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,

  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: '#FFFFFF',
    background: '#2563EB',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background 150ms ease',
    textDecoration: 'none',
    lineHeight: 1,
    fontFamily: 'inherit',
    marginTop: 2,
  } as React.CSSProperties,
} as const;

// Variant overrides — merged on top of defaults.

const variantOverrides = {
  inline: {
    container: { overflow: 'visible' } as React.CSSProperties,
    inner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: '12px 16px',
    } as React.CSSProperties,
    body: { gap: 2 } as React.CSSProperties,
    cta: { flexShrink: 0, marginTop: 0 } as React.CSSProperties,
  },
  minimal: {
    container: {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      borderRadius: 0,
      overflow: 'visible',
    } as React.CSSProperties,
    containerHover: {
      boxShadow: 'none',
      transform: 'none',
    } as React.CSSProperties,
    inner: { padding: '8px 0' } as React.CSSProperties,
  },
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SlotKey = keyof GravityAdSlotProps;

function merge(
  base: React.CSSProperties,
  ...overrides: (React.CSSProperties | undefined)[]
): React.CSSProperties {
  let result = base;
  for (const o of overrides) {
    if (o) result = { ...result, ...o };
  }
  return result;
}

function slotStyle(
  slot: SlotKey,
  base: React.CSSProperties,
  variant: 'card' | 'inline' | 'minimal',
  slotProps?: GravityAdSlotProps,
  extra?: React.CSSProperties,
): React.CSSProperties {
  const vo =
    variant !== 'card'
      ? (variantOverrides[variant] as Record<string, React.CSSProperties>)?.[slot]
      : undefined;
  return merge(base, vo, slotProps?.[slot]?.style, extra);
}

function slotClass(slot: SlotKey, slotProps?: GravityAdSlotProps): string | undefined {
  return slotProps?.[slot]?.className;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GravityAd({
  ad,
  variant = 'card',
  className,
  style,
  slotProps,
  showLabel = true,
  labelText = 'Sponsored',
  onClick,
  onImpression,
  onClickTracked,
  fallback = null,
  disableImpressionTracking = false,
  openInNewTab = true,
}: GravityAdProps) {
  injectFocusStyle();

  const [hovered, setHovered] = useState(false);

  const { containerRef, handleClick } = useAdTracking({
    ad,
    disableImpressionTracking,
    onImpression,
    onClickTracked,
  });

  if (!ad) {
    return <>{fallback}</>;
  }

  const handleClickInternal = (e: React.MouseEvent) => {
    handleClick();
    onClick?.();
    if (!ad.clickUrl) {
      e.preventDefault();
    }
  };

  const linkProps = ad.clickUrl
    ? {
        href: ad.clickUrl,
        target: openInNewTab ? ('_blank' as const) : undefined,
        rel: openInNewTab ? 'noopener noreferrer sponsored' : 'sponsored',
      }
    : {};

  // Resolve hover styles (minimal variant suppresses hover lift)
  const hoverExtra =
    hovered
      ? merge(
          defaults.containerHover,
          variant !== 'card'
            ? (variantOverrides[variant] as Record<string, React.CSSProperties>)
                ?.containerHover
            : undefined,
        )
      : undefined;

  const containerStyle = slotStyle(
    'container',
    defaults.container,
    variant,
    slotProps,
    { ...hoverExtra, ...style },
  );

  const hasHeader = ad.favicon || ad.brandName || showLabel;

  const headerEl = hasHeader ? (
    <div
      style={slotStyle('header', defaults.header, variant, slotProps)}
      className={slotClass('header', slotProps)}
    >
      {ad.favicon && (
        <img
          src={ad.favicon}
          alt=""
          loading="lazy"
          style={slotStyle('favicon', defaults.favicon, variant, slotProps)}
          className={slotClass('favicon', slotProps)}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      {ad.brandName && (
        <span
          style={slotStyle('brand', defaults.brand, variant, slotProps)}
          className={slotClass('brand', slotProps)}
        >
          {ad.brandName}
        </span>
      )}
      {showLabel && (
        <span
          style={slotStyle('label', defaults.label, variant, slotProps)}
          className={slotClass('label', slotProps)}
        >
          {labelText}
        </span>
      )}
    </div>
  ) : null;

  const bodyEl = (
    <div
      style={slotStyle('body', defaults.body, variant, slotProps)}
      className={slotClass('body', slotProps)}
    >
      {ad.title && (
        <p
          style={slotStyle('title', defaults.title, variant, slotProps)}
          className={slotClass('title', slotProps)}
        >
          {ad.title}
        </p>
      )}
      <p
        style={slotStyle('text', defaults.text, variant, slotProps)}
        className={slotClass('text', slotProps)}
      >
        {ad.adText}
      </p>
    </div>
  );

  const ctaEl = ad.cta ? (
    <span
      style={slotStyle('cta', defaults.cta, variant, slotProps)}
      className={slotClass('cta', slotProps)}
    >
      {ad.cta}
    </span>
  ) : null;

  const content =
    variant === 'inline' ? (
      <div
        style={slotStyle('inner', defaults.inner, variant, slotProps)}
        className={slotClass('inner', slotProps)}
      >
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {headerEl}
          {bodyEl}
        </div>
        {ctaEl}
      </div>
    ) : (
      <div
        style={slotStyle('inner', defaults.inner, variant, slotProps)}
        className={slotClass('inner', slotProps)}
      >
        {headerEl}
        {bodyEl}
        {ctaEl}
      </div>
    );

  return (
    <a
      {...linkProps}
      ref={containerRef as React.Ref<HTMLAnchorElement>}
      className={className}
      style={containerStyle}
      onClick={handleClickInternal}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-gravity-ad
    >
      {content}
    </a>
  );
}

GravityAd.displayName = 'GravityAd';
