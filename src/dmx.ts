import { level, universe } from "../@types";
import { sendArtNetPacket } from "./art-net";
import { createDMXData } from "./fixtures";

const artNetIp: string = "100.73.74.135";
const artNetPort: number = 6454;
let level: level = "low";

export function resetDMX(universe: universe[]): void {
  universe.map((u) => {
    sendArtNetPacket(artNetIp, artNetPort, u, new Uint8Array(512)); // 空のデータを送信
  });
}

//bpmの間隔で繰り返し
export function setupInterval(bpm: number) {
  const interval = (60 / bpm) * 1000;
  let i = 0;

  setInterval(function () {
    switch (level) {
      case "low":
        sendArtNetPacket(
          artNetIp,
          artNetPort,
          1,
          createDMXData(["spotlight", "staticPatch"], i, level)
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
