**ListingCard** — the Trade Exchange unit: one member's offer or need. The left colour strip + glyph name the pillar without text; the badge and CTA colour say offer (Aloe) vs need (Ochre).

```jsx
<ListingCard kind="offer" pillar="food" title="Spare tomato seedlings"
  member="Nomsa" place="Cell 4" onAction={...} />

<ListingCard kind="need" pillar="water" title="Help fixing a shared tap"
  steward member="Themba" onMatch={facilitate} />
```

Set `steward` for the Cell Steward view (adds "Match a member"). Everything else is plain-language content.
