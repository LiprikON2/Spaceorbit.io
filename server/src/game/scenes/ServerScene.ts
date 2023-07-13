import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";
import { ServerChannel } from "@geckos.io/server";

import { getIsoTime } from "~/server/utils";
import type { GameServer } from "~/server/game/GameServer";
import type { SpaceshipServerOptions } from "@spaceorbit/client/src/game/scripts/objects/ship/spaceship";
import { BaseMapScene } from "@spaceorbit/client/src/game/scripts/scenes/maps/BaseMapScene";

export class ServerScene extends BaseMapScene {
    declare game: GameServer;
    si = new SnapshotInterpolation();

    playerOptionsList: SpaceshipServerOptions[] = [];
    pendingPlayersState: object = {};
    elapsedSinceUpdate = 0;
    tickrate = 30;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    get tickrateDeltaTime() {
        return 1000 / this.tickrate;
    }

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
            // console.log("player:state", state);
            this.pendingPlayersState[channel.id!] = state as object;
        });
    }

    update(time: number, delta: number) {
        this.elapsedSinceUpdate += delta;
        if (this.elapsedSinceUpdate > this.tickrateDeltaTime) {
            // this.sendPlayersState();
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
