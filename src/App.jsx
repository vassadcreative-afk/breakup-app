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
  const isSm = w < 375;   // iPhone SE / very small
  const isMd = w < 430;   // iPhone standard
  const isLg = w >= 430;  // iPhone Pro Max / tablets
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

// ─── SVG Icons (monochromatic filled) ────────────────────────────────────────
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
  heart: (c = T.bg) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={c}/>
    </svg>
  ),
  broken: (c = T.bg) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={c} opacity="0.3"/>
      <path d="M12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23" stroke={c} strokeWidth="1.5"/>
      <path d="M10 11l2-4 2 6 2-3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
  scissors: (c = T.bg) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="6" r="3" stroke={c} strokeWidth="2" fill="none"/>
      <circle cx="6" cy="18" r="3" stroke={c} strokeWidth="2" fill="none"/>
      <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  fire: (c = T.gold) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={c}>
      <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.09 2.04-5.85 5-7.32C8 9 8 10.5 9 11.5c1-2.5.5-5.5 2-8 2 2 3.5 4.5 3.5 7 .5-1 .5-2.5 1.5-3.5 1.5 2 2 4.5 1.5 7 .97.5 1.5 1.5 1.5 2.5 0 2.76-3.13 5-7 5z"/>
    </svg>
  ),
};

// Ícone de categoria como SVG
const CatIcons = {
  comida: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
  transporte: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>,
  contas: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={c === T.bg ? T.dark : T.bg} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/></svg>,
  lazer: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  saude: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  outros: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" stroke={c === T.bg ? T.dark : T.bg} strokeWidth="2" strokeLinecap="round"/></svg>,
};

