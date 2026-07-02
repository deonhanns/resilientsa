// Screen 1 — The Trade Exchange (core experience)
const DS = window.ResilientSALivingSoilDesignSystem_6bdfdd;

function PillarFilterRow({ value, onChange }) {
  const { Icon } = DS;
  const items = [
    { key: 'all', label: 'All', icon: 'sprout', color: 'var(--text-secondary)', tint: 'var(--surface-sunk)' },
    { key: 'water', label: 'Water', icon: 'water', color: 'var(--pillar-water)', tint: 'var(--pillar-water-tint)' },
    { key: 'food', label: 'Food', icon: 'food', color: 'var(--pillar-food)', tint: 'var(--pillar-food-tint)' },
    { key: 'health', label: 'Health', icon: 'health', color: 'var(--pillar-health)', tint: 'var(--pillar-health-tint)' },
    { key: 'safety', label: 'Safety', icon: 'safety', color: 'var(--pillar-safety)', tint: 'var(--pillar-safety-tint)' },
    { key: 'energy', label: 'Energy', icon: 'energy', color: 'var(--pillar-energy)', tint: 'var(--pillar-energy-tint)' },
    { key: 'skills', label: 'Skills', icon: 'skills', color: 'var(--pillar-skills)', tint: 'var(--pillar-skills-tint)' },
  ];
  return (
    <div style={{ display: 'flex', gap: 2, padding: '0 12px 4px' }}>
      {items.map((it) => {
        const on = value === it.key;
        return (
          <button key={it.key} type="button" onClick={() => onChange(it.key)} aria-label={it.label} aria-pressed={on}
            style={{
              display: 'inline-flex', flex: 1, minWidth: 0, flexDirection: 'column', alignItems: 'center', gap: 4,
              border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 0',
            }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42,
              borderRadius: '50%', background: on ? it.color : it.tint, color: on ? 'var(--text-on-fill)' : it.color,
              border: on ? '2px solid ' + it.color : '2px solid transparent', transition: 'all .15s ease',
            }}><Icon name={it.icon} size={20} /></span>
            <span style={{ font: 'var(--role-caption)', fontSize: 10, lineHeight: 1.1, textAlign: 'center', color: on ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: on ? 600 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TradeExchange({ steward, notify, openCompose, listings }) {
  const { ListingCard, SegmentToggle } = DS;
  const [pillar, setPillar] = React.useState('all');
  const [kind, setKind] = React.useState('all');

  const filtered = listings.filter((l) =>
    (pillar === 'all' || l.pillar === pillar) && (kind === 'all' || l.kind === kind)
  );

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '4px 20px 14px' }}>
        <SegmentToggle value={kind} onChange={setKind} options={[
          { value: 'all', label: 'Everything' },
          { value: 'offer', label: 'Offering', icon: 'arrow-up', activeColor: 'var(--offer)' },
          { value: 'need', label: 'Needing', icon: 'arrow-down', activeColor: 'var(--need)' },
        ]} />
      </div>

      <PillarFilterRow value={pillar} onChange={setPillar} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 20px 0' }}>
        {filtered.map((l) => (
          <ListingCard key={l.id} {...l} steward={steward && l.kind === 'need'}
            onAction={() => notify(l.kind === 'offer' ? `You asked Nomsa about "${l.title}"` : `You offered to help with "${l.title}"`)}
            onMatch={() => notify(`Matched a member to "${l.title}"`)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', font: 'var(--role-body)', padding: '32px 0' }}>
            Nothing here yet in this filter.
          </div>
        )}
      </div>
    </div>
  );
}

window.TradeExchange = TradeExchange;
