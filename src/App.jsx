import { useState, useEffect, useCallback, useRef } from "react";

// ─── Global styles injected once ─────────────────────────────────────────────
if (!document.getElementById("breakup-global-style")) {
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap";
  document.head.appendChild(fontLink);

  const styleEl = document.createElement("style");
  styleEl.id = "breakup-global-style";
  styleEl.textContent = `
    *, *::before, *::after { box-sizing: border-box; }
    html, body, #root { width: 100%; margin: 0; padding: 0; }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  `;
  document.head.appendChild(styleEl);
}

// ─── Responsive hook ──────────────────────────────────────────────────────────
function useResponsive() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  const isSm = w < 375;
  const isMd = w < 430;
  const isLg = w >= 430;
  const px   = isSm ? "0.85rem" : isMd ? "1rem" : "1.25rem";
  const py   = isSm ? "1rem"    : "1.5rem";
  const hero = isSm ? 28        : isMd ? 32 : 36;
  const h1   = isSm ? 16        : isMd ? 18 : 20;
  const num  = isSm ? 28        : isMd ? 32 : 36;
  return { w, isSm, isMd, isLg, px, py, hero, h1, num };
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#F8F8F8",
  dark: "#1E1E1E",
  orange: "#CC5500",
  gold: "#FFD700",
  mid: "#E8820A",
  grad: "linear-gradient(135deg, #CC5500, #E8820A, #FFD700)",
  gradSimple: "linear-gradient(135deg, #CC5500, #FFD700)",
  gradBar: "linear-gradient(90deg, #CC5500, #FFD700)",
  fontMain: "'Poppins', sans-serif",
  fontSec: "'Inter', sans-serif",
  muted: "#888",
  border: "#E8E8E8",
  cardBg: "#F8F8F8",
  overBg: "#FFF0E8",
};

// ─── Categorias ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "comida",      label: "Comida",      icon: "M", bar: T.gradBar,  pill: { bg: "#FFF0E8", color: T.orange, border: T.orange } },
  { id: "transporte",  label: "Transporte",  icon: "T", bar: T.dark,     pill: { bg: T.dark,    color: T.bg,     border: T.dark } },
  { id: "contas",      label: "Contas",      icon: "C", bar: T.gradBar,  pill: { bg: "#FFF8E0", color: "#A07000", border: "#FFD700" } },
  { id: "lazer",       label: "Lazer",       icon: "L", bar: T.gradBar,  pill: { bg: T.dark,    color: T.gold,   border: T.dark } },
  { id: "saude",       label: "Saúde",       icon: "S", bar: "#666",     pill: { bg: "#F0F0F0", color: "#444",   border: "#ccc" } },
  { id: "outros",      label: "Outros",      icon: "O", bar: "#999",     pill: { bg: "#F5F5F5", color: "#666",   border: "#ddd" } },
];

// ─── Dívidas Nubank ───────────────────────────────────────────────────────────
const NUBANK_INVOICES = [
  { id: "jun",  label: "Junho",     value: 1249.83 },
  { id: "jul",  label: "Julho",     value: 1162.39 },
  { id: "ago",  label: "Agosto",    value: 1162.39 },
  { id: "set",  label: "Setembro",  value: 313.19  },
  { id: "out",  label: "Outubro",   value: 313.19  },
  { id: "nov",  label: "Novembro",  value: 313.19  },
  { id: "dez",  label: "Dezembro",  value: 313.19  },
  { id: "jan",  label: "Janeiro",   value: 313.19  },
];
const TOTAL_DEBT_INITIAL = NUBANK_INVOICES.reduce((a, i) => a + i.value, 0);

// ─── Semanas ──────────────────────────────────────────────────────────────────
const WEEKS = [
  { id: "s1", label: "Semana 1" },
  { id: "s2", label: "Semana 2" },
  { id: "s3", label: "Semana 3" },
  { id: "s4", label: "Semana 4" },
];

function initWeeks() {
  const weeks = {};
  WEEKS.forEach(w => {
    weeks[w.id] = { alloc: {}, spent: {} };
    CATEGORIES.forEach(c => {
      weeks[w.id].alloc[c.id] = 0;
      weeks[w.id].spent[c.id] = 0;
    });
  });
  return weeks;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  card: (c = T.bg) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="3" fill={c}/>
      <rect x="2" y="10" width="20" height="3" fill={c === T.bg ? T.dark : T.bg} opacity="0.3"/>
      <rect x="5" y="15" width="5" height="2" rx="1" fill={c === T.bg ? T.dark : T.bg} opacity="0.5"/>
    </svg>
  ),
  receipt: (c = T.bg) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 2h12a1 1 0 011 1v18l-3-2-2 2-2-2-2 2-2-2-2 2V3a1 1 0 011-1z" fill={c}/>
      <path d="M9 8h6M9 12h4" stroke={c === T.bg ? T.dark : T.bg} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),
  history: (c = T.bg) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={c}/>
      <path d="M12 7v5l3 3" stroke={c === T.bg ? T.dark : T.bg} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  plus: (c = T.bg) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  back: (c = T.dark) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6l-6 6 6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chart: (c = T.bg) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="12" width="4" height="9" rx="1" fill={c}/>
      <rect x="10" y="7" width="4" height="14" rx="1" fill={c}/>
      <rect x="17" y="3" width="4" height="18" rx="1" fill={c}/>
    </svg>
  ),
  camera: (c = T.bg) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" fill={c}/>
      <circle cx="12" cy="13" r="4" fill={c === T.bg ? T.dark : T.bg} opacity="0.4"/>
      <circle cx="12" cy="13" r="2" fill={c === T.bg ? T.dark : T.bg} opacity="0.7"/>
    </svg>
  ),
  scissors: (c = T.bg) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="6" r="3" stroke={c} strokeWidth="2" fill="none"/>
      <circle cx="6" cy="18" r="3" stroke={c} strokeWidth="2" fill="none"/>
      <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  star: (c = T.gold) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={c}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  check: (c = T.bg) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill={c}/>
      <path d="M8 12l3 3 5-5" stroke={c === T.bg ? T.dark : T.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  alert: (c = T.orange) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill={c}/>
      <path d="M12 9v4M12 17h.01" stroke={T.bg} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  broken: (c = T.bg) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={c} opacity="0.3"/>
      <path d="M12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23" stroke={c} strokeWidth="1.5"/>
      <path d="M10 11l2-4 2 6 2-3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  fire: (c = T.gold) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={c}>
      <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.09 2.04-5.85 5-7.32C8 9 8 10.5 9 11.5c1-2.5.5-5.5 2-8 2 2 3.5 4.5 3.5 7 .5-1 .5-2.5 1.5-3.5 1.5 2 2 4.5 1.5 7 .97.5 1.5 1.5 1.5 2.5 0 2.76-3.13 5-7 5z"/>
    </svg>
  ),
  nubank: (c = "#8A05BE") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" fill={c}/>
      <path d="M7 8l5 8 5-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  calendar: (c = T.bg) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="3" fill={c}/>
      <path d="M3 9h18M8 2v4M16 2v4" stroke={c === T.bg ? T.dark : T.bg} strokeWidth="2" strokeLinecap="round"/>
      <rect x="7" y="13" width="3" height="3" rx="1" fill={c === T.bg ? T.dark : T.bg} opacity="0.5"/>
    </svg>
  ),
};

const CatIcons = {
  comida: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
  transporte: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>,
  contas: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={c === T.bg ? T.dark : T.bg} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/></svg>,
  lazer: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  saude: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  outros: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" stroke={c === T.bg ? T.dark : T.bg} strokeWidth="2" strokeLinecap="round"/></svg>,
};

// ─── Storage ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "breakup_data_v3";
const PATTERNS_KEY = "breakup_patterns_v1";
const DEBT_KEY = "breakup_debt_v1";
const SUBS_KEY = "breakup_subs_v1";

function loadStorage() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } }
function saveStorage(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function loadPatterns() { try { return JSON.parse(localStorage.getItem(PATTERNS_KEY) || "{}"); } catch { return {}; } }
function savePatterns(p) { localStorage.setItem(PATTERNS_KEY, JSON.stringify(p)); }
function loadDebt() {
  try {
    const d = JSON.parse(localStorage.getItem(DEBT_KEY));
    if (d && typeof d.paidIds !== "undefined") return d;
  } catch {}
  return { paidIds: [] };
}
function saveDebt(d) { localStorage.setItem(DEBT_KEY, JSON.stringify(d)); }
function loadSubs() { try { return JSON.parse(localStorage.getItem(SUBS_KEY) || "[]"); } catch { return []; } }
function saveSubs(s) { localStorage.setItem(SUBS_KEY, JSON.stringify(s)); }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function monthKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; }
function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(+y, +m - 1, 1).toLocaleString("pt-BR", { month: "long", year: "numeric" });
}
function monthLabelShort(key) {
  const [y, m] = key.split("-");
  return new Date(+y, +m - 1, 1).toLocaleString("pt-BR", { month: "short", year: "2-digit" });
}
function initMonth(income = {}) {
  const alloc = {};
  CATEGORIES.forEach(c => alloc[c.id] = 0);
  return { income, weeks: initWeeks(), receipts: [], closed: false };
}
function totalIncome(inc) { return (inc.salary || 0) + (inc.vr || 0) + (inc.vt || 0) + (inc.extras || []).reduce((a, e) => a + (e.value || 0), 0); }
function totalWeekSpent(weekData) {
  if (!weekData?.spent) return 0;
  return Object.values(weekData.spent).reduce((a, v) => a + (v || 0), 0);
}
function totalMonthSpent(weeks) {
  if (!weeks) return 0;
  return Object.values(weeks).reduce((a, w) => a + totalWeekSpent(w), 0);
}
const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtShort = (v) => {
  if (Math.abs(v) >= 1000) return `R$${(v / 1000).toFixed(1)}k`;
  return fmt(v);
};

