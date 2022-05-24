import Explosion from "./explosion";
import Exhaust from "./exhaust";

export default class Spaceship extends Phaser.Physics.Arcade.Sprite {
    halfWidth: number;
    halfHeight: number;
    primaryFireRate = 600; // lower value makes faster fire rate
    lastFired = -Infinity;
    enemies;
    // weaponsOrigins: { x: number; y: number }[];
    modules;
    baseSpecs;
    sounds;
    exhaust: Exhaust;
    constructor(scene, x, y, atlasTexture, enemies = [], depth = 10) {
        super(scene, x, y, atlasTexture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const atlas = scene.textures.get(atlasTexture);
        const scale = atlas.customData["meta"].scale;
        this.setCollideWorldBounds(true).setScale(scale).setOrigin(0.5).setDepth(depth);

        this.baseSpecs = atlas.customData["meta"].baseSpecs;
        this.modules = atlas.customData["meta"].modules;

        // Add ship sounds
        // @ts-ignore
        this.scene.soundManager.addSounds("laser", [
            "laser_sound_2",
            "laser_sound_1",
            "laser_sound_3",
        ]);
        // @ts-ignore
        this.scene.soundManager.addSounds("hit", ["hit_sound_1", "hit_sound_2"]);
        // @ts-ignore
        this.scene.soundManager.addSounds("exhaust", ["exhaust_sound_1"]);

        this.halfWidth = this.body.width / 2;
        this.halfHeight = this.body.height / 2;
        this.setCircularHitbox(this.baseSpecs.hitboxRadius);

        this.exhaust = new Exhaust(scene, this, this.modules.exhaustOrigins, depth);
        this.enemies = enemies;
    }

    getSpeed() {
        // Each additional engine gives 20% speed boost
        const speed = this.baseSpecs.speed;
        const countOfAdditionalEngines = this.modules.exhaustOrigins.length - 1; // todo add/remove count engines

        return 0.2 * speed * countOfAdditionalEngines + speed;
    }

    setCircularHitbox(hitboxRadius) {
        this.body.setCircle(
            hitboxRadius,
            this.halfWidth - hitboxRadius,
            this.halfHeight - hitboxRadius
        );
    }
    getHit(projectile) {
        // @ts-ignore
        this.scene.soundManager.play("hit", {
            sourceX: this.x,
            sourceY: this.y,
            volume: 0.2,
        });

        this.setTint(0xee4824);
        setTimeout(() => {
            this.clearTint();
        }, 200);

        if (projectile.name === "laser_beam") {
            this.baseSpecs.health -= 1000;

            if (this.baseSpecs.health <= 0) {
                this.baseSpecs.health = 0;
                this.explode();
            }
        }
    }
    explode() {
        this.disableBody(true, false);

        new Explosion(this.scene, this.x, this.y, this.depth, {
            double: true,
        });

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
        this.exhaust.updateExhaustPosition();
    }

    getLaserCount() {
        return this.modules.weaponsOrigins.length;
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
        this.exhaust.stopExhaust();
    }
    moveUp() {
        if (this.active) {
            this.setVelocityY(-this.getSpeed());
            this.exhaust.startExhaust();
        }
    }
    moveDown() {
        if (this.active) {
            this.setVelocityY(this.getSpeed());
            this.exhaust.startExhaust();
        }
    }
    moveLeft() {
        if (this.active) {
            this.setVelocityX(-this.getSpeed());
            this.exhaust.startExhaust();
        }
    }
    moveRight() {
        if (this.active) {
            this.setVelocityX(this.getSpeed());
            this.exhaust.startExhaust();
        }
    }

    moveUpRight() {
        if (this.active) {
            this.setVelocityY(-this.getSpeed() * Math.cos(Math.PI / 4));
            this.setVelocityX(this.getSpeed() * Math.cos(Math.PI / 4));
            this.exhaust.startExhaust();
        }
    }
    moveUpLeft() {
        if (this.active) {
            this.setVelocityY(-this.getSpeed() * Math.cos(Math.PI / 4));
            this.setVelocityX(-this.getSpeed() * Math.cos(Math.PI / 4));
            this.exhaust.startExhaust();
        }
    }
    moveDownRight() {
        if (this.active) {
            this.setVelocityY(this.getSpeed() * Math.cos(Math.PI / 4));
            this.setVelocityX(this.getSpeed() * Math.cos(Math.PI / 4));
            this.exhaust.startExhaust();
        }
    }
    moveDownLeft() {
        if (this.active) {
            this.setVelocityY(this.getSpeed() * Math.cos(Math.PI / 4));
            this.setVelocityX(-this.getSpeed() * Math.cos(Math.PI / 4));
            this.exhaust.startExhaust();
        }
    }

    primaryFire(time) {
        if (this.active) {
            // Check if enough time passed since last shot
            if (time - this.lastFired > this.primaryFireRate) {
                this.lastFired = time;
                // @ts-ignore
                this.scene.soundManager.play("laser", {
                    sourceX: this.x,
                    sourceY: this.y,
                    pitchPower: this.getLaserCount(),
                    random: true,
                });

                this.modules.weaponsOrigins.forEach((weaponOrigin) => {
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
