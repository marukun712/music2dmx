import * as dgram from "dgram";
import fs from "fs";

class ArtNetPacket {
  static ARTNET_ID = [0x41, 0x72, 0x74, 0x2d, 0x4e, 0x65, 0x74, 0x00];
  static OPCODE_OUTPUT = 0x5000;

  sequence = 0;
  universe = 0;
  data = new Uint8Array(512);

  constructor(universe) {
    this.universe = universe;
  }

  setChannel(channels) {
    channels.forEach(({ channel, value }) => {
      if (channel >= 1 && channel <= 512) {
        this.data[channel - 1] = value;
      }
    });
  }

  getPacket() {
    const buffer = Buffer.alloc(18 + 512);

    buffer.set(ArtNetPacket.ARTNET_ID, 0);
    buffer.writeUInt16LE(ArtNetPacket.OPCODE_OUTPUT, 8);
    buffer.writeUInt16BE(14, 10);
    buffer[12] = this.sequence++;
    if (this.sequence > 255) this.sequence = 1;
    buffer[13] = 0;
    buffer.writeUInt16LE(this.universe, 14);
    buffer.writeUInt16BE(512, 16);
    buffer.set(this.data, 18);

    return buffer;
  }
}

function sendArtNetPacket(ip, port, universe, channels) {
  const packet = new ArtNetPacket(universe);
  packet.setChannel(channels);

  const client = dgram.createSocket("udp4");

  client.send(packet.getPacket(), port, ip, (err) => {
    if (err) {
      console.error("Error sending packet:", err);
    }
    client.close();
  });
}

function timeToSeconds(timeString) {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

function getLightingLevel(level) {
  switch (level) {
    case "low":
      return 12;
    case "mid":
      return 64;
    case "big":
      return 128;
    case "big_chorus":
      return 255;
    default:
      return 0;
  }
}

const bpm = 129;

const artNetIp = "100.73.74.135";
const artNetPort = 6454;

const lightingData = JSON.parse(
  fs.readFileSync("./python/music_sections.json", "utf8")
);

function updateLighting(currentTime) {
  const currentSegment = lightingData.find(
    (segment) =>
      timeToSeconds(segment.start) <= currentTime &&
      timeToSeconds(segment.end) > currentTime
  );

  if (currentSegment) {
    const level = getLightingLevel(currentSegment.level);

    const channels = [
      { channel: 201, value: level },
      { channel: 203, value: level },
      { channel: 202, value: 255 },
      { channel: 204, value: 255 },
    ];

    console.log(channels);

    sendArtNetPacket(artNetIp, artNetPort, 2, channels);
  }
}

function startLightingControl() {
  let currentTime = 0;

  const interval = setInterval(() => {
    updateLighting(currentTime);
    currentTime += 1;

    console.log(currentTime);

    if (
      currentTime > timeToSeconds(lightingData[lightingData.length - 1].end)
    ) {
      clearInterval(interval);
      console.log("Lighting sequence completed");
    }
  }, 1000);
}

sendArtNetPacket(artNetIp, artNetPort, 2, [
  { channel: 201, value: 0 },
  { channel: 203, value: 0 },
  { channel: 202, value: 0 },
  { channel: 204, value: 0 },
]);

startLightingControl();
