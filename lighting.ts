type Channel = {
  number: number;
  value: number;
};
type Fixture =
  | "spotlight"
  | "spotlight_tilt"
  | "staticPatch"
  | "strobePatch"
  | "laser"
  | "pyro"
  | "fireworks";

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

/* TODO BPMと連動したshutter値の計算
// DMXのshutter値をBPMに基づいて計算する関数
function calculateShutterValueFromBPM(bpm: number): number {
  // BPMから1ビートあたりの秒数を計算
  const secondsPerBeat = 60 / bpm;

  // DMXの更新レート（一般的に1秒間に44回）
  const dmxUpdateRate = 44;

  // 1ビートあたりのDMXフレーム数を計算
  const framesPerBeat = secondsPerBeat * dmxUpdateRate;

  // shutterの範囲（1-255）にマッピング
  let shutterValue = Math.round((framesPerBeat / dmxUpdateRate) * 255);

  // 値を1-255の範囲に制限
  shutterValue = Math.max(1, Math.min(255, shutterValue));

  return shutterValue;
}
*/

//UE.5.1で一部の照明が、動作しなかったため一旦動作するもののみ動作させる
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
    case "spotlight_tilt":
      return [
        { number: 13, value: 255 },
        { number: 14, value: 255 },
        { number: 18, value: 128 },
        { number: 20, value: 183 },
        { number: 22, value: 200 },
        { number: 24, value: 255 },
        { number: 25, value: 255 },
        { number: 29, value: 128 },
        { number: 31, value: 183 },
        { number: 33, value: 200 },
        { number: 35, value: 255 },
        { number: 36, value: 255 },
        { number: 40, value: 128 },
        { number: 42, value: 183 },
        { number: 44, value: 200 },
        { number: 46, value: 255 },
        { number: 47, value: 255 },
        { number: 51, value: 128 },
        { number: 53, value: 183 },
        { number: 55, value: 200 },
      ];
    case "staticPatch":
      const static_patch: Channel[] = [];

      for (let i = 201; i <= 245; i++) {
        static_patch.push({ number: i, value: 255 });
      }
      return static_patch;
    case "strobePatch":
      const strobe_patch: Channel[] = [];

      for (let i = 301; i <= 312; i++) {
        strobe_patch.push({ number: i, value: 255 });
      }
      return strobe_patch;
    //ここからuniverse2
    case "laser":
      const laser: Channel[] = [];

      for (let i = 301; i <= 306; i++) {
        laser.push({ number: i, value: 255 });
      }
      return laser;
    case "pyro":
      const pyro: Channel[] = [];

      for (let i = 201; i <= 204; i++) {
        pyro.push({ number: i, value: 255 });
      }
      return pyro;
    case "fireworks":
      const fireworks: Channel[] = [];

      for (let i = 401; i <= 403; i++) {
        fireworks.push({ number: i, value: 255 });
      }
      return fireworks;
    default:
      return [];
  }
}
