/* @ds-bundle: {"format":3,"namespace":"ResilientSALivingSoilDesignSystem_6bdfdd","components":[{"name":"Card","sourcePath":"components/cards/Card.jsx"},{"name":"ListingCard","sourcePath":"components/cards/ListingCard.jsx"},{"name":"ProgrammeCard","sourcePath":"components/cards/ProgrammeCard.jsx"},{"name":"MemberRow","sourcePath":"components/data/MemberRow.jsx"},{"name":"NeedsRadar","sourcePath":"components/data/NeedsRadar.jsx"},{"name":"NetworkSummary","sourcePath":"components/data/NetworkSummary.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"IconButton","sourcePath":"components/forms/Button.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"SearchField","sourcePath":"components/forms/Input.jsx"},{"name":"SegmentToggle","sourcePath":"components/forms/SegmentToggle.jsx"},{"name":"ICON_PATHS","sourcePath":"components/foundation/Icon.jsx"},{"name":"Icon","sourcePath":"components/foundation/Icon.jsx"},{"name":"AppBar","sourcePath":"components/navigation/AppBar.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"PillarButton","sourcePath":"components/pillars/PillarButton.jsx"},{"name":"PillarGrid","sourcePath":"components/pillars/PillarButton.jsx"},{"name":"PillarTag","sourcePath":"components/pillars/PillarTag.jsx"},{"name":"PILLARS","sourcePath":"components/pillars/pillarMeta.js"},{"name":"PILLAR_ORDER","sourcePath":"components/pillars/pillarMeta.js"},{"name":"PILLAR_LIST","sourcePath":"components/pillars/pillarMeta.js"}],"sourceHashes":{"components/cards/Card.jsx":"2122617230eb","components/cards/ListingCard.jsx":"02a0a7bc53ae","components/cards/ProgrammeCard.jsx":"e02edf4bb08d","components/data/MemberRow.jsx":"f5de4fb87191","components/data/NeedsRadar.jsx":"2005e7cf152e","components/data/NetworkSummary.jsx":"99f72174b0e6","components/feedback/Badge.jsx":"11c87588986f","components/feedback/EmptyState.jsx":"36c1f220e5d5","components/forms/Button.jsx":"612407c8be87","components/forms/Input.jsx":"e745cd3394a1","components/forms/SegmentToggle.jsx":"1dbe7ec2d3f2","components/foundation/Icon.jsx":"878e8c3c9c62","components/navigation/AppBar.jsx":"ecb5acd66f62","components/navigation/BottomNav.jsx":"f6442681d83b","components/pillars/PillarButton.jsx":"4beb3639f0ea","components/pillars/PillarTag.jsx":"208aab44fd96","components/pillars/pillarMeta.js":"22172ee89988","ui_kits/resilientsa-app/App.jsx":"3d7ad4371291","ui_kits/resilientsa-app/Marketplace.jsx":"1cf2283bb686","ui_kits/resilientsa-app/StewardDashboard.jsx":"cd69bf430a84","ui_kits/resilientsa-app/TradeExchange.jsx":"709252d400f6","ui_kits/resilientsa-app/data.js":"d4cd598dadd3"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ResilientSALivingSoilDesignSystem_6bdfdd = window.ResilientSALivingSoilDesignSystem_6bdfdd || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/cards/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the base Living Soil surface. Soft raised surface on Canvas Grey,
 * gentle rounding, low warm shadow. The container everything else sits in.
 */
function Card({
  children,
  as = 'div',
  padding = 'var(--space-4)',
  interactive = false,
  style,
  ...rest
}) {
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding,
      transition: interactive ? 'transform .1s ease, box-shadow .15s ease' : undefined,
      cursor: interactive ? 'pointer' : undefined,
      ...style
    }
  }, interactive ? {
    onMouseDown: e => e.currentTarget.style.transform = 'scale(0.99)',
    onMouseUp: e => e.currentTarget.style.transform = 'scale(1)',
    onMouseLeave: e => e.currentTarget.style.transform = 'scale(1)'
  } : {}, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/Card.jsx", error: String((e && e.message) || e) }); }

// components/foundation/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Living Soil icon set — line glyphs (Lucide, ISC-licensed paths inlined).
 * Stroke linework echoes the ResilientSA seed-in-hand mark: 1.75 default
 * weight, round caps/joins, currentColor stroke, no fill.
 */
const ICON_PATHS = {
  // Six pillars
  water: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  food: '<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>',
  health: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  safety: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  energy: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  skills: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
  // UI
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'hand-heart': '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 15 6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/>',
  'user-round': '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  'circle-alert': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'circle-check': '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>'
};

/**
 * Icon — renders a Living Soil line glyph.
 */
