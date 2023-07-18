import type { ChannelId, ClientChannel } from "@geckos.io/client";
import { SnapshotInterpolation, Vault } from "@geckos.io/snapshot-interpolation";

import { ClientInputManager, SoundManager } from "~/managers";
import { Spaceship, DebugInfo } from "~/objects";
import type { GameClient } from "~/game";
import { BaseMapScene } from "../maps/BaseMapScene";
import type { ClientState, SpaceshipServerOptions } from "~/game/objects/ship/Spaceship";
import type { Snapshot } from "@geckos.io/snapshot-interpolation/lib/types";
import { PingBuffer } from "~/game/utils/Ping";

export class ClientScene extends BaseMapScene {
    game: GameClient;
    channel?: ClientChannel;
    si?: SnapshotInterpolation;
    clientVault?: Vault;

    inputManager: ClientInputManager;
    soundManager: SoundManager;
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
            this.player = await this.producePlayer(serverOptions, true);
        } else {
            this.player = await this.producePlayer(null, true);

            await this.produceConnectedPlayers();
            this.channel.on("player:connected", (serverOptions) =>
                this.producePlayer(serverOptions as SpaceshipServerOptions)
            );
            this.channel.on("player:disconnected", (playerId) =>
                this.destroyPlayer(playerId as ChannelId)
            );
            this.channel.on("players:server-snapshot", (serverSnapshot) =>
                this.addServerSnapshot(serverSnapshot as Snapshot)
            );
        }

        this.debugText = new DebugInfo(this, this.player).setDepth(1000);
        this.inputManager = new ClientInputManager(this, this.player);
        this.soundManager.addMusic(["track_1", "track_2", "track_3"], true);

        this.mobManager.spawnMobs(1, this.soundManager);

        this.isPaused = false;
        this.game.outEmitter.emit("worldCreate");
    }

    async producePlayer(serverOptions?: SpaceshipServerOptions, isMe = false): Promise<Spaceship> {
        if (!serverOptions) {
            serverOptions = await this.requestPlayer();
        }
        const isAlreadyPresent = !!this.playerGroup.getMatching("id", serverOptions.id).length;
        if (isAlreadyPresent) return;

        const clientOptions = this.getPlayerClientOptions();
        return this.createPlayer(serverOptions, clientOptions, isMe);
    }

    async requestPlayer(): Promise<SpaceshipServerOptions> {
        this.channel.emit("player:request-options", { reliable: true });

        return new Promise((resolve) => {
            this.channel.on("player:request-options", (serverOptions) => {
                console.log("player:request-options");
                resolve(serverOptions as SpaceshipServerOptions);
            });
        });
    }

    async produceConnectedPlayers() {
        const serverOptionsList = await this.requestAlreadyConnectedPlayers();
        serverOptionsList.forEach((serverOptions) => this.producePlayer(serverOptions));
    }

    async requestAlreadyConnectedPlayers(): Promise<SpaceshipServerOptions[]> {
        this.channel.emit("players:already-connected", { reliable: true });

        return new Promise((resolve) => {
            this.channel.on("players:already-connected", (serverOptionsList) => {
                console.log("players:already-connected", serverOptionsList);

                resolve(serverOptionsList as SpaceshipServerOptions[]);
            });
        });
    }

    produceOtherPlayerOnConnect(serverOptions: SpaceshipServerOptions) {
        console.log("player:connected", serverOptions);
        const clientOptions = this.getPlayerClientOptions();
        this.createPlayer(serverOptions as SpaceshipServerOptions, clientOptions);
    }

    addServerSnapshot(serverState: Snapshot) {
        this.si.snapshot.add(serverState);
    }

    createClientSnapshot() {
        const clientState = { player: [this.player.getClientState()] };
        const clientSnapshot = this.si.snapshot.create(clientState);
        this.clientVault.add(clientSnapshot);
    }

    update(time: number, delta: number) {
        // Since create() is async, update() is called before create() finishes
        if (!this.isPaused) {
            super.update(time, delta);
            this.debugText.update();
            this.soundManager.update();

            // Acts as client predictor in multiplayer
            this.inputManager.update(time, delta);

            if (this.isMultiplayer) {
                this.createClientSnapshot();
                this.sendPlayerActions();
                this.updateReconciliation();
                this.updateOtherPlayersState();
                this.updatePing();
            }
        }
    }

    sendPlayerActions() {
        const { actionsCompact } = this.inputManager;
        this.channel.emit("player:actions", { ...actionsCompact, time: this.si.serverTime });
    }

    updateOtherPlayersState() {
        const serverPlayersSnapshot = this.si.calcInterpolation("x y angle(deg)", "players");
        if (serverPlayersSnapshot) {
            const playersState = serverPlayersSnapshot.state as ClientState[];

            playersState.forEach((playerState) => {
                const [player] = this.otherPlayersGroup.getMatching(
                    "id",
                    playerState.id
                ) as Spaceship[];

                if (player) player.setClientState(playerState);
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
                const serverPlayersState = serverSnapshot.state["players"] as ClientState[];
                // Get the current server state on the server
                const serverPlayerState = serverPlayersState.find(
                    (playerState) => playerState.id === this.player.id
                );

                const [clientPlayerState] = clientSnapshot.state["player"] as ClientState[];

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
