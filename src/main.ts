import "./styles.css";
import { REPLICATION_STEPS } from "./modules/replication";
import { TRANSCRIPTION_STEPS } from "./modules/transcription";
import { TRANSLATION_STEPS } from "./modules/translation";
import type { Step, StoryModule } from "./types";
import { ease } from "./draw";

const MODULES: Record<StoryModule["id"], StoryModule> = {
  replication: { id: "replication", steps: REPLICATION_STEPS },
  transcription: { id: "transcription", steps: TRANSCRIPTION_STEPS },
  translation: { id: "translation", steps: TRANSLATION_STEPS },
};

const $ = <T extends HTMLElement = HTMLElement>(sel: string) =>
  document.querySelector<T>(sel)!;

const canvas = $<HTMLCanvasElement>("#canvas");
const ctx = canvas.getContext("2d")!;
const stepIndexEl = $("#step-index");
const stepTitleEl = $("#step-title");
const captionEl = $("#caption");
const progressEl = $("#progress");
const btnPrev = $("#btn-prev");
const btnNext = $("#btn-next");
const btnPlay = $("#btn-play");

let currentModuleId: StoryModule["id"] = "replication";
let currentStep = 0;
let stepProgress = 0; // 0 to 1 within the step
let playing = false;
let lastTime = 0;
const STEP_DURATION_MS = 4200;
const ENTER_DURATION_MS = 900;
let enterStart: number | null = null;

function steps(): Step[] {
  return MODULES[currentModuleId].steps;
}

function setupCanvas() {
  const dpr = Math.max(window.devicePixelRatio || 1, 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function renderFrame() {
  const list = steps();
  const step = list[currentStep];
  if (!step) return;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  const entered = enterStart !== null ? Math.min(1, (performance.now() - enterStart) / ENTER_DURATION_MS) : 1;
  const t = ease(Math.max(entered, stepProgress));
  step.render({ ctx, w, h, t });
}

function setStep(idx: number, opts: { animate?: boolean } = {}) {
  const list = steps();
  if (idx < 0 || idx >= list.length) return;
  currentStep = idx;
  stepProgress = 0;
  enterStart = opts.animate === false ? null : performance.now();
  stepIndexEl.textContent = `step ${idx + 1} of ${list.length}`;
  stepTitleEl.textContent = list[idx].title;
  captionEl.innerHTML = list[idx].caption;
  renderProgressDots();
  renderFrame();
}

function renderProgressDots() {
  const list = steps();
  progressEl.innerHTML = "";
  for (let i = 0; i < list.length; i++) {
    const d = document.createElement("div");
    d.className = "dot" + (i < currentStep ? " passed" : i === currentStep ? " current" : "");
    d.addEventListener("click", () => {
      playing = false;
      setPlayLabel();
      setStep(i);
    });
    progressEl.appendChild(d);
  }
}

function setPlayLabel() {
  btnPlay.textContent = playing ? "pause" : "play";
}

function tick(now: number) {
  const dt = lastTime ? now - lastTime : 0;
  lastTime = now;

  if (playing) {
    stepProgress += dt / STEP_DURATION_MS;
    if (stepProgress >= 1) {
      const list = steps();
      if (currentStep < list.length - 1) {
        setStep(currentStep + 1);
      } else {
        playing = false;
        setPlayLabel();
        stepProgress = 1;
      }
    }
  }

  if (enterStart !== null) {
    const entered = (now - enterStart) / ENTER_DURATION_MS;
    if (entered >= 1) enterStart = null;
  }

  renderFrame();
  requestAnimationFrame(tick);
}

function switchModule(id: StoryModule["id"]) {
  currentModuleId = id;
  document.querySelectorAll<HTMLButtonElement>(".mod").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.mod === id);
  });
  setStep(0);
}

function wireEvents() {
  document.querySelectorAll<HTMLButtonElement>(".mod").forEach((b) => {
    b.addEventListener("click", () => switchModule(b.dataset.mod as StoryModule["id"]));
  });

  btnPrev.addEventListener("click", () => {
    playing = false;
    setPlayLabel();
    setStep(currentStep - 1);
  });
  btnNext.addEventListener("click", () => {
    playing = false;
    setPlayLabel();
    setStep(currentStep + 1);
  });
  btnPlay.addEventListener("click", () => {
    playing = !playing;
    if (playing && stepProgress >= 1) stepProgress = 0;
    if (playing && currentStep >= steps().length - 1 && stepProgress >= 1) setStep(0);
    setPlayLabel();
  });

  document.addEventListener("keydown", (e) => {
    if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
    if (e.key === "ArrowRight") {
      playing = false;
      setPlayLabel();
      setStep(currentStep + 1);
    } else if (e.key === "ArrowLeft") {
      playing = false;
      setPlayLabel();
      setStep(currentStep - 1);
    } else if (e.key === " ") {
      e.preventDefault();
      playing = !playing;
      if (playing && stepProgress >= 1) stepProgress = 0;
      setPlayLabel();
    } else if (e.key === "1") {
      switchModule("replication");
    } else if (e.key === "2") {
      switchModule("transcription");
    } else if (e.key === "3") {
      switchModule("translation");
    }
  });

  const resizeObserver = new ResizeObserver(() => {
    setupCanvas();
    renderFrame();
  });
  resizeObserver.observe(canvas);
}

function init() {
  setupCanvas();
  wireEvents();
  setStep(0, { animate: false });
  requestAnimationFrame(tick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
