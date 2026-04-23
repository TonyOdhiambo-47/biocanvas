import { C } from "../colors";
import { clearStage, drawBaseLabel, drawEnzyme, drawLadderDna, drawStrandLine, ease, lerp, roundRect } from "../draw";
import type { Step } from "../types";

const DNA1 = "ATGCATGCAT";
const DNA2 = "TACGTACGTA";

function drawHeader(ctx: CanvasRenderingContext2D, w: number, h: number) {
  clearStage(ctx, w, h);
}

const step1: Step = {
  title: "the double helix",
  caption:
    "<strong>DNA</strong> is a double helix. Two complementary strands, held together by hydrogen bonds between the bases: A pairs with T through two bonds, G pairs with C through three.",
  render({ ctx, w, h, t }) {
    drawHeader(ctx, w, h);
    const opacity = ease(t);
    ctx.save();
    ctx.globalAlpha = opacity;
    drawLadderDna(ctx, {
      x: 80,
      y: h / 2,
      length: w - 160,
      separation: 50,
      bases1: DNA1,
      bases2: DNA2,
      strandLabels: { left: "5'", right: "3'" },
    });
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = C.labelDim;
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("template", 80, h / 2 + 50);
    ctx.fillText("template", 80, h / 2 - 42);
    ctx.restore();
  },
};

const step2: Step = {
  title: "unwinding: topoisomerase + helicase",
  caption:
    "Before replication can start, the helix has to unwind. <strong>Topoisomerase</strong> relieves the torsional stress ahead of the fork while <strong>helicase</strong> separates the two strands by breaking the hydrogen bonds between base pairs.",
  render({ ctx, w, h, t }) {
    drawHeader(ctx, w, h);
    const forkX = lerp(w * 0.85, w * 0.55, ease(t));

    drawLadderDna(ctx, {
      x: 60,
      y: h / 2,
      length: forkX - 60,
      separation: 50,
      bases1: DNA1.slice(0, 6),
      bases2: DNA2.slice(0, 6),
      strandLabels: { left: "5'" },
    });

    const topY = h / 2 - 60;
    const botY = h / 2 + 60;
    ctx.save();
    ctx.strokeStyle = C.strand1;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(forkX, h / 2 - 25);
    ctx.quadraticCurveTo(forkX + 30, h / 2 - 30, w - 40, topY);
    ctx.stroke();

    ctx.strokeStyle = C.strand2;
    ctx.beginPath();
    ctx.moveTo(forkX, h / 2 + 25);
    ctx.quadraticCurveTo(forkX + 30, h / 2 + 30, w - 40, botY);
    ctx.stroke();
    ctx.restore();

    drawEnzyme(ctx, forkX, h / 2, 44, 44, "Helicase", C.helicase, { labelBelow: true, pulse: (t * 2) % 1 });
    drawEnzyme(ctx, forkX + 80, h / 2 - 70, 32, 32, "Topo", C.topo, { labelBelow: true });
  },
};

const step3: Step = {
  title: "single-strand binding proteins",
  caption:
    "Once the strands are apart, <strong>single-strand binding proteins</strong> (SSBs / RPA in eukaryotes) coat the exposed bases and stop the strands from snapping back together or being attacked by nucleases.",
  render({ ctx, w, h, t }) {
    drawHeader(ctx, w, h);
    const op = ease(t);
    const forkX = w * 0.45;

    drawLadderDna(ctx, {
      x: 60,
      y: h / 2,
      length: forkX - 60,
      separation: 50,
      bases1: DNA1.slice(0, 5),
      bases2: DNA2.slice(0, 5),
    });

    const topY = h / 2 - 55;
    const botY = h / 2 + 55;
    const splitEndX = w - 60;
    drawStrandLine(ctx, forkX, h / 2 - 25, splitEndX, topY, C.strand1, 2.5);
    drawStrandLine(ctx, forkX, h / 2 + 25, splitEndX, botY, C.strand2, 2.5);

    ctx.save();
    ctx.globalAlpha = op;
    for (let i = 0; i < 4; i++) {
      const x = lerp(forkX + 40, splitEndX - 20, i / 3);
      const yOff = lerp(h / 2 - 25, topY, (x - forkX) / (splitEndX - forkX));
      drawEnzyme(ctx, x, yOff - 10, 26, 22, "SSB", C.ssb);
      const yOff2 = lerp(h / 2 + 25, botY, (x - forkX) / (splitEndX - forkX));
      drawEnzyme(ctx, x, yOff2 + 10, 26, 22, "SSB", C.ssb);
    }
    ctx.restore();

    drawEnzyme(ctx, forkX, h / 2, 40, 40, "Helicase", C.helicase, { labelBelow: false });
  },
};

