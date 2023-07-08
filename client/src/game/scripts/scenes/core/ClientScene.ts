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
    debugText;
    mobs = [];
    isPaused = true;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    init({ channel }: { channel?: ClientChannel }) {
        this.channel = channel;
    }

    async create() {
        super.create();

        this.soundManager = new SoundManager(this);
        this.player = await this.producePlayer();

        this.inputManager = new InputManager(this, this.player);

        this.soundManager.makeTarget(this.player);
        this.soundManager.addMusic(["track_1", "track_2", "track_3"], true);

        this.debugText = new GenericText(this, this.player).setDepth(1000);
        this.mobManager.spawnMobs(0, [this.player]);

        // Prevents shield from running away when ship hits the world bounds
        this.physics.world.on("worldbounds", (body) => {
            const UUID = body.gameObject.name.length >= 36 ? body.gameObject.name : undefined;
            if (UUID) {
                const collidingShip = this.children.getByName(UUID);
                if (collidingShip) {
                    // @ts-ignore
                    collidingShip.shields.x = collidingShip.x;
                    // @ts-ignore
                    collidingShip.shields.y = collidingShip.y;
                }
            }
        });
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

        return new Spaceship(serverOptions, {
            scene: this,
            soundManager: this.soundManager,
        });
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
