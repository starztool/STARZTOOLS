const DISCORD = "https://discord.gg/bXt6tUFTz3";
const KEY_USERS = "starz_users";
const KEY_SESS = "starz_session";
const ADMIN_NAME = "Lucio";
const ADMIN_PASS = "Lx7Orbit#K9m";
const COUNTRIES = [
  ["CH", "Schweiz"], ["DE", "Deutschland"], ["AT", "Österreich"], ["FR", "Frankreich"],
  ["IT", "Italien"], ["US", "USA"], ["GB", "UK"], ["NL", "Niederlande"], ["ES", "Spanien"], ["PL", "Polen"],
];
const PLANS = [
  { id: "30", name: "30 Tage", price: 9.9, blurb: "testen" },
  { id: "90", name: "90 Tage", price: 19.9, blurb: "Saison" },
  { id: "life", name: "Lifetime", price: 39.9, blurb: "bleibt" },
];
const PRODUCTS = [
  {
    id: "starz-tool", letter: "S", name: "STARZ TOOL", tag: "LIVE",
    blurb: "Farbe, Gamma, Visier. GPU greift im Vollbild.",
    shots: [["img/login.png", "Zugang"], ["img/app.png", "Panel"]],
    feats: [
      ["Licht", "Anzeige + Referenzmodus."],
      ["Farbe", "GPU-Farbe im Vollbild."],
      ["Visier", "Folgt dem Spiel-Monitor."],
      ["Leistung", "FPS-Boost, Tool offen lassen."],
    ],
  },
  { id: "starz-vault", letter: "V", name: "STARZ VAULT", tag: "SOON", soon: true, blurb: "Settings lokal. Bald." },
  { id: "starz-pulse", letter: "P", name: "STARZ PULSE", tag: "SOON", soon: true, blurb: "Latenz-Log. Bald." },
];
const PAY_HINT = {
  paypal: "PayPal · du wirst (Demo) lokal bestätigt. Merchant später koppeln.",
  twint: "TWINT · Schweiz. QR/App-Flow als Demo, dann bestätigt.",
  card: "Visa / Mastercard. Karte wird nicht an einen Server geschickt.",
  apple: "Apple Pay Demo-Bestätigung.",
};

const $ = (id) => document.getElementById(id);
const CLOUD_STORE = "https://crudcrud.com/api/03bce6aafc0e4f688cf21b4fda303ed0/orbit/6ab11f9139d42f03e877405c";
let plan = PLANS[1];
let payMethod = "paypal";
let authMode = "login";

function euro(n) { return n.toFixed(2).replace(".", ",") + " €"; }
function users() { try { return JSON.parse(localStorage.getItem(KEY_USERS) || "[]"); } catch { return []; } }
let orbitOnline = true;
let publicLink = location.href.split("#")[0];
function saveUsers(list) {
  localStorage.setItem(KEY_USERS, JSON.stringify(list));
  pushOrbit();
}
function storeBody() {
  return { online: orbitOnline, users: users(), link: publicLink, t: Date.now() };
}
async function pushOrbit() {
  localStorage.setItem("starz_online", orbitOnline ? "1" : "0");
  const body = JSON.stringify(storeBody());
  const put = { method: "PUT", headers: { "Content-Type": "application/json" }, body };
  try { await fetch(CLOUD_STORE, put); } catch { /* ignore */ }
  try { await fetch("/api/orbit", put); } catch { /* ignore */ }
}
async function pullOrbit() {
  let orbit = null;
  try {
    const r = await fetch(CLOUD_STORE, { cache: "no-store" });
    if (r.ok) orbit = await r.json();
  } catch { /* try local */ }
  if (!orbit) {
    try {
      const r = await fetch("/api/orbit", { cache: "no-store" });
      if (r.ok) orbit = await r.json();
    } catch { /* localStorage */ }
  }
  if (orbit) {
    if (Array.isArray(orbit.users) && orbit.users.length) {
      localStorage.setItem(KEY_USERS, JSON.stringify(orbit.users));
    }
    if (typeof orbit.online === "boolean") orbitOnline = orbit.online;
  } else {
    orbitOnline = localStorage.getItem("starz_online") !== "0";
  }
  publicLink = new URL(".", location.href).href;
  applyGate();
}
function applyGate() {
  const down = $("downGate");
  if (!down) return;
  down.hidden = orbitOnline || isAdmin(me());
  const a = $("siteLink");
  if (a) { a.textContent = publicLink; a.href = publicLink; }
}
function session() { try { return JSON.parse(localStorage.getItem(KEY_SESS) || "null"); } catch { return null; } }
function setSession(u) {
  if (u) localStorage.setItem(KEY_SESS, JSON.stringify({ name: u.name }));
  else localStorage.removeItem(KEY_SESS);
}
function me() {
  const s = session();
  return s ? users().find((u) => u.name === s.name) || null : null;
}
function seedAdmin() {
  const list = users();
  const lucio = {
    name: ADMIN_NAME, pass: ADMIN_PASS, admin: true,
    mail: "lucio@starz.orbit", full: "Lucio", country: "CH",
    since: "21.09.2026", id: "ORB-ADMIN", orders: [], keys: [], planHint: "ADMIN",
  };
  const i = list.findIndex((u) => u.name === ADMIN_NAME);
  if (i < 0) list.push(lucio);
  else Object.assign(list[i], { pass: ADMIN_PASS, admin: true, country: list[i].country || "CH" });
  saveUsers(list);
}
function orb(letter, size) {
  return `<span class="logo-orb ${size || ""}"><i></i><i></i><b>${letter}</b></span>`;
}
const KEY_PLANS = [
  { id: "1d", name: "1 Tag", days: 1 },
  { id: "week", name: "Woche", days: 7 },
  { id: "month", name: "Monat", days: 30 },
  { id: "life", name: "Life", days: 0 },
  { id: "admin", name: "Admin", days: 0 },
];
let keyPlan = "month";

