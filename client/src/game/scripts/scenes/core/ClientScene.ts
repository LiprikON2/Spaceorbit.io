import type { ChannelId, ClientChannel } from "@geckos.io/client";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";

import { ClientInputManager, SoundManager } from "~/managers";
import { Spaceship, DebugInfo } from "~/objects";
import type { GameClient } from "~/game";
import { BaseMapScene } from "../maps/BaseMapScene";
import type { ClientState, SpaceshipServerOptions } from "~/game/objects/ship/Spaceship";
import type { Snapshot } from "@geckos.io/snapshot-interpolation/lib/types";

interface WorldState {
    players: ClientState[];
}

export class ClientScene extends BaseMapScene {
    game: GameClient;
    channel?: ClientChannel;
    si?: SnapshotInterpolation;

    inputManager: ClientInputManager;
    soundManager: SoundManager;
    player: Spaceship;
    background;
    debugText: DebugInfo;
    mobs = [];
    isPaused = true;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    init({ channel }: { channel?: ClientChannel }) {
        if (channel) {
            this.channel = channel;
            this.si = new SnapshotInterpolation(30);
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
            this.updateWorldState();
        }

        this.inputManager = new ClientInputManager(this, this.player);

        this.soundManager.addMusic(["track_1", "track_2", "track_3"], true);

        this.debugText = new DebugInfo(this, this.player).setDepth(1000);
        this.mobManager.spawnMobs(0, this.soundManager);

        this.isPaused = false;
        this.game.outEmitter.emit("worldCreate");
    }

    update(time: number, delta: number) {
        // Since create() is async, update() is called before create() finishes
        if (!this.isPaused) {
            super.update(time, delta);
            this.inputManager.update(time, delta);
            this.debugText.update();
            this.soundManager.update();

            if (this.isMultiplayer) {
                this.sendPlayerActions();
                this.updatePlayerState();
            }
        }
    }

    getPlayerClientOptions() {
        return {
            allGroup: this.allGroup,
            scene: this,
            soundManager: this.soundManager,
            toPassTexture: true,
        };
    }

    get isSingleplayer() {
        return !this.isMultiplayer;
    }
    get isMultiplayer() {
        return Boolean(this.channel);
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

    sendPlayerActions() {
        const { actionsCompact } = this.inputManager;
        this.channel.emit("player:actions", { ...actionsCompact, time: this.si.serverTime });
    }

    updateWorldState() {
        this.channel.on("players:world-state", (worldState) => {
            this.si.snapshot.add(worldState as Snapshot);

            // this.otherPlayersGroup.getChildren().forEach((otherPlayer) => {
            //     if (Object.keys(worldState).includes(otherPlayer.id)) {
            //         const otherPlayerState = worldState[otherPlayer.id];
            //         otherPlayer.setClientState(otherPlayerState);
            //     }
            // });
        });
    }
    updatePlayerState() {
        const snapshot = this.si.calcInterpolation("x y angle(deg)", "players");
        if (snapshot) {
            const playersState = snapshot.state as ClientState[];
            playersState.forEach((playerState) => {
                const [player] = this.otherPlayersGroup.getMatching(
                    "id",
                    playerState.id
                ) as Spaceship[];
                if (player) player.setClientState(playerState);
            });
        }
    }
}
