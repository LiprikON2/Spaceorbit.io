import Explosion from "./explosion";

export default class Spaceship extends Phaser.Physics.Arcade.Sprite {
    health;
    shields;
    speed;
    hitboxRadius;
    exhaustOrigins;
    halfWidth;
    halfHeight;
    exhaustEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
    laserSounds;
    exhaustSound;
    hitSounds;
    primaryFireRate = 600; // lower value makes faster fire rate
    lastFired = -Infinity;
    enemies;
    weaponsOrigins;
    exhaustTween;
    constructor(scene, x, y, atlasTexture, enemies = [], depth = 10) {
        super(scene, x, y, atlasTexture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const atlas = scene.textures.get(atlasTexture);
        this.enemies = enemies;
        this.hitboxRadius = atlas.customData["meta"].hitboxRadius;
        this.exhaustOrigins = atlas.customData["meta"].exhaustOrigins;
        this.weaponsOrigins = atlas.customData["meta"].weaponsOrigins;
        this.laserSounds = ["laser_sound_2", "laser_sound_1", "laser_sound_3"].map((sound) =>
            scene.sound.add(sound)
        );
        this.hitSounds = ["hit_sound_1", "hit_sound_2"].map((sound) => scene.sound.add(sound));
        this.exhaustSound = scene.sound.add("exhaust_sound_1");

        this.speed = atlas.customData["meta"].speed;
        // Each additional engine gives 20% speed boostdsds
        this.speed += 0.2 * this.speed * (this.exhaustOrigins.length - 1);
        this.health = atlas.customData["meta"].health;

        this.halfWidth = this.body.width / 2;
        this.halfHeight = this.body.height / 2;
        this.setCircularHitbox(this.hitboxRadius);

        const scale = atlas.customData["meta"].scale;
        this.setCollideWorldBounds(true).setScale(scale).setOrigin(0.5).setDepth(depth);

        // Create engine exhaust effect
        this.exhaustOrigins.forEach(() => {
            this.createExhaust();
        });
        this.updateExhaustPosition();
    }

    createExhaust() {
        const exhaustParticles = this.scene.add.particles("exhaust").setDepth(this.depth - 1);
        const exhaustEmitter = exhaustParticles.createEmitter({
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
            tint: 0x89c5f0,
            blendMode: "SCREEN",
        });
        exhaustEmitter.stop();

        this.exhaustEmitters.push(exhaustEmitter);
        this.initExhaustSound();
    }

    updateExhaustPosition() {
        this.exhaustEmitters.forEach((exhaustEmitter, index) => {
            const { offsetX, offsetY } = this.getRotatedPoint(this.exhaustOrigins[index]);
            // @ts-ignore
            exhaustEmitter.followOffset = { x: offsetX, y: offsetY };
        });
    }

    toggleExhaustSound() {
        if (this.exhaustEmitters[0].on) {
            this.exhaustTween.fadeIn.play();
        } else {
            this.exhaustTween.fadeOut.play();
        }
    }
    stopExhaust() {
        if (this.exhaustEmitters[0].on) {
            this.exhaustEmitters.forEach((exhaustEmitter) => exhaustEmitter.stop());
            this.toggleExhaustSound();
        }
    }

    initExhaustSound() {
        // Init exhaust sound and tween
        const pitch = Math.max((this.exhaustEmitters.length - 1) * -200, -2000);
        const maxVolume = 0.1;

        // The exhaust sound is constantly playing, tween just changes the volume
        this.exhaustSound.play({ detune: pitch, loop: true, volume: 0 });
        this.exhaustTween = {
            fadeIn: this.scene.tweens.add({
                targets: this.exhaustSound,
                volume: maxVolume,
                duration: 100,
                paused: 1,
            }),
            fadeOut: this.scene.tweens.add({
                targets: this.exhaustSound,
                volume: 0,
                duration: 100,
                paused: 1,
            }),
        };
    }
    startExhaust() {
        if (!this.exhaustEmitters[0].on) {
            this.exhaustEmitters.forEach((exhaustEmitter) => exhaustEmitter.start());
            this.toggleExhaustSound();
        }
    }

    setCircularHitbox(hitboxRadius) {
        this.body.setCircle(
            hitboxRadius,
            this.halfWidth - hitboxRadius,
            this.halfHeight - hitboxRadius
        );
    }
    getHit(projectile) {
        this.playRandomSound(this.hitSounds, -1);

        this.setTint(0xee4824);
        setTimeout(() => {
            this.clearTint();
        }, 200);

        if (projectile.name === "laser_beam") {
            this.health -= 1000;

            if (this.health <= 0) {
                this.health = 0;
                this.explode();
            }
        }
    }
    explode() {
        const explosionTop = new Explosion(
            this.scene,
            this.x,
            this.y,
            this.depth,
            4,
            "explosion_4"
        );
        const explosionBottom = new Explosion(
            this.scene,
            this.x,
            this.y,
            this.depth - 2,
            8,
            "explosion_1"
        );

        this.disableBody(true, false);

        setTimeout(() => {
            this.disableBody(true, true);
            // TODO dont destroy player...
            if (!"ai") {
                this.destroy();
            }
        }, 2000);
    }

    public create() {}
    public update() {}

    lookAtPoint(x, y) {
        const rotation = Phaser.Math.Angle.Between(this.x, this.y, x, y) + Math.PI / 2;

        this.setRotation(rotation);
        this.updateExhaustPosition();
    }

    playRandomSound(sounds, rareDistribution = 10) {
        // Bigger value makes rare sounds more rare
        const soundsCount = sounds.length;
        // Ensure there is enough sounds
        const randomSound = Phaser.Math.Between(1, Math.max(soundsCount, rareDistribution));

        // The more weapons are firing, the 'heavier' the firing sound is
        const pitch = Math.max((this.weaponsOrigins.length - 1) * -200, -2000);

        // Makes first (main) sound more likely to be played
        if (randomSound < rareDistribution - sounds.length - 1) {
            // Play main sound
            sounds[0].play({ detune: pitch });
        } else {
            // Play rare sound
            sounds[randomSound % sounds.length].play({ detune: pitch });
        }
    }

    getRotatedPoint(point, absolute = false) {
        // Distance from center of a ship to a point on a ship; Corresponds to Y
        const R = Phaser.Math.Distance.Between(this.halfWidth, this.halfHeight, point.x, point.y);

        // Corresponds to X
        const additionalRotation = Phaser.Math.Angle.Between(
            this.halfWidth,
            this.halfHeight,
            point.x,
            point.y
        );

        let offsetX;
        let offsetY;
        if (absolute) {
            // If needed absolute coordinates, use current position of a ship in a world as a circle origin
            offsetX = R * Math.cos(this.rotation + additionalRotation) + this.x;
            offsetY = R * Math.sin(this.rotation + additionalRotation) + this.y;
        } else {
            // Otherwise use relative to the sprite coordinates
            offsetX = R * Math.cos(this.rotation + additionalRotation);
            offsetY = R * Math.sin(this.rotation + additionalRotation);
        }
        return { offsetX, offsetY };
    }

    resetMovement() {
        this.setVelocity(0);
    }
    stoppedMoving() {
        this.stopExhaust();
    }
    moveUp() {
        if (this.active) {
            this.setVelocityY(-this.speed);
            this.startExhaust();
        }
    }
    moveDown() {
        if (this.active) {
            this.setVelocityY(this.speed);
            this.startExhaust();
        }
    }
    moveLeft() {
        if (this.active) {
            this.setVelocityX(-this.speed);
            this.startExhaust();
        }
    }
    moveRight() {
        if (this.active) {
            this.setVelocityX(this.speed);
            this.startExhaust();
        }
    }

    moveUpRight() {
        if (this.active) {
            this.setVelocityY(-this.speed * Math.cos(Math.PI / 4));
            this.setVelocityX(this.speed * Math.cos(Math.PI / 4));
            this.startExhaust();
        }
    }
    moveUpLeft() {
        if (this.active) {
            this.setVelocityY(-this.speed * Math.cos(Math.PI / 4));
            this.setVelocityX(-this.speed * Math.cos(Math.PI / 4));
            this.startExhaust();
        }
    }
    moveDownRight() {
        if (this.active) {
            this.setVelocityY(this.speed * Math.cos(Math.PI / 4));
            this.setVelocityX(this.speed * Math.cos(Math.PI / 4));
            this.startExhaust();
        }
    }
    moveDownLeft() {
        if (this.active) {
            this.setVelocityY(this.speed * Math.cos(Math.PI / 4));
            this.setVelocityX(-this.speed * Math.cos(Math.PI / 4));
            this.startExhaust();
        }
    }

    primaryFire(time) {
        if (this.active) {
            if (time - this.lastFired > this.primaryFireRate) {
                this.lastFired = time;
                this.playRandomSound(this.laserSounds);
                this.weaponsOrigins.forEach((weaponOrigin) => {
                    this.fireWeapon(weaponOrigin, false, true);
                });
            }
        }
    }

    fireWeapon(weaponOrigin, addShipMomentum = false, atCursor = false) {
        const projectileVelocity = 5000;
        const projectileDistance = 900000;
        const projectileLifespan = projectileDistance / projectileVelocity;

        const { offsetX, offsetY } = this.getRotatedPoint(weaponOrigin, true);

        let rotation;
        if (atCursor) {
            // If firing at a cursor, aim them to shoot at cursor
            const cursorX = this.scene.input.mousePointer.worldX;
            const cursorY = this.scene.input.mousePointer.worldY;
            const cursorRotation =
                Phaser.Math.Angle.Between(offsetX, offsetY, cursorX, cursorY) + Math.PI / 2;

            const maxTraverseAngle = Math.PI / 9;
            const angleOffset = Math.abs(
                Phaser.Math.Angle.ShortestBetween(
                    Phaser.Math.Angle.Wrap(cursorRotation),
                    this.rotation
                )
            );

            // Ensures you can't fire behind your back
            if (angleOffset > maxTraverseAngle) {
                rotation = this.rotation;
            } else {
                rotation = cursorRotation;
            }
        } else {
            // Else weapons are aimed with ship orientation
            rotation = this.rotation;
        }

        let velocityX, velocityY;
        if (addShipMomentum) {
            // Take ship velocity in asdccount for speed of the bullet
            const shipVelocityX = this.body.velocity.x;
            const shipVelocityY = this.body.velocity.y;
            velocityX = Math.sin(rotation) * projectileVelocity + shipVelocityX;
            velocityY = -Math.cos(rotation) * projectileVelocity + shipVelocityY;
        } else {
            velocityX = Math.sin(rotation) * projectileVelocity;
            velocityY = -Math.cos(rotation) * projectileVelocity;
        }

        const laserBeam = this.scene.physics.add
            .sprite(offsetX, offsetY, "laser_beam", 0)
            .setRotation(rotation - Math.PI / 2)
            .setScale(3, 1);

        const hitboxSize = 2;
        laserBeam
            .setCircle(
                hitboxSize,
                laserBeam.width / 2 - hitboxSize,
                laserBeam.height / 2 - hitboxSize
            )
            .setVelocity(velocityX, velocityY);
        laserBeam.name = "laser_beam";

        this.enemies.forEach((enemy) => {
            this.scene.physics.add.overlap(enemy, laserBeam, () => {
                enemy.getHit(laserBeam);
                laserBeam.destroy();
            });
        });

        setTimeout(() => {
            laserBeam.destroy();
        }, projectileLifespan);
    }
}