function mintKey() {
  const c = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `STARZ-${c()}-${c()}-${c()}`;
}
function isAdmin(u) {
  return Boolean(u && (u.admin || String(u.name).toLowerCase() === ADMIN_NAME.toLowerCase()));
}
function findUser(list, name) {
  const n = String(name || "").toLowerCase();
  return list.find((x) => String(x.name).toLowerCase() === n) || null;
}
function planMeta(id) {
  return KEY_PLANS.find((p) => p.id === id) || KEY_PLANS[2];
}
function untilOf(days) {
  if (!days) return "∞";
  const d = new Date(Date.now() + days * 86400000);
  return d.toLocaleDateString("de-CH");
}
function oid() { return "ORD-" + Date.now().toString(36).toUpperCase(); }

function hideViews() {
  ["view-home", "view-product", "view-profile", "view-orders", "view-admin"].forEach((id) => {
    $(id).hidden = true;
  });
  $("userMenu").hidden = true;
}
function showHome() {
  hideViews();
  $("view-home").hidden = false;
  history.replaceState(null, "", "#home");
}

function renderCatalog() {
  $("catalogGrid").innerHTML = PRODUCTS.map(
    (p) => `<button type="button" class="pcard${p.soon ? " is-soon" : ""}" data-open="${p.id}">
      ${orb(p.letter)}<span class="tag">${p.tag}</span><h3>${p.name}</h3><p>${p.blurb}</p></button>`
  ).join("");
}

function showProduct(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  if (p.soon) { alert(`${p.name} kommt noch.`); return; }
  hideViews();
  $("view-product").hidden = false;
  history.replaceState(null, "", `#p/${p.id}`);
  $("productRoot").innerHTML = `
    <div class="shots">
      ${p.shots.map(([src, cap]) => `<figure><img src="${src}" alt="${cap}" /><figcaption>${cap}</figcaption></figure>`).join("")}
      <div class="feats">${p.feats.map(([h, t]) => `<article><h3>${h}</h3><p>${t}</p></article>`).join("")}</div>
    </div>
    <aside class="buy-card">
      ${orb(p.letter)}
      <p class="eyebrow">PRODUKT</p>
      <h2>${p.name}</h2>
      <p class="lede">${p.blurb}</p>
      <div class="plans" id="plans"></div>
      <button class="btn btn--solid btn--wide" id="cardBuy" type="button">Checkout</button>
    </aside>`;
  bindPlans();
  $("cardBuy").addEventListener("click", openBuy);
}

