import { C } from "../colors";
import {
  clearStage,
  drawBaseLabel,
  drawEnzyme,
  drawStrandLine,
  ease,
  lerp,
} from "../draw";
import { GENETIC_CODE, anticodon } from "../codon-table";
import type { Step } from "../types";

const MRNA = "AUGCUAGCUUUUGAAUAA";

function stage(ctx: CanvasRenderingContext2D, w: number, h: number) {
  clearStage(ctx, w, h);
}

function drawMRna(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  codons: string[],
  highlightIdx: number | null,
  opts: { showCap?: boolean; codonW?: number; gap?: number } = {}
) {
  const codonW = opts.codonW ?? 54;
  const gap = opts.gap ?? 6;
  const baseW = codonW / 3 - 2;
  ctx.save();
  ctx.strokeStyle = C.mRna;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 15, y);
  ctx.lineTo(x + codons.length * (codonW + gap) - gap + 15, y);
  ctx.stroke();
  if (opts.showCap) {
    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.arc(x - 25, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font = "700 7px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("m7G", x - 25, y);
  }
  ctx.restore();

  for (let i = 0; i < codons.length; i++) {
    const cx = x + i * (codonW + gap);
    const codon = codons[i];
    ctx.save();
    if (highlightIdx === i) {
      ctx.fillStyle = "rgba(0,200,83,0.15)";
      ctx.fillRect(cx - 4, y - 18, codonW + 8, 36);
      ctx.strokeStyle = "#00c853";
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 4, y - 18, codonW + 8, 36);
    }
    ctx.restore();
    for (let j = 0; j < 3; j++) {
      drawBaseLabel(ctx, cx + j * (baseW + 2) + baseW / 2, y, codon[j] || "", 10, baseW);
    }
  }
}

function splitCodons(rna: string): string[] {
  const out: string[] = [];
  for (let i = 0; i + 3 <= rna.length; i += 3) out.push(rna.substring(i, i + 3));
  return out;
}

// Fit `n` codons into the available width, leaving room for the 5' cap and a small margin.
function layoutCodons(w: number, n: number): { codonW: number; gap: number; total: number; x: number } {
  const margin = 60;
  const available = Math.max(200, w - margin);
  const desired = { codonW: 54, gap: 6 };
  const maxTotal = n * (desired.codonW + desired.gap) - desired.gap;
  let codonW = desired.codonW;
  let gap = desired.gap;
  if (maxTotal > available) {
    const scale = available / maxTotal;
    codonW = Math.max(22, desired.codonW * scale);
    gap = Math.max(2, desired.gap * scale);
  }
  const total = n * (codonW + gap) - gap;
  const x = (w - total) / 2;
  return { codonW, gap, total, x };
}

function drawTRNA(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  codon: string,
  aa: string,
  opacity = 1
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const anti = anticodon(codon);

  // Clover-leaf simplified: inverted Y shape
  ctx.strokeStyle = C.tRNA;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y); // anticodon bottom
  ctx.lineTo(x, y - 30);
  ctx.moveTo(x, y - 30);
  ctx.lineTo(x - 25, y - 50);
  ctx.moveTo(x, y - 30);
  ctx.lineTo(x + 25, y - 50);
  ctx.moveTo(x, y - 30);
  ctx.lineTo(x, y - 65);
  ctx.stroke();

  // Small loops at each tip
  for (const [lx, ly] of [[x - 25, y - 50], [x + 25, y - 50], [x, y - 65]]) {
    ctx.fillStyle = C.tRNA;
    ctx.beginPath();
    ctx.arc(lx, ly, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Amino acid at the top (acceptor stem)
  ctx.fillStyle = C.aa;
  ctx.beginPath();
  ctx.arc(x, y - 78, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.font = "700 9px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(aa, x, y - 78);

  // Anticodon at the bottom
  ctx.textBaseline = "alphabetic";
  const step = 14;
  for (let i = 0; i < 3; i++) {
    drawBaseLabel(ctx, x - step + i * step, y + 10, anti[i], 10, 12);
  }

  ctx.restore();
}

const step1: Step = {
  title: "the mature mRNA arrives",
  caption:
    "The mature mRNA reaches the cytoplasm with its 5' cap, its 3' poly-A tail, and <strong>codons</strong> in between: triplets of bases that specify amino acids. The first <strong>AUG</strong> is the start codon.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);
    const codons = splitCodons(MRNA);
    const { codonW, gap, total, x } = layoutCodons(w, codons.length);
    const y = h / 2 + 20;
    ctx.save();
    ctx.globalAlpha = op;
    drawMRna(ctx, x, y, codons, 0, { showCap: true, codonW, gap });
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#66bb6a";
    ctx.font = "600 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("start codon", x + codonW / 2, y - 30);
    ctx.restore();
  },
};

const step2: Step = {
  title: "ribosome assembles at AUG",
  caption:
    "The <strong>40S</strong> small subunit with the initiator Met-tRNA binds the 5' cap and scans until it finds the start codon. The <strong>60S</strong> large subunit then joins, forming the 80S ribosome with three tRNA sites: A, P, and E.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);
    const codons = splitCodons(MRNA);
    const { codonW, gap, total, x } = layoutCodons(w, codons.length);
    const y = h / 2 + 40;
    drawMRna(ctx, x, y, codons, 0, { showCap: true, codonW, gap });

    // Small subunit
    ctx.save();
    ctx.globalAlpha = op;
    const cx = x + codonW / 2;
    const rcx = cx + codonW + gap;
    drawRibosome(ctx, cx + (codonW + gap) / 2, y - 10);
    ctx.restore();

    // site labels
    ctx.save();
    ctx.globalAlpha = op;
    ctx.fillStyle = C.labelDim;
    ctx.font = "500 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("E", cx - (codonW + gap), y - 35);
    ctx.fillText("P", cx, y - 35);
    ctx.fillText("A", rcx, y - 35);
    ctx.restore();
  },
};

