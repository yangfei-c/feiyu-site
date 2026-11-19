"use strict";

const techData = [
  // id, icon, Chinese name, English name, Chinese hint, English hint, desktop cell, narrow cell
  ["domain","namecom.png","Name.com","Name.com","注册 feiyu.page。","Registers feiyu.page.",[8,1],[1,3]],
  ["cloudflare","cloudflare-mark.png","Cloudflare","Cloudflare","提供域名解析、HTTPS 和官网部署。","Provides DNS, HTTPS and website deployment.",[10,1],[3,3]],
  ["website","/favicon.svg","飞羽官网","Feiyu website","展示飞羽产品和运行界面。","Shows Feiyu products and demos.",[12,1],[5,3]],
  ["gemini","googlegemini.png","Gemini","Gemini","辅助研发调研、设计与排错。","Supports development research, design and troubleshooting.",[1,1],[1,1]],
  ["deepseek","deepseek.png","DeepSeek","DeepSeek","辅助开发与排错，也提供产品推理接口。","Supports development and also powers product AI requests.",[2,1],[2,1]],
  ["playwright","playwright.svg","Playwright","Playwright","提交前在浏览器里验证扩展交互。","Verifies browser extension interactions before a commit.",[4,1],[4,1]],
  ["node","nodedotjs.png","Node.js","Node.js","提交前检查脚本语法，支持桌面构建。","Checks script syntax before commits and runs desktop builds.",[5,1],[5,1]],
  ["vscode","vscode.png","VS Code","VS Code","开发工作区，汇集代码编辑和 AI 辅助研发。","The workspace for editing code and AI-assisted development.",[2,2],[2,2]],
  ["git","git.svg","Git","Git","记录本地版本，把验证过的改动提交到 GitHub。","Tracks local versions and sends verified commits to GitHub.",[4,2],[4,2]],
  ["github","github.svg","GitHub","GitHub","托管代码，同时触发官网部署和扩展发布。","Hosts code and triggers website deployments and extension publishing.",[6,2],[6,2]],
  ["actions","githubactions.svg","GitHub Actions","GitHub Actions","检测变更、校验 MV3 并提交扩展。","Detects changes, validates MV3, and submits extensions.",[8,2],[6,3]],
  ["store","chromewebstore.png","Chrome 应用商店","Chrome Web Store","审核并分发浏览器扩展。","Reviews and distributes browser extensions.",[10,2],[6,4]],
  ["video","/assets/products/bilibili-icon.png","飞羽 · B站学习助手","Feiyu Bilibili Study Assistant","生成视频总结，按时间戳跳转。","Summarizes videos with clickable timestamps.",[12,2],[5,4]],
  ["electron","electron.svg","Electron","Electron","运行和打包 Windows 桌面助手。","Powers and packages the Windows utility.",[1,3],[1,4]],
  ["desktop","/assets/products/desktop-assistant.svg","飞羽 · 桌面 AI 助手","Feiyu Desktop AI Assistant","用置顶悬浮栏发起文字或截图问答。","Ask from a floating prompt bar using text or screenshots.",[2,3],[2,4]],
  ["scripts","/assets/products/userscripts.svg","飞羽脚本集","Feiyu Userscripts","在脚本猫查看飞羽用户脚本。","Find Feiyu userscripts on ScriptCat.",[4,3],[3,4]],
  ["paper","/assets/products/paper-icon.png","飞羽 · 学术论文助手","Feiyu Paper Assistant","辅助阅读、翻译和导出论文记录。","Helps read, translate, and export paper notes.",[6,3],[3,5]],
  ["worker","cloudflareworkers.svg","Cloudflare Workers","Cloudflare Workers","接收并转发扩展里的用户反馈。","Receives and forwards extension feedback.",[8,3],[4,5]],
  ["server","serverchan.png","Server酱","ServerChan","把反馈消息推送到微信。","Sends feedback alerts to WeChat.",[10,3],[5,5]],
  ["wechat","wechat.png","微信","WeChat","接收飞羽反馈提醒。","Receives Feiyu feedback notifications.",[12,3],[6,5]]
];

const edges = [
  ["gemini","vscode","development"],
  ["deepseek","vscode","development"],
  ["playwright","git","development"],
  ["node","git","development"],
  ["vscode","git"],
  ["git","github"],
  ["domain","cloudflare"],
  ["github","cloudflare"],
  ["cloudflare","website"],
  ["github","actions"],
  ["actions","store"],
  ["store","video"],
  ["video","worker"],
  ["paper","worker"],
  ["worker","server"],
  ["server","wechat"],
  ["electron","desktop"]
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
