import { SnapshotInterpolation, Vault } from "@geckos.io/snapshot-interpolation";
import type { Snapshot } from "@geckos.io/snapshot-interpolation/lib/types";

import { ClientInputManager, SoundManager } from "~/managers";
import {
    Spaceship,
    type ActionsState,
    type SpaceshipServerOptions,
} from "~/objects/Sprite/Spaceship";
import type { ClientChannel, GameClient } from "~/game";
import { BaseMapScene } from "~/scenes/maps/BaseMapScene";
import { PingBuffer, EveryTick } from "~/game/utils";
import type { ClientHitData } from "~/managers/BaseCollisionManager";
import type { MultiplayerEvents } from "~/scenes/core/BaseScene";
import type { Mob } from "~/game/objects/Sprite/Spaceship/Mob";

interface ProducePlayerOptions {
    isMe?: boolean;
    callback?: (player: Spaceship) => void;
}

export class ClientScene extends BaseMapScene {
    game: GameClient;
    channel?: ClientChannel<MultiplayerEvents>;
    si?: SnapshotInterpolation;
    clientVault?: Vault;
    everyTick = new EveryTick(30);
    ping = new PingBuffer(180);

    inputManager: ClientInputManager;
    soundManager: SoundManager;
    player: Spaceship;
    mobs = [];
    isPaused = true;
    gravityDebugVector: Phaser.GameObjects.Line;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    init({ channel }: { channel?: ClientChannel }) {
        if (channel) {
            this.channel = channel;
            this.si = new SnapshotInterpolation(30);
            this.clientVault = new Vault();
        }
        this.soundManager = new SoundManager(this);
    }

    preload() {
        super.preload();
        this.entityManager.addSoundManager(this.soundManager);
        this.scene.launch("HudScene", this);
    }

    async create() {
        super.create();

        if (this.game.isSingleplayer) {
            const serverOptions = this.entityManager.getPlayerServerOptions();
            this.player = await this.producePlayer(serverOptions, {
                isMe: true,
                callback: (player) => this.setSingleplayerListeners(player),
            });

            this.entityManager.spawnMobs(0, (mob) => this.setSingleplayerListeners(mob));
        } else {
            this.player = await this.producePlayer(null, {
                isMe: true,
                callback: (player) => this.setMultiplayerListeners(player),
            });

            await this.produceConnectedPlayers((player) => this.setMultiplayerListeners(player));
            await this.produceMobs((mob) => this.setMultiplayerListeners(mob));
            this.channel.on("player:connected", (serverOptions) =>
                this.producePlayer(serverOptions, {
                    callback: (player) => this.setMultiplayerListeners(player),
                })
            );
            this.channel.on("player:disconnected", (playerId) =>
                this.entityManager.destroyEntity(playerId)
            );
            this.channel.on("world:server-snapshot", (serverSnapshot) =>
                this.addServerSnapshot(serverSnapshot)
            );

            this.player.on("entity:hit", (hitData: ClientHitData) =>
                this.requestHitAssertion(hitData)
            );
            this.channel.on("entity:status", ({ id, status }) =>
                this.entityManager.updateEntityStatus(id, status)
            );

            this.player.on("entity:dead", () => this.requestRespawn());
            this.channel.on("entity:respawn", ({ id, point }) => {
                this.entityManager.respawnEntity(id, point);
            });
        }

        this.inputManager = new ClientInputManager(this, this.player);
        this.soundManager.addMusic(["track_1", "track_2", "track_3"], true);

        this.isPaused = false;
        this.game.outEmitter.emit("world:create");

        this.gravityDebugVector = this.add
            .line(0, 0, 0, 0, 0, 0, 0xff0000)
            .setDepth(1000)
            .setVisible(false);
    }

    setMultiplayerListeners(entity: Spaceship) {
        // Prevents teleportation from being jerky
        // TODO indiscriminate clearing snapshots of all player may not be optimal;
        entity.on("entity:teleport", () => this.clearSnapshots());
    }

    requestHitAssertion(hitData: ClientHitData) {
        console.log("player:assert-hit");
        this.channel.emit(
            "player:assert-hit",
            {
                ...hitData,
                time: this.si.serverTime,
            },
            { reliable: true }
        );
    }

    requestRespawn() {
        console.log("player:request-respawn");
        this.channel.emit("player:request-respawn", null, { reliable: true });
    }

    async producePlayer(
        serverOptions?: SpaceshipServerOptions,
        options?: ProducePlayerOptions
    ): Promise<Spaceship> {
        const defaultOptions = {
            isMe: false,
            callback: () => {},
        };
        const mergedOptions = { ...defaultOptions, ...options };
        if (!serverOptions) serverOptions = await this.requestServerOptions();

        // const alreadyPresentPlayer = this.entityManager.getById(serverOptions.id, "players");
        // if (alreadyPresentPlayer) return alreadyPresentPlayer;

        const { isMe } = mergedOptions;
        const player = this.entityManager.createPlayer(
            serverOptions,
            { soundManager: this.soundManager },
            isMe
        );

        const { callback } = mergedOptions;
        callback(player);
        return player;
    }

