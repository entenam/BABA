import { useState, useEffect } from "react";

const STORAGE_KEY = "badminton_season10";
const genId = () => Math.random().toString(36).slice(2, 9);
const todayStr = () => new Date().toISOString().slice(0, 10);
const sum = arr => arr.reduce((s, x) => s + Number(x.amount), 0);
const initials = name => name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
const fmtDate = d => { if (!d) return ""; const [y,m,day] = d.split("-"); return `${parseInt(day)} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]}`; };
const fmtDateFull = d => { if (!d) return ""; const [y,m,day] = d.split("-"); return `${parseInt(day)} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]} ${y}`; };

const PAYMENT_TYPES = ["Contribution Fee", "Shuttlecock", "Court Fee", "Other"];

const PLAYER_COLORS = [
  { border:"#3b82f6", avatarBg:"#dbeafe", avatarFg:"#1d4ed8", btnBg:"#eff6ff", btnFg:"#1d4ed8" },
  { border:"#22c55e", avatarBg:"#dcfce7", avatarFg:"#15803d", btnBg:"#f0fdf4", btnFg:"#15803d" },
  { border:"#a855f7", avatarBg:"#f3e8ff", avatarFg:"#7e22ce", btnBg:"#faf5ff", btnFg:"#7e22ce" },
  { border:"#f97316", avatarBg:"#ffedd5", avatarFg:"#c2410c", btnBg:"#fff7ed", btnFg:"#c2410c" },
  { border:"#06b6d4", avatarBg:"#cffafe", avatarFg:"#0e7490", btnBg:"#ecfeff", btnFg:"#0e7490" },
  { border:"#ec4899", avatarBg:"#fce7f3", avatarFg:"#be185d", btnBg:"#fdf2f8", btnFg:"#be185d" },
  { border:"#eab308", avatarBg:"#fef9c3", avatarFg:"#a16207", btnBg:"#fefce8", btnFg:"#a16207" },
];

