import { Channel, universe } from "../../@types";
import { getRandomValue } from "../utils";
import { Config } from "../../@types";

// JSONファイルから設定を読み込み
const channelConfig: Config = await Bun.file("./config.json").json();

function getBPMSyncValue(
  i: number,
  speed: "normal" | "slow",
  fixture: string
): number {
  if (fixture == "strobePatch") {
    return i % 2 === 0 ? 100 : 255;
  }

  if (speed == "normal") {
    return i % 2 === 0 ? 0 : 255;
  } else if (speed == "slow") {
    return i % 4 === 0 ? 0 : 255;
  }

  return 0;
}

function getPulseValue(baseValue: number): number {
  const pulseIntensity = getRandomValue(0, 50);
  return Math.max(0, Math.min(255, baseValue + pulseIntensity));
}

function getRandomColor() {
  const palette =
    channelConfig.colorPalettes[
      Math.floor(Math.random() * channelConfig.colorPalettes.length)
    ];
  return {
    r: palette[0],
    g: palette[1],
    b: palette[2],
  };
}

//点灯するチャンネルのobjectからデータから配列に値をset
function setChannelValue(channels: Channel[], data: Uint8Array): Uint8Array {
  channels.forEach((channel) => {
    data[channel.number - 1] = channel.value;
  });
  return data;
}

export function createDMXData(
  i: number,
  level: string,
  universe: universe
): Uint8Array {
  let data = new Uint8Array(512);

  const levelConfig = channelConfig.levels[level];
  if (!levelConfig) return data;
  levelConfig.enableFixtures.map((fixture) => {
    const fixtureConf = channelConfig.fixtures[fixture];
    const settings = levelConfig.fixtureSettings[fixture];

    if (fixtureConf.universe === universe) {
      const list = createChannelList(fixture, fixtureConf, settings, i);

      data = setChannelValue(list, data);
    }
  });

  return data;
}

function createChannelList(
  fixture: string,
  fixtureConf,
  settings,
  i: number
): Channel[] {
  const list: Channel[] = [];
  for (const [chName, cfOffset] of Object.entries(fixtureConf.channels)) {
    const color = getRandomColor();

    fixtureConf.baseChannels.map((ch) => {
      if (Object.hasOwn(settings, chName)) {
        let value = 0;

        switch (settings[chName]) {
          case "bpmSync":
            value = getBPMSyncValue(i, "normal", fixture);
            break;
          case "bpmSyncSlow":
            value = getBPMSyncValue(i, "slow", fixture);
            break;
          case "randomColor":
            switch (chName) {
              case "r":
                value = getPulseValue(color.r);
                break;
              case "g":
                value = getPulseValue(color.g);
                break;
              case "b":
                value = getPulseValue(color.b);
                break;
              default:
                break;
            }
            break;
          case "random":
            value = getRandomValue(
              channelConfig.randomRange[0],
              channelConfig.randomRange[1]
            );
            break;
          default:
            value = settings[chName];
            break;
        }

        list.push({
          number: ch + cfOffset - 1,
          value: value,
        });
      }
    });
  }

  return list;
}
