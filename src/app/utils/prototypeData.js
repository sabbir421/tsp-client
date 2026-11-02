// TrueSpace Property Prototype Data & Utilities

let artN = 0;

export const DHAKA_ZONES={"Uttara & Airport":["Uttara","Nikunja","Khilkhet","Dakshinkhan","Cantonment"],"Gulshan, Banani & Baridhara":["Gulshan","Banani","Baridhara","Baridhara DOHS","Niketan","Mohakhali","Mohakhali DOHS"],"Bashundhara & East Dhaka":["Bashundhara R/A","Badda","Aftabnagar","Rampura","Banasree","Khilgaon","Malibagh"],"Purbachal & Jolshiri":["Purbachal","Jolshiri"],"Mirpur & West Dhaka":["Mirpur","Mirpur DOHS","Pallabi","Kafrul","Shyamoli","Mohammadpur","Lalmatia","Adabor"],"Central Dhaka":["Dhanmondi","Tejgaon","Farmgate","Kawran Bazar","Panthapath","Moghbazar","Eskaton","Shantinagar"],"Old Dhaka & South":["Motijheel","Wari","Old Dhaka","Lalbagh","Jatrabari"]};

export const DHAKA_CITY = "Dhaka";

export const LOCS = [];
export const LOCI = {};
Object.keys(DHAKA_ZONES).forEach((z) =>
  DHAKA_ZONES[z].forEach((n) => {
    const c = { v: n + ", Dhaka", t: "area", div: DHAKA_CITY, dist: z, n: n, l: n };
    LOCS.push(c);
    LOCI[c.v] = c;
  })
);
export const SECTORS = LOCS.map((o) => o.v);

export const OTHER_CAT = "Other locations";
export const OTHER_PFX = "Other locations: ";
export const OTHER_PICK = "__other__";