const TYPE_CFG = {
  "Contribution Fee": { bg:"#dbeafe", fg:"#1d4ed8", emoji:"💰" },
  "Shuttlecock":      { bg:"#dcfce7", fg:"#15803d", emoji:"🏸" },
  "Court Fee":        { bg:"#fef3c7", fg:"#92400e", emoji:"🏟️" },
  "Other":            { bg:"#f3f4f6", fg:"#374151", emoji:"📌" },
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

const inp = { width:"100%", boxSizing:"border-box", padding:"10px 12px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, fontFamily:"system-ui", background:"white", color:"#1e293b", outline:"none" };
const btn = { padding:"10px 16px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"white", cursor:"pointer", fontSize:14, fontFamily:"system-ui", color:"#334155", fontWeight:500 };
const btnPrimary = { ...btn, background:"#1e3a6b", color:"white", border:"none" };
const btnDanger  = { ...btn, color:"#dc2626", border:"1.5px solid #fecaca", background:"#fff5f5" };

function Badge({ type }) {
  const c = TYPE_CFG[type] || TYPE_CFG["Other"];
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:c.bg, color:c.fg, fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>{c.emoji} {type}</span>;
}

function Avatar({ name, colorIdx }) {
  const c = PLAYER_COLORS[colorIdx % PLAYER_COLORS.length];
  return <div style={{ width:46, height:46, borderRadius:"50%", background:c.avatarBg, color:c.avatarFg, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:15, flexShrink:0 }}>{initials(name)}</div>;
}

function PayForm({ form, setForm, onSave, onCancel, saveLabel }) {
  return (
    <div style={{ padding:"1rem", background:"#eff6ff", borderTop:"2px solid #bfdbfe" }}>
      <div style={{ marginBottom:10 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" }}>Payment type</div>
        <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={inp}>
          {PAYMENT_TYPES.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:10 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" }}>Amount (AUD)</div>
          <input type="number" placeholder="0.00" autoFocus value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} style={inp} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" }}>Date</div>
          <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inp} />
        </div>
      </div>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" }}>Notes (optional)</div>
        <input placeholder="e.g. transferred via bank" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={inp} />
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onCancel} style={{ ...btn, flex:1 }}>Cancel</button>
        <button onClick={onSave} style={{ ...btnPrimary, flex:2 }}>{saveLabel} ↗</button>
      </div>
    </div>
  );
}

export default function App() {
  const [data,    setData]    = useState(null);
  const [tab,     setTab]     = useState("players");
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const [copied,  setCopied]  = useState(false);

  const [addingPlayer,    setAddingPlayer]    = useState(false);
  const [pForm,           setPForm]           = useState({ name:"", phone:"" });
  const [confirmPlayerId, setConfirmPlayerId] = useState(null);

  const [logFor,  setLogFor]  = useState(null);
  const [payForm, setPayForm] = useState({ type:"Contribution Fee", amount:"", date:todayStr(), notes:"" });

  const [editPayId,    setEditPayId]    = useState(null);
  const [editPayFrm,   setEditPayFrm]   = useState({ type:"Contribution Fee", amount:"", date:"", notes:"" });
  const [confirmPayId, setConfirmPayId] = useState(null);

  const [addingExp,    setAddingExp]    = useState(false);
  const [expForm,      setExpForm]      = useState({ type:"Court Fee", amount:"", date:todayStr(), notes:"" });
  const [editExpId,    setEditExpId]    = useState(null);
  const [editExpFrm,   setEditExpFrm]   = useState({ type:"Court Fee", amount:"", date:"", notes:"" });
  const [confirmExpId, setConfirmExpId] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [targetFee,    setTargetFee]    = useState("50");

  useEffect(() => {
    (async () => {
      try {
        const r = localStorage.getItem(STORAGE_KEY);
	setData(r ? JSON.parse(r) : INITIAL);
        if (!d.settings) d.settings = { contributionTarget:50 };
        setData(d);
        setTargetFee(String(d.settings.contributionTarget||50));
      } catch { setData(INITIAL); }
      setLoading(false);
    })();
  }, []);

  const persist = async (d) => {
    setData(d);
    setSaveMsg("Saving…");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
      setSaveMsg("Saved ✓");
      setTimeout(()=>setSaveMsg(""),1500);
    } catch { setSaveMsg("Failed"); }
  };

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"70vh", gap:12, color:"#64748b", fontFamily:"system-ui" }}>
      <div style={{ fontSize:40 }}>🏸</div>
      <div style={{ fontSize:14 }}>Loading Season 10…</div>
    </div>
  );

  const { players, payments, expenses, settings } = data;
  const target    = Number(settings?.contributionTarget)||0;
  const pPays     = pid => payments.filter(p=>p.playerId===pid);
  const pTotal    = pid => sum(pPays(pid));
  const hasCF     = pid => pPays(pid).some(p=>p.type==="Contribution Fee"&&(target===0||p.amount>=target));
  const paidCount = players.filter(p=>hasCF(p.id)).length;
  const totalIn   = sum(payments);
  const totalOut  = sum(expenses);
  const balance   = totalIn - totalOut;

  const addPlayer = () => {
    if (!pForm.name.trim()) return;
    persist({ ...data, players:[...players,{id:genId(),name:pForm.name.trim(),phone:pForm.phone.trim()}] });
    setAddingPlayer(false); setPForm({name:"",phone:""});
  };
  const removePlayer = id => {
    persist({ ...data, players:players.filter(p=>p.id!==id), payments:payments.filter(p=>p.playerId!==id) });
    setConfirmPlayerId(null);
  };
  const openLog = pid => {
    setLogFor(pid); setEditPayId(null); setConfirmPlayerId(null);
    setPayForm({ type:"Contribution Fee", amount:target?String(target):"", date:todayStr(), notes:"" });
  };
  const logPayment = () => {
    if (!payForm.amount||!logFor) return;
    persist({ ...data, payments:[...payments,{id:genId(),playerId:logFor,type:payForm.type,amount:parseFloat(payForm.amount),date:payForm.date,notes:payForm.notes}] });
    setLogFor(null);
  };
  const startEditPay = pay => {
    setEditPayId(pay.id);
    setEditPayFrm({ type:pay.type, amount:String(pay.amount), date:pay.date, notes:pay.notes||"" });
    setConfirmPayId(null); setLogFor(null);
  };
  const saveEditPay = () => {
    if (!editPayFrm.amount) return;
    persist({ ...data, payments:payments.map(p=>p.id===editPayId?{...p,type:editPayFrm.type,amount:parseFloat(editPayFrm.amount),date:editPayFrm.date,notes:editPayFrm.notes}:p) });
    setEditPayId(null);
  };
  const deletePayment = id => { persist({...data,payments:payments.filter(p=>p.id!==id)}); setConfirmPayId(null); };

  const addExpense = () => {
    if (!expForm.amount) return;
    persist({ ...data, expenses:[...expenses,{id:genId(),type:expForm.type,amount:parseFloat(expForm.amount),date:expForm.date,notes:expForm.notes}] });
    setAddingExp(false); setExpForm({type:"Court Fee",amount:"",date:todayStr(),notes:""});
  };
  const startEditExp = exp => {
    setEditExpId(exp.id);
    setEditExpFrm({ type:exp.type, amount:String(exp.amount), date:exp.date, notes:exp.notes||"" });
    setConfirmExpId(null);
  };
  const saveEditExp = () => {
    if (!editExpFrm.amount) return;
    persist({ ...data, expenses:expenses.map(e=>e.id===editExpId?{...e,type:editExpFrm.type,amount:parseFloat(editExpFrm.amount),date:editExpFrm.date,notes:editExpFrm.notes}:e) });
    setEditExpId(null);
  };
  const deleteExpense = id => { persist({...data,expenses:expenses.filter(e=>e.id!==id)}); setConfirmExpId(null); };

  const saveSettings = () => {
    persist({ ...data, settings:{...settings,contributionTarget:parseFloat(targetFee)||0} });
    setShowSettings(false);
  };

  const copySummary = async () => {
    const today = new Date().toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"});
    const txt = [
      `🏸 Season 10 — Payment Summary (${today})`,``,
      `Players (${paidCount}/${players.length} contributed):`,
      ...players.map(p=>`${hasCF(p.id)?"✅":"⏳"} ${p.name}: AUD $${pTotal(p.id)}`),``,
      ...(expenses.length?[`Group Expenses:`,...expenses.map(e=>`• ${e.type}: AUD $${e.amount}`),``]:[]),
      `Collected: AUD $${totalIn}  |  Expenses: AUD $${totalOut}  |  Balance: AUD $${balance}`,
    ].join("\n");
    try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(()=>setCopied(false),2500); } catch {}
  };

  const allTxns = [
    ...payments.map(p=>({...p,who:players.find(pl=>pl.id===p.playerId)?.name||"Unknown",dir:"in"})),
    ...expenses.map(e=>({...e,who:"Group",dir:"out"})),
  ].sort((a,b)=>b.date.localeCompare(a.date));
  const byDate = allTxns.reduce((acc,t)=>{ (acc[t.date]=acc[t.date]||[]).push(t); return acc; },{});

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", minHeight:"100vh", background:"#f1f5f9", color:"#1e293b" }}>

      {/* ── HEADER ── */}
      <div style={{ background:"linear-gradient(135deg,#0f1e33 0%,#1a3a6b 100%)", color:"white", padding:"1.5rem 1rem 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.25rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:50, height:50, borderRadius:14, background:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>🏸</div>
            <div>
              <div style={{ fontWeight:700, fontSize:22, letterSpacing:"-0.3px" }}>Season 10</div>
              <div style={{ fontSize:12, opacity:0.55, marginTop:2 }}>Badminton Group Tracker · {players.length} players</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {saveMsg && <span style={{ fontSize:11, opacity:0.55 }}>{saveMsg}</span>}
            <button onClick={()=>setShowSettings(!showSettings)} title="Settings"
              style={{ background:"rgba(255,255,255,0.1)", border:"none", borderRadius:10, width:38, height:38, cursor:"pointer", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center" }}>⚙️</button>
          </div>
        </div>

        {showSettings && (
          <div style={{ background:"rgba(0,0,0,0.25)", borderRadius:14, padding:"1rem", marginBottom:"1rem" }}>
            <div style={{ color:"white", fontWeight:600, marginBottom:10 }}>⚙️ Season Settings</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Contribution fee target (AUD)</div>
            <div style={{ display:"flex", gap:8 }}>
              <input type="number" value={targetFee} onChange={e=>setTargetFee(e.target.value)} style={{ ...inp, maxWidth:130 }} />
              <button onClick={()=>setShowSettings(false)} style={btn}>Cancel</button>
              <button onClick={saveSettings} style={btnPrimary}>Save</button>
            </div>
          </div>
        )}

        {/* Stat pills */}
        <div style={{ display:"flex", gap:8, marginBottom:"1rem", overflowX:"auto", paddingBottom:2 }}>
          {[
            { label:"Collected", val:`AUD $${totalIn}`,  color:"#4ade80" },
            { label:"Expenses",  val:`AUD $${totalOut}`, color:"#fbbf24" },
            { label:"Balance",   val:`AUD $${balance}`,  color:balance>=0?"#4ade80":"#f87171" },
            { label:"Paid in",   val:`${paidCount}/${players.length}`, color:"#60a5fa" },
          ].map(s=>(
            <div key={s.label} style={{ background:"rgba(255,255,255,0.08)", borderRadius:12, padding:"12px 16px", flexShrink:0, minWidth:100 }}>
              <div style={{ fontWeight:700, fontSize:18, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:11, opacity:0.5, marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          {[["players","👥 Players"],["expenses","🧾 Expenses"],["history","📋 History"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{
              background:"none", border:"none", color:tab===id?"white":"rgba(255,255,255,0.45)",
              padding:"12px 16px", cursor:"pointer", fontSize:13, fontWeight:tab===id?600:400,
              borderBottom:tab===id?"2px solid #60a5fa":"2px solid transparent", marginBottom:-1
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding:"1rem", maxWidth:600, margin:"0 auto" }}>

        {/* ── PLAYERS ── */}
        {tab==="players" && (
          <>
            {players.map((player, pi) => {
              const pc   = PLAYER_COLORS[pi % PLAYER_COLORS.length];
              const pays = pPays(player.id);
              const tot  = pTotal(player.id);
              const paid = hasCF(player.id);
              const isLogging        = logFor === player.id;
              const isConfirmRemove  = confirmPlayerId === player.id;

              return (
                <div key={player.id} style={{ background:"white", borderRadius:18, marginBottom:16, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.08)", borderLeft:`5px solid ${pc.border}` }}>

                  {/* Player header */}
                  <div style={{ padding:"1rem 1rem 1rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <Avatar name={player.name} colorIdx={pi} />
                      <div>
                        <div style={{ fontWeight:700, fontSize:17 }}>{player.name}</div>
                        {player.phone && <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{player.phone}</div>}
                        <div style={{ marginTop:6 }}>
                          {paid
                            ? <span style={{ fontSize:11, background:"#dcfce7", color:"#15803d", padding:"3px 10px", borderRadius:20, fontWeight:600 }}>✅ Contribution paid</span>
                            : <span style={{ fontSize:11, background:"#fef3c7", color:"#92400e", padding:"3px 10px", borderRadius:20, fontWeight:600 }}>⏳ Pending{target?` · AUD $${target}`:""}</span>
                          }
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:800, fontSize:24, color:tot>0?"#16a34a":"#cbd5e1", letterSpacing:"-0.5px" }}>AUD ${tot}</div>
                      <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{pays.length} payment{pays.length!==1?"s":""}</div>
                    </div>
                  </div>

                  {/* Payments */}
                  {pays.length > 0 && (
                    <div style={{ borderTop:"1px solid #f1f5f9" }}>
                      {pays.map((pay,i) => {
                        const isEdit    = editPayId === pay.id;
                        const isConfirm = confirmPayId === pay.id;
                        const bb = i<pays.length-1 ? "1px solid #f1f5f9" : "none";

                        if (isEdit) return (
                          <div key={pay.id} style={{ borderBottom:bb }}>
                            <PayForm form={editPayFrm} setForm={setEditPayFrm} onSave={saveEditPay} onCancel={()=>setEditPayId(null)} saveLabel="Save changes" />
                          </div>
                        );

                        if (isConfirm) return (
                          <div key={pay.id} style={{ padding:"12px 1rem", background:"#fff5f5", borderBottom:bb, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                            <span style={{ fontSize:13, color:"#dc2626", fontWeight:500 }}>Delete this payment?</span>
                            <div style={{ display:"flex", gap:8 }}>
                              <button onClick={()=>setConfirmPayId(null)} style={{ ...btn, padding:"6px 14px", fontSize:13 }}>Keep</button>
                              <button onClick={()=>deletePayment(pay.id)} style={{ ...btnDanger, padding:"6px 14px", fontSize:13 }}>Delete</button>
                            </div>
                          </div>
                        );

                        return (
                          <div key={pay.id} style={{ padding:"10px 1rem", borderBottom:bb, display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                              <Badge type={pay.type} />
                              <span style={{ fontSize:12, color:"#64748b" }}>{fmtDate(pay.date)}</span>
                              {pay.notes && <span style={{ fontSize:12, color:"#94a3b8" }}>· {pay.notes}</span>}
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                              <span style={{ fontWeight:700, fontSize:15 }}>AUD ${pay.amount}</span>
                              <button onClick={()=>startEditPay(pay)} title="Edit this payment"
                                style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✏️</button>
                              <button onClick={()=>{setConfirmPayId(pay.id);setEditPayId(null);}} title="Delete this payment"
                                style={{ background:"#fff5f5", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>🗑️</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Log payment form */}
                  {isLogging && (
                    <PayForm form={payForm} setForm={setPayForm} onSave={logPayment} onCancel={()=>setLogFor(null)} saveLabel="Save payment" />
                  )}

                  {/* Delete player confirm */}
                  {isConfirmRemove && !isLogging && (
                    <div style={{ padding:"12px 1rem", background:"#fff5f5", borderTop:"1px solid #fecaca", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                      <span style={{ fontSize:13, color:"#dc2626", fontWeight:500 }}>Remove {player.name} and all payments?</span>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>setConfirmPlayerId(null)} style={{ ...btn, padding:"6px 14px", fontSize:13 }}>Keep</button>
                        <button onClick={()=>removePlayer(player.id)} style={{ ...btnDanger, padding:"6px 14px", fontSize:13 }}>Remove</button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!isLogging && !isConfirmRemove && (
                    <div style={{ padding:"10px 1rem", borderTop:"1px solid #f1f5f9", display:"flex", gap:8 }}>
                      <button onClick={()=>openLog(player.id)}
                        style={{ ...btn, flex:1, background:pc.btnBg, color:pc.btnFg, border:"none", fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                        + Log Payment
                      </button>
                      <button onClick={()=>{setConfirmPlayerId(player.id);setLogFor(null);}}
                        style={{ ...btnDanger, padding:"10px 14px" }}>Remove</button>
                    </div>
                  )}
                </div>
              );
            })}

            {addingPlayer ? (
              <div style={{ background:"white", borderRadius:18, padding:"1.25rem", marginBottom:16, boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:14 }}>👤 Add new player</div>
                <div style={{ fontSize:11, fontWeight:700, color:"#64748b", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Full name *</div>
                <input placeholder="e.g. Iftekhar Bhai" autoFocus value={pForm.name} onChange={e=>setPForm({...pForm,name:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addPlayer()} style={{ ...inp, marginBottom:12 }} />
                <div style={{ fontSize:11, fontWeight:700, color:"#64748b", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Phone (optional)</div>
                <input placeholder="+61 ..." value={pForm.phone} onChange={e=>setPForm({...pForm,phone:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addPlayer()} style={{ ...inp, marginBottom:14 }} />
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>{setAddingPlayer(false);setPForm({name:"",phone:""}); }} style={{ ...btn, flex:1 }}>Cancel</button>
                  <button onClick={addPlayer} style={{ ...btnPrimary, flex:2 }}>Add Player ↗</button>
                </div>
              </div>
            ) : (
              <button onClick={()=>setAddingPlayer(true)} style={{ width:"100%", minHeight:54, border:"2px dashed #cbd5e1", background:"transparent", borderRadius:16, cursor:"pointer", color:"#64748b", fontSize:14, fontWeight:500 }}>
                + Add Player
              </button>
            )}
          </>
        )}

        {/* ── EXPENSES ── */}
        {tab==="expenses" && (
          <>
            {expenses.length===0 && !addingExp && (
              <div style={{ textAlign:"center", padding:"3rem 0", color:"#94a3b8" }}>
                <div style={{ fontSize:48, marginBottom:10 }}>🧾</div>
                <div style={{ fontSize:15 }}>No group expenses yet</div>
              </div>
            )}

            {expenses.length > 0 && (
              <div style={{ background:"white", borderRadius:18, marginBottom:14, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
                {expenses.map((exp,i) => {
                  const isEdit    = editExpId === exp.id;
                  const isConfirm = confirmExpId === exp.id;
                  const bb = i<expenses.length-1 ? "1px solid #f1f5f9" : "none";

                  if (isEdit) return (
                    <div key={exp.id} style={{ borderBottom:bb }}>
                      <PayForm form={editExpFrm} setForm={setEditExpFrm} onSave={saveEditExp} onCancel={()=>setEditExpId(null)} saveLabel="Save changes" />
                    </div>
                  );

                  if (isConfirm) return (
                    <div key={exp.id} style={{ padding:"12px 1rem", background:"#fff5f5", borderBottom:bb, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                      <span style={{ fontSize:13, color:"#dc2626", fontWeight:500 }}>Delete this expense?</span>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>setConfirmExpId(null)} style={{ ...btn, padding:"6px 14px", fontSize:13 }}>Keep</button>
                        <button onClick={()=>deleteExpense(exp.id)} style={{ ...btnDanger, padding:"6px 14px", fontSize:13 }}>Delete</button>
                      </div>
                    </div>
                  );

                  return (
                    <div key={exp.id} style={{ padding:"14px 1rem", borderBottom:bb, display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:exp.notes?5:0 }}>
                          <Badge type={exp.type} />
                          <span style={{ fontSize:12, color:"#64748b" }}>{fmtDate(exp.date)}</span>
                        </div>
                        {exp.notes && <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{exp.notes}</div>}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                        <span style={{ fontWeight:700, fontSize:16 }}>AUD ${exp.amount}</span>
                        <button onClick={()=>startEditExp(exp)} title="Edit"
                          style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✏️</button>
                        <button onClick={()=>{setConfirmExpId(exp.id);setEditExpId(null);}} title="Delete"
                          style={{ background:"#fff5f5", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {expenses.length > 0 && (
              <div style={{ background:"white", borderRadius:14, padding:"14px 1rem", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                <span style={{ color:"#64748b", fontWeight:500 }}>Total expenses</span>
                <span style={{ fontWeight:800, fontSize:20, color:"#d97706" }}>AUD ${totalOut}</span>
              </div>
            )}

            {addingExp ? (
              <div style={{ background:"white", borderRadius:18, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
                <div style={{ padding:"1rem 1rem 0", fontWeight:700, fontSize:16 }}>🧾 Add group expense</div>
                <PayForm form={expForm} setForm={setExpForm} onSave={addExpense}
                  onCancel={()=>{setAddingExp(false);setExpForm({type:"Court Fee",amount:"",date:todayStr(),notes:""}); }}
                  saveLabel="Save expense" />
              </div>
            ) : (
              <button onClick={()=>setAddingExp(true)} style={{ width:"100%", minHeight:54, border:"2px dashed #cbd5e1", background:"transparent", borderRadius:16, cursor:"pointer", color:"#64748b", fontSize:14, fontWeight:500 }}>
                + Add Group Expense
              </button>
            )}
          </>
        )}

        {/* ── HISTORY ── */}
        {tab==="history" && (
          <>
            {allTxns.length===0 ? (
              <div style={{ textAlign:"center", padding:"3rem 0", color:"#94a3b8" }}>
                <div style={{ fontSize:48, marginBottom:10 }}>📋</div>
                <div style={{ fontSize:15 }}>No transactions yet</div>
              </div>
            ) : (
              <>
                <button onClick={copySummary} style={{ ...btn, width:"100%", marginBottom:16, minHeight:48, display:"flex", alignItems:"center", justifyContent:"center", gap:8, ...(copied?{background:"#dcfce7",color:"#15803d",border:"1.5px solid #86efac"}:{}) }}>
                  {copied ? "✅ Copied! Paste into WhatsApp" : "📋 Copy summary for WhatsApp"}
                </button>

                {Object.entries(byDate).map(([date,txns])=>(
                  <div key={date} style={{ marginBottom:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>{fmtDateFull(date)}</div>
                    <div style={{ background:"white", borderRadius:16, overflow:"hidden", boxShadow:"0 2px 6px rgba(0,0,0,0.06)" }}>
                      {txns.map((t,i)=>(
                        <div key={t.id} style={{ padding:"13px 1rem", borderBottom:i<txns.length-1?"1px solid #f1f5f9":"none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                          <div>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:t.notes?3:0, flexWrap:"wrap" }}>
                              <span style={{ fontWeight:600, fontSize:14 }}>{t.who}</span>
                              <Badge type={t.type} />
                            </div>
                            {t.notes && <div style={{ fontSize:12, color:"#94a3b8" }}>{t.notes}</div>}
                          </div>
                          <div style={{ fontWeight:700, fontSize:16, flexShrink:0, color:t.dir==="in"?"#16a34a":"#d97706" }}>
                            {t.dir==="in"?"+":"−"} AUD ${t.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ background:"linear-gradient(135deg,#0f1e33 0%,#1a3a6b 100%)", borderRadius:18, padding:"1.25rem 1.5rem", color:"white" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ opacity:0.65, fontSize:13 }}>Total collected</span>
                    <span style={{ color:"#4ade80", fontWeight:600, fontSize:15 }}>AUD ${totalIn}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                    <span style={{ opacity:0.65, fontSize:13 }}>Total expenses</span>
                    <span style={{ color:"#fbbf24", fontWeight:600, fontSize:15 }}>AUD ${totalOut}</span>
                  </div>
                  <div style={{ borderTop:"1px solid rgba(255,255,255,0.15)", paddingTop:14, display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                    <span style={{ fontWeight:600, fontSize:16 }}>Balance</span>
                    <span style={{ fontWeight:800, fontSize:28, color:balance>=0?"#4ade80":"#f87171", letterSpacing:"-0.5px" }}>AUD ${balance}</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <div style={{ height:32 }} />
      </div>
    </div>
  );
}
