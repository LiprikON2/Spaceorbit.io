export default class Shield extends Phaser.Physics.Arcade.Sprite {
    scene;
    ship;
    tween: { fadeIn: any; fadeOut: any } = { fadeIn: undefined, fadeOut: undefined };
    constructor(scene, ship) {
        super(scene, ship.x, ship.y, "shield");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.ship = ship;

        const scale = 0.7;
        const shieldHitboxRadius = (ship.baseSpecs.hitboxRadius / 0.7) * 1.5;
        this.setOrigin(0.5)
            .setDepth(ship.depth + 1)
            .setScale(scale)
            .setAlpha(0);

        this.body.setCircle(
            shieldHitboxRadius,
            this.width / 2 - shieldHitboxRadius,
            this.height / 2 - shieldHitboxRadius
        );
        this.tween.fadeIn = scene.tweens.add({
            targets: this,
            alphaTopLeft: { value: 1, duration: 500, ease: "Power1" },
            alphaBottomRight: { value: 1, duration: 1000, ease: "Power1" },
            alphaBottomLeft: { value: 1, duration: 500, ease: "Power1", delay: 500 },
        });
        this.tween.fadeOut = scene.tweens.add({
            targets: this,
            alphaTopLeft: { value: 0, duration: 500, ease: "Power1" },
            alphaBottomRight: { value: 0, duration: 1000, ease: "Power1" },
            alphaBottomLeft: { value: 0, duration: 500, ease: "Power1", delay: 500 },
        });
    }
}
