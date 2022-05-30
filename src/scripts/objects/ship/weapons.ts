export default class Weapons {
    scene;
    ship;
    exhaustEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
    exhaustCount = 0;
    // delay = 1000/fps
    primaryFireRate = 600;
    weaponSlots: {
        x: number;
        y: number;
        type: string;
        id: number;
        cooldownTime: number;
        lastFired: number;
        projectileVelocity: number;
        projectileDamage: number;
        projectileScale: { x: number; y: number };
    }[];

    constructor(scene, ship, weaponOrigins) {
        this.scene = scene;
        this.ship = ship;
        // Sort by x value, from lowest to highest
        this.weaponSlots = weaponOrigins
            .sort(({ x: a }, { x: b }) => a - b)
            .map((origin, index) => ({
                ...origin,
                type: "empty",
                id: index,
                cooldownTime: 0,
                lastFired: -Infinity,
                projectileVelocity: 0,
                projectileDamage: 0,
                projectileScale: { x: 1, y: 1 },
            }));
        this.scene.soundManager.addSounds("laser", [
            "laser_sound_2",
            "laser_sound_1",
            "laser_sound_3",
        ]);
        this.scene.soundManager.addSounds("gatling", ["gatling_sound_1"]);

        const middleSlot = Math.floor((this.weaponSlots.length - 1) / 2);
        this.createLaser(middleSlot);
    }

    createLaser(slot) {
        this.weaponSlots[slot].type = "laser";
        this.weaponSlots[slot].cooldownTime = 600;
        this.weaponSlots[slot].projectileVelocity = 5000;
        this.weaponSlots[slot].projectileDamage = 1000;
        this.weaponSlots[slot].projectileScale = { x: 3, y: 1 };

        // DPS = 1000 * (1000 / 600) = 1666 damage per second
    }

    createGatling(slot) {
        this.weaponSlots[slot].type = "gatling";
        this.weaponSlots[slot].cooldownTime = 100;
        this.weaponSlots[slot].projectileVelocity = 1200;
        this.weaponSlots[slot].projectileDamage = 200;
        this.weaponSlots[slot].projectileScale = { x: 0.4, y: 0.4 };

        // DPS = 166 * (1000 / 100) = 2000 damage per second
    }

    getInstalledWeapons(type) {
        return this.weaponSlots.filter((slot) => slot.type === type);
    }

    primaryFire(time, cursor?: { cursorX: number; cursorY: number }) {
        this.fireAll("laser", time, cursor);
        this.fireAll("gatling", time, cursor);
    }
    fireAll(type, time, cursor?: { cursorX: number; cursorY: number }) {
        let playedSound = false;
        const weapons = this.getInstalledWeapons(type);
        const toAddShipMomentum = type === "gatling";

        weapons.forEach((weapon) => {
            if (time - weapon.lastFired > weapon.cooldownTime) {
                // Check if enough time passed since last shot
                this.shootProjectile(weapon, toAddShipMomentum, cursor);
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
        const projectileVelocity = weapon.projectileVelocity;
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

        const projectile = this.scene.physics.add
            .sprite(offsetX, offsetY, weapon.type, 0)
            .setRotation(rotation - Math.PI / 2)
            .setScale(weapon.projectileScale.x, weapon.projectileScale.y);
        projectile.weapon = weapon;

        const hitboxSize = 2;
        projectile
            .setCircle(
                hitboxSize,
                projectile.width / 2 - hitboxSize,
                projectile.height / 2 - hitboxSize
            )
            .setVelocity(velocityX, velocityY);

        this.ship.enemies.forEach((enemy) => {
            this.scene.physics.add.overlap(enemy, projectile, () => {
                enemy.getHit(projectile);
                projectile.destroy();
            });
            this.scene.physics.add.overlap(enemy.shields, projectile, () => {
                if (enemy.status.shields > 0) {
                    enemy.getHit(projectile);
                    projectile.destroy();
                    // console.log(projectile);
                }
            });
        });

        this.scene.time.delayedCall(projectileLifespan, () => projectile.destroy());
    }
}
