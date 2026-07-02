import React, { useState, useEffect, useMemo } from "react";
import {
  Home, Users, UserPlus, Inbox, Heart, ClipboardList, CalendarDays,
  MessageSquare, CheckCircle2, XCircle, AlertTriangle, Search, Plus,
  Pencil, Trash2, Phone, Send, Clock, MapPin, Globe, Award, Wallet,
  X, Check, Sparkles, ArrowRight, Building2, RotateCcw, ChevronRight,
  Star, UserCog, CalendarPlus, Ban,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Reference data                                                      */
/* ------------------------------------------------------------------ */
const CARE_TYPES = ["Elderly Care", "Infant Care", "Special Needs", "Post-Surgery", "Disabled Care", "Dementia Care"];
const LANGUAGES = ["English", "Mandarin", "Malay", "Tamil", "Cantonese", "Hokkien", "Tagalog"];
const REGIONS = ["Central", "North", "North-East", "East", "West"];
const CERTS = ["CPR/First Aid", "Nursing Aide", "Dementia Care Cert", "Infant Care Cert", "WSQ Healthcare"];
const LIVE = ["Live-in", "Live-out", "Both"];
const SCHEDULES = ["Full-time", "Part-time", "Weekends", "Nights"];
const DB_KEY = "cgmatch_db_v1";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const uid = (p) => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const daysFromNow = (d, h = 10) => { const t = new Date(); t.setDate(t.getDate() + d); t.setHours(h, 0, 0, 0); return t.toISOString(); };
const fmtDateTime = (iso) => new Date(iso).toLocaleString("en-SG", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const fmtTime = (iso) => new Date(iso).toLocaleString("en-SG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const isFuture = (iso) => new Date(iso).getTime() > Date.now();

/* ------------------------------------------------------------------ */
/* Storage (persists to the browser's localStorage on this machine)    */
/* ------------------------------------------------------------------ */
async function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* first run or storage unavailable */ }
  return null;
}
async function saveDB(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) { /* quota exceeded or storage unavailable \u2014 app still runs in-memory */ }
}

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */
function seed() {
  const matchers = [
    { id: "m1", name: "Priya Nair", phone: "+65 8123 4567" },
    { id: "m2", name: "Wei Ling Tan", phone: "+65 8234 5678" },
    { id: "m3", name: "Farah Ismail", phone: "+65 8345 6789" },
  ];
  const suppliers = [
    { id: "s1", name: "GoldenCare Supply", phone: "+65 6555 1200" },
    { id: "s2", name: "HomeAssist Partners", phone: "+65 6555 3400" },
  ];
  const bullets = [
    { id: "b1", name: "Rosa Santos", phone: "+65 9111 2222", careTypes: ["Elderly Care", "Dementia Care"], languages: ["English", "Tagalog"], experience: 8, location: "West", live: "Both", salary: 2800, certs: ["CPR/First Aid", "Dementia Care Cert"], matcherId: "m1", supplierId: "s1", status: "active", notes: "Warm, patient. Strong with mobility support after stroke.", slots: [{ id: uid("sl"), at: daysFromNow(3, 11), booked: false }, { id: uid("sl"), at: daysFromNow(5, 15), booked: false }], createdAt: daysFromNow(-20) },
    { id: "b2", name: "Mei Chen", phone: "+65 9222 3333", careTypes: ["Infant Care", "Elderly Care"], languages: ["Mandarin", "English", "Hokkien"], experience: 5, location: "Central", live: "Live-out", salary: 2600, certs: ["Infant Care Cert", "CPR/First Aid"], matcherId: "m2", supplierId: "s1", status: "active", notes: "Newborn specialist, sleep-training experience.", slots: [], createdAt: daysFromNow(-18) },
    { id: "b3", name: "Aisha Rahman", phone: "+65 9333 4444", careTypes: ["Special Needs", "Disabled Care"], languages: ["Malay", "English"], experience: 6, location: "East", live: "Live-in", salary: 3000, certs: ["Nursing Aide", "CPR/First Aid"], matcherId: "m3", supplierId: "s2", status: "active", notes: "Experience with autism and physical disability care.", slots: [], createdAt: daysFromNow(-15) },
    { id: "b4", name: "Devi Kumar", phone: "+65 9444 5555", careTypes: ["Post-Surgery", "Elderly Care"], languages: ["Tamil", "English"], experience: 10, location: "North-East", live: "Both", salary: 3200, certs: ["WSQ Healthcare", "CPR/First Aid"], matcherId: "m1", supplierId: "s2", status: "active", notes: "Ex-ward assistant. Excellent post-op wound care.", slots: [{ id: uid("sl"), at: daysFromNow(2, 14), booked: false }, { id: uid("sl"), at: daysFromNow(4, 10), booked: false }], createdAt: daysFromNow(-12) },
    { id: "b5", name: "Lily Wong", phone: "+65 9555 6666", careTypes: ["Elderly Care", "Dementia Care"], languages: ["Cantonese", "Mandarin", "English"], experience: 4, location: "Central", live: "Live-in", salary: 2500, certs: ["CPR/First Aid"], matcherId: "m2", supplierId: "s1", status: "active", notes: "Gentle, good rapport with dementia clients.", slots: [], createdAt: daysFromNow(-8) },
    { id: "b6", name: "Grace Lim", phone: "+65 9666 7777", careTypes: ["Infant Care"], languages: ["English", "Mandarin"], experience: 3, location: "North", live: "Live-out", salary: 2400, certs: ["Infant Care Cert"], matcherId: "m3", supplierId: "s2", status: "active", notes: "Energetic, first-time-parent friendly.", slots: [], createdAt: daysFromNow(-5) },
  ];
  const employers = [
    { id: "e1", name: "Tan Family", contact: "Mr. Kenneth Tan", phone: "+65 9012 3456", email: "ktan@example.com", recipient: "Mother, 78", conditions: "Post-stroke, limited mobility", careType: "Elderly Care", live: "Live-in", location: "West", languages: ["English", "Mandarin"], minExperience: 5, schedule: "Full-time", budget: 3000, startDate: daysFromNow(14), status: "green", flagReason: "", createdAt: daysFromNow(-6) },
    { id: "e2", name: "Sarah Lee", contact: "Sarah Lee", phone: "+65 9087 6543", email: "sarah.lee@example.com", recipient: "Newborn", conditions: "Healthy, first child", careType: "Infant Care", live: "Live-out", location: "Central", languages: ["English"], minExperience: 2, schedule: "Full-time", budget: 2800, startDate: daysFromNow(21), status: "pending", flagReason: "", createdAt: daysFromNow(-1) },
    { id: "e3", name: "Anonymous enquiry", contact: "—", phone: "+65 8000 0000", email: "n/a", recipient: "Adult, unspecified", conditions: "Vague / unverifiable requirements", careType: "Special Needs", live: "Live-in", location: "East", languages: ["English"], minExperience: 1, schedule: "Full-time", budget: 1500, startDate: daysFromNow(-3), status: "red", flagReason: "Budget far below market; care needs unverifiable; requested start date already passed.", createdAt: daysFromNow(-4) },
  ];
  const matches = [
    { id: "mt1", employerId: "e1", bulletId: "b1", score: 90, status: "proposed", slotId: null, createdAt: daysFromNow(-1) },
  ];
  const messages = [
    { id: uid("wa"), toRole: "Matcher", toName: "Priya Nair", phone: "+65 8123 4567", body: "New match ✅ Rosa Santos (90%) matched to the Tan Family (Elderly Care, West). Please coordinate an interview.", at: daysFromNow(-1, 9), matchId: "mt1" },
    { id: uid("wa"), toRole: "Employer", toName: "Tan Family", phone: "+65 9012 3456", body: "Good news! We found a caregiver matching your needs: Rosa Santos. Reply or tap the booking link to schedule an interview.", at: daysFromNow(-1, 9), matchId: "mt1" },
  ];
  return { matchers, suppliers, bullets, employers, matches, messages };
}

