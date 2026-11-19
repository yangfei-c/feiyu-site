"use strict";

const technologies = {
  github: {
    name: "GitHub",
    icon: "github.svg",
    zh: "托管飞羽的四个项目仓库。官网主分支更新后触发 Cloudflare 构建。",
    en: "Hosts the four Feiyu repositories. A push to the website's main branch starts a Cloudflare build.",
    href: "https://github.com/yangfei-c/feiyu-site"
  },
  cloudflare: {
    name: "Cloudflare",
    icon: "cloudflare.svg",
    zh: "提供 DNS、CDN 与 HTTPS。Workers Builds 连接 GitHub，自动部署官网的静态文件。",
    en: "Provides DNS, CDN, and HTTPS. Workers Builds deploys the static site from GitHub.",
    href: "https://developers.cloudflare.com/workers/ci-cd/builds/"
  },
  website: {
    name: "飞羽官网",
    nameEn: "Feiyu website",
    icon: "/favicon.svg",
    zh: "feiyu.page 展示产品、演示截图和隐私政策，使用原生 HTML、CSS 和 JavaScript。",
    en: "feiyu.page presents the products, screenshots, and privacy policy with plain HTML, CSS, and JavaScript.",
    href: "/"
  },
  actions: {
    name: "GitHub Actions",
    icon: "githubactions.svg",
    zh: "按路径检测改动，检查 JavaScript 语法和 Manifest V3 版本，再打包并提交 Chrome 应用商店。",
    en: "Filters changed paths, checks JavaScript syntax and the Manifest V3 version, then packages and submits the extensions.",
    href: "https://github.com/yangfei-c/feiyu-extensions/blob/main/.github/workflows/publish-cws.yml"
  },
  google: {
    name: "Google Cloud",
    icon: "googlecloud.svg",
    zh: "为发布程序调用 Chrome Web Store API 提供 OAuth 2.0 授权。",
    en: "Provides OAuth 2.0 authorization for the publishing client's Chrome Web Store API calls.",
    href: "https://developer.chrome.com/docs/webstore/using-api/"
  },
  store: {
    name: "Chrome 应用商店",
    nameEn: "Chrome Web Store",
    icon: "chromewebstore.svg",
    zh: "接收新版扩展包并进行审核。通过审核的版本可供用户安装。",
    en: "Reviews submitted extension packages and makes approved versions available to install.",
    href: "https://chromewebstore.google.com/detail/jechfdjofhjjkofiekmdhnkjjkcnjgge"
  },
  extension: {
    name: "飞羽浏览器扩展",
    nameEn: "Feiyu browser extensions",
    icon: "/assets/products/paper-icon.png",
    zh: "用户可以在论文助手或 B 站助手的弹窗里主动提交反馈。",
    en: "Readers and viewers can submit feedback from either extension's popup.",
    href: "https://github.com/yangfei-c/feiyu-extensions"
  },
  worker: {
    name: "Cloudflare Workers",
    icon: "cloudflareworkers.svg",
    zh: "feiyu-feedback 接收用户主动提交的反馈，并转发给 Server酱。",
    en: "The feiyu-feedback Worker receives user-submitted feedback and forwards it to ServerChan.",
    href: "https://github.com/yangfei-c/feiyu-extensions#开发工作流"
  },
  serverchan: {
    name: "Server酱",
    nameEn: "ServerChan",
    icon: "serverchan.png",
    zh: "将反馈消息推送到开发者的微信。",
    en: "Delivers feedback notifications to the developer's WeChat.",
    href: "https://sct.ftqq.com/"
  },
  wechat: {
    name: "微信",
    nameEn: "WeChat",
    icon: "wechat.svg",
    zh: "开发者在微信接收用户反馈提醒。",
    en: "The developer receives a WeChat notification about the feedback.",
    href: null
  },
  name: {
    name: "Name.com",
    icon: "namecom.png",
    zh: "feiyu.page 的域名注册商。",
    en: "The registrar for the feiyu.page domain.",
    href: "https://www.name.com/"
  },
  search: {
    name: "Google Search Console",
    icon: "googlesearchconsole.svg",
    zh: "使用 DNS TXT 记录验证域名所有权，并查看网页索引状态。",
    en: "Verifies ownership via a DNS TXT record and reports indexing status.",
    href: "https://search.google.com/search-console/about"
  },
  vscode: {
    name: "VS Code",
    icon: "vscode.svg",
    zh: "用 Feiyu.code-workspace 一次打开四个本地项目。",
    en: "Opens all four local projects through Feiyu.code-workspace.",
    href: "https://code.visualstudio.com/"
  },
  git: {
    name: "Git",
    icon: "git.svg",
    zh: "管理各项目的本地版本和提交。",
    en: "Tracks versions and commits in each local project.",
    href: "https://git-scm.com/"
  },
  node: {
    name: "Node.js",
    icon: "nodedotjs.svg",
    zh: "用于扩展脚本语法检查、桌面端开发与打包。",
    en: "Runs extension syntax checks and the desktop build tooling.",
    href: "https://nodejs.org/"
  },
  playwright: {
    name: "Playwright",
    icon: "playwright.svg",
    zh: "在研发时验证浏览器扩展与网页的交互。",
    en: "Verifies that the extensions interact with browser pages during development.",
    href: "https://playwright.dev/"
  },
  gemini: {
    name: "Gemini",
    icon: "googlegemini.svg",
    zh: "辅助研发方案调研、架构设计和排错。",
    en: "Supports research, architecture planning, and troubleshooting.",
    href: "https://gemini.google.com/"
  },
  electron: {
    name: "Electron",
    icon: "electron.svg",
    zh: "运行 Windows 桌面助手，由 electron-builder 生成便携版。",
    en: "Powers Feiyu Desktop. electron-builder creates the portable Windows build.",
    href: "https://github.com/yangfei-c/feiyu-desktop#启动和打包"
  },
  deepseek: {
    name: "DeepSeek",
    icon: "deepseek.svg",
    zh: "为论文、视频和桌面助手提供模型接口。用户可自行配置 API Key 和兼容接口。",
    en: "Provides model access for the reading, video, and desktop tools. Users configure their own API key or compatible endpoint.",
    href: "https://api-docs.deepseek.com/"
  }
};

