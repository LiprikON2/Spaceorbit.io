export default class Spaceship extends Phaser.Physics.Arcade.Sprite {
    health;
    shields;
    speed;
    hitboxRadius;
    exhaustOrigin;
    halfWidth;
    halfHeight;
    exhaustEmitter;
    laserSounds;
    primaryFireRate = 250; // 200 -- 600 (lower value makes faster fire rate)
    lastFired = -Infinity;
    constructor(scene, x, y, atlasTexture, depth = 10) {
        super(scene, x, y, atlasTexture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const atlas = scene.textures.get(atlasTexture);
        this.hitboxRadius = atlas.customData["meta"].hitboxRadius;
        this.speed = atlas.customData["meta"].speed + 200;
        this.health = atlas.customData["meta"].health;
        this.exhaustOrigin = atlas.customData["meta"].exhaustOrigin;
        (this.laserSounds = ["laser_sound_2", "laser_sound_1", "laser_sound_3"].map((sound) => {
            return scene.sound.add(sound);
        })),
            console.log("this.laserSounds", this.laserSounds);

        this.halfWidth = this.body.width / 2;
        this.halfHeight = this.body.height / 2;
        this.setCircularHitbox(this.hitboxRadius);

        const scale = atlas.customData["meta"].scale;
        this.setCollideWorldBounds(true).setScale(scale).setOrigin(0.5).setDepth(depth);

        const exhaustParticles = this.scene.add.particles("exhaust").setDepth(depth - 1);
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
            tint: 0x89c5f0,
            blendMode: "SCREEN",
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
        this.exhaustEmitter.stop();
    }
    moveUp() {
        this.setVelocityY(-this.speed);
        this.exhaustEmitter.start();
    }
    moveDown() {
        this.setVelocityY(this.speed);
        this.exhaustEmitter.start();
    }
    moveLeft() {
        this.setVelocityX(-this.speed);
        this.exhaustEmitter.start();
    }
    moveRight() {
        this.setVelocityX(this.speed);
        this.exhaustEmitter.start();
    }

    moveUpRight() {
        this.setVelocityY(-this.speed * Math.cos(Math.PI / 4));
        this.setVelocityX(this.speed * Math.cos(Math.PI / 4));
        this.exhaustEmitter.start();
    }
    moveUpLeft() {
        this.setVelocityY(-this.speed * Math.cos(Math.PI / 4));
        this.setVelocityX(-this.speed * Math.cos(Math.PI / 4));
        this.exhaustEmitter.start();
    }
    moveDownRight() {
        this.setVelocityY(this.speed * Math.cos(Math.PI / 4));
        this.setVelocityX(this.speed * Math.cos(Math.PI / 4));
        this.exhaustEmitter.start();
    }
    moveDownLeft() {
        this.setVelocityY(this.speed * Math.cos(Math.PI / 4));
        this.setVelocityX(-this.speed * Math.cos(Math.PI / 4));
        this.exhaustEmitter.start();
    }

    fireLaser() {
        // Bigger value makes rare sounds more rare
        const rareSoundChance = 10;
        const soundsCount = this.laserSounds.length;
        // Ensure there is enough sounds
        const randomSound = Phaser.Math.Between(1, Math.max(soundsCount, rareSoundChance));

        // Makes first (main) sound more likely to be played
        if (randomSound < rareSoundChance - this.laserSounds.length - 1) {
            // Play main sound
            this.laserSounds[0].play();
        } else {
            // Play rare sound
            console.log(
                "randomSound",
                randomSound,
                "randomSound % this.laserSounds.length",
                randomSound % this.laserSounds.length
            );
            this.laserSounds[randomSound % this.laserSounds.length].play();
        }

        const projectileVelocity = 2000;

        const shipVelocityX = this.body.velocity.x;
        const shipVelocityY = this.body.velocity.y;
        // Take ship velocity in account for speed of the bullet
        const velocityX = Math.sin(this.rotation) * projectileVelocity + shipVelocityX;
        const velocityY = Math.cos(this.rotation) * -projectileVelocity + shipVelocityY;

        const laserBeam = this.scene.physics.add
            .sprite(this.x, this.y, "laser_beam", 0)
            .setRotation(this.rotation - Math.PI / 2)
            .setScale(3, 1)
            .setOrigin(0.3, 0.5)
            .setVelocity(velocityX, velocityY);

        setTimeout(() => {
            laserBeam.destroy();
        }, 1000);
    }

    primaryFire(time) {
        if (time - this.lastFired > this.primaryFireRate) {
            this.lastFired = time;
            this.fireLaser();
        }
    }
}