/* ------------------------------------------------------------------ */
/* Matching engine                                                     */
/* ------------------------------------------------------------------ */
function computeMatch(emp, b) {
  let score = 0; const reasons = []; const gaps = [];
  if (b.careTypes.includes(emp.careType)) { score += 30; reasons.push(`Provides ${emp.careType}`); }
  else gaps.push(`No ${emp.careType} experience listed`);

  if (b.live === "Both" || b.live === emp.live) { score += 20; reasons.push(`${emp.live} compatible`); }
  else gaps.push(`Prefers ${b.live}, employer wants ${emp.live}`);

  if (b.location === emp.location) { score += 15; reasons.push(`Based in ${emp.location}`); }
  else gaps.push(`In ${b.location}, employer in ${emp.location}`);

  const shared = b.languages.filter((l) => emp.languages.includes(l));
  if (shared.length) { score += 15; reasons.push(`Speaks ${shared.join(", ")}`); }
  else gaps.push("No shared language");

  if (b.experience >= emp.minExperience) { score += 10; reasons.push(`${b.experience} yrs experience`); }
  else gaps.push(`${b.experience} yrs (needs ${emp.minExperience})`);

  if (emp.budget >= b.salary) { score += 10; reasons.push(`Salary $${b.salary} within budget`); }
  else gaps.push(`Asks $${b.salary}, budget $${emp.budget}`);

  return { score, reasons, gaps };
}

/* ------------------------------------------------------------------ */
/* Tiny UI primitives                                                  */
/* ------------------------------------------------------------------ */
const cx = (...a) => a.filter(Boolean).join(" ");

function Badge({ tone = "slate", children, icon: Icon }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600", teal: "bg-teal-50 text-teal-700",
    emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700", sky: "bg-sky-50 text-sky-700",
  };
  return <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>{Icon && <Icon className="h-3 w-3" />}{children}</span>;
}

function Btn({ children, onClick, variant = "primary", size = "md", icon: Icon, disabled, className }) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-3.5 py-2 text-sm" };
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100",
    outline: "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    soft: "bg-teal-50 text-teal-700 hover:bg-teal-100",
    dangerSoft: "bg-rose-50 text-rose-700 hover:bg-rose-100",
    successSoft: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  };
  return <button onClick={onClick} disabled={disabled} className={cx(base, sizes[size], variants[variant], className)}>{Icon && <Icon className="h-4 w-4" />}{children}</button>;
}

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
  </label>
);
const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100";
const Input = (p) => <input {...p} className={inputCls} />;
const Select = ({ options, ...p }) => <select {...p} className={inputCls}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;

function ChipGroup({ options, value, onToggle }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o);
        return <button key={o} onClick={() => onToggle(o)} className={cx("rounded-full px-2.5 py-1 text-xs font-medium transition", on ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{o}</button>;
      })}
    </div>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={cx("my-8 w-full rounded-2xl bg-white shadow-xl", wide ? "max-w-3xl" : "max-w-xl")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

function ScoreRing({ score }) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  const tone = score >= 70 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-400";
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" stroke="currentColor" className="text-slate-100" />
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round" stroke="currentColor" strokeDasharray={c} strokeDashoffset={off} className={tone} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-slate-700">{score}<span className="text-xs text-slate-400">%</span></span>
      </div>
    </div>
  );
}

