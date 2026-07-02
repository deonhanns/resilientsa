**AppBar / BottomNav** — the phone chrome. `AppBar` is the top bar (optional back, Ubuntu title, trailing action); `BottomNav` is the primary nav with icon+label per destination (active = Fynbos Aloe).

```jsx
<AppBar title="Trade Exchange" trailing={<IconButton icon="bell" label="Alerts" />} />
<AppBar title="Get support" onBack={goBack} />

<BottomNav active={tab} onChange={setTab} items={[
  { key: 'exchange', label: 'Exchange', icon: 'home' },
  { key: 'support',  label: 'Support',  icon: 'hand-heart' },
  { key: 'steward',  label: 'Steward',  icon: 'users' },
]} />
```

Both read icon-first for the multi-language context.