function Icon({
  name,
  size = 22,
  strokeWidth = 1.75,
  color = 'currentColor',
  label,
  style,
  ...rest
}) {
  const inner = ICON_PATHS[name];
  const a11y = label ? {
    role: 'img',
    'aria-label': label
  } : {
    'aria-hidden': true
  };
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: 'block',
      flexShrink: 0,
      ...style
    }
  }, a11y, rest, {
    dangerouslySetInnerHTML: {
      __html: inner || ''
    }
  }));
}
Object.assign(__ds_scope, { ICON_PATHS, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/foundation/Icon.jsx", error: String((e && e.message) || e) }); }

// components/data/MemberRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * MemberRow — one person in the Steward's member list. A simple, calm signal
 * flags anyone who has drifted out of contact (the "isolate" flag) so the
 * Steward can reach out — warm, never punitive.
 *
 * status: 'active' | 'quiet' | 'isolate'
 */
const STATUS = {
  active: {
    dot: 'var(--signal-success)',
    label: 'Connecting well'
  },
  quiet: {
    dot: 'var(--signal-pending)',
    label: 'Quieter lately'
  },
  isolate: {
    dot: 'var(--signal-urgent)',
    label: 'Out of touch'
  }
};
function MemberRow({
  name,
  place,
  status = 'active',
  connections,
  onReach,
  style,
  ...rest
}) {
  const s = STATUS[status] || STATUS.active;
  const flag = status === 'isolate';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-3) var(--space-4)',
      background: flag ? 'var(--ochre-tint)' : 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: 'var(--surface-sunk)',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "user-round",
    size: 22
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: -1,
      bottom: -1,
      width: 13,
      height: 13,
      borderRadius: '50%',
      background: s.dot,
      border: '2.5px solid var(--surface-card)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--role-body-strong)',
      color: 'var(--text-primary)'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--role-caption)',
      color: flag ? 'var(--ochre-deep)' : 'var(--text-muted)'
    }
  }, flag && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "circle-alert",
    size: 13
  }), s.label, place ? ` · ${place}` : '', !flag && connections != null && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "\xB7 ", connections, " links"))), flag && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onReach,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      flexShrink: 0,
      minHeight: 36,
      padding: '0 var(--space-3)',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      background: 'var(--signal-urgent)',
      color: 'var(--text-on-fill)',
      font: 'var(--role-label)',
      fontSize: 'var(--text-xs)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "hand-heart",
    size: 15
  }), "Reach out"));
}
Object.assign(__ds_scope, { MemberRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MemberRow.jsx", error: String((e && e.message) || e) }); }

// components/data/NetworkSummary.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * NetworkSummary — a plain-language sentence about the health of the cell's
 * connections. No graphs. It tells the Steward what is happening in words a
 * person would actually say, with one calm supporting signal.
 *
 * trend: 'growing' | 'steady' | 'thinning'
 */
const TREND = {
  growing: {
    icon: 'sprout',
    color: 'var(--signal-success)',
    bg: 'var(--aloe-tint)'
  },
  steady: {
    icon: 'users',
    color: 'var(--signal-info)',
    bg: 'var(--rain-tint)'
  },
  thinning: {
    icon: 'circle-alert',
    color: 'var(--signal-urgent)',
    bg: 'var(--ochre-tint)'
  }
};
function NetworkSummary({
  message,
  trend = 'growing',
  stat,
  style,
  ...rest
}) {
  const t = TREND[trend] || TREND.growing;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'flex-start',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      background: t.bg,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: 'var(--surface-card)',
      color: t.color
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.icon,
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--role-body-strong)',
      color: 'var(--text-primary)',
      lineHeight: 'var(--leading-snug)'
    }
  }, message), stat && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--role-caption)',
      color: 'var(--text-secondary)'
    }
  }, stat)));
}
Object.assign(__ds_scope, { NetworkSummary });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/NetworkSummary.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Badge — a small status marker. Offer/Need are the core pair (Aloe/Ochre);
 * also used for pending, verified, count signals. Icon optional so it can
 * read without text.
 *
 * tone: 'offer' | 'need' | 'success' | 'pending' | 'info' | 'neutral'
 */
const TONES = {
  offer: {
    fg: 'var(--offer)',
    bg: 'var(--aloe-tint)',
    icon: 'arrow-up'
  },
  need: {
    fg: 'var(--need)',
    bg: 'var(--ochre-tint)',
    icon: 'arrow-down'
  },
  success: {
    fg: 'var(--signal-success)',
    bg: 'var(--aloe-tint)',
    icon: 'circle-check'
  },
  pending: {
    fg: 'var(--clay-deep)',
    bg: 'var(--clay-tint)',
    icon: 'clock'
  },
  info: {
    fg: 'var(--signal-info)',
    bg: 'var(--rain-tint)',
    icon: 'circle-alert'
  },
  neutral: {
    fg: 'var(--text-secondary)',
    bg: 'var(--surface-sunk)',
    icon: null
  }
};
function Badge({
  tone = 'neutral',
  children,
  icon,
  showIcon = true,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  const glyph = icon || (showIcon ? t.icon : null);
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: t.bg,
      color: t.fg,
      font: 'var(--role-caption)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--text-xs)',
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), glyph && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: glyph,
    size: 13
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * EmptyState — a calm, warm nudge when there is nothing to show. Uses the
 * sprout glyph by default (growth, not absence). Never scolding.
 */
function EmptyState({
  icon = 'sprout',
  title,
  body,
  action,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-8) var(--space-5)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 56,
      height: 56,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--aloe-tint)',
      color: 'var(--aloe)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 28
  })), title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--role-heading)',
      color: 'var(--text-primary)'
    }
  }, title), body && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--role-body)',
      color: 'var(--text-secondary)',
      maxWidth: 280
    }
  }, body), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-2)'
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the Living Soil action. Primary uses Fynbos Aloe. Warm, solid,
 * generous. Never pure black or white. Min tap height 44px (lg = 52px).
 *
 * variants: 'primary' | 'secondary' | 'ghost' | 'urgent'
 * sizes:    'md' | 'lg'
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  disabled = false,
  style,
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    width: fullWidth ? '100%' : undefined,
    minHeight: size === 'lg' ? 52 : 44,
    padding: size === 'lg' ? '0 var(--space-6)' : '0 var(--space-5)',
    borderRadius: 'var(--radius-md)',
    font: 'var(--role-body-strong)',
    fontSize: size === 'lg' ? 'var(--text-lg)' : 'var(--text-base)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1.5px solid transparent',
    transition: 'background .15s ease, border-color .15s ease, transform .08s ease, opacity .15s ease',
    opacity: disabled ? 0.45 : 1,
    whiteSpace: 'nowrap',
    userSelect: 'none'
  };
  const skins = {
    primary: {
      background: 'var(--action-primary)',
      color: 'var(--text-on-fill)'
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-strong)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--action-primary)'
    },
    urgent: {
      background: 'var(--signal-urgent)',
      color: 'var(--text-on-fill)'
    }
  };
  const press = (e, down) => {
    if (!disabled) e.currentTarget.style.transform = down ? 'scale(0.97)' : 'scale(1)';
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    style: {
      ...base,
      ...skins[variant],
      ...style
    },
    onMouseDown: e => press(e, true),
    onMouseUp: e => press(e, false),
    onMouseLeave: e => press(e, false)
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'lg' ? 20 : 18
  }), children, iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: size === 'lg' ? 20 : 18
  }));
}

/**
 * IconButton — square tappable icon. For app bars, dismissals, quick actions.
 */
