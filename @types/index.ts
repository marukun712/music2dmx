export type universe = 1 | 2;

export type level = "low" | "mid" | "big" | "big_chorus";

interface Section {
  start: string;
  end: string;
  level: level;
}

export interface LightingData {
  bpm: number;
  sections: Section[];
}

export type Channel = {
  number: number;
  value: number;
};

interface Fixtures {
  universe: number;
  baseChannels: number[];
  channels: {
    [key: string]: number | string; // 数値または文字列のキー値ペア
  };
}

interface LevelSettings {
  enableFixtures: string[];
  fixtureSettings: {
    [key: string]: {
      [key: string]: number | string; // 数値または文字列のキー値ペア
    };
  };
}

export interface Config {
  fixtures: {
    [key: string]: Fixtures;
  };
  levels: {
    [key: string]: LevelSettings;
  };
  colorPalettes: number[][];
  randomRange: number[];
}
