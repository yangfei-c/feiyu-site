"use strict";

const techData = [
  // id, icon, Chinese name, English name, Chinese hint, English hint, desktop cell, narrow cell
  ["domain", "namecom.png", "Name.com", "Name.com", "注册 feiyu.page。", "Registers feiyu.page.", [1, 1], [1, 1]],
  ["cloudflare", "cloudflare-mark.png", "Cloudflare", "Cloudflare", "处理 DNS、HTTPS 和官网部署。", "Handles DNS, HTTPS and website deployment.", [3, 1], [3, 1]],
  ["website", "/favicon.svg", "飞羽官网", "Feiyu website", "展示飞羽工具与演示。", "Shows Feiyu tools and demos.", [5, 1], [5, 1]],
  ["search", "googlesearchconsole.png", "Google Search Console", "Google Search Console", "用 DNS TXT 验证域名并查看索引。", "Verifies ownership with DNS TXT and monitors indexing.", [6, 1], [6, 1]],
  ["vscode", "vscode.png", "VS Code", "VS Code", "打开飞羽的多项目工作区。", "Opens the Feiyu workspace.", [8, 1], [1, 3]],
  ["node", "nodedotjs.png", "Node.js", "Node.js", "校验扩展脚本，构建桌面助手。", "Checks scripts and runs desktop tooling.", [9, 1], [2, 3]],
  ["playwright", "playwright.svg", "Playwright", "Playwright", "在浏览器里调试和验证扩展。", "Tests and debugs extensions in the browser.", [10, 1], [3, 3]],
  ["gemini", "googlegemini.png", "Gemini", "Gemini", "辅助研发调研、设计与排错。", "Helps with research, design, and troubleshooting.", [11, 1], [1, 4]],
  ["deepseek", "deepseek.png", "DeepSeek", "DeepSeek", "提供产品模型接口和研发 Harness。", "Provides model access and development tooling.", [12, 1], [2, 4]],
  ["git", "git.svg", "Git", "Git", "记录本地版本与代码提交。", "Tracks local versions and commits.", [1, 2], [1, 2]],
  ["github", "github.svg", "GitHub", "GitHub", "托管飞羽的四个项目仓库。", "Hosts the four Feiyu repositories.", [3, 2], [3, 2]],
  ["actions", "githubactions.svg", "GitHub Actions", "GitHub Actions", "检测变更、校验 MV3 并提交扩展。", "Detects changes, validates MV3, and submits extensions.", [5, 2], [5, 2]],
  ["store", "chromewebstore.png", "Chrome 应用商店", "Chrome Web Store", "审核并分发浏览器扩展。", "Reviews and distributes browser extensions.", [7, 2], [5, 3]],
  ["video", "/assets/products/bilibili-icon.png", "飞羽 · B站学习助手", "Feiyu Bilibili Study Assistant", "生成视频总结，按时间戳跳转。", "Summarizes videos with clickable timestamps.", [8, 2], [6, 3]],
  ["worker", "cloudflareworkers.svg", "Cloudflare Workers", "Cloudflare Workers", "接收并转发扩展里的用户反馈。", "Receives and forwards extension feedback.", [10, 2], [6, 4]],
  ["server", "serverchan.png", "Server酱", "ServerChan", "把反馈消息推送到微信。", "Sends feedback alerts to WeChat.", [11, 2], [5, 5]],
  ["wechat", "wechat.png", "微信", "WeChat", "接收飞羽反馈提醒。", "Receives Feiyu feedback notifications.", [12, 2], [6, 5]],
  ["electron", "electron.svg", "Electron", "Electron", "运行和打包 Windows 桌面助手。", "Powers and packages the Windows utility.", [1, 3], [1, 5]],
  ["desktop", "/assets/products/desktop-icon.png", "飞羽 · 桌面 AI 助手", "Feiyu Desktop AI Assistant", "用置顶悬浮栏发起文字或截图问答。", "Asks from an always-on-top Windows prompt bar.", [3, 3], [2, 5]],
  ["google", "googlecloud.png", "Google Cloud", "Google Cloud", "为商店发布接口提供 OAuth 2.0 授权。", "Provides OAuth 2.0 for store publishing.", [5, 3], [6, 2]],
  ["scriptcat", "scriptcat.png", "脚本猫", "ScriptCat", "浏览和安装飞羽用户脚本。", "Browse and install Feiyu userscripts.", [7, 3], [3, 5]],
  ["paper", "/assets/products/paper-icon.png", "飞羽 · 学术论文助手", "Feiyu Paper Assistant", "辅助阅读、翻译和导出论文记录。", "Helps read, translate, and export paper notes.", [8, 3], [5, 4]]
];

