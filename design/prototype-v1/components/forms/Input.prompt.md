**Input / SearchField** — calm, plainspoken text entry that must never read like a government form. Soft surface, hairline border, roomy 48px height, Rainwater-Blue focus ring.

```jsx
<Input label="What are you offering?" placeholder="e.g. Spare seedlings" />
<SearchField value={q} onChange={e => setQ(e.target.value)} />
```

`SearchField` is the search preset (leading glyph + "Search your cell…"). Pass `icon`, `hint`, and any native input props.