const WEIGHTS_KEY = "breakup_weights_v1";
const WEIGHT_LEVELS = [
  { id: "baixa",      label: "Baixa",      value: 1, color: "#A0A0A0" },
  { id: "media",      label: "Média",      value: 2, color: T.gold },
  { id: "alta",       label: "Alta",       value: 3, color: T.orange },
  { id: "muito_alta", label: "Muito Alta", value: 4, color: "#CC2200" },
];
const DEFAULT_WEIGHTS = { contas: 2, lazer: 3, saude: 2, outros: 1 };

function loadWeights() { try { return JSON.parse(localStorage.getItem(WEIGHTS_KEY) || "null") || DEFAULT_WEIGHTS; } catch { return DEFAULT_WEIGHTS; } }
function saveWeights(w) { localStorage.setItem(WEIGHTS_KEY, JSON.stringify(w)); }

// ─── Auto-split semanal (com pesos) ──────────────────────────────────────────
// Comida = VR/4  |  Transporte = VT/4
// Livre = Salário + extras - fatura - contas fixas
// Livre/semana distribuído pelas freeCats proporcionalmente aos pesos
function calcAutoAlloc(income, currentInvoiceValue, subs, weights = DEFAULT_WEIGHTS) {
  const salary   = income.salary || 0;
  const vr       = income.vr || 0;
  const vt       = income.vt || 0;
  const extras   = (income.extras || []).reduce((a, e) => a + (e.value || 0), 0);
  const totalSubs = subs.reduce((a, s) => a + (s.value || 0), 0);

  const livreTotal     = salary + extras - currentInvoiceValue - totalSubs;
  const livrePorSemana = Math.max(0, livreTotal) / 4;

  const freeCats   = ["contas", "lazer", "saude", "outros"];
  const totalWeight = freeCats.reduce((a, id) => a + (weights[id] || 1), 0);

  const alloc = {};
  CATEGORIES.forEach(c => {
    if (c.id === "comida")          alloc[c.id] = Math.round((vr / 4) * 100) / 100;
    else if (c.id === "transporte") alloc[c.id] = Math.round((vt / 4) * 100) / 100;
    else {
      const w = weights[c.id] || 1;
      alloc[c.id] = Math.round((livrePorSemana * w / totalWeight) * 100) / 100;
    }
  });
  return alloc;
}

// ─── Shared Components ────────────────────────────────────────────────────────
const s = {
  card: {
    background: T.bg,
    borderRadius: 20,
    padding: "16px 18px",
    border: `1.5px solid ${T.border}`,
    width: "100%",
  },
  cardDark: {
    background: T.dark,
    borderRadius: 20,
    padding: "16px 18px",
    width: "100%",
  },
};

function Screen({ children, pb = "6rem" }) {
  const { px, py } = useResponsive();
  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      padding: `${py} ${px} ${pb}`,
      fontFamily: T.fontMain, background: T.bg,
    }}>
      {children}
    </div>
  );
}

function ProgressBar({ pct, color = T.gradBar, overBudget }) {
  return (
    <div style={{ height: 10, borderRadius: 50, background: overBudget ? "#FFE0CC" : "#EBEBEB", overflow: "hidden" }}>
      <div style={{
        height: "100%",
        width: `${Math.min(pct, 100)}%`,
        background: overBudget ? T.orange : color,
        borderRadius: 50,
        transition: "width 0.6s ease"
      }} />
    </div>
  );
}

function CategoryTag({ cat, small, active }) {
  const p = cat.pill;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: small ? 10 : 12, padding: small ? "3px 10px" : "5px 14px",
      borderRadius: 50, background: active ? p.bg : "#F0F0F0",
      color: active ? p.color : "#999", fontWeight: 600,
      border: `1.5px solid ${active ? p.border : "#E0E0E0"}`,
      fontFamily: T.fontMain, transition: "all 0.15s"
    }}>
      {cat.label}
    </span>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 40, borderRadius: 12, background: T.bg,
      border: `1.5px solid ${T.border}`, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      {Icons.back(T.dark)}
    </button>
  );
}

function ScreenHeader({ label, title, onBack, action }) {
  const { h1 } = useResponsive();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack && <BackButton onClick={onBack} />}
        <div>
          <div style={{ fontFamily: T.fontSec, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: T.muted, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
          <div style={{ fontFamily: T.fontMain, fontSize: h1, fontWeight: 700, color: T.dark, lineHeight: 1.1 }}>{title}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

function Logo({ size = "sm" }) {
  const big = size === "lg";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: big ? 12 : 8 }}>
      <div style={{
        width: big ? 44 : 32, height: big ? 44 : 32,
        borderRadius: big ? 14 : 10,
        background: T.grad,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {Icons.scissors(T.bg)}
      </div>
      <div>
        <div style={{ fontFamily: T.fontMain, fontSize: big ? 26 : 18, fontWeight: 800, color: T.dark, letterSpacing: "-0.02em", lineHeight: 1 }}>Breakup</div>
        {big && <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, marginTop: 1 }}>termine com o cartão</div>}
      </div>
    </div>
  );
}

