import { C, baseColor } from "./colors";

export const TAU = Math.PI * 2;

export function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clearStage(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = "#070707";
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h * 0.35, 0, w / 2, h * 0.35, Math.max(w, h) * 0.7);
  g.addColorStop(0, "rgba(0, 200, 83, 0.04)");
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export interface DnaOpts {
  x: number;
  y: number;
  length: number;
  separation?: number;
  bases1: string;
  bases2?: string;
  baseWidth?: number;
  strand1Color?: string;
  strand2Color?: string;
  fontSize?: number;
  renderRungs?: boolean;
  strandLabels?: { left?: string; right?: string };
  rungGap?: number;
}

export function drawStrandLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 2.5
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function drawLadderDna(ctx: CanvasRenderingContext2D, opts: DnaOpts) {
  const {
    x,
    y,
    length,
    separation = 36,
    bases1,
    bases2 = bases1.split("").map((b) => complementDNA(b)).join(""),
    baseWidth = 18,
    strand1Color = C.strand1,
    strand2Color = C.strand2,
    fontSize = 10,
    renderRungs = true,
    strandLabels,
    rungGap = 0,
  } = opts;

  const n = bases1.length;
  const step = length / n;

  drawStrandLine(ctx, x, y - separation / 2, x + length, y - separation / 2, strand1Color, 2.5);
  drawStrandLine(ctx, x, y + separation / 2, x + length, y + separation / 2, strand2Color, 2.5);

  if (strandLabels?.left) {
    labelStrand(ctx, x - 12, y - separation / 2, strandLabels.left);
  }
  if (strandLabels?.right) {
    labelStrand(ctx, x + length + 12, y + separation / 2, strandLabels.right);
  }

  if (renderRungs) {
    for (let i = 0; i < n; i++) {
      const cx = x + step * (i + 0.5);
      const topY = y - separation / 2 + 2 + rungGap;
      const botY = y + separation / 2 - 2 - rungGap;
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, topY);
      ctx.lineTo(cx, botY);
      ctx.stroke();
      ctx.restore();

      drawBaseLabel(ctx, cx, topY + fontSize - 2, bases1[i] || "", fontSize, baseWidth);
      drawBaseLabel(ctx, cx, botY - fontSize + 8, bases2[i] || "", fontSize, baseWidth);
    }
  }
}

export function complementDNA(b: string): string {
  switch (b) {
    case "A": return "T";
    case "T": return "A";
    case "G": return "C";
    case "C": return "G";
    default: return b;
  }
}

export function drawBaseLabel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  base: string,
  fontSize: number,
  width: number
) {
  ctx.save();
  const h = fontSize + 6;
  ctx.fillStyle = baseColor(base) + "55";
  ctx.strokeStyle = baseColor(base);
  ctx.lineWidth = 1;
  roundRect(ctx, cx - width / 2, cy - h / 2, width, h, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(base, cx, cy + 0.5);
  ctx.restore();
}

export function labelStrand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  txt: string
) {
  ctx.save();
  ctx.fillStyle = C.labelDim;
  ctx.font = "500 9px 'JetBrains Mono', monospace";
  ctx.textAlign = txt.endsWith("'") && txt.length === 2 ? "right" : "left";
  ctx.textBaseline = "middle";
  ctx.fillText(txt, x, y);
  ctx.restore();
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawEnzyme(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  label: string,
  color: string,
  opts: { pulse?: number; labelBelow?: boolean } = {}
) {
  ctx.save();
  ctx.globalAlpha = 1;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height));
  grad.addColorStop(0, color);
  grad.addColorStop(1, shade(color, -20));
  ctx.fillStyle = grad;
  ctx.strokeStyle = shade(color, -30);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, width / 2, height / 2, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();

  if (opts.pulse !== undefined) {
    const p = opts.pulse;
    ctx.strokeStyle = `rgba(255,255,255,${0.25 * (1 - p)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, (width / 2) * (1 + 0.35 * p), (height / 2) * (1 + 0.35 * p), 0, 0, TAU);
    ctx.stroke();
  }

  ctx.fillStyle = "#fff";
  ctx.font = "600 10px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const ly = opts.labelBelow ? cy + height / 2 + 10 : cy;
  if (opts.labelBelow) ctx.fillStyle = C.label;
  ctx.fillText(label, cx, ly);
  ctx.restore();
}

function shade(hex: string, percent: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  let r = (n >> 16) & 0xff;
  let g = (n >> 8) & 0xff;
  let b = n & 0xff;
  const f = 1 + percent / 100;
  r = clamp(Math.round(r * f), 0, 255);
  g = clamp(Math.round(g * f), 0, 255);
  b = clamp(Math.round(b * f), 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  label?: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 6;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  if (label) {
    ctx.font = "500 9px 'JetBrains Mono', monospace";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 - 6);
  }
  ctx.restore();
}

export function drawBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string,
  align: CanvasTextAlign = "left"
) {
  ctx.save();
  ctx.font = "500 10px 'JetBrains Mono', monospace";
  const m = ctx.measureText(text);
  const padX = 6;
  const padY = 3;
  const w = m.width + padX * 2;
  const h = 14 + padY;
  let bx = x;
  if (align === "center") bx -= w / 2;
  if (align === "right") bx -= w;
  ctx.fillStyle = `${color}33`;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  roundRect(ctx, bx, y - h / 2, w, h, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, bx + padX, y + 0.5);
  ctx.restore();
}

export function drawGridBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.02)";
  ctx.lineWidth = 1;
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawBases(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bases: string,
  opts: { step?: number; fontSize?: number; count?: number } = {}
) {
  const step = opts.step ?? 18;
  const fs = opts.fontSize ?? 11;
  const n = opts.count ?? bases.length;
  for (let i = 0; i < n; i++) {
    drawBaseLabel(ctx, x + i * step, y, bases[i] || "", fs, step - 2);
  }
}