function bindPlans() {
  const box = $("plans");
  if (!box) return;
  box.innerHTML = PLANS.map(
    (p) => `<button type="button" class="plan${p.id === plan.id ? " is-on" : ""}" data-plan="${p.id}">
      <span>${p.name}<small style="display:block;color:#8a8a8a">${p.blurb}</small></span><b>${euro(p.price)}</b></button>`
  ).join("");
  box.onclick = (e) => {
    const b = e.target.closest("[data-plan]");
    if (!b) return;
    plan = PLANS.find((x) => x.id === b.dataset.plan);
    bindPlans();
    fillPlanSelect();
  };
  fillPlanSelect();
}
function fillPlanSelect() {
  $("planSelect").innerHTML = PLANS.map(
    (p) => `<option value="${p.id}" ${p.id === plan.id ? "selected" : ""}>${p.name} — ${euro(p.price)}</option>`
  ).join("");
  $("total").textContent = euro(plan.price);
}

function showProfile() {
  const u = me();
  if (!u) { openAuth(); return; }
  hideViews();
  $("view-profile").hidden = false;
  history.replaceState(null, "", "#profile");
  const land = COUNTRIES.find((c) => c[0] === u.country)?.[1] || u.country || "—";
  $("profileRoot").innerHTML = `
    <div class="profile-hero">
      ${orb(u.admin ? "A" : "S")}
      <div>
        <p class="eyebrow">${u.admin ? "ADMIN" : "PILOT"}</p>
        <h1>${u.name}</h1>
        <p class="lede">${u.full || u.name}<br/>${u.mail}<br/>${land} · ${u.id}</p>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><b>${String((u.orders || []).length).padStart(2, "0")}</b><span>Orders</span></div>
      <div class="stat"><b>${String((u.keys || []).filter((k) => k.status === "aktiv").length).padStart(2, "0")}</b><span>Keys</span></div>
      <div class="stat"><b>${u.planHint || "FREE"}</b><span>Status</span></div>
    </div>
    <p class="fine">Orders und Keys auch über das Profil-Menü oben rechts.</p>`;
}

function showOrders() {
  const u = me();
  if (!u) { openAuth(); return; }
  hideViews();
  $("view-orders").hidden = false;
  history.replaceState(null, "", "#orders");
  const orders = u.orders || [];
  const keys = u.keys || [];
  $("ordersRoot").innerHTML = `
    <p class="eyebrow">ACCOUNT</p>
    <h1>Orders</h1>
    <div class="board"><h3>BESTELLUNGEN</h3>
      ${orders.length ? orders.map((o) => `<div class="row"><span>${o.id}</span><span>${o.product} · ${o.plan}</span><span>${o.pay}</span><span>${o.status}</span></div>`).join("") : `<p class="empty">Keine Orders.</p>`}
    </div>
    <div class="board"><h3>KEYS</h3>
      ${keys.length ? keys.map((k) => `<div class="keyrow"><span>${k.code}<small> · ${k.planName || k.product || "STARZ"} · bis ${k.until || "∞"}</small></span><button type="button" class="btn copy" data-copy="${k.code}">Copy</button></div>`).join("") : `<p class="empty">Wartet auf Admin-Key.</p>`}
    </div>`;
  $("ordersRoot").onclick = (e) => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    navigator.clipboard.writeText(b.dataset.copy);
    b.textContent = "OK";
  };
}

function grantKey(acc, code, planId) {
  if (!acc) return false;
  const clean = String(code || "").trim().toUpperCase();
  if (!clean) return false;
  const meta = planMeta(planId || keyPlan);
  acc.keys = acc.keys || [];
  acc.orders = acc.orders || [];
  if (acc.keys.some((k) => String(k.code).toUpperCase() === clean)) return true;
  const rec = {
    code: clean,
    product: "STARZ TOOL",
    status: "aktiv",
    planId: meta.id,
    planName: meta.name,
    until: untilOf(meta.days),
  };
  acc.keys.push(rec);
  acc.planHint = meta.name;
  const open = [...acc.orders].reverse().find((o) => !o.key);
  if (open) {
    open.key = clean;
    open.status = "Key aktiv · " + meta.name;
    open.planName = meta.name;
    open.until = rec.until;
  }
  return true;
}