const step3: Step = {
  title: "initiator tRNA sits in the P site",
  caption:
    "Unlike every other tRNA, the <strong>initiator Met-tRNA</strong> docks straight into the <strong>P site</strong> (not the A site). Its anticodon UAC pairs with AUG. The A site sits empty, ready for the next aminoacyl-tRNA.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);
    const codons = splitCodons(MRNA);
    const { codonW, gap, total, x } = layoutCodons(w, codons.length);
    const y = h / 2 + 60;
    drawMRna(ctx, x, y, codons, 0, { showCap: true, codonW, gap });

    const cx = x + codonW / 2;
    const rcx = cx + codonW + gap;
    drawRibosome(ctx, cx + (codonW + gap) / 2, y - 10);

    // tRNA in P site with Met
    const tRNAY = lerp(y - 140, y - 20, op);
    drawTRNA(ctx, cx, tRNAY, codons[0], GENETIC_CODE[codons[0]] || "M", op);

    ctx.save();
    ctx.globalAlpha = op;
    ctx.fillStyle = C.labelDim;
    ctx.font = "500 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("E", cx - (codonW + gap), y - 55);
    ctx.fillText("P", cx, y - 55);
    ctx.fillText("A", rcx, y - 55);
    ctx.restore();
  },
};

const step4: Step = {
  title: "second tRNA enters the A site",
  caption:
    "The next aminoacyl-tRNA delivers its amino acid to the <strong>A site</strong>. The ribosome checks the codon-anticodon pairing. If correct, the amino acids are next to each other in the P-A site tunnel.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);
    const codons = splitCodons(MRNA);
    const { codonW, gap, total, x } = layoutCodons(w, codons.length);
    const y = h / 2 + 60;
    drawMRna(ctx, x, y, codons, 1, { showCap: true, codonW, gap });

    const cx = x + codonW / 2;
    const rcx = cx + codonW + gap;
    drawRibosome(ctx, cx + (codonW + gap) / 2, y - 10);

    // tRNA in P site (Met)
    drawTRNA(ctx, cx, y - 20, codons[0], GENETIC_CODE[codons[0]] || "M");

    // Second tRNA arriving
    const arriveY = lerp(y - 160, y - 20, op);
    const aa2 = GENETIC_CODE[codons[1]] || "?";
    drawTRNA(ctx, rcx, arriveY, codons[1], aa2);

    ctx.save();
    ctx.globalAlpha = op;
    ctx.strokeStyle = "#66bb6a";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(rcx - codonW / 2, y - 18, codonW, 34);
    ctx.setLineDash([]);
    ctx.restore();
  },
};

const step5: Step = {
  title: "peptide bond forms",
  caption:
    "The <strong>peptidyl transferase center</strong> of the large subunit catalyzes a peptide bond between the two amino acids. This catalytic activity is carried out by rRNA, which makes the ribosome a <em>ribozyme</em>.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);
    const codons = splitCodons(MRNA);
    const { codonW, gap, total, x } = layoutCodons(w, codons.length);
    const y = h / 2 + 60;
    drawMRna(ctx, x, y, codons, 1, { showCap: true, codonW, gap });

    const cx = x + codonW / 2;
    const rcx = cx + codonW + gap;
    drawRibosome(ctx, cx + (codonW + gap) / 2, y - 10);

    drawTRNA(ctx, cx, y - 20, codons[0], GENETIC_CODE[codons[0]] || "M");
    drawTRNA(ctx, rcx, y - 20, codons[1], GENETIC_CODE[codons[1]] || "?");

    // Peptide bond connecting the two AAs
    ctx.save();
    ctx.strokeStyle = "#fff176";
    ctx.lineWidth = 2;
    ctx.globalAlpha = op;
    ctx.beginPath();
    ctx.moveTo(cx, y - 98);
    ctx.quadraticCurveTo((cx + rcx) / 2, y - 120, rcx, y - 98);
    ctx.stroke();

    ctx.fillStyle = "#fff176";
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("peptide bond", (cx + rcx) / 2, y - 128);
    ctx.restore();
  },
};