export function isOtherLoc(v) {
  return String(v || "").indexOf(OTHER_PFX) === 0;
}
export function otherTxt(v) {
  return isOtherLoc(v) ? String(v).slice(OTHER_PFX.length) : "";
}
export function otherKey(t) {
  return String(t || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function locInfo(v) {
  v = String(v || "").trim();
  if (!v) return null;
  if (LOCI[v]) return LOCI[v];
  if (v === OTHER_CAT)
    return { v: OTHER_CAT, t: "othercat", div: OTHER_CAT, dist: OTHER_CAT, n: OTHER_CAT, l: "All other locations" };
  if (isOtherLoc(v)) {
    const n = otherTxt(v).trim();
    return n ? { v: OTHER_PFX + n, t: "other", div: OTHER_CAT, dist: OTHER_CAT, n: n, l: n, other: true } : null;
  }
  const segments = v.split(",").map((s) => s.trim().toLowerCase());
  for (const seg of segments) {
    const ex = LOCS.find((o) => o.n.toLowerCase() === seg);
    if (ex) return ex;
  }
  for (const seg of segments) {
    const match = LOCS.find((o) => {
      const n = o.n.toLowerCase();
      return seg.startsWith(n + " ") || n.startsWith(seg + " ");
    });
    if (match) return match;
  }
  return null;
}

export function locTxt(v) {
  if (isOtherLoc(v)) return otherTxt(v);
  const o = locInfo(v);
  return o ? o.l : String(v || "");
}

export function locIn(pv, fv) {
  const f = locInfo(fv),
    p = locInfo(pv);
  if (!f) return pv === fv;
  if (!p) return false;
  if (f.t === "othercat") return p.t === "other";
  if (f.t === "other") return p.t === "other" && otherKey(p.n) === otherKey(f.n);
  if (p.t === "other" || p.t === "othercat") return false;
  if (f.t === "div") return p.div === f.div;
  if (f.t === "dist") return p.dist === f.dist;
  return p.v === f.v;
}

export function locScore(pv, areas) {
  areas = areas || [];
  if (areas.some((a) => locIn(pv, a))) return 30;
  const p = locInfo(pv);
  if (!p || p.other) return 0;
  if (
    areas.some((a) => {
      const f = locInfo(a);
      return f && !f.other && f.t !== "othercat" && f.dist && f.dist === p.dist;
    })
  )
    return 12;
  if (
    areas.some((a) => {
      const f = locInfo(a);
      return f && !f.other && f.t !== "othercat" && f.div === p.div;
    })
  )
    return 6;
  return 0;
}

export function comma(n) {
  return Math.round(Number(n) || 0).toLocaleString("en-IN");
}

export function money(n, purpose) {
  n = Number(n) || 0;
  if (purpose === "Rent") return "৳" + comma(n) + "/month";
  if (n >= 1e7) return "৳" + (n / 1e7).toFixed(2).replace(/\.?0+$/, "") + " Crore";
  return "৳" + (n / 1e5).toFixed(1).replace(/\.0$/, "") + " Lakh";
}

export const moneyTxt = (n, p) => money(n, p).replace(/<\/?small>/g, "");

export const PROPS = [];

export const DOCS=[{k:"nid",n:"National ID (NID)",d:"Front and back of the owner's NID",def:"approved"},{k:"deed",n:"Ownership deed (dolil) and mutation (namjari)",d:"Latest deed, khatian and mutation papers",def:"review"},{k:"tax",n:"Land development tax (khajna) receipt",d:"Most recent receipt",def:"missing"},{k:"util",n:"Utility bill",d:"Electricity, gas or WASA bill for the address",def:"missing"},{k:"photo",n:"Property photos",d:"At least 6 recent photos",def:"approved"}];

export const POSTS = [];

export const RPT = [];

export const MONTHS = [];

export const SAMPLE_REQ = null;

export const SREQ = [];

export const ROLES = {
  buyer: {
    label: "Buyer / Tenant",
    name: "Buyer / Tenant",
    email: "",
    home: "/dashboard?role=buyer",
    desc: "Post requirements, get verified matches, save homes and book viewings.",
  },
  tenant: {
    label: "Tenant",
    name: "Tenant",
    email: "",
    home: "/dashboard?role=buyer",
    desc: "Rent flats or homes in Dhaka, track requirements and schedule viewings.",
  },
  owner: {
    label: "Seller / Rent Giver",
    name: "Seller / Rent Giver",
    email: "",
    home: "/dashboard?role=owner",
    desc: "List flats for sale or rent, suggest properties to buyer requirements, approve viewings and get verified.",
  },
  rentgiver: {
    label: "Rent Giver",
    name: "Rent Giver",
    email: "",
    home: "/dashboard?role=owner",
    desc: "Rent out flats and commercial units, manage inquiries and viewings.",
  },
  agent: {
    label: "Agent",
    name: "Agent",
    email: "",
    home: "/dashboard?role=owner",
    desc: "Work for buyers, sellers or landlords, manage multi-property portfolios.",
  },
  company: {
    label: "Company / Developer",
    name: "Real Estate Company",
    email: "",
    home: "/dashboard?role=owner",
    desc: "Real estate developers, agencies and builders with multiple project developments.",
  },
  admin: {
    label: "Admin",
    name: "TrueSpace Admin",
    email: "admin@truespace.com",
    home: "/dashboard?role=admin",
    desc: "Approve listings, verify owners, manage users, reports and blog content.",
  },
};

export const ROLE_FEATS = {
  buyer: ["Saved properties and requirements", "Match results with scores", "Suggested properties and viewing requests"],
  tenant: ["Saved rentals and requirements", "Match results with scores", "Suggested rentals and viewing requests"],
  owner: ["Listing management", "Suggested properties and viewing requests", "Verification status and profile settings"],
  rentgiver: ["Listing rentals & commercial space", "Tenant requirements suggestions", "Verified badge verification"],
  agent: ["Multi-listing portfolio management", "Client requirement matching", "Direct viewing scheduling"],
  company: ["Project listings & corporate units", "Requirement matching & direct leads", "Developer verified badge"],
  admin: ["Overview metrics and user management", "Property approvals (incl. property photo, video and document checks) and Users (verification requests, badge types)", "Reports and blog content management"],
};

export function score(p, r) {
  if (!p || !r || !p.purpose || !r.purpose) return null;
  const out = { total: 0, parts: [], reasons: [] };
  if (p.purpose !== r.purpose) return null;
  let loc = locScore(p.area, r.areas);
  out.parts.push(["Location", loc, 30]);
  out.reasons.push([
    loc === 30,
    loc === 30
      ? locTxt(p.area) + " is one of your locations"
      : loc === 12
      ? "Near your preferred locations (same zone of Dhaka City)"
      : loc
      ? "Elsewhere in Dhaka City, outside your chosen neighbourhoods"
      : "Outside your preferred locations",
  ]);
  let bud = 0;
  const hasBudget = (r.minBudget && r.minBudget > 0) || (r.maxBudget && r.maxBudget > 0 && r.maxBudget < 999999999);
  if (!hasBudget) {
    bud = 30;
  } else if (p.price >= (r.minBudget || 0) && p.price <= (r.maxBudget || Infinity)) {
    bud = 30;
  } else if (r.minBudget && p.price < r.minBudget) {
    bud = 24;
  } else if (r.maxBudget && p.price <= r.maxBudget * 1.1) {
    bud = 15;
  }
  out.parts.push(["Budget", bud, 30]);
  out.reasons.push([
    bud >= 24,
    !hasBudget
      ? "Budget flexible / not specified"
      : bud === 30
      ? "Within your budget"
      : bud === 24
      ? "Below your budget"
      : bud
      ? "Up to 10% above budget (negotiable)"
      : "Above your budget",
  ]);
  const ty = r.type === "Any" || r.type === p.type ? 15 : 0;
  out.parts.push(["Property type", ty, 15]);
  out.reasons.push([!!ty, ty ? p.type + " as requested" : "Different property type (" + p.type + ")"]);
  let bd = 15;
  if (r.beds && p.type !== "Commercial" && p.type !== "Plot") {
    bd = p.beds >= r.beds ? 15 : p.beds === r.beds - 1 ? 7 : 0;
  } else if (r.beds) bd = 0;
  out.parts.push(["Bedrooms", bd, 15]);
  out.reasons.push([
    bd === 15,
    bd === 15 ? (r.beds ? p.beds + " beds (you need " + r.beds + "+)" : "Bedrooms are not a constraint") : p.beds + " beds, fewer than requested",
  ]);
  const sz = !r.minSize || p.size >= r.minSize ? 10 : p.size >= r.minSize * 0.9 ? 5 : 0;
  out.parts.push(["Size", sz, 10]);
  out.reasons.push([sz === 10, sz === 10 ? comma(p.size) + " sqft meets your minimum" : comma(p.size) + " sqft is below your minimum"]);
  out.total = loc + bud + ty + bd + sz;
  return out;
}

export function matchesFor(r, props) {
  if (!r) return [];
  const list = props || PROPS;
  return list
    .filter(Boolean)
    .map((p) => ({ p, s: score(p, r) }))
    .filter((x) => x.s && x.s.total >= 55)
    .sort((a, b) => b.s.total - a.s.total);
}

export function art(p, v) {
  if (!p) return '';
  v = v || 0;
  const pId = p && (p.id || p._id || p.hue || 'item');
  const h = ((p && p.hue ? p.hue : 200) + v * 35) % 360;
  const id = `g_${pId}_${v}`;
  const sky = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h},55%,80%)"/><stop offset="1" stop-color="hsl(${(h + 25) % 360},60%,95%)"/></linearGradient></defs><rect width="400" height="260" fill="url(#${id})"/><circle cx="${320 - v * 60}" cy="${58 + v * 6}" r="24" fill="#f2961d" opacity=".85"/>`;
 const ground='<rect y="232" width="400" height="28" fill="hsl(110,25%,52%)"/><rect y="244" width="400" height="16" fill="#9aa3b5"/>';
 const tree=x=>`<rect x="${x-3}" y="208" width="6" height="26" fill="#6b4d2e"/><circle cx="${x}" cy="200" r="16" fill="hsl(120,35%,38%)"/><circle cx="${x+9}" cy="208" r="11" fill="hsl(120,35%,44%)"/>`;
 let b="";
 if(v===2){
  return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="260" fill="hsl(${h},25%,92%)"/><rect y="190" width="400" height="70" fill="hsl(30,30%,72%)"/><rect x="40" y="40" width="130" height="110" rx="4" fill="hsl(${h},55%,82%)" stroke="#fff" stroke-width="8"/><line x1="105" y1="40" x2="105" y2="150" stroke="#fff" stroke-width="6"/><rect x="200" y="140" width="160" height="56" rx="12" fill="#1c2847"/><rect x="210" y="120" width="140" height="34" rx="12" fill="#2a3a63"/><rect x="226" y="132" width="36" height="22" rx="6" fill="#f2961d"/><rect x="60" y="196" width="90" height="8" rx="4" fill="#b88a5a"/><circle cx="330" cy="70" r="16" fill="#f2961d" opacity=".9"/><line x1="330" y1="20" x2="330" y2="54" stroke="#1c2847" stroke-width="2"/></svg>`;
 }
 if(p.type==="Plot"){
  b=`<rect x="60" y="200" width="280" height="34" fill="hsl(80,35%,55%)"/>${[...Array(15)].map((_,i)=>`<rect x="${62+i*19}" y="190" width="4" height="40" fill="#fff"/>`).join("")}<rect x="60" y="198" width="280" height="4" fill="#fff"/><rect x="150" y="130" width="100" height="50" rx="4" fill="#1c2847"/><text x="200" y="160" font-size="15" fill="#f2961d" text-anchor="middle" font-family="Poppins,Arial" font-weight="700">PLOT</text><rect x="196" y="180" width="8" height="22" fill="#1c2847"/>`;
 }else{
  const tall=p.type==="Commercial";const W=p.type==="Duplex"?190:(tall?130:150);const X=200-W/2;const top=tall?22:(p.type==="Duplex"?80:40);
  const cols=Math.floor(W/30),rows=Math.floor((232-top-20)/26);
  b+=`<rect x="${X-70}" y="${top+40}" width="80" height="${192-top}" fill="hsl(${h},20%,70%)" opacity=".7"/><rect x="${X+W-10}" y="${top+60}" width="90" height="${172-top}" fill="hsl(${h},20%,75%)" opacity=".7"/>`;
  b+=`<rect x="${X}" y="${top}" width="${W}" height="${232-top}" fill="${tall?"#2a3a63":"#1c2847"}"/><rect x="${X-6}" y="${top-6}" width="${W+12}" height="8" fill="#f2961d"/>`;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const lit=((r*7+c*3+(+p.id||7))%5)<2;b+=`<rect x="${X+10+c*((W-20)/cols)}" y="${top+12+r*26}" width="${(W-20)/cols-8}" height="15" rx="2" fill="${lit?"#f2961d":"#cfd8ec"}" opacity="${lit?.9:.75}"/>`}
  b+=`<rect x="186" y="206" width="28" height="26" fill="#f2961d"/>`;
 }
 return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${sky}${b}${ground}${tree(40)}${tree(360)}${v===1?tree(300):""}</svg>`;
}

export function areaMap(sector){
 const n=parseInt(sector.replace(/\D/g,""))||0;
 const pos={1:[250,150],3:[190,150],4:[300,110],5:[300,190],6:[140,110],7:[200,100],9:[110,170],10:[90,110],11:[140,170],12:[90,60],13:[150,60],14:[200,50],15:[60,190],18:[30,90]};
 let cells="";Object.keys(pos).forEach(k=>{const [x,y]=pos[k];const on=+k===n;cells+=`<g><rect x="${x}" y="${y}" width="52" height="36" rx="6" fill="${on?"#f2961d":"#e3e7ef"}" stroke="#fff" stroke-width="2"/><text x="${x+26}" y="${y+22}" font-size="10" text-anchor="middle" fill="${on?"#fff":"#667089"}" font-family="Poppins,Arial" font-weight="600">S-${k}</text></g>`});
 const c=pos[n]||[-100,-100];
 return `<svg viewBox="0 0 380 240" xmlns="http://www.w3.org/2000/svg"><rect width="380" height="240" fill="#f6f7fb"/><path d="M362 0 L345 240" stroke="#c5cce0" stroke-width="10"/><text x="352" y="120" font-size="9" fill="#667089" transform="rotate(-85 352 120)" font-family="Poppins,Arial">Airport Road / Metro</text>${cells}<circle cx="${c[0]+26}" cy="${c[1]+18}" r="30" fill="#f2961d" opacity=".18"/></svg>`;
}

/* ===================== MATCHING ENGINE ===================== */

export function ring(pct, sz = 84) {
  const r = sz * 0.4;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  const stroke = pct >= 80 ? '#1f9d63' : pct >= 65 ? '#f2961d' : '#8a93a8';
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}"><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="#eef1f8" stroke-width="${sz * 0.08}"/><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${sz * 0.08}" stroke-dasharray="${c}" stroke-dashoffset="${off}" stroke-linecap="round" transform="rotate(-90 ${sz / 2} ${sz / 2})"/></svg>`;
}

export function currentReq() {
  return {
    id: "REQ-4091",
    purpose: "Buy",
    areas: ["Banani, Dhaka", "Gulshan, Dhaka"],
    minBudget: 25000000,
    maxBudget: 45000000,
    type: "Apartment",
    beds: 3,
    minSize: 1800,
    features: ["Lift", "Generator", "Car parking"],
  };
}
