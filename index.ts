import { sendArtNetPacket } from "./art-net";
import fs from "fs";
import { addFixtures } from "./lighting";
import { MpcControl } from "mpc-hc-control";

const mpcApi = new MpcControl("100.73.74.135", 13579);

const artNetIp: string = "100.73.74.135";
const artNetPort: number = 6454;

type universe = 1 | 2;

type level = "low" | "mid" | "big" | "big_chorus";

interface Section {
  start: string;
  end: string;
  level: level;
}

interface LightingData {
  bpm: number;
  sections: Section[];
}

let lastLevel: level;

function timeToSeconds(timeString: string): number {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

// JSONデータの読み込みと型定義
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
          addFixtures(["spotlight", "staticPatch"])
        );
        break;

      case "mid":
        resetDMX([2]);

        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          addFixtures(["spotlight_tilt", "staticPatch", "strobePatch"])
        );
        break;

      case "big":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          addFixtures(["spotlight_tilt", "staticPatch", "strobePatch"])
        );
        sendArtNetPacket(artNetIp, artNetPort, 2, addFixtures(["pyro"]));
        break;

      case "big_chorus":
        resetDMX([2]);

        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          addFixtures(["spotlight_tilt", "staticPatch", "strobePatch"])
        );
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          2,
          addFixtures(["laser", "pyro", "fireworks"])
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
  await mpcApi.play();
  await mpcApi.seek(0);

  const interval = setInterval(() => {
    updateLighting(currentTime);
    currentTime += 0.1;

    console.log(`Current time: ${currentTime} seconds`);

    // 最後のセクション終了時の処理
    const lastSection = lightingData.sections[lightingData.sections.length - 1];
    if (currentTime > timeToSeconds(lastSection.end)) {
      clearInterval(interval);
      resetDMX([1, 2]);
      console.log("Lighting sequence completed");
    }
  }, 100); // 1ミリ秒ごとに更新
}

setTimeout(() => {
  startLightingControl();
}, 10000);
