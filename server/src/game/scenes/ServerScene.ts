import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";
import { ChannelId, ServerChannel } from "@geckos.io/server";

import { getIsoTime } from "~/server/utils";
import type { GameServer } from "~/server/game/GameServer";
import type {
    ClientState,
    Spaceship,
    SpaceshipServerOptions,
} from "@spaceorbit/client/src/game/scripts/objects/Sprite/Spaceship";
import { BaseMapScene } from "@spaceorbit/client/src/game/scripts/scenes/maps/BaseMapScene";
import BaseInputManager, {
    type Actions,
} from "@spaceorbit/client/src/game/scripts/managers/BaseInputManager";
import type { HitData as ClientHitData } from "@spaceorbit/client/src/game/scripts/objects/Sprite/Spaceship/components";

interface Players {
    [key: string]: {
        serverOptions: SpaceshipServerOptions;
        player: Spaceship;
        inputManager: BaseInputManager;
    };
}

interface HitData extends ClientHitData {
    time: number;
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
            // TODO update
            const { x, y, angle } = player.getClientState();
            return { ...serverOptions, x, y, angle };
        });
        return otherPlayersOptions;
    }

    get playersState(): ClientState[] {
        const playersState = Object.values(this.players).map(({ player }) =>
            player.getClientState()
        );

        return playersState;
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
                { name: "System", message: "Pilot, welcome!", isoTime: getIsoTime() },
                { reliable: true }
            );

            channel.on("player:request-options", () => this.sendPlayerOptions(channel));
            channel.on("players:already-connected", () => this.sendAlreadyConnected(channel));

            channel.on("player:actions", (actions) =>
                this.emulateActions(channel.id, actions as Actions)
            );

            channel.on("player:assert-hit", (hitData) => this.assertHit(hitData as HitData));
            channel.on("message", (message) => this.broadcastMessage(channel, message));

            channel.onDisconnect((reason) => {
                console.log(`Channel ${reason}`, channel.id);
                this.removePlayer(channel);
            });
        });
    }
    assertHit({ enemyId, projectileId, projectilePoint, hitboxCircle, time }: HitData) {
        console.log("player:assert-hit");

        // get the two closest snapshot to the date
        const snapshots = this.si.vault.get(time);
        if (!snapshots) return;
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

    removePlayer(channel: ServerChannel) {
        channel.broadcast.emit("player:disconnected", channel.id!);

        this.destroyPlayer(channel.id!);
        delete this.players[channel.id!];
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

    emulateActions(playerId: ChannelId, actions: Partial<Actions>) {
        // console.log("player:actions", actions);
        const { inputManager } = this.getPlayerById(playerId);
        inputManager.setActions(actions);
    }

    update(time: number, delta: number) {
        this.everyTick(delta, () => {
            this.sendServerSnapshot();
        });
        this.updatePlayersInput(time, delta);
    }

    everyTick(delta: number, callback: Function) {
        this.elapsedSinceUpdate += delta;
        if (this.elapsedSinceUpdate > this.tickrateDeltaTime) {
            this.elapsedSinceUpdate = 0;
            callback();
        }
    }

    sendServerSnapshot() {
        const serverState = {
            players: this.playersState,
            // projectiles: [],
        };
        const serverSnapshot = this.si.snapshot.create(serverState);

        this.game.server.emit("players:server-snapshot", serverSnapshot);
    }

    updatePlayersInput(time: number, delta: number) {
        Object.values(this.players).forEach(({ inputManager }) => inputManager.update(time, delta));
    }
}
