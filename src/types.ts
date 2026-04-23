export interface StepCtx {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  t: number;
}

export interface Step {
  title: string;
  caption: string;
  render(sc: StepCtx): void;
}

export interface StoryModule {
  id: "replication" | "transcription" | "translation";
  steps: Step[];
}
