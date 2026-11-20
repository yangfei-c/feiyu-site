"use strict";

const techData = [
  // id, icon, Chinese name, English name, Chinese hint, English hint, desktop cell, narrow cell
  ["gemini","googlegemini.png","Gemini","Gemini","辅助需求调研、设计和排错。","Supports research, design and troubleshooting.",[1,1],[1,1]],
  ["deepseek","deepseek.png","DeepSeek","DeepSeek","通过 Harness 辅助编写和调试代码。","Helps write and debug code through the Harness.",[1,3],[2,1]],
  ["vscode","vscode.png","VS Code","VS Code","编辑飞羽代码并通过 Git 提交。","Edit Feiyu code and commit with Git.",[3,2],[2,2]],
  ["playwright","playwright.svg","Playwright","Playwright","提交前验证浏览器扩展的交互。","Tests browser extension interactions before commits.",[3,3],[3,1]],
  ["github","github.svg","GitHub","GitHub","接收 Git 提交，托管代码、安装包和使用说明。","Receives Git commits and hosts code, packages, and guides.",[5,2],[4,2]],
  ["cloudflare","cloudflare-mark.png","Cloudflare","Cloudflare","从 GitHub 自动部署官网，提供 DNS 和 HTTPS。","Deploys the website from GitHub and provides DNS and HTTPS.",[6,1],[1,3]],
  ["website","/favicon.svg","飞羽官网","Feiyu website","展示产品和运行截图，域名由 Name.com 注册。","Shows Feiyu products and screenshots on a domain registered with Name.com.",[8,1],[2,3]],
  ["actions","githubactions.svg","GitHub Actions","GitHub Actions","用 Node.js 检查语法，校验 MV3 并提交扩展。","Checks JavaScript with Node.js, validates MV3, and submits extensions.",[6,3],[5,3]],
  ["store","chromewebstore.png","Chrome 应用商店","Chrome Web Store","审核扩展，提供 B 站学习助手安装。","Reviews extensions and distributes the Feiyu Bilibili Study Assistant.",[8,3],[6,3]],
  ["paper","/assets/products/paper-icon.png","飞羽 · 学术论文助手","Feiyu Paper Assistant","阅读和翻译论文，可从 GitHub Releases 获取安装包。","Reads and translates papers. Install from GitHub Releases.",[10,1],[2,5]],
  ["desktop","/assets/products/desktop-assistant.svg","飞羽 · 桌面 AI 助手","Feiyu Desktop AI Assistant","基于 Electron。源码和 Windows 使用说明在 GitHub。","Built with Electron. Source code and the Windows guide are on GitHub.",[12,1],[5,5]],
  ["video","/assets/products/bilibili-icon.png","飞羽 · B站学习助手","Feiyu Bilibili Study Assistant","生成带时间戳的视频总结，可从 Chrome 应用商店安装。","Makes timestamped video summaries. Install from the Chrome Web Store.",[10,3],[5,6]],
  ["scripts","/assets/products/userscripts.svg","飞羽脚本集","Feiyu Userscripts","在脚本猫浏览和安装飞羽脚本。","Browse and install Feiyu userscripts on ScriptCat.",[12,3],[2,6]]
];

const edges = [
  ["gemini","vscode","development"],
  ["deepseek","vscode","development"],
  ["playwright","github","development"],
  ["vscode","github"],
  ["github","cloudflare"],
  ["cloudflare","website"],
  ["github","actions"],
  ["actions","store"],
  ["store","video"],
  ["github","paper"],
  ["github","desktop"]
];

const developmentTools = new Set(["gemini", "deepseek", "vscode", "playwright"]);
const products = new Set(["paper", "desktop", "video", "scripts"]);

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
  if (developmentTools.has(id)) button.dataset.zone = "development";
  if (products.has(id)) button.dataset.zone = "product";
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

function insetPoint(center, toward, gap) {
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  const scale = (center.radius + gap) / Math.max(Math.abs(dx), Math.abs(dy));
  return { x: center.x + dx * scale, y: center.y + dy * scale };
}

function drawConnections() {
  const frame = connections.getBoundingClientRect();
  if (!frame.width || !frame.height) return;
  connections.setAttribute("viewBox", `0 0 ${frame.width} ${frame.height}`);
  const locations = new Map(Array.from(nodes, ([id, button]) => {
    const tile = button.getBoundingClientRect();
    return [id, { x: tile.left - frame.left + tile.width / 2, y: tile.top - frame.top + tile.height / 2, radius: tile.width / 2 }];
  }));
  const narrow = window.matchMedia("(max-width: 760px)").matches;
  const productBranchY = narrow ? (locations.get("store").y + locations.get("paper").y) / 2 : locations.get("github").y;
  lineGroup.replaceChildren();
  for (const [source, target, style] of edges) {
    const a = locations.get(source);
    const b = locations.get(target);
    let turns = [];
    if (source === "github" && products.has(target)) {
      turns = narrow ? [{ x: a.x, y: productBranchY }, { x: b.x, y: productBranchY }] : [{ x: b.x, y: productBranchY }];
    } else if (source === "github" && target === "cloudflare" && narrow) {
      const branchY = (a.y + b.y) / 2;
      turns = [{ x: a.x, y: branchY }, { x: b.x, y: branchY }];
    } else if (source === "store" && narrow) {
      turns = [{ x: a.x, y: b.y }];
    }
    const points = [insetPoint(a, turns[0] || b, 2), ...turns, insetPoint(b, turns.at(-1) || a, 3)];
    lineGroup.append(svgElement("polyline", {
      points: points.map(point => `${point.x},${point.y}`).join(" "),
      class: style || "",
      "data-from": source, "data-to": target,
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