const edges = [
  ["domain", "cloudflare"], ["cloudflare", "website"],
  ["git", "github"], ["github", "cloudflare"], ["github", "actions"],
  ["google", "actions", "authorization"], ["actions", "store"], ["store", "video"],
  ["video", "worker"], ["paper", "worker"], ["worker", "server"], ["server", "wechat"],
  ["electron", "desktop"]
];

let lang = "zh";
const language = document.getElementById("language");
const textTranslations = Array.from(document.querySelectorAll("[data-en]"), element => [
  element, element.textContent.trim(), element.dataset.en
]);
const attributeTranslations = ["alt", "label"].flatMap(key => {
  const attr = key === "label" ? "aria-label" : "alt";
  return Array.from(document.querySelectorAll(`[data-en-${key}]`), element => [
    element, attr, element.getAttribute(attr), element.getAttribute(`data-en-${key}`)
  ]);
});

const carousel = document.getElementById("products");
const stage = document.getElementById("slideStage");
const slides = Array.from(stage.querySelectorAll(".slide"));
const picks = Array.from(carousel.querySelectorAll(".pick"));
const status = document.getElementById("carouselStatus");
const rotation = document.getElementById("rotation");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let currentSlide = 0;
let timer;
let rotationPaused = false;
let hovering = false;
let gesture;
let suppressClickUntil = 0;

function syncRotation() {
  rotation.hidden = reducedMotion.matches;
  rotation.setAttribute("aria-pressed", String(rotationPaused));
  rotation.setAttribute("aria-label", rotationPaused
    ? (lang === "zh" ? "继续自动切换" : "Resume rotation")
    : (lang === "zh" ? "暂停自动切换" : "Pause rotation"));
}

function scheduleRotation() {
  clearTimeout(timer);
  if (rotationPaused || reducedMotion.matches || document.hidden || hovering || carousel.contains(document.activeElement)) return;
  timer = setTimeout(() => showSlide(currentSlide + 1, false), 8000);
}

function showSlide(index, announce = true) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => { slide.hidden = i !== currentSlide; });
  picks.forEach((button, i) => button.setAttribute("aria-pressed", String(i === currentSlide)));
  if (announce) status.textContent = slides[currentSlide].querySelector("h2").textContent;
  scheduleRotation();
}

