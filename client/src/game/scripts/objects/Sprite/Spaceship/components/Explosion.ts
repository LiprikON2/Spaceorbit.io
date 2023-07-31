import type { SoundManager } from "~/game/managers/SoundManager/SoundManager";
import type { BaseScene } from "~/game/scenes/core/BaseScene";

type ExplosionConfig = {
    keys?: string[];
    scale?: number;
    silent?: boolean;
    double?: boolean;
    doubleDiff?: number;
};

// TODO add more variety

export class Explosion extends Phaser.GameObjects.Sprite {
    scene: BaseScene;
    explosionSound: Phaser.Sound.BaseSound;
    soundManager: SoundManager;
    options: ExplosionConfig;

    constructor(
        scene: BaseScene,
        x: number,
        y: number,
        targetDepth: number,
        soundManager: SoundManager,
        options?: ExplosionConfig
    ) {
        const defaults = {
            keys: ["explosion_1", "explosion_2", "explosion_3", "explosion_4"],
            scale: 2,
            silent: false,
            double: false,
            doubleDiff: 2,
        };
        const mergedOptions = Object.assign({}, defaults, options);

        super(scene, x, y, mergedOptions.keys[0]);
        scene.add.existing(this);

        this.options = mergedOptions;

        this.soundManager = soundManager;

        this.setDepth(targetDepth + 1);
        this.setScale(mergedOptions.scale);
        this.setAngle(Phaser.Math.Angle.Random());

        const { silent, double } = this.options;
        if (!silent) {
            soundManager.addSounds("explosion", ["explosion_sound_1"]);
            // @ts-ignore
            soundManager.play("explosion", { sourceX: x, sourceY: y });
        }
        if (double) {
            this.doublyExplode(scene, x, y, targetDepth);
        }
        this.explode(mergedOptions.keys.at(-1));
    }

    explode(key?: string) {
        this.play(`${key}-anim`);

        this.on("animationcomplete", () => {
            this.destroy();
        });
    }

    doublyExplode(scene: BaseScene, x: number, y: number, targetDepth: number) {
        const underTargetExplosionConf = {
            // @ts-ignore
            keys: [this.options.keys[0]],
            scale: (this.options.scale ?? 0) + (this.options.doubleDiff ?? 0) ?? 1,
            silent: true,
            double: false,
        };

        new Explosion(scene, x, y, targetDepth - 1, this.soundManager, underTargetExplosionConf);
    }
}