const flows = {
  website: ["github", "cloudflare", "website"],
  extension: ["github", ["actions", "google"], "store"],
  feedback: ["extension", "worker", "serverchan", "wechat"],
  domain: ["name", "cloudflare", "search"],
  tools: ["vscode", "git", "node", "playwright", "gemini"],
  runtime: ["electron", "deepseek"]
};

const previewLabels = {
  paper: { zh: "arXiv 论文页的双语对照翻译", en: "Bilingual translation on an arXiv paper" },
  video: { zh: "B 站视频旁的飞羽总结与时间戳", en: "Feiyu's summary and timestamps beside a Bilibili video" },
  desktop: { zh: "Windows 桌面悬浮提问栏", en: "The floating prompt bar on Windows" },
  settings: { zh: "桌面助手的模型与桌面设置", en: "Model and desktop settings in Feiyu Desktop" }
};

let lang = "zh";
let selected = "github";
let previewTrigger;

const textTranslations = Array.from(document.querySelectorAll("[data-en]"), element => [
  element, element.textContent.trim(), element.dataset.en
]);
const attributeTranslations = ["alt", "label"].flatMap(key => {
  const attr = key === "label" ? "aria-label" : "alt";
  return Array.from(document.querySelectorAll(`[data-en-${key}]`), element => [
    element, attr, element.getAttribute(attr), element.getAttribute(`data-en-${key}`)
  ]);
});
const language = document.getElementById("language");
const detail = document.getElementById("node-detail");
const detailIcon = document.getElementById("detailIcon");
const detailName = document.getElementById("detailName");
const detailText = document.getElementById("detailText");
const detailLink = document.getElementById("detailLink");
const dialog = document.getElementById("previewDialog");
const previewImage = document.getElementById("previewImage");
const previewCaption = document.getElementById("previewCaption");

