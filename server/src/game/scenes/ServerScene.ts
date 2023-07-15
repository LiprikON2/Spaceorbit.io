import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";
import { ChannelId, ServerChannel } from "@geckos.io/server";

import { getIsoTime } from "~/server/utils";
import type { GameServer } from "~/server/game/GameServer";
import type {
    Spaceship,
    SpaceshipServerOptions,
} from "@spaceorbit/client/src/game/scripts/objects/ship/spaceship";
import { BaseMapScene } from "@spaceorbit/client/src/game/scripts/scenes/maps/BaseMapScene";
import BaseInputManager from "@spaceorbit/client/src/game/scripts/managers/BaseInputManager";

interface Players {
    [key: string]: {
        serverOptions: SpaceshipServerOptions;
        player: Spaceship;
        inputManager: BaseInputManager;
    };
}
export class ServerScene extends BaseMapScene {
    declare game: GameServer;
    si = new SnapshotInterpolation();

    players: Players = {};
    elapsedSinceUpdate = 0;
    tickrate = 30;

    get tickrateDeltaTime() {
        return 1000 / this.tickrate;
    }
    getPlayerById(playerId: ChannelId) {
        return this.players[playerId!];
    }

    getOtherPlayersOptions(playerId: ChannelId) {
        const otherPlayersEntries = Object.entries(this.players).filter(
            ([key]) => key !== playerId
        );
        const otherPlayersOptions = otherPlayersEntries.map(([key, { player, serverOptions }]) => {
            const { x, y, angle } = player.getClientState();
            return { ...serverOptions, x, y, angle };
        });
        return otherPlayersOptions;
    }

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    preload() {
        super.preload();
    }

    create() {
        super.create();

        this.game.server.onConnection((channel) => {
            console.log("Channel connected", channel.id);
            channel.emit("connection:established");
            channel.emit(
                "message",
                { name: "System", message: "Welcome, pilot!", isoTime: getIsoTime() },
                { reliable: true }
            );

            channel.on("player:request-options", () => this.sendPlayerOptions(channel));
            channel.on("players:already-connected", () => this.sendAlreadyConnected(channel));

            channel.on("player:actions", (actions) =>
                this.emulateActions(channel, actions as object)
            );
            channel.on("message", (message) => this.broadcastMessage(channel, message));
        });
    }

    addPlayer(serverOptions: SpaceshipServerOptions) {
        const player = this.createPlayer(serverOptions, {
            toPassTexture: false,
        });
        const inputManager = new BaseInputManager(this, player);

        this.players[serverOptions.id] = {
            player,
            serverOptions,
            inputManager,
        };
    }

    sendPlayerOptions(channel: ServerChannel) {
        console.log("player:request-options");

        const serverOptions = this.getPlayerServerOptions(channel.id);
        channel.emit("player:request-options", serverOptions, { reliable: true });
        channel.broadcast.emit("player:connected", serverOptions, { reliable: true });

        this.addPlayer(serverOptions);
    }

    sendAlreadyConnected(channel: ServerChannel) {
        console.log("players:already-connected");

        const otherPlayersOptions = this.getOtherPlayersOptions(channel.id);
        channel.emit("players:already-connected", otherPlayersOptions, { reliable: true });
    }

    broadcastMessage(channel: ServerChannel, message) {
        console.log("Message:", message);
        channel.broadcast.emit("message", message, { reliable: true });
    }
    emulateActions(channel: ServerChannel, actions: object) {
        // console.log("player:actions", actions);
        const { inputManager } = this.getPlayerById(channel.id);
        inputManager.setActions(actions);
    }

    update(time: number, delta: number) {
        this.elapsedSinceUpdate += delta;
        if (this.elapsedSinceUpdate > this.tickrateDeltaTime) {
            this.elapsedSinceUpdate = 0;
        }
        Object.values(this.players).forEach(({ inputManager }) => inputManager.update(time, delta));
    }

    sendPlayersState() {
        // if (Object.keys(this.pendingPlayersState).length) {
        //     this.game.server.emit("players:pending-state", this.pendingPlayersState);
        //     this.pendingPlayersState = {};
        // }
    }
}
