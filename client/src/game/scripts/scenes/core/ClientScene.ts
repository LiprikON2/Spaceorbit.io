import { SnapshotInterpolation, Vault } from "@geckos.io/snapshot-interpolation";
import type { Snapshot } from "@geckos.io/snapshot-interpolation/lib/types";

import { ClientCollisionManager, ClientInputManager, SoundManager } from "~/managers";
import {
    Spaceship,
    type ActionsState,
    type SpaceshipServerOptions,
} from "~/objects/Sprite/Spaceship";
import { DebugInfo } from "~/objects";
import type { ClientChannel, GameClient } from "~/game";
import { BaseMapScene } from "~/scenes/maps/BaseMapScene";
import { PingBuffer } from "~/game/utils/ping";
import type { ClientHitData } from "~/managers/BaseCollisionManager";
import type { MultiplayerEvents } from "~/scenes/core/BaseScene";

interface ProducePlayerOptions {
    isMe?: boolean;
    playerCreationCallback?: (player: Spaceship) => void;
}

export class ClientScene extends BaseMapScene {
    game: GameClient;
    channel?: ClientChannel<MultiplayerEvents>;
    si?: SnapshotInterpolation;
    clientVault?: Vault;

    inputManager: ClientInputManager;
    soundManager: SoundManager;
    collisionManager: ClientCollisionManager;
    player: Spaceship;
    background;
    debugText: DebugInfo;
    mobs = [];
    isPaused = true;
    ping: PingBuffer;

    get isSingleplayer() {
        return !this.isMultiplayer;
    }
    get isMultiplayer() {
        return Boolean(this.channel);
    }

    getPlayerClientOptions() {
        return {
            allGroup: this.allGroup,
            scene: this,
            soundManager: this.soundManager,
            toPassTexture: true,
        };
    }

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.ping = new PingBuffer(180);
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
    }

    async create() {
        super.create();

        if (this.isSingleplayer) {
            const serverOptions = this.getPlayerServerOptions();
            this.player = await this.producePlayer(serverOptions, {
                isMe: true,
                playerCreationCallback: (player) => {
                    player.on("enemy:hit", (hitData) => {
                        const { weaponId, ownerId, enemyId } = hitData;

                        const [owner] = this.allGroup.getMatching("id", ownerId) as Spaceship[];
                        const weapon = owner.weapons.getWeaponById(weaponId);
                        const damage = owner.weapons.getDamageByWeapon(weapon);

                        this.hitEntity(enemyId, damage);
                    });
                    player.on("entity:dead", () => this.respawnEntity(player.id));
                },
            });
            this.mobManager.spawnMobs(5, this.soundManager);
        } else {
            this.player = await this.producePlayer(null, {
                isMe: true,
                playerCreationCallback: (player) => this.setMultiplayerListeners(player),
            });

            await this.produceConnectedPlayers((player) => this.setMultiplayerListeners(player));
            this.channel.on("player:connected", (serverOptions) =>
                this.producePlayer(serverOptions, {
                    playerCreationCallback: (player) => this.setMultiplayerListeners(player),
                })
            );
            this.channel.on("player:disconnected", (playerId) => this.destroyPlayer(playerId));
            this.channel.on("players:server-snapshot", (serverSnapshot) =>
                this.addServerSnapshot(serverSnapshot)
            );

            this.player.on("entity:hit", (hitData: ClientHitData) =>
                this.requestHitAssertion(hitData)
            );
            this.channel.on("entity:status", ({ id, status }) =>
                this.updateEntityStatus(id, status)
            );

            this.player.on("entity:dead", () => this.requestRespawn());
            this.channel.on("entity:respawn", ({ id, point }) => {
                this.respawnEntity(id, point);
            });
        }

        this.debugText = new DebugInfo(this, this.player).setDepth(1000);
        this.inputManager = new ClientInputManager(this, this.player);
        this.soundManager.addMusic(["track_1", "track_2", "track_3"], true);
        this.collisionManager = new ClientCollisionManager({
            projectileGroup: this.projectileGroup,
            allGroup: this.allGroup,
        });

        this.isPaused = false;
        this.game.outEmitter.emit("world:create");
    }

    setMultiplayerListeners(entity: Spaceship) {
        // TODO indiscriminate clearing snapshots of all player is not optimal;
        // Prevents teleportation from being jerky
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
            playerCreationCallback: () => {},
        };
        if (!serverOptions) serverOptions = await this.requestPlayer();
        const { isMe, playerCreationCallback } = { ...defaultOptions, ...options };

        const [alreadyPresentPlayer] = this.playerGroup.getMatching("id", serverOptions.id);
        if (alreadyPresentPlayer) return alreadyPresentPlayer;

        const clientOptions = this.getPlayerClientOptions();
        const player = this.createPlayer(serverOptions, clientOptions, isMe);

        playerCreationCallback(player);
        return player;
    }

    async requestPlayer(): Promise<SpaceshipServerOptions> {
        this.channel.emit("player:request-options", null, { reliable: true });

        return new Promise((resolve) => {
            this.channel.on("player:request-options", (serverOptions) => {
                console.log("player:request-options");
                resolve(serverOptions);
            });
        });
    }

    async produceConnectedPlayers(
        playerCreationCallback: ProducePlayerOptions["playerCreationCallback"]
    ) {
        const serverOptionsList = await this.requestAlreadyConnectedPlayers();

        serverOptionsList.forEach((serverOptions) =>
            this.producePlayer(serverOptions, {
                playerCreationCallback,
            })
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
        this.debugText.update();
        this.soundManager.update();
        this.collisionManager.update();

        // Acts as client predictor in multiplayer
        this.inputManager.update(time, delta);

        if (this.isMultiplayer) {
            this.createClientSnapshot();
            this.everyTick(30, delta, () => {
                this.sendPlayerActions();
                this.updateReconciliation();
            });
            this.updateOtherPlayersState();
            this.updatePing();
        }

        // console.log("Player2", this.allGroup.getMatching("name", "Player2")[0]?.targetedBy);
    }

    sendPlayerActions() {
        const { actionsCompact } = this.inputManager;
        this.channel.emit("player:actions", { ...actionsCompact, time: this.si.serverTime });
    }

    updateOtherPlayersState() {
        const serverPlayersSnapshot = this.si.calcInterpolation(
            "x y angle(deg) worldX worldY",
            "players"
        );
        if (serverPlayersSnapshot) {
            const playersState = serverPlayersSnapshot.state as ActionsState[];

            playersState.forEach((playerState) => {
                const [otherPlayer] = this.otherPlayersGroup.getMatching("id", playerState.id);
                if (otherPlayer?.active) otherPlayer.setActionsState(playerState);
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
                const serverPlayersState = serverSnapshot.state["players"] as ActionsState[];
                // Get the current server state on the server
                const serverPlayerState = serverPlayersState.find(
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