function IconButton({
  icon,
  label,
  variant = 'quiet',
  size = 44,
  style,
  ...rest
}) {
  const skins = {
    quiet: {
      background: 'transparent',
      color: 'var(--text-primary)'
    },
    soft: {
      background: 'var(--surface-sunk)',
      color: 'var(--text-primary)'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      cursor: 'pointer',
      flexShrink: 0,
      ...skins[variant],
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22,
    label: label
  }));
}
Object.assign(__ds_scope, { Button, IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input / SearchField — plain, calm text entry. Nothing that reads as a
 * government form: soft surface, hairline border, roomy padding.
 */
function Input({
  label,
  icon,
  hint,
  value,
  style,
  id,
  ...rest
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'block',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--role-label)',
      color: 'var(--text-secondary)',
      marginBottom: 'var(--space-2)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 'var(--space-3)',
      color: 'var(--text-muted)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 19
  })), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    value: value,
    style: {
      width: '100%',
      minHeight: 48,
      boxSizing: 'border-box',
      padding: icon ? '0 var(--space-4) 0 42px' : '0 var(--space-4)',
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--border-hairline)',
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      font: 'var(--role-body)',
      outline: 'none'
    },
    onFocus: e => {
      e.target.style.borderColor = 'var(--signal-info)';
      e.target.style.boxShadow = 'var(--focus-ring)';
    },
    onBlur: e => {
      e.target.style.borderColor = 'var(--border-hairline)';
      e.target.style.boxShadow = 'none';
    }
  }, rest))), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--role-caption)',
      color: 'var(--text-muted)',
      marginTop: 'var(--space-2)'
    }
  }, hint));
}
function SearchField(props) {
  return /*#__PURE__*/React.createElement(Input, _extends({
    icon: "search",
    placeholder: "Search your cell\u2026",
    "aria-label": "Search"
  }, props));
}
Object.assign(__ds_scope, { Input, SearchField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentToggle.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SegmentToggle — a two- or three-way switch. Its main job in Living Soil is
 * the Offer / Need choice: a listing is either something given (Aloe) or
 * something asked for (Ochre). Colour reinforces the meaning.
 *
 * options: [{ value, label, icon?, activeColor? }]
 */
function SegmentToggle({
  options,
  value,
  onChange,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      gap: 'var(--space-1)',
      padding: 'var(--space-1)',
      background: 'var(--surface-sunk)',
      borderRadius: 'var(--radius-md)',
      ...style
    }
  }, rest), options.map(opt => {
    const active = opt.value === value;
    const accent = opt.activeColor || 'var(--action-primary)';
    return /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      type: "button",
      role: "tab",
      "aria-selected": active,
      onClick: () => onChange && onChange(opt.value),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        minHeight: 40,
        border: 'none',
        cursor: 'pointer',
        borderRadius: 'var(--radius-sm)',
        background: active ? 'var(--surface-card)' : 'transparent',
        color: active ? accent : 'var(--text-secondary)',
        font: 'var(--role-label)',
        fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
        boxShadow: active ? 'var(--shadow-flat)' : 'none',
        transition: 'color .15s ease, background .15s ease'
      }
    }, opt.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: opt.icon,
      size: 17
    }), opt.label);
  }));
}
Object.assign(__ds_scope, { SegmentToggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentToggle.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AppBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * AppBar — the top bar of a phone screen. Warm, quiet. Optional back button,
 * title (Ubuntu), and a trailing action (e.g. notifications).
 */
function AppBar({
  title,
  onBack,
  trailing,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      minHeight: 56,
      padding: '0 var(--space-3)',
      background: 'var(--bg-page)',
      borderBottom: '1px solid var(--border-hairline)',
      ...style
    }
  }, rest), onBack && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "arrow-left",
    label: "Back",
    onClick: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      font: 'var(--role-title)',
      fontSize: 'var(--text-xl)',
      color: 'var(--text-primary)',
      paddingLeft: onBack ? 0 : 'var(--space-2)',
      textAlign: onBack ? 'center' : 'left'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: onBack ? 44 : undefined,
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, trailing));
}
Object.assign(__ds_scope, { AppBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AppBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * BottomNav — the app's primary navigation. Icon + label per destination so
 * it reads without relying on the words. Active item uses Fynbos Aloe.
 *
 * items: [{ key, label, icon }]
 */
function BottomNav({
  items,
  active,
  onChange,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      background: 'var(--surface-card)',
      borderTop: '1px solid var(--border-hairline)',
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
      ...style
    }
  }, rest), items.map(it => {
    const on = it.key === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      type: "button",
      "aria-current": on ? 'page' : undefined,
      "aria-label": it.label,
      onClick: () => onChange && onChange(it.key),
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: 'var(--space-2) var(--space-1) var(--space-3)',
        minHeight: 58,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: on ? 'var(--action-primary)' : 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 23,
      strokeWidth: on ? 2 : 1.75
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--role-caption)',
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)'
      }
    }, it.label));
  }));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/pillars/pillarMeta.js
