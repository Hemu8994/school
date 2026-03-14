import { useState, useEffect, useRef } from "react";

// ─── Data & Constants ───────────────────────────────────────────────────────
const CLASSES = ["Form 1A","Form 1B","Form 2A","Form 2B","Form 3A","Form 3B","Form 4A","Form 4B"];
const CONTRIBUTION_TYPES = [
  { id:1, name:"Michango ya Maendeleo", nameEn:"Development Fund", amount:50000, icon:"🏗️", color:"#00C9A7" },
  { id:2, name:"Chakula cha Wasomi", nameEn:"Students Meals", amount:30000, icon:"🍽️", color:"#FFB347" },
  { id:3, name:"Vitabu vya Maktaba", nameEn:"Library Books", amount:15000, icon:"📚", color:"#4FC3F7" },
  { id:4, name:"Sare ya Michezo", nameEn:"Sports Uniform", amount:25000, icon:"⚽", color:"#FF6B6B" },
  { id:5, name:"Ziara za Elimu", nameEn:"Education Tours", amount:40000, icon:"🚌", color:"#B39DDB" },
  { id:6, name:"Matukio ya Shule", nameEn:"School Events", amount:20000, icon:"🎭", color:"#80CBC4" },
];

const SAMPLE_STUDENTS = [
  { id:1, name:"Amina Juma Hassan", class:"Form 1A", parentPhone:"0712345678", paid:["1","2"], balance:65000 },
  { id:2, name:"Brian Mwangi Odhiambo", class:"Form 2B", parentPhone:"0723456789", paid:["3"], balance:130000 },
  { id:3, name:"Salma Abdallah Kipanga", class:"Form 3A", parentPhone:"0734567890", paid:["1","2","3","4"], balance:30000 },
  { id:4, name:"David Moshi Kilimanjaro", class:"Form 4A", parentPhone:"0745678901", paid:[], balance:180000 },
  { id:5, name:"Fatuma Rashid Ally", class:"Form 1B", parentPhone:"0756789012", paid:["2","5"], balance:105000 },
  { id:6, name:"Emmanuel Chacha Nyamwezi", class:"Form 2A", parentPhone:"0767890123", paid:["1","3","6"], balance:95000 },
];

const TRANSACTIONS = [
  { id:1, student:"Amina Juma Hassan", class:"Form 1A", type:"Michango ya Maendeleo", amount:50000, date:"2025-03-10", method:"M-Pesa", status:"completed" },
  { id:2, student:"Amina Juma Hassan", class:"Form 1A", type:"Chakula cha Wasomi", amount:30000, date:"2025-03-08", method:"M-Pesa", status:"completed" },
  { id:3, student:"Brian Mwangi Odhiambo", class:"Form 2B", type:"Vitabu vya Maktaba", amount:15000, date:"2025-03-07", method:"Tigo Pesa", status:"completed" },
  { id:4, student:"Salma Abdallah Kipanga", class:"Form 3A", type:"Sare ya Michezo", amount:25000, date:"2025-03-05", method:"Cash", status:"completed" },
  { id:5, student:"Emmanuel Chacha Nyamwezi", class:"Form 2A", type:"Matukio ya Shule", amount:20000, date:"2025-03-03", method:"M-Pesa", status:"pending" },
];

const FMT = n => "TZS " + Number(n).toLocaleString();

// ─── Micro Components ────────────────────────────────────────────────────────
const Badge = ({ color, children }) => (
  <span style={{
    background: color + "22", color, border: `1px solid ${color}44`,
    borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700, letterSpacing:.5
  }}>{children}</span>
);

const Card = ({ children, style={}, className="" }) => (
  <div className={className} style={{
    background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)",
    borderRadius:18, padding:24, backdropFilter:"blur(10px)", ...style
  }}>{children}</div>
);

