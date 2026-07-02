**PillarButton / PillarGrid** — the big, icon-forward pillar selector. `PillarGrid` is the canonical 3×2 of all six pillars; reach for it whenever you ask "what kind of support?".

```jsx
const [sel, setSel] = React.useState();
<PillarGrid selected={sel} onSelect={setSel} />

<PillarButton pillar="health" selected />
```

Each tile is a filled hue circle + word, min 96px tall. Selected state tints the tile and rings it in the pillar hue. Use for entry points and filters, not for inline tags (use `PillarTag`).
