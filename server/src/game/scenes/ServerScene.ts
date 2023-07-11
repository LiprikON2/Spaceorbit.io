import { BaseScene } from "@spaceorbit/client/src/game/scripts/scenes/core/BaseScene";
import { getIsoTime } from "~/server/utils";
import type { GameServer } from "~/server/game/GameServer";
import { ServerChannel } from "@geckos.io/server";
import type { SpaceshipServerOptions } from "@spaceorbit/client/src/game/scripts/objects/ship/spaceship";

export class ServerScene extends BaseScene {
    declare game: GameServer;
    playerOptionsList: SpaceshipServerOptions[] = [];
    pendingPlayersState: object = {};
    elapsedSinceUpdate = 0;
    tickrate = 30;
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super("ServerScene");
    }
    get tickrateDeltaTime() {
        return 1000 / this.tickrate;
    }

    preload() {}

    create() {
        this.game.server.onConnection((channel) => {
            console.log("Channel connected", channel.id);
            channel.emit("connection:established");

            this.listenForPlayerOptionsRequest(channel);
            this.listenForOtherPlayersOptionsRequest(channel);

            this.listenForPlayerState(channel);
            this.listenForMessages(channel);
        });
    }

    listenForPlayerOptionsRequest(channel: ServerChannel) {
        channel.on("player:request-options", () => {
            console.log("player:request-options");

            const serverOptions = this.getPlayerServerOptions(channel.id);
            this.playerOptionsList.push(serverOptions);
            channel.emit("player:request-options", serverOptions, { reliable: true });
            channel.broadcast.emit("player:connected", serverOptions, { reliable: true });
        });
    }

    listenForOtherPlayersOptionsRequest(channel: ServerChannel) {
        channel.on("players:already-connected", () => {
            console.log("players:already-connected");

            const otherPlayers = this.playerOptionsList.filter(
                (playerOptions) => playerOptions.id !== channel.id
            );
            channel.emit("players:already-connected", otherPlayers, { reliable: true });
        });
    }

    listenForMessages(channel: ServerChannel) {
        channel.on("message", (data) => {
            console.log("Message:", data);
            channel.broadcast.emit("message", data, { reliable: true });
        });
        channel.emit(
            "message",
            { name: "Server", message: "Welcome!", isoTime: getIsoTime() },
            { reliable: true }
        );
    }
    listenForPlayerState(channel: ServerChannel) {
        channel.on("player:state", (state) => {
            // console.log("player:state");
            this.pendingPlayersState[channel.id!] = state as object;
        });
    }

    update(time: number, delta: number) {
        this.elapsedSinceUpdate += delta;
        if (this.elapsedSinceUpdate > this.tickrateDeltaTime) {
            this.sendPlayersState();
            this.elapsedSinceUpdate = 0;
        }
    }

    sendPlayersState() {
        if (Object.keys(this.pendingPlayersState).length) {
            this.game.server.emit("players:pending-state", this.pendingPlayersState);
            this.pendingPlayersState = {};
        }
    }
}

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
