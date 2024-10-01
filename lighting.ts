import { FixtureName, Channel, FixturesConfig } from "./@types";
import fs from "fs";

//JSONデータの読み込みと型定義
const channelConfig: FixturesConfig = JSON.parse(
  fs.readFileSync("./config.json", "utf8")
);

export function enableFixtures(fixtures: FixtureName[], colorType: string) {
  let data = new Uint8Array(512);

  fixtures.forEach((fixture) => {
    const channels = getFixtureChannels(fixture, colorType);
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

//Fixtureごとに有効化するチャンネルと値のobjectを返す
function getFixtureChannels(
  fixture: FixtureName,
  colorType: string
): Channel[] {
  switch (fixture) {
    case "spotlight":
    case "spotlight_tilt": {
      const channels: Channel[] = [];
      const config = channelConfig.spotlight;
      const tiltValue = fixture === "spotlight_tilt" ? 183 : 128;
      const color = colorType === "red" ? 10 : 120;

      if (config.baseChannels && config.channels) {
        config.baseChannels.forEach((baseChannel) => {
          channels.push({
            number: baseChannel + config.channels.color - 1,
            value: color,
          });
          channels.push({
            number: baseChannel + config.channels.dimmer - 1,
            value: 255,
          });
          channels.push({
            number: baseChannel + config.channels.shutter - 1,
            value: 255,
          });
          channels.push({
            number: baseChannel + config.channels.pan - 1,
            value: 128,
          });
          channels.push({
            number: baseChannel + config.channels.tilt - 1,
            value: tiltValue,
          });
          channels.push({
            number: baseChannel + config.channels.zoom - 1,
            value: 255,
          });
        });
      }

      return channels;
    }
    case "LEDWash": {
      const channels: Channel[] = [];
      const config = channelConfig.LEDWash;
      const { r, g, b }: { r: number; g: number; b: number } =
        colorType === "red" ? { r: 255, g: 0, b: 0 } : { r: 0, g: 0, b: 255 };

      if (config.baseChannels && config.channels) {
        config.baseChannels.forEach((baseChannel) => {
          channels.push({
            number: baseChannel + config.channels.r - 1,
            value: r,
          });
          channels.push({
            number: baseChannel + config.channels.g - 1,
            value: g,
          });
          channels.push({
            number: baseChannel + config.channels.b - 1,
            value: b,
          });
          channels.push({
            number: baseChannel + config.channels.pan - 1,
            value: 128,
          });
          channels.push({
            number: baseChannel + config.channels.tilt - 1,
            value: 128,
          });
          channels.push({
            number: baseChannel + config.channels.dimmer - 1,
            value: 255,
          });

          channels.push({
            number: baseChannel + config.channels.shutter - 1,
            value: 255,
          });
          channels.push({
            number: baseChannel + config.channels.zoom - 1,
            value: 255,
          });
        });
      }

      return channels;
    }

    case "staticPatch":
    case "strobePatch":
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
      } else if (config.baseChannels && config.channels) {
        config.baseChannels.forEach((baseChannel) => {
          Object.values(config.channels).forEach((offset, index) => {
            channels.push({ number: baseChannel + offset - 1, value: 255 });
          });
        });
      }

      return channels;
    }

    default:
      return [];
  }
}