try { (() => {
/**
 * The Six Pillars of the Living Soil system.
 * Colour + icon carry meaning independently of language — a Water listing
 * looks like a Water listing before you read the word "Water".
 * Order is canonical. `key` is stable API; `label` is the human word.
 */
const PILLARS = {
  water: {
    key: 'water',
    label: 'Water',
    icon: 'water',
    color: 'var(--pillar-water)',
    tint: 'var(--pillar-water-tint)'
  },
  food: {
    key: 'food',
    label: 'Food',
    icon: 'food',
    color: 'var(--pillar-food)',
    tint: 'var(--pillar-food-tint)'
  },
  health: {
    key: 'health',
    label: 'Health',
    icon: 'health',
    color: 'var(--pillar-health)',
    tint: 'var(--pillar-health-tint)'
  },
  safety: {
    key: 'safety',
    label: 'Safety',
    icon: 'safety',
    color: 'var(--pillar-safety)',
    tint: 'var(--pillar-safety-tint)'
  },
  energy: {
    key: 'energy',
    label: 'Energy',
    icon: 'energy',
    color: 'var(--pillar-energy)',
    tint: 'var(--pillar-energy-tint)'
  },
  skills: {
    key: 'skills',
    label: 'Skills & Trade',
    icon: 'skills',
    color: 'var(--pillar-skills)',
    tint: 'var(--pillar-skills-tint)'
  }
};

/** Canonical ordered list — use for grids and radars. */
const PILLAR_ORDER = ['water', 'food', 'health', 'safety', 'energy', 'skills'];
const PILLAR_LIST = PILLAR_ORDER.map(k => PILLARS[k]);
Object.assign(__ds_scope, { PILLARS, PILLAR_ORDER, PILLAR_LIST });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pillars/pillarMeta.js", error: String((e && e.message) || e) }); }

// components/data/NeedsRadar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * NeedsRadar — a calm, radial read of which pillars have unmet needs right
 * now. Not a table, not a raw graph. Six pillar discs sit around a hub; a
 * disc with high unmet need fills its ring in the pillar hue and shows a
 * count. Scannable in seconds — where is the colour pooling?
 *
 * needs: { water: n, food: n, health: n, safety: n, energy: n, skills: n }
 * Level thresholds: 0 = calm, 1–2 = some, 3+ = high (ring + emphasis).
 */
function NeedsRadar({
  needs = {},
  size = 260,
  onPillar,
  style,
  ...rest
}) {
  const R = size / 2;
  const ring = R - 34; // radius of the disc centres
  const disc = 58;
  const hub = 62;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: 'relative',
      width: size,
      height: size,
      margin: '0 auto',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 34,
      borderRadius: '50%',
      border: '1.5px dashed var(--border-hairline)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: R - hub / 2,
      top: R - hub / 2,
      width: hub,
      height: hub,
      borderRadius: '50%',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--aloe)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "sprout",
    size: 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--role-caption)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-muted)',
      marginTop: 1
    }
  }, "cell")), __ds_scope.PILLAR_ORDER.map((key, i) => {
    const p = __ds_scope.PILLARS[key];
    const count = needs[key] || 0;
    const high = count >= 3;
    const some = count >= 1;
    const angle = (-90 + i * 60) * (Math.PI / 180); // start at top, clockwise
    const cx = R + ring * Math.cos(angle) - disc / 2;
    const cy = R + ring * Math.sin(angle) - disc / 2;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      type: "button",
      "aria-label": `${p.label}: ${count} unmet`,
      onClick: () => onPillar && onPillar(key),
      style: {
        position: 'absolute',
        left: cx,
        top: cy,
        width: disc,
        height: disc,
        borderRadius: '50%',
        cursor: onPillar ? 'pointer' : 'default',
        padding: 0,
        background: some ? p.tint : 'var(--surface-card)',
        border: high ? `2.5px solid ${p.color}` : `1.5px solid var(--border-hairline)`,
        color: some ? p.color : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: high ? 'var(--shadow-card)' : 'var(--shadow-flat)'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: p.icon,
      size: 26,
      strokeWidth: high ? 2 : 1.75
    }), count > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 20,
        height: 20,
        padding: '0 5px',
        borderRadius: 'var(--radius-pill)',
        background: high ? 'var(--signal-urgent)' : p.color,
        color: 'var(--text-on-fill)',
        font: 'var(--role-caption)',
        fontWeight: 'var(--weight-bold)',
        fontSize: 'var(--text-2xs)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid var(--bg-page)'
      }
    }, count));
  }));
}
Object.assign(__ds_scope, { NeedsRadar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/NeedsRadar.jsx", error: String((e && e.message) || e) }); }

// components/pillars/PillarButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * PillarButton — a large, tappable pillar selector. The primary way a
 * community member answers "what kind of support?". Icon-forward so it
 * works without reading. Meets the 44px+ tap-target rule with room to spare.
 */
function PillarButton({
  pillar,
  selected = false,
  onClick,
  style,
  ...rest
}) {
  const p = __ds_scope.PILLARS[pillar];
  if (!p) return null;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    "aria-pressed": selected,
    "aria-label": p.label,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      width: '100%',
      minHeight: 104,
      padding: 'var(--space-4) var(--space-3)',
      border: selected ? `2px solid ${p.color}` : '1.5px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      background: p.tint,
      color: 'var(--text-primary)',
      cursor: 'pointer',
      boxShadow: selected ? 'var(--shadow-card)' : 'var(--shadow-flat)',
      transition: 'background .15s ease, border-color .15s ease, transform .1s ease',
      ...style
    },
    onMouseDown: e => e.currentTarget.style.transform = 'scale(0.97)',
    onMouseUp: e => e.currentTarget.style.transform = 'scale(1)',
    onMouseLeave: e => e.currentTarget.style.transform = 'scale(1)'
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 56,
      height: 56,
      borderRadius: 'var(--radius-pill)',
      background: p.color,
      color: 'var(--text-on-fill)',
      boxShadow: '0 2px 6px ' + p.color + '38'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: p.icon,
    size: 30
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--role-label)',
      fontSize: 'var(--text-sm)',
      fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-medium)',
      textAlign: 'center'
    }
  }, p.label));
}

/**
 * PillarGrid — the canonical 6-up grid of pillar buttons.
 */
