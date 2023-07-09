import type { ClientChannel } from "@geckos.io/client";

import { InputManager, SoundManager } from "~/managers";
import { Spaceship, GenericText } from "~/objects";
import type { GameClient } from "~/game";
import { BaseScene } from "./BaseScene";
import { SpaceshipServerOptions } from "~/game/objects/ship/spaceship";

export class ClientScene extends BaseScene {
    channel?: ClientChannel;
    game: GameClient;

    inputManager: InputManager;
    soundManager: SoundManager;
    player: Spaceship;
    background;
    debugText: GenericText;
    mobs = [];
    isPaused = true;
    playerGroup: Phaser.GameObjects.Group;
    mobGroup: Phaser.GameObjects.Group;
    allGroup: Phaser.GameObjects.Group;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    init({ channel }: { channel?: ClientChannel }) {
        this.channel = channel;
        this.playerGroup = this.add.group();
        this.mobGroup = this.add.group();
        this.allGroup = this.add.group();
    }

    async create() {
        super.create();

        this.soundManager = new SoundManager(this);
        this.player = await this.producePlayer();
        this.inputManager = new InputManager(this, this.player);

        this.soundManager.addMusic(["track_1", "track_2", "track_3"], true);

        this.debugText = new GenericText(this, this.player).setDepth(1000);
        this.mobManager.spawnMobs(5, this.soundManager);

        this.isPaused = false;
        this.game.outEmitter.emit("worldCreate");
    }

    update(time: number, delta: number) {
        // Since create() is async, update() is called before create() finishes
        if (!this.isPaused) {
            super.update(time, delta);

            this.inputManager.update(time, delta);
            this.debugText.update();
            this.mobManager.update(time, delta);
            this.soundManager.update();
            this.player.update(time, delta);
        }
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
            serverOptions = await this.#requestPlayerServerOptions();
        }
        const player = new Spaceship(serverOptions, {
            scene: this,
            soundManager: this.soundManager,
            allGroup: this.allGroup,
        });

        this.playerGroup.add(player);
        this.allGroup.add(player);

        return player;
    }

    async #requestPlayerServerOptions(): Promise<SpaceshipServerOptions> {
        this.channel.emit("requestPlayer", { reliable: true });

        return new Promise((resolve) => {
            this.channel.on("receivePlayer", (serverOptions) => {
                console.log("receivePlayer:", serverOptions);
                resolve(serverOptions as SpaceshipServerOptions);
            });
        });
    }
}
