import { useState, useEffect } from "react";

const STORAGE_KEY = "badminton_season10";
const genId = () => Math.random().toString(36).slice(2, 9);
const todayStr = () => new Date().toISOString().slice(0, 10);
const sum = arr => arr.reduce((s, x) => s + Number(x.amount), 0);
const initials = name => name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);

const fmtDate = d => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${M[parseInt(m)-1]}`;
};
const fmtDateLong = d => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${M[parseInt(m)-1]} ${y}`;
};

const PAYMENT_TYPES = ["Contribution Fee", "Shuttlecock", "Court Fee", "Other"];

const AVATAR_COLORS = [
  { bg:"#E6F1FB", fg:"#0C447C" },
  { bg:"#E1F5EE", fg:"#085041" },
  { bg:"#EEEDFE", fg:"#3C3489" },
  { bg:"#FAECE7", fg:"#712B13" },
  { bg:"#FAEEDA", fg:"#633806" },
  { bg:"#EAF3DE", fg:"#27500A" },
  { bg:"#FBEAF0", fg:"#72243E" },
];

const TYPE_CFG = {
  "Contribution Fee": { bg:"var(--color-background-info)",     fg:"var(--color-text-info)",     icon:"ti-coin" },
  "Shuttlecock":      { bg:"var(--color-background-success)",  fg:"var(--color-text-success)",  icon:"ti-feather" },
  "Court Fee":        { bg:"var(--color-background-warning)",  fg:"var(--color-text-warning)",  icon:"ti-map-pin" },
  "Other":            { bg:"var(--color-background-tertiary)", fg:"var(--color-text-secondary)", icon:"ti-dots" },
};

const INITIAL = {
  settings: { contributionTarget: 50 },
  players: [
    { id:"p1", name:"Tomal Bhai",  phone:"+61 490 091 023" },
    { id:"p2", name:"PoLok Bhai",  phone:"" },
  ],
  payments: [
    { id:"pay1", playerId:"p1", type:"Contribution Fee", amount:50, date:"2026-06-21", notes:"" },
    { id:"pay2", playerId:"p2", type:"Shuttlecock",      amount:65, date:"2026-06-21", notes:"" },
  ],
  expenses: [
    { id:"exp1", type:"Court Fee", amount:26, date:"2026-06-18", notes:"Paid on 18th June" },
  ],
};

function Avatar({ name, idx }) {
  const c = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return (
    <div aria-hidden="true" style={{ width:42, height:42, borderRadius:"50%", background:c.bg, color:c.fg, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:500, fontSize:14, flexShrink:0, letterSpacing:"0.04em" }}>
      {initials(name)}
    </div>
  );
}

function Badge({ type }) {
  const c = TYPE_CFG[type] || TYPE_CFG["Other"];
  return (
    <span style={{ background:c.bg, color:c.fg, fontSize:11, fontWeight:500, padding:"3px 8px", borderRadius:20, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:3 }}>
      <i className={`ti ${c.icon}`} style={{ fontSize:10 }} aria-hidden="true"></i> {type}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:10 }}>
      <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontWeight:500 }}>{label}</label>
      {children}
    </div>
  );
}

const iStyle = {
  width:"100%", boxSizing:"border-box", padding:"10px 12px",
  border:"0.5px solid var(--color-border-secondary)", borderRadius:"var(--border-radius-md)",
  fontFamily:"var(--font-sans)", fontSize:15, outline:"none",
  background:"var(--color-background-primary)", color:"var(--color-text-primary)",
};

