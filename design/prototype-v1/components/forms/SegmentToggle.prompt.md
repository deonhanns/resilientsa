**SegmentToggle** — a compact 2–3 way switch. Its signature use is the Offer / Need choice, where the active colour carries the meaning (Aloe = offer, Ochre = need).

```jsx
<SegmentToggle
  value={kind}
  onChange={setKind}
  options={[
    { value: 'offer', label: 'Offering', icon: 'hand-heart', activeColor: 'var(--offer)' },
    { value: 'need',  label: 'Needing',  icon: 'circle-alert', activeColor: 'var(--need)' },
  ]}
/>
```

Sits in a sunken track; the active segment lifts onto a card surface tinted by `activeColor`.
