/**
 * Net Atlas Ultimate – Orbital Edition
 *
 * Same functionality as the PRO build, but visually tuned with orbital styling.
 * - 3D globe (three-globe)
 * - Real country polygons from world-atlas
 * - RESTCountries for live metadata
 * - Websites-per-country loaded from websites-by-country.json
 * - Favicons, flags, TLD-based categories, neon UI
 *
 * IMPORTANT ABOUT DATA SOURCES:
 * This frontend does NOT scrape:
 *   - https://en.wikipedia.org/wiki/Lists_of_websites
 *   - https://builtwith.com/website-lists/Site
 *   - https://all.site/search
 *   - https://internet-map.net/
 *
 * Instead, you or your backend scripts should collect URLs (respecting their
 * Terms of Service / APIs) and write them into websites-by-country.json.
 */

let websitesByCountry = {};
let restCountryCache = {};
let globeInstance = null;

const statusPill = () => document.getElementById("statusPill");
const countryNameEl = () => document.getElementById("countryName");
const countryMetaEl = () => document.getElementById("countryMeta");
const countryFlagEl = () => document.getElementById("countryFlag");
const countryCodeBadgeEl = () => document.getElementById("countryCodeBadge");
const websiteCountEl = () => document.getElementById("websiteCount");
const regionBadgeEl = () => document.getElementById("regionBadge");
const websiteListEl = () => document.getElementById("websiteList");

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  try {
    setStatus("loading websites database…");
    websitesByCountry = await loadWebsitesJSON();
    setStatus("booting orbital globe…");
    await initGlobe();
    setStatus("online – click a country");
  } catch (err) {
    console.error(err);
    setStatus("error initialising system");
  }
}

function setStatus(msg) {
  const el = statusPill();
  if (!el) return;
  el.textContent = msg;
}

/**
 * Load websites-by-country.json which you maintain / generate.
 */
async function loadWebsitesJSON() {
  try {
    const res = await fetch("websites-by-country.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load websites-by-country.json");
    return await res.json();
  } catch (e) {
    console.warn("Could not load websites-by-country.json, defaulting to empty object.", e);
    return {};
  }
}

async function initGlobe() {
  const container = document.getElementById("globeContainer");
  if (!container) throw new Error("Missing globeContainer element");

  // fetch TopoJSON for countries
  const topoRes = await fetch("https://unpkg.com/world-atlas@2/countries-110m.json");
  if (!topoRes.ok) throw new Error("Failed to load world-atlas topology");
  const worldTopo = await topoRes.json();
  const countries = window.topojson.feature(worldTopo, worldTopo.objects.countries).features;

  // THREE.js boilerplate
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    2000
  );
  camera.position.z = 430;

  const ambientLight = new THREE.AmbientLight(0x557799, 1.0);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.95);
  directionalLight.position.set(200, 200, 200);
  scene.add(directionalLight);

  // globe instance
  const globe = new ThreeGlobe()
    .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
    .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
    .polygonsData(countries)
    .polygonCapColor(() => "rgba(56, 189, 248, 0.20)")
    .polygonSideColor(() => "rgba(15, 23, 42, 0.96)")
    .polygonStrokeColor(() => "#38bdf8")
    .polygonAltitude(() => 0.01)
    .onPolygonClick(handleCountryClick);

  globeInstance = globe;
  scene.add(globe);

  // atmosphere halo
  const radius = globe.getGlobeRadius ? globe.getGlobeRadius() : 100;
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.08, 64, 64),
    new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      emissive: 0x0ea5e9,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide
    })
  );
  atmosphere.position.copy(globe.position);
  scene.add(atmosphere);

  // subtle orbital tilt
  globe.rotation.x = 0.15;
  atmosphere.rotation.x = 0.15;

  // slow rotation
  function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.0006;
    atmosphere.rotation.y += 0.0006;
    renderer.render(scene, camera);
  }
  animate();

  // handle resize
  window.addEventListener("resize", () => {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  });
}

/**
 * When a country polygon is clicked
 */
async function handleCountryClick(feature) {
  const name = feature && feature.properties && feature.properties.name
    ? feature.properties.name
    : "Unknown";

  setStatus(`resolving ${name}…`);
  try {
    const info = await fetchCountryInfo(name);
    renderCountry(info);
    setStatus("online – click another country");
  } catch (e) {
    console.error(e);
    setStatus(`could not load data for ${name}`);
  }
}

/**
 * Fetch country info from RESTCountries (caches results)
 */
async function fetchCountryInfo(name) {
  const cacheKey = name.toLowerCase();
  if (restCountryCache[cacheKey]) return restCountryCache[cacheKey];

  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("RESTCountries lookup failed for " + name);
  const arr = await res.json();
  if (!Array.isArray(arr) || !arr[0]) throw new Error("No matching country for " + name);
  const c = arr[0];

  const info = {
    name: c.name?.common || name,
    officialName: c.name?.official || name,
    code: c.cca2 || c.cca3 || "",
    flagSvg: c.flags?.svg || c.flags?.png || "",
    capital: Array.isArray(c.capital) ? c.capital[0] : c.capital || "",
    region: c.region || "",
    population: typeof c.population === "number" ? c.population : null
  };

  restCountryCache[cacheKey] = info;
  return info;
}

