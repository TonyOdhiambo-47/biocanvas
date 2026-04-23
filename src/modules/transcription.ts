import { C } from "../colors";
import {
  clearStage,
  drawBaseLabel,
  drawEnzyme,
  drawLadderDna,
  drawStrandLine,
  ease,
  lerp,
} from "../draw";
import type { Step } from "../types";

const TEMPLATE = "TACGATCGATCG";
const CODING = "ATGCTAGCTAGC";
const MRNA = "AUGCUAGCUAGC";

function stage(ctx: CanvasRenderingContext2D, w: number, h: number) {
  clearStage(ctx, w, h);
}

const step1: Step = {
  title: "the gene on the template",
  caption:
    "Transcription begins with a gene on DNA. One strand acts as the <strong>template</strong> and is read 3' to 5'. The other, <strong>coding</strong> strand has the same sequence as the mRNA will, except with U instead of T.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);
    ctx.save();
    ctx.globalAlpha = op;

    drawLadderDna(ctx, {
      x: 60,
      y: h / 2,
      length: w - 120,
      separation: 50,
      bases1: CODING,
      bases2: TEMPLATE,
      strandLabels: { left: "5'", right: "3'" },
    });
    ctx.restore();

    ctx.save();
    ctx.fillStyle = C.labelDim;
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("coding strand (sense)", 60, h / 2 - 42);
    ctx.fillText("template strand (antisense)", 60, h / 2 + 52);

    // Promoter badge
    ctx.fillStyle = "#7e57c2";
    ctx.font = "600 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("PROMOTER", 120, h / 2 - 70);

    ctx.strokeStyle = "#7e57c2";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(80, h / 2 - 62, 100, 92);
    ctx.setLineDash([]);
    ctx.restore();
  },
};

const step2: Step = {
  title: "RNA polymerase II binds the promoter",
  caption:
    "In eukaryotes, <strong>RNA Polymerase II</strong> is assembled at the promoter with a handful of general transcription factors. Many promoters contain a <strong>TATA box</strong> about 25 bp upstream of the start, recognized by TBP.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);

    drawLadderDna(ctx, {
      x: 60,
      y: h / 2,
      length: w - 120,
      separation: 50,
      bases1: CODING,
      bases2: TEMPLATE,
    });

    const polX = lerp(200, 150, op);
    ctx.save();
    ctx.globalAlpha = op;
    drawEnzyme(ctx, polX, h / 2, 70, 58, "RNA Pol II", C.rnaPolII, { labelBelow: true });
    ctx.restore();

    // TATA box highlight
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = "#ffca28";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(polX - 30, h / 2 + 14, 26, 22);
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffca28";
    ctx.font = "500 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("TATA", polX - 17, h / 2 + 54);
    ctx.restore();
  },
};

const step3: Step = {
  title: "synthesis begins: U replaces T",
  caption:
    "The helix locally unwinds. Pol II reads the template 3' to 5' and builds a complementary <strong>mRNA</strong> 5' to 3'. Where the DNA template has adenine (A), the RNA gets <strong>uracil (U)</strong> instead of thymine.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const polX = lerp(200, w / 2 - 40, ease(t));

    drawLadderDna(ctx, {
      x: 60,
      y: h / 2,
      length: polX - 60,
      separation: 50,
      bases1: CODING.slice(0, 5),
      bases2: TEMPLATE.slice(0, 5),
    });

    drawLadderDna(ctx, {
      x: polX + 80,
      y: h / 2,
      length: w - polX - 140,
      separation: 50,
      bases1: CODING.slice(7),
      bases2: TEMPLATE.slice(7),
    });

    // Transcription bubble
    ctx.save();
    ctx.fillStyle = "rgba(149,117,205,0.15)";
    ctx.beginPath();
    ctx.ellipse(polX + 20, h / 2, 70, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawEnzyme(ctx, polX + 20, h / 2, 70, 56, "Pol II", C.rnaPolII, { labelBelow: false });

    // Nascent mRNA trailing out
    ctx.save();
    ctx.strokeStyle = C.mRna;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(polX + 20, h / 2 + 10);
    ctx.quadraticCurveTo(polX - 40, h / 2 + 80, polX - 140, h / 2 + 100);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = C.mRna;
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("mRNA 5' cap + growing transcript", 60, h / 2 + 120);
    ctx.restore();

    // Show U instead of T in the nascent mRNA
    ctx.save();
    const nascent = MRNA.slice(2, 6);
    for (let i = 0; i < nascent.length; i++) {
      drawBaseLabel(ctx, polX - 60 - i * 18, h / 2 + 100, nascent[i], 10, 16);
    }
    ctx.restore();
  },
};