const Empty = ({ icon: Icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-14 text-center">
    <Icon className="mb-3 h-8 w-8 text-slate-300" />
    <p className="text-sm font-medium text-slate-600">{title}</p>
    {sub && <p className="mt-1 max-w-xs text-xs text-slate-400">{sub}</p>}
  </div>
);

const empStatus = { pending: { tone: "amber", label: "Pending review" }, green: { tone: "emerald", label: "Green-flagged" }, red: { tone: "rose", label: "Red-flagged" } };
const matchStatus = {
  proposed: { tone: "amber", label: "Match proposed" },
  interview_scheduled: { tone: "sky", label: "Interview booked" },
  hired: { tone: "emerald", label: "Hired – case closed" },
  closed: { tone: "slate", label: "Closed – no hire" },
};

/* ================================================================== */
/* App                                                                 */
/* ================================================================== */
export default function App() {
  const [db, setDb] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("dashboard");
  const [toast, setToast] = useState(null);

  useEffect(() => { (async () => { const d = await loadDB(); setDb(d || seed()); setLoaded(true); })(); }, []);
  useEffect(() => { if (loaded && db) saveDB(db); }, [db, loaded]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3200); return () => clearTimeout(t); }, [toast]);

  const notify = (msg, tone = "teal") => setToast({ msg, tone });

  /* --- lookups --- */
  const matcherName = (id) => db?.matchers.find((m) => m.id === id)?.name || "—";
  const supplierName = (id) => db?.suppliers.find((s) => s.id === id)?.name || "—";
  const bulletById = (id) => db?.bullets.find((b) => b.id === id);
  const employerById = (id) => db?.employers.find((e) => e.id === id);
  const openMatchForBullet = (bid) => db?.matches.find((m) => m.bulletId === bid && (m.status === "proposed" || m.status === "interview_scheduled"));

  /* --- WhatsApp simulation --- */
  const sendWA = (msgs, matchId) => setDb((d) => ({ ...d, messages: [...msgs.map((m) => ({ id: uid("wa"), at: new Date().toISOString(), matchId, ...m })), ...d.messages] }));

  /* --- actions --- */
  const addEmployer = (data) => { setDb((d) => ({ ...d, employers: [{ id: uid("e"), status: "pending", flagReason: "", createdAt: new Date().toISOString(), ...data }, ...d.employers] })); notify("Application received – pending review."); };

  const setFlag = (id, status, reason = "") => {
    setDb((d) => ({ ...d, employers: d.employers.map((e) => (e.id === id ? { ...e, status, flagReason: reason } : e)) }));
    notify(status === "green" ? "Employer green-flagged → ready for matching." : "Employer red-flagged and vetted out.", status === "green" ? "emerald" : "rose");
  };

  const saveBullet = (data, id) => {
    if (id) { setDb((d) => ({ ...d, bullets: d.bullets.map((b) => (b.id === id ? { ...b, ...data } : b)) })); notify("Bullet updated."); }
    else { setDb((d) => ({ ...d, bullets: [{ id: uid("b"), status: "active", slots: [], createdAt: new Date().toISOString(), ...data }, ...d.bullets] })); notify("Bullet added to CRM."); }
  };
  const deleteBullet = (id) => { setDb((d) => ({ ...d, bullets: d.bullets.filter((b) => b.id !== id) })); notify("Bullet deleted.", "rose"); };

  const proposeMatch = (emp, b, score) => {
    const matchId = uid("mt");
    setDb((d) => ({ ...d, matches: [{ id: matchId, employerId: emp.id, bulletId: b.id, score, status: "proposed", slotId: null, createdAt: new Date().toISOString() }, ...d.matches] }));
    sendWA([
      { toRole: "Matcher", toName: matcherName(b.matcherId), phone: db.matchers.find((m) => m.id === b.matcherId)?.phone, body: `New match ✅ ${b.name} (${score}%) matched to ${emp.name} (${emp.careType}, ${emp.location}). Please coordinate an interview.` },
      { toRole: "Employer", toName: emp.name, phone: emp.phone, body: `Good news! We found a caregiver matching your needs: ${b.name}. Reply or tap the booking link to schedule an interview.` },
    ], matchId);
    notify(`Match proposed → WhatsApp sent to matcher & employer.`, "emerald");
  };

  const bookInterview = (match, slotId) => {
    const b = bulletById(match.bulletId), emp = employerById(match.employerId);
    const slot = b.slots.find((s) => s.id === slotId);
    setDb((d) => ({
      ...d,
      matches: d.matches.map((m) => (m.id === match.id ? { ...m, status: "interview_scheduled", slotId } : m)),
      bullets: d.bullets.map((bb) => (bb.id === b.id ? { ...bb, slots: bb.slots.map((s) => (s.id === slotId ? { ...s, booked: true, employerId: emp.id, matchId: match.id } : s)) } : bb)),
    }));
    sendWA([
      { toRole: "Employer", toName: emp.name, phone: emp.phone, body: `Interview confirmed 🗓 ${b.name} on ${fmtDateTime(slot.at)}. See you then!` },
      { toRole: "Matcher", toName: matcherName(b.matcherId), phone: db.matchers.find((m) => m.id === b.matcherId)?.phone, body: `Interview booked: ${emp.name} × ${b.name} on ${fmtDateTime(slot.at)}.` },
    ], match.id);
    notify("Interview booked → confirmations sent.", "sky");
  };

  const confirmHire = (match) => {
    const b = bulletById(match.bulletId), emp = employerById(match.employerId);
    setDb((d) => ({
      ...d,
      matches: d.matches.map((m) => (m.id === match.id ? { ...m, status: "hired" } : m)),
      bullets: d.bullets.map((bb) => (bb.id === b.id ? { ...bb, status: "hired" } : bb)),
    }));
    sendWA([
      { toRole: "Employer", toName: emp.name, phone: emp.phone, body: `Hire confirmed 🎉 ${b.name} will start with you. Case closed – thank you for choosing us.` },
      { toRole: "Matcher", toName: matcherName(b.matcherId), phone: db.matchers.find((m) => m.id === b.matcherId)?.phone, body: `Case closed ✅ ${b.name} hired by ${emp.name}. Bullet removed from matching pool.` },
    ], match.id);
    notify(`${b.name} hired – removed from future matching.`, "emerald");
  };

  const closeCase = (match) => {
    setDb((d) => ({ ...d, matches: d.matches.map((m) => (m.id === match.id ? { ...m, status: "closed" } : m)) }));
    notify("Case closed – caregiver returned to the pool.");
  };

  const addSlot = (bid, iso) => { setDb((d) => ({ ...d, bullets: d.bullets.map((b) => (b.id === bid ? { ...b, slots: [...b.slots, { id: uid("sl"), at: iso, booked: false }] } : b)) })); notify("Availability slot added."); };

  const resetDemo = () => { if (confirm("Reset all data back to the demo sample? This cannot be undone.")) { const s = seed(); setDb(s); notify("Demo data restored."); } };

  if (!loaded || !db) {
    return <div className="flex h-screen items-center justify-center bg-stone-50 text-slate-400"><Heart className="mr-2 h-5 w-5 animate-pulse text-teal-400" /> Loading console…</div>;
  }

  /* --- derived counts --- */
  const counts = {
    pending: db.employers.filter((e) => e.status === "pending").length,
    green: db.employers.filter((e) => e.status === "green").length,
    red: db.employers.filter((e) => e.status === "red").length,
    active: db.bullets.filter((b) => b.status === "active").length,
    openCases: db.matches.filter((m) => m.status === "proposed" || m.status === "interview_scheduled").length,
    hires: db.matches.filter((m) => m.status === "hired").length,
  };

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "employers", label: "Employer intake", icon: Inbox, badge: counts.pending },
    { id: "crm", label: "Caregiver CRM", icon: ClipboardList },
    { id: "matching", label: "Matching", icon: Sparkles, badge: counts.green },
    { id: "cases", label: "Cases", icon: Heart, badge: counts.openCases },
    { id: "bookings", label: "Bookings", icon: CalendarDays },
    { id: "messages", label: "WhatsApp log", icon: MessageSquare },
  ];

  const shared = { db, notify, setView, matcherName, supplierName, bulletById, employerById, openMatchForBullet, counts };

  return (
    <div className="flex min-h-screen bg-stone-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white/80 p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white"><Heart className="h-5 w-5" /></div>
          <div>
            <p className="text-sm font-bold leading-tight text-slate-800">CareMatch</p>
            <p className="text-xs text-slate-400">Operations console</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} className={cx("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition", view === n.id ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100")}>
              <n.icon className="h-4 w-4" /><span className="flex-1 text-left">{n.label}</span>
              {n.badge > 0 && <span className={cx("rounded-full px-1.5 py-0.5 text-xs font-semibold", view === n.id ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600")}>{n.badge}</span>}
            </button>
          ))}
        </nav>
        <button onClick={resetDemo} className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"><RotateCcw className="h-3.5 w-3.5" /> Reset demo data</button>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Mobile top nav */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
          {nav.map((n) => <button key={n.id} onClick={() => setView(n.id)} className={cx("flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium", view === n.id ? "bg-teal-50 text-teal-700" : "text-slate-500")}><n.icon className="h-3.5 w-3.5" />{n.label}</button>)}
        </div>

        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
          {view === "dashboard" && <Dashboard {...shared} />}
          {view === "employers" && <Employers {...shared} addEmployer={addEmployer} setFlag={setFlag} />}
          {view === "crm" && <CRM {...shared} saveBullet={saveBullet} deleteBullet={deleteBullet} />}
          {view === "matching" && <Matching {...shared} proposeMatch={proposeMatch} />}
          {view === "cases" && <Cases {...shared} bookInterview={bookInterview} confirmHire={confirmHire} closeCase={closeCase} />}
          {view === "bookings" && <Bookings {...shared} addSlot={addSlot} />}
          {view === "messages" && <Messages {...shared} />}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2">
          <div className={cx("flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg",
            toast.tone === "emerald" ? "bg-emerald-600" : toast.tone === "rose" ? "bg-rose-600" : toast.tone === "sky" ? "bg-sky-600" : "bg-teal-600")}>
            <CheckCircle2 className="h-4 w-4" />{toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */
const PageHead = ({ eyebrow, title, sub, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-teal-600">{eyebrow}</p>
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </div>
    {action}
  </div>
);

/* ================================================================== */
/* Dashboard                                                           */
/* ================================================================== */
function Dashboard({ db, counts, setView, matcherName }) {
  const stat = (label, val, icon, tone, to) => (
    <button onClick={() => to && setView(to)} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-200 hover:shadow-sm">
      <div className={cx("flex h-11 w-11 items-center justify-center rounded-lg", tone)}>{icon}</div>
      <div><p className="text-2xl font-bold text-slate-800">{val}</p><p className="text-xs text-slate-500">{label}</p></div>
    </button>
  );
  const pipeline = [
    { label: "Applications pending", n: counts.pending, tone: "bg-amber-400" },
    { label: "Green-flagged", n: counts.green, tone: "bg-emerald-400" },
    { label: "Open cases", n: counts.openCases, tone: "bg-sky-400" },
    { label: "Hires closed", n: counts.hires, tone: "bg-teal-500" },
  ];
  const maxN = Math.max(1, ...pipeline.map((p) => p.n));

  return (
    <div>
      <PageHead eyebrow="Overview" title="Good day — here's your pipeline" sub="From application through to a confirmed hire." />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stat("Pending review", counts.pending, <Inbox className="h-5 w-5 text-amber-600" />, "bg-amber-50", "employers")}
        {stat("Green-flagged", counts.green, <CheckCircle2 className="h-5 w-5 text-emerald-600" />, "bg-emerald-50", "matching")}
        {stat("Active caregivers", counts.active, <Users className="h-5 w-5 text-teal-600" />, "bg-teal-50", "crm")}
        {stat("Open cases", counts.openCases, <Heart className="h-5 w-5 text-sky-600" />, "bg-sky-50", "cases")}
        {stat("Hires closed", counts.hires, <Star className="h-5 w-5 text-teal-600" />, "bg-teal-50", "cases")}
        {stat("Vetted out", counts.red, <Ban className="h-5 w-5 text-rose-600" />, "bg-rose-50", "employers")}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Pipeline snapshot</h3>
          <div className="space-y-3">
            {pipeline.map((p) => (
              <div key={p.label}>
                <div className="mb-1 flex justify-between text-xs text-slate-500"><span>{p.label}</span><span className="font-semibold text-slate-700">{p.n}</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className={cx("h-2 rounded-full", p.tone)} style={{ width: `${(p.n / maxN) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Recent WhatsApp activity</h3>
            <button onClick={() => setView("messages")} className="text-xs font-medium text-teal-600 hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {db.messages.slice(0, 4).map((m) => (
              <div key={m.id} className="flex gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50"><MessageSquare className="h-3.5 w-3.5 text-emerald-600" /></div>
                <div className="min-w-0"><p className="text-xs font-medium text-slate-700">To {m.toName} <span className="text-slate-400">· {m.toRole}</span></p><p className="truncate text-xs text-slate-500">{m.body}</p></div>
              </div>
            ))}
            {db.messages.length === 0 && <p className="text-xs text-slate-400">No messages yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Employer intake + vetting                                           */
/* ================================================================== */
function Employers({ db, addEmployer, setFlag, setView }) {
  const [open, setOpen] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [filter, setFilter] = useState("all");

  const list = db.employers.filter((e) => filter === "all" || e.status === filter);

  return (
    <div>
      <PageHead eyebrow="Employers" title="Employer intake & vetting"
        sub="New applications land here for review. Green-flag to send into matching; red-flag to vet out."
        action={<Btn icon={Plus} onClick={() => setOpen(true)}>New application</Btn>} />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {[["all", "All"], ["pending", "Pending"], ["green", "Green-flagged"], ["red", "Red-flagged"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={cx("rounded-full px-3 py-1 text-xs font-medium", filter === k ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}>{l}</button>
        ))}
      </div>

      {list.length === 0 ? <Empty icon={Inbox} title="No applications here" sub="New employer applications will appear in this list for review." /> : (
        <div className="space-y-3">
          {list.map((e) => <EmployerCard key={e.id} e={e} setFlag={setFlag} setRejecting={setRejecting} setView={setView} />)}
        </div>
      )}

      <IntakeModal open={open} onClose={() => setOpen(false)} onSubmit={(d) => { addEmployer(d); setOpen(false); }} />

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Red-flag & vet out">
        <p className="mb-3 text-sm text-slate-600">This employer will be excluded from matching. Record a reason for the audit trail.</p>
        <Field label="Reason"><textarea className={inputCls} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Budget below market, unverifiable requirements…" /></Field>
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="outline" onClick={() => setRejecting(null)}>Cancel</Btn>
          <Btn variant="danger" icon={Ban} onClick={() => { setFlag(rejecting.id, "red", reason || "No reason recorded"); setRejecting(null); setReason(""); }}>Red-flag</Btn>
        </div>
      </Modal>
    </div>
  );
}

function EmployerCard({ e, setFlag, setRejecting, setView }) {
  const s = empStatus[e.status];
  // auto-warnings to assist the vetter (advisory only)
  const warns = [];
  if (e.budget < 2200) warns.push("Budget looks below market rate");
  if (!isFuture(e.startDate)) warns.push("Requested start date has already passed");
  if (!e.languages.length) warns.push("No language preference given");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100"><Building2 className="h-5 w-5 text-slate-500" /></div>
          <div>
            <p className="font-semibold text-slate-800">{e.name}</p>
            <p className="text-xs text-slate-500">{e.contact} · {e.phone}</p>
          </div>
        </div>
        <Badge tone={s.tone}>{s.label}</Badge>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 sm:grid-cols-3">
        <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-slate-400" />{e.careType}</span>
        <span className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5 text-slate-400" />{e.live}</span>
        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{e.location}</span>
        <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-slate-400" />{e.languages.join(", ") || "—"}</span>
        <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-slate-400" />{e.minExperience}+ yrs</span>
        <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-slate-400" />${e.budget}/mo</span>
      </div>
      <p className="mb-3 text-xs text-slate-500"><span className="text-slate-400">Care recipient:</span> {e.recipient} — {e.conditions}</p>

      {e.status === "pending" && warns.length > 0 && (
        <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2">
          {warns.map((w) => <p key={w} className="flex items-center gap-1.5 text-xs text-amber-700"><AlertTriangle className="h-3.5 w-3.5" />{w}</p>)}
        </div>
      )}
      {e.status === "red" && e.flagReason && <div className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700"><span className="font-medium">Reason:</span> {e.flagReason}</div>}

      {e.status === "pending" && (
        <div className="flex gap-2">
          <Btn variant="successSoft" size="sm" icon={CheckCircle2} onClick={() => setFlag(e.id, "green")}>Green-flag</Btn>
          <Btn variant="dangerSoft" size="sm" icon={Ban} onClick={() => setRejecting(e)}>Red-flag</Btn>
        </div>
      )}
      {e.status === "green" && <Btn variant="soft" size="sm" icon={Sparkles} onClick={() => setView("matching")}>Find matches</Btn>}
    </div>
  );
}

function IntakeModal({ open, onClose, onSubmit }) {
  const blank = { name: "", contact: "", phone: "", email: "", recipient: "", conditions: "", careType: CARE_TYPES[0], live: LIVE[0], location: REGIONS[0], languages: [], minExperience: 2, schedule: SCHEDULES[0], budget: 2600, startDate: "" };
  const [f, setF] = useState(blank);
  useEffect(() => { if (open) setF(blank); }, [open]);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (k, v) => setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));
  const valid = f.name && f.phone && f.careType;

  return (
    <Modal open={open} onClose={onClose} title="New employer application" wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Employer / family name"><Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Tan Family" /></Field>
        <Field label="Contact person"><Input value={f.contact} onChange={(e) => set("contact", e.target.value)} placeholder="Mr. Kenneth Tan" /></Field>
        <Field label="Phone (WhatsApp)"><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+65 9012 3456" /></Field>
        <Field label="Email"><Input value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" /></Field>
        <Field label="Care recipient"><Input value={f.recipient} onChange={(e) => set("recipient", e.target.value)} placeholder="Mother, 78" /></Field>
        <Field label="Conditions / needs"><Input value={f.conditions} onChange={(e) => set("conditions", e.target.value)} placeholder="Post-stroke, limited mobility" /></Field>
        <Field label="Care type required"><Select options={CARE_TYPES} value={f.careType} onChange={(e) => set("careType", e.target.value)} /></Field>
        <Field label="Arrangement"><Select options={LIVE} value={f.live} onChange={(e) => set("live", e.target.value)} /></Field>
        <Field label="Region"><Select options={REGIONS} value={f.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Work schedule"><Select options={SCHEDULES} value={f.schedule} onChange={(e) => set("schedule", e.target.value)} /></Field>
        <Field label="Min. experience (years)"><Input type="number" value={f.minExperience} onChange={(e) => set("minExperience", +e.target.value)} /></Field>
        <Field label="Monthly budget (SGD)"><Input type="number" value={f.budget} onChange={(e) => set("budget", +e.target.value)} /></Field>
        <Field label="Preferred start date"><Input type="date" value={f.startDate ? f.startDate.slice(0, 10) : ""} onChange={(e) => set("startDate", e.target.value ? new Date(e.target.value).toISOString() : "")} /></Field>
        <div className="sm:col-span-2"><Field label="Preferred languages"><ChipGroup options={LANGUAGES} value={f.languages} onToggle={(v) => toggle("languages", v)} /></Field></div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn icon={Check} disabled={!valid} onClick={() => onSubmit({ ...f, startDate: f.startDate || daysFromNow(21) })}>Submit application</Btn>
      </div>
    </Modal>
  );
}

/* ================================================================== */
/* Caregiver CRM (bullets)                                             */
/* ================================================================== */
function CRM({ db, saveBullet, deleteBullet, matcherName, supplierName, openMatchForBullet }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [byMatcher, setByMatcher] = useState("all");

  const list = db.bullets.filter((b) =>
    (byMatcher === "all" || b.matcherId === byMatcher) &&
    (b.name.toLowerCase().includes(q.toLowerCase()) || b.careTypes.join(" ").toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      <PageHead eyebrow="CRM" title="Caregiver bullets"
        sub="Each bullet is a caregiver profile, tagged to the matcher who interviewed them. Insert, edit or delete records here."
        action={<Btn icon={Plus} onClick={() => { setEditing(null); setOpen(true); }}>Add bullet</Btn>} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or care type…" className={cx(inputCls, "pl-9")} />
        </div>
        <select value={byMatcher} onChange={(e) => setByMatcher(e.target.value)} className={cx(inputCls, "w-auto")}>
          <option value="all">All matchers</option>
          {db.matchers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {list.length === 0 ? <Empty icon={ClipboardList} title="No bullets found" sub="Add caregiver profiles or adjust your filters." /> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((b) => {
            const inCase = openMatchForBullet(b.id);
            return (
              <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">{b.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{b.name}</p>
                      <p className="text-xs text-slate-400">{b.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(b); setOpen(true); }} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { if (confirm(`Delete ${b.name}?`)) deleteBullet(b.id); }} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="mb-2 flex flex-wrap gap-1">
                  {b.careTypes.map((c) => <Badge key={c} tone="teal">{c}</Badge>)}
                  {b.status === "active" && !inCase && <Badge tone="emerald" icon={Check}>Available</Badge>}
                  {inCase && <Badge tone="sky">In a case</Badge>}
                  {b.status === "hired" && <Badge tone="slate">Hired – off pool</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{b.languages.join(", ")}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{b.location} · {b.live}</span>
                  <span className="flex items-center gap-1"><Award className="h-3 w-3" />{b.experience} yrs</span>
                  <span className="flex items-center gap-1"><Wallet className="h-3 w-3" />${b.salary}/mo</span>
                </div>
                <div className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><UserCog className="h-3 w-3" />Matcher: <span className="font-medium text-slate-600">{matcherName(b.matcherId)}</span> · {supplierName(b.supplierId)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BulletModal open={open} onClose={() => setOpen(false)} editing={editing} db={db} onSave={(d) => { saveBullet(d, editing?.id); setOpen(false); }} />
    </div>
  );
}

function BulletModal({ open, onClose, editing, db, onSave }) {
  const blank = { name: "", phone: "", careTypes: [], languages: [], experience: 3, location: REGIONS[0], live: LIVE[0], salary: 2600, certs: [], matcherId: db.matchers[0].id, supplierId: db.suppliers[0].id, notes: "" };
  const [f, setF] = useState(blank);
  useEffect(() => { if (open) setF(editing ? { ...blank, ...editing } : blank); }, [open, editing]);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (k, v) => setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));
  const valid = f.name && f.phone && f.careTypes.length;

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit bullet" : "Add caregiver bullet"} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Caregiver name"><Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Rosa Santos" /></Field>
        <Field label="Phone"><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+65 9111 2222" /></Field>
        <Field label="Region"><Select options={REGIONS} value={f.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Arrangement"><Select options={LIVE} value={f.live} onChange={(e) => set("live", e.target.value)} /></Field>
        <Field label="Experience (years)"><Input type="number" value={f.experience} onChange={(e) => set("experience", +e.target.value)} /></Field>
        <Field label="Expected salary (SGD)"><Input type="number" value={f.salary} onChange={(e) => set("salary", +e.target.value)} /></Field>
        <Field label="Interviewed by (matcher)"><select value={f.matcherId} onChange={(e) => set("matcherId", e.target.value)} className={inputCls}>{db.matchers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
        <Field label="Supplier"><select value={f.supplierId} onChange={(e) => set("supplierId", e.target.value)} className={inputCls}>{db.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <div className="sm:col-span-2"><Field label="Care types"><ChipGroup options={CARE_TYPES} value={f.careTypes} onToggle={(v) => toggle("careTypes", v)} /></Field></div>
        <div className="sm:col-span-2"><Field label="Languages"><ChipGroup options={LANGUAGES} value={f.languages} onToggle={(v) => toggle("languages", v)} /></Field></div>
        <div className="sm:col-span-2"><Field label="Certifications"><ChipGroup options={CERTS} value={f.certs} onToggle={(v) => toggle("certs", v)} /></Field></div>
        <div className="sm:col-span-2"><Field label="Interview notes"><textarea className={inputCls} rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Temperament, strengths, red flags…" /></Field></div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn icon={Check} disabled={!valid} onClick={() => onSave(f)}>{editing ? "Save changes" : "Add bullet"}</Btn>
      </div>
    </Modal>
  );
}

/* ================================================================== */
/* Matching                                                            */
/* ================================================================== */
function Matching({ db, proposeMatch, openMatchForBullet, setView }) {
  const greens = db.employers.filter((e) => e.status === "green");
  const [selId, setSelId] = useState(greens[0]?.id || "");
  const emp = greens.find((e) => e.id === selId);

  const results = useMemo(() => {
    if (!emp) return [];
    return db.bullets
      .filter((b) => b.status === "active")
      .map((b) => ({ b, ...computeMatch(emp, b) }))
      .sort((a, z) => z.score - a.score);
  }, [emp, db.bullets]);

  if (greens.length === 0) return (
    <div>
      <PageHead eyebrow="Matching" title="Automated matching" />
      <Empty icon={Sparkles} title="No green-flagged employers yet" sub="Green-flag an employer in Employer intake to run matching against the caregiver pool." />
    </div>
  );

  return (
    <div>
      <PageHead eyebrow="Matching" title="Automated matching"
        sub="Green-flagged employer criteria scored against every available caregiver bullet." />

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
        <Field label="Employer to match">
          <select value={selId} onChange={(e) => setSelId(e.target.value)} className={inputCls}>
            {greens.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.careType}, {e.location}</option>)}
          </select>
        </Field>
        {emp && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge tone="teal" icon={Heart}>{emp.careType}</Badge>
            <Badge tone="slate" icon={Home}>{emp.live}</Badge>
            <Badge tone="slate" icon={MapPin}>{emp.location}</Badge>
            <Badge tone="slate" icon={Globe}>{emp.languages.join(", ")}</Badge>
            <Badge tone="slate" icon={Award}>{emp.minExperience}+ yrs</Badge>
            <Badge tone="slate" icon={Wallet}>${emp.budget}/mo</Badge>
          </div>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{results.length} caregivers ranked</p>
        <p className="text-xs text-slate-400">Sorted by match score</p>
      </div>

      <div className="space-y-3">
        {results.map(({ b, score, reasons, gaps }) => {
          const existing = openMatchForBullet(b.id);
          const alreadyThis = existing && existing.employerId === emp.id;
          return (
            <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex gap-4">
                <ScoreRing score={score} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">{b.name}</p>
                      <p className="text-xs text-slate-400">{b.experience} yrs · {b.location} · ${b.salary}/mo</p>
                    </div>
                    {alreadyThis ? <Badge tone="sky">Case open</Badge>
                      : existing ? <Badge tone="slate">In another case</Badge>
                      : <Btn size="sm" icon={Send} onClick={() => proposeMatch(emp, b, score)}>Propose match</Btn>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {reasons.map((r) => <span key={r} className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"><Check className="h-3 w-3" />{r}</span>)}
                    {gaps.map((g) => <span key={g} className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-700"><AlertTriangle className="h-3 w-3" />{g}</span>)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Cases (match lifecycle + interview booking + hire confirmation)     */
/* ================================================================== */
function Cases({ db, bulletById, employerById, matcherName, bookInterview, confirmHire, closeCase, setView }) {
  const [booking, setBooking] = useState(null);
  const [hiring, setHiring] = useState(null);
  const [chkEmp, setChkEmp] = useState(false);
  const [chkMatch, setChkMatch] = useState(false);

  const active = db.matches.filter((m) => m.status === "proposed" || m.status === "interview_scheduled");
  const done = db.matches.filter((m) => m.status === "hired" || m.status === "closed");

  const Row = ({ m }) => {
    const b = bulletById(m.bulletId), e = employerById(m.employerId);
    if (!b || !e) return null;
    const slot = m.slotId ? b.slots.find((s) => s.id === m.slotId) : null;
    const st = matchStatus[m.status];
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-800">{e.name}</span>
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <span className="font-semibold text-slate-800">{b.name}</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">{m.score}%</span>
          </div>
          <Badge tone={st.tone}>{st.label}</Badge>
        </div>
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{e.careType}</span>
          <span className="flex items-center gap-1"><UserCog className="h-3 w-3" />{matcherName(b.matcherId)}</span>
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{e.phone}</span>
          {slot && <span className="flex items-center gap-1 font-medium text-sky-600"><CalendarDays className="h-3 w-3" />Interview: {fmtDateTime(slot.at)}</span>}
        </div>

        {m.status === "proposed" && (
          <div className="flex gap-2">
            <Btn size="sm" icon={CalendarPlus} onClick={() => setBooking(m)}>Book interview</Btn>
            <Btn size="sm" variant="outline" onClick={() => closeCase(m)}>Close – no match</Btn>
          </div>
        )}
        {m.status === "interview_scheduled" && (
          <div className="flex gap-2">
            <Btn size="sm" variant="successSoft" icon={CheckCircle2} onClick={() => { setHiring(m); setChkEmp(false); setChkMatch(false); }}>Confirm hire</Btn>
            <Btn size="sm" variant="outline" onClick={() => closeCase(m)}>Close – not hired</Btn>
          </div>
        )}
        {m.status === "hired" && <p className="flex items-center gap-1.5 text-xs text-emerald-600"><Star className="h-3.5 w-3.5" />Hired — {b.name} removed from the matching pool.</p>}
        {m.status === "closed" && <p className="text-xs text-slate-400">Closed without hire — {b.name} remains available for matching.</p>}
      </div>
    );
  };

  const bookB = booking ? bulletById(booking.bulletId) : null;
  const openSlots = bookB ? bookB.slots.filter((s) => !s.booked && isFuture(s.at)) : [];
  const hireB = hiring ? bulletById(hiring.bulletId) : null;

  return (
    <div>
      <PageHead eyebrow="Cases" title="Match cases" sub="Track each proposed match through interview and hire. Confirmed hires close the case and retire the bullet." />

      <p className="mb-2 text-sm font-semibold text-slate-700">Open cases ({active.length})</p>
      {active.length === 0 ? <Empty icon={Heart} title="No open cases" sub="Propose a match from the Matching tab to open a case." /> :
        <div className="space-y-3">{active.map((m) => <Row key={m.id} m={m} />)}</div>}

      {done.length > 0 && <>
        <p className="mb-2 mt-8 text-sm font-semibold text-slate-700">Closed cases ({done.length})</p>
        <div className="space-y-3">{done.map((m) => <Row key={m.id} m={m} />)}</div>
      </>}

      {/* Book interview modal */}
      <Modal open={!!booking} onClose={() => setBooking(null)} title="Book an interview slot">
        {bookB && (openSlots.length === 0 ? (
          <div className="text-center">
            <Empty icon={CalendarDays} title={`${bookB.name} has no open slots`} sub="Add availability in the Bookings tab first." />
            <Btn className="mt-4" variant="outline" onClick={() => { setBooking(null); setView("bookings"); }}>Go to Bookings</Btn>
          </div>
        ) : (
          <div>
            <p className="mb-3 text-sm text-slate-600">Choose from {bookB.name}'s available times. Booking notifies the employer and matcher on WhatsApp.</p>
            <div className="space-y-2">
              {openSlots.map((s) => (
                <button key={s.id} onClick={() => { bookInterview(booking, s.id); setBooking(null); }} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left text-sm transition hover:border-teal-300 hover:bg-teal-50">
                  <span className="flex items-center gap-2 font-medium text-slate-700"><Clock className="h-4 w-4 text-teal-500" />{fmtDateTime(s.at)}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </Modal>

      {/* Confirm hire modal (both parties confirm) */}
      <Modal open={!!hiring} onClose={() => setHiring(null)} title="Confirm hire & close case">
        {hireB && <>
          <p className="mb-4 text-sm text-slate-600">Both sides confirm the caregiver's availability and the intent to hire. On close, {hireB.name} is removed from future matching.</p>
          <div className="space-y-2">
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm">
              <input type="checkbox" checked={chkEmp} onChange={(e) => setChkEmp(e.target.checked)} className="mt-0.5 h-4 w-4 accent-teal-600" />
              <span className="text-slate-700">Employer confirms they wish to hire this caregiver.</span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm">
              <input type="checkbox" checked={chkMatch} onChange={(e) => setChkMatch(e.target.checked)} className="mt-0.5 h-4 w-4 accent-teal-600" />
              <span className="text-slate-700">Matcher confirms the caregiver is available and willing.</span>
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={() => setHiring(null)}>Cancel</Btn>
            <Btn icon={Star} disabled={!chkEmp || !chkMatch} onClick={() => { confirmHire(hiring); setHiring(null); }}>Confirm hire & close</Btn>
          </div>
        </>}
      </Modal>
    </div>
  );
}

/* ================================================================== */
/* Bookings (supplier inputs caregiver availability)                   */
/* ================================================================== */
function Bookings({ db, addSlot, employerById }) {
  const [selB, setSelB] = useState(db.bullets[0]?.id || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const b = db.bullets.find((x) => x.id === selB);

  const add = () => {
    if (!date) return;
    const iso = new Date(`${date}T${time}`).toISOString();
    addSlot(selB, iso);
    setDate("");
  };

  return (
    <div>
      <PageHead eyebrow="Bookings" title="Caregiver availability"
        sub="Suppliers input each caregiver's open interview slots. Employers book these from an open case." />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Add a slot</h3>
          <div className="space-y-3">
            <Field label="Caregiver"><select value={selB} onChange={(e) => setSelB(e.target.value)} className={inputCls}>{db.bullets.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
            <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Time"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
            <Btn icon={CalendarPlus} onClick={add} disabled={!date} className="w-full">Add availability</Btn>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">{b?.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}</div>
              <div><p className="text-sm font-semibold text-slate-800">{b?.name}</p><p className="text-xs text-slate-400">{b?.slots.length || 0} slot(s) on file</p></div>
            </div>
            {(!b || b.slots.length === 0) ? <Empty icon={CalendarDays} title="No slots yet" sub="Add availability using the panel on the left." /> : (
              <div className="space-y-2">
                {[...b.slots].sort((a, z) => new Date(a.at) - new Date(z.at)).map((s) => {
                  const emp = s.employerId ? employerById(s.employerId) : null;
                  return (
                    <div key={s.id} className={cx("flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm", s.booked ? "border-sky-100 bg-sky-50" : "border-slate-200")}>
                      <span className="flex items-center gap-2 text-slate-700"><Clock className="h-4 w-4 text-slate-400" />{fmtDateTime(s.at)}</span>
                      {s.booked ? <Badge tone="sky" icon={CheckCircle2}>Booked{emp ? ` · ${emp.name}` : ""}</Badge> : <Badge tone="emerald">Open</Badge>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* WhatsApp log (simulation)                                           */
/* ================================================================== */
function Messages({ db }) {
  return (
    <div>
      <PageHead eyebrow="Automation" title="WhatsApp message log"
        sub="Every automated notification the system would send. Wire this to the WhatsApp Business API in production." />
      {db.messages.length === 0 ? <Empty icon={MessageSquare} title="No messages yet" sub="Messages are generated when you propose matches, book interviews, or close cases." /> : (
        <div className="space-y-3">
          {db.messages.map((m) => (
            <div key={m.id} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50"><MessageSquare className="h-4 w-4 text-emerald-600" /></div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                  <p className="text-sm font-semibold text-slate-800">{m.toName} <Badge tone={m.toRole === "Employer" ? "teal" : "slate"}>{m.toRole}</Badge></p>
                  <span className="text-xs text-slate-400">{fmtTime(m.at)}</span>
                </div>
                <p className="mb-1.5 text-xs text-slate-400">{m.phone}</p>
                <div className="rounded-lg rounded-tl-none bg-emerald-50 px-3 py-2 text-sm text-slate-700">{m.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
