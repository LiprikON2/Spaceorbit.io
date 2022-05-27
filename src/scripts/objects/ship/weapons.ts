export default class Weapons {
    scene;
    ship;
    exhaustEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
    exhaustCount = 0;
    // delay = 1000/fps
    primaryFireRate = 600;
    lastFired = -Infinity;
    weaponSlots: {
        x: number;
        y: number;
        type: string;
        id: number;
        fireRate: number;
        lastFired: number;
    }[];

    constructor(scene, ship, weaponOrigins) {
        this.scene = scene;
        this.ship = ship;
        // Sort by x value, from lowest to highest; add type, id, fireRate
        this.weaponSlots = weaponOrigins
            .sort(({ x: a }, { x: b }) => a - b)
            .map((origin, index) => ({
                ...origin,
                type: "empty",
                id: index,
                fireRate: 0,
                lastFired: -Infinity,
            }));
        this.scene.soundManager.addSounds("laser", [
            "laser_sound_2",
            "laser_sound_1",
            "laser_sound_3",
        ]);

        const middleSlot = Math.floor((this.weaponSlots.length - 1) / 2);
        this.createLaser(middleSlot);
    }

    createLaser(slot) {
        this.weaponSlots[slot].type = "laser";
        this.weaponSlots[slot].fireRate = 600;
    }

    getInstalledWeapons(type) {
        return this.weaponSlots.filter((slot) => slot.type === type);
    }

    primaryFire(time, cursor?: { cursorX: number; cursorY: number }) {
        this.fireAll("laser", time, cursor);
    }
    fireAll(type, time, cursor?: { cursorX: number; cursorY: number }) {
        let playedSound = false;
        const weapons = this.getInstalledWeapons(type);

        weapons.forEach((weapon) => {
            if (time - weapon.lastFired > weapon.fireRate) {
                // Check if enough time passed since last shot
                this.shootProjectile(weapon, false, cursor);
                // Update cooldown
                this.weaponSlots[weapon.id].lastFired = time;
                // Play the apropriate sound one time, regardless of the amount of weapons
                if (!playedSound) {
                    this.scene.soundManager.play(type, {
                        sourceX: this.ship.x,
                        sourceY: this.ship.y,
                        pitchPower: weapons.length,
                        random: true,
                    });
                    playedSound = true;
                }
            }
        });
    }

    shootProjectile(
        weapon,
        addShipMomentum = false,
        cursor?: { cursorX: number; cursorY: number }
    ) {
        const projectileVelocity = 5000;
        const projectileDistance = 900000;
        const projectileLifespan = projectileDistance / projectileVelocity;

        const { offsetX, offsetY } = this.ship.getRotatedPoint(weapon, true);

        let rotation;
        if (cursor) {
            // If firing at a cursor, aim them to shoot at cursor
            const { cursorX, cursorY } = cursor;
            const cursorRotation =
                Phaser.Math.Angle.Between(offsetX, offsetY, cursorX, cursorY) + Math.PI / 2;
            const maxTraverseAngle = Math.PI / 9;
            let angleOffset = Math.abs(
                Phaser.Math.Angle.ShortestBetween(
                    Phaser.Math.Angle.Wrap(cursorRotation),
                    this.ship.rotation
                )
            );
            // Dirty fix for aiming at the bottom of the screen (351 deg -> 9 deg)
            if (angleOffset > Math.PI) {
                angleOffset = 2 * Math.PI - angleOffset;
            }
            if (angleOffset > maxTraverseAngle) {
                // Ensures you can't fire behind your back
                rotation = this.ship.rotation;
            } else {
                rotation = cursorRotation;
            }
        } else {
            // Else weapons are aimed with ship orientation
            rotation = this.ship.rotation;
        }

        let velocityX, velocityY;
        if (addShipMomentum) {
            // Take ship velocity in asdccount for speed of the bullet
            const shipVelocityX = this.ship.body.velocity.x;
            const shipVelocityY = this.ship.body.velocity.y;
            velocityX = Math.sin(rotation) * projectileVelocity + shipVelocityX;
            velocityY = -Math.cos(rotation) * projectileVelocity + shipVelocityY;
        } else {
            velocityX = Math.sin(rotation) * projectileVelocity;
            velocityY = -Math.cos(rotation) * projectileVelocity;
        }

        const laserBeam = this.scene.physics.add
            .sprite(offsetX, offsetY, weapon.type, 0)
            .setRotation(rotation - Math.PI / 2)
            .setScale(3, 1);
        laserBeam.name = weapon.type;

        const hitboxSize = 2;
        laserBeam
            .setCircle(
                hitboxSize,
                laserBeam.width / 2 - hitboxSize,
                laserBeam.height / 2 - hitboxSize
            )
            .setVelocity(velocityX, velocityY);

        this.ship.enemies.forEach((enemy) => {
            this.scene.physics.add.overlap(enemy, laserBeam, () => {
                enemy.getHit(laserBeam);
                laserBeam.destroy();
            });
        });

        this.scene.time.delayedCall(projectileLifespan, () => laserBeam.destroy());
    }
}