const step4: Step = {
  title: "5' cap goes on first",
  caption:
    "The first thing that happens to the nascent RNA, while it is still being made, is <strong>5' capping</strong>: a 7-methylguanosine is added to the 5' end via a 5'-5' triphosphate linkage. This happens at about 25 nucleotides in, <em>not</em> at the end.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);

    drawLadderDna(ctx, {
      x: 60,
      y: h / 2,
      length: 280,
      separation: 40,
      bases1: CODING.slice(0, 6),
      bases2: TEMPLATE.slice(0, 6),
    });

    drawEnzyme(ctx, 380, h / 2, 60, 50, "Pol II", C.rnaPolII);

    // mRNA with 5' cap
    ctx.save();
    ctx.strokeStyle = C.mRna;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(380, h / 2 + 20);
    ctx.quadraticCurveTo(380, h / 2 + 80, 180, h / 2 + 100);
    ctx.stroke();
    ctx.restore();

    // 5' cap marker
    const capX = 180;
    const capY = h / 2 + 100;
    ctx.save();
    ctx.globalAlpha = op;
    const grad = ctx.createRadialGradient(capX, capY, 0, capX, capY, 20);
    grad.addColorStop(0, "#ffeb3b");
    grad.addColorStop(1, "#f57f17");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(capX, capY, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.font = "700 8px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("m7G", capX, capY);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = C.label;
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("5' cap (m7G)", capX - 40, capY - 25);
    ctx.restore();
  },
};

const step5: Step = {
  title: "splicing removes introns",
  caption:
    "In eukaryotes, the <strong>spliceosome</strong> cuts out the intervening sequences (<strong>introns</strong>) and joins the coding pieces (<strong>exons</strong>) back together. Splicing happens co-transcriptionally, while Pol II keeps moving.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);
    const y = h / 2;

    // Draw pre-mRNA with alternating exon/intron segments
    const segs = [
      { type: "E", label: "exon 1", w: 90, color: C.mRna },
      { type: "I", label: "intron", w: 50, color: "#666" },
      { type: "E", label: "exon 2", w: 70, color: C.mRna },
      { type: "I", label: "intron", w: 40, color: "#666" },
      { type: "E", label: "exon 3", w: 90, color: C.mRna },
    ];
    const total = segs.reduce((s, x) => s + x.w, 0);
    let x = (w - total) / 2;

    ctx.save();
    ctx.globalAlpha = 1 - 0.4 * op;
    for (const s of segs) {
      ctx.fillStyle = s.color;
      ctx.fillRect(x, y - 40, s.w, 8);
      ctx.fillStyle = C.labelDim;
      ctx.font = "500 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(s.label, x + s.w / 2, y - 50);
      x += s.w;
    }
    ctx.restore();

    // Mature mRNA below - introns removed, exons joined
    const exonWidths = segs.filter((s) => s.type === "E").map((s) => s.w);
    const exonTotal = exonWidths.reduce((s, v) => s + v, 0);
    let mx = (w - exonTotal) / 2;
    ctx.save();
    ctx.globalAlpha = op;
    ctx.fillStyle = C.mRna;
    for (const ew of exonWidths) {
      ctx.fillRect(mx, y + 20, ew, 8);
      mx += ew;
    }
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = C.label;
    ctx.textAlign = "center";
    ctx.fillText("mature mRNA (introns removed)", w / 2, y + 48);
    ctx.restore();

    // Arrows from introns pointing down and off
    ctx.save();
    ctx.strokeStyle = "#777";
    ctx.fillStyle = "#777";
    ctx.lineWidth = 1.5;
    let ix = (w - total) / 2;
    for (const s of segs) {
      if (s.type === "I") {
        ctx.globalAlpha = op;
        ctx.beginPath();
        ctx.moveTo(ix + s.w / 2, y - 28);
        ctx.lineTo(ix + s.w / 2, y + 4);
        ctx.stroke();
      }
      ix += s.w;
    }
    ctx.restore();
  },
};

