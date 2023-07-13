import type { ClientChannel } from "@geckos.io/client";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";

import { InputManager, SoundManager } from "~/managers";
import { Spaceship, GenericText } from "~/objects";
import type { GameClient } from "~/game";
import { BaseScene } from "./BaseScene";
import type { SpaceshipClientOptions, SpaceshipServerOptions } from "~/game/objects/ship/spaceship";

export class ClientScene extends BaseScene {
    game: GameClient;
    channel?: ClientChannel;
    si?: SnapshotInterpolation;

    inputManager: InputManager;
    soundManager: SoundManager;
    player: Spaceship;
    background;
    debugText: GenericText;
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

    async create() {
        console.log("client!");
        super.create();
        this.player = await this.producePlayer();
        await this.produceOtherPlayers();
        this.produceOtherPlayerOnConnect();

        this.inputManager = new InputManager(this, this.player);

        this.soundManager.addMusic(["track_1", "track_2", "track_3"], true);

        this.debugText = new GenericText(this, this.player).setDepth(1000);
        this.mobManager.spawnMobs(5, this.soundManager);

        this.isPaused = false;
        this.game.outEmitter.emit("worldCreate");
        console.log("clientscene worldCreate");
    }

    update(time: number, delta: number) {
        // Since create() is async, update() is called before create() finishes
        if (!this.isPaused) {
            super.update(time, delta);
            this.inputManager.update(time, delta);
            this.debugText.update();
            this.soundManager.update();

            if (this.isMultiplayer) {
                this.sendPlayerState();
                this.updateOtherPlayersState();
            }
        }
    }

    getPlayerClientOptions() {
        return {
            allGroup: this.allGroup,
            scene: this,
            soundManager: this.soundManager,
        };
    }

    get isSingleplayer() {
        return !this.isMultiplayer;
    }
    get isMultiplayer() {
        return Boolean(this.channel);
    }

    async producePlayer(): Promise<Spaceship> {
        let serverOptions: SpaceshipServerOptions;
        if (this.isSingleplayer) {
            serverOptions = this.getPlayerServerOptions();
        } else {
            serverOptions = await this.requestPlayer();
        }
        const clientOptions = this.getPlayerClientOptions();

        return this.createPlayer(serverOptions, clientOptions);
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

    async produceOtherPlayers(): Promise<Spaceship[]> {
        if (this.isSingleplayer) return;

        const serverOptionsList = await this.requestAlreadyConnectedPlayers();
        const clientOptions = this.getPlayerClientOptions();

        const otherPlayers = serverOptionsList.map((serverOptions) =>
            this.createPlayer(serverOptions, clientOptions, true)
        );
        return otherPlayers;
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

    produceOtherPlayerOnConnect() {
        if (this.isMultiplayer) {
            this.channel.on("player:connected", (serverOptions) => {
                console.log("player:connected", serverOptions);
                const clientOptions = this.getPlayerClientOptions();

                this.createPlayer(serverOptions as SpaceshipServerOptions, clientOptions);
            });
        }
    }

    sendPlayerState() {
        // const state = this.player.getClientState();
        const inputState = this.inputManager.getInputState();
        this.channel.emit("player:state", { ...inputState, time: this.si.serverTime });
    }

    updateOtherPlayersState() {
        this.channel.on("players:pending-state", (pendingState) => {
            this.otherPlayersGroup.getChildren().forEach((otherPlayer) => {
                if (Object.keys(pendingState).includes(otherPlayer.id)) {
                    const otherPlayerState = pendingState[otherPlayer.id];
                    otherPlayer.setClientState(otherPlayerState);
                }
            });
        });
    }
}
