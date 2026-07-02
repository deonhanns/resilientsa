**PillarTag** — the colour+icon marker that tells you which pillar something belongs to; put it on every listing, programme, or need so the pillar reads before the word does.

```jsx
<PillarTag pillar="water" />                 {/* soft tint + label */}
<PillarTag pillar="safety" variant="solid" />{/* filled hue header */}
<PillarTag pillar="energy" variant="glyph" /> {/* icon-only circle */}
```

Variants: `soft` (default, tinted), `solid` (filled hue), `glyph` (icon-only for tight rows). Sizes `sm`/`md`. Colour + glyph come from `pillarMeta` — never restyle a pillar's hue.
