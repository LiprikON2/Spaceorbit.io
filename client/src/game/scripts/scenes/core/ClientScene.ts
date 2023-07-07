import type { ClientChannel } from "@geckos.io/client";

import { InputManager, SoundManager } from "~/managers";
import { Spaceship, GenericText } from "~/objects";
import { BaseScene } from ".";

export class ClientScene extends BaseScene {
    channel?: ClientChannel;

    inputManager: InputManager;
    soundManager: SoundManager;
    player: Spaceship;
    background;
    debugText;
    mobs = [];
    didCreateFinish = false;

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
        this.didCreateFinish = true;
    }

    update(time: number, delta: number) {
        // Since create() is async, update() is called before create() finishes
        if (this.didCreateFinish) {
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
        if (this.isSingleplayer) {
            return this.createPlayer();
        } else {
            return this.#requestPlayer();
        }
    }

    async #requestPlayer(): Promise<Spaceship> {
        this.channel.emit("requestPlayer", { reliable: true });
        return new Promise((resolve) => {
            this.channel.on("createPlayer", (player) => {
                resolve(player as Spaceship);
            });
        });
    }
}
