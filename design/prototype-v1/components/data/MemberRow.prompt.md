**MemberRow** — one member in the Steward's list, with a calm status dot: green = connecting well, clay = quieter lately, ochre = out of touch (the isolate flag). Isolate rows tint warm and surface a "Reach out" action.

```jsx
<MemberRow name="Themba" place="Cell 4" status="active" connections={6} />
<MemberRow name="Grace" status="isolate" onReach={...} />
```

The flag is a nudge to connect, never a reprimand — keep the tone warm.
