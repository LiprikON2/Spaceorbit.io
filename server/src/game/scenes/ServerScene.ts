import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";
import { ChannelId, ServerChannel } from "@geckos.io/server";

import { getIsoTime } from "~/server/utils";
import type { GameServer } from "~/server/game/GameServer";
import type {
    ActionsState,
    Spaceship,
    SpaceshipServerOptions,
} from "@spaceorbit/client/src/game/scripts/objects/Sprite/Spaceship";
import { BaseMapScene } from "@spaceorbit/client/src/game/scripts/scenes/maps/BaseMapScene";
import BaseInputManager, {
    type Actions,
} from "@spaceorbit/client/src/game/scripts/managers/BaseInputManager";
import {
    type ClientHitData,
    BaseCollisionManager,
} from "@spaceorbit/client/src/game/scripts/managers/BaseCollisionManager";

interface Entities {
    [key: string]: {
        serverOptions: SpaceshipServerOptions;
        entity: Spaceship;
        inputManager: BaseInputManager;
    };
}

interface ServerHitData extends ClientHitData {
    ownerId: ChannelId;
    time: number;
}

export class ServerScene extends BaseMapScene {
    declare game: GameServer;
    si = new SnapshotInterpolation();
    // @ts-ignore
    collisionManager: BaseCollisionManager;

    players: Entities = {};
    mobs: Entities = {};
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
        const otherPlayersOptions = otherPlayersEntries.map(
            ([key, { entity: player, serverOptions }]) => {
                // TODO update
                const { x, y, angle } = player.getActionsState();
                return { ...serverOptions, x, y, angle };
            }
        );
        return otherPlayersOptions;
    }

    get playersActionsState(): ActionsState[] {
        const playersState = Object.values(this.players).map(({ entity: player }) =>
            player.getActionsState()
        );

        return playersState;
    }
    // TODO
    get mobsActionsState(): ActionsState[] {
        const playersState = Object.values(this.players).map(({ entity: player }) =>
            player.getActionsState()
        );

        return [];
    }

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    preload() {
        super.preload();
        this.collisionManager = new BaseCollisionManager({
            projectileGroup: this.entityManager.projectileGroup,
            allGroup: this.entityManager.allGroup,
        });
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

            channel.on("player:assert-hit", (hitData) =>
                this.assertHit({
                    ...(hitData as ClientHitData),
                    ownerId: channel.id,
                })
            );

            channel.on("player:request-respawn", () =>
                this.entityManager.respawnEntity(
                    channel.id,
                    { worldX: null, worldY: null },
                    (worldX: number, worldY: number) => {
                        this.game.server.emit(
                            "entity:respawn",
                            { id: channel.id, point: { worldX, worldY } },
                            { reliable: true }
                        );
                    }
                )
            );
            channel.on("message", (message) => this.broadcastMessage(channel, message));

            channel.onDisconnect((reason) => {
                console.log(`Channel ${reason}`, channel.id);
                this.removePlayer(channel);
            });
        });
    }
    assertHit({
        ownerId,
        enemyId,
        firedFromPoint,
        weaponId,
        projectilePoint,
        time,
    }: ServerHitData) {
        console.log("player:assert-hit");

        // get the two closest snapshot to the date
        const serverSnapshots = this.si.vault.get(time);
        if (!serverSnapshots) return;

        // interpolate between both snapshots
        const serverPlayersSnapshot = this.si.interpolate(
            serverSnapshots.older,
            serverSnapshots.newer,
            time,
            "x y",
            "entities"
        );
        if (!serverPlayersSnapshot) return;

        // TODO make some validations
        // if (hit is not already marked as successfull)
        // if (projectile origin weapon slot is legit)
        // if (projectile type is legit)
        // if (projectile traveled legit distance)
        // if (firerate is legit)
        // if (firedFromPoint is legit)
        // if (player is active)
        const playersState = serverPlayersSnapshot.state as ActionsState[];

        const ownerState = playersState.find((playerState) => playerState.id === ownerId);
        const enemyState = playersState.find((playerState) => playerState.id === enemyId);

        if (!enemyState || !ownerState) return;

        const enemy = this.entityManager.getById(enemyId, "all") as Spaceship;
        const didHit = this.collisionManager.isPointInCircle(projectilePoint, {
            x: enemyState.x,
            y: enemyState.y,
            r: enemy.hitboxRadius,
        });

        if (didHit) {
            const owner = this.entityManager.getById(ownerId, "all") as Spaceship;
            const weapon = owner.weapons.getWeaponById(weaponId);
            if (!weapon) return;

            const damage = owner.weapons.getDamageByWeapon(weapon);
            enemy.getHit(damage);

            this.sendEntityStatus(enemy.id);
        }
    }

    sendEntityStatus(entityId: ChannelId) {
        const entity = this.entityManager.getById(entityId, "all") as Spaceship;
        if (entity) {
            this.game.server.emit(
                "entity:status",
                { id: entity.id, status: entity.status },
                { reliable: true }
            );
        }
    }

    addPlayer(serverOptions: SpaceshipServerOptions) {
        const player = this.entityManager.createPlayer(serverOptions, {
            toPassTexture: false,
        });
        const inputManager = new BaseInputManager(this, player);

        this.players[serverOptions.id] = {
            entity: player,
            serverOptions,
            inputManager,
        };
    }

    removePlayer(channel: ServerChannel) {
        channel.broadcast.emit("player:disconnected", channel.id!);

        this.entityManager.destroyPlayer(channel.id!);
        delete this.players[channel.id!];
    }

    sendPlayerOptions(channel: ServerChannel) {
        console.log("player:request-options");

        const serverOptions = this.entityManager.getPlayerServerOptions(channel.id);
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
        this.everyTick(this.tickrate, delta, () => {
            // console.log("thisactualFps", this.game.loop.actualFps);
            this.sendServerSnapshot();
        });
        this.updatePlayersInput(time, delta);
    }

    sendServerSnapshot() {
        const serverState = {
            entities: [...this.playersActionsState, ...this.mobsActionsState],
        };
        const serverSnapshot = this.si.snapshot.create(serverState);
        this.si.vault.add(serverSnapshot);

        this.game.server.emit("world:server-snapshot", serverSnapshot);
    }

    updatePlayersInput(time: number, delta: number) {
        Object.values(this.players).forEach(({ inputManager }) => inputManager.update(time, delta));
    }
}