function PillarGrid({
  selected,
  onSelect,
  columns = 3,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "group",
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 'var(--space-3)',
      ...style
    }
  }, rest), __ds_scope.PILLAR_LIST.map(p => /*#__PURE__*/React.createElement(PillarButton, {
    key: p.key,
    pillar: p.key,
    selected: selected === p.key,
    onClick: () => onSelect && onSelect(p.key)
  })));
}
Object.assign(__ds_scope, { PillarButton, PillarGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pillars/PillarButton.jsx", error: String((e && e.message) || e) }); }

// components/pillars/PillarTag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * PillarTag — the colour+icon marker that identifies which pillar a listing,
 * programme, or need belongs to. Meaning survives with the label covered.
 *
 * variants:
 *  - 'solid'  filled hue, light glyph (strong identity — card headers)
 *  - 'soft'   tinted background, hue glyph+text (default — inline on cards)
 *  - 'glyph'  icon-only chip in a tinted circle (space-tight rows)
 */
function PillarTag({
  pillar,
  variant = 'soft',
  showLabel = true,
  size = 'md',
  style,
  ...rest
}) {
  const p = __ds_scope.PILLARS[pillar];
  if (!p) return null;
  const dims = size === 'sm' ? {
    pad: '3px 9px',
    gap: 5,
    icon: 14,
    font: 'var(--text-xs)',
    circle: 26
  } : {
    pad: '5px 11px',
    gap: 6,
    icon: 17,
    font: 'var(--text-sm)',
    circle: 34
  };
  if (variant === 'glyph') {
    return /*#__PURE__*/React.createElement("span", _extends({
      title: p.label,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dims.circle,
        height: dims.circle,
        borderRadius: 'var(--radius-pill)',
        background: p.tint,
        color: p.color,
        flexShrink: 0,
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: p.icon,
      size: dims.icon,
      label: p.label
    }));
  }
  const solid = variant === 'solid';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: dims.gap,
      padding: dims.pad,
      borderRadius: 'var(--radius-pill)',
      background: solid ? p.color : p.tint,
      color: solid ? 'var(--text-on-fill)' : p.color,
      font: 'var(--role-label)',
      fontSize: dims.font,
      fontWeight: 'var(--weight-medium)',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: p.icon,
    size: dims.icon,
    label: showLabel ? undefined : p.label
  }), showLabel && p.label);
}
Object.assign(__ds_scope, { PillarTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pillars/PillarTag.jsx", error: String((e && e.message) || e) }); }

// components/cards/ListingCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ListingCard — the core Trade Exchange unit. A member's offer or need.
 * A coloured pillar strip runs down the left so the pillar reads instantly,
 * even with the labels covered. Steward mode adds a "facilitate a match" row.
 *
 * kind: 'offer' | 'need'
 */
function ListingCard({
  title,
  pillar,
  kind = 'offer',
  member,
  place,
  steward = false,
  onAction,
  onMatch,
  actionLabel,
  style,
  ...rest
}) {
  const p = __ds_scope.PILLARS[pillar];
  const accent = kind === 'offer' ? 'var(--offer)' : 'var(--need)';
  const defaultAction = kind === 'offer' ? 'I want this' : 'I can help';
  return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
    padding: "0",
    style: {
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      flexShrink: 0,
      background: p ? p.color : 'var(--border-hairline)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: kind
  }, kind === 'offer' ? 'Offering' : 'Needed'), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--role-heading)',
      color: 'var(--text-primary)',
      lineHeight: 'var(--leading-snug)'
    }
  }, title)), /*#__PURE__*/React.createElement(__ds_scope.PillarTag, {
    pillar: pillar,
    variant: "glyph"
  })), (member || place) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      font: 'var(--role-caption)',
      color: 'var(--text-muted)'
    }
  }, member && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "user-round",
    size: 14
  }), member), place && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map-pin",
    size: 14
  }), place)), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: kind === 'offer' ? 'primary' : 'secondary',
    size: "md",
    fullWidth: true,
    style: kind === 'need' ? {
      borderColor: accent,
      color: accent
    } : undefined,
    onClick: onAction
  }, actionLabel || defaultAction), steward && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onMatch,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      width: '100%',
      minHeight: 40,
      marginTop: -4,
      border: '1.5px dashed var(--border-strong)',
      borderRadius: 'var(--radius-md)',
      background: 'transparent',
      color: 'var(--text-secondary)',
      font: 'var(--role-label)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "users",
    size: 17
  }), "Match a member"))));
}
Object.assign(__ds_scope, { ListingCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/ListingCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/ProgrammeCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ProgrammeCard — a Community Marketplace offering. Browsing for help, not a
 * directory. Leads with what it is in plain language, the pillar it serves,
 * a proof signal (how many communities used it), and who provides it (quiet).
 */
function ProgrammeCard({
  title,
  pillar,
  summary,
  communitiesCount,
  provider,
  onRequest,
  requestLabel,
  style,
  ...rest
}) {
  const p = __ds_scope.PILLARS[pillar];
  return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
    padding: "var(--space-4)",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-md)',
      flexShrink: 0,
      background: p ? p.tint : 'var(--surface-sunk)',
      color: p ? p.color : 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: p ? p.icon : 'sprout',
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--role-heading)',
      color: 'var(--text-primary)',
      lineHeight: 'var(--leading-snug)'
    }
  }, title), /*#__PURE__*/React.createElement(__ds_scope.PillarTag, {
    pillar: pillar,
    size: "sm"
  }))), summary && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--role-body)',
      color: 'var(--text-secondary)',
      lineHeight: 'var(--leading-normal)'
    }
  }, summary), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
      flexWrap: 'wrap'
    }
  }, communitiesCount != null && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--role-label)',
      color: 'var(--signal-success)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "users",
    size: 16
  }), communitiesCount, " communities used this"), provider && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--role-caption)',
      color: 'var(--text-muted)'
    }
  }, "by ", provider)), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    fullWidth: true,
    iconRight: "arrow-right",
    onClick: onRequest
  }, requestLabel || 'Request for our community'));
}
Object.assign(__ds_scope, { ProgrammeCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/ProgrammeCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/resilientsa-app/App.jsx
try { (() => {
// App shell — phone frame, navigation, toast, compose sheet
function Toast({
  toast
}) {
  if (!toast) return null;
  const DS = window.ResilientSALivingSoilDesignSystem_6bdfdd;
  const {
    Icon
  } = DS;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 84,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 14px',
      background: 'var(--bark-900)',
      color: 'var(--canvas)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-raised)',
      font: 'var(--role-body-strong)',
      fontSize: 14,
      animation: 'resaToast .25s ease'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--clay)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check",
    size: 18
  })), /*#__PURE__*/React.createElement("span", null, toast));
}
function ComposeSheet({
  open,
  onClose,
  onPost
}) {
  const DS = window.ResilientSALivingSoilDesignSystem_6bdfdd;
  const {
    SegmentToggle,
    PillarGrid,
    Input,
    Button,
    IconButton
  } = DS;
  const [kind, setKind] = React.useState('offer');
  const [pillar, setPillar] = React.useState('food');
  const [title, setTitle] = React.useState('');
  React.useEffect(() => {
    if (open) {
      setKind('offer');
      setPillar('food');
      setTitle('');
    }
  }, [open]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(44,42,41,.4)',
      animation: 'resaFade .2s ease'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--bg-page)',
      borderTopLeftRadius: 'var(--radius-xl)',
      borderTopRightRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-sheet)',
      padding: '10px 20px 24px',
      animation: 'resaSheet .28s cubic-bezier(.2,.8,.2,1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: '4px 0 12px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 4,
      borderRadius: 2,
      background: 'var(--border-strong)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--role-title)',
      color: 'var(--text-primary)',
      margin: 0
    }
  }, "Share with your cell"), /*#__PURE__*/React.createElement(IconButton, {
    icon: "x",
    label: "Close",
    variant: "soft",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(SegmentToggle, {
    value: kind,
    onChange: setKind,
    options: [{
      value: 'offer',
      label: 'I\u2019m offering',
      icon: 'arrow-up',
      activeColor: 'var(--offer)'
    }, {
      value: 'need',
      label: 'I need help',
      icon: 'arrow-down',
      activeColor: 'var(--need)'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--role-label)',
      color: 'var(--text-secondary)',
      marginBottom: 8
    }
  }, "What is it about?"), /*#__PURE__*/React.createElement(PillarGrid, {
    selected: pillar,
    onSelect: setPillar
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: kind === 'offer' ? 'What are you offering?' : 'What do you need?',
    placeholder: kind === 'offer' ? 'e.g. Spare seedlings' : 'e.g. A lift to the clinic',
    value: title,
    onChange: e => setTitle(e.target.value)
  })), /*#__PURE__*/React.createElement(Button, {
    variant: kind === 'offer' ? 'primary' : 'urgent',
    size: "lg",
    fullWidth: true,
    onClick: () => onPost({
      kind,
      pillar,
      title: title.trim() || (kind === 'offer' ? 'Something to share' : 'Some help needed')
    })
  }, "Post to the cell")));
}
function App() {
  const DS = window.ResilientSALivingSoilDesignSystem_6bdfdd;
  const {
    AppBar,
    BottomNav,
    IconButton,
    Icon
  } = DS;
  const D = window.RESA_DATA;
  const [tab, setTab] = React.useState('exchange');
  const [steward, setSteward] = React.useState(true);
  const [toast, setToast] = React.useState(null);
  const [compose, setCompose] = React.useState(false);
  const [listings, setListings] = React.useState(D.listings);
  const toastTimer = React.useRef(null);
  const notify = msg => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };
  const post = l => {
    setListings(prev => [{
      id: 'new' + Date.now(),
      member: 'You',
      place: 'Cell 4',
      ...l
    }, ...prev]);
    setCompose(false);
    setTab('exchange');
    notify(l.kind === 'offer' ? 'Your offer is live in the cell' : 'Your request is live in the cell');
  };
  const titles = {
    exchange: 'Trade Exchange',
    support: 'Get support',
    steward: 'Steward view'
  };
  const roleToggle = /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSteward(s => !s),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 34,
      padding: '0 12px',
      borderRadius: 'var(--radius-pill)',
      border: '1.5px solid var(--border-hairline)',
      background: steward ? 'var(--rain-tint)' : 'var(--surface-card)',
      color: steward ? 'var(--rain-deep)' : 'var(--text-secondary)',
      font: 'var(--role-caption)',
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "users",
    size: 15
  }), steward ? 'Steward' : 'Member');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-page)'
    }
  }, /*#__PURE__*/React.createElement(AppBar, {
    title: titles[tab],
    trailing: tab === 'exchange' ? roleToggle : /*#__PURE__*/React.createElement(IconButton, {
      icon: "bell",
      label: "Alerts",
      onClick: () => notify('No new alerts')
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden'
    }
  }, tab === 'exchange' && /*#__PURE__*/React.createElement(window.TradeExchange, {
    steward: steward,
    notify: notify,
    listings: listings
  }), tab === 'support' && /*#__PURE__*/React.createElement(window.Marketplace, {
    notify: notify,
    programmes: D.programmes
  }), tab === 'steward' && /*#__PURE__*/React.createElement(window.StewardDashboard, {
    notify: notify,
    data: D
  })), tab === 'exchange' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Share something",
    onClick: () => setCompose(true),
    style: {
      position: 'absolute',
      right: 18,
      bottom: 84,
      zIndex: 30,
      width: 56,
      height: 56,
      borderRadius: '50%',
      border: 'none',
      background: 'var(--action-primary)',
      color: 'var(--text-on-fill)',
      boxShadow: 'var(--shadow-raised)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 26,
    strokeWidth: 2.2
  })), /*#__PURE__*/React.createElement(Toast, {
    toast: toast
  }), /*#__PURE__*/React.createElement(ComposeSheet, {
    open: compose,
    onClose: () => setCompose(false),
    onPost: post
  }), /*#__PURE__*/React.createElement(BottomNav, {
    active: tab,
    onChange: setTab,
    items: [{
      key: 'exchange',
      label: 'Exchange',
      icon: 'home'
    }, {
      key: 'support',
      label: 'Get support',
      icon: 'hand-heart'
    }, {
      key: 'steward',
      label: 'Steward',
      icon: 'users'
    }]
  }));
}
window.RESA_App = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/resilientsa-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/resilientsa-app/Marketplace.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Screen 2 — Community Marketplace ("Get support")
function Marketplace({
  notify,
  programmes
}) {
  const DS = window.ResilientSALivingSoilDesignSystem_6bdfdd;
  const {
    PillarGrid,
    ProgrammeCard,
    PillarTag,
    IconButton,
    Badge
  } = DS;
  const [pillar, setPillar] = React.useState(null);
  const list = programmes.filter(p => p.pillar === pillar);
  if (!pillar) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 20px 24px'
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        font: 'var(--role-title)',
        color: 'var(--text-primary)',
        margin: '8px 0 6px',
        lineHeight: 1.25
      }
    }, "What kind of support does your community need?"), /*#__PURE__*/React.createElement("p", {
      style: {
        font: 'var(--role-body)',
        color: 'var(--text-secondary)',
        margin: '0 0 20px'
      }
    }, "Tap one to see what other communities have used."), /*#__PURE__*/React.createElement(PillarGrid, {
      selected: null,
      onSelect: setPillar
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 20px 12px'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "arrow-left",
    label: "Back to support types",
    variant: "soft",
    onClick: () => setPillar(null)
  }), /*#__PURE__*/React.createElement(PillarTag, {
    pillar: pillar,
    variant: "solid"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      font: 'var(--role-caption)',
      color: 'var(--text-muted)'
    }
  }, list.length, " available")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '0 20px'
    }
  }, list.map(p => /*#__PURE__*/React.createElement(ProgrammeCard, _extends({
    key: p.id
  }, p, {
    onRequest: () => notify(`Request sent for "${p.title}"`)
  }))), list.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: 'var(--text-muted)',
      font: 'var(--role-body)',
      padding: '32px 0'
    }
  }, "Nothing here yet \u2014 check another kind of support.")));
}
window.Marketplace = Marketplace;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/resilientsa-app/Marketplace.jsx", error: String((e && e.message) || e) }); }

