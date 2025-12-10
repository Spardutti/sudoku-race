export type TimerEvent = {
  type: "start" | "pause" | "resume" | "complete";
  timestamp: string;
};
