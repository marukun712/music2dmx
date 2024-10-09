import { level, universe, LightingData } from "../../@types";
import { sendArtNetPacket } from "./ArtNet";
import { createDMXData } from "./fixtures";
import { timeToSeconds } from "../utils";

export class DMXController {
  private level: level = "low";
  private artNetIp: string;
  private artNetPort: number;

  constructor(artNetIp: string, artNetPort: number) {
    this.artNetIp = artNetIp;
    this.artNetPort = artNetPort;
  }

  // DMXのリセットを行う関数
  public resetDMX(universes: universe[]): void {
    universes.map((u) => {
      sendArtNetPacket(this.artNetIp, this.artNetPort, u, new Uint8Array(512)); // 空のデータを送信
    });
  }

  // BPMの間隔でDMXデータを送信する関数
  public setupBPMInterval(lightingData: LightingData) {
    const interval = (60 / lightingData.bpm) * 1000;
    let i = 0;

    return setInterval(() => {
      switch (this.level) {
        case "low":
          sendArtNetPacket(
            this.artNetIp,
            this.artNetPort,
            1,
            createDMXData(i, this.level, 1)
          );
          break;

        case "mid":
          sendArtNetPacket(
            this.artNetIp,
            this.artNetPort,
            1,
            createDMXData(i, this.level, 1)
          );
          break;

        case "big":
          sendArtNetPacket(
            this.artNetIp,
            this.artNetPort,
            1,
            createDMXData(i, this.level, 1)
          );

          sendArtNetPacket(
            this.artNetIp,
            this.artNetPort,
            2,
            createDMXData(i, this.level, 2)
          );
          break;

        case "big_chorus":
          sendArtNetPacket(
            this.artNetIp,
            this.artNetPort,
            1,
            createDMXData(i, this.level, 1)
          );

          sendArtNetPacket(
            this.artNetIp,
            this.artNetPort,
            2,
            createDMXData(i, this.level, 2)
          );
          break;

        default:
          break;
      }
      i++;
    }, interval / 2);
  }

  // 現在の時間に応じてレベルを更新する関数
  public updateLevel(currentTime: number, lightingData: LightingData): void {
    if (lightingData) {
      const currentSection = lightingData.sections.find(
        (section) =>
          timeToSeconds(section.start) <= currentTime &&
          timeToSeconds(section.end) > currentTime
      );

      if (currentSection && currentSection.level !== this.level) {
        this.resetDMX([2]);

        this.level = currentSection.level;
        console.log(this.level);
      }
    }
  }
}