// ui_kits/resilientsa-app/StewardDashboard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Screen 3 — Cell Steward Dashboard
function StewardDashboard({
  notify,
  data
}) {
  const DS = window.ResilientSALivingSoilDesignSystem_6bdfdd;
  const {
    NeedsRadar,
    MemberRow,
    NetworkSummary,
    Icon,
    PillarTag
  } = DS;
  const [focus, setFocus] = React.useState(null);
  const isolates = data.members.filter(m => m.status === 'isolate');
  const ordered = [...data.members].sort((a, b) => {
    const rank = {
      isolate: 0,
      quiet: 1,
      active: 2
    };
    return rank[a.status] - rank[b.status];
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 20px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(NetworkSummary, {
    trend: data.network.trend,
    message: data.network.message,
    stat: data.network.stat
  }), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--role-heading)',
      color: 'var(--text-primary)',
      margin: 0
    }
  }, "Where the need is"), focus && /*#__PURE__*/React.createElement(PillarTag, {
    pillar: focus,
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: '18px 12px 12px'
    }
  }, /*#__PURE__*/React.createElement(NeedsRadar, {
    needs: data.needs,
    onPillar: k => {
      setFocus(k);
      notify(`${data.needs[k] || 0} unmet in this area`);
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--role-caption)',
      color: 'var(--text-muted)',
      textAlign: 'center',
      margin: '6px 0 0'
    }
  }, "Tap an area to see what's unmet. Bigger, ringed circles need you most."))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--role-heading)',
      color: 'var(--text-primary)',
      margin: 0
    }
  }, "Your members"), isolates.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      font: 'var(--role-caption)',
      color: 'var(--ochre-deep)',
      background: 'var(--ochre-tint)',
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-alert",
    size: 13
  }), isolates.length, " out of touch")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, ordered.map(m => /*#__PURE__*/React.createElement(MemberRow, _extends({
    key: m.id
  }, m, {
    onReach: () => notify(`Reaching out to ${m.name}`)
  }))))));
}
window.StewardDashboard = StewardDashboard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/resilientsa-app/StewardDashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/resilientsa-app/TradeExchange.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Screen 1 — The Trade Exchange (core experience)
const DS = window.ResilientSALivingSoilDesignSystem_6bdfdd;
function PillarFilterRow({
  value,
  onChange
}) {
  const {
    Icon
  } = DS;
  const items = [{
    key: 'all',
    label: 'All',
    icon: 'sprout',
    color: 'var(--text-secondary)',
    tint: 'var(--surface-sunk)'
  }, {
    key: 'water',
    label: 'Water',
    icon: 'water',
    color: 'var(--pillar-water)',
    tint: 'var(--pillar-water-tint)'
  }, {
    key: 'food',
    label: 'Food',
    icon: 'food',
    color: 'var(--pillar-food)',
    tint: 'var(--pillar-food-tint)'
  }, {
    key: 'health',
    label: 'Health',
    icon: 'health',
    color: 'var(--pillar-health)',
    tint: 'var(--pillar-health-tint)'
  }, {
    key: 'safety',
    label: 'Safety',
    icon: 'safety',
    color: 'var(--pillar-safety)',
    tint: 'var(--pillar-safety-tint)'
  }, {
    key: 'energy',
    label: 'Energy',
    icon: 'energy',
    color: 'var(--pillar-energy)',
    tint: 'var(--pillar-energy-tint)'
  }, {
    key: 'skills',
    label: 'Skills',
    icon: 'skills',
    color: 'var(--pillar-skills)',
    tint: 'var(--pillar-skills-tint)'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2,
      padding: '0 12px 4px'
    }
  }, items.map(it => {
    const on = value === it.key;
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      type: "button",
      onClick: () => onChange(it.key),
      "aria-label": it.label,
      "aria-pressed": on,
      style: {
        display: 'inline-flex',
        flex: 1,
        minWidth: 0,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '4px 0'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 42,
        height: 42,
        borderRadius: '50%',
        background: on ? it.color : it.tint,
        color: on ? 'var(--text-on-fill)' : it.color,
        border: on ? '2px solid ' + it.color : '2px solid transparent',
        transition: 'all .15s ease'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 20
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--role-caption)',
        fontSize: 10,
        lineHeight: 1.1,
        textAlign: 'center',
        color: on ? 'var(--text-primary)' : 'var(--text-muted)',
        fontWeight: on ? 600 : 500
      }
    }, it.label));
  }));
}
function TradeExchange({
  steward,
  notify,
  openCompose,
  listings
}) {
  const {
    ListingCard,
    SegmentToggle
  } = DS;
  const [pillar, setPillar] = React.useState('all');
  const [kind, setKind] = React.useState('all');
  const filtered = listings.filter(l => (pillar === 'all' || l.pillar === pillar) && (kind === 'all' || l.kind === kind));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 14px'
    }
  }, /*#__PURE__*/React.createElement(SegmentToggle, {
    value: kind,
    onChange: setKind,
    options: [{
      value: 'all',
      label: 'Everything'
    }, {
      value: 'offer',
      label: 'Offering',
      icon: 'arrow-up',
      activeColor: 'var(--offer)'
    }, {
      value: 'need',
      label: 'Needing',
      icon: 'arrow-down',
      activeColor: 'var(--need)'
    }]
  })), /*#__PURE__*/React.createElement(PillarFilterRow, {
    value: pillar,
    onChange: setPillar
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '14px 20px 0'
    }
  }, filtered.map(l => /*#__PURE__*/React.createElement(ListingCard, _extends({
    key: l.id
  }, l, {
    steward: steward && l.kind === 'need',
    onAction: () => notify(l.kind === 'offer' ? `You asked Nomsa about "${l.title}"` : `You offered to help with "${l.title}"`),
    onMatch: () => notify(`Matched a member to "${l.title}"`)
  }))), filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: 'var(--text-muted)',
      font: 'var(--role-body)',
      padding: '32px 0'
    }
  }, "Nothing here yet in this filter.")));
}
window.TradeExchange = TradeExchange;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/resilientsa-app/TradeExchange.jsx", error: String((e && e.message) || e) }); }