const step4: Step = {
  title: "primase lays RNA primers",
  caption:
    "DNA polymerase can't start from nothing. <strong>Primase</strong> synthesizes a short RNA <em>primer</em> (roughly 10 nucleotides) that gives polymerase a free 3' hydroxyl to extend from.",
  render({ ctx, w, h, t }) {
    drawHeader(ctx, w, h);
    const op = ease(t);
    const forkX = w * 0.4;

    drawLadderDna(ctx, {
      x: 50,
      y: h / 2,
      length: forkX - 50,
      separation: 50,
      bases1: DNA1.slice(0, 5),
      bases2: DNA2.slice(0, 5),
    });

    const topY = h / 2 - 55;
    const botY = h / 2 + 55;
    const splitEndX = w - 50;
    drawStrandLine(ctx, forkX, h / 2 - 25, splitEndX, topY, C.strand1, 2.5);
    drawStrandLine(ctx, forkX, h / 2 + 25, splitEndX, botY, C.strand2, 2.5);

    // RNA primers (red) on each strand
    ctx.save();
    ctx.globalAlpha = op;
    ctx.strokeStyle = "#f44336";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(forkX + 30, lerp(h / 2 - 25, topY, 0.15));
    ctx.lineTo(forkX + 90, lerp(h / 2 - 25, topY, 0.5));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(forkX + 30, lerp(h / 2 + 25, botY, 0.15));
    ctx.lineTo(forkX + 90, lerp(h / 2 + 25, botY, 0.5));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(forkX + 170, lerp(h / 2 + 25, botY, 0.4));
    ctx.lineTo(forkX + 230, lerp(h / 2 + 25, botY, 0.65));
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = op;
    ctx.fillStyle = "#f44336";
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("RNA primer", forkX + 40, lerp(h / 2 - 25, topY, 0.5) - 10);
    ctx.fillText("RNA primer", forkX + 40, lerp(h / 2 + 25, botY, 0.5) + 18);
    ctx.restore();

    drawEnzyme(ctx, forkX + 60, h / 2, 34, 34, "Primase", C.primase, { labelBelow: true });
    drawEnzyme(ctx, forkX, h / 2, 36, 36, "Helicase", C.helicase);
  },
};

const step5: Step = {
  title: "DNA polymerase builds the new strands",
  caption:
    "<strong>DNA polymerase</strong> (Pol III in bacteria, Pol ε on the leading strand in eukaryotes) reads the template 3' to 5' and adds complementary nucleotides 5' to 3'. The leading strand is synthesized continuously; the lagging strand is made in short <strong>Okazaki fragments</strong>.",
  render({ ctx, w, h, t }) {
    drawHeader(ctx, w, h);
    const forkX = w * 0.32;
    const progress = ease(t);

    drawLadderDna(ctx, {
      x: 40,
      y: h / 2,
      length: forkX - 40,
      separation: 50,
      bases1: DNA1.slice(0, 4),
      bases2: DNA2.slice(0, 4),
    });

    const topY = h / 2 - 55;
    const botY = h / 2 + 55;
    const splitEndX = w - 40;

    drawStrandLine(ctx, forkX, h / 2 - 25, splitEndX, topY, C.strand1, 2.5);
    drawStrandLine(ctx, forkX, h / 2 + 25, splitEndX, botY, C.strand2, 2.5);

    // Leading strand (growing continuously)
    ctx.save();
    ctx.strokeStyle = C.newStrand;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    const leadX = lerp(forkX + 20, splitEndX - 40, progress);
    ctx.beginPath();
    ctx.moveTo(forkX + 10, lerp(h / 2 - 25, topY, 0.08));
    ctx.lineTo(leadX, lerp(h / 2 - 25, topY, (leadX - forkX) / (splitEndX - forkX)));
    ctx.stroke();
    ctx.restore();

    // Lagging strand - Okazaki fragments (3 short pieces)
    ctx.save();
    ctx.strokeStyle = C.newStrand;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    const frags = [
      [0.1, 0.25],
      [0.35, 0.55],
      [0.65, 0.85],
    ];
    for (const [a, b] of frags) {
      const fa = lerp(forkX + 20, splitEndX - 20, a);
      const fb = lerp(forkX + 20, splitEndX - 20, b);
      const ya = lerp(h / 2 + 25, botY, (fa - forkX) / (splitEndX - forkX));
      const yb = lerp(h / 2 + 25, botY, (fb - forkX) / (splitEndX - forkX));
      ctx.beginPath();
      ctx.moveTo(fa, ya + 6);
      ctx.lineTo(fb, yb + 6);
      ctx.stroke();
    }
    ctx.restore();

    // Polymerase on leading strand
    drawEnzyme(ctx, leadX, lerp(h / 2 - 25, topY, (leadX - forkX) / (splitEndX - forkX)) - 8, 40, 32, "Pol", C.dnaPolLead);
    // Polymerase on lagging strand
    drawEnzyme(ctx, forkX + 180, lerp(h / 2 + 25, botY, 0.45) + 12, 40, 32, "Pol", C.dnaPolLag);

    ctx.save();
    ctx.fillStyle = C.labelDim;
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("leading strand (continuous)", forkX + 30, topY + 26);
    ctx.fillText("lagging strand (Okazaki fragments)", forkX + 30, botY - 18);
    ctx.restore();
  },
};