function showAdmin() {
  const u = me();
  if (!isAdmin(u)) return;
  hideViews();
  $("view-admin").hidden = false;
  history.replaceState(null, "", "#admin");
  const people = users().filter((x) => !isAdmin(x));
  $("adminRoot").innerHTML = `
    <p class="eyebrow">CONTROL</p>
    <h1>Admin</h1>
    <div class="site-sw">
      <button type="button" class="dur__btn${orbitOnline ? " is-on" : ""}" data-site="1">ONLINE</button>
      <button type="button" class="dur__btn${!orbitOnline ? " is-on" : ""}" data-site="0">OFFLINE</button>
      <div class="pub"${orbitOnline ? "" : " hidden"}>
        <span>Website-Link</span>
        <a id="siteLink" href="${publicLink}" target="_blank" rel="noopener">${publicLink}</a>
        <button type="button" class="btn copy" data-copylink>Copy</button>
      </div>
    </div>
    <p class="lede">Laufzeit direkt beim User wählen, Key aus dem Tool einfügen, setzen. X löscht.</p>
    <div class="board">
      <h3>ORDERS / KONTEN</h3>
      ${people.length ? people.map((p) => {
        const land = COUNTRIES.find((c) => c[0] === p.country)?.[1] || p.country || "?";
        const orders = p.orders || [];
        const keys = p.keys || [];
        const uname = encodeURIComponent(p.name);
        const pick = p.lastPlan || keyPlan;
        return `<article class="admin-card">
          <div class="admin-card__top">
            <span><b>${p.name}</b><br/><small>${p.mail}</small></span>
            <span>${p.full || p.name}<br/><small>${land}</small></span>
            <span>${orders.length ? orders.map((o) => `${o.product} ${o.plan}<br/><small>${o.status}${o.key ? " · " + o.key : ""}</small>`).join("") : "<small>keine Order</small>"}</span>
          </div>
          <div class="dur dur--row">
            ${KEY_PLANS.map((pl) => `<button type="button" class="dur__btn${pl.id === pick ? " is-on" : ""}" data-dur="${pl.id}">${pl.name}</button>`).join("")}
          </div>
          <div class="admin-keys">${keys.length ? keys.map((k) => `<span class="kchip"><b>${k.code}</b><i>${k.planName || ""} · ${k.until || "∞"}</i><button type="button" class="x" data-del="${uname}" data-code="${encodeURIComponent(k.code)}" aria-label="löschen">×</button></span>`).join("") : "<small>noch kein Key</small>"}</div>
          <div class="key-add">
            <input data-user="${uname}" placeholder="Key aus dem Tool einfügen" />
            <button class="btn btn--solid" type="button" data-grant="${uname}">Key setzen</button>
          </div>
        </article>`;
      }).join("") : `<p class="empty">Noch keine Kunden.</p>`}
    </div>`;
  $("adminRoot").onclick = (e) => {
    const site = e.target.closest("[data-site]");
    if (site) {
      orbitOnline = site.dataset.site === "1";
      applyGate();
      showAdmin();
      pushOrbit();
      return;
    }
    if (e.target.closest("[data-copylink]")) {
      navigator.clipboard.writeText(publicLink);
      return;
    }
    const dur = e.target.closest("[data-dur]");
    if (dur) {
      dur.closest("article").querySelectorAll("[data-dur]").forEach((b) => b.classList.toggle("is-on", b === dur));
      return;
    }
    const del = e.target.closest("[data-del]");
    if (del) {
      const list = users();
      const acc = findUser(list, decodeURIComponent(del.dataset.del));
      const code = decodeURIComponent(del.dataset.code);
      if (acc) {
        acc.keys = (acc.keys || []).filter((k) => k.code !== code);
        (acc.orders || []).forEach((o) => {
          if (o.key === code) { o.key = ""; o.status = "Key entfernt"; }
        });
        saveUsers(list);
      }
      showAdmin();
      return;
    }
    const grant = e.target.closest("[data-grant]");
    if (!grant) return;
    const name = decodeURIComponent(grant.dataset.grant);
    const card = grant.closest("article");
    const inp = card.querySelector("input");
    const durOn = card.querySelector("[data-dur].is-on");
    const planId = durOn?.dataset.dur || keyPlan;
    const code = (inp?.value || "").trim().toUpperCase();
    if (!code) { inp?.focus(); return; }
    const list = users();
    const acc = findUser(list, name);
    if (!grantKey(acc, code, planId)) return;
    acc.lastPlan = planId;
    saveUsers(list);
    if (inp) inp.value = "";
    burst(innerWidth / 2, 180);
    showAdmin();
  };
}

