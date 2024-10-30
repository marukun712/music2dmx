export type level = "low" | "mid" | "high" | "big_chorus";

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
    [key: string]: number | string;
  };
}

interface LevelSettings {
  enableFixtures: string[];
  fixtureSettings: {
    [key: string]: {
      [key: string]: number | string;
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