const step6: Step = {
  title: "Okazaki fragments close up",
  caption:
    "A closer look at the lagging strand: short DNA fragments synthesized backwards relative to fork movement. Each starts with an RNA primer (red) that later gets replaced with DNA.",
  render({ ctx, w, h, t }) {
    drawHeader(ctx, w, h);
    const op = ease(t);
    const y = h / 2;
    const startX = 60;
    const endX = w - 60;

    drawStrandLine(ctx, startX, y - 25, endX, y - 25, C.strand2, 3);

    ctx.save();
    ctx.globalAlpha = op;
    const frags = 4;
    const fragWidth = (endX - startX) / (frags + 0.5);
    for (let i = 0; i < frags; i++) {
      const fa = startX + i * fragWidth + 10;
      const fb = fa + fragWidth - 24;

      // RNA primer (red)
      ctx.strokeStyle = "#f44336";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(fa, y + 10);
      ctx.lineTo(fa + 18, y + 10);
      ctx.stroke();

      // DNA fragment (green/new)
      ctx.strokeStyle = C.newStrand;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(fa + 18, y + 10);
      ctx.lineTo(fb, y + 10);
      ctx.stroke();

      // Gap indicator
      if (i < frags - 1) {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fb, y + 10);
        ctx.lineTo(fb + 20, y + 10);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = C.labelDim;
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("template (3' -> 5')", w / 2, y - 40);
    ctx.fillStyle = "#f44336";
    ctx.fillText("RNA primer", startX + 40, y + 36);
    ctx.fillStyle = C.newStrand;
    ctx.fillText("new DNA", startX + 110, y + 36);
    ctx.fillStyle = C.labelDim;
    ctx.fillText("gap (before ligation)", startX + 190, y + 52);
    ctx.restore();
  },
};

const step7: Step = {
  title: "primers removed, ligase seals the gaps",
  caption:
    "<strong>RNase H</strong> (and FEN1 in eukaryotes) removes the RNA primers; DNA polymerase fills in the gaps with DNA; <strong>DNA ligase</strong> joins the fragments by catalyzing a phosphodiester bond between the 3' hydroxyl and 5' phosphate.",
  render({ ctx, w, h, t }) {
    drawHeader(ctx, w, h);
    const op = ease(t);
    const y = h / 2;
    const startX = 60;
    const endX = w - 60;

    drawStrandLine(ctx, startX, y - 25, endX, y - 25, C.strand2, 3);

    // Continuous new strand (ligated)
    ctx.save();
    ctx.strokeStyle = C.newStrand;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX + 10, y + 10);
    ctx.lineTo(endX - 10, y + 10);
    ctx.stroke();
    ctx.restore();

    // Ligase pulsing over junction points
    ctx.save();
    ctx.globalAlpha = op;
    const junctions = [0.28, 0.55, 0.82];
    for (let i = 0; i < junctions.length; i++) {
      const jx = lerp(startX + 10, endX - 10, junctions[i]);
      drawEnzyme(ctx, jx, y + 10, 28, 24, i === 1 ? "Ligase" : "", C.ligase, { labelBelow: true, pulse: (t * 2 + i * 0.3) % 1 });
    }
    ctx.restore();
  },
};

const step8: Step = {
  title: "two identical helices (semi-conservative)",
  caption:
    "Replication is <strong>semi-conservative</strong>: each daughter helix has one original strand (parental) and one newly synthesized strand. Meselson and Stahl proved this in 1958.",
  render({ ctx, w, h, t }) {
    drawHeader(ctx, w, h);
    const op = ease(t);
    const leftX = 60;
    const rightX = w / 2 + 30;
    const dnaW = w / 2 - 90;

    ctx.save();
    ctx.globalAlpha = op;
    drawLadderDna(ctx, {
      x: leftX,
      y: h / 2,
      length: dnaW,
      separation: 44,
      bases1: DNA1,
      bases2: DNA2,
      strand1Color: C.strand1,
      strand2Color: C.newStrand,
    });

    drawLadderDna(ctx, {
      x: rightX,
      y: h / 2,
      length: dnaW,
      separation: 44,
      bases1: DNA1,
      bases2: DNA2,
      strand1Color: C.newStrand,
      strand2Color: C.strand2,
    });
    ctx.restore();

    ctx.save();
    ctx.fillStyle = C.label;
    ctx.font = "500 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("daughter helix 1", leftX + dnaW / 2, h / 2 + 80);
    ctx.fillText("daughter helix 2", rightX + dnaW / 2, h / 2 + 80);
    ctx.restore();

    // Legend
    ctx.save();
    ctx.fillStyle = C.labelDim;
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("teal = parental strand", 60, h - 40);
    ctx.fillText("green = newly synthesized strand", 60, h - 22);
    ctx.restore();

    void roundRect;
    void drawBaseLabel;
  },
};

export const REPLICATION_STEPS: Step[] = [step1, step2, step3, step4, step5, step6, step7, step8];
