**Button / IconButton** — the primary action controls. `primary` (Fynbos Aloe) for the main move, `secondary` for alternatives, `ghost` for low-stakes, `urgent` (Ochre Earth) only for genuine crisis actions.

```jsx
<Button variant="primary" icon="plus">Offer something</Button>
<Button variant="secondary" fullWidth>Not now</Button>
<Button variant="urgent" icon="circle-alert">Raise alert</Button>
<IconButton icon="arrow-left" label="Back" />
```

Sizes `md` (44px) / `lg` (52px). Press shrinks slightly. Never use pure-black or -white fills — the skins already use brand tokens.
