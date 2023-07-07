import "@geckos.io/phaser-on-nodejs";
import Phaser from "phaser";

// import { BaseScene } from "@spaceorbit/client/src/game/scripts/scenes/core";
import { getIsoTime } from "~/server/utils";

export class ServerScene {}
// export class ServerScene extends BaseScene {
//     constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
//         // super(config);
//         super("ServerScene");
//     }

//     preload() {}

//     create() {
//         this.listenForMessages();
//     }

//     update(time: number, delta: number) {}

//     listenForMessages() {
//         // @ts-ignore
//         this.game.server.onConnection((channel) => {
//             console.log("Channel connected");
//             channel.on("message", (data) => {
//                 console.log("Message:", data);
//                 channel.broadcast.emit("message", data, { reliable: true });
//             });
//             channel.emit("ready");
//             channel.emit(
//                 "message",
//                 { nick: "Server", message: "Welcome!", isoTime: getIsoTime() },
//                 { reliable: true }
//             );
//         });
//     }
// }

export const test = function () {
    return "yes";
};

export const test2 = "yes";
console.log("ServerScene", ServerScene, test, test2);

//     tick;
//     players;
//     constructor(config) {
//         super(config);
//         this.tick = 0;
//         this.players = new Map();
//     }

//     create() {
//         this.physics.world.setBounds(0, 0, 1280, 720);

//         io.on("connection", (socket) => {
//             const x = Math.random() * 1200 + 40;
//             const dude = new Dude(this, x, 200);

//             this.players.set(socket.id, {
//                 socket,
//                 dude,
//             });

//             socket.on("movement", (movement) => {
//                 const { left, right, up, down } = movement;
//                 const speed = 160;
//                 const jump = 330;

//                 if (left) dude.setVelocityX(-speed);
//                 else if (right) dude.setVelocityX(speed);
//                 else dude.setVelocityX(0);

//                 if (up)
//                     if (dude.body.touching.down || dude.body.onFloor()) dude.setVelocityY(-jump);
//             });

//             socket.on("disconnect", (reason) => {
//                 const player = this.players.get(socket.id);
//                 player.dude.destroy();
//                 this.players.delete(socket.id);
//             });
//         });
//     }

//     update() {
//         this.tick++;

//         // only send the update to the client at 30 FPS (save bandwidth)
//         if (this.tick % 2 !== 0) return;

//         // get an array of all dudes
//         const dudes = [];
//         this.players.forEach((player) => {
//             const { socket, dude } = player;
//             dudes.push({ id: socket.id, x: dude.x, y: dude.y });
//         });

//         const snapshot = SI.snapshot.create(dudes);

//         // send all dudes to all players
//         this.players.forEach((player) => {
//             const { socket } = player;
//             socket.emit("snapshot", snapshot);
//         });
//     }
// }
