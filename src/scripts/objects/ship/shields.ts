export default class Shields extends Phaser.Physics.Arcade.Sprite {
    scene;
    ship;
    UUID;
    lastHit: number = -Infinity;
    moveToPlugin;
    tweenFade;
    constructor(scene, ship) {
        super(scene, ship.x, ship.y, "shield");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.ship = ship;
        this.UUID = ship.UUID;
        const scale = 0.7;
        const shieldHitboxRadius = (ship.baseSpecs.hitboxRadius / 0.7) * 1.5;
        this.setOrigin(0.5)
            .setDepth(ship.depth + 1)
            .setScale(scale)
            .setAlpha(0, 0.1, 0, 0);

        this.body.setCircle(
            shieldHitboxRadius,
            this.width / 2 - shieldHitboxRadius,
            this.height / 2 - shieldHitboxRadius
        );
        this.tweenFade = scene.tweens.add({
            targets: this,
            alphaTopLeft: { value: 1, duration: 500, ease: "Power1" },
            alphaBottomRight: { value: 1, duration: 1000, ease: "Power1" },
            alphaBottomLeft: { value: 1, duration: 500, ease: "Power1", delay: 500 },
            yoyo: true,
        });
        this.scene.soundManager.addSounds("shield", ["shield_sound_1"]);
        this.scene.soundManager.addSounds("shield_down", ["shield_down_sound_1"]);

        this.moveToPlugin = scene.plugins.get("rexMoveTo").add(this);
    }

    moveTo(x, y) {
        this.moveToPlugin.setSpeed(this.ship.getSpeed());
        this.moveToPlugin.moveTo(x, y);
    }

    getHit() {
        if (!this.tweenFade.isPlaying()) {
            this.tweenFade.play();
            this.scene.soundManager.play("shield", {
                sourceX: this.x,
                sourceY: this.y,
                volume: 1,
            });
        }
    }
    disable() {
        // TODO crack sound
        this.disableBody(true, true);
        this.scene.soundManager.play("shield_down", {
            sourceX: this.x,
            sourceY: this.y,
            volume: 0.3,
        });
    }
}