const StatCard = ({ icon, label, value, sub, color, delay=0 }) => (
  <div style={{
    background:`linear-gradient(135deg, ${color}18 0%, rgba(255,255,255,0.03) 100%)`,
    border:`1px solid ${color}33`, borderRadius:20, padding:"22px 26px",
    animation:`fadeUp 0.5s ease ${delay}s both`
  }}>
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
      <div style={{ background:color+"22", borderRadius:12, padding:10, fontSize:22 }}>{icon}</div>
      <span style={{ color:"#aaa", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
    </div>
    <div style={{ fontSize:26, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif" }}>{value}</div>
    {sub && <div style={{ color:color, fontSize:12, marginTop:4 }}>{sub}</div>}
  </div>
);

const Pill = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    background: active ? "linear-gradient(135deg,#00C9A7,#0097ff)" : "rgba(255,255,255,0.06)",
    color: active ? "#fff" : "#888", border:"none", borderRadius:100,
    padding:"8px 20px", cursor:"pointer", fontWeight:600, fontSize:13,
    transition:"all .2s", fontFamily:"'DM Sans',sans-serif"
  }}>{children}</button>
);

// ─── Payment Modal ───────────────────────────────────────────────────────────
const PaymentModal = ({ student, contribs, onClose, onPay }) => {
  const [selected, setSelected] = useState(null);
  const [method, setMethod] = useState("M-Pesa");
  const [phone, setPhone] = useState(student?.parentPhone || "");
  const [step, setStep] = useState(1); // 1=select, 2=confirm, 3=success

  const unpaid = contribs.filter(c => !student.paid.includes(String(c.id)));

  if (!student) return null;
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.8)", backdropFilter:"blur(8px)",
      zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:"#0f1923", border:"1px solid rgba(255,255,255,.12)", borderRadius:24,
        padding:32, width:"100%", maxWidth:460, animation:"fadeUp .3s ease"
      }}>
        {step === 1 && <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif" }}>Lipa Mchango</div>
              <div style={{ color:"#888", fontSize:13 }}>Pay Contribution — {student.name}</div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.08)", border:"none", color:"#fff", borderRadius:10, padding:"6px 12px", cursor:"pointer", fontSize:18 }}>✕</button>
          </div>
          <div style={{ fontSize:12, color:"#00C9A7", fontWeight:700, marginBottom:12, letterSpacing:1 }}>CHAGUA MCHANGO / SELECT CONTRIBUTION</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {unpaid.length === 0
              ? <div style={{ textAlign:"center", color:"#888", padding:30 }}>✅ Mwanafunzi amelipa michango yote!</div>
              : unpaid.map(c => (
                <div key={c.id} onClick={() => setSelected(c)} style={{
                  border:`2px solid ${selected?.id===c.id ? c.color : "rgba(255,255,255,.1)"}`,
                  borderRadius:14, padding:"14px 18px", cursor:"pointer", transition:"all .2s",
                  background: selected?.id===c.id ? c.color+"15" : "rgba(255,255,255,.03)",
                  display:"flex", alignItems:"center", justifyContent:"space-between"
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:22 }}>{c.icon}</span>
                    <div>
                      <div style={{ color:"#fff", fontWeight:700, fontSize:14 }}>{c.name}</div>
                      <div style={{ color:"#888", fontSize:12 }}>{c.nameEn}</div>
                    </div>
                  </div>
                  <div style={{ color:c.color, fontWeight:800, fontSize:15 }}>{FMT(c.amount)}</div>
                </div>
              ))
            }
          </div>
          {unpaid.length > 0 && <>
            <div style={{ fontSize:12, color:"#00C9A7", fontWeight:700, marginBottom:10, letterSpacing:1 }}>NJIA YA MALIPO / PAYMENT METHOD</div>
            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              {["M-Pesa","Tigo Pesa","Airtel Money","Cash"].map(m => (
                <Pill key={m} active={method===m} onClick={() => setMethod(m)}>{m}</Pill>
              ))}
            </div>
            {method !== "Cash" && <>
              <div style={{ fontSize:12, color:"#aaa", marginBottom:6 }}>Nambari ya Simu / Phone Number</div>
              <input value={phone} onChange={e => setPhone(e.target.value)} style={{
                width:"100%", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.15)",
                borderRadius:12, padding:"12px 16px", color:"#fff", fontSize:15, marginBottom:20,
                fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box"
              }} placeholder="07XXXXXXXX" />
            </>}
            <button onClick={() => selected && setStep(2)} style={{
              width:"100%", background: selected ? "linear-gradient(135deg,#00C9A7,#0097ff)" : "rgba(255,255,255,.1)",
              border:"none", borderRadius:14, padding:"15px", color:"#fff",
              fontWeight:800, fontSize:16, cursor: selected ? "pointer" : "not-allowed",
              fontFamily:"'Syne',sans-serif", transition:"all .2s"
            }}>Endelea → Continue</button>
          </>}
        </>}

        {step === 2 && selected && <>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:40, marginBottom:10 }}>{selected.icon}</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif" }}>Thibitisha Malipo</div>
            <div style={{ color:"#888", fontSize:13 }}>Confirm Payment</div>
          </div>
          <div style={{ background:"rgba(255,255,255,.05)", borderRadius:16, padding:20, marginBottom:20 }}>
            {[
              ["Mwanafunzi / Student", student.name],
              ["Mchango / Contribution", selected.name],
              ["Kiasi / Amount", FMT(selected.amount)],
              ["Njia / Method", method],
              phone && ["Simu / Phone", phone],
            ].filter(Boolean).map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                <span style={{ color:"#888", fontSize:13 }}>{k}</span>
                <span style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setStep(1)} style={{
              flex:1, background:"rgba(255,255,255,.08)", border:"none", borderRadius:14,
              padding:15, color:"#fff", fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif"
            }}>← Rudi / Back</button>
            <button onClick={() => { onPay(student, selected, method, phone); setStep(3); }} style={{
              flex:2, background:"linear-gradient(135deg,#00C9A7,#0097ff)", border:"none",
              borderRadius:14, padding:15, color:"#fff", fontWeight:800, fontSize:15,
              cursor:"pointer", fontFamily:"'Syne',sans-serif"
            }}>💳 Lipa Sasa / Pay Now</button>
          </div>
        </>}

        {step === 3 && <>
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:60, marginBottom:16, animation:"bounce .5s ease" }}>✅</div>
            <div style={{ fontSize:22, fontWeight:800, color:"#00C9A7", fontFamily:"'Syne',sans-serif", marginBottom:8 }}>Malipo Yamekamilika!</div>
            <div style={{ color:"#888", fontSize:15, marginBottom:6 }}>Payment Successful</div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:18 }}>{FMT(selected?.amount)}</div>
            <div style={{ color:"#888", fontSize:13, marginTop:6 }}>{selected?.name}</div>
            <button onClick={onClose} style={{
              marginTop:24, background:"linear-gradient(135deg,#00C9A7,#0097ff)", border:"none",
              borderRadius:14, padding:"12px 40px", color:"#fff", fontWeight:800,
              cursor:"pointer", fontFamily:"'Syne',sans-serif", fontSize:15
            }}>Funga / Close</button>
          </div>
        </>}
      </div>
    </div>
  );
};

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
  { id:"dashboard", icon:"📊", label:"Dashibodi", sub:"Dashboard" },
  { id:"contributions", icon:"💰", label:"Michango", sub:"Contributions" },
  { id:"students", icon:"👨‍🎓", label:"Wanafunzi", sub:"Students" },
  { id:"payments", icon:"💳", label:"Malipo", sub:"Payments" },
  { id:"management", icon:"⚙️", label:"Usimamizi", sub:"Management" },
];

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [students, setStudents] = useState(SAMPLE_STUDENTS);
  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const [contribs, setContribs] = useState(CONTRIBUTION_TYPES);
  const [payModal, setPayModal] = useState(null);
  const [classFilter, setClassFilter] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [newContrib, setNewContrib] = useState({ name:"", nameEn:"", amount:"", icon:"📌", color:"#00C9A7" });
  const [showAddContrib, setShowAddContrib] = useState(false);

  const totalExpected = students.length * contribs.reduce((s,c) => s+c.amount, 0);
  const totalPaid = transactions.filter(t=>t.status==="completed").reduce((s,t)=>s+t.amount,0);
  const paidStudents = students.filter(s => s.paid.length === contribs.length).length;

  const handlePay = (student, contrib, method, phone) => {
    setStudents(prev => prev.map(s =>
      s.id === student.id ? { ...s, paid:[...s.paid, String(contrib.id)], balance: s.balance - contrib.amount } : s
    ));
    setTransactions(prev => [{
      id: prev.length+1, student: student.name, class: student.class,
      type: contrib.name, amount: contrib.amount,
      date: new Date().toISOString().split("T")[0], method, status:"completed"
    }, ...prev]);
  };

  const filteredStudents = students.filter(s =>
    (classFilter === "All" || s.class === classFilter) &&
    (s.name.toLowerCase().includes(searchQ.toLowerCase()))
  );

  const addContrib = () => {
    if (!newContrib.name || !newContrib.amount) return;
    setContribs(prev => [...prev, { ...newContrib, id: prev.length+1, amount: Number(newContrib.amount) }]);
    setNewContrib({ name:"", nameEn:"", amount:"", icon:"📌", color:"#00C9A7" });
    setShowAddContrib(false);
  };

  return (
    <div style={{
      minHeight:"100vh", background:"#080f17",
      fontFamily:"'DM Sans',sans-serif", color:"#fff",
      backgroundImage:`
        radial-gradient(ellipse 80% 40% at 20% 0%, rgba(0,201,167,.08) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0,151,255,.08) 0%, transparent 60%)
      `
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:#333; border-radius:10px; }
        input, select { outline:none; }
        * { box-sizing:border-box; }
      `}</style>

      {/* Header */}
      <div style={{
        padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom:"1px solid rgba(255,255,255,.07)", background:"rgba(8,15,23,.9)",
        backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:100
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:42, height:42, borderRadius:12,
            background:"linear-gradient(135deg,#00C9A7,#0097ff)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20, fontWeight:900, fontFamily:"'Syne',sans-serif"
          }}>FM</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, lineHeight:1.2 }}>Felix Mrema Secondary School</div>
            <div style={{ color:"#00C9A7", fontSize:11, fontWeight:600, letterSpacing:.5 }}>SCHOOL MANAGEMENT SYSTEM · ARUSHA, TANZANIA</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Badge color="#00C9A7">Mwaka 2025</Badge>
          <Badge color="#0097ff">Admin</Badge>
        </div>
      </div>

      <div style={{ display:"flex", minHeight:"calc(100vh - 73px)" }}>
        {/* Sidebar */}
        <div style={{
          width:220, padding:"24px 14px", borderRight:"1px solid rgba(255,255,255,.06)",
          display:"flex", flexDirection:"column", gap:6, flexShrink:0
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
              background: tab===t.id ? "linear-gradient(135deg,rgba(0,201,167,.2),rgba(0,151,255,.2))" : "transparent",
              border: tab===t.id ? "1px solid rgba(0,201,167,.3)" : "1px solid transparent",
              borderRadius:12, cursor:"pointer", color: tab===t.id ? "#fff" : "#666",
              transition:"all .2s", textAlign:"left"
            }}>
              <span style={{ fontSize:18 }}>{t.icon}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:13, fontFamily:"'Syne',sans-serif" }}>{t.label}</div>
                <div style={{ fontSize:10, color: tab===t.id ? "#00C9A7" : "#444" }}>{t.sub}</div>
              </div>
            </button>
          ))}

          <div style={{ marginTop:"auto", padding:"14px", background:"rgba(0,201,167,.08)", borderRadius:14, border:"1px solid rgba(0,201,167,.2)" }}>
            <div style={{ fontSize:11, color:"#00C9A7", fontWeight:700, marginBottom:6 }}>MKURUGENZI / PRINCIPAL</div>
            <div style={{ fontSize:13, fontWeight:700 }}>Felix Mrema</div>
            <div style={{ fontSize:11, color:"#666" }}>Secondary School</div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex:1, padding:"28px 32px", overflowY:"auto" }}>

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <div>
              <div style={{ marginBottom:28 }}>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, margin:0 }}>Karibu, Admin! 👋</h1>
                <p style={{ color:"#666", margin:"4px 0 0", fontSize:14 }}>Muhtasari wa Shule · School Overview</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:28 }}>
                <StatCard icon="👨‍🎓" label="Jumla Wanafunzi / Total Students" value={students.length} sub={`${paidStudents} wamelipa kamili`} color="#00C9A7" delay={0} />
                <StatCard icon="💰" label="Jumla Inayotarajiwa / Expected" value={FMT(totalExpected)} sub="Michango yote" color="#0097ff" delay={.1} />
                <StatCard icon="✅" label="Jumla Iliyolipwa / Collected" value={FMT(totalPaid)} sub={`${Math.round(totalPaid/totalExpected*100)}% ya lengo`} color="#FFB347" delay={.2} />
                <StatCard icon="⏳" label="Bado Kulipwa / Remaining" value={FMT(totalExpected-totalPaid)} sub="Inangoja kukusanywa" color="#FF6B6B" delay={.3} />
              </div>

              {/* Progress */}
              <Card style={{ marginBottom:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16 }}>Maendeleo ya Ukusanyaji · Collection Progress</div>
                  <Badge color="#00C9A7">{Math.round(totalPaid/totalExpected*100)}%</Badge>
                </div>
                <div style={{ background:"rgba(255,255,255,.08)", borderRadius:100, height:12, overflow:"hidden", marginBottom:16 }}>
                  <div style={{
                    width:`${Math.round(totalPaid/totalExpected*100)}%`, height:"100%",
                    background:"linear-gradient(90deg,#00C9A7,#0097ff)", borderRadius:100,
                    transition:"width 1s ease"
                  }}/>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
                  {CLASSES.map(cl => {
                    const cls = students.filter(s=>s.class===cl);
                    const clsTotal = cls.reduce((s,st) => s+st.paid.length*contribs[0]?.amount||0, 0);
                    const fullyPaid = cls.filter(s=>s.paid.length===contribs.length).length;
                    return (
                      <div key={cl} style={{ background:"rgba(255,255,255,.04)", borderRadius:12, padding:"12px 14px" }}>
                        <div style={{ fontSize:12, fontWeight:700, color:"#888", marginBottom:4 }}>{cl}</div>
                        <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{cls.length} wanafunzi</div>
                        <div style={{ fontSize:11, color:"#00C9A7" }}>{fullyPaid} kamili</div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, marginBottom:16 }}>Malipo ya Hivi Karibuni · Recent Payments</div>
                {transactions.slice(0,5).map(t => (
                  <div key={t.id} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,.05)"
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:40, height:40, background:"rgba(0,201,167,.15)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
                        {contribs.find(c=>c.name===t.type)?.icon || "💳"}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700 }}>{t.student}</div>
                        <div style={{ fontSize:11, color:"#888" }}>{t.type} · {t.class}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:800, color:"#00C9A7" }}>{FMT(t.amount)}</div>
                      <Badge color={t.status==="completed"?"#00C9A7":"#FFB347"}>{t.status==="completed"?"Imekamilika":"Inasubiri"}</Badge>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* ── CONTRIBUTIONS ── */}
          {tab === "contributions" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <div>
                  <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, margin:0 }}>Aina za Michango</h1>
                  <p style={{ color:"#666", fontSize:14, margin:"4px 0 0" }}>Contribution Types Management</p>
                </div>
                <button onClick={() => setShowAddContrib(!showAddContrib)} style={{
                  background:"linear-gradient(135deg,#00C9A7,#0097ff)", border:"none",
                  borderRadius:12, padding:"10px 20px", color:"#fff", fontWeight:700, cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif"
                }}>+ Ongeza Mchango</button>
              </div>

              {showAddContrib && (
                <Card style={{ marginBottom:20, border:"1px solid rgba(0,201,167,.3)" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, marginBottom:16 }}>Mchango Mpya · New Contribution</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    {[
                      ["Jina (Kiswahili)", "name", "Michango ya..."],
                      ["Name (English)", "nameEn", "Fund name..."],
                      ["Kiasi (TZS) / Amount", "amount", "50000"],
                      ["Ikoni / Icon", "icon", "📌"],
                    ].map(([label, key, ph]) => (
                      <div key={key}>
                        <div style={{ fontSize:11, color:"#888", marginBottom:6 }}>{label}</div>
                        <input value={newContrib[key]} onChange={e => setNewContrib(p=>({...p,[key]:e.target.value}))}
                          placeholder={ph} style={{
                            width:"100%", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)",
                            borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14
                          }}/>
                      </div>
                    ))}
                  </div>
                  <button onClick={addContrib} style={{
                    marginTop:16, background:"linear-gradient(135deg,#00C9A7,#0097ff)", border:"none",
                    borderRadius:12, padding:"10px 24px", color:"#fff", fontWeight:700, cursor:"pointer"
                  }}>Hifadhi · Save</button>
                </Card>
              )}

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
                {contribs.map(c => {
                  const paid = transactions.filter(t=>t.type===c.name&&t.status==="completed");
                  const collected = paid.reduce((s,t)=>s+t.amount,0);
                  return (
                    <div key={c.id} style={{
                      background:`linear-gradient(135deg, ${c.color}12, rgba(255,255,255,.03))`,
                      border:`1px solid ${c.color}33`, borderRadius:20, padding:22,
                      animation:"fadeUp .4s ease both"
                    }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                        <div style={{ fontSize:32 }}>{c.icon}</div>
                        <Badge color={c.color}>{FMT(c.amount)}</Badge>
                      </div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, marginBottom:2 }}>{c.name}</div>
                      <div style={{ color:"#888", fontSize:12, marginBottom:14 }}>{c.nameEn}</div>
                      <div style={{ background:"rgba(255,255,255,.06)", borderRadius:100, height:6, overflow:"hidden", marginBottom:8 }}>
                        <div style={{ width:`${Math.min(100,Math.round(collected/(c.amount*students.length||1)*100))}%`, height:"100%", background:c.color, borderRadius:100 }}/>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                        <span style={{ color:"#888" }}>{paid.length} walilipa</span>
                        <span style={{ color:c.color, fontWeight:700 }}>{FMT(collected)} kukusanywa</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STUDENTS ── */}
          {tab === "students" && (
            <div>
              <div style={{ marginBottom:24 }}>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, margin:0 }}>Wanafunzi · Students</h1>
                <p style={{ color:"#666", fontSize:14, margin:"4px 0 0" }}>Manage student contributions & payments</p>
              </div>

              <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 Tafuta mwanafunzi... Search student..."
                  style={{
                    flex:1, minWidth:200, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)",
                    borderRadius:12, padding:"10px 16px", color:"#fff", fontSize:14
                  }}/>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {["All", ...CLASSES].map(cl => (
                    <Pill key={cl} active={classFilter===cl} onClick={() => setClassFilter(cl)}>{cl}</Pill>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {filteredStudents.map(s => {
                  const progress = Math.round(s.paid.length/contribs.length*100);
                  const remaining = contribs.filter(c=>!s.paid.includes(String(c.id)));
                  return (
                    <div key={s.id} style={{
                      background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)",
                      borderRadius:16, padding:"16px 20px", display:"flex", alignItems:"center",
                      gap:16, animation:"fadeUp .3s ease both"
                    }}>
                      <div style={{
                        width:46, height:46, borderRadius:12, flexShrink:0,
                        background:`linear-gradient(135deg,#00C9A7,#0097ff)`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontWeight:800, fontSize:16, fontFamily:"'Syne',sans-serif"
                      }}>{s.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>{s.name}</div>
                        <div style={{ fontSize:12, color:"#888" }}>{s.class} · 📱 {s.parentPhone}</div>
                        <div style={{ marginTop:8, background:"rgba(255,255,255,.06)", borderRadius:100, height:5, overflow:"hidden" }}>
                          <div style={{ width:`${progress}%`, height:"100%", background: progress===100 ? "#00C9A7" : "linear-gradient(90deg,#FFB347,#FF6B6B)", borderRadius:100 }}/>
                        </div>
                        <div style={{ fontSize:11, color:"#888", marginTop:4 }}>
                          {s.paid.length}/{contribs.length} michango · {progress}%
                        </div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ color:"#FF6B6B", fontWeight:800, fontSize:14 }}>Baki: {FMT(s.balance)}</div>
                        <div style={{ marginTop:6 }}>
                          {progress === 100
                            ? <Badge color="#00C9A7">✅ Kamili</Badge>
                            : <button onClick={() => setPayModal(s)} style={{
                                background:"linear-gradient(135deg,#00C9A7,#0097ff)", border:"none",
                                borderRadius:10, padding:"6px 14px", color:"#fff", fontWeight:700,
                                cursor:"pointer", fontSize:12, fontFamily:"'DM Sans',sans-serif"
                              }}>💳 Lipa</button>
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {tab === "payments" && (
            <div>
              <div style={{ marginBottom:24 }}>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, margin:0 }}>Historia ya Malipo · Payment History</h1>
                <p style={{ color:"#666", fontSize:14, margin:"4px 0 0" }}>All transactions across the school</p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
                {[
                  { label:"Jumla Malipo / Total Txns", value:transactions.length, color:"#0097ff" },
                  { label:"M-Pesa", value:transactions.filter(t=>t.method==="M-Pesa").length, color:"#00C9A7" },
                  { label:"Iliyokamilika / Completed", value:transactions.filter(t=>t.status==="completed").length, color:"#FFB347" },
                ].map(s => (
                  <div key={s.label} style={{
                    background:`${s.color}12`, border:`1px solid ${s.color}33`,
                    borderRadius:16, padding:"18px 20px"
                  }}>
                    <div style={{ fontSize:12, color:"#888", marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontSize:28, fontWeight:800, fontFamily:"'Syne',sans-serif", color:s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <Card>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid rgba(255,255,255,.08)" }}>
                        {["Mwanafunzi","Darasa","Mchango","Kiasi","Njia","Tarehe","Hali"].map(h => (
                          <th key={h} style={{ textAlign:"left", padding:"10px 12px", color:"#888", fontSize:11, fontWeight:700, letterSpacing:.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(t => (
                        <tr key={t.id} style={{ borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                          <td style={{ padding:"12px", fontSize:13, fontWeight:600 }}>{t.student}</td>
                          <td style={{ padding:"12px", fontSize:12, color:"#888" }}>{t.class}</td>
                          <td style={{ padding:"12px", fontSize:12, color:"#aaa" }}>{t.type}</td>
                          <td style={{ padding:"12px", fontSize:13, fontWeight:800, color:"#00C9A7" }}>{FMT(t.amount)}</td>
                          <td style={{ padding:"12px", fontSize:12 }}><Badge color="#0097ff">{t.method}</Badge></td>
                          <td style={{ padding:"12px", fontSize:12, color:"#888" }}>{t.date}</td>
                          <td style={{ padding:"12px" }}><Badge color={t.status==="completed"?"#00C9A7":"#FFB347"}>{t.status==="completed"?"✅ Kamili":"⏳ Inasubiri"}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ── MANAGEMENT ── */}
          {tab === "management" && (
            <div>
              <div style={{ marginBottom:24 }}>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, margin:0 }}>Usimamizi wa Shule · School Management</h1>
                <p style={{ color:"#666", fontSize:14, margin:"4px 0 0" }}>Configure school settings & reports</p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                {/* School Info */}
                <Card>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, marginBottom:16 }}>🏫 Taarifa za Shule · School Info</div>
                  {[
                    ["Jina la Shule", "Felix Mrema Secondary School"],
                    ["Mkoa / Region", "Arusha"],
                    ["Mwaka wa Masomo", "2025"],
                    ["Mkurugenzi", "Felix Mrema"],
                    ["Nambari ya Usajili", "S.1234/2005"],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                      <span style={{ color:"#888", fontSize:13 }}>{k}</span>
                      <span style={{ color:"#fff", fontWeight:600, fontSize:13 }}>{v}</span>
                    </div>
                  ))}
                </Card>

                {/* Summary Report */}
                <Card>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, marginBottom:16 }}>📊 Ripoti ya Michango · Contribution Report</div>
                  {contribs.map(c => {
                    const paid = transactions.filter(t=>t.type===c.name&&t.status==="completed");
                    const pct = Math.round(paid.length/students.length*100);
                    return (
                      <div key={c.id} style={{ marginBottom:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                          <span>{c.icon} {c.name}</span>
                          <span style={{ color:c.color }}>{paid.length}/{students.length} ({pct}%)</span>
                        </div>
                        <div style={{ background:"rgba(255,255,255,.06)", borderRadius:100, height:5 }}>
                          <div style={{ width:`${pct}%`, height:"100%", background:c.color, borderRadius:100 }}/>
                        </div>
                      </div>
                    );
                  })}
                </Card>

                {/* Madarasa */}
                <Card style={{ gridColumn:"1/-1" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, marginBottom:16 }}>🏷️ Madarasa Yote · All Classes Overview</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
                    {CLASSES.map(cl => {
                      const cls = students.filter(s=>s.class===cl);
                      const fullyPaid = cls.filter(s=>s.paid.length===contribs.length).length;
                      const pct = cls.length ? Math.round(fullyPaid/cls.length*100) : 0;
                      return (
                        <div key={cl} style={{
                          background:"rgba(255,255,255,.05)", borderRadius:14, padding:"16px",
                          border:"1px solid rgba(255,255,255,.08)", cursor:"pointer",
                          transition:"all .2s"
                        }} onClick={() => { setClassFilter(cl); setTab("students"); }}>
                          <div style={{ fontSize:12, color:"#888", marginBottom:4 }}>{cl}</div>
                          <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>{cls.length}</div>
                          <div style={{ fontSize:11, color:"#00C9A7" }}>wanafunzi</div>
                          <div style={{ margin:"10px 0 4px", background:"rgba(255,255,255,.07)", borderRadius:100, height:4 }}>
                            <div style={{ width:`${pct}%`, height:"100%", background:"#00C9A7", borderRadius:100 }}/>
                          </div>
                          <div style={{ fontSize:11, color:"#888" }}>{pct}% walilipa kamili</div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Actions */}
                <Card style={{ gridColumn:"1/-1" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, marginBottom:16 }}>⚡ Vitendo vya Haraka · Quick Actions</div>
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                    {[
                      { icon:"📤", label:"Hamisha Ripoti / Export Report", color:"#00C9A7" },
                      { icon:"📱", label:"Tuma SMS kwa Wazazi / Send SMS to Parents", color:"#0097ff" },
                      { icon:"🔔", label:"Ukumbusho / Send Reminders", color:"#FFB347" },
                      { icon:"📋", label:"Ripoti ya PDF / PDF Report", color:"#B39DDB" },
                      { icon:"💾", label:"Hifadhi Data / Backup Data", color:"#80CBC4" },
                    ].map(a => (
                      <button key={a.label} style={{
                        background:`${a.color}18`, border:`1px solid ${a.color}44`,
                        borderRadius:12, padding:"12px 18px", color:a.color,
                        fontWeight:700, cursor:"pointer", fontSize:13,
                        fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:8,
                        transition:"all .2s"
                      }}>{a.icon} {a.label}</button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Payment Modal */}
      {payModal && (
        <PaymentModal
          student={payModal}
          contribs={contribs}
          onClose={() => setPayModal(null)}
          onPay={(student, contrib, method, phone) => {
            handlePay(student, contrib, method, phone);
          }}
        />
      )}
    </div>
  );
}
