import { level, universe } from "../@types";
import { sendArtNetPacket } from "./art-net";
import { enableFixtures } from "./fixtures";

const artNetIp: string = "100.73.74.135";
const artNetPort: number = 6454;
let bpmInterval;
let level: level = "low";

export function resetDMX(universe: universe[]): void {
  universe.map((u) => {
    sendArtNetPacket(artNetIp, artNetPort, u, new Uint8Array(512)); // 空のデータを送信
  });
}

//bpmの間隔で繰り返し
export function setupInterval(bpm: number, colorType: string) {
  const interval = (60 / bpm) * 1000;

  bpmInterval = setInterval(function () {
    switch (level) {
      case "low":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          enableFixtures(["spotlight", "staticPatch"])
        );
        break;

      case "mid":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          enableFixtures([
            "spotlight_tilt",
            "staticPatch",
            "strobePatch",
            "LEDWash",
          ])
        );
        break;

      case "big":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          enableFixtures([
            "spotlight_tilt",
            "staticPatch",
            "strobePatch",
            "LEDWash",
          ])
        );
        sendArtNetPacket(artNetIp, artNetPort, 2, enableFixtures(["pyro"]));
        break;

      case "big_chorus":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          enableFixtures([
            "spotlight_tilt",
            "staticPatch",
            "strobePatch",
            "LEDWash",
          ])
        );
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          2,
          enableFixtures(["laser", "pyro", "fireworks"])
        );
        break;

      default:
        break;
    }
  }, interval);
}

export function setLevel(l: string) {
  switch (l) {
    case "low":
      resetDMX([2]);
      level = "low";
      break;

    case "mid":
      resetDMX([2]);
      level = "mid";

      break;

    case "big":
      level = "big";

      break;

    case "big_chorus":
      resetDMX([2]);
      level = "big_chorus";

      break;

    default:
      break;
  }
}
