import * as VLC from "vlc-client";
import { detectMusicSection } from "./utils/dmx/detectMusicSection";
import { timeToSeconds } from "./utils/utils";
import { DMXController } from "./utils/dmx/dmxControl";

const vlc = new VLC.Client({
  ip: "100.73.74.135",
  port: 8080,
  password: process.env.VLC_PASSWORD!,
});

const artNetIp: string = "100.73.74.135";
const artNetPort: number = 6454;

const controller = new DMXController(artNetIp, artNetPort);

const lightingData = await detectMusicSection(
  "./python/music/yumeiro_parade.wav",
  "0.83", //0.83 ~ 0.91 あたりまでが丁度いい
  "0.73"
);
console.log(lightingData);

async function main() {
  controller.resetDMX([1, 2]);
  const bpmInterval = controller.setupBPMInterval(lightingData);

  let currentTime = 0;

  await vlc.play();
  await vlc.setTime(0);

  const interval = setInterval(async () => {
    currentTime = await vlc.getTime();

    controller.updateLevel(currentTime, lightingData);

    const lastSection = lightingData.sections[lightingData.sections.length - 1];
    if (currentTime >= timeToSeconds(lastSection.end)) {
      clearInterval(interval);
      clearInterval(bpmInterval);
      controller.resetDMX([1, 2]);
      console.log("Lighting sequence completed");
    }
  }, 500);
}

setTimeout(() => {
  main();
}, 3000);
