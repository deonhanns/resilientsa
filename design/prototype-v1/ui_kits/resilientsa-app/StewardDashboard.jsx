// Screen 3 — Cell Steward Dashboard
function StewardDashboard({ notify, data }) {
  const DS = window.ResilientSALivingSoilDesignSystem_6bdfdd;
  const { NeedsRadar, MemberRow, NetworkSummary, Icon, PillarTag } = DS;
  const [focus, setFocus] = React.useState(null);

  const isolates = data.members.filter((m) => m.status === 'isolate');
  const ordered = [...data.members].sort((a, b) => {
    const rank = { isolate: 0, quiet: 1, active: 2 };
    return rank[a.status] - rank[b.status];
  });

  return (
    <div style={{ padding: '8px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <NetworkSummary trend={data.network.trend} message={data.network.message} stat={data.network.stat} />

      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ font: 'var(--role-heading)', color: 'var(--text-primary)', margin: 0 }}>Where the need is</h3>
          {focus && <PillarTag pillar={focus} size="sm" />}
        </div>
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '18px 12px 12px' }}>
          <NeedsRadar needs={data.needs} onPillar={(k) => { setFocus(k); notify(`${data.needs[k] || 0} unmet in this area`); }} />
          <p style={{ font: 'var(--role-caption)', color: 'var(--text-muted)', textAlign: 'center', margin: '6px 0 0' }}>
            Tap an area to see what's unmet. Bigger, ringed circles need you most.
          </p>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <h3 style={{ font: 'var(--role-heading)', color: 'var(--text-primary)', margin: 0 }}>Your members</h3>
          {isolates.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: 'var(--role-caption)', color: 'var(--ochre-deep)', background: 'var(--ochre-tint)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
              <Icon name="circle-alert" size={13} />{isolates.length} out of touch
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ordered.map((m) => (
            <MemberRow key={m.id} {...m} onReach={() => notify(`Reaching out to ${m.name}`)} />
          ))}
        </div>
      </section>
    </div>
  );
}

window.StewardDashboard = StewardDashboard;
