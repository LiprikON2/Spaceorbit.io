export default class Explosion extends Phaser.GameObjects.Sprite {
    explosionSound;

    constructor(scene, x, y, depth, scale = 5, key = "explosion_1") {
        super(scene, x, y, key);
        scene.add.existing(this);
        this.setDepth(depth + 1);
        this.setScale(scale);
        this.setAngle(Phaser.Math.Angle.Random());
        // if (key === "explosion_1") this.setTint(0x53b2bd);

        this.explosionSound = scene.sound.add("explosion_sound_1");

        this.explosionSound.play();
        this.play(`${key}-anim`);
    }
}
