import { FixturesConfig, FixtureName, Channel } from "../../@types";
import fs from "fs";

const colorPalettes = [
  [255, 0, 0], //Red
  [0, 255, 0], //Green
  [0, 0, 255], //Blue
  [255, 255, 0], //Yellow
  [255, 0, 255], //Magenta
  [0, 255, 255], //Cyan
];

//JSONデータの読み込みと型定義
const channelConfig: FixturesConfig = JSON.parse(
  fs.readFileSync("./config.json", "utf8")
);

function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomColor() {
  const palette =
    colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  return {
    r: palette[0],
    g: palette[1],
    b: palette[2],
  };
}

function getPulseValue(baseValue: number): number {
  const pulseIntensity = getRandomValue(0, 50);
  return Math.max(0, Math.min(255, baseValue + pulseIntensity));
}

function getRandomPanTiltValue(): { pan: number; tilt: number } {
  return {
    pan: getRandomValue(90, 160),
    tilt: getRandomValue(90, 180),
  };
}

//levelとfixtureNameからDMXのデータを作成する
export function createDMXData(
  fixtures: FixtureName[],
  i: number,
  level: string
) {
  let data = new Uint8Array(512);

  fixtures.forEach((fixture) => {
    const channels = getFixtureChannels(fixture, i, level);
    data = setChannelValue(channels, data);
  });

  return data;
}

function setChannelValue(channels: Channel[], data: Uint8Array): Uint8Array {
  channels.forEach((channel) => {
    data[channel.number - 1] = channel.value;
  });
  return data;
}

//levelから点灯するfixtureや値をセットする
function getFixtureChannels(fixture: FixtureName, i, level): Channel[] {
  switch (fixture) {
    case "spotlight": {
      const channels: Channel[] = [];
      const config = channelConfig.spotlight;

      //levelがlow以外の時、BPMに合わせて点滅させる
      const { dimmer, shutter } =
        i % 4 === 0 ? { dimmer: 0, shutter: 0 } : { dimmer: 255, shutter: 255 };

      //levelがlow以外の時、手前方向に傾ける
      const tiltValue =
        level === "mid" || level === "big" || level === "big_chorus"
          ? 183
          : 150;

      if (config.baseChannels && config.channels) {
        config.baseChannels.forEach((baseChannel) => {
          channels.push(
            {
              number: baseChannel + config.channels.color - 1,
              value: 0,
            },
            {
              number: baseChannel + config.channels.dimmer - 1,
              value: dimmer,
            },
            {
              number: baseChannel + config.channels.shutter - 1,
              value: shutter,
            },
            {
              number: baseChannel + config.channels.pan - 1,
              value: 128,
            },
            {
              number: baseChannel + config.channels.tilt - 1,
              value: tiltValue,
            },
            {
              number: baseChannel + config.channels.zoom - 1,
              value: 255,
            }
          );
        });
      }

      return channels;
    }

    case "LEDWash": {
      const channels: Channel[] = [];
      const config = channelConfig.LEDWash;
      const color = getRandomColor();
      const { pan, tilt } = getRandomPanTiltValue();

      if (config.baseChannels && config.channels) {
        config.baseChannels.forEach((baseChannel) => {
          channels.push(
            {
              number: baseChannel + config.channels.r - 1,
              value: getPulseValue(color.r),
            },
            {
              number: baseChannel + config.channels.g - 1,
              value: getPulseValue(color.g),
            },
            {
              number: baseChannel + config.channels.b - 1,
              value: getPulseValue(color.b),
            },
            { number: baseChannel + config.channels.pan - 1, value: pan },
            { number: baseChannel + config.channels.tilt - 1, value: tilt },
            { number: baseChannel + config.channels.dimmer - 1, value: 255 },
            { number: baseChannel + config.channels.shutter - 1, value: 255 },
            { number: baseChannel + config.channels.zoom - 1, value: 255 }
          );
        });
      }

      return channels;
    }

    case "staticPatch": {
      const channels: Channel[] = [];
      const config = channelConfig.staticPatch;
      const color =
        level === "low" ? { r: 255, g: 255, b: 255 } : getRandomColor();

      if (config.baseChannels && config.channels) {
        config.baseChannels.forEach((baseChannel) => {
          channels.push(
            {
              number: baseChannel + config.channels.r - 1,
              value: getPulseValue(color.r),
            },
            {
              number: baseChannel + config.channels.g - 1,
              value: getPulseValue(color.g),
            },
            {
              number: baseChannel + config.channels.b - 1,
              value: getPulseValue(color.b),
            },
            { number: baseChannel + config.channels.dimmer - 1, value: 255 },
            { number: baseChannel + config.channels.shutter - 1, value: 255 }
          );
        });
      }

      return channels;
    }

    case "strobePatch": {
      const channels: Channel[] = [];
      const config = channelConfig.strobePatch;

      //levelがbig以上の時、BPMに合わせて点滅させる
      const { dimmer, shutter } =
        i % 2 === 0 && (level === "big" || level === "big_chorus")
          ? { dimmer: 100, shutter: 255 }
          : level === "low"
          ? { dimmer: 200, shutter: 255 }
          : { dimmer: 255, shutter: 255 };

      if (config.baseChannels && config.channels) {
        config.baseChannels.forEach((baseChannel) => {
          channels.push(
            {
              number: baseChannel + config.channels.dimmer - 1,
              value: dimmer,
            },
            {
              number: baseChannel + config.channels.shutter - 1,
              value: shutter,
            }
          );
        });
      }

      return channels;
    }

    case "laser":
    case "pyro":
    case "fireworks": {
      const config = channelConfig[fixture];
      const channels: Channel[] = [];

      if (config.startChannel && config.channelCount) {
        for (
          let i = config.startChannel;
          i < config.startChannel + config.channelCount;
          i++
        ) {
          channels.push({ number: i, value: 255 });
        }
      }
      return channels;
    }

    default:
      return [];
  }
}