const step6: Step = {
  title: "translocation: ribosome moves one codon",
  caption:
    "<strong>eEF2</strong> (EF-G in bacteria) hydrolyzes GTP to shift the ribosome one codon down the mRNA. The tRNA that was in P moves to E, the tRNA that was in A moves to P, and A is vacant again.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);
    const codons = splitCodons(MRNA);
    const { codonW, gap, total, x } = layoutCodons(w, codons.length);
    const y = h / 2 + 60;
    const shift = lerp(0, codonW + gap, op);
    drawMRna(ctx, x, y, codons, 2, { showCap: true, codonW, gap });

    const cx = x + codonW / 2 + shift;
    const rcx = cx + codonW + gap;
    const eSite = cx - (codonW + gap);
    drawRibosome(ctx, cx + (codonW + gap) / 2, y - 10);

    // tRNAs in their new positions
    drawTRNA(ctx, eSite, y - 20, codons[0], GENETIC_CODE[codons[0]] || "M", 1 - op * 0.6);
    drawTRNA(ctx, cx, y - 20, codons[1], GENETIC_CODE[codons[1]] || "?");

    ctx.save();
    ctx.fillStyle = C.labelDim;
    ctx.font = "500 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("E (exiting)", eSite, y + 38);
    ctx.fillText("P", cx, y + 38);
    ctx.fillText("A (empty)", rcx, y + 38);
    ctx.restore();
  },
};

const step7: Step = {
  title: "stop codon: release factor + polypeptide freed",
  caption:
    "When a stop codon (UAA, UAG, or UGA) enters the A site, there is no matching tRNA. A <strong>release factor</strong> binds instead. The polypeptide is released. The ribosome dissociates. The protein folds into its 3D shape.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);
    const codons = splitCodons(MRNA);
    const { codonW, gap, total, x } = layoutCodons(w, codons.length);
    const y = h / 2 + 60;
    drawMRna(ctx, x, y, codons, codons.length - 1, { showCap: true, codonW, gap });

    const stopX = x + (codons.length - 1) * (codonW + gap) + codonW / 2;
    // Highlight stop codon in red
    ctx.save();
    ctx.strokeStyle = "#f44336";
    ctx.lineWidth = 2;
    ctx.strokeRect(stopX - codonW / 2 - 4, y - 18, codonW + 8, 36);
    ctx.fillStyle = "#f44336";
    ctx.font = "600 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("STOP", stopX, y + 38);
    ctx.restore();

    // Release factor in A site
    ctx.save();
    ctx.globalAlpha = op;
    drawEnzyme(ctx, stopX, y - 20, 36, 28, "RF", "#f44336");
    ctx.restore();

    // Polypeptide chain floating up
    ctx.save();
    ctx.globalAlpha = op;
    const chainX = x;
    const chainY = lerp(y - 80, 90, op);
    const aaSeq = codons.slice(0, -1).map((c) => GENETIC_CODE[c] || "?");
    for (let i = 0; i < aaSeq.length; i++) {
      const px = chainX + i * 22 + 40;
      const py = chainY + Math.sin(i * 0.6) * 6;
      ctx.fillStyle = C.aa;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = C.aa;
      ctx.lineWidth = 2;
      if (i > 0) {
        const ppx = chainX + (i - 1) * 22 + 40;
        const ppy = chainY + Math.sin((i - 1) * 0.6) * 6;
        ctx.beginPath();
        ctx.moveTo(ppx + 9, ppy);
        ctx.lineTo(px - 9, py);
        ctx.stroke();
      }
      ctx.fillStyle = "#000";
      ctx.font = "700 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(aaSeq[i], px, py);
      ctx.textBaseline = "alphabetic";
    }
    ctx.fillStyle = C.label;
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("polypeptide released", chainX, chainY - 20);
    ctx.restore();

    // Ribosome dimmed
    ctx.save();
    ctx.globalAlpha = 0.4 + 0.6 * (1 - op);
    drawRibosome(ctx, stopX - (codonW + gap) / 2, y - 10);
    ctx.restore();

    // Unused reference
    void drawStrandLine;
  },
};

function drawRibosome(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Large subunit (top)
  const grad = ctx.createRadialGradient(cx, cy - 30, 0, cx, cy - 30, 80);
  grad.addColorStop(0, C.ribosomeL);
  grad.addColorStop(1, "#5c5240");
  ctx.save();
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 28, 85, 52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4a4330";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Small subunit (bottom)
  const grad2 = ctx.createRadialGradient(cx, cy + 18, 0, cx, cy + 18, 60);
  grad2.addColorStop(0, C.ribosomeS);
  grad2.addColorStop(1, "#8a8275");
  ctx.save();
  ctx.fillStyle = grad2;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 16, 78, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5240";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Labels
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "600 9px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("60S", cx, cy - 28);
  ctx.fillText("40S", cx, cy + 20);
  ctx.restore();
}

export const TRANSLATION_STEPS: Step[] = [step1, step2, step3, step4, step5, step6, step7];
