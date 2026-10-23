import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, CalendarDays, Users, Plus, Search, SlidersHorizontal,
  ArrowUpRight, MapPin, Clock3, Ticket, CheckCircle2, X, Pencil, Trash2,
  ChevronDown, Sparkles, Menu, CalendarCheck, TrendingUp, CircleHelp,
  LogOut, Eye, ListChecks
} from 'lucide-react';

const seedEvents = [
  { id: 1, title: 'AI & Innovation Summit', category: 'Technology', date: '2026-11-15', time: '10:00', venue: 'MIT-WPU, Pune', seats: 120, description: 'Explore practical AI, emerging technologies, and ideas shaping the next generation of products.', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85', status: 'Upcoming' },
  { id: 2, title: 'Startup Founders Meetup', category: 'Networking', date: '2026-11-20', time: '14:30', venue: 'Baner, Pune', seats: 80, description: 'Meet builders, exchange ideas, and learn how early-stage teams turn concepts into businesses.', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=85', status: 'Upcoming' },
  { id: 3, title: 'Design Thinking Workshop', category: 'Design', date: '2026-12-05', time: '11:00', venue: 'Kothrud, Pune', seats: 45, description: 'Practice user-first problem solving and create a prototype with a collaborative team.', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=85', status: 'Upcoming' },
  { id: 4, title: 'Career Launch: Tech Edition', category: 'Career', date: '2026-12-12', time: '09:30', venue: 'Hinjawadi, Pune', seats: 100, description: 'Get actionable advice on portfolios, interviews, and beginning a career in technology.', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=85', status: 'Upcoming' }
];
const eventKey = 'evently_events_v1';
const regKey = 'evently_registrations_v1';
const categories = ['All categories', 'Technology', 'Networking', 'Design', 'Career', 'Business', 'Other'];
const emptyForm = { title: '', category: 'Technology', date: '', time: '10:00', venue: '', seats: 50, description: '', image: '' };
const readStore = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
};
const prettyDate = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date to be announced';
const statusOf = event => {
  const today = new Date().toISOString().slice(0, 10);
  if (event.date < today) return 'Completed';
  return event.date === today ? 'Ongoing' : 'Upcoming';
};

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => readStore('evently_current_user_v1', null));
  const [role, setRole] = useState(() => readStore('evently_current_user_v1', null)?.role === 'admin' ? 'admin' : 'user');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [page, setPage] = useState('overview');
  const [events, setEvents] = useState(() => readStore(eventKey, seedEvents));
  const [registrations, setRegistrations] = useState(() => readStore(regKey, []));
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [sort, setSort] = useState('soonest');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [eventForm, setEventForm] = useState(emptyForm);
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '' });
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => localStorage.setItem(eventKey, JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem(regKey, JSON.stringify(registrations)), [registrations]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(''), 3200);
    return () => clearTimeout(id);
  }, [notice]);

  const upcomingEvents = events.filter(e => statusOf(e) !== 'Completed');
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchQuery = `${e.title} ${e.category} ${e.venue} ${e.description}`.toLowerCase().includes(query.toLowerCase());
      const matchCategory = category === 'All categories' || e.category === category;
      return matchQuery && matchCategory;
    }).sort((a, b) => sort === 'latest' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  }, [events, query, category, sort]);

  const countFor = id => registrations.filter(r => r.eventId === id).length;
  const seatsLeft = event => Math.max(0, Number(event.seats) - countFor(event.id));
  const resetEventForm = () => { setEventForm(emptyForm); setEditing(null); };
  const openCreate = () => { resetEventForm(); setPage('create'); };
  const openEdit = event => {
    setEditing(event.id);
    setEventForm({ ...emptyForm, ...event });
    setPage('create');
  };
  const saveEvent = e => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.date || !eventForm.venue.trim() || Number(eventForm.seats) < 1) {
      setNotice('Please complete all required event details.');
      return;
    }
    if (editing) {
      setEvents(prev => prev.map(item => item.id === editing ? { ...item, ...eventForm, seats: Number(eventForm.seats) } : item));
      setNotice('Event updated successfully.');
    } else {
      setEvents(prev => [...prev, { ...eventForm, id: Date.now(), seats: Number(eventForm.seats), image: eventForm.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85' }]);
      setNotice('New event created successfully.');
    }
    resetEventForm();
    setPage('events');
  };
  const deleteEvent = id => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setRegistrations(prev => prev.filter(r => r.eventId !== id));
    setConfirmDelete(null);
    setNotice('Event and its registrations deleted.');
  };
  const register = e => {
    e.preventDefault();
    const event = selected;
    if (!event) return;
    if (!registerForm.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email) || registerForm.phone.replace(/\D/g, '').length < 10 || registerForm.phone.replace(/\D/g, '').length > 15) {
      setNotice('Enter a name, valid email, and phone number (10–15 digits).');
      return;
    }
    if (registrations.some(r => r.eventId === event.id && r.email.toLowerCase() === currentUser.email.toLowerCase())) {
      setNotice('This email is already registered for this event.');
      return;
    }
    if (seatsLeft(event) < 1) { setNotice('Sorry, this event is full.'); return; }
    setRegistrations(prev => [...prev, { id: Date.now(), eventId: event.id, eventTitle: event.title, name: currentUser.name, email: currentUser.email, phone: registerForm.phone.trim(), createdAt: new Date().toISOString() }]);
    setSelected(null);
    setRegisterForm({ name: '', email: '', phone: '' });
    setNotice('You are registered! Your seat is confirmed.');
  };

  const submitAuth = e => {
    e.preventDefault();
    setAuthError('');
    const email = authForm.email.trim().toLowerCase();
    const accounts = readStore('evently_users_v1', []);
    if (authMode === 'signup') {
      if (!authForm.name.trim()) { setAuthError('Please enter your full name.'); return; }
      if (authForm.password.length < 6) { setAuthError('Password must contain at least 6 characters.'); return; }
      if (authForm.password !== authForm.confirmPassword) { setAuthError('Passwords do not match.'); return; }
      if (accounts.some(account => account.email === email)) { setAuthError('An account with this email already exists. Please sign in.'); return; }
      const account = { name: authForm.name.trim(), email, password: authForm.password, role: 'user' };
      localStorage.setItem('evently_users_v1', JSON.stringify([...accounts, account]));
      const signedIn = { name: account.name, email: account.email, role: 'user' };
      localStorage.setItem('evently_current_user_v1', JSON.stringify(signedIn));
      setCurrentUser(signedIn);
      setRole('user');
      setRegisterForm({ name: account.name, email: account.email, phone: '' });
      setNotice('Account created successfully. Welcome to Evently!');
    } else {
      // Demo administrator access for this frontend-only project.
      const isDemoAdmin = email === 'admin@evently.com' && authForm.password === 'Admin123!';
      const account = accounts.find(item => item.email === email && item.password === authForm.password);
      if (!isDemoAdmin && !account) { setAuthError('Incorrect email or password. Please try again.'); return; }
      const signedIn = isDemoAdmin
        ? { name: 'Evently Admin', email: 'admin@evently.com', role: 'admin' }
        : { name: account.name, email: account.email, role: account.role === 'admin' ? 'admin' : 'user' };
      localStorage.setItem('evently_current_user_v1', JSON.stringify(signedIn));
      setCurrentUser(signedIn);
      setRole(signedIn.role);
      setRegisterForm(prev => ({ ...prev, name: signedIn.name, email: signedIn.email }));
      setNotice(signedIn.role === 'admin' ? 'Administrator signed in successfully.' : 'Welcome back to Evently!');
    }
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
  };
  const signOut = () => {
    localStorage.removeItem('evently_current_user_v1');
    setCurrentUser(null);
    setRole('user');
    setPage('overview');
    setAuthMode('login');
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const navItems = role === 'admin'
    ? [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'events', label: 'Manage events', icon: CalendarDays }, { id: 'registrations', label: 'Registrations', icon: Users }]
    : [{ id: 'overview', label: 'Discover events', icon: CalendarDays }, { id: 'mytickets', label: 'My registrations', icon: Ticket }];

  if (!currentUser) {
    return (
      <div className="auth-page">
        <div className="auth-decoration auth-decoration-one"/><div className="auth-decoration auth-decoration-two"/>
        <section className="auth-card">
          <div className="auth-brand"><div className="brand-mark"><Sparkles size={21}/></div><span>evently<span className="brand-dot">.</span></span></div>
          <div className="auth-eyebrow">YOUR NEXT EXPERIENCE STARTS HERE</div>
          <h1>{authMode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="auth-subtitle">{authMode === 'signup' ? 'Join Evently to discover workshops and manage your event registrations.' : 'Sign in to continue discovering events and workshops.'}</p>
          <div className="auth-tabs"><button className={authMode === 'signup' ? 'auth-tab active' : 'auth-tab'} onClick={() => {setAuthMode('signup');setAuthError('');}}>Create account</button><button className={authMode === 'login' ? 'auth-tab active' : 'auth-tab'} onClick={() => {setAuthMode('login');setAuthError('');}}>Sign in</button></div>
          <form className="auth-form" onSubmit={submitAuth}>
            {authMode === 'signup' && <Field label="Full name"><input required autoComplete="name" value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})} placeholder="Enter your full name"/></Field>}
            <Field label="Email address"><input required type="email" autoComplete="email" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="you@example.com"/></Field>
            <Field label="Password"><input required type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength={6} value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder="At least 6 characters"/></Field>
            {authMode === 'signup' && <Field label="Confirm password"><input required type="password" autoComplete="new-password" minLength={6} value={authForm.confirmPassword} onChange={e=>setAuthForm({...authForm,confirmPassword:e.target.value})} placeholder="Re-enter your password"/></Field>}
            {authError && <div className="auth-error" role="alert">{authError}</div>}
            <button className="primary-button auth-submit" type="submit">{authMode === 'signup' ? 'Create account' : 'Sign in'} <ArrowUpRight size={17}/></button>
          </form>
          {authMode === 'login' && <div className="demo-admin-box"><strong>Administrator demo access</strong><span>Email: admin@evently.com</span><span>Password: Admin123!</span><small>Use these credentials to manage events and attendee registrations.</small></div>}
          <p className="auth-note">Demo project: accounts are stored in this browser only. Use a secure backend for real authentication.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Sparkles size={20}/></div><span>evently<span className="brand-dot">.</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace"><div className="workspace-avatar">E</div><div><strong>Evently Portal</strong><small>{role === 'admin' ? 'Administrator' : currentUser.name}</small></div><ChevronDown size={15}/></div>
        <div className="nav-label">MENU</div>
        <nav className="nav-menu">
          {navItems.map(item => <button key={item.id} className={`nav-item ${page === item.id || (page === 'create' && item.id === 'events') ? 'active' : ''}`} onClick={() => { setPage(item.id); setMobileNav(false); }}><item.icon size={18}/><span>{item.label}</span>{item.id === 'registrations' && <b className="nav-count">{registrations.length}</b>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><strong>Need a hand?</strong><p>Manage your events with confidence.</p><button onClick={() => setNotice(role === 'admin' ? 'Create events, review registrations, and keep event details up to date.' : 'Browse events and register with your account to keep your tickets together.')}>View quick tip <ArrowUpRight size={14}/></button></div>
          <div className="signed-in-role"><div className="switch-avatar">{role === 'admin' ? 'A' : currentUser.name.charAt(0).toUpperCase()}</div><div><strong>{role === 'admin' ? 'Administrator' : 'Attendee account'}</strong><small>{role === 'admin' ? 'Event management access' : 'Personal event dashboard'}</small></div></div>
          <div className="sidebar-foot"><span>© 2026 Evently</span><span>v1.0.0</span></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation"><Menu size={20}/></button>
          <div className="breadcrumbs">Workspace <span>/</span> <strong>{page === 'create' ? (editing ? 'Edit event' : 'Create event') : navItems.find(n => n.id === page)?.label || 'Dashboard'}</strong></div>
          <div className="topbar-right"><div className="live-indicator"><span/> All systems operational</div><div className="top-avatar">{role === 'admin' ? 'A' : 'T'}</div><div className="top-user"><strong>{role === 'admin' ? 'Admin Preview' : currentUser.name}</strong><small>{role === 'admin' ? 'Administrator preview' : currentUser.email}</small></div><button className="icon-button logout" title="Sign out" onClick={signOut}><LogOut size={17}/></button></div>
        </header>

        <div className="page-content">
          {role === 'admin' && page === 'overview' && <>
            <div className="page-heading"><div><div className="eyebrow">YOUR CONTROL CENTER</div><h1>Good morning, Admin <span className="wave">✦</span></h1><p>Here's what's happening across your events today.</p></div><button className="primary-button" onClick={openCreate}><Plus size={17}/> Create new event</button></div>
            <div className="stats-grid">
              <StatCard label="Total events" value={events.length} note="Across all categories" icon={CalendarDays} tint="purple"/>
              <StatCard label="Upcoming events" value={upcomingEvents.length} note="Ready for attendees" icon={CalendarCheck} tint="blue"/>
              <StatCard label="Total registrations" value={registrations.length} note="All event sign-ups" icon={Users} tint="green"/>
              <StatCard label="Completed events" value={events.filter(e => statusOf(e) === 'Completed').length} note="Past event dates" icon={CheckCircle2} tint="orange"/>
            </div>
            <div className="content-grid">
              <section className="panel wide-panel"><div className="panel-heading"><div><h2>Recent events</h2><p>A quick look at your event schedule</p></div><button className="text-button" onClick={() => setPage('events')}>View all <ArrowUpRight size={15}/></button></div><EventTable events={events.slice().sort((a,b) => a.date.localeCompare(b.date)).slice(0,5)} countFor={countFor} onEdit={openEdit} onDelete={setConfirmDelete}/></section>
              <section className="panel activity-panel"><div className="panel-heading"><div><h2>Registration activity</h2><p>Latest attendee sign-ups</p></div><span className="soft-pill">Live demo</span></div>{registrations.length === 0 ? <EmptyState icon={Users} title="No registrations yet" text="New attendee sign-ups will appear here."/> : <div className="activity-list">{registrations.slice(-5).reverse().map(r => <div className="activity-row" key={r.id}><div className="activity-avatar">{r.name.charAt(0).toUpperCase()}</div><div className="activity-info"><strong>{r.name}</strong><span>registered for {r.eventTitle}</span><small>{new Date(r.createdAt).toLocaleDateString('en-IN')}</small></div><CheckCircle2 size={17} className="activity-check"/></div>)}</div>}<button className="secondary-button full-button" onClick={() => setPage('registrations')}>View all registrations <ArrowUpRight size={15}/></button></section>
            </div>
            <section className="panel category-panel"><div className="panel-heading"><div><h2>Event overview</h2><p>Registration capacity at a glance</p></div><TrendingUp size={20} className="muted-icon"/></div><div className="capacity-list">{events.slice(0,4).map(e => { const pct = Math.min(100, Math.round(countFor(e.id) / Math.max(1,e.seats) * 100)); return <div className="capacity-item" key={e.id}><div className="capacity-title"><span>{e.title}</span><strong>{countFor(e.id)} <small>/ {e.seats}</small></strong></div><div className="progress-track"><div className="progress-fill" style={{width:`${pct}%`}}/></div></div>; })}</div></section>
          </>}

          {role === 'admin' && page === 'events' && <><div className="page-heading"><div><div className="eyebrow">EVENT MANAGEMENT</div><h1>Manage events</h1><p>Create, edit, and keep track of every event in one place.</p></div><button className="primary-button" onClick={openCreate}><Plus size={17}/> Create event</button></div><section className="panel"><div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search events..."/></div><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter category">{categories.map(c=><option key={c}>{c}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort events"><option value="soonest">Date: soonest</option><option value="latest">Date: latest</option></select></div><EventTable events={filteredEvents} countFor={countFor} onEdit={openEdit} onDelete={setConfirmDelete}/></section></>}

          {role === 'admin' && page === 'create' && <><div className="page-heading"><div><div className="eyebrow">EVENT MANAGEMENT</div><h1>{editing ? 'Edit event' : 'Create an event'}</h1><p>{editing ? 'Update the details for this event.' : 'Add an event or workshop for your community.'}</p></div><button className="secondary-button" onClick={() => { resetEventForm(); setPage('events'); }}>Cancel</button></div><form className="panel event-form" onSubmit={saveEvent}><div className="form-section-title"><div className="form-icon"><CalendarDays size={19}/></div><div><h2>Event details</h2><p>Fields marked with * are required.</p></div></div><div className="form-grid"><Field label="Event title *"><input required value={eventForm.title} onChange={e=>setEventForm({...eventForm,title:e.target.value})} placeholder="e.g. Product Design Workshop"/></Field><Field label="Category *"><select value={eventForm.category} onChange={e=>setEventForm({...eventForm,category:e.target.value})}>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</select></Field><Field label="Date *"><input required type="date" min="2020-01-01" value={eventForm.date} onChange={e=>setEventForm({...eventForm,date:e.target.value})}/></Field><Field label="Start time *"><input required type="time" value={eventForm.time} onChange={e=>setEventForm({...eventForm,time:e.target.value})}/></Field><Field label="Venue *"><input required value={eventForm.venue} onChange={e=>setEventForm({...eventForm,venue:e.target.value})} placeholder="City, venue or online"/></Field><Field label="Total seats *"><input required min={1} type="number" value={eventForm.seats} onChange={e=>setEventForm({...eventForm,seats:e.target.value})}/></Field><div className="full-field"><Field label="Event image URL (optional)"><input value={eventForm.image} onChange={e=>setEventForm({...eventForm,image:e.target.value})} placeholder="https://..."/></Field></div><div className="full-field"><Field label="Description"><textarea rows="4" value={eventForm.description} onChange={e=>setEventForm({...eventForm,description:e.target.value})} placeholder="What will attendees learn or experience?"/></Field></div></div><div className="form-actions"><button type="button" className="secondary-button" onClick={() => {resetEventForm();setPage('events');}}>Cancel</button><button className="primary-button" type="submit"><Plus size={16}/>{editing ? 'Save changes' : 'Publish event'}</button></div></form></>}

          {role === 'admin' && page === 'registrations' && <><div className="page-heading"><div><div className="eyebrow">ATTENDEE MANAGEMENT</div><h1>Registrations</h1><p>All attendee sign-ups across your events.</p></div><div className="heading-count"><Users size={17}/>{registrations.length} total</div></div><section className="panel"><div className="panel-heading"><div><h2>Attendee directory</h2><p>Registration details are saved in this browser.</p></div></div>{registrations.length === 0 ? <EmptyState icon={Users} title="No registrations yet" text="When someone registers for an event, their details will show up here."/> : <div className="table-wrap"><table><thead><tr><th>ATTENDEE</th><th>EVENT</th><th>PHONE</th><th>REGISTERED</th><th>STATUS</th></tr></thead><tbody>{registrations.slice().reverse().map(r=><tr key={r.id}><td><div className="person-cell"><div className="person-avatar">{r.name.charAt(0).toUpperCase()}</div><div><strong>{r.name}</strong><small>{r.email}</small></div></div></td><td>{r.eventTitle}</td><td>{r.phone}</td><td>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td><td><span className="status-badge completed"><span/ >Registered</span></td></tr>)}</tbody></table></div>}</section></>}

          {role === 'user' && page === 'overview' && <><section className="user-hero"><div className="hero-content"><div className="hero-tag"><Sparkles size={14}/> FIND YOUR NEXT EXPERIENCE</div><h1>Make room for<br/><span>something inspiring.</span></h1><p>Discover workshops, meet new people, and learn something that moves you forward.</p><div className="hero-actions"><button className="hero-button" onClick={() => document.getElementById('discover-events')?.scrollIntoView({behavior:'smooth'})}>Explore events <ArrowUpRight size={16}/></button><div className="hero-proof"><div className="proof-avatars"><span>T</span><span>A</span><span>R</span></div><small><strong>{registrations.length + 240}+</strong> curious minds joined</small></div></div></div><div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-glow"><Sparkles size={60}/></div><div className="floating-card card-top"><CalendarDays size={17}/><span><strong>Fresh ideas</strong><small>One event away</small></span></div><div className="floating-card card-bottom"><Users size={17}/><span><strong>Good people</strong><small>Great conversations</small></span></div><div className="hero-star star-one">✦</div><div className="hero-star star-two">✧</div></div></section><div className="user-welcome"><div><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h2>Explore upcoming events</h2><p>Handpicked experiences to spark your curiosity.</p></div><div className="mini-stat"><CalendarCheck size={18}/><span><strong>{upcomingEvents.length} events</strong><small>coming up</small></span></div></div><section id="discover-events"><div className="discover-toolbar"><div className="search-box large-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search events, topics, or venues..."/></div><div className="filter-select"><SlidersHorizontal size={16}/><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter by category">{categories.map(c=><option key={c}>{c}</option>)}</select></div><select className="sort-select" value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort events"><option value="soonest">Soonest first</option><option value="latest">Latest first</option></select></div><div className="category-chips">{categories.slice(1,6).map(c=><button key={c} className={category===c?'chip selected':'chip'} onClick={()=>setCategory(category===c?'All categories':c)}>{c}</button>)}</div>{filteredEvents.length===0?<EmptyState icon={Search} title="No events found" text="Try a different search or category."/>:<div className="event-grid">{filteredEvents.map(event=><EventCard key={event.id} event={event} seatsLeft={seatsLeft(event)} onDetails={setSelected}/>)}</div>}</section><div className="user-footer"><span>© 2026 Evently. Made for curious minds.</span><span><Sparkles size={13}/> Discover. Connect. Grow.</span></div></>}

          {role === 'user' && page === 'mytickets' && <><div className="page-heading"><div><div className="eyebrow">YOUR EVENT JOURNEY</div><h1>My registrations</h1><p>All the events you've signed up for, in one place.</p></div><button className="secondary-button" onClick={() => setPage('overview')}>Discover more <ArrowUpRight size={15}/></button></div>{registrations.filter(r => r.email.toLowerCase() === currentUser.email.toLowerCase()).length===0?<section className="panel"><EmptyState icon={Ticket} title="Your next experience awaits" text="You haven't registered for any events yet. Explore events to find one you love."/><div className="center-action"><button className="primary-button" onClick={()=>setPage('overview')}>Explore events <ArrowUpRight size={15}/></button></div></section>:<div className="ticket-grid">{registrations.filter(r => r.email.toLowerCase() === currentUser.email.toLowerCase()).map(r=>{const event=events.find(e=>e.id===r.eventId);return <article className="ticket-card" key={r.id}><div className="ticket-icon"><Ticket size={22}/></div><div className="ticket-info"><span className="eyebrow">CONFIRMED REGISTRATION</span><h3>{r.eventTitle}</h3><p><CalendarDays size={15}/>{event?prettyDate(event.date):'Event details updated'}</p><p><Users size={15}/>{r.name} · {r.email}</p></div><span className="status-badge upcoming"><span/>Confirmed</span></article>})}</div>}</>}
        </div>
      </main>

      {notice && <div className="toast"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Dismiss"><X size={16}/></button></div>}
      {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><section className="event-modal" onClick={e=>e.stopPropagation()}><button className="modal-close icon-button" onClick={()=>setSelected(null)} aria-label="Close"><X size={20}/></button><img className="modal-image" src={selected.image} alt={selected.title}/><div className="modal-body"><span className="event-category">{selected.category}</span><h2>{selected.title}</h2><p>{selected.description}</p><div className="modal-facts"><span><CalendarDays size={16}/>{prettyDate(selected.date)}</span><span><Clock3 size={16}/>{selected.time}</span><span><MapPin size={16}/>{selected.venue}</span><span><Ticket size={16}/>{seatsLeft(selected)} seats left</span></div>{seatsLeft(selected) < 1 ? <div className="full-message">This event is fully booked.</div> : <form className="register-form" onSubmit={register}><h3>Reserve your spot</h3><Field label="Full name"><input required readOnly value={currentUser.name} /></Field><Field label="Email address"><input required type="email" readOnly value={currentUser.email} /></Field><Field label="Contact number"><input required type="tel" value={registerForm.phone} onChange={e=>setRegisterForm({...registerForm,phone:e.target.value})} placeholder="10–15 digit phone number"/></Field><button className="primary-button full-button" type="submit">Confirm registration <ArrowUpRight size={16}/></button></form>}</div></section></div>}
      {confirmDelete && <div className="modal-backdrop" onClick={()=>setConfirmDelete(null)}><section className="confirm-modal" onClick={e=>e.stopPropagation()}><div className="delete-icon"><Trash2 size={22}/></div><h2>Delete this event?</h2><p>This will permanently remove the event and its registrations from this browser.</p><div className="form-actions"><button className="secondary-button" onClick={()=>setConfirmDelete(null)}>Cancel</button><button className="danger-button" onClick={()=>deleteEvent(confirmDelete)}>Delete event</button></div></section></div>}
    </div>
  );
}

function StatCard({label,value,note,icon:Icon,tint}) {
  return <article className="stat-card"><div className={`stat-icon ${tint}`}><Icon size={20}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note"><span className="note-dot"/> {note}</div></article>;
}
function EmptyState({icon:Icon,title,text}) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={23}/></div><h3>{title}</h3><p>{text}</p></div>;
}
function EventTable({events,countFor,onEdit,onDelete}) {
  if (!events.length) return <EmptyState icon={CalendarDays} title="No events to show" text="Try adjusting your filters or create a new event."/>;
  return <div className="table-wrap"><table><thead><tr><th>EVENT</th><th>DATE</th><th>REGISTRATIONS</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{events.map(e=>{const status=statusOf(e);return <tr key={e.id}><td><div className="event-cell"><img src={e.image} alt=""/><div><strong>{e.title}</strong><small>{e.category} · {e.venue}</small></div></div></td><td><strong>{prettyDate(e.date)}</strong><small className="subline">{e.time}</small></td><td><div className="registration-count"><strong>{countFor(e.id)}</strong><span>/ {e.seats} seats</span></div><div className="table-progress"><span style={{width:`${Math.min(100,countFor(e.id)/Math.max(1,e.seats)*100)}%`}}/></div></td><td><span className={`status-badge ${status.toLowerCase()}`}><span/>{status}</span></td><td><div className="row-actions"><button className="action-button" title="Edit event" onClick={()=>onEdit(e)}><Pencil size={15}/></button><button className="action-button delete-action" title="Delete event" onClick={()=>onDelete(e.id)}><Trash2 size={15}/></button></div></td></tr>})}</tbody></table></div>;
}
function EventCard({event,seatsLeft,onDetails}) {
  const status=statusOf(event);
  return <article className="event-card"><div className="event-image-wrap"><img src={event.image} alt={event.title} className="event-image"/><span className="event-category">{event.category}</span><button className="quick-view" onClick={()=>onDetails(event)} title="View event details"><Eye size={17}/></button></div><div className="event-card-body"><div className="event-date-line"><CalendarDays size={15}/>{prettyDate(event.date)}<span className="date-dot"/> <Clock3 size={14}/>{event.time}</div><h3>{event.title}</h3><p className="event-description">{event.description}</p><div className="event-meta"><span><MapPin size={15}/>{event.venue}</span><span><Users size={15}/>{seatsLeft} seats left</span></div><div className="event-card-footer"><span className={`status-badge ${status.toLowerCase()}`}><span/>{status}</span><button className="card-cta" onClick={()=>onDetails(event)} disabled={seatsLeft<1}>{seatsLeft<1?'Fully booked':'View details'} <ArrowUpRight size={15}/></button></div></div></article>;
}