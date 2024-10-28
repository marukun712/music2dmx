import { detectMusicSection } from "./utils/dmx/detectMusicSection";
import { DMXController } from "./utils/dmx/dmxControl";
import { Elysia } from "elysia";
import { LightingData } from "./@types";

const artNetIp: string = "localhost";
const artNetPort: number = 6454;

const controller = new DMXController(artNetIp, artNetPort);

let currentTime = 0;
let lightingData: LightingData;

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

app.post("/start", async ({ body }) => {
  console.log(body);

  controller.resetDMX([1, 2]);
  lightingData = await detectMusicSection(
    "./python/music/yumeiro_parade.wav",
    "0.83", //0.83 ~ 0.91 あたりまでが丁度いい
    "0.73"
  );
  console.log(lightingData);

  controller.setupBPMInterval(lightingData);

  return {
    message: "The sequence has started.",
  };
});

app.post("/setTime", ({ body }) => {
  controller.updateLevel(currentTime, lightingData);

  return {
    message: currentTime,
  };
});

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