/**
 * Render country info + websites
 */
function renderCountry(info) {
  const nameEl = countryNameEl();
  const metaEl = countryMetaEl();
  const flagEl = countryFlagEl();
  const codeBadge = countryCodeBadgeEl();
  const siteCount = websiteCountEl();
  const regionBadge = regionBadgeEl();

  const code = (info.code || "").toUpperCase();
  const websites = websitesByCountry[code] || [];

  if (nameEl) nameEl.textContent = info.name || "Unknown country";

  if (metaEl) {
    const pop = info.population
      ? formatPopulation(info.population)
      : "population unknown";
    const capital = info.capital || "capital unknown";
    metaEl.textContent = `${info.officialName || info.name} · ${capital} · ${pop}`;
  }

  if (flagEl) {
    if (code) {
      const flagUrl = `https://flagcdn.com/64x48/${code.toLowerCase()}.png`;
      flagEl.src = flagUrl;
      flagEl.classList.remove("hidden");
    } else if (info.flagSvg) {
      flagEl.src = info.flagSvg;
      flagEl.classList.remove("hidden");
    } else {
      flagEl.classList.add("hidden");
    }
  }

  if (codeBadge) codeBadge.textContent = code || "--";
  if (siteCount) siteCount.textContent = `${websites.length} site${websites.length === 1 ? "" : "s"}`;
  if (regionBadge) regionBadge.textContent = info.region || "region unknown";

  renderWebsiteList(code, websites);
}

/**
 * Render websites into panel
 */
function renderWebsiteList(countryCode, websites) {
  const list = websiteListEl();
  if (!list) return;
  list.innerHTML = "";

  if (!websites || !websites.length) {
    const li = document.createElement("li");
    li.className = "website-item";
    li.textContent = "No websites are defined yet for this country. Add them to websites-by-country.json.";
    list.appendChild(li);
    return;
  }

  const flagUrl = countryCode
    ? `https://flagcdn.com/32x24/${countryCode.toLowerCase()}.png`
    : "";

  for (const entry of websites) {
    const urlStr = typeof entry === "string" ? entry : entry.url;
    if (!urlStr) continue;

    const displayUrl = urlStr;
    let hostname = urlStr;
    try {
      const u = new URL(urlStr);
      hostname = u.hostname;
    } catch (e) {
      // keep as-is
    }

    const tld = inferTLD(hostname);
    const category = (typeof entry === "object" && entry.category) || inferCategoryFromTLD(tld);

    const li = document.createElement("li");
    li.className = "website-item";

    const faviconUrl =
      "https://www.google.com/s2/favicons?sz=64&domain=" + encodeURIComponent(hostname);

    const inner = document.createElement("div");
    inner.className = "website-main";

    const icon = document.createElement("img");
    icon.className = "website-icon";
    icon.src = faviconUrl;
    icon.alt = "";

    const textWrap = document.createElement("div");
    textWrap.className = "website-text";

    const link = document.createElement("a");
    link.className = "website-link";
    link.href = displayUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = hostname;

    const metaRow = document.createElement("div");
    metaRow.className = "website-meta";

    const categorySpan = document.createElement("span");
    categorySpan.className = "category-chip";
    categorySpan.textContent = category;

    const countrySpan = document.createElement("span");
    countrySpan.className = "country-chip";
    countrySpan.textContent = countryCode || "--";

    metaRow.appendChild(categorySpan);
    metaRow.appendChild(countrySpan);

    if (flagUrl) {
      const flagImg = document.createElement("img");
      flagImg.src = flagUrl;
      flagImg.alt = countryCode;
      flagImg.style.width = "18px";
      flagImg.style.height = "14px";
      flagImg.style.borderRadius = "4px";
      flagImg.style.marginLeft = "4px";
      metaRow.appendChild(flagImg);
    }

    textWrap.appendChild(link);
    textWrap.appendChild(metaRow);

    inner.appendChild(icon);
    inner.appendChild(textWrap);

    li.appendChild(inner);

    link.addEventListener("click", () => {
      li.classList.remove("click-bloom");
      void li.offsetWidth; // restart animation
      li.classList.add("click-bloom");
    });

    list.appendChild(li);
  }
}

function inferTLD(hostname) {
  if (!hostname) return "";
  const parts = hostname.split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
}

function inferCategoryFromTLD(tld) {
  if (!tld) return "other";

  const map = {
    com: "commercial",
    org: "organization",
    net: "network / infra",
    edu: "education",
    gov: "government",
    mil: "military",
    io: "tech / startup",
    ai: "ai / tech",
    dev: "developer",
    app: "apps / mobile",
    au: "australia",
    nz: "new zealand",
    uk: "united kingdom",
    us: "united states",
    ca: "canada",
    eu: "europe",
    jp: "japan",
    cn: "china",
    in: "india",
    ru: "russia",
    br: "brazil",
    de: "germany",
    fr: "france",
    es: "spain",
    it: "italy"
  };

  return map[tld] || "other";
}

function formatPopulation(num) {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B people";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M people";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K people";
  return num + " people";
}