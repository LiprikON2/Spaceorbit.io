export default class Explosion extends Phaser.GameObjects.Sprite {
    explosionSound: Phaser.Sound.BaseSound;
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        targetDepth: number,
        options?: { keys?: string[]; scale?: number; double?: boolean; doubleDiff?: number }
    ) {
        const defaults = {
            keys: ["explosion_1", "explosion_2", "explosion_3", "explosion_4"],
            scale: 2,
            double: false,
            doubleDiff: 2,
        };
        const mergedOptions = Object.assign({}, defaults, options);

        super(scene, x, y, mergedOptions.keys[0]);
        scene.add.existing(this);

        this.setDepth(targetDepth + 1);
        this.setScale(mergedOptions.scale);
        this.setAngle(Phaser.Math.Angle.Random());

        const explosionSound = scene.sound.add("explosion_sound_1");

        if (mergedOptions.double) {
            this.doublyExplode(scene, x, y, targetDepth, mergedOptions);
        }
        this.explode(explosionSound, mergedOptions.keys.at(-1));
    }

    explode(sound: Phaser.Sound.BaseSound, key?: string) {
        sound.play();
        this.play(`${key}-anim`);

        this.on("animationcomplete", () => {
            this.destroy();
        });
    }

    doublyExplode(scene: any, x: any, y: any, targetDepth: number, options) {
        const underExplosion = {
            keys: [options.keys[0]],
            scale: options.scale + options.doubleDiff,
            double: false,
        };
        new Explosion(scene, x, y, targetDepth - 1, underExplosion);
    }
}
