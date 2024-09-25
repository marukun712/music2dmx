import { sendArtNetPacket } from "./art-net";
import fs from "fs";

const artNetIp = "100.73.74.135";
const artNetPort = 6454;

function timeToSeconds(timeString) {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

const lightingData = JSON.parse(
  fs.readFileSync("./python/music_sections.json", "utf8")
);

function lowDMX() {
  const data = new Uint8Array(512);

  data[13 - 1] = 255;
  data[14 - 1] = 255;
  data[20 - 1] = 128;
  data[22 - 1] = 255;

  data[24 - 1] = 255;
  data[25 - 1] = 255;
  data[31 - 1] = 128;
  data[33 - 1] = 255;

  data[35 - 1] = 255;
  data[36 - 1] = 255;
  data[42 - 1] = 128;
  data[44 - 1] = 255;

  data[46 - 1] = 255;
  data[47 - 1] = 255;
  data[53 - 1] = 128;
  data[55 - 1] = 255;

  sendArtNetPacket(artNetIp, artNetPort, 1, data);
}

function updateLighting(currentTime) {
  //現在の再生位置に合うセクションを探す
  const currentSection = lightingData.find(
    (section) =>
      timeToSeconds(section.start) <= currentTime &&
      timeToSeconds(section.end) > currentTime
  );

  if (currentSection) {
    switch (currentSection.level) {
      case "low":
        lowDMX();
      case "mid":
        sendArtNetPacket(artNetIp, artNetPort, 2, new Uint8Array(512));
      case "big":
        sendArtNetPacket(artNetIp, artNetPort, 2, new Uint8Array(512));
      case "big_chorus":
        sendArtNetPacket(artNetIp, artNetPort, 2, new Uint8Array(512));
      default:
        return 0;
    }
  }
}

function ResetDMX() {
  sendArtNetPacket(artNetIp, artNetPort, 1, new Uint8Array(512)); //空のデータを送信する
  sendArtNetPacket(artNetIp, artNetPort, 2, new Uint8Array(512));
}

function startLightingControl() {
  ResetDMX();

  let currentTime = 0;

  const interval = setInterval(() => {
    updateLighting(currentTime);
    currentTime += 1;

    console.log(currentTime);

    // 再生終了時の処理
    if (
      currentTime > timeToSeconds(lightingData[lightingData.length - 1].end)
    ) {
      clearInterval(interval);
      ResetDMX();

      console.log("Lighting sequence completed");
    }
  }, 1000);
}
