// NCBI Translation Table 1 (the standard genetic code).
// Source: https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi?mode=c
// 61 sense codons + 3 stop codons = 64.

export const GENETIC_CODE: Record<string, string> = {
  UUU: "F", UUC: "F",
  UUA: "L", UUG: "L", CUU: "L", CUC: "L", CUA: "L", CUG: "L",
  AUU: "I", AUC: "I", AUA: "I",
  AUG: "M",
  GUU: "V", GUC: "V", GUA: "V", GUG: "V",
  UCU: "S", UCC: "S", UCA: "S", UCG: "S", AGU: "S", AGC: "S",
  CCU: "P", CCC: "P", CCA: "P", CCG: "P",
  ACU: "T", ACC: "T", ACA: "T", ACG: "T",
  GCU: "A", GCC: "A", GCA: "A", GCG: "A",
  UAU: "Y", UAC: "Y",
  UAA: "*", UAG: "*", UGA: "*",
  CAU: "H", CAC: "H",
  CAA: "Q", CAG: "Q",
  AAU: "N", AAC: "N",
  AAA: "K", AAG: "K",
  GAU: "D", GAC: "D",
  GAA: "E", GAG: "E",
  UGU: "C", UGC: "C",
  UGG: "W",
  CGU: "R", CGC: "R", CGA: "R", CGG: "R", AGA: "R", AGG: "R",
  GGU: "G", GGC: "G", GGA: "G", GGG: "G",
};

export const AMINO_ACID_NAMES: Record<string, string> = {
  A: "Alanine (Ala)",
  R: "Arginine (Arg)",
  N: "Asparagine (Asn)",
  D: "Aspartate (Asp)",
  C: "Cysteine (Cys)",
  Q: "Glutamine (Gln)",
  E: "Glutamate (Glu)",
  G: "Glycine (Gly)",
  H: "Histidine (His)",
  I: "Isoleucine (Ile)",
  L: "Leucine (Leu)",
  K: "Lysine (Lys)",
  M: "Methionine (Met)",
  F: "Phenylalanine (Phe)",
  P: "Proline (Pro)",
  S: "Serine (Ser)",
  T: "Threonine (Thr)",
  W: "Tryptophan (Trp)",
  Y: "Tyrosine (Tyr)",
  V: "Valine (Val)",
  "*": "Stop",
};

export function translate(rna: string): string {
  const codons: string[] = [];
  for (let i = 0; i + 3 <= rna.length; i += 3) {
    const c = rna.substring(i, i + 3);
    codons.push(GENETIC_CODE[c] ?? "?");
  }
  return codons.join("");
}

export function anticodon(codon: string): string {
  // Antiparallel pairing; codon 5'→3', anticodon 3'→5'.
  // Returned in 3'→5' order so it visually reads matching the codon.
  const map: Record<string, string> = { A: "U", U: "A", G: "C", C: "G" };
  return codon
    .split("")
    .map((b) => map[b] ?? b)
    .join("");
}