// ─── PAINEL DÍVIDA NUBANK ─────────────────────────────────────────────────────
function DebtPanel({ debtState, onTogglePaid }) {
  const [expanded, setExpanded] = useState(false);
  const { paidIds } = debtState;

  const remaining = NUBANK_INVOICES
    .filter(inv => !paidIds.includes(inv.id))
    .reduce((a, inv) => a + inv.value, 0);

  const paidTotal = TOTAL_DEBT_INITIAL - remaining;
  const pct = (paidTotal / TOTAL_DEBT_INITIAL) * 100;

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a0030, #3d0070)",
      borderRadius: 24, padding: "20px 22px", marginBottom: 14,
      border: "1.5px solid #6a0dad33"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {Icons.nubank()}
          <div>
            <div style={{ fontFamily: T.fontSec, fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Dívida Nubank</div>
            <div style={{ fontFamily: T.fontMain, fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {fmt(remaining)}
            </div>
          </div>
        </div>
        <div style={{
          background: remaining === 0 ? "#4CAF50" : "rgba(255,255,255,0.1)",
          borderRadius: 50, padding: "4px 12px"
        }}>
          <span style={{ fontFamily: T.fontMain, fontSize: 12, fontWeight: 700, color: remaining === 0 ? "#fff" : "rgba(255,255,255,0.7)" }}>
            {remaining === 0 ? "🎉 Quitada!" : `${pct.toFixed(0)}% pago`}
          </span>
        </div>
      </div>

      {/* Barra de progresso da dívida */}
      <div style={{ height: 8, borderRadius: 50, background: "rgba(255,255,255,0.15)", overflow: "hidden", marginBottom: 10 }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg, #8A05BE, #c362ff)",
          borderRadius: 50,
          transition: "width 0.8s ease"
        }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontFamily: T.fontSec, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          Pago: {fmt(paidTotal)}
        </span>
        <span style={{ fontFamily: T.fontSec, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          Total: {fmt(TOTAL_DEBT_INITIAL)}
        </span>
      </div>

      {/* Toggle para ver faturas */}
      <button onClick={() => setExpanded(e => !e)} style={{
        width: "100%", padding: "9px", borderRadius: 12,
        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(255,255,255,0.7)", cursor: "pointer", fontFamily: T.fontSec, fontSize: 12, fontWeight: 600
      }}>
        {expanded ? "▲ Fechar faturas" : "▼ Ver faturas"}
      </button>

      {expanded && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {NUBANK_INVOICES.map(inv => {
            const paid = paidIds.includes(inv.id);
            return (
              <div key={inv.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", borderRadius: 12,
                background: paid ? "rgba(76,175,80,0.15)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${paid ? "rgba(76,175,80,0.3)" : "rgba(255,255,255,0.1)"}`,
                transition: "all 0.2s"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => onTogglePaid(inv.id)} style={{
                    width: 22, height: 22, borderRadius: 50,
                    background: paid ? "#4CAF50" : "rgba(255,255,255,0.1)",
                    border: `2px solid ${paid ? "#4CAF50" : "rgba(255,255,255,0.3)"}`,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s", flexShrink: 0
                  }}>
                    {paid && <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-9" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                  <span style={{
                    fontFamily: T.fontMain, fontSize: 13, fontWeight: 600,
                    color: paid ? "rgba(255,255,255,0.4)" : "#fff",
                    textDecoration: paid ? "line-through" : "none"
                  }}>{inv.label}</span>
                </div>
                <span style={{
                  fontFamily: T.fontMain, fontSize: 13, fontWeight: 700,
                  color: paid ? "rgba(255,255,255,0.3)" : "#c362ff"
                }}>{fmt(inv.value)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: Setup ────────────────────────────────────────────────────────────
function SetupScreen({ onSave, onBack }) {
  const [salary, setSalary] = useState("");
  const [vr, setVr] = useState("");
  const [vt, setVt] = useState("");
  const [extras, setExtras] = useState([]);
  const [extraLabel, setExtraLabel] = useState("");
  const [extraVal, setExtraVal] = useState("");
  const [step, setStep] = useState(1);

  const total = (+salary || 0) + (+vr || 0) + (+vt || 0) + extras.reduce((a, e) => a + e.value, 0);

  function addExtra() {
    if (!extraLabel || !extraVal) return;
    setExtras(p => [...p, { label: extraLabel, value: +extraVal }]);
    setExtraLabel(""); setExtraVal("");
  }

  function save() {
    const income = { salary: +salary, vr: +vr, vt: +vt, extras };
    onSave(income);
  }

  const inputStyle = {
    width: "100%", background: T.bg, border: `2px solid ${T.border}`,
    borderRadius: 16, padding: "14px 18px", fontFamily: T.fontMain,
    fontSize: 15, fontWeight: 600, color: T.dark, outline: "none",
    transition: "border-color 0.2s"
  };

  return (
    <Screen pb="2rem">
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          {(step === 2 || onBack) && (
            <button onClick={step === 2 ? () => setStep(1) : onBack} style={{
              width: 40, height: 40, borderRadius: 12, background: T.bg,
              border: `1.5px solid ${T.border}`, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              {Icons.back(T.dark)}
            </button>
          )}
          <Logo size="lg" />
        </div>
        <div style={{ background: T.dark, borderRadius: 20, padding: "20px 22px" }}>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, fontWeight: 500, marginBottom: 6 }}>
            Configuração inicial
          </div>
          <div style={{ fontFamily: T.fontMain, fontSize: 18, fontWeight: 700, color: T.bg, lineHeight: 1.2 }}>
            Qual é a sua renda esse mês?
          </div>
          <div style={{ fontFamily: T.fontSec, fontSize: 13, color: T.muted, marginTop: 6 }}>
            A gente vai te ajudar a terminar com o cartão 💔
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Salário", val: salary, set: setSalary, icon: "💰" },
          { label: "Vale Refeição", val: vr, set: setVr, icon: "🥗" },
          { label: "Vale Transporte", val: vt, set: setVt, icon: "🚌" },
        ].map(({ label, val, set, icon }) => (
          <div key={label} style={{ background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: "14px 18px" }}>
            <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, fontWeight: 500, marginBottom: 4 }}>{icon} {label}</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontFamily: T.fontMain, fontSize: 13, color: T.muted, marginRight: 4 }}>R$</span>
              <input type="number" value={val} onChange={e => set(e.target.value)} placeholder="0,00"
                style={{ flex: 1, fontSize: 20, fontWeight: 700, color: T.dark, border: "none", background: "transparent", outline: "none", fontFamily: T.fontMain }} />
            </div>
          </div>
        ))}

        {extras.map((e, i) => (
          <div key={i} style={{ background: "#FFF8E0", border: `1.5px solid #FFD700`, borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: T.fontSec, fontSize: 11, color: "#A07000" }}>✨ {e.label}</div>
              <div style={{ fontFamily: T.fontMain, fontSize: 16, fontWeight: 700, color: T.dark }}>{fmt(e.value)}</div>
            </div>
            <button onClick={() => setExtras(p => p.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 20, lineHeight: 1 }}>×</button>
          </div>
        ))}

        <div style={{ display: "flex", gap: 8 }}>
          <input value={extraLabel} onChange={e => setExtraLabel(e.target.value)} placeholder="Ex: Freelance"
            style={{ ...inputStyle, fontSize: 13, fontWeight: 500, padding: "11px 14px", flex: 1 }} />
          <input type="number" value={extraVal} onChange={e => setExtraVal(e.target.value)} placeholder="R$"
            style={{ ...inputStyle, fontSize: 13, fontWeight: 500, padding: "11px 14px", width: 90 }} />
          <button onClick={addExtra} style={{
            padding: "11px 16px", borderRadius: 16, background: T.dark,
            color: T.bg, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700
          }}>+</button>
        </div>
      </div>

      {total > 0 && (
        <div style={{ background: T.grad, borderRadius: 20, padding: "18px 22px", marginBottom: 20 }}>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>renda total do mês</div>
          <div style={{ fontFamily: T.fontMain, fontSize: 28, fontWeight: 800, color: T.bg }}>{fmt(total)}</div>
        </div>
      )}

      <button onClick={() => total > 0 && save()} disabled={!total}
        style={{
          width: "100%", padding: "15px", borderRadius: 50,
          background: total > 0 ? T.grad : "#E0E0E0",
          color: total > 0 ? T.bg : T.muted,
          border: "none", cursor: total > 0 ? "pointer" : "not-allowed",
          fontSize: 15, fontWeight: 700, fontFamily: T.fontMain
        }}>
        Começar o mês 💔
      </button>
    </Screen>
  );
}

// ─── SCREEN: Pesos / Prioridades ─────────────────────────────────────────────
function WeightsScreen({ weights, income, currentInvoiceValue, subs, onSave, onBack }) {
  const [w, setW] = useState({ ...weights });

  const freeCats = CATEGORIES.filter(c => c.id !== "comida" && c.id !== "transporte");
  const totalWeight = freeCats.reduce((a, c) => a + (w[c.id] || 1), 0);

  // Preview do cálculo
  const salary  = income.salary || 0;
  const vr      = income.vr || 0;
  const vt      = income.vt || 0;
  const extras  = (income.extras || []).reduce((a, e) => a + (e.value || 0), 0);
  const totalSubs = subs.reduce((a, s) => a + (s.value || 0), 0);
  const livreTotal = Math.max(0, salary + extras - currentInvoiceValue - totalSubs);
  const livreSemana = livreTotal / 4;

  function preview(catId) {
    return Math.round((livreSemana * (w[catId] || 1) / totalWeight) * 100) / 100;
  }

  return (
    <Screen pb="2rem">
      <ScreenHeader label="Distribuição inteligente" title="Prioridades" onBack={onBack} />

      {/* Explicação */}
      <div style={{ background: "#FFF8E0", border: `1.5px solid ${T.gold}`, borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ fontFamily: T.fontSec, fontSize: 13, color: "#7A5900", lineHeight: 1.6 }}>
          ✨ Defina a prioridade de cada categoria. Categorias com prioridade maior recebem uma fatia maior do dinheiro livre por semana.
          <br/><b>Comida</b> e <b>Transporte</b> já usam VR e VT diretamente.
        </div>
      </div>

      {/* VR / VT preview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Comida / semana", val: (vr / 4), icon: "🥗", note: "VR ÷ 4" },
          { label: "Transporte / sem.", val: (vt / 4), icon: "🚌", note: "VT ÷ 4" },
        ].map(({ label, val, icon, note }) => (
          <div key={label} style={{ background: T.dark, borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontFamily: T.fontMain, fontSize: 16, fontWeight: 700, color: T.bg }}>{fmt(Math.round(val * 100) / 100)}</div>
            <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, marginTop: 2 }}>{label}</div>
            <div style={{ fontFamily: T.fontSec, fontSize: 10, color: "#555", marginTop: 1 }}>{note}</div>
          </div>
        ))}
      </div>

      {/* Livre por semana */}
      <div style={{ background: T.grad, borderRadius: 16, padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Livre por semana para distribuir</div>
          <div style={{ fontFamily: T.fontMain, fontSize: 22, fontWeight: 800, color: T.bg }}>{fmt(Math.round(livreSemana * 100) / 100)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: T.fontSec, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>livre total</div>
          <div style={{ fontFamily: T.fontMain, fontSize: 14, fontWeight: 600, color: T.bg }}>{fmt(livreTotal)}</div>
        </div>
      </div>

      {/* Sliders por categoria */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        {freeCats.map(cat => {
          const level = WEIGHT_LEVELS.find(l => l.value === (w[cat.id] || 1)) || WEIGHT_LEVELS[0];
          const pct = ((w[cat.id] || 1) / totalWeight) * 100;

          return (
            <div key={cat.id} style={{ ...s.card }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: T.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {CatIcons[cat.id] ? CatIcons[cat.id](T.bg) : null}
                  </div>
                  <div>
                    <div style={{ fontFamily: T.fontMain, fontSize: 14, fontWeight: 600, color: T.dark }}>{cat.label}</div>
                    <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted }}>{pct.toFixed(0)}% do livre</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: T.fontMain, fontSize: 15, fontWeight: 700, color: T.dark }}>{fmt(preview(cat.id))}</div>
                  <div style={{ fontFamily: T.fontSec, fontSize: 10, color: level.color, fontWeight: 700 }}>{level.label}</div>
                </div>
              </div>

              {/* 4 botões de nível */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {WEIGHT_LEVELS.map(lvl => {
                  const active = (w[cat.id] || 1) === lvl.value;
                  return (
                    <button key={lvl.id} onClick={() => setW(prev => ({ ...prev, [cat.id]: lvl.value }))} style={{
                      padding: "8px 4px", borderRadius: 10, cursor: "pointer",
                      background: active ? lvl.color : "#F0F0F0",
                      color: active ? "#fff" : T.muted,
                      border: active ? `2px solid ${lvl.color}` : "2px solid transparent",
                      fontFamily: T.fontMain, fontSize: 11, fontWeight: 700,
                      transition: "all 0.15s"
                    }}>
                      {lvl.label}
                    </button>
                  );
                })}
              </div>

              {/* Mini barra visual da fatia */}
              <div style={{ height: 6, borderRadius: 50, background: "#EBEBEB", marginTop: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: level.color, borderRadius: 50, transition: "width 0.3s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => { onSave(w); onBack(); }} style={{
        width: "100%", padding: "15px", borderRadius: 50,
        background: T.grad, color: T.bg, border: "none",
        cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: T.fontMain
      }}>
        Salvar prioridades ✓
      </button>
    </Screen>
  );
}

// ─── SCREEN: Edit Income ─────────────────────────────────────────────────────
function EditIncomeScreen({ income, onSave, onBack }) {
  const [salary, setSalary] = useState(String(income.salary || ""));
  const [vr, setVr]         = useState(String(income.vr || ""));
  const [vt, setVt]         = useState(String(income.vt || ""));
  const [extras, setExtras] = useState(income.extras || []);
  const [extraLabel, setExtraLabel] = useState("");
  const [extraVal, setExtraVal]     = useState("");

  const total = (+salary||0) + (+vr||0) + (+vt||0) + extras.reduce((a,e)=>a+(e.value||0),0);

  function addExtra() {
    if (!extraLabel || !extraVal) return;
    setExtras(p => [...p, { label: extraLabel, value: +extraVal }]);
    setExtraLabel(""); setExtraVal("");
  }

  const inputStyle = {
    width: "100%", background: T.bg, border: `1.5px solid ${T.border}`,
    borderRadius: 14, padding: "13px 16px", fontFamily: T.fontMain,
    fontSize: 15, fontWeight: 600, color: T.dark, outline: "none",
  };

  return (
    <Screen pb="2rem">
      <ScreenHeader label="Renda do mês" title="Editar entrada" onBack={onBack} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Salário", icon: "💰", val: salary, set: setSalary },
          { label: "Vale Refeição (VR)", icon: "🥗", val: vr, set: setVr },
          { label: "Vale Transporte (VT)", icon: "🚌", val: vt, set: setVt },
        ].map(({ label, icon, val, set }) => (
          <div key={label} style={{ background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: "14px 18px" }}>
            <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, fontWeight: 500, marginBottom: 4 }}>{icon} {label}</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontFamily: T.fontMain, fontSize: 13, color: T.muted, marginRight: 4 }}>R$</span>
              <input type="number" value={val} onChange={e => set(e.target.value)} placeholder="0,00"
                style={{ flex: 1, fontSize: 20, fontWeight: 700, color: T.dark, border: "none", background: "transparent", outline: "none", fontFamily: T.fontMain }} />
            </div>
          </div>
        ))}

        {extras.map((e, i) => (
          <div key={i} style={{ background: "#FFF8E0", border: `1.5px solid #FFD700`, borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: T.fontSec, fontSize: 11, color: "#A07000" }}>✨ {e.label}</div>
              <div style={{ fontFamily: T.fontMain, fontSize: 16, fontWeight: 700, color: T.dark }}>{fmt(e.value)}</div>
            </div>
            <button onClick={() => setExtras(p => p.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 22 }}>×</button>
          </div>
        ))}

        <div style={{ display: "flex", gap: 8 }}>
          <input value={extraLabel} onChange={e => setExtraLabel(e.target.value)} placeholder="Renda extra (ex: freelance)"
            style={{ ...inputStyle, fontSize: 13, fontWeight: 500, padding: "11px 14px", flex: 1 }} />
          <input type="number" value={extraVal} onChange={e => setExtraVal(e.target.value)} placeholder="R$"
            style={{ ...inputStyle, fontSize: 13, fontWeight: 500, padding: "11px 14px", width: 90 }} />
          <button onClick={addExtra} style={{
            padding: "11px 16px", borderRadius: 14, background: T.dark,
            color: T.bg, border: "none", cursor: "pointer", fontSize: 18, fontWeight: 700
          }}>+</button>
        </div>
      </div>

      {total > 0 && (
        <div style={{ background: T.grad, borderRadius: 20, padding: "18px 22px", marginBottom: 20 }}>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>nova renda total</div>
          <div style={{ fontFamily: T.fontMain, fontSize: 28, fontWeight: 800, color: T.bg }}>{fmt(total)}</div>
        </div>
      )}

      <button onClick={() => onSave({ salary: +salary, vr: +vr, vt: +vt, extras })}
        style={{
          width: "100%", padding: "15px", borderRadius: 50,
          background: T.grad, color: T.bg, border: "none",
          cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: T.fontMain
        }}>
        Salvar renda ✓
      </button>
    </Screen>
  );
}

// ─── SCREEN: Subscriptions / Contas Fixas ────────────────────────────────────
const SUB_CATS = [
  { id: "streaming",  label: "Streaming",   emoji: "📺" },
  { id: "saude",      label: "Saúde",        emoji: "💊" },
  { id: "moradia",    label: "Moradia",       emoji: "🏠" },
  { id: "educacao",   label: "Educação",      emoji: "📚" },
  { id: "internet",   label: "Internet/Tel",  emoji: "📡" },
  { id: "outro",      label: "Outro",         emoji: "📌" },
];

function SubscriptionsScreen({ subs, onSave, onBack }) {
  const [list, setList] = useState(subs);
  const [nome, setNome]   = useState("");
  const [valor, setValor] = useState("");
  const [catId, setCatId] = useState("outro");

  const total = list.reduce((a, s) => a + (s.value || 0), 0);

  function add() {
    if (!nome || !valor || isNaN(+valor) || +valor <= 0) return;
    setList(p => [...p, { id: Date.now(), name: nome, value: +valor, cat: catId }]);
    setNome(""); setValor("");
  }

  function remove(id) { setList(p => p.filter(s => s.id !== id)); }

  const inputStyle = {
    background: T.bg, border: `1.5px solid ${T.border}`,
    borderRadius: 14, padding: "12px 14px", fontFamily: T.fontMain,
    fontSize: 14, fontWeight: 600, color: T.dark, outline: "none",
  };

  return (
    <Screen pb="2rem">
      <ScreenHeader label="Gastos fixos" title="Assinaturas & Contas" onBack={() => { onSave(list); onBack(); }} />

      {/* Total */}
      {total > 0 && (
        <div style={{ background: T.dark, borderRadius: 20, padding: "16px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total mensal fixo</div>
          <div style={{ fontFamily: T.fontMain, fontSize: 20, fontWeight: 800, color: T.bg }}>{fmt(total)}</div>
        </div>
      )}

      {/* Lista existente */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {list.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: T.muted, fontFamily: T.fontSec, fontSize: 13 }}>
            Nenhuma conta fixa ainda.<br/>Adicione abaixo 👇
          </div>
        )}
        {list.map(sub => {
          const sc = SUB_CATS.find(s => s.id === sub.cat) || SUB_CATS[5];
          return (
            <div key={sub.id} style={{ ...s.card, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  {sc.emoji}
                </div>
                <div>
                  <div style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 600, color: T.dark }}>{sub.name}</div>
                  <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted }}>{sc.label}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: T.fontMain, fontSize: 14, fontWeight: 700, color: T.dark }}>{fmt(sub.value)}</div>
                <button onClick={() => remove(sub.id)} style={{
                  width: 28, height: 28, borderRadius: 8, background: "#FFF0E8",
                  border: `1px solid ${T.orange}`, cursor: "pointer",
                  color: T.orange, fontSize: 16, lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>×</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulário de adição */}
      <div style={{ background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: "16px 18px" }}>
        <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Nova conta / assinatura
        </div>

        {/* Categoria */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {SUB_CATS.map(sc => (
            <button key={sc.id} onClick={() => setCatId(sc.id)} style={{
              padding: "6px 12px", borderRadius: 50, cursor: "pointer",
              background: catId === sc.id ? T.dark : "#F0F0F0",
              color: catId === sc.id ? T.bg : T.muted,
              border: "none", fontFamily: T.fontMain, fontSize: 12, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4
            }}>
              <span>{sc.emoji}</span> {sc.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Netflix, Aluguel..."
            style={{ ...inputStyle, flex: 1 }} />
          <input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="R$"
            style={{ ...inputStyle, width: 90 }}
            onKeyDown={e => e.key === "Enter" && add()} />
          <button onClick={add} style={{
            padding: "12px 16px", borderRadius: 14, background: T.dark,
            color: T.bg, border: "none", cursor: "pointer", fontSize: 18, fontWeight: 700
          }}>+</button>
        </div>
      </div>

      <button onClick={() => { onSave(list); onBack(); }} style={{
        width: "100%", padding: "15px", borderRadius: 50, marginTop: 20,
        background: T.grad, color: T.bg, border: "none",
        cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: T.fontMain
      }}>
        Salvar e voltar ✓
      </button>
    </Screen>
  );
}

// ─── SCREEN: Dashboard ────────────────────────────────────────────────────────
function Dashboard({ monthData, onAddReceipt, onAddManual, onNavigate, currentMonth, allMonths, onCloseMonth, debtState, onTogglePaid, onUpdateWeekAlloc, onUpdateWeekSpent, subs, onAutoSplit }) {
  const { income, weeks, receipts, closed } = monthData;
  const incTotal = totalIncome(income);
  const spentTotal = totalMonthSpent(weeks);
  const saved = incTotal - spentTotal;
  const pctSpent = incTotal > 0 ? (spentTotal / incTotal) * 100 : 0;
  const { num } = useResponsive();
  const [activeWeek, setActiveWeek] = useState("s1");

  const weekData = weeks?.[activeWeek] || { alloc: {}, spent: {} };

  return (
    <Screen pb="6rem">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Logo />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onNavigate("subs")} style={{
            width: 40, height: 40, borderRadius: 12, background: T.bg,
            border: `1.5px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            title: "Contas fixas"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 4H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1z" fill={T.dark}/>
              <path d="M7 9h10M7 13h7" stroke={T.bg} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {allMonths.length > 1 && (
            <button onClick={() => onNavigate("history")} style={{
              width: 40, height: 40, borderRadius: 12, background: T.dark,
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {Icons.history(T.bg)}
            </button>
          )}
          <button onClick={() => onNavigate("receipts")} style={{
            width: 40, height: 40, borderRadius: 12, background: T.dark,
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {Icons.receipt(T.bg)}
          </button>
        </div>
      </div>

      {/* Mês label */}
      <div style={{ fontFamily: T.fontSec, fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
        {monthLabel(currentMonth)}
      </div>

      {/* Hero card mensal — clicável para editar renda */}
      <div onClick={() => onNavigate("editIncome")} style={{
        background: saved >= 0 ? T.grad : T.dark,
        borderRadius: 24, padding: "22px 24px", marginBottom: 14,
        position: "relative", overflow: "hidden", cursor: "pointer"
      }}>
        <div style={{ position: "absolute", right: -20, top: -20, opacity: 0.1, transform: "rotate(20deg)" }}>
          {Icons.scissors(T.bg)}
        </div>
        {/* Edit badge */}
        <div style={{ position: "absolute", top: 14, right: 16, background: "rgba(255,255,255,0.15)", borderRadius: 50, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/></svg>
          <span style={{ fontFamily: T.fontSec, fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>editar</span>
        </div>

        <div style={{ fontFamily: T.fontSec, fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>
          {saved >= 0 ? "no mês você guardou" : "no mês você estourou"}
        </div>
        <div style={{ fontFamily: T.fontMain, fontSize: num, fontWeight: 800, color: T.bg, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          {fmt(Math.abs(saved))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <div>
            <div style={{ fontFamily: T.fontSec, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>gasto total</div>
            <div style={{ fontFamily: T.fontMain, fontSize: 16, fontWeight: 700, color: T.bg }}>{fmt(spentTotal)}</div>
          </div>
          <div>
            <div style={{ fontFamily: T.fontSec, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>renda</div>
            <div style={{ fontFamily: T.fontMain, fontSize: 16, fontWeight: 700, color: T.bg }}>{fmt(incTotal)}</div>
          </div>
          {subs.length > 0 && (
            <div>
              <div style={{ fontFamily: T.fontSec, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>fixos/mês</div>
              <div style={{ fontFamily: T.fontMain, fontSize: 16, fontWeight: 700, color: T.bg }}>{fmt(subs.reduce((a,s)=>a+s.value,0))}</div>
            </div>
          )}
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontFamily: T.fontSec, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>usado</div>
            <div style={{ fontFamily: T.fontMain, fontSize: 16, fontWeight: 700, color: saved >= 0 ? T.bg : T.orange }}>{pctSpent.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Painel dívida */}
      <DebtPanel debtState={debtState} onTogglePaid={onTogglePaid} />

      {/* Close month button */}
      {!closed && (
        <button onClick={onCloseMonth} style={{
          width: "100%", padding: "12px", borderRadius: 50, marginBottom: 20,
          background: "transparent", border: `1.5px dashed ${T.orange}`,
          color: T.orange, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: T.fontMain,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8
        }}>
          {Icons.chart(T.orange)} Fechar mês e ver relatório
        </button>
      )}

      {closed && (
        <button onClick={() => onNavigate("report")} style={{
          width: "100%", padding: "12px", borderRadius: 50, marginBottom: 20,
          background: T.dark, border: "none",
          color: T.bg, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: T.fontMain,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8
        }}>
          {Icons.chart(T.bg)} Ver relatório do mês ✨
        </button>
      )}

      {/* Divisão automática */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={onAutoSplit} style={{
          flex: 1, padding: "12px", borderRadius: 50,
          background: "#FFF8E0", border: `1.5px solid ${T.gold}`,
          color: "#7A5900", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: T.fontMain,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6
        }}>
          ✨ Distribuir automaticamente
        </button>
        <button onClick={() => onNavigate("weights")} style={{
          width: 46, height: 46, borderRadius: 50, flexShrink: 0,
          background: "#FFF8E0", border: `1.5px solid ${T.gold}`,
          color: "#7A5900", cursor: "pointer", fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center"
        }} title="Configurar prioridades">
          ⚖️
        </button>
      </div>

      {/* Tabs de semanas */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {WEEKS.map(w => {
          const wSpent = totalWeekSpent(weeks?.[w.id]);
          const isActive = activeWeek === w.id;
          return (
            <button key={w.id} onClick={() => setActiveWeek(w.id)} style={{
              flexShrink: 0,
              padding: "8px 16px", borderRadius: 50,
              background: isActive ? T.dark : T.bg,
              border: `1.5px solid ${isActive ? T.dark : T.border}`,
              color: isActive ? T.bg : T.muted,
              cursor: "pointer", fontFamily: T.fontMain, fontSize: 12, fontWeight: 600,
              transition: "all 0.15s"
            }}>
              {w.label}
              {wSpent > 0 && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>{fmtShort(wSpent)}</span>}
            </button>
          );
        })}
      </div>

      {/* Categorias da semana ativa */}
      <WeekCategories
        weekId={activeWeek}
        weekData={weekData}
        onUpdateAlloc={(catId, val) => onUpdateWeekAlloc(activeWeek, catId, val)}
        onUpdateSpent={(catId, val) => onUpdateWeekSpent(activeWeek, catId, val)}
      />

      {/* FAB */}
      <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 100, display: "flex", gap: 10 }}>
        <button onClick={onAddManual} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "14px 20px", borderRadius: 50,
          background: T.dark, border: "none", cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
        }}>
          {Icons.plus(T.bg)}
          <span style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 700, color: T.bg }}>Manual</span>
        </button>
        <button onClick={onAddReceipt} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "14px 20px", borderRadius: 50,
          background: T.grad, border: "none", cursor: "pointer",
          boxShadow: "0 8px 24px rgba(204,85,0,0.4)"
        }}>
          {Icons.camera(T.bg)}
          <span style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 700, color: T.bg }}>Foto</span>
        </button>
      </div>
    </Screen>
  );
}

// ─── COMPONENT: Categorias da Semana ─────────────────────────────────────────
function WeekCategories({ weekId, weekData, onUpdateAlloc, onUpdateSpent }) {
  const { alloc = {}, spent = {} } = weekData;
  // editing: { catId, field: "alloc" | "spent" }
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  function startEdit(catId, field) {
    setEditing({ catId, field });
    const current = field === "alloc" ? (alloc[catId] || 0) : (spent[catId] || 0);
    setEditVal(current > 0 ? String(current) : "");
  }

  function commitEdit() {
    if (!editing) return;
    const v = parseFloat(editVal.replace(",", "."));
    if (!isNaN(v) && v >= 0) {
      if (editing.field === "alloc") onUpdateAlloc(editing.catId, v);
      else onUpdateSpent(editing.catId, v);
    }
    setEditing(null);
  }

  function isEditingField(catId, field) {
    return editing?.catId === catId && editing?.field === field;
  }

  function EditableField({ catId, field, value, placeholder, color, bgColor, borderColor }) {
    const active = isEditingField(catId, field);
    if (active) {
      return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
          <span style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted }}>R$</span>
          <input
            autoFocus
            type="number"
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(null); }}
            style={{
              width: 72, fontSize: 13, fontWeight: 700, color,
              border: `1.5px solid ${borderColor}`, borderRadius: 8, padding: "3px 7px",
              fontFamily: T.fontMain, background: bgColor, outline: "none"
            }}
          />
        </div>
      );
    }
    return (
      <button onClick={() => startEdit(catId, field)} style={{
        fontFamily: T.fontMain, fontSize: field === "spent" ? 15 : 11,
        fontWeight: field === "spent" ? 700 : 400,
        color: value > 0 ? color : (field === "alloc" ? T.orange : T.muted),
        background: "none", border: "none", cursor: "pointer", padding: 0,
        textAlign: field === "spent" ? "right" : "left",
        textDecoration: "none",
      }}>
        {value > 0 ? (field === "spent" ? fmt(value) : `limite ${fmt(value)}`) : (field === "spent" ? "R$ 0,00" : "✏️ definir limite")}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
      {CATEGORIES.map(cat => {
        const budget = alloc[cat.id] || 0;
        const used = spent[cat.id] || 0;
        const pct = budget > 0 ? (used / budget) * 100 : 0;
        const remaining = budget - used;
        const overBudget = used > budget && budget > 0;

        return (
          <div key={cat.id} style={{
            ...s.card,
            border: `1.5px solid ${overBudget ? T.orange : T.border}`,
            background: overBudget ? "#FFF5EF" : T.bg
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: budget > 0 ? 10 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: T.dark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {CatIcons[cat.id] ? CatIcons[cat.id](T.bg) : null}
                </div>
                <div>
                  <div style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 600, color: T.dark, marginBottom: 2 }}>{cat.label}</div>
                  {/* Limite editável */}
                  <EditableField
                    catId={cat.id} field="alloc" value={budget}
                    color={T.muted} bgColor="#F5F5F5" borderColor={T.border}
                  />
                </div>
              </div>

              {/* Valor gasto editável */}
              <div style={{ textAlign: "right" }}>
                <EditableField
                  catId={cat.id} field="spent" value={used}
                  color={overBudget ? T.orange : T.dark}
                  bgColor={overBudget ? "#FFF0E8" : "#F5F5F5"}
                  borderColor={overBudget ? T.orange : T.border}
                />
                {budget > 0 && (
                  <div style={{ fontFamily: T.fontSec, fontSize: 11, fontWeight: 500, color: overBudget ? T.orange : "#4CAF50", marginTop: 2 }}>
                    {overBudget ? `+${fmt(used - budget)} acima` : `${fmt(remaining)} rest.`}
                  </div>
                )}
              </div>
            </div>
            {budget > 0 && <ProgressBar pct={pct} overBudget={overBudget} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Claude API ───────────────────────────────────────────────────────────────
async function analyzeReceipt(base64, mimeType, patterns) {
  const patternHint = Object.keys(patterns).length
    ? `Padrões conhecidos: ${JSON.stringify(patterns)}`
    : "";
  const prompt = `Você é um assistente financeiro. Analise este comprovante e extraia as informações.
Categorias: comida, transporte, contas, lazer, saude, outros.
${patternHint}
Responda APENAS em JSON válido, sem markdown:
{"estabelecimento":"nome","valor":0.00,"data":"DD/MM/AAAA ou null","categoria":"categoria","confianca":0,"motivo":"razão breve"}`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: mimeType, data: base64 } },
        { type: "text", text: prompt }
      ]}]
    })
  });
  const data = await res.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

async function generateMonthlyReport(monthData, monthKey) {
  const inc = totalIncome(monthData.income);
  const spent = totalMonthSpent(monthData.weeks);
  const saved = inc - spent;
  const label = monthLabel(monthKey);

  // Agregar gastos por categoria de todas as semanas
  const catSpent = {};
  CATEGORIES.forEach(c => catSpent[c.id] = 0);
  Object.values(monthData.weeks || {}).forEach(w => {
    CATEGORIES.forEach(c => { catSpent[c.id] += (w.spent?.[c.id] || 0); });
  });

  const catBreakdown = CATEGORIES.map(c => ({
    categoria: c.label,
    gasto: catSpent[c.id]
  }));

  const prompt = `Você é o Breakup — um app com personalidade de "término com o cartão de crédito". 
Tom: honesto, empático, levemente dramático como uma conversa de término, mas construtivo.
Dados do mês de ${label}:
- Renda total: ${fmt(inc)}
- Total gasto: ${fmt(spent)}
- Guardado/Excedente: ${fmt(saved)} (${saved >= 0 ? 'positivo' : 'negativo'})
- Por categoria: ${JSON.stringify(catBreakdown)}

Gere um relatório mensal em JSON com EXATAMENTE esta estrutura:
{
  "titulo": "título dramático/engraçado estilo término (max 8 palavras)",
  "resumo": "parágrafo de 2-3 frases com tom do app, avaliando o mês geral",
  "destaque_positivo": "1 frase sobre o que foi bem",
  "destaque_negativo": "1 frase sobre o maior problema (ou null se foi ótimo)",
  "categoria_campeã": "categoria que mais pesou no orçamento",
  "dica_proxímo_mes": "conselho específico e acionável para o próximo mês",
  "score": número de 0 a 100 representando saúde financeira do mês,
  "emoji_do_mes": "1 emoji que resume o mês",
  "frases_ruptura": ["frase1 estilo término", "frase2 estilo término"]
}
Responda APENAS JSON válido, sem markdown.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await res.json();
    const text = data.content?.map(b => b.text || "").join("") || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (parsed && parsed.titulo) return parsed;
    throw new Error("invalid");
  } catch {
    // fallback local
    const pct = inc > 0 ? (spent / inc) * 100 : 0;
    const score = Math.max(0, Math.min(100, Math.round(100 - pct * 0.8)));
    return {
      titulo: saved >= 0 ? "Mês encerrado, cartão sobreviveu 💪" : "Ops, o cartão venceu dessa vez",
      resumo: saved >= 0
        ? `Você fechou ${label} no azul — guardou ${fmt(saved)}.`
        : `Você gastou ${fmt(Math.abs(saved))} a mais do que ganhou em ${label}.`,
      destaque_positivo: "Continue acompanhando seus gastos semana a semana!",
      destaque_negativo: saved < 0 ? "Estouro registrado, vamos refletir." : null,
      categoria_campeã: "—",
      "dica_proxímo_mes": "Defina limites semanais para cada categoria.",
      score,
      emoji_do_mes: score >= 70 ? "🎉" : score >= 40 ? "😬" : "😰",
      frases_ruptura: saved >= 0 ? ["Término saudável: você ficou com o dinheiro."] : ["O cartão disse que precisa de espaço — e de limite."],
    };
  }
}

// ─── SCREEN: Add Receipt ──────────────────────────────────────────────────────
function AddReceiptScreen({ onBack, onConfirm, patterns }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState("s1");
  const fileRef = useRef();

  async function handleFile(f) {
    setFile(f); setError(null); setResult(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      const mime = f.type === "application/pdf" ? "application/pdf" : f.type;
      setLoading(true);
      try {
        const r = await analyzeReceipt(base64, mime, patterns);
        setResult(r); setSelectedCat(r.categoria);
      } catch { setError("Não consegui ler o comprovante. Tente uma imagem mais clara."); }
      finally { setLoading(false); }
    };
    reader.readAsDataURL(f);
  }

  function confirm() {
    if (!result) return;
    onConfirm({ ...result, categoria: selectedCat, weekId: selectedWeek, file: preview, ts: Date.now() });
  }

  return (
    <Screen pb="2rem">
      <ScreenHeader label="Novo lançamento" title="Comprovante" onBack={onBack} />

      {/* Seleção de semana */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Em qual semana?</div>
        <div style={{ display: "flex", gap: 8 }}>
          {WEEKS.map(w => (
            <button key={w.id} onClick={() => setSelectedWeek(w.id)} style={{
              flex: 1, padding: "8px 4px", borderRadius: 12,
              background: selectedWeek === w.id ? T.dark : T.bg,
              border: `1.5px solid ${selectedWeek === w.id ? T.dark : T.border}`,
              color: selectedWeek === w.id ? T.bg : T.muted,
              cursor: "pointer", fontFamily: T.fontMain, fontSize: 12, fontWeight: 600
            }}>{w.label}</button>
          ))}
        </div>
      </div>

      {!file && (
        <div onClick={() => fileRef.current.click()} style={{
          border: `2px dashed ${T.border}`, borderRadius: 24, padding: "48px 24px",
          textAlign: "center", cursor: "pointer", background: T.bg
        }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: T.dark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            {Icons.camera(T.bg)}
          </div>
          <div style={{ fontFamily: T.fontMain, fontSize: 16, fontWeight: 600, color: T.dark, marginBottom: 6 }}>Soltar arquivo aqui</div>
          <div style={{ fontFamily: T.fontSec, fontSize: 13, color: T.muted }}>JPG, PNG ou PDF · foto, print, nota fiscal</div>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }}
            onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
        </div>
      )}

      {preview && file?.type !== "application/pdf" && (
        <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 16, border: `1.5px solid ${T.border}` }}>
          <img src={preview} alt="comprovante" style={{ width: "100%", maxHeight: 220, objectFit: "cover" }} />
        </div>
      )}

      {preview && file?.type === "application/pdf" && (
        <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: T.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {Icons.receipt(T.bg)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 600, color: T.dark }}>{file.name}</div>
            <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted }}>PDF carregado</div>
          </div>
          <button onClick={() => { setFile(null); setPreview(null); setResult(null); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 22 }}>×</button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", animation: "pulse 1.5s ease-in-out infinite" }}>
            {Icons.scissors(T.bg)}
          </div>
          <div style={{ fontFamily: T.fontMain, fontSize: 15, fontWeight: 600, color: T.dark, marginBottom: 4 }}>Analisando comprovante…</div>
          <div style={{ fontFamily: T.fontSec, fontSize: 12, color: T.muted }}>Claude está lendo os dados</div>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
        </div>
      )}

      {error && (
        <div style={{ background: "#FFF0E8", border: `1.5px solid ${T.orange}`, borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            {Icons.alert(T.orange)}
            <div>
              <div style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 600, color: T.dark }}>{error}</div>
              <button onClick={() => { setFile(null); setPreview(null); setError(null); }}
                style={{ fontFamily: T.fontSec, fontSize: 12, color: T.orange, background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 4, fontWeight: 600 }}>
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div>
          <div style={{ ...s.card, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: T.fontMain, fontSize: 17, fontWeight: 700, color: T.dark }}>{result.estabelecimento}</div>
                <div style={{ fontFamily: T.fontSec, fontSize: 12, color: T.muted, marginTop: 2 }}>{result.data || "data não identificada"}</div>
              </div>
              <div style={{ fontFamily: T.fontMain, fontSize: 22, fontWeight: 800, color: T.dark }}>{fmt(result.valor)}</div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
              padding: "10px 12px", borderRadius: 12,
              background: result.confianca >= 85 ? "#F0FFF4" : "#FFF8E0",
              border: `1px solid ${result.confianca >= 85 ? "#4CAF50" : T.gold}`
            }}>
              {result.confianca >= 85 ? Icons.check("#4CAF50") : Icons.alert(T.gold)}
              <span style={{ fontFamily: T.fontSec, fontSize: 12, color: result.confianca >= 85 ? "#2E7D32" : "#A07000", fontWeight: 500 }}>
                {result.confianca}% confiança · {result.motivo}
              </span>
            </div>

            <div style={{ fontFamily: T.fontSec, fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Categoria</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setSelectedCat(c.id)} style={{
                  padding: "7px 16px", borderRadius: 50, cursor: "pointer", fontFamily: T.fontMain, fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                  background: selectedCat === c.id ? c.pill.bg : "#F0F0F0",
                  color: selectedCat === c.id ? c.pill.color : T.muted,
                  border: `2px solid ${selectedCat === c.id ? c.pill.border : "transparent"}`
                }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={confirm} style={{
            width: "100%", padding: "15px", borderRadius: 50,
            background: T.grad, color: T.bg, border: "none",
            cursor: "pointer", fontFamily: T.fontMain, fontSize: 15, fontWeight: 700
          }}>
            Confirmar e descontar →
          </button>
        </div>
      )}
    </Screen>
  );
}

// ─── SCREEN: Receipts ─────────────────────────────────────────────────────────
function ReceiptsScreen({ receipts, onBack }) {
  const [selected, setSelected] = useState(null);
  return (
    <Screen pb="2rem">
      <ScreenHeader label="Arquivados" title="Comprovantes" onBack={onBack} />
      {receipts.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: T.dark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            {Icons.receipt(T.bg)}
          </div>
          <div style={{ fontFamily: T.fontMain, fontSize: 15, fontWeight: 600, color: T.dark }}>Nenhum comprovante ainda</div>
          <div style={{ fontFamily: T.fontSec, fontSize: 13, color: T.muted, marginTop: 4 }}>Adicione um gasto para começar</div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {receipts.map((r, i) => {
          const cat = CATEGORIES.find(c => c.id === r.categoria);
          const weekLabel = WEEKS.find(w => w.id === r.weekId)?.label || "";
          return (
            <div key={i} onClick={() => setSelected(selected === i ? null : i)} style={{ ...s.card, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {r.file?.startsWith("data:image") ? (
                    <img src={r.file} alt="" style={{ width: 42, height: 42, borderRadius: 12, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: T.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {Icons.receipt(T.bg)}
                    </div>
                  )}
                  <div>
                    <div style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 600, color: T.dark }}>{r.estabelecimento}</div>
                    <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted }}>
                      {weekLabel && <span style={{ marginRight: 6 }}>{weekLabel} ·</span>}
                      {r.data || new Date(r.ts).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: T.fontMain, fontSize: 14, fontWeight: 700, color: T.dark }}>{fmt(r.valor)}</div>
                  {cat && <CategoryTag cat={cat} small active />}
                </div>
              </div>
              {selected === i && r.file?.startsWith("data:image") && (
                <img src={r.file} alt="comprovante" style={{ width: "100%", borderRadius: 12, marginTop: 12, objectFit: "contain", maxHeight: 300 }} />
              )}
            </div>
          );
        })}
      </div>
    </Screen>
  );
}

// ─── SCREEN: History ──────────────────────────────────────────────────────────
function HistoryScreen({ allData, onBack }) {
  const months = Object.keys(allData).sort().reverse();
  return (
    <Screen pb="2rem">
      <ScreenHeader label="Histórico" title="Meses anteriores" onBack={onBack} />

      {months.length > 1 && (
        <div style={{ ...s.cardDark, marginBottom: 20 }}>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>Evolução mensal</div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 80 }}>
            {months.slice(0, 6).reverse().map(mk => {
              const d = allData[mk];
              if (!d) return null;
              const inc = totalIncome(d.income);
              const spent = totalMonthSpent(d.weeks);
              const maxVal = Math.max(...months.slice(0, 6).map(m => totalIncome(allData[m]?.income || {})));
              const h = maxVal > 0 ? (spent / maxVal) * 60 : 10;
              return (
                <div key={mk} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: h, borderRadius: 6, background: spent > inc ? T.orange : T.gradBar, minHeight: 6 }} />
                  <div style={{ fontFamily: T.fontSec, fontSize: 9, color: T.muted, textAlign: "center" }}>{monthLabelShort(mk)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {months.map(mk => {
          const d = allData[mk];
          if (!d) return null;
          const inc = totalIncome(d.income);
          const spent = totalMonthSpent(d.weeks);
          const saved = inc - spent;
          return (
            <div key={mk} style={{ ...s.card }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: T.fontMain, fontSize: 15, fontWeight: 700, color: T.dark, textTransform: "capitalize" }}>{monthLabel(mk)}</div>
                  <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, marginTop: 2 }}>{d.receipts?.length || 0} comprovantes</div>
                </div>
                <div style={{
                  fontFamily: T.fontMain, fontSize: 15, fontWeight: 700,
                  color: saved >= 0 ? "#2E7D32" : T.orange,
                  background: saved >= 0 ? "#F0FFF4" : "#FFF0E8",
                  padding: "4px 12px", borderRadius: 50
                }}>
                  {saved >= 0 ? "+" : ""}{fmtShort(saved)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: T.fontSec, fontSize: 10, color: T.muted }}>renda</div>
                  <div style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 700, color: T.dark }}>{fmtShort(inc)}</div>
                </div>
                <div>
                  <div style={{ fontFamily: T.fontSec, fontSize: 10, color: T.muted }}>gasto</div>
                  <div style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 700, color: T.dark }}>{fmtShort(spent)}</div>
                </div>
              </div>
              <ProgressBar pct={inc > 0 ? (spent / inc) * 100 : 0} overBudget={spent > inc} />
            </div>
          );
        })}
      </div>
    </Screen>
  );
}

// ─── SCREEN: Monthly Report ───────────────────────────────────────────────────
function ReportScreen({ monthData, currentMonth, onBack }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await generateMonthlyReport(monthData, currentMonth);
        setReport(r);
      } catch {
        setError("Não consegui gerar o relatório. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const inc = totalIncome(monthData.income);
  const spent = totalMonthSpent(monthData.weeks);
  const saved = inc - spent;
  const label = monthLabel(currentMonth);

  // Agregar categorias de todas as semanas
  const catSpent = {};
  CATEGORIES.forEach(c => catSpent[c.id] = 0);
  Object.values(monthData.weeks || {}).forEach(w => {
    CATEGORIES.forEach(c => { catSpent[c.id] += (w.spent?.[c.id] || 0); });
  });

  const catRanking = [...CATEGORIES]
    .map(c => ({ ...c, spent: catSpent[c.id] || 0 }))
    .filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  return (
    <Screen pb="3rem">
      <ScreenHeader label="Relatório mensal" title={label} onBack={onBack} />

      <div style={{ background: T.grad, borderRadius: 24, padding: "28px 24px", marginBottom: 16, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -30, top: -30, opacity: 0.1, transform: "scale(4)" }}>
          {Icons.scissors(T.bg)}
        </div>
        {loading ? (
          <div style={{ padding: "20px 0" }}>
            <div style={{ fontFamily: T.fontMain, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>Gerando relatório…</div>
          </div>
        ) : report ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{report.emoji_do_mes}</div>
            <div style={{ fontFamily: T.fontMain, fontSize: 20, fontWeight: 800, color: T.bg, marginBottom: 6, lineHeight: 1.2 }}>
              {report.titulo}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.2)", borderRadius: 50, padding: "6px 16px" }}>
              {Icons.star()}
              <span style={{ fontFamily: T.fontMain, fontSize: 14, fontWeight: 700, color: T.bg }}>Score {report.score}/100</span>
            </div>
          </>
        ) : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "renda", val: fmt(inc), color: T.dark },
          { label: "gasto", val: fmt(spent), color: spent > inc ? T.orange : T.dark },
          { label: "guardado", val: fmt(Math.abs(saved)), color: saved >= 0 ? "#2E7D32" : T.orange },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ ...s.card, textAlign: "center", padding: "14px 12px" }}>
            <div style={{ fontFamily: T.fontSec, fontSize: 10, color: T.muted, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: T.fontMain, fontSize: 14, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      {report && (
        <>
          <div style={{ ...s.cardDark, marginBottom: 16 }}>
            <div style={{ fontFamily: T.fontSec, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Análise do mês</div>
            <div style={{ fontFamily: T.fontSec, fontSize: 14, color: "#CCC", lineHeight: 1.6, marginBottom: 14 }}>
              {report.resumo}
            </div>
            {report.destaque_positivo && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: "rgba(255,215,0,0.1)", borderRadius: 12, marginBottom: 8 }}>
                {Icons.star()}
                <div style={{ fontFamily: T.fontSec, fontSize: 13, color: T.gold, fontWeight: 500 }}>{report.destaque_positivo}</div>
              </div>
            )}
            {report.destaque_negativo && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: "rgba(204,85,0,0.15)", borderRadius: 12 }}>
                {Icons.alert(T.orange)}
                <div style={{ fontFamily: T.fontSec, fontSize: 13, color: "#FF9966", fontWeight: 500 }}>{report.destaque_negativo}</div>
              </div>
            )}
          </div>

          {report.frases_ruptura && report.frases_ruptura.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: T.fontSec, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>O Breakup diz...</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {report.frases_ruptura.map((f, i) => (
                  <div key={i} style={{ ...s.card, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    {Icons.broken(T.orange)}
                    <div style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 500, color: T.dark, fontStyle: "italic" }}>"{f}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Gastos por categoria */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: T.fontSec, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          Gastos por categoria
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {catRanking.map((cat, rank) => {
            const pct = inc > 0 ? (cat.spent / inc) * 100 : 0;
            return (
              <div key={cat.id} style={{ ...s.card }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  {rank === 0 && <div style={{ background: T.grad, borderRadius: 50, padding: "2px 10px" }}>
                    <span style={{ fontFamily: T.fontMain, fontSize: 10, fontWeight: 700, color: T.bg }}>🔥 1º</span>
                  </div>}
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: T.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {CatIcons[cat.id] ? CatIcons[cat.id](T.bg) : null}
                      </div>
                      <span style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 600, color: T.dark }}>{cat.label}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: T.fontMain, fontSize: 14, fontWeight: 700, color: T.dark }}>{fmt(cat.spent)}</div>
                      <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted }}>{pct.toFixed(0)}% da renda</div>
                    </div>
                  </div>
                </div>
                <ProgressBar pct={pct} />
              </div>
            );
          })}
        </div>
      </div>

      {report?.dica_proxímo_mes && (
        <div style={{ background: T.dark, borderRadius: 20, padding: "20px 22px" }}>
          <div style={{ fontFamily: T.fontSec, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Dica pro próximo mês
          </div>
          <div style={{ fontFamily: T.fontSec, fontSize: 14, color: "#CCC", lineHeight: 1.6 }}>
            {report.dica_proxímo_mes}
          </div>
        </div>
      )}
    </Screen>
  );
}

// ─── SCREEN: Manual Expense Entry ────────────────────────────────────────────
function ManualExpenseScreen({ onBack, onConfirm }) {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("outros");
  const [weekId, setWeekId] = useState("s1");
  const [data, setData] = useState(() => new Date().toISOString().split("T")[0]);

  function confirm() {
    if (!nome || !valor || isNaN(+valor) || +valor <= 0) return;
    onConfirm({
      estabelecimento: nome,
      valor: +valor,
      categoria,
      weekId,
      data: new Date(data + "T12:00:00").toLocaleDateString("pt-BR"),
      confianca: 100,
      motivo: "cadastro manual",
      file: null,
      ts: Date.now(),
    });
  }

  const inputStyle = {
    width: "100%", background: T.bg, border: `1.5px solid ${T.border}`,
    borderRadius: 14, padding: "13px 16px", fontFamily: T.fontMain,
    fontSize: 15, fontWeight: 600, color: T.dark, outline: "none",
    boxSizing: "border-box",
  };

  const valid = nome.trim() && valor && !isNaN(+valor) && +valor > 0;

  return (
    <Screen pb="2rem">
      <ScreenHeader label="Novo lançamento" title="Gasto manual" onBack={onBack} />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Semana */}
        <div>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Em qual semana?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {WEEKS.map(w => (
              <button key={w.id} onClick={() => setWeekId(w.id)} style={{
                flex: 1, padding: "8px 4px", borderRadius: 12,
                background: weekId === w.id ? T.dark : T.bg,
                border: `1.5px solid ${weekId === w.id ? T.dark : T.border}`,
                color: weekId === w.id ? T.bg : T.muted,
                cursor: "pointer", fontFamily: T.fontMain, fontSize: 12, fontWeight: 600
              }}>{w.label}</button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nome / Estabelecimento</div>
          <input
            style={inputStyle}
            placeholder="Ex: Mercado, Netflix, Farmácia..."
            value={nome}
            onChange={e => setNome(e.target.value)}
          />
        </div>

        <div>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Valor (R$)</div>
          <input
            style={inputStyle}
            type="number"
            placeholder="0,00"
            value={valor}
            onChange={e => setValor(e.target.value)}
          />
        </div>

        <div>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Data</div>
          <input
            style={inputStyle}
            type="date"
            value={data}
            onChange={e => setData(e.target.value)}
          />
        </div>

        <div>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Categoria</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategoria(c.id)} style={{
                padding: "8px 18px", borderRadius: 50, cursor: "pointer",
                fontFamily: T.fontMain, fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                background: categoria === c.id ? c.pill.bg : "#F0F0F0",
                color: categoria === c.id ? c.pill.color : T.muted,
                border: `2px solid ${categoria === c.id ? c.pill.border : "transparent"}`,
              }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={confirm} disabled={!valid} style={{
          width: "100%", padding: "15px", borderRadius: 50, marginTop: 8,
          background: valid ? T.grad : "#E0E0E0",
          color: valid ? T.bg : T.muted,
          border: "none", cursor: valid ? "pointer" : "not-allowed",
          fontSize: 15, fontWeight: 700, fontFamily: T.fontMain
        }}>
          Confirmar e descontar →
        </button>
      </div>
    </Screen>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [allData, setAllData]     = useState(() => loadStorage());
  const [patterns, setPatterns]   = useState(() => loadPatterns());
  const [debtState, setDebtState] = useState(() => loadDebt());
  const [subs, setSubs]           = useState(() => loadSubs());
  const [weights, setWeights]     = useState(() => loadWeights());
  const [currentMonth]            = useState(() => monthKey());
  const [screen, setScreen]       = useState("dashboard");

  const monthData = allData[currentMonth];

  useEffect(() => { saveStorage(allData); },   [allData]);
  useEffect(() => { savePatterns(patterns); },  [patterns]);
  useEffect(() => { saveDebt(debtState); },     [debtState]);
  useEffect(() => { saveSubs(subs); },          [subs]);
  useEffect(() => { saveWeights(weights); },    [weights]);

  // ── Fatura do mês atual no Nubank ─────────────────────────────────────────
  // Mapeia mês atual para a fatura correspondente
  const MONTH_TO_INVOICE = { "06": "jun", "07": "jul", "08": "ago", "09": "set", "10": "out", "11": "nov", "12": "dez", "01": "jan" };
  const currentMonthNum  = currentMonth.split("-")[1]; // "05", "06", etc.
  const invoiceId        = MONTH_TO_INVOICE[currentMonthNum];
  const currentInvoice   = invoiceId ? NUBANK_INVOICES.find(i => i.id === invoiceId) : null;
  const currentInvoiceValue = currentInvoice && !debtState.paidIds.includes(invoiceId)
    ? currentInvoice.value : 0;

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleSetup(income) {
    setAllData(p => ({ ...p, [currentMonth]: initMonth(income) }));
  }

  function handleUpdateIncome(income) {
    setAllData(p => ({
      ...p,
      [currentMonth]: { ...p[currentMonth], income }
    }));
    setScreen("dashboard");
  }

  function handleTogglePaid(invoiceId) {
    setDebtState(prev => {
      const paid = prev.paidIds.includes(invoiceId);
      return { ...prev, paidIds: paid ? prev.paidIds.filter(id => id !== invoiceId) : [...prev.paidIds, invoiceId] };
    });
  }

  function handleUpdateWeekAlloc(weekId, catId, value) {
    setAllData(p => {
      const md = { ...p[currentMonth], weeks: { ...p[currentMonth].weeks } };
      md.weeks[weekId] = { ...md.weeks[weekId], alloc: { ...md.weeks[weekId].alloc, [catId]: value } };
      return { ...p, [currentMonth]: md };
    });
  }

  function handleUpdateWeekSpent(weekId, catId, value) {
    setAllData(p => {
      const md = { ...p[currentMonth], weeks: { ...p[currentMonth].weeks } };
      md.weeks[weekId] = { ...md.weeks[weekId], spent: { ...md.weeks[weekId].spent, [catId]: value } };
      return { ...p, [currentMonth]: md };
    });
  }

  // Distribui limites automaticamente em todas as semanas
  function handleAutoSplit() {
    const income = monthData?.income || {};
    const alloc  = calcAutoAlloc(income, currentInvoiceValue, subs, weights);
    setAllData(p => {
      const md = { ...p[currentMonth], weeks: { ...p[currentMonth].weeks } };
      WEEKS.forEach(w => {
        md.weeks[w.id] = { ...md.weeks[w.id], alloc: { ...alloc } };
      });
      return { ...p, [currentMonth]: md };
    });
  }

  function handleConfirmReceipt(receipt) {
    const name = receipt.estabelecimento?.toLowerCase().replace(/\s+/g, "_");
    if (name) setPatterns(p => ({ ...p, [name]: receipt.categoria }));
    const weekId = receipt.weekId || "s1";
    setAllData(p => {
      const md = { ...p[currentMonth], weeks: { ...p[currentMonth].weeks } };
      md.weeks[weekId] = {
        ...md.weeks[weekId],
        spent: { ...md.weeks[weekId].spent, [receipt.categoria]: (md.weeks[weekId].spent?.[receipt.categoria] || 0) + receipt.valor }
      };
      md.receipts = [...(md.receipts || []), receipt];
      return { ...p, [currentMonth]: md };
    });
    setScreen("dashboard");
  }

  function handleCloseMonth() {
    setAllData(p => ({ ...p, [currentMonth]: { ...p[currentMonth], closed: true } }));
    setScreen("report");
  }

  // ── Routing ───────────────────────────────────────────────────────────────
  if (!monthData) return <SetupScreen onSave={handleSetup} />;
  if (screen === "receipts")   return <ReceiptsScreen receipts={monthData.receipts || []} onBack={() => setScreen("dashboard")} />;
  if (screen === "history")    return <HistoryScreen allData={allData} onBack={() => setScreen("dashboard")} />;
  if (screen === "add")        return <AddReceiptScreen onBack={() => setScreen("dashboard")} onConfirm={handleConfirmReceipt} patterns={patterns} />;
  if (screen === "manual")     return <ManualExpenseScreen onBack={() => setScreen("dashboard")} onConfirm={handleConfirmReceipt} />;
  if (screen === "report")     return <ReportScreen monthData={monthData} currentMonth={currentMonth} onBack={() => setScreen("dashboard")} />;
  if (screen === "editIncome") return <EditIncomeScreen income={monthData.income || {}} onSave={handleUpdateIncome} onBack={() => setScreen("dashboard")} />;
  if (screen === "subs")       return <SubscriptionsScreen subs={subs} onSave={setSubs} onBack={() => setScreen("dashboard")} />;
  if (screen === "weights")    return <WeightsScreen weights={weights} income={monthData?.income || {}} currentInvoiceValue={currentInvoiceValue} subs={subs} onSave={setWeights} onBack={() => setScreen("dashboard")} />;

  return (
    <Dashboard
      monthData={monthData}
      onAddReceipt={() => setScreen("add")}
      onAddManual={() => setScreen("manual")}
      onNavigate={setScreen}
      currentMonth={currentMonth}
      allMonths={Object.keys(allData)}
      onCloseMonth={handleCloseMonth}
      debtState={debtState}
      onTogglePaid={handleTogglePaid}
      onUpdateWeekAlloc={handleUpdateWeekAlloc}
      onUpdateWeekSpent={handleUpdateWeekSpent}
      subs={subs}
      onAutoSplit={handleAutoSplit}
    />
  );
}