picks.forEach((button, i) => button.addEventListener("click", () => showSlide(i)));
document.getElementById("previous").addEventListener("click", () => showSlide(currentSlide - 1));
document.getElementById("next").addEventListener("click", () => showSlide(currentSlide + 1));
rotation.addEventListener("click", () => { rotationPaused = !rotationPaused; syncRotation(); scheduleRotation(); });
carousel.addEventListener("pointerenter", event => {
  if (event.pointerType !== "touch") { hovering = true; scheduleRotation(); }
});
carousel.addEventListener("pointerleave", () => { hovering = false; scheduleRotation(); });
carousel.addEventListener("focusin", scheduleRotation);
carousel.addEventListener("focusout", () => setTimeout(scheduleRotation, 0));
carousel.addEventListener("keydown", event => {
  if (!event.target.closest(".carousel-controls") || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  showSlide(currentSlide + (event.key === "ArrowRight" ? 1 : -1));
  picks[currentSlide].focus();
});
document.addEventListener("visibilitychange", scheduleRotation);
reducedMotion.addEventListener("change", () => { syncRotation(); scheduleRotation(); });

stage.addEventListener("pointerdown", event => {
  if (event.pointerType === "touch") gesture = [event.clientX, event.clientY];
});
stage.addEventListener("pointercancel", () => { gesture = undefined; });
stage.addEventListener("pointerup", event => {
  if (event.pointerType !== "touch" || !gesture) return;
  const dx = event.clientX - gesture[0];
  const dy = event.clientY - gesture[1];
  gesture = undefined;
  if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy) * 1.3) return;
  suppressClickUntil = performance.now() + 300;
  showSlide(currentSlide + (dx < 0 ? 1 : -1));
});
stage.addEventListener("click", event => {
  if (performance.now() >= suppressClickUntil) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

document.getElementById("carouselControls").hidden = false;
syncRotation();
showSlide(0, false);

const network = document.getElementById("network");
const connections = document.getElementById("connections");
const svgNS = "http://www.w3.org/2000/svg";
const nodes = new Map();
const tooltip = document.getElementById("tooltip");
let tooltipTarget = null;
let tooltipContent = null;

function iconPath(icon) {
  return icon.startsWith("/") ? icon : `/assets/official/${icon}`;
}

function techLabel(entry) {
  return lang === "zh" ? [entry[2], entry[4]] : [entry[3], entry[5]];
}

function placeTooltip() {
  if (!tooltipTarget) return;
  const anchor = tooltipTarget.getBoundingClientRect();
  if (anchor.bottom < 0 || anchor.top > window.innerHeight) { hideTooltip(); return; }
  const width = tooltip.offsetWidth;
  const height = tooltip.offsetHeight;
  const left = Math.max(7, Math.min(anchor.left + (anchor.width - width) / 2, window.innerWidth - width - 7));
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${anchor.top >= height + 9 ? anchor.top - height - 7 : anchor.bottom + 7}px`;
}

function hideTooltip() {
  if (tooltipTarget) tooltipTarget.removeAttribute("aria-describedby");
  tooltip.hidden = true;
  tooltipTarget = null;
  tooltipContent = null;
}

function showTooltip(target, content) {
  if (tooltipTarget && tooltipTarget !== target) hideTooltip();
  tooltipTarget = target;
  tooltipContent = content;
  const [name, hint] = content();
  const title = document.createElement("strong");
  title.textContent = name;
  const description = document.createElement("span");
  description.textContent = hint;
  tooltip.replaceChildren(title, description);
  target.setAttribute("aria-describedby", "tooltip");
  tooltip.hidden = false;
  placeTooltip();
}

function bindTooltip(target, content, tap = false) {
  target.addEventListener("pointerenter", event => {
    if (event.pointerType !== "touch") showTooltip(target, content);
  });
  target.addEventListener("pointerleave", () => {
    if (tooltipTarget === target && !target.matches(":focus-visible")) hideTooltip();
  });
  target.addEventListener("focus", () => {
    if (target.matches(":focus-visible")) showTooltip(target, content);
  });
  target.addEventListener("blur", () => {
    if (tooltipTarget === target) hideTooltip();
  });
  if (tap) target.addEventListener("click", () => showTooltip(target, content));
}

for (const entry of techData) {
  const [id, icon, , , , , [col, row], [narrowCol, narrowRow]] = entry;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "tech-node";
  button.dataset.tech = id;
  button.style.setProperty("--col", col);
  button.style.setProperty("--row", row);
  button.style.setProperty("--narrow-col", narrowCol);
  button.style.setProperty("--narrow-row", narrowRow);
  const image = document.createElement("img");
  image.src = iconPath(icon);
  image.alt = "";
  image.width = 25;
  image.height = 25;
  button.append(image);
  bindTooltip(button, () => techLabel(entry), true);
  nodes.set(id, button);
  network.append(button);
}

function svgElement(name, attrs) {
  const element = document.createElementNS(svgNS, name);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
  return element;
}

const defs = svgElement("defs", {});
const arrow = svgElement("marker", { id: "networkArrow", markerWidth: "6", markerHeight: "6", refX: "5", refY: "3", orient: "auto" });
arrow.append(svgElement("path", { d: "M0 0 L6 3 L0 6 Z" }));
defs.append(arrow);
connections.append(defs);
const lineGroup = svgElement("g", {});
connections.append(lineGroup);

function drawConnections() {
  const frame = connections.getBoundingClientRect();
  if (!frame.width || !frame.height) return;
  connections.setAttribute("viewBox", `0 0 ${frame.width} ${frame.height}`);
  const locations = new Map(Array.from(nodes, ([id, button]) => {
    const tile = button.getBoundingClientRect();
    return [id, { x: tile.left - frame.left + tile.width / 2, y: tile.top - frame.top + tile.height / 2, radius: tile.width / 2 }];
  }));
  lineGroup.replaceChildren();
  for (const [source, target, style] of edges) {
    const a = locations.get(source);
    const b = locations.get(target);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const ux = dx / dist;
    const uy = dy / dist;
    const axis = Math.max(Math.abs(ux), Math.abs(uy));
    const start = a.radius / axis + 2;
    const end = b.radius / axis + 3;
    if (start + end >= dist) continue;
    lineGroup.append(svgElement("line", {
      x1: a.x + start * ux, y1: a.y + start * uy,
      x2: b.x - end * ux, y2: b.y - end * uy,
      class: style || "",
      "marker-end": "url(#networkArrow)"
    }));
  }
}

document.getElementById("technology").hidden = false;
new ResizeObserver(drawConnections).observe(network);
drawConnections();

const qq = document.getElementById("qqContact");
const qqNumber = "3260693417";
function qqTip() {
  return ["QQ", lang === "zh" ? `${qqNumber} · 点击复制` : `${qqNumber} · Click to copy`];
}
bindTooltip(qq, qqTip);
qq.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(qqNumber);
    showTooltip(qq, () => ["QQ", lang === "zh" ? `已复制 ${qqNumber}` : `Copied ${qqNumber}`]);
  } catch {
    window.prompt(lang === "zh" ? "复制联系 QQ" : "Copy contact QQ", qqNumber);
  }
});

window.addEventListener("resize", placeTooltip);
window.addEventListener("scroll", placeTooltip, { passive: true });
document.addEventListener("pointerdown", event => {
  if (tooltipTarget && !tooltipTarget.contains(event.target)) hideTooltip();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") hideTooltip();
});

function renderLanguage() {
  const english = lang === "en";
  document.documentElement.lang = english ? "en" : "zh-CN";
  language.setAttribute("aria-label", english ? "切换到简体中文" : "Switch to English");
  for (const [element, zh, en] of textTranslations) element.textContent = english ? en : zh;
  for (const [element, attr, zh, en] of attributeTranslations) element.setAttribute(attr, english ? en : zh);
  for (const entry of techData) nodes.get(entry[0]).setAttribute("aria-label", techLabel(entry)[0]);
  if (tooltipTarget) showTooltip(tooltipTarget, tooltipContent);
  syncRotation();
  status.textContent = "";
}

language.hidden = false;
language.addEventListener("click", () => {
  lang = lang === "zh" ? "en" : "zh";
  renderLanguage();
});
renderLanguage();

const dialog = document.getElementById("previewDialog");
const previewImage = document.getElementById("previewImage");
const previewCaption = document.getElementById("previewCaption");
let previewTrigger;

if (typeof dialog.showModal === "function") {
  for (const trigger of document.querySelectorAll("[data-preview]")) {
    trigger.addEventListener("click", event => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      previewTrigger = trigger;
      const caption = lang === "en" ? trigger.dataset.enCaption : trigger.dataset.caption;
      previewImage.src = trigger.href;
      previewImage.alt = caption;
      previewCaption.textContent = caption;
      dialog.showModal();
    });
  }
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => previewTrigger?.focus());
}