// ui_kits/resilientsa-app/data.js
try { (() => {
// Seed data for the ResilientSA app prototype — warm, real, Cape Town cell life.
window.RESA_DATA = {
  // Screen 1 — Trade Exchange (a cell's offers & needs)
  listings: [{
    id: 'l1',
    kind: 'offer',
    pillar: 'food',
    title: 'Spare tomato seedlings',
    member: 'Nomsa',
    place: 'Cell 4'
  }, {
    id: 'l2',
    kind: 'need',
    pillar: 'water',
    title: 'Help fixing our shared tap',
    member: 'Themba',
    place: 'Cell 4'
  }, {
    id: 'l3',
    kind: 'offer',
    pillar: 'skills',
    title: 'Free haircuts on Saturdays',
    member: 'Sipho',
    place: 'Cell 4'
  }, {
    id: 'l4',
    kind: 'need',
    pillar: 'health',
    title: 'A lift to the clinic on Thursday',
    member: 'Gogo Miriam',
    place: 'Cell 4'
  }, {
    id: 'l5',
    kind: 'offer',
    pillar: 'energy',
    title: 'Phone charging from my solar',
    member: 'Andile',
    place: 'Cell 4'
  }, {
    id: 'l6',
    kind: 'need',
    pillar: 'safety',
    title: 'Walking group for the evening shift',
    member: 'Zanele',
    place: 'Cell 4'
  }, {
    id: 'l7',
    kind: 'offer',
    pillar: 'food',
    title: 'Extra bread from the bakery, evenings',
    member: 'Fatima',
    place: 'Cell 4'
  }],
  // Screen 2 — Community Marketplace (programmes to request)
  programmes: [{
    id: 'p1',
    pillar: 'water',
    title: 'Fix a broken communal tap',
    summary: 'A plumber trains two people from your area to repair and maintain shared taps.',
    communitiesCount: 38,
    provider: 'Cape Water Collective'
  }, {
    id: 'p2',
    pillar: 'water',
    title: 'A rainwater tank for shared use',
    summary: 'Get a tank installed where several households can collect and store clean water.',
    communitiesCount: 21,
    provider: 'Sizwe Water Trust'
  }, {
    id: 'p3',
    pillar: 'food',
    title: 'Start a food garden together',
    summary: 'Seeds, tools and a few sessions to get a shared vegetable garden growing.',
    communitiesCount: 64,
    provider: 'GreenRoots'
  }, {
    id: 'p4',
    pillar: 'health',
    title: 'A mobile clinic visit',
    summary: 'A nurse team comes to your area for a day of check-ups and basic care.',
    communitiesCount: 47,
    provider: 'HealthReach'
  }, {
    id: 'p5',
    pillar: 'safety',
    title: 'Set up a neighbourhood watch',
    summary: 'Practical help to start a watch group that works with your local CPF.',
    communitiesCount: 51,
    provider: 'Safer Streets Trust'
  }, {
    id: 'p6',
    pillar: 'energy',
    title: 'A shared solar charging point',
    summary: 'A solar station where neighbours can safely charge phones and lights.',
    communitiesCount: 29,
    provider: 'Sun for All'
  }, {
    id: 'p7',
    pillar: 'skills',
    title: 'A weekend skills swap',
    summary: 'Neighbours teach each other a trade — sewing, wiring, repairs, baking.',
    communitiesCount: 33,
    provider: 'Makers Circle'
  }],
  // Screen 3 — Cell Steward Dashboard
  needs: {
    water: 4,
    safety: 3,
    skills: 2,
    health: 1,
    food: 0,
    energy: 0
  },
  members: [{
    id: 'm1',
    name: 'Themba',
    place: 'Cell 4',
    status: 'active',
    connections: 6
  }, {
    id: 'm2',
    name: 'Nomsa',
    place: 'Cell 4',
    status: 'active',
    connections: 4
  }, {
    id: 'm3',
    name: 'Andile',
    place: 'Cell 4',
    status: 'active',
    connections: 5
  }, {
    id: 'm4',
    name: 'Sipho',
    place: 'Cell 4',
    status: 'quiet'
  }, {
    id: 'm5',
    name: 'Grace',
    place: 'Cell 4',
    status: 'isolate'
  }, {
    id: 'm6',
    name: 'Gogo Miriam',
    place: 'Cell 4',
    status: 'isolate'
  }],
  network: {
    trend: 'growing',
    message: 'More members are connecting directly with each other, not just through you.',
    stat: '12 new direct links this month'
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/resilientsa-app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ListingCard = __ds_scope.ListingCard;

__ds_ns.ProgrammeCard = __ds_scope.ProgrammeCard;

__ds_ns.MemberRow = __ds_scope.MemberRow;

__ds_ns.NeedsRadar = __ds_scope.NeedsRadar;

__ds_ns.NetworkSummary = __ds_scope.NetworkSummary;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SearchField = __ds_scope.SearchField;

__ds_ns.SegmentToggle = __ds_scope.SegmentToggle;

__ds_ns.ICON_PATHS = __ds_scope.ICON_PATHS;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.AppBar = __ds_scope.AppBar;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.PillarButton = __ds_scope.PillarButton;

__ds_ns.PillarGrid = __ds_scope.PillarGrid;

__ds_ns.PillarTag = __ds_scope.PillarTag;

__ds_ns.PILLARS = __ds_scope.PILLARS;

__ds_ns.PILLAR_ORDER = __ds_scope.PILLAR_ORDER;

__ds_ns.PILLAR_LIST = __ds_scope.PILLAR_LIST;

})();
