import * as VLC from "vlc-client";
import {
  resetDMX,
  setupBPMInterval,
  updateLevel,
} from "./utils/dmx/dmxControl";
import { detectMusicSection } from "./utils/dmx/detectMusicSection";
import { timeToSeconds } from "./utils/dmx/dmxControl";

const vlc = new VLC.Client({
  ip: "100.73.74.135",
  port: 8080,
  password: process.env.VLC_PASSWORD!,
});

const lightingData = await detectMusicSection(
  "./python/music/snow_halation.wav",
  "0.88", //0.915 0.83 うまくいった値
  "0.73"
);

async function main() {
  resetDMX([1, 2]);
  const bpmInterval = setupBPMInterval(lightingData);

  let currentTime = 0;

  const interval = setInterval(async () => {
    currentTime = await vlc.getTime();

    updateLevel(currentTime, lightingData);

    const lastSection = lightingData.sections[lightingData.sections.length - 1];
    if (currentTime >= timeToSeconds(lastSection.end)) {
      clearInterval(interval);
      clearInterval(bpmInterval);
      resetDMX([1, 2]);
      console.log("Lighting sequence completed");
    }
  }, 500);

  await vlc.play();
  await vlc.setTime(0);
}

setTimeout(() => {
  main();
}, 3000);
