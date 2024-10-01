export type Channels = {
  [key: string]: number;
};

export type ChannelConfig = {
  baseChannels?: number[];
  startChannel?: number;
  channelCount?: number;
  channels: Channels;
};

export type FixtureName =
  | "spotlight"
  | "spotlight_tilt"
  | "LEDWash"
  | "staticPatch"
  | "strobePatch"
  | "laser"
  | "pyro"
  | "fireworks";

export type FixturesConfig = {
  spotlight: ChannelConfig;
  staticPatch: ChannelConfig;
  LEDWash: ChannelConfig;
  strobePatch: ChannelConfig;
  laser: ChannelConfig;
  pyro: ChannelConfig;
  fireworks: ChannelConfig;
};

export type universe = 1 | 2;

export type level = "low" | "mid" | "big" | "big_chorus";

export interface Section {
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
