type Channel = {
  number: number;
  value: number;
};
type Fixture = "spotlight" | "staticPatch";

export function addFixtures(fixtures: Fixture[]) {
  let data = new Uint8Array(512);

  fixtures.forEach((fixture) => {
    const channels = getFixtureChannels(fixture);
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

function getFixtureChannels(fixture: Fixture): Channel[] {
  switch (fixture) {
    case "spotlight":
      return [
        { number: 13, value: 255 },
        { number: 14, value: 255 },
        { number: 20, value: 128 },
        { number: 22, value: 255 },
        { number: 24, value: 255 },
        { number: 25, value: 255 },
        { number: 31, value: 128 },
        { number: 33, value: 255 },
        { number: 35, value: 255 },
        { number: 36, value: 255 },
        { number: 42, value: 128 },
        { number: 44, value: 255 },
        { number: 46, value: 255 },
        { number: 47, value: 255 },
        { number: 53, value: 128 },
        { number: 55, value: 255 },
      ];
    case "staticPatch":
      const tmp: Channel[] = [];

      for (let i = 206; i < 245; i++) {
        tmp.push({ number: i, value: 255 });
      }
      return tmp;
    default:
      return [];
  }
}
