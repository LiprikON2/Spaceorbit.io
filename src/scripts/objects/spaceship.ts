export default class Spaceship extends Phaser.Physics.Arcade.Sprite {
    health;
    shields;
    speed;
    hitboxRadius;
    exhaustOrigin;
    halfWidth;
    halfHeight;
    exhaustEmitter;
    constructor(scene, x, y, atlasTexture) {
        super(scene, x, y, atlasTexture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const atlas = scene.textures.get(atlasTexture);
        this.hitboxRadius = atlas.customData["meta"].hitboxRadius;
        this.speed = atlas.customData["meta"].speed;
        this.health = atlas.customData["meta"].health;
        this.exhaustOrigin = atlas.customData["meta"].exhaustOrigin;
        const scale = atlas.customData["meta"].scale;

        this.halfWidth = this.body.width / 2;
        this.halfHeight = this.body.height / 2;
        this.setCircularHitbox(this.hitboxRadius);
        this.setCollideWorldBounds(true).setScale(scale).setOrigin(0.5);

        const exhaustParticles = this.scene.add.particles("exhaust");
        this.exhaustEmitter = exhaustParticles.createEmitter({
            x: 0,
            y: 0,
            quantity: 5,
            frequency: 1,
            scale: { start: 0.1, end: 0.06 },
            lifespan: { min: 100, max: 300 },
            alpha: { start: 0.5, end: 0, ease: "Sine.easeIn" },
            radial: true,
            rotate: { min: -180, max: 180 },
            angle: { min: 30, max: 110 },
            follow: this,
            followOffset: {
                x: -this.halfWidth + this.exhaustOrigin.x,
                y: -this.halfHeight + this.exhaustOrigin.y,
            },
            blendMode: "SCREEN",
            tint: 0x89c5f0,
        });
    }

    setCircularHitbox(hitboxRadius) {
        this.body.setCircle(
            hitboxRadius,
            this.halfWidth - hitboxRadius,
            this.halfHeight - hitboxRadius
        );
        // this.body.setSize(50, 50);
        // this.body.setOffset(12, 5);
    }
    getHit() {
        this.setTint(0xee4824);
        setTimeout(() => {
            this.clearTint();
        }, 200);
    }
    public create() {}
    public update() {}

    lookAtPoint(x, y) {
        const rotation = Phaser.Math.Angle.Between(this.x, this.y, x, y);
        this.updateExhaustPosition(rotation);

        const angle = Phaser.Math.RAD_TO_DEG * rotation + 90;
        this.setAngle(angle);
    }
    updateExhaustPosition(rotation) {
        const R = this.halfHeight - this.exhaustOrigin.y;
        const offsetX = R * Math.cos(rotation);
        const offsetY = R * Math.sin(rotation);
        this.exhaustEmitter.followOffset = { x: offsetX, y: offsetY };
    }

    stopMoving() {
        this.setVelocity(0);
    }
    moveUp() {
        this.setVelocityY(-this.speed);
    }
    moveDown() {
        this.setVelocityY(this.speed);
    }
    moveLeft() {
        this.setVelocityX(-this.speed);
    }
    moveRight() {
        this.setVelocityX(this.speed);
    }

    moveUpRight() {
        this.setVelocityY(-this.speed * Math.cos(Math.PI / 4));
        this.setVelocityX(this.speed * Math.cos(Math.PI / 4));
    }
    moveUpLeft() {
        this.setVelocityY(-this.speed * Math.cos(Math.PI / 4));
        this.setVelocityX(-this.speed * Math.cos(Math.PI / 4));
    }
    moveDownRight() {
        this.setVelocityY(this.speed * Math.cos(Math.PI / 4));
        this.setVelocityX(this.speed * Math.cos(Math.PI / 4));
    }
    moveDownLeft() {
        this.setVelocityY(this.speed * Math.cos(Math.PI / 4));
        this.setVelocityX(-this.speed * Math.cos(Math.PI / 4));
    }

    shoot() {
        this.getHit();
        // Generates an "arrow" sprite
        const graphics = this.scene.add.graphics();
        graphics.setVisible(false);
        graphics.fillStyle(0x00ff00, 1);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        graphics.lineTo(60, 0);
        graphics.lineTo(60, 20);
        graphics.lineTo(0, 20);
        graphics.lineTo(0, 0);
        graphics.fillPath();
        graphics.generateTexture("sprite", 60, 40);

        const bulletVelocity = 2000;
        const shipVelocityX = this.body.velocity.x;
        const shipVelocityY = this.body.velocity.y;
        const velocityX = Math.sin(this.rotation) * bulletVelocity + shipVelocityX;
        const velocityY = Math.cos(this.rotation) * -bulletVelocity + shipVelocityY;

        this.scene.physics.add
            .sprite(this.x, this.y, "sprite")
            .setRotation(this.rotation - Math.PI / 2)
            .setScale(0.5)
            .setOrigin(0.5)
            .setVelocity(velocityX, velocityY);
    }
}
