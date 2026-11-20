"use strict";

const apiBase = "https://wz.hay7.cn/api/v1/";
const levels = { province: "省标", city: "市标", county: "区县标" };
const numberFormat = new Intl.NumberFormat("zh-CN");
const form = document.getElementById("power-form");
const { hero: heroInput, platform: platformInput, score: scoreInput } = form.elements;
const submit = form.querySelector("button[type=submit]");
const heroOptions = document.getElementById("hero-options");
const statusMessage = document.getElementById("tool-status");
const results = document.getElementById("power-results");
const levelButtons = Array.from(document.querySelectorAll("[data-level]"));
const heroIds = new Map();
const powerCache = new Map();
const regionData = fetch("./region-data.json", { signal: AbortSignal.timeout(4000) })
  .then(response => response.ok ? response.json() : null)
  .catch(() => null);
let rankings = null;
let activeLevel = "county";

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.toggleAttribute("data-error", isError);
}

async function request(endpoint, parameters = {}) {
  const url = new URL(endpoint, apiBase);
  url.search = new URLSearchParams(parameters).toString();
  let response;
  try {
    response = await fetch(url, { credentials: "omit", signal: AbortSignal.timeout(9000) });
  } catch {
    throw new Error("暂时连不上战力数据源，请稍后再试。");
  }
  if (response.status === 429) throw new Error("查询太频繁，请稍后再试。");
  if (response.status === 404 && endpoint === "power") throw new Error("未查到战力，请确认英雄全名和账号平台。");
  if (!response.ok) throw new Error("战力数据源暂时不可用，请稍后再试。");

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("无法读取战力数据，请稍后再试。");
  }
  if (payload?.code !== 0) {
    throw new Error(endpoint === "power" ? "未查到战力，请确认英雄全名和账号平台。" : "暂时无法加载英雄列表。");
  }
  return payload;
}

async function loadHeroes() {
  try {
    const { data } = await request("heroes");
    if (!Array.isArray(data)) return;
    heroOptions.replaceChildren(...data.flatMap(entry => {
      const id = entry?.hero_id;
      const name = entry?.hero_name;
      if (!Number.isInteger(id) || typeof name !== "string" || !name) return [];
      heroIds.set(name, String(id));
      return [new Option(name, name)];
    }));
  } catch {
    // The power endpoint also accepts an exact name when suggestions are unavailable.
  }
}

function parentRegion({ adcode, region }, level, index) {
  const code = String(adcode);
  if (level === "province" || !index || !/^[0-9]{6}$/.test(code)) return "";
  const provinceCode = code.slice(0, 2);
  const province = index.provinces?.[provinceCode];
  // Taiwan codes can vary by data provider, so confirm the district name before adding a city.
  const cityCodeMatches = provinceCode !== "71" || index.taiwanCountyNames?.[code] === region;
  const city = level === "county" && cityCodeMatches ? index.cities?.[code.slice(0, 4)] : "";
  return [province, city].filter(name => name && !region.includes(name)).join(" · ");
}

function readRankings(platform, index) {
  return Object.fromEntries(Object.keys(levels).map(level => {
    const rows = Array.isArray(platform[level]) ? platform[level] : [];
    const ranked = rows.filter(row => typeof row?.region === "string" && row.region &&
      Number.isSafeInteger(row.power) && row.power >= 0).sort((a, b) => a.power - b.power).slice(0, 5);
    return [level, ranked.map(row => ({ ...row, parent: parentRegion(row, level, index) }))];
  }));
}

function renderRanks() {
  const rows = rankings[activeLevel];
  const score = scoreInput.value !== "" && scoreInput.validity.valid ? scoreInput.valueAsNumber : null;
  document.getElementById("rank-title").textContent = `${levels[activeLevel]}门槛最低的 ${rows.length} 个战区`;
  document.getElementById("delta-heading").hidden = score === null;
  for (const button of levelButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.level === activeLevel));
  }
  document.getElementById("rank-rows").replaceChildren(...rows.map(({ region, power, parent }, index) => {
    const row = document.createElement("tr");
    row.insertCell().textContent = index + 1;
    const place = row.insertCell();
    place.textContent = region;
    if (parent) {
      const subtitle = document.createElement("small");
      subtitle.className = "region-parent";
      subtitle.textContent = parent;
      place.append(subtitle);
    }
    row.insertCell().textContent = numberFormat.format(power);
    if (score !== null) {
      const cell = row.insertCell();
      const difference = power - score;
      const points = numberFormat.format(Math.abs(difference));
      cell.textContent = difference > 0 ? `差 ${points} 分` : difference < 0 ? `高 ${points} 分` : "刚好持平";
      cell.classList.toggle("shortfall", difference > 0);
    }
    return row;
  }));
}

function showResults(payload, hero, platformKey, index) {
  const platform = payload.data?.platforms?.[platformKey];
  rankings = platform ? readRankings(platform, index) : null;
  const available = rankings && ["county", "city", "province"].find(level => rankings[level].length);
  if (!available) {
    rankings = null;
    return false;
  }
  activeLevel = rankings[activeLevel].length ? activeLevel : available;
  const platformName = platformInput.selectedOptions[0].textContent;
  document.getElementById("result-title").textContent = `${payload.data.heroName || hero} · ${platformName}`;
  const date = platform.updatetime || platform.date || payload.meta?.date;
  const dateLabel = date ? `数据更新 ${date}` : "更新时间未知";
  document.getElementById("result-date").textContent = platform.stale ? `${dateLabel} · 数据较旧` : dateLabel;
  for (const button of levelButtons) {
    const lowest = rankings[button.dataset.level][0];
    button.disabled = !lowest;
    button.querySelector("strong").textContent = lowest ? numberFormat.format(lowest.power) : "暂无";
    button.querySelector("small").textContent = lowest?.region ?? "";
    button.querySelector(".region-parent").textContent = lowest?.parent ?? "";
  }
  renderRanks();
  results.hidden = false;
  return true;
}

for (const button of levelButtons) {
  button.addEventListener("click", () => {
    activeLevel = button.dataset.level;
    renderRanks();
  });
}
scoreInput.addEventListener("input", () => { if (rankings) renderRanks(); });

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (submit.disabled) return;
  const hero = heroInput.value.trim();
  if (!hero) {
    showStatus("请输入英雄名称。", true);
    heroInput.focus();
    return;
  }
  const platform = platformInput.value;
  const heroParam = heroIds.get(hero) ?? hero;
  const key = `${platform}:${heroParam}`;
  const now = Date.now();
  for (const [cachedKey, entry] of powerCache) {
    if (entry.expires <= now) powerCache.delete(cachedKey);
  }

  results.hidden = true;
  rankings = null;
  submit.disabled = heroInput.disabled = platformInput.disabled = true;
  showStatus("正在查询战力…");
  try {
    const cached = powerCache.get(key);
    const [payload, index] = await Promise.all([
      cached?.payload ?? request("power", { hero: heroParam, platform, top: 5 }),
      regionData
    ]);
    if (showResults(payload, hero, platform, index)) {
      if (!cached) powerCache.set(key, { payload, expires: Date.now() + 5 * 60 * 1000 });
      showStatus("");
    } else {
      showStatus("这个英雄和平台暂无战区门槛数据。");
    }
  } catch (error) {
    showStatus(error.message, true);
  } finally {
    submit.disabled = heroInput.disabled = platformInput.disabled = false;
  }
});

submit.disabled = false;
loadHeroes();
