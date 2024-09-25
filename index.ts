import { sendArtNetPacket } from "./art-net";
import fs from "fs";
import { addFixtures } from "./lighting";

const artNetIp: string = "100.73.74.135";
const artNetPort: number = 6454;

interface Section {
  start: string;
  end: string;
  level: "low" | "mid" | "big" | "big_chorus";
}

interface LightingData {
  bpm: number;
  sections: Section[];
}

function timeToSeconds(timeString: string): number {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

// JSONデータの読み込みと型定義
const lightingData: LightingData = JSON.parse(
  fs.readFileSync("./python/music_sections.json", "utf8")
);

console.log(lightingData);

function updateLighting(currentTime: number): void {
  const currentSection = lightingData.sections.find(
    (section) =>
      timeToSeconds(section.start) <= currentTime &&
      timeToSeconds(section.end) > currentTime
  );

  if (currentSection) {
    switch (currentSection.level) {
      case "low":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          addFixtures(["spotlight", "staticPatch"])
        );
        break;

      case "mid":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          addFixtures(["spotlight", "staticPatch", "strobePatch"])
        );
        break;

      case "big":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          addFixtures(["spotlight", "staticPatch", "strobePatch"])
        );
        sendArtNetPacket(artNetIp, artNetPort, 2, addFixtures(["laser"]));
        break;

      case "big_chorus":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          addFixtures(["spotlight", "staticPatch", "strobePatch"])
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

function resetDMX(): void {
  sendArtNetPacket(artNetIp, artNetPort, 1, new Uint8Array(512)); // 空のデータを送信
  sendArtNetPacket(artNetIp, artNetPort, 2, new Uint8Array(512));
}

function startLightingControl(): void {
  resetDMX();

  let currentTime = 0;

  const interval = setInterval(() => {
    updateLighting(currentTime);
    currentTime += 1;

    console.log(`Current time: ${currentTime} seconds`);

    // 最後のセクション終了時の処理
    const lastSection = lightingData.sections[lightingData.sections.length - 1];
    if (currentTime > timeToSeconds(lastSection.end)) {
      clearInterval(interval);
      resetDMX();
      console.log("Lighting sequence completed");
    }
  }, 1000); // 1秒ごとに更新
}

startLightingControl();
