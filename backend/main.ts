import { DMXController } from "./utils/dmx/dmxController";
import { fastify } from "fastify";
import fastifyCors from "@fastify/cors";
import { LightingData } from "./@types";

const artNetIp = Bun.env.ARTNET_IP;
const artNetPort = Number(Bun.env.ARTNET_PORT);

const controller = new DMXController(artNetIp, artNetPort);

let currentTime = 0;
let lightingData: LightingData;
let bpmInterval;
const server = fastify();

await server.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
});

server.get("/", async (_request, reply) => {
  return reply.send("Hello Fastify");
});

server.post("/start/", async (request, reply) => {
  console.log(artNetIp, artNetPort);
  bpmInterval ? clearInterval(bpmInterval) : "";

  try {
    lightingData = request.body as LightingData;
    console.log(lightingData);

    currentTime = 0;

    controller.resetDMX([1, 2]);
    bpmInterval = controller.setupBPMInterval(lightingData);

    return reply.send({
      message: "The sequence has started.",
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      error: "Failed to start sequence",
    });
  }
});

server.post("/setTime/", async (request, reply) => {
  try {
    const { time } = request.body as { time: number };
    currentTime = Number(time);
    controller.updateLevel(currentTime, lightingData);

    return reply.send({
      message: currentTime,
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      error: "Failed to set time",
    });
  }
});

server.get("/end/", async (_request, reply) => {
  bpmInterval ? clearInterval(bpmInterval) : "";

  controller.resetDMX([1, 2]);

  return reply.send({
    message: "The sequence has completed.",
  });
});

server.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
  }
  console.log(address);
});
