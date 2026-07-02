// Screen 2 — Community Marketplace ("Get support")
function Marketplace({ notify, programmes }) {
  const DS = window.ResilientSALivingSoilDesignSystem_6bdfdd;
  const { PillarGrid, ProgrammeCard, PillarTag, IconButton, Badge } = DS;
  const [pillar, setPillar] = React.useState(null);

  const list = programmes.filter((p) => p.pillar === pillar);

  if (!pillar) {
    return (
      <div style={{ padding: '8px 20px 24px' }}>
        <h2 style={{ font: 'var(--role-title)', color: 'var(--text-primary)', margin: '8px 0 6px', lineHeight: 1.25 }}>
          What kind of support does your community need?
        </h2>
        <p style={{ font: 'var(--role-body)', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
          Tap one to see what other communities have used.
        </p>
        <PillarGrid selected={null} onSelect={setPillar} />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px 12px' }}>
        <IconButton icon="arrow-left" label="Back to support types" variant="soft" onClick={() => setPillar(null)} />
        <PillarTag pillar={pillar} variant="solid" />
        <span style={{ marginLeft: 'auto', font: 'var(--role-caption)', color: 'var(--text-muted)' }}>{list.length} available</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 20px' }}>
        {list.map((p) => (
          <ProgrammeCard key={p.id} {...p}
            onRequest={() => notify(`Request sent for "${p.title}"`)} />
        ))}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', font: 'var(--role-body)', padding: '32px 0' }}>
            Nothing here yet — check another kind of support.
          </div>
        )}
      </div>
    </div>
  );
}

window.Marketplace = Marketplace;