function paintAuth() {
  const u = me();
  $("authBtn").hidden = Boolean(u);
  $("avatarBtn").hidden = !u;
  $("menuAdmin").hidden = !isAdmin(u);
  if (u) $("avatarBtn").textContent = u.name.slice(0, 1).toUpperCase();
}

function openAuth() {
  $("authGate").hidden = false;
  startAuthStars();
}
function closeAuth() { $("authGate").hidden = true; }

$("countrySel").innerHTML = COUNTRIES.map(([c, n]) => `<option value="${c}">${n}</option>`).join("");
$("countrySel").value = "CH";

$("catalogGrid").addEventListener("click", (e) => {
  const b = e.target.closest("[data-open]");
  if (b) showProduct(b.dataset.open);
});
document.querySelectorAll(".nav__links a").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    showHome();
    const href = a.getAttribute("href");
    if (href !== "#home") setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 40);
  });
});
$("heroStarz").addEventListener("click", () => showProduct("starz-tool"));
$("backHome").addEventListener("click", showHome);
$("navHome").addEventListener("click", (e) => { e.preventDefault(); showHome(); });

$("authBtn").addEventListener("click", openAuth);
$("closeAuth").addEventListener("click", closeAuth);
$("downLogin").addEventListener("click", openAuth);
$("avatarBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  $("userMenu").hidden = !$("userMenu").hidden;
});
document.addEventListener("click", () => { $("userMenu").hidden = true; });
$("userMenu").addEventListener("click", (e) => {
  e.stopPropagation();
  const go = e.target.dataset.go;
  if (go === "profile") showProfile();
  if (go === "orders") showOrders();
  if (go === "admin") showAdmin();
  if (go === "logout") { setSession(null); paintAuth(); showHome(); }
});

document.querySelectorAll("[data-auth]").forEach((btn) => {
  btn.addEventListener("click", () => {
    authMode = btn.dataset.auth;
    document.querySelectorAll("[data-auth]").forEach((b) => b.classList.toggle("is-on", b === btn));
    $("loginForm").hidden = authMode !== "login";
    $("regForm").hidden = authMode !== "reg";
  });
});

$("regForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const name = String(f.get("name")).trim();
  const list = users();
  if (list.some((u) => u.name.toLowerCase() === name.toLowerCase())) { alert("Username belegt."); return; }
  list.push({
    name, pass: String(f.get("pass")), mail: String(f.get("mail")).trim(),
    full: String(f.get("full")).trim(), country: String(f.get("country")),
    admin: false, since: new Date().toLocaleDateString("de-DE"),
    id: "ORB-" + Math.floor(1000 + Math.random() * 9000),
    orders: [], keys: [], planHint: "FREE",
  });
  saveUsers(list);
  setSession({ name });
  closeAuth();
  paintAuth();
  showProfile();
});

$("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const name = String(f.get("name")).trim();
  const pass = String(f.get("pass"));
  const u = users().find((x) => x.name.toLowerCase() === name.toLowerCase() && x.pass === pass);
  if (!u) { alert("Uplink verweigert."); return; }
  setSession(u);
  closeAuth();
  paintAuth();
  if (isAdmin(u)) showAdmin();
  else showProfile();
  applyGate();
});

function openBuy() {
  if (!me()) { openAuth(); return; }
  $("buyName").value = me().name;
  fillPlanSelect();
  $("buyDrawer").hidden = false;
}
$("closeBuy").addEventListener("click", () => ($("buyDrawer").hidden = true));
$("buyDrawer").addEventListener("click", (e) => { if (e.target.id === "buyDrawer") $("buyDrawer").hidden = true; });
$("planSelect").addEventListener("change", (e) => {
  plan = PLANS.find((p) => p.id === e.target.value) || plan;
  fillPlanSelect();
});
$("pays").addEventListener("click", (e) => {
  const b = e.target.closest("[data-pay]");
  if (!b) return;
  payMethod = b.dataset.pay;
  [...$("pays").children].forEach((x) => x.classList.toggle("is-on", x === b));
  $("cardFields").hidden = payMethod !== "card";
  $("payHint").textContent = PAY_HINT[payMethod];
});

