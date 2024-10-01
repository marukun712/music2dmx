import fs from "fs";
import { MpcControl } from "mpc-hc-control";
import { level, LightingData } from "./@types";
import { setLevel, resetDMX, setupInterval } from "./src/dmx";

const mpcApi = new MpcControl("100.73.74.135", 13579);

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
    setLevel(lastLevel);
  }
}

async function startLightingControl() {
  resetDMX([1, 2]);
  setupInterval(lightingData.bpm);

  let currentTime = 0;

  const interval = setInterval(async () => {
    currentTime = (await mpcApi.getPosition()).position / 1000;

    updateLighting(currentTime);

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
