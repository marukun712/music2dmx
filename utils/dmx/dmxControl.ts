import { level, universe, LightingData } from "../../@types";
import { sendArtNetPacket } from "./ArtNet";
import { createDMXData } from "./fixtures";

const artNetIp: string = "100.73.74.135";
const artNetPort: number = 6454;

let level: level = "low";

export function timeToSeconds(timeString: string): number {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

export function resetDMX(universe: universe[]): void {
  universe.map((u) => {
    sendArtNetPacket(artNetIp, artNetPort, u, new Uint8Array(512)); // 空のデータを送信
  });
}

//bpmの間隔で繰り返し
export function setupBPMInterval(lightingData: LightingData) {
  const interval = (60 / lightingData.bpm) * 1000;

  let i = 0;

  return setInterval(function () {
    switch (level) {
      case "low":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          createDMXData(["spotlight", "staticPatch", "strobePatch"], i, level)
        );
        break;

      case "mid":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          createDMXData(
            ["spotlight", "staticPatch", "strobePatch", "LEDWash"],
            i,
            level
          )
        );
        break;

      case "big":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          createDMXData(
            ["spotlight", "staticPatch", "strobePatch", "LEDWash"],
            i,
            level
          )
        );
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          2,
          createDMXData(["pyro"], i, level)
        );
        break;

      case "big_chorus":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          createDMXData(
            ["spotlight", "staticPatch", "strobePatch", "LEDWash"],
            i,
            level
          )
        );
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          2,
          createDMXData(["laser", "pyro", "fireworks"], i, level)
        );
        break;

      default:
        break;
    }
    i++;
  }, interval / 2);
}

export function updateLevel(
  currentTime: number,
  lightingData: LightingData
): void {
  if (lightingData) {
    const currentSection = lightingData.sections.find(
      (section) =>
        timeToSeconds(section.start) <= currentTime &&
        timeToSeconds(section.end) > currentTime
    );

    if (currentSection && currentSection.level !== level) {
      resetDMX([2]);

      level = currentSection.level;
      console.log(level);
    }
  }
}
