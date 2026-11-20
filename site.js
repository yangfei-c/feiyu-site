"use strict";

const techData = [
  // id, icon, Chinese name, English name, Chinese hint, English hint, desktop cell, narrow cell
  ["gemini","googlegemini.png","Gemini","Gemini","分析需求、梳理方案","Analyze requirements and plan solutions",[1,1],[1,1]],
  ["deepseek","deepseek.png","DeepSeek","DeepSeek","写代码、排查错误","Write and debug code",[1,3],[2,1]],
  ["vscode","vscode.png","VS Code","VS Code","编辑代码、管理提交","Edit code and manage commits",[3,2],[2,2]],
  ["playwright","playwright.svg","Playwright","Playwright","自动测试浏览器扩展","Automate browser extension testing",[3,3],[3,1]],
  ["github","github.svg","GitHub","GitHub","托管源码、安装包和项目说明","Host source code, installers and project docs",[5,2],[4,2]],
  ["cloudflare","cloudflare-mark.png","Cloudflare","Cloudflare","自动部署网站","Deploy the website automatically",[6,1],[1,3]],
  ["website","/favicon.svg","官网","Website","浏览产品与运行演示","Explore products and demos",[8,1],[2,3]],
  ["actions","githubactions.svg","GitHub Actions","GitHub Actions","自动检查代码并提交扩展","Check code and submit extensions",[6,3],[5,3]],
  ["store","chromewebstore.png","Chrome 应用商店","Chrome Web Store","安装和更新浏览器扩展","Install and update browser extensions",[8,3],[6,3]],
  ["paper","/assets/products/paper-icon.png","学术论文助手","Paper Assistant","双语读论文、划词提问","Read bilingually and ask about selected text",[10,1],[2,5]],
  ["desktop","/assets/products/desktop-assistant.svg","桌面 AI 助手","Desktop AI Assistant","在桌面悬浮窗里截图提问","Ask about screenshots from a floating window",[12,1],[5,5]],
  ["video","/assets/products/bilibili-icon.png","B 站学习助手","Bilibili Study Assistant","总结视频、按时间戳跳转","Summarize videos and jump to timestamps",[10,3],[5,6]],
  ["scripts","/assets/products/userscripts.svg","B 站每日经验助手","Bilibili Daily XP Assistant","查看每日任务与升级进度","Track daily tasks and level progress",[12,3],[2,6]]
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
  ["github","desktop"],
  ["github","scripts"]
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
      if (narrow) {
        // The scripts tile sits below the paper tile, so approach it from the left.
        const branchX = target === "scripts" ? locations.get("cloudflare").x : b.x;
        turns = [{ x: a.x, y: productBranchY }, { x: branchX, y: productBranchY }];
        if (target === "scripts") turns.push({ x: branchX, y: b.y });
      } else {
        turns = [{ x: b.x, y: productBranchY }];
      }
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