export default function App() {
  const [data,    setData]    = useState(null);
  const [tab,     setTab]     = useState("players");
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const [showCfg, setShowCfg] = useState(false);
  const [copied,  setCopied]  = useState(false);
  const [cfgForm, setCfgForm] = useState({ contributionTarget:"50" });

  const [addingPlayer,   setAddingPlayer] = useState(false);
  const [pForm,          setPForm]        = useState({ name:"", phone:"" });
  const [editingPlayer,  setEditingPlayer] = useState(null);
  const [editName,       setEditName]     = useState("");

  const [logFor,   setLogFor]   = useState(null);
  const [payForm,  setPayForm]  = useState({ type:"Contribution Fee", amount:"", date:todayStr(), notes:"" });

  const [addingExp, setAddingExp] = useState(false);
  const [expForm,   setExpForm]   = useState({ type:"Court Fee", amount:"", date:todayStr(), notes:"" });

  const [confirmPlayer, setConfirmPlayer] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        const d = r ? JSON.parse(r.value) : INITIAL;
        if (!d.settings) d.settings = { contributionTarget:50 };
        setData(d);
        setCfgForm({ contributionTarget: String(d.settings.contributionTarget) });
      } catch { setData(INITIAL); }
      setLoading(false);
    })();
  }, []);

  const persist = async (d) => {
    setData(d);
    setSaveMsg("Saving…");
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(d));
      setSaveMsg("Saved ✓");
      setTimeout(() => setSaveMsg(""), 1400);
    } catch { setSaveMsg("Save failed"); }
  };

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"70vh", gap:12, color:"var(--color-text-secondary)", fontFamily:"var(--font-sans)" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <i className="ti ti-refresh" style={{ fontSize:32, animation:"spin 1s linear infinite" }} aria-hidden></i>
      <span style={{ fontSize:14 }}>Loading Season 10…</span>
    </div>
  );

  const { players, payments, expenses, settings } = data;
  const target     = Number(settings?.contributionTarget) || 0;
  const playerPays = pid => payments.filter(p => p.playerId === pid);
  const playerTotal= pid => sum(playerPays(pid));
  const hasCF      = pid => playerPays(pid).some(p => p.type === "Contribution Fee" && (target === 0 || p.amount >= target));
  const paidCount  = players.filter(p => hasCF(p.id)).length;
  const pendingCnt = players.length - paidCount;
  const totalIn    = sum(payments);
  const totalOut   = sum(expenses);
  const balance    = totalIn - totalOut;

  const addPlayer = () => {
    if (!pForm.name.trim()) return;
    persist({ ...data, players: [...players, { id:genId(), name:pForm.name.trim(), phone:pForm.phone.trim() }] });
    setAddingPlayer(false); setPForm({ name:"", phone:"" });
  };

  const saveEditPlayer = id => {
    if (!editName.trim()) return;
    persist({ ...data, players: players.map(p => p.id === id ? { ...p, name:editName.trim() } : p) });
    setEditingPlayer(null);
  };

  const removePlayer = id => {
    persist({ ...data, players: players.filter(p => p.id !== id), payments: payments.filter(p => p.playerId !== id) });
    setConfirmPlayer(null);
  };

  const openLog = pid => {
    setLogFor(pid); setConfirmPlayer(null);
    setPayForm({ type:"Contribution Fee", amount: target ? String(target) : "", date:todayStr(), notes:"" });
  };

  const logPayment = () => {
    if (!payForm.amount || !logFor) return;
    persist({ ...data, payments: [...payments, { id:genId(), playerId:logFor, type:payForm.type, amount:parseFloat(payForm.amount), date:payForm.date, notes:payForm.notes }] });
    setLogFor(null);
  };

  const removePayment = id => persist({ ...data, payments: payments.filter(p => p.id !== id) });
  const addExpense    = () => {
    if (!expForm.amount) return;
    persist({ ...data, expenses: [...expenses, { id:genId(), type:expForm.type, amount:parseFloat(expForm.amount), date:expForm.date, notes:expForm.notes }] });
    setAddingExp(false); setExpForm({ type:"Court Fee", amount:"", date:todayStr(), notes:"" });
  };
  const removeExpense = id => persist({ ...data, expenses: expenses.filter(e => e.id !== id) });

  const saveSettings = () => {
    persist({ ...data, settings: { ...settings, contributionTarget: parseFloat(cfgForm.contributionTarget) || 0 } });
    setShowCfg(false);
  };

  const copySummary = async () => {
    const today = new Date().toLocaleDateString("en-AU", { day:"numeric", month:"short", year:"numeric" });
    const txt = [
      `🏸 Season 10 — Payment Summary`,
      `Date: ${today}`,
      ``,
      `Players (${paidCount}/${players.length} contributed):`,
      ...players.map(p => {
        const total = playerTotal(p.id);
        const types = [...new Set(playerPays(p.id).map(pay => pay.type))].join(", ") || "—";
        return `${hasCF(p.id) ? "✅" : "⏳"} ${p.name}: AUD $${total} (${types})`;
      }),
      ``,
      ...(expenses.length ? [`Group Expenses:`, ...expenses.map(e => `• ${e.type}: AUD $${e.amount}${e.notes ? ` (${e.notes})` : ""}`), ``] : []),
      `Total Collected: AUD $${totalIn}`,
      `Total Expenses:  AUD $${totalOut}`,
      `Balance:         AUD $${balance}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    } catch(e) { console.error(e); }
  };

  const allTxns = [
    ...payments.map(p => ({ ...p, who: players.find(pl => pl.id === p.playerId)?.name || "Unknown", dir:"in" })),
    ...expenses.map(e => ({ ...e, who:"Group", dir:"out" })),
  ].sort((a,b) => b.date.localeCompare(a.date));

  const byDate = allTxns.reduce((acc, t) => { (acc[t.date] = acc[t.date]||[]).push(t); return acc; }, {});

  const card = { background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:"var(--border-radius-lg)", overflow:"hidden" };
  const sep  = { height:"0.5px", background:"var(--color-border-tertiary)" };

  return (
    <div style={{ fontFamily:"var(--font-sans)", minHeight:"100vh", background:"var(--color-background-tertiary)", color:"var(--color-text-primary)" }}>
      <h2 className="sr-only">Season 10 Badminton Group Payment Tracker</h2>

      {/* ── Header ── */}
      <div style={{ background:"var(--color-background-secondary)", borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ padding:"1.25rem 1rem 0" }}>

          {/* Title row */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"var(--color-background-info)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <i className="ti ti-feather" style={{ fontSize:22, color:"var(--color-text-info)" }} aria-hidden></i>
              </div>
              <div>
                <div style={{ fontWeight:500, fontSize:18, lineHeight:1.2 }}>Season 10</div>
                <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:3 }}>
                  {paidCount}/{players.length} contributed
                  {pendingCnt > 0 && (
                    <span style={{ color:"var(--color-text-warning)", marginLeft:8, display:"inline-flex", alignItems:"center", gap:3 }}>
                      <i className="ti ti-clock" style={{ fontSize:11 }} aria-hidden></i> {pendingCnt} pending
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {saveMsg && <span style={{ fontSize:11, color:"var(--color-text-secondary)" }}>{saveMsg}</span>}
              <button onClick={() => { setShowCfg(!showCfg); setCfgForm({ contributionTarget: String(settings?.contributionTarget||50) }); }}
                aria-label="Settings" style={{ padding:8, borderRadius:"var(--border-radius-md)", display:"flex", background: showCfg ? "var(--color-background-info)" : "transparent", border:"none", cursor:"pointer" }}>
                <i className="ti ti-settings" style={{ fontSize:20, color: showCfg ? "var(--color-text-info)" : "var(--color-text-secondary)" }} aria-hidden></i>
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showCfg && (
            <div style={{ background:"var(--color-background-tertiary)", border:"0.5px solid var(--color-border-secondary)", borderRadius:"var(--border-radius-md)", padding:"1rem", marginBottom:"1rem" }}>
              <div style={{ fontWeight:500, fontSize:14, marginBottom:10 }}>Season settings</div>
              <Field label="Contribution fee target per player (AUD)">
                <input type="number" value={cfgForm.contributionTarget}
                  onChange={e => setCfgForm({...cfgForm, contributionTarget:e.target.value})}
                  style={{...iStyle, maxWidth:140}} />
              </Field>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setShowCfg(false)} style={{ flex:1 }}>Cancel</button>
                <button onClick={saveSettings} style={{ flex:1, fontWeight:500 }}>Save</button>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div style={{ display:"flex", gap:8, marginBottom:"1rem" }}>
            {[
              { icon:"ti-arrow-down-circle", label:"Collected", val:`$${totalIn}`,  c:"var(--color-text-success)" },
              { icon:"ti-arrow-up-circle",   label:"Expenses",  val:`$${totalOut}`, c:"var(--color-text-warning)" },
              { icon:"ti-scale",             label:"Balance",   val:`$${balance}`,  c: balance>=0 ? "var(--color-text-success)" : "var(--color-text-danger)" },
            ].map(s => (
              <div key={s.label} style={{ flex:1, background:"var(--color-background-tertiary)", borderRadius:"var(--border-radius-md)", padding:"10px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                  <i className={`ti ${s.icon}`} style={{ fontSize:13, color:s.c }} aria-hidden></i>
                  <span style={{ fontSize:11, color:"var(--color-text-secondary)" }}>{s.label}</span>
                </div>
                <div style={{ fontWeight:500, fontSize:16, color:s.c }}>AUD {s.val}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex" }}>
            {[["players","Players",pendingCnt], ["expenses","Expenses",0], ["history","History",0]].map(([id,label,badge]) => (
              <button key={id} onClick={() => setTab(id)} style={{ background:"none", border:"none", padding:"10px 14px", cursor:"pointer", fontSize:13, fontWeight: tab===id ? 500 : 400, color: tab===id ? "var(--color-text-info)" : "var(--color-text-secondary)", borderBottom: tab===id ? "2px solid var(--color-border-info)" : "2px solid transparent", marginBottom:-1, display:"flex", alignItems:"center", gap:6 }}>
                {label}
                {badge > 0 && <span style={{ background:"var(--color-background-warning)", color:"var(--color-text-warning)", fontSize:10, fontWeight:500, padding:"1px 6px", borderRadius:10 }}>{badge}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding:"1rem", maxWidth:560, margin:"0 auto" }}>

        {/* ───── PLAYERS ───── */}
        {tab === "players" && (
          <>
            {players.length === 0 && !addingPlayer && (
              <div style={{ textAlign:"center", padding:"3rem 0", color:"var(--color-text-secondary)" }}>
                <i className="ti ti-users" style={{ fontSize:42, display:"block", marginBottom:10 }} aria-hidden></i>
                <div style={{ fontSize:14 }}>No players yet — add your first below</div>
              </div>
            )}

            {players.map((player, idx) => {
              const pPays    = playerPays(player.id);
              const pTotal   = playerTotal(player.id);
              const paid     = hasCF(player.id);
              const logging  = logFor === player.id;
              const confirm  = confirmPlayer === player.id;
              const editing  = editingPlayer === player.id;

              return (
                <div key={player.id} style={{ ...card, marginBottom:12 }}>

                  {/* Player header */}
                  <div style={{ padding:"1rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                        <Avatar name={player.name} idx={idx} />
                        <div>
                          {editing ? (
                            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                              <input value={editName} autoFocus onChange={e => setEditName(e.target.value)}
                                onKeyDown={e => { if(e.key==="Enter") saveEditPlayer(player.id); if(e.key==="Escape") setEditingPlayer(null); }}
                                style={{...iStyle, width:160, padding:"6px 10px", fontSize:14}} />
                              <button onClick={() => saveEditPlayer(player.id)} style={{ padding:"6px 10px", fontSize:13, fontWeight:500 }}>Save</button>
                              <button onClick={() => setEditingPlayer(null)} style={{ padding:"6px 8px", fontSize:13 }}>✕</button>
                            </div>
                          ) : (
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <span style={{ fontWeight:500, fontSize:15 }}>{player.name}</span>
                              <button onClick={() => { setEditingPlayer(player.id); setEditName(player.name); }}
                                aria-label={`Edit ${player.name}`}
                                style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-text-secondary)", padding:0, lineHeight:1 }}>
                                <i className="ti ti-pencil" style={{ fontSize:13 }} aria-hidden></i>
                              </button>
                            </div>
                          )}
                          {!editing && player.phone && <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:2 }}>{player.phone}</div>}
                          {!editing && (
                            <div style={{ marginTop:5 }}>
                              {paid
                                ? <span style={{ fontSize:11, color:"var(--color-text-success)", display:"inline-flex", alignItems:"center", gap:3 }}><i className="ti ti-circle-check" style={{ fontSize:12 }} aria-hidden></i> Contribution paid</span>
                                : <span style={{ fontSize:11, color:"var(--color-text-warning)", display:"inline-flex", alignItems:"center", gap:3 }}><i className="ti ti-clock" style={{ fontSize:12 }} aria-hidden></i> Contribution pending{target > 0 ? ` (AUD $${target})` : ""}</span>
                              }
                            </div>
                          )}
                        </div>
                      </div>
                      {!editing && (
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontWeight:500, fontSize:18, color: pTotal > 0 ? "var(--color-text-success)" : "var(--color-text-secondary)" }}>AUD ${pTotal}</div>
                          <div style={{ fontSize:11, color:"var(--color-text-secondary)" }}>{pPays.length} payment{pPays.length!==1?"s":""}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment rows */}
                  {pPays.length > 0 && <div style={{ ...sep, margin:"0 1rem" }}></div>}
                  {pPays.map((pay, i) => (
                    <div key={pay.id} style={{ padding:"10px 1rem", borderBottom: i < pPays.length-1 ? "0.5px solid var(--color-border-tertiary)" : "none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <Badge type={pay.type} />
                        <span style={{ fontSize:12, color:"var(--color-text-secondary)" }}>{fmtDate(pay.date)}</span>
                        {pay.notes && <span style={{ fontSize:12, color:"var(--color-text-secondary)" }}>· {pay.notes}</span>}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                        <span style={{ fontWeight:500, fontSize:14 }}>AUD ${pay.amount}</span>
                        <button onClick={() => removePayment(pay.id)} aria-label="Remove payment"
                          style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-text-secondary)", padding:0, lineHeight:1 }}>
                          <i className="ti ti-trash" style={{ fontSize:14 }} aria-hidden></i>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Log payment form */}
                  {logging ? (
                    <div style={{ padding:"1rem", background:"var(--color-background-secondary)", borderTop:"0.5px solid var(--color-border-tertiary)" }}>
                      <div style={{ fontSize:13, fontWeight:500, marginBottom:12, color:"var(--color-text-secondary)" }}>Log payment for {player.name}</div>
                      <Field label="Payment type">
                        <select value={payForm.type} onChange={e => setPayForm({...payForm, type:e.target.value})} style={iStyle}>
                          {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </Field>
                      <div style={{ display:"flex", gap:10 }}>
                        <div style={{ flex:1 }}>
                          <Field label="Amount (AUD)">
                            <input type="number" placeholder="0.00" autoFocus value={payForm.amount}
                              onChange={e => setPayForm({...payForm, amount:e.target.value})} style={iStyle} />
                          </Field>
                        </div>
                        <div style={{ flex:1 }}>
                          <Field label="Date">
                            <input type="date" value={payForm.date}
                              onChange={e => setPayForm({...payForm, date:e.target.value})} style={iStyle} />
                          </Field>
                        </div>
                      </div>
                      <Field label="Notes (optional)">
                        <input placeholder="Any extra info" value={payForm.notes}
                          onChange={e => setPayForm({...payForm, notes:e.target.value})} style={iStyle} />
                      </Field>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={() => setLogFor(null)} style={{ flex:1 }}>Cancel</button>
                        <button onClick={logPayment} style={{ flex:2, fontWeight:500 }}>Save payment ↗</button>
                      </div>
                    </div>

                  /* Inline delete confirm */
                  ) : confirm ? (
                    <div style={{ padding:"12px 1rem", background:"var(--color-background-danger)", borderTop:"0.5px solid var(--color-border-danger)", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                      <span style={{ fontSize:13, color:"var(--color-text-danger)" }}>Remove {player.name} and all their payments?</span>
                      <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                        <button onClick={() => setConfirmPlayer(null)} style={{ padding:"6px 14px", fontSize:13 }}>Keep</button>
                        <button onClick={() => removePlayer(player.id)} style={{ padding:"6px 14px", fontSize:13, color:"var(--color-text-danger)", border:"0.5px solid var(--color-border-danger)" }}>Remove</button>
                      </div>
                    </div>

                  /* Action buttons */
                  ) : (
                    <div style={{ padding:"0.75rem 1rem", borderTop:"0.5px solid var(--color-border-tertiary)", display:"flex", gap:8 }}>
                      <button onClick={() => openLog(player.id)} style={{ flex:1, minHeight:44, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                        <i className="ti ti-plus" style={{ fontSize:15 }} aria-hidden></i> Log payment
                      </button>
                      <button onClick={() => setConfirmPlayer(player.id)} aria-label={`Remove ${player.name}`}
                        style={{ color:"var(--color-text-danger)", border:"0.5px solid var(--color-border-danger)", padding:"0 16px", minHeight:44 }}>
                        <i className="ti ti-user-minus" style={{ fontSize:16 }} aria-hidden></i>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add player */}
            {addingPlayer ? (
              <div style={{ ...card, padding:"1rem" }}>
                <div style={{ fontWeight:500, fontSize:15, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                  <i className="ti ti-user-plus" style={{ fontSize:18, color:"var(--color-text-info)" }} aria-hidden></i>
                  Add new player
                </div>
                <Field label="Full name *">
                  <input placeholder="e.g. Iftekhar Bhai" autoFocus value={pForm.name}
                    onChange={e => setPForm({...pForm, name:e.target.value})}
                    onKeyDown={e => { if(e.key==="Enter") addPlayer(); }}
                    style={iStyle} />
                </Field>
                <Field label="Phone number (optional)">
                  <input placeholder="+61 ..." value={pForm.phone}
                    onChange={e => setPForm({...pForm, phone:e.target.value})}
                    onKeyDown={e => { if(e.key==="Enter") addPlayer(); }}
                    style={iStyle} />
                </Field>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { setAddingPlayer(false); setPForm({ name:"", phone:"" }); }} style={{ flex:1 }}>Cancel</button>
                  <button onClick={addPlayer} style={{ flex:2, fontWeight:500 }}>Add player ↗</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingPlayer(true)} style={{ width:"100%", minHeight:52, borderStyle:"dashed", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:14 }}>
                <i className="ti ti-user-plus" style={{ fontSize:16 }} aria-hidden></i> Add player
              </button>
            )}
          </>
        )}

        {/* ───── EXPENSES ───── */}
        {tab === "expenses" && (
          <>
            {expenses.length === 0 && !addingExp && (
              <div style={{ textAlign:"center", padding:"3rem 0", color:"var(--color-text-secondary)" }}>
                <i className="ti ti-receipt" style={{ fontSize:42, display:"block", marginBottom:10 }} aria-hidden></i>
                <div style={{ fontSize:14 }}>No group expenses yet</div>
              </div>
            )}

            {expenses.length > 0 && (
              <div style={{ ...card, marginBottom:12 }}>
                {expenses.map((exp, i) => (
                  <div key={exp.id} style={{ padding:"12px 1rem", borderBottom: i < expenses.length-1 ? "0.5px solid var(--color-border-tertiary)" : "none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: exp.notes ? 4 : 0 }}>
                        <Badge type={exp.type} />
                        <span style={{ fontSize:13, color:"var(--color-text-secondary)" }}>{fmtDate(exp.date)}</span>
                      </div>
                      {exp.notes && <div style={{ fontSize:12, color:"var(--color-text-secondary)" }}>{exp.notes}</div>}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                      <span style={{ fontWeight:500, fontSize:15 }}>AUD ${exp.amount}</span>
                      <button onClick={() => removeExpense(exp.id)} aria-label="Remove expense"
                        style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-text-secondary)", padding:0, lineHeight:1 }}>
                        <i className="ti ti-trash" style={{ fontSize:14 }} aria-hidden></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {expenses.length > 0 && (
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 1rem", background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:"var(--border-radius-md)", marginBottom:12 }}>
                <span style={{ fontSize:14, color:"var(--color-text-secondary)" }}>Total expenses</span>
                <span style={{ fontWeight:500, fontSize:16, color:"var(--color-text-warning)" }}>AUD ${totalOut}</span>
              </div>
            )}

            {addingExp ? (
              <div style={{ ...card, padding:"1rem" }}>
                <div style={{ fontWeight:500, fontSize:15, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                  <i className="ti ti-receipt-2" style={{ fontSize:18, color:"var(--color-text-warning)" }} aria-hidden></i>
                  Add group expense
                </div>
                <Field label="Expense type">
                  <select value={expForm.type} onChange={e => setExpForm({...expForm, type:e.target.value})} style={iStyle}>
                    {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <Field label="Amount (AUD)">
                      <input type="number" placeholder="0.00" autoFocus value={expForm.amount}
                        onChange={e => setExpForm({...expForm, amount:e.target.value})} style={iStyle} />
                    </Field>
                  </div>
                  <div style={{ flex:1 }}>
                    <Field label="Date">
                      <input type="date" value={expForm.date}
                        onChange={e => setExpForm({...expForm, date:e.target.value})} style={iStyle} />
                    </Field>
                  </div>
                </div>
                <Field label="Notes (optional)">
                  <input placeholder="e.g. paid on 18th June" value={expForm.notes}
                    onChange={e => setExpForm({...expForm, notes:e.target.value})} style={iStyle} />
                </Field>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { setAddingExp(false); setExpForm({ type:"Court Fee", amount:"", date:todayStr(), notes:"" }); }} style={{ flex:1 }}>Cancel</button>
                  <button onClick={addExpense} style={{ flex:2, fontWeight:500 }}>Save expense ↗</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingExp(true)} style={{ width:"100%", minHeight:52, borderStyle:"dashed", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:14 }}>
                <i className="ti ti-plus" style={{ fontSize:16 }} aria-hidden></i> Add group expense
              </button>
            )}
          </>
        )}

        {/* ───── HISTORY ───── */}
        {tab === "history" && (
          <>
            {allTxns.length === 0 ? (
              <div style={{ textAlign:"center", padding:"3rem 0", color:"var(--color-text-secondary)" }}>
                <i className="ti ti-history" style={{ fontSize:42, display:"block", marginBottom:10 }} aria-hidden></i>
                <div style={{ fontSize:14 }}>No transactions yet</div>
              </div>
            ) : (
              <>
                <button onClick={copySummary} style={{ width:"100%", minHeight:48, marginBottom:16, display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:14, fontWeight:500, ...(copied ? { color:"var(--color-text-success)", border:"0.5px solid var(--color-border-success)" } : {}) }}>
                  <i className={`ti ${copied ? "ti-circle-check" : "ti-copy"}`} style={{ fontSize:16 }} aria-hidden></i>
                  {copied ? "Copied! Paste it into WhatsApp" : "Copy summary for WhatsApp"}
                </button>

                {Object.entries(byDate).map(([date, txns]) => (
                  <div key={date} style={{ marginBottom:16 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                      {fmtDateLong(date)}
                    </div>
                    <div style={{ ...card }}>
                      {txns.map((t, i) => (
                        <div key={t.id} style={{ padding:"11px 1rem", borderBottom: i < txns.length-1 ? "0.5px solid var(--color-border-tertiary)" : "none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom: t.notes ? 3 : 0 }}>
                              <span style={{ fontWeight:500, fontSize:14, whiteSpace:"nowrap" }}>{t.who}</span>
                              <Badge type={t.type} />
                            </div>
                            {t.notes && <div style={{ fontSize:12, color:"var(--color-text-secondary)" }}>{t.notes}</div>}
                          </div>
                          <div style={{ fontWeight:500, fontSize:15, flexShrink:0, color: t.dir==="in" ? "var(--color-text-success)" : "var(--color-text-warning)" }}>
                            {t.dir==="in" ? "+" : "−"} AUD ${t.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Summary footer */}
                <div style={{ background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:"var(--border-radius-lg)", padding:"1rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:13, color:"var(--color-text-secondary)" }}>Total in</span>
                    <span style={{ fontWeight:500, color:"var(--color-text-success)" }}>AUD ${totalIn}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                    <span style={{ fontSize:13, color:"var(--color-text-secondary)" }}>Total out</span>
                    <span style={{ fontWeight:500, color:"var(--color-text-warning)" }}>AUD ${totalOut}</span>
                  </div>
                  <div style={{ ...sep, marginBottom:12 }}></div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                    <span style={{ fontWeight:500, fontSize:15 }}>Balance</span>
                    <span style={{ fontWeight:500, fontSize:22, color: balance>=0 ? "var(--color-text-success)" : "var(--color-text-danger)" }}>AUD ${balance}</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <div style={{ height:32 }}></div>
      </div>
    </div>
  );
}
