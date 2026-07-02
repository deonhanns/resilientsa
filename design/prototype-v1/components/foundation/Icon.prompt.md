**Icon** — renders a single line glyph from the Living Soil set; use anywhere the interface needs a symbol, especially where meaning must survive without text.

```jsx
<Icon name="water" size={24} />
<Icon name="bell" label="Notifications" color="var(--rain)" />
```

Six pillar glyphs — `water food health safety energy skills` — plus UI glyphs (`plus search bell users map-pin filter arrow-left check x sprout` …). Line-only, `currentColor` stroke at 1.75 weight; pass `label` to make it announced, omit it for decoration. Colour via `color` or an ancestor's `color`.
