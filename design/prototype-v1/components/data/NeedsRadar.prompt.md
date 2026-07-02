**NeedsRadar** — the Steward's at-a-glance read of where unmet needs are pooling, by pillar. Six pillar discs around a hub; a disc with high unmet need rings itself in the pillar hue and shows a count. Visual, not a table — no raw graphs.

```jsx
<NeedsRadar needs={{ water: 4, safety: 2, food: 0, health: 1, energy: 0, skills: 3 }}
  onPillar={openPillar} />
```

Counts of 3+ read as "high" (bold ring + Ochre count badge). Answers "where is the colour pooling?" in seconds.