    async produceMob(
        serverOptions?: SpaceshipServerOptions,
        options?: { callback: (mob: Mob) => void }
    ): Promise<Mob> {
        const defaultOptions = {
            callback: () => {},
        };
        const mergedOptions = { ...defaultOptions, ...options };
        const mob = this.entityManager.createMob(serverOptions, {
            soundManager: this.soundManager,
        });
        const { callback } = mergedOptions;
        callback(mob);
        return mob;
    }

    async requestServerOptions(): Promise<SpaceshipServerOptions> {
        this.channel.emit("player:request-options", null, { reliable: true });

        return new Promise((resolve) => {
            this.channel.on("player:request-options", (serverOptions) => {
                console.log("player:request-options");
                resolve(serverOptions);
            });
        });
    }

    async produceConnectedPlayers(callback: (player: Spaceship) => void = () => {}) {
        const serverOptionsList = await this.requestAlreadyConnectedPlayers();

        serverOptionsList.forEach((serverOptions) =>
            this.producePlayer(serverOptions, { callback })
        );
    }

    async requestAlreadyConnectedPlayers(): Promise<SpaceshipServerOptions[]> {
        this.channel.emit("players:already-connected", null, { reliable: true });

        return new Promise((resolve) => {
            this.channel.on("players:already-connected", (serverOptionsList) => {
                console.log("players:already-connected", serverOptionsList);

                resolve(serverOptionsList);
            });
        });
    }

    async produceMobs(callback: (mob: Mob) => void = () => {}) {
        // TODO move this into entity Manager
        const serverOptionsList = await this.requestMobs();

        serverOptionsList.forEach((serverOptions) => this.produceMob(serverOptions, { callback }));
    }

    async requestMobs(): Promise<SpaceshipServerOptions[]> {
        this.channel.emit("world:mobs-options", null, { reliable: true });

        return new Promise((resolve) => {
            this.channel.on("world:mobs-options", (serverOptionsList) => {
                console.log("world:mobs-options", serverOptionsList);

                resolve(serverOptionsList);
            });
        });
    }

    addServerSnapshot(serverState: Snapshot) {
        this.si.snapshot.add(serverState);
    }

    createClientSnapshot() {
        const clientState = { player: [this.player.getActionsState()] };
        const clientSnapshot = this.si.snapshot.create(clientState);
        this.clientVault.add(clientSnapshot);
    }

    clearSnapshots() {
        this.si.vault.clear();
        this.clientVault.clear();
    }

    update(time: number, delta: number) {
        // Since create() is async, update() is called before create() finishes
        if (this.isPaused) return;

        super.update(time, delta);
        this.soundManager.update();
        this.collisionManager.update(time, delta);

        // Acts as client predictor in multiplayer
        this.inputManager.update(time, delta);

        if (this.game.isMultiplayer) {
            this.createClientSnapshot();
            this.everyTick.update(time, delta, () => {
                this.sendPlayerActions();
                this.updateReconciliation();
            });
            this.updateEntitiesActions();
            this.updatePing();
        }

        this.updateDebug();
    }
    updateDebug() {
        const [closestX, closestY] = this.getClosestPointInsideWorldBorder({
            x: this.player.x,
            y: this.player.y,
        });
        this.gravityDebugVector.setTo(this.player.x, this.player.y, closestX, closestY);
    }

    sendPlayerActions() {
        const { actionsCompact } = this.inputManager;
        this.channel.emit("player:actions", { ...actionsCompact, time: this.si.serverTime });
    }

    updateEntitiesActions() {
        // TODO if some of the entities are not present on client, produce them
        const serverEntitiesSnapshot = this.si.calcInterpolation(
            "x y angle(deg) worldX worldY",
            "entities"
        );
        if (serverEntitiesSnapshot) {
            const entitesState = serverEntitiesSnapshot.state as ActionsState[];

            entitesState.forEach((entityState) => {
                if (this.player.id !== entityState.id) {
                    const entity = this.entityManager.getById(entityState.id, "entity");
                    if (entity?.active) entity.setActionsState(entityState);
                }
            });
        }
    }

    updateReconciliation() {
        // Get the latest snapshot from the server
        const serverSnapshot = this.si.vault.get();
        if (serverSnapshot) {
            // Get the closest client snapshot that matches the server snapshot time
            const clientSnapshot = this.clientVault.get(serverSnapshot.time, true);
            if (clientSnapshot) {
                const serverEntitiesState = serverSnapshot.state["entities"] as ActionsState[];
                // Get the current server state on the server
                const serverPlayerState = serverEntitiesState.find(
                    (playerState) => playerState.id === this.player.id
                );

                const [clientPlayerState] = clientSnapshot.state["player"] as ActionsState[];

                // Calculate the offset between server and client
                const offsetX = clientPlayerState.x - serverPlayerState.x;
                const offsetY = clientPlayerState.y - serverPlayerState.y;
                // Check if the player is currently on the move
                const isMoving = this.player.activity === "moving";
                // Correct the position faster if player moves
                const correction = isMoving ? 60 : 180;
                // Apply a step by step correction of the player's position
                this.player.boundingBox.x -= offsetX / correction;
                this.player.boundingBox.y -= offsetY / correction;
            }
        }
    }

    updatePing() {
        const serverTime = this.si.vault.get()?.time;
        const clientTime = this.clientVault.get()?.time;
        const ping = serverTime - clientTime + this.si.timeOffset;
        if (!isNaN(ping)) this.ping.push(ping);
    }
}
