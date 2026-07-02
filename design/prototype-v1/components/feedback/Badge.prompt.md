**Badge** — a small status marker. The `offer`/`need` pair (Aloe arrow-up = giving out / Ochre arrow-down = receiving) is the workhorse; also `success`, `pending`, `info`, `neutral`.

```jsx
<Badge tone="offer">Offering</Badge>
<Badge tone="need">Needed</Badge>
<Badge tone="pending">Waiting</Badge>
```

Each tone carries a default icon so it reads without the word. Pass `showIcon={false}` for a bare pill, or `icon` to override.
