export default class Explosion extends Phaser.GameObjects.Sprite {
    explosionSound;
    constructor(scene, x, y, targetDepth, options) {
        const defaults = {
            keys: ["explosion_1", "explosion_2", "explosion_3", "explosion_4"],
            scale: 2,
            double: false,
        };
        const mergedOptions = Object.assign({}, defaults, options);

        super(scene, x, y, mergedOptions.keys[0]);
        scene.add.existing(this);

        console.log("mergedOptions", mergedOptions, mergedOptions.keys.at(-1));
        this.setDepth(targetDepth + 1);
        this.setScale(mergedOptions.scale);
        this.setAngle(Phaser.Math.Angle.Random());

        const explosionSound = scene.sound.add("explosion_sound_1");

        if (mergedOptions.double) {
            this.doublyExplode(scene, x, y, targetDepth, mergedOptions);
        }
        this.explode(explosionSound, mergedOptions.keys.at(-1));
    }

    explode(sound, key) {
        sound.play();
        this.play(`${key}-anim`);

        this.on("animationcomplete", () => {
            this.destroy();
        });
    }

    doublyExplode(scene, x, y, targetDepth, options) {
        const underExplosion = {
            keys: [options.keys[0]],
            scale: options.scale + 2,
            double: false,
        };
        new Explosion(scene, x, y, targetDepth - 1, underExplosion);
    }
}
