// App shell — phone frame, navigation, toast, compose sheet
function Toast({ toast }) {
  if (!toast) return null;
  const DS = window.ResilientSALivingSoilDesignSystem_6bdfdd;
  const { Icon } = DS;
  return (
    <div style={{
      position: 'absolute', left: 16, right: 16, bottom: 84, zIndex: 40,
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
      background: 'var(--bark-900)', color: 'var(--canvas)', borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-raised)', font: 'var(--role-body-strong)', fontSize: 14,
      animation: 'resaToast .25s ease',
    }}>
      <span style={{ color: 'var(--clay)', display: 'inline-flex' }}><Icon name="circle-check" size={18} /></span>
      <span>{toast}</span>
    </div>
  );
}

function ComposeSheet({ open, onClose, onPost }) {
  const DS = window.ResilientSALivingSoilDesignSystem_6bdfdd;
  const { SegmentToggle, PillarGrid, Input, Button, IconButton } = DS;
  const [kind, setKind] = React.useState('offer');
  const [pillar, setPillar] = React.useState('food');
  const [title, setTitle] = React.useState('');
  React.useEffect(() => { if (open) { setKind('offer'); setPillar('food'); setTitle(''); } }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(44,42,41,.4)', animation: 'resaFade .2s ease' }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--bg-page)',
        borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sheet)', padding: '10px 20px 24px', animation: 'resaSheet .28s cubic-bezier(.2,.8,.2,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 12px' }}>
          <span style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-strong)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ font: 'var(--role-title)', color: 'var(--text-primary)', margin: 0 }}>Share with your cell</h3>
          <IconButton icon="x" label="Close" variant="soft" onClick={onClose} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <SegmentToggle value={kind} onChange={setKind} options={[
            { value: 'offer', label: 'I\u2019m offering', icon: 'arrow-up', activeColor: 'var(--offer)' },
            { value: 'need', label: 'I need help', icon: 'arrow-down', activeColor: 'var(--need)' },
          ]} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ font: 'var(--role-label)', color: 'var(--text-secondary)', marginBottom: 8 }}>What is it about?</div>
          <PillarGrid selected={pillar} onSelect={setPillar} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <Input label={kind === 'offer' ? 'What are you offering?' : 'What do you need?'}
            placeholder={kind === 'offer' ? 'e.g. Spare seedlings' : 'e.g. A lift to the clinic'}
            value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <Button variant={kind === 'offer' ? 'primary' : 'urgent'} size="lg" fullWidth
          onClick={() => onPost({ kind, pillar, title: title.trim() || (kind === 'offer' ? 'Something to share' : 'Some help needed') })}>
          Post to the cell
        </Button>
      </div>
    </div>
  );
}

function App() {
  const DS = window.ResilientSALivingSoilDesignSystem_6bdfdd;
  const { AppBar, BottomNav, IconButton, Icon } = DS;
  const D = window.RESA_DATA;

  const [tab, setTab] = React.useState('exchange');
  const [steward, setSteward] = React.useState(true);
  const [toast, setToast] = React.useState(null);
  const [compose, setCompose] = React.useState(false);
  const [listings, setListings] = React.useState(D.listings);
  const toastTimer = React.useRef(null);

  const notify = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const post = (l) => {
    setListings((prev) => [{ id: 'new' + Date.now(), member: 'You', place: 'Cell 4', ...l }, ...prev]);
    setCompose(false);
    setTab('exchange');
    notify(l.kind === 'offer' ? 'Your offer is live in the cell' : 'Your request is live in the cell');
  };

  const titles = { exchange: 'Trade Exchange', support: 'Get support', steward: 'Steward view' };

  const roleToggle = (
    <button type="button" onClick={() => setSteward((s) => !s)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px',
        borderRadius: 'var(--radius-pill)', border: '1.5px solid var(--border-hairline)',
        background: steward ? 'var(--rain-tint)' : 'var(--surface-card)', color: steward ? 'var(--rain-deep)' : 'var(--text-secondary)',
        font: 'var(--role-caption)', fontWeight: 600, cursor: 'pointer',
      }}>
      <Icon name="users" size={15} />{steward ? 'Steward' : 'Member'}
    </button>
  );

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-page)' }}>
      <AppBar title={titles[tab]}
        trailing={tab === 'exchange' ? roleToggle : <IconButton icon="bell" label="Alerts" onClick={() => notify('No new alerts')} />} />

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'exchange' && (
          <window.TradeExchange steward={steward} notify={notify} listings={listings} />
        )}
        {tab === 'support' && <window.Marketplace notify={notify} programmes={D.programmes} />}
        {tab === 'steward' && <window.StewardDashboard notify={notify} data={D} />}
      </div>

      {tab === 'exchange' && (
        <button type="button" aria-label="Share something" onClick={() => setCompose(true)}
          style={{
            position: 'absolute', right: 18, bottom: 84, zIndex: 30, width: 56, height: 56,
            borderRadius: '50%', border: 'none', background: 'var(--action-primary)', color: 'var(--text-on-fill)',
            boxShadow: 'var(--shadow-raised)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <Icon name="plus" size={26} strokeWidth={2.2} />
        </button>
      )}

      <Toast toast={toast} />
      <ComposeSheet open={compose} onClose={() => setCompose(false)} onPost={post} />

      <BottomNav active={tab} onChange={setTab} items={[
        { key: 'exchange', label: 'Exchange', icon: 'home' },
        { key: 'support', label: 'Get support', icon: 'hand-heart' },
        { key: 'steward', label: 'Steward', icon: 'users' },
      ]} />
    </div>
  );
}

window.RESA_App = App;
