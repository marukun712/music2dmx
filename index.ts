import { sendArtNetPacket } from "./art-net";
import fs from "fs";
import { enableFixtures } from "./lighting";
import { MpcControl } from "mpc-hc-control";
import { level, LightingData, universe } from "./@types";

const mpcApi = new MpcControl("100.73.74.135", 13579);

const artNetIp: string = "100.73.74.135";
const artNetPort: number = 6454;
const colorType = "blue";

let lastLevel: level;

function timeToSeconds(timeString: string): number {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

//JSONデータの読み込みと型定義
const lightingData: LightingData = JSON.parse(
  fs.readFileSync("./python/music_sections.json", "utf8")
);

function updateLighting(currentTime: number): void {
  const currentSection = lightingData.sections.find(
    (section) =>
      timeToSeconds(section.start) <= currentTime &&
      timeToSeconds(section.end) > currentTime
  );

  if (currentSection && currentSection.level !== lastLevel) {
    lastLevel = currentSection.level;
    switch (currentSection.level) {
      case "low":
        resetDMX([2]);

        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          enableFixtures(["spotlight", "staticPatch"], colorType)
        );
        break;

      case "mid":
        resetDMX([2]);

        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          enableFixtures(
            ["spotlight_tilt", "staticPatch", "strobePatch", "LEDWash"],
            colorType
          )
        );
        break;

      case "big":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          enableFixtures(
            ["spotlight_tilt", "staticPatch", "strobePatch", "LEDWash"],
            colorType
          )
        );
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          2,
          enableFixtures(["pyro"], colorType)
        );
        break;

      case "big_chorus":
        resetDMX([2]);

        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          enableFixtures(
            ["spotlight_tilt", "staticPatch", "strobePatch", "LEDWash"],
            colorType
          )
        );
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          2,
          enableFixtures(["laser", "pyro", "fireworks"], colorType)
        );
        break;

      default:
        break;
    }
  }
}

function resetDMX(universe: universe[]): void {
  universe.map((u) => {
    sendArtNetPacket(artNetIp, artNetPort, u, new Uint8Array(512)); // 空のデータを送信
  });
}

async function startLightingControl() {
  resetDMX([1, 2]);

  let currentTime = 0;

  const interval = setInterval(async () => {
    currentTime = (await mpcApi.getPosition()).position / 1000;

    updateLighting(currentTime);

    console.log(`Current time: ${currentTime} seconds`);

    //最後のセクション終了時の処理
    const lastSection = lightingData.sections[lightingData.sections.length - 1];
    if (currentTime > timeToSeconds(lastSection.end)) {
      clearInterval(interval);
      resetDMX([1, 2]);
      console.log("Lighting sequence completed");
    }
  }, 200);

  await mpcApi.play();
  await mpcApi.seek(0);
}

setTimeout(() => {
  startLightingControl();
}, 3000);
