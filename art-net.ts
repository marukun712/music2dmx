import * as dgram from "dgram";

//Art-Netのパケットを作成するクラス
class ArtNetPacket {
  static ARTNET_ID = [0x41, 0x72, 0x74, 0x2d, 0x4e, 0x65, 0x74, 0x00];
  static OPCODE_OUTPUT = 0x5000;

  sequence = 0;
  universe = 0;
  data = new Uint8Array(512);

  constructor(universe) {
    this.universe = universe;
  }

  setData(data: Uint8Array) {
    this.data = data;
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

export function sendArtNetPacket(
  ip: string,
  port: number,
  universe: number,
  data: Uint8Array
) {
  const packet = new ArtNetPacket(universe);
  packet.setData(data);

  const client = dgram.createSocket("udp4");

  client.send(packet.getPacket(), port, ip, (err) => {
    if (err) {
      console.error("Error sending packet:", err);
    }
    client.close();
  });
}