$("checkout").addEventListener("submit", (e) => {
  e.preventDefault();
  if (payMethod === "card") {
    const cc = e.target.cc.value.replace(/\s/g, "");
    if (cc.length < 12) { alert("Kartennummer unvollständig (Demo)."); return; }
  }
  const list = users();
  const u = list.find((x) => x.name === me().name);
  u.orders = u.orders || [];
  u.orders.push({
    id: oid(), product: "STARZ TOOL", plan: plan.name, price: plan.price,
    pay: payMethod.toUpperCase(), status: "bezahlt · wartet auf Key",
    at: new Date().toLocaleDateString("de-DE"),
  });
  saveUsers(list);
  $("buyDrawer").hidden = true;
  burst(innerWidth / 2, innerHeight / 2);
  showOrders();
});

$("faqList").innerHTML = [
  ["Zahlung?", "PayPal, TWINT (CH), Kreditkarte, Apple Pay — Demo-Checkout. Danach wartet die Order auf Lucios Key."],
  ["Admin?", "Lucio vergibt Keys im Admin. Der Key erscheint bei der Order des Kontos."],
  ["Cheat?", "Nein. Display-Farbe + Overlay-Visier."],
].map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("");

/* ----- boot loader that actually progresses ----- */
function starfield(canvas) {
  const c = canvas.getContext("2d");
  const fit = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  fit();
  addEventListener("resize", fit);
  const stars = Array.from({ length: 280 }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    z: Math.random() * 2.4 + 0.15, a: Math.random(),
  }));
  const warp = Array.from({ length: 90 }, () => ({
    x: 0, y: 0, z: Math.random() * canvas.width, pz: 0,
  }));
  const mets = [];
  let live = true;
  (function draw() {
    if (!live) return;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    c.fillStyle = "rgba(0,0,0,.42)";
    c.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s) => {
      s.y += s.z * 0.22;
      if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      c.globalAlpha = 0.25 + Math.sin(s.a += 0.04) * 0.5;
      c.fillStyle = "#fff";
      c.fillRect(s.x, s.y, s.z, s.z);
    });
    warp.forEach((w) => {
      w.z -= 18;
      if (w.z < 8) { w.z = canvas.width; w.pz = w.z; }
      if (w.x == null) w.x = (Math.random() - 0.5) * canvas.width;
      if (w.y == null) w.y = (Math.random() - 0.5) * canvas.height;
      const k = 128 / w.z;
      const pk = 128 / (w.pz || w.z);
      const sx = w.x * k + cx;
      const sy = w.y * k + cy;
      const px = w.x * pk + cx;
      const py = w.y * pk + cy;
      c.globalAlpha = Math.min(1, (1 - w.z / canvas.width) * 1.4);
      c.strokeStyle = "#fff";
      c.lineWidth = (1 - w.z / canvas.width) * 2.2;
      c.beginPath(); c.moveTo(px, py); c.lineTo(sx, sy); c.stroke();
      w.pz = w.z;
    });
    if (Math.random() < 0.04) {
      mets.push({ x: Math.random() * canvas.width, y: Math.random() * cy * 0.8, vx: 14, vy: 7, life: 1 });
    }
    mets.forEach((m, i) => {
      m.x += m.vx; m.y += m.vy; m.life -= 0.02;
      c.globalAlpha = m.life;
      const g = c.createLinearGradient(m.x, m.y, m.x - 70, m.y - 32);
      g.addColorStop(0, "#fff"); g.addColorStop(1, "transparent");
      c.strokeStyle = g; c.lineWidth = 2;
      c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(m.x - 70, m.y - 32); c.stroke();
      if (m.life <= 0) mets.splice(i, 1);
    });
    c.globalAlpha = 1;
    requestAnimationFrame(draw);
  })();
  return () => { live = false; };
}

function finishIntro() {
  const intro = $("intro");
  if (intro.classList.contains("is-out")) return;
  intro.classList.add("is-out");
  $("site").classList.add("is-on");
  document.body.classList.remove("locked");
  setTimeout(() => { intro.style.display = "none"; }, 1100);
}

