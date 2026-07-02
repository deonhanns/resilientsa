import React from 'react';

/**
 * Card — the base Living Soil surface. Soft raised surface on Canvas Grey,
 * gentle rounding, low warm shadow. The container everything else sits in.
 */
export function Card({ children, as = 'div', padding = 'var(--space-4)', interactive = false, style, ...rest }) {
  const Tag = as;
  return (
    <Tag
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding,
        transition: interactive ? 'transform .1s ease, box-shadow .15s ease' : undefined,
        cursor: interactive ? 'pointer' : undefined,
        ...style,
      }}
      {...(interactive
        ? {
            onMouseDown: (e) => (e.currentTarget.style.transform = 'scale(0.99)'),
            onMouseUp: (e) => (e.currentTarget.style.transform = 'scale(1)'),
            onMouseLeave: (e) => (e.currentTarget.style.transform = 'scale(1)'),
          }
        : {})}
      {...rest}
    >
      {children}
    </Tag>
  );
}
