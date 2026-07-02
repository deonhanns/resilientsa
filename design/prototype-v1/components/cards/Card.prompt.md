**Card** — the base surface. Every panel, listing, and programme sits on one. Soft raised Canvas surface, 16px rounding, low warm shadow.

```jsx
<Card>Anything</Card>
<Card interactive onClick={open} padding="var(--space-5)">Tap me</Card>
```

Set `interactive` for tappable cards (adds press feedback). Compose `ListingCard`/`ProgrammeCard` on top rather than restyling this.