const step6: Step = {
  title: "termination and the poly-A tail",
  caption:
    "When Pol II transcribes the <strong>polyadenylation signal</strong> (AAUAAA in the RNA), the CPSF complex cleaves the transcript and <strong>poly(A) polymerase</strong> adds 100 to 250 adenines to the 3' end. Pol II releases shortly after.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);
    const y = h / 2;

    // mRNA with cap and growing poly-A tail
    const startX = 60;
    const endX = w - 60 - 120 * op;
    ctx.save();
    ctx.strokeStyle = C.mRna;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();

    // 5' cap
    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.arc(startX - 8, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font = "700 7px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("m7G", startX - 8, y);
    ctx.restore();

    // Poly-A tail
    ctx.save();
    ctx.globalAlpha = op;
    ctx.fillStyle = C.baseA;
    const n = 10;
    for (let i = 0; i < n; i++) {
      const ax = endX + i * 14 + 10;
      const ay = y;
      drawBaseLabel(ctx, ax, ay, "A", 10, 11);
    }
    ctx.fillStyle = C.label;
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("poly-A tail (~200 As)", endX + n * 14 / 2, y + 30);
    ctx.restore();

    // AAUAAA signal highlight
    ctx.save();
    ctx.strokeStyle = "#ff5252";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(endX - 80, y - 16, 60, 32);
    ctx.setLineDash([]);
    ctx.fillStyle = "#ff5252";
    ctx.font = "600 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("AAUAAA", endX - 50, y - 24);
    ctx.restore();
  },
};

const step7: Step = {
  title: "mature mRNA exits the nucleus",
  caption:
    "With 5' cap, spliced exons, and poly-A tail all in place, the mature mRNA travels through a nuclear pore into the cytoplasm. It is now ready to be translated into a protein.",
  render({ ctx, w, h, t }) {
    stage(ctx, w, h);
    const op = ease(t);

    // Nuclear membrane
    ctx.save();
    ctx.strokeStyle = "#5d4037";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.38, h * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.labelDim;
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("nucleus", w / 2, h / 2 - h * 0.42);
    ctx.fillText("cytoplasm", w - 80, h / 2 - 10);
    ctx.restore();

    // mRNA moving from nucleus to cytoplasm
    const fromX = w / 2 - 60;
    const toX = w - 140;
    const x = lerp(fromX, toX, op);

    ctx.save();
    drawStrandLine(ctx, x - 70, h / 2, x, h / 2, C.mRna, 4);
    // 5' cap
    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.arc(x - 78, h / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font = "700 7px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("m7G", x - 78, h / 2);

    // Poly-A tail
    ctx.fillStyle = C.baseA;
    ctx.textBaseline = "alphabetic";
    for (let i = 0; i < 6; i++) {
      drawBaseLabel(ctx, x + 8 + i * 12, h / 2, "A", 9, 10);
    }
    ctx.restore();
  },
};

export const TRANSCRIPTION_STEPS: Step[] = [step1, step2, step3, step4, step5, step6, step7];
