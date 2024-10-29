import { DMXController } from "./utils/dmx/dmxControl";
import { Hono } from "hono";
import { LightingData } from "./@types";

const artNetIp: string = "100.73.74.135";
const artNetPort: number = 6454;

const controller = new DMXController(artNetIp, artNetPort);

let currentTime = 0;
let lightingData: LightingData;

const app = new Hono();
app.get("/", (c) => c.text("Hello Hono"));

app.post("/start", async (c) => {
  lightingData = await c.req.json();
  currentTime = 0;

  controller.resetDMX([1, 2]);

  console.log(lightingData);

  controller.setupBPMInterval(lightingData);

  return c.json({
    message: "The sequence has started.",
  });
});

app.post("/setTime", async (c) => {
  const json = await c.req.json();
  currentTime = Number(json.time);
  controller.updateLevel(currentTime, lightingData);

  console.log(currentTime);
  return c.json({
    message: currentTime,
  });
});

export default app;