// ─── Storage ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "breakup_data_v1";
const PATTERNS_KEY = "breakup_patterns_v1";
function loadStorage() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } }
function saveStorage(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function loadPatterns() { try { return JSON.parse(localStorage.getItem(PATTERNS_KEY) || "{}"); } catch { return {}; } }
function savePatterns(p) { localStorage.setItem(PATTERNS_KEY, JSON.stringify(p)); }

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
  return { income, alloc, spent: {}, receipts: [], closed: false };
}
function totalIncome(inc) { return (inc.salary || 0) + (inc.vr || 0) + (inc.vt || 0) + (inc.extras || []).reduce((a, e) => a + (e.value || 0), 0); }
function totalAlloc(alloc) { return Object.values(alloc).reduce((a, v) => a + v, 0); }
function totalSpent(spent) { return Object.values(spent).reduce((a, v) => a + (v || 0), 0); }
const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtShort = (v) => {
  if (Math.abs(v) >= 1000) return `R$${(v / 1000).toFixed(1)}k`;
  return fmt(v);
};

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
  const spent = totalSpent(monthData.spent);
  const saved = inc - spent;
  const label = monthLabel(monthKey);
  const catBreakdown = CATEGORIES.map(c => ({
    categoria: c.label,
    orcamento: monthData.alloc[c.id] || 0,
    gasto: monthData.spent[c.id] || 0
  }));

  const prompt = `Você é o Breakup — um app com personalidade de "término com o cartão de crédito". 
Tom: honesto, empático, levemente dramático como uma conversa de término, mas construtivo.
Dados do mês de ${label}:
- Renda total: ${fmt(inc)}
- Total gasto: ${fmt(spent)}
- Guardado/Excedente: ${fmt(saved)} (${saved >= 0 ? 'positivo' : 'negativo'})
- Por categoria: ${JSON.stringify(catBreakdown)}
- Comprovantes registrados: ${monthData.receipts?.length || 0}

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
  return JSON.parse(text.replace(/```json|```/g, "").trim());
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

// Responsive screen wrapper
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

// ─── SCREEN: Setup ────────────────────────────────────────────────────────────
function SetupScreen({ onSave }) {
  const [salary, setSalary] = useState("");
  const [vr, setVr] = useState("");
  const [vt, setVt] = useState("");
  const [extras, setExtras] = useState([]);
  const [extraLabel, setExtraLabel] = useState("");
  const [extraVal, setExtraVal] = useState("");
  const [alloc, setAlloc] = useState({ comida: 30, transporte: 10, contas: 30, lazer: 15, saude: 10, outros: 5 });
  const [step, setStep] = useState(1);

  const total = (+salary || 0) + (+vr || 0) + (+vt || 0) + extras.reduce((a, e) => a + e.value, 0);
  const pctUsed = Object.values(alloc).reduce((a, v) => a + v, 0);

  function addExtra() {
    if (!extraLabel || !extraVal) return;
    setExtras(p => [...p, { label: extraLabel, value: +extraVal }]);
    setExtraLabel(""); setExtraVal("");
  }

  function setA(id, val) { setAlloc(p => ({ ...p, [id]: Math.max(0, Math.min(100, +val)) })); }

  function save() {
    const income = { salary: +salary, vr: +vr, vt: +vt, extras };
    const incomeTotal = totalIncome(income);
    const allocAmt = {};
    CATEGORIES.forEach(c => { allocAmt[c.id] = (alloc[c.id] / 100) * incomeTotal; });
    allocAmt.comida += +vr;
    allocAmt.transporte += +vt;
    onSave(income, allocAmt);
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
        <Logo size="lg" />
        <div style={{ marginTop: 24, background: T.dark, borderRadius: 20, padding: "20px 22px" }}>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, fontWeight: 500, marginBottom: 6 }}>
            {step === 1 ? "Passo 1 de 2" : "Passo 2 de 2"}
          </div>
          <div style={{ fontFamily: T.fontMain, fontSize: 18, fontWeight: 700, color: T.bg, lineHeight: 1.2 }}>
            {step === 1 ? "Qual é a sua renda esse mês?" : "Como você quer distribuir?"}
          </div>
          <div style={{ fontFamily: T.fontSec, fontSize: 13, color: T.muted, marginTop: 6 }}>
            {step === 1 ? "A gente vai te ajudar a terminar com o cartão 💔" : "Ajuste como quiser — pode mudar depois."}
          </div>
        </div>
      </div>

      {step === 1 && (
        <>
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

          <button onClick={() => total > 0 && setStep(2)} disabled={!total}
            style={{
              width: "100%", padding: "15px", borderRadius: 50,
              background: total > 0 ? T.grad : "#E0E0E0",
              color: total > 0 ? T.bg : T.muted,
              border: "none", cursor: total > 0 ? "pointer" : "not-allowed",
              fontSize: 15, fontWeight: 700, fontFamily: T.fontMain
            }}>
            Próximo →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: T.fontSec, fontSize: 13, color: T.muted }}>Distribuição das categorias</div>
            <div style={{ fontFamily: T.fontMain, fontSize: 14, fontWeight: 700, color: pctUsed > 100 ? T.orange : T.dark }}>{pctUsed}% alocado</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.id} style={{ background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: T.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {CatIcons[cat.id] ? CatIcons[cat.id](T.bg) : <span style={{ color: T.bg, fontSize: 12 }}>{cat.icon}</span>}
                    </div>
                    <span style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 600, color: T.dark }}>{cat.label}</span>
                  </div>
                  <span style={{ fontFamily: T.fontMain, fontSize: 14, fontWeight: 700, color: T.dark }}>{fmt((alloc[cat.id] / 100) * total)}</span>
                </div>
                <input type="range" min={0} max={100} step={1} value={alloc[cat.id]} onChange={e => setA(cat.id, e.target.value)}
                  style={{ width: "100%", accentColor: T.orange }} />
                <div style={{ display: "flex", justifyContent: "flex-end", fontFamily: T.fontSec, fontSize: 11, color: T.muted }}>{alloc[cat.id]}%</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} style={{
              flex: "0 0 auto", padding: "14px 20px", borderRadius: 50, background: T.bg,
              border: `1.5px solid ${T.border}`, color: T.dark, cursor: "pointer", fontFamily: T.fontMain, fontWeight: 600, fontSize: 14
            }}>← Voltar</button>
            <button onClick={save} disabled={pctUsed > 100} style={{
              flex: 1, padding: "14px", borderRadius: 50,
              background: pctUsed > 100 ? "#E0E0E0" : T.grad,
              color: pctUsed > 100 ? T.muted : T.bg,
              border: "none", cursor: pctUsed > 100 ? "not-allowed" : "pointer",
              fontSize: 15, fontWeight: 700, fontFamily: T.fontMain
            }}>
              Começar o mês 💔
            </button>
          </div>
        </>
      )}
    </Screen>
  );
}

// ─── SCREEN: Dashboard ────────────────────────────────────────────────────────
function Dashboard({ monthData, onAddReceipt, onNavigate, currentMonth, allMonths, onCloseMonth }) {
  const { income, alloc, spent, receipts, closed } = monthData;
  const incTotal = totalIncome(income);
  const spentTotal = totalSpent(spent);
  const saved = incTotal - spentTotal;
  const pctSpent = incTotal > 0 ? (spentTotal / incTotal) * 100 : 0;
  const { num } = useResponsive();

  return (
    <Screen pb="6rem">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Logo />
        <div style={{ display: "flex", gap: 8 }}>
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

      {/* Hero card */}
      <div style={{
        background: saved >= 0 ? T.grad : T.dark,
        borderRadius: 24, padding: "22px 24px", marginBottom: 14,
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", right: -20, top: -20, opacity: 0.1, transform: "rotate(20deg)" }}>
          {Icons.scissors(T.bg)}
        </div>
        <div style={{ fontFamily: T.fontSec, fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>
          {saved >= 0 ? "esse mês você guardou" : "esse mês você estourou"}
        </div>
        <div style={{ fontFamily: T.fontMain, fontSize: num, fontWeight: 800, color: T.bg, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          {fmt(Math.abs(saved))}
        </div>
        <div style={{ fontFamily: T.fontSec, fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
          {saved >= 0 ? "pra quitar o cartão 🎉" : "acima do planejado 😬"}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <div>
            <div style={{ fontFamily: T.fontSec, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>gasto</div>
            <div style={{ fontFamily: T.fontMain, fontSize: 16, fontWeight: 700, color: T.bg }}>{fmt(spentTotal)}</div>
          </div>
          <div>
            <div style={{ fontFamily: T.fontSec, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>renda</div>
            <div style={{ fontFamily: T.fontMain, fontSize: 16, fontWeight: 700, color: T.bg }}>{fmt(incTotal)}</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontFamily: T.fontSec, fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>usado</div>
            <div style={{ fontFamily: T.fontMain, fontSize: 16, fontWeight: 700, color: saved >= 0 ? T.bg : T.orange }}>{pctSpent.toFixed(0)}%</div>
          </div>
        </div>
      </div>

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

      {/* Categories */}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: T.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {CatIcons[cat.id] ? CatIcons[cat.id](T.bg) : null}
                  </div>
                  <div>
                    <div style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 600, color: T.dark }}>{cat.label}</div>
                    <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted }}>orçamento {fmt(budget)}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: T.fontMain, fontSize: 15, fontWeight: 700, color: overBudget ? T.orange : T.dark }}>{fmt(used)}</div>
                  <div style={{ fontFamily: T.fontSec, fontSize: 11, fontWeight: 500, color: overBudget ? T.orange : "#4CAF50" }}>
                    {overBudget ? `+${fmt(used - budget)}` : `${fmt(remaining)} rest.`}
                  </div>
                </div>
              </div>
              <ProgressBar pct={pct} overBudget={overBudget} />
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 100 }}>
        <button onClick={onAddReceipt} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 28px", borderRadius: 50,
          background: T.grad, border: "none", cursor: "pointer",
          boxShadow: "0 8px 24px rgba(204,85,0,0.4)"
        }}>
          {Icons.plus(T.bg)}
          <span style={{ fontFamily: T.fontMain, fontSize: 14, fontWeight: 700, color: T.bg }}>Adicionar gasto</span>
        </button>
      </div>
    </Screen>
  );
}

// ─── SCREEN: Add Receipt ──────────────────────────────────────────────────────
function AddReceiptScreen({ onBack, onConfirm, patterns }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
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
    onConfirm({ ...result, categoria: selectedCat, file: preview, ts: Date.now() });
  }

  return (
    <Screen pb="2rem">
      <ScreenHeader label="Novo lançamento" title="Comprovante" onBack={onBack} />

      {!file && (
        <div onClick={() => fileRef.current.click()} style={{
          border: `2px dashed ${T.border}`, borderRadius: 24, padding: "48px 24px",
          textAlign: "center", cursor: "pointer", background: T.bg, transition: "border-color 0.2s"
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
                    <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted }}>{r.data || new Date(r.ts).toLocaleDateString("pt-BR")}</div>
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

      {/* Mini chart */}
      {months.length > 1 && (
        <div style={{ ...s.cardDark, marginBottom: 20 }}>
          <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>Evolução mensal</div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 80 }}>
            {months.slice(0, 6).reverse().map(mk => {
              const d = allData[mk];
              if (!d) return null;
              const inc = totalIncome(d.income);
              const spent = totalSpent(d.spent);
              const maxVal = Math.max(...months.slice(0, 6).map(m => totalIncome(allData[m] || {income:{}})));
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
          const spent = totalSpent(d.spent);
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
  const spent = totalSpent(monthData.spent);
  const saved = inc - spent;
  const label = monthLabel(currentMonth);

  // Sort categories by spent desc
  const catRanking = [...CATEGORIES]
    .map(c => ({ ...c, spent: monthData.spent[c.id] || 0, budget: monthData.alloc[c.id] || 0 }))
    .filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  return (
    <Screen pb="3rem">
      <ScreenHeader label="Relatório mensal" title={label} onBack={onBack} />

      {/* Score hero */}
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

      {/* Numbers */}
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

      {/* AI Summary */}
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

          {/* Breakup phrases */}
          {report.frases_ruptura && report.frases_ruptura.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: T.fontSec, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                O Breakup diz...
              </div>
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

      {/* Category breakdown */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: T.fontSec, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          Gastos por categoria
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {catRanking.map((cat, rank) => {
            const pct = inc > 0 ? (cat.spent / inc) * 100 : 0;
            const overBudget = cat.budget > 0 && cat.spent > cat.budget;
            return (
              <div key={cat.id} style={{ ...s.card, border: `1.5px solid ${overBudget ? T.orange : T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  {rank === 0 && <div style={{ background: T.grad, borderRadius: 50, padding: "2px 10px" }}>
                    <span style={{ fontFamily: T.fontMain, fontSize: 10, fontWeight: 700, color: T.bg }}>🔥 1º</span>
                  </div>}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: T.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {CatIcons[cat.id] ? CatIcons[cat.id](T.bg) : null}
                        </div>
                        <span style={{ fontFamily: T.fontMain, fontSize: 13, fontWeight: 600, color: T.dark }}>{cat.label}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: T.fontMain, fontSize: 14, fontWeight: 700, color: overBudget ? T.orange : T.dark }}>{fmt(cat.spent)}</div>
                        <div style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted }}>{pct.toFixed(0)}% da renda</div>
                      </div>
                    </div>
                  </div>
                </div>
                <ProgressBar pct={cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 100} overBudget={overBudget} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontFamily: T.fontSec, fontSize: 11, color: T.muted }}>orçamento {fmt(cat.budget)}</span>
                  <span style={{ fontFamily: T.fontSec, fontSize: 11, color: overBudget ? T.orange : "#4CAF50", fontWeight: 500 }}>
                    {overBudget ? `+${fmt(cat.spent - cat.budget)} acima` : `${fmt(cat.budget - cat.spent)} sobrou`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next month tip */}
      {report && report.dica_proxímo_mes && (
        <div style={{ background: T.dark, borderRadius: 20, padding: "20px 22px" }}>
          <div style={{ fontFamily: T.fontSec, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Dica pro próximo mês
          </div>
          <div style={{ fontFamily: T.fontSec, fontSize: 14, color: "#CCC", lineHeight: 1.6 }}>
            {report.dica_proxímo_mes}
          </div>
        </div>
      )}

      {error && (
        <div style={{ ...s.card, border: `1.5px solid ${T.orange}`, marginTop: 16 }}>
          <div style={{ fontFamily: T.fontSec, fontSize: 13, color: T.orange }}>{error}</div>
        </div>
      )}
    </Screen>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [allData, setAllData] = useState(() => loadStorage());
  const [patterns, setPatterns] = useState(() => loadPatterns());
  const [currentMonth] = useState(() => monthKey());
  const [screen, setScreen] = useState("dashboard");

  const monthData = allData[currentMonth];

  useEffect(() => { saveStorage(allData); }, [allData]);
  useEffect(() => { savePatterns(patterns); }, [patterns]);

  function handleSetup(income, alloc) {
    const base = initMonth(income);
    base.alloc = alloc;
    setAllData(p => ({ ...p, [currentMonth]: base }));
  }

  function handleConfirmReceipt(receipt) {
    const name = receipt.estabelecimento?.toLowerCase().replace(/\s+/g, "_");
    if (name) setPatterns(p => ({ ...p, [name]: receipt.categoria }));
    setAllData(p => {
      const md = { ...p[currentMonth] };
      md.spent = { ...md.spent };
      md.spent[receipt.categoria] = (md.spent[receipt.categoria] || 0) + receipt.valor;
      md.receipts = [...(md.receipts || []), receipt];
      return { ...p, [currentMonth]: md };
    });
    setScreen("dashboard");
  }

  function handleCloseMonth() {
    setAllData(p => {
      const md = { ...p[currentMonth], closed: true };
      return { ...p, [currentMonth]: md };
    });
    setScreen("report");
  }

  if (!monthData) return <SetupScreen onSave={handleSetup} />;
  if (screen === "receipts") return <ReceiptsScreen receipts={monthData.receipts || []} onBack={() => setScreen("dashboard")} />;
  if (screen === "history") return <HistoryScreen allData={allData} onBack={() => setScreen("dashboard")} />;
  if (screen === "add") return <AddReceiptScreen onBack={() => setScreen("dashboard")} onConfirm={handleConfirmReceipt} patterns={patterns} />;
  if (screen === "report") return <ReportScreen monthData={monthData} currentMonth={currentMonth} onBack={() => setScreen("dashboard")} />;

  return (
    <Dashboard
      monthData={monthData}
      onAddReceipt={() => setScreen("add")}
      onNavigate={setScreen}
      currentMonth={currentMonth}
      allMonths={Object.keys(allData)}
      onCloseMonth={handleCloseMonth}
    />
  );
}