function iconPath(icon) {
  return icon.startsWith("/") ? icon : `/assets/brands/${icon}`;
}

function nodeName(technology) {
  return lang === "en" ? (technology.nameEn || technology.name) : technology.name;
}

function renderDetail() {
  const technology = technologies[selected];
  detailIcon.src = iconPath(technology.icon);
  detailName.textContent = nodeName(technology);
  detailText.textContent = technology[lang];
  detailLink.hidden = !technology.href;
  if (technology.href) detailLink.href = technology.href;
}

function selectNode(id) {
  selected = id;
  for (const button of document.querySelectorAll(".tech-node")) {
    button.setAttribute("aria-pressed", String(button.dataset.tech === id));
  }
  renderDetail();
}

function makeNode(id) {
  const technology = technologies[id];
  const node = document.createElement("button");
  node.className = "tech-node";
  node.type = "button";
  node.dataset.tech = id;
  node.setAttribute("aria-controls", detail.id);
  const icon = document.createElement("img");
  icon.src = iconPath(technology.icon);
  icon.alt = "";
  icon.width = 25;
  icon.height = 25;
  icon.loading = "lazy";
  node.append(icon);
  node.addEventListener("focus", () => {
    if (node.matches(":focus-visible")) selectNode(id);
  });
  node.addEventListener("click", () => {
    selectNode(id);
    if (node.closest(".stack") || window.matchMedia("(max-width: 670px)").matches) {
      detail.scrollIntoView({ block: "nearest" });
    }
  });
  return node;
}

for (const track of document.querySelectorAll("[data-flow]")) {
  const linked = track.classList.contains("flow-track");
  for (const [index, entry] of flows[track.dataset.flow].entries()) {
    const [id, branchId] = Array.isArray(entry) ? entry : [entry];
    if (!linked) {
      track.append(makeNode(id));
      continue;
    }
    if (index > 0) {
      const connector = document.createElement("span");
      connector.className = "connector";
      connector.setAttribute("aria-hidden", "true");
      track.append(connector);
    }
    const step = document.createElement("div");
    step.className = "flow-step";
    step.append(makeNode(id));
    if (branchId) {
      const branch = document.createElement("div");
      branch.className = "flow-branch";
      branch.append(makeNode(branchId));
      step.append(branch);
    }
    track.append(step);
  }
}

function renderLanguage() {
  const english = lang === "en";
  document.documentElement.lang = english ? "en" : "zh-CN";
  language.setAttribute("aria-label", english ? "切换到简体中文" : "Switch to English");
  for (const [element, zh, en] of textTranslations) element.textContent = english ? en : zh;
  for (const [element, attr, zh, en] of attributeTranslations) {
    element.setAttribute(attr, english ? en : zh);
  }
  for (const button of document.querySelectorAll(".tech-node")) {
    const name = nodeName(technologies[button.dataset.tech]);
    button.title = name;
    button.setAttribute("aria-label", name);
  }
  renderDetail();
}

language.hidden = false;
language.addEventListener("click", () => {
  lang = lang === "zh" ? "en" : "zh";
  renderLanguage();
});
selectNode("github");
renderLanguage();

if (typeof dialog.showModal === "function") {
  for (const trigger of document.querySelectorAll("[data-preview]")) {
    trigger.addEventListener("click", event => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      previewTrigger = trigger;
      const caption = previewLabels[trigger.dataset.preview][lang];
      previewImage.src = trigger.href;
      previewImage.alt = trigger.querySelector("img")?.alt || caption;
      previewCaption.textContent = caption;
      dialog.showModal();
    });
  }
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => previewTrigger?.focus());
}
