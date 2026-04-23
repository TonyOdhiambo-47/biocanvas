export const C = {
  bg: "#0a0a0a",
  strand1: "#00bcd4",
  strand2: "#e8e8e8",
  newStrand: "#a2f0a2",
  baseA: "#4caf50",
  baseT: "#8bc34a",
  baseG: "#2196f3",
  baseC: "#03a9f4",
  baseU: "#ff9800",
  helicase: "#ff9800",
  topo: "#e91e63",
  ssb: "#9c27b0",
  primase: "#ffeb3b",
  rnaPolII: "#9575cd",
  dnaPolLead: "#3f51b5",
  dnaPolLag: "#3949ab",
  ligase: "#26a69a",
  ribosomeS: "#b0a99f",
  ribosomeL: "#8b7f72",
  mRna: "#ff9800",
  tRNA: "#cddc39",
  aa: "#fff59d",
  label: "#bdbdbd",
  labelDim: "#808080",
  stop: "#f44336",
  start: "#66bb6a",
  text: "#f5f5f5",
} as const;

export function baseColor(b: string): string {
  switch (b) {
    case "A": return C.baseA;
    case "T": return C.baseT;
    case "G": return C.baseG;
    case "C": return C.baseC;
    case "U": return C.baseU;
    default: return C.label;
  }
}

export function complement(b: string, rna = false): string {
  if (rna && b === "A") return "U";
  switch (b) {
    case "A": return "T";
    case "T": return "A";
    case "U": return "A";
    case "G": return "C";
    case "C": return "G";
    default: return b;
  }
}
