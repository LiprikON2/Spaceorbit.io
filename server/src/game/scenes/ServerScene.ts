import { BaseMapScene } from "@spaceorbit/client/src/game/scripts/scenes/maps/BaseMapScene";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";
import { ChannelId, ServerChannel } from "@geckos.io/server";

import { getIsoTime } from "~/server/utils";
import type { GameServer } from "~/server/game/GameServer";
import type {
    ActionsState,
    Spaceship,
} from "@spaceorbit/client/src/game/scripts/objects/Sprite/Spaceship";
import { type Actions } from "@spaceorbit/client/src/game/scripts/managers/BaseInputManager";
import {
    type ClientHitData,
    BaseCollisionManager,
} from "@spaceorbit/client/src/game/scripts/managers/BaseCollisionManager";
import { ServerEntityManager } from "~/server/game/ServerEntityManager";
import { EveryTick } from "@spaceorbit/client/src/game/scripts/utils/EveryTick";

interface ServerHitData extends ClientHitData {
    ownerId: ChannelId;
    time: number;
}

export class ServerScene extends BaseMapScene {
    declare game: GameServer;
    si = new SnapshotInterpolation();

    collisionManager?: BaseCollisionManager;
    declare entityManager: ServerEntityManager;

    everyTick = new EveryTick(30);

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    preload() {
        // super.preload();
        this.entityManager = new ServerEntityManager(
            {},
            {
                scene: this,
                isTextured: false,
            }
        );
        this.collisionManager = new BaseCollisionManager({
            projectileGroup: this.entityManager.projectileGroup,
            entityGroup: this.entityManager.entityGroup,
        });
    }

    create() {
        super.create();

        this.entityManager.spawnMobs(2, (mob: Spaceship) => {
            mob.on("entity:hit", (hitData: ClientHitData) => {
                const { weaponId, enemyId } = hitData;
                const weapon = mob.weapons.getWeaponById(weaponId);
                if (weapon) {
                    const damage = mob.weapons.getDamageByWeapon(weapon);
                    this.entityManager.hitEntity(enemyId, damage, (enemy) =>
                        this.sendEntityStatus(enemy.id, true)
                    );
                }
            });
            mob.on("entity:heal", (id: string) => {
                this.sendEntityStatus(id);
            });
            mob.on("entity:dead", () => this.entityManager.respawnEntity(mob.id));
        });

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
            channel.on("world:mobs-options", () => this.sendMobsOptions(channel));

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
                    channel.id!,
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
                this.entityManager.removePlayer(channel.id!, (playerId) => {
                    channel.broadcast.emit("player:disconnected", playerId!);
                });
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
        const enemy = this.entityManager.getById(enemyId, "entity") as Spaceship;
        const didHit = this.collisionManager!.isPointInCircle(projectilePoint, {
            x: enemyState.x,
            y: enemyState.y,
            r: enemy.hitboxRadius,
        });

        if (didHit) {
            const owner = this.entityManager.getById(ownerId!, "entity") as Spaceship;
            const weapon = owner.weapons.getWeaponById(weaponId);
            if (!weapon) return;

            const damage = owner.weapons.getDamageByWeapon(weapon);
            this.entityManager.hitEntity(enemyId, damage, (enemy) =>
                this.sendEntityStatus(enemy.id)
            );
        }
    }

    sendEntityStatus(entityId: ChannelId, reliable = false) {
        const entity = this.entityManager.getById(entityId!, "entity") as Spaceship;
        if (entity) {
            this.game.server.emit(
                "entity:status",
                { id: entity.id, status: entity.getStatusState() },
                { reliable }
            );
        }
    }

    sendPlayerOptions(channel: ServerChannel) {
        console.log("player:request-options");

        const serverOptions = this.entityManager.getPlayerServerOptions(channel.id);
        channel.emit("player:request-options", serverOptions, { reliable: true });
        channel.broadcast.emit("player:connected", serverOptions, { reliable: true });

        this.entityManager.spawnPlayer(serverOptions, (player) => {
            player.on("entity:heal", (id: string) => {
                this.sendEntityStatus(id);
            });
        });
    }

    sendAlreadyConnected(channel: ServerChannel) {
        console.log("players:already-connected");

        const otherPlayersOptions = this.entityManager.getOtherPlayersOptions(channel.id!);
        channel.emit("players:already-connected", otherPlayersOptions, { reliable: true });
    }
    sendMobsOptions(channel: ServerChannel) {
        console.log("world:mobs-options");

        const otherPlayersOptions = this.entityManager.getMobsOptions();
        channel.emit("world:mobs-options", otherPlayersOptions, { reliable: true });
    }

    broadcastMessage(channel: ServerChannel, message) {
        console.log("Message:", message);
        channel.broadcast.emit("message", message, { reliable: true });
    }

    emulateActions(playerId: ChannelId, actions: Partial<Actions>) {
        // console.log("player:actions", actions);
        const { inputManager } = this.entityManager.getPlayerById(playerId!);
        inputManager.setActions(actions);
    }

    update(time: number, delta: number) {
        this.everyTick.update(time, delta, () => {
            // console.log("thisactualFps", this.game.loop.actualFps);
            this.sendServerSnapshot();
        });
        this.entityManager.update(time, delta);
        this.collisionManager!.update(time, delta);
    }

    sendServerSnapshot() {
        const serverState = {
            entities: [
                ...this.entityManager.playersActionsState,
                ...this.entityManager.mobsActionsState,
            ],
        };
        const serverSnapshot = this.si.snapshot.create(serverState);
        this.si.vault.add(serverSnapshot);

        this.game.server.emit("world:server-snapshot", serverSnapshot);
    }
}