async function runIntro() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishIntro();
    $("intro").style.display = "none";
    return;
  }
  const stop = starfield($("bootFx"));
  $("intro").classList.add("is-launch");
  const log = $("bootLog");
  const preload = (src) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = src; });
  const steps = [
    ["Sternenkarte", 16, () => document.fonts.ready],
    ["Orbit-Kern S", 32, () => Promise.resolve()],
    ["Fonts / HUD", 48, () => document.fonts.ready],
    ["Produkt-Cache", 67, () => Promise.all(["img/login.png", "img/app.png"].map(preload))],
    ["Key-Ring", 84, () => Promise.resolve()],
    ["Uplink bereit", 100, () => Promise.resolve()],
  ];
  $("skip").addEventListener("click", () => { stop(); finishIntro(); });
  for (const [label, pct, task] of steps) {
    if ($("intro").classList.contains("is-out")) break;
    const li = document.createElement("li");
    li.textContent = `> ${label} .............. ok`;
    log.appendChild(li);
    $("bootTag").textContent = "UPLINK // " + label.toUpperCase();
    $("introFill").style.width = pct + "%";
    $("introPct").textContent = String(pct).padStart(2, "0");
    await Promise.all([
      task(),
      new Promise((r) => setTimeout(r, 420 + Math.random() * 260)),
    ]);
  }
  if (!$("intro").classList.contains("is-out")) {
    await new Promise((r) => setTimeout(r, 350));
    stop();
    finishIntro();
  }
}

let authStarStop = null;
function startAuthStars() {
  if (authStarStop) return;
  authStarStop = starfield($("authFx"));
}

const canvas = $("fx");
const ctx = canvas.getContext("2d");
let stars = [];
let meteors = [];
const sparks = [];
function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  stars = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    r: Math.random() * 1.4 + 0.2, a: Math.random(), tw: Math.random() * 0.02 + 0.005,
  }));
}
function spawnMeteor() {
  if (Math.random() > 0.03) return;
  meteors.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.4, vx: 9, vy: 5, life: 1, len: 60 });
}
function burst(x, y) {
  for (let i = 0; i < 70; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * 6 + 1;
    sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, r: Math.random() * 2 });
  }
}
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach((s) => {
    s.a += s.tw;
    ctx.globalAlpha = 0.25 + Math.abs(Math.sin(s.a)) * 0.7;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  spawnMeteor();
  meteors.forEach((m, i) => {
    m.x += m.vx; m.y += m.vy; m.life -= 0.012;
    const g = ctx.createLinearGradient(m.x, m.y, m.x - m.len, m.y - m.len * 0.45);
    g.addColorStop(0, "rgba(255,255,255,.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalAlpha = Math.max(m.life, 0);
    ctx.strokeStyle = g; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.len, m.y - m.len * 0.45); ctx.stroke();
    if (m.life <= 0) meteors.splice(i, 1);
  });
  sparks.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.life -= 0.018;
    ctx.globalAlpha = p.life; ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    if (p.life <= 0) sparks.splice(i, 1);
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(loop);
}
addEventListener("resize", resize);
resize();
loop();

const cur = $("cursor");
let mx = 0, my = 0, cx = 0, cy = 0, ang = 45;
addEventListener("mousemove", (e) => {
  mx = e.clientX; my = e.clientY;
  sparks.push({ x: mx, y: my, vx: 0, vy: 0.5, life: 0.3, r: 1 });
});
(function follow() {
  const dx = mx - cx, dy = my - cy;
  cx += dx * 0.22; cy += dy * 0.22;
  if (Math.abs(dx) + Math.abs(dy) > 1.2) ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%) rotate(${ang}deg)`;
  requestAnimationFrame(follow);
})();

seedAdmin();
renderCatalog();
paintAuth();
pullOrbit().then(() => {
  seedAdmin();
  paintAuth();
  applyGate();
});
setInterval(() => { pullOrbit(); }, 4000);
runIntro();
if (location.hash.startsWith("#p/")) showProduct(location.hash.slice(3));
else if (location.hash === "#profile") showProfile();
else if (location.hash === "#admin") showAdmin();
else if (location.hash === "#orders") showOrders();
