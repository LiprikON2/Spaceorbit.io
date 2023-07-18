import type { BaseScene } from "~/game/scenes/core/BaseScene";
import type { Spaceship } from "./Spaceship";

type WeaponType = "laser" | "gatling" | null;

export default class Weapons {
    scene: BaseScene;
    ship: Spaceship;
    // delay = 1000/fps
    primaryFireRate = 600;
    weaponSlots: {
        x: number;
        y: number;
        type: WeaponType;
        id: number;
        cooldownTime: number;
        lastFired: number;
        projectileVelocity: number;
        projectileDamage: number;
        projectileScale: { x: number; y: number };
        multiplier: number;
    }[];
    projectileGroup;

    multiplier = 1;
    constructor(scene: BaseScene, ship: Spaceship, weaponOrigins, multiplier?: number) {
        this.scene = scene;
        this.ship = ship;
        this.multiplier = multiplier;
        // Sort by x value, from lowest to highest
        this.weaponSlots = weaponOrigins
            .sort(({ x: x1 }, { x: x2 }) => x1 - x2)
            .map((origin, index) => ({
                ...origin,
                type: null,
                id: index,
                cooldownTime: 0,
                lastFired: -Infinity,
                projectileVelocity: 0,
                projectileDamage: 0,
                projectileScale: { x: 1, y: 1 },
            }));
        if (this.ship.soundManager) {
            this.ship.soundManager.addSounds("laser", [
                "laser_sound_2",
                "laser_sound_1",
                "laser_sound_3",
            ]);
            this.ship.soundManager.addSounds("gatling", ["gatling_sound_1"]);
        }

        const middleSlot = Math.floor((this.getSlotCount() - 1) / 2);
        this.createLaser(middleSlot);

        this.projectileGroup = this.scene.add.group();
    }

    getSlotCount() {
        return this.weaponSlots.length;
    }

    getWeaponCount() {
        return this.weaponSlots.filter((slot) => slot.type !== null).length;
    }
    getWeaponsOfType(type: WeaponType) {
        return this.weaponSlots.filter((slot) => slot.type === type);
    }

    placeWeapon(type, slot) {
        let doesFit = false;
        if (slot <= this.getSlotCount() - 1) {
            if (type === "laser") {
                this.createLaser(slot);
                doesFit = true;
            } else if (type === "gatling") {
                this.createGatling(slot);
                doesFit = true;
            } else if (!type) {
                this.clearSlot(slot);
            }
        }

        return doesFit;
    }

    createLaser(slot) {
        this.weaponSlots[slot] = {
            ...this.weaponSlots[slot],
            type: "laser",
            cooldownTime: 600,
            projectileVelocity: 5000,
            projectileDamage: 1000,
            projectileScale: { x: 3, y: 1 },
            multiplier: this.multiplier,
        };

        // DPS = 1000 * (1000 / 600) = 1666 damage per second
    }

    createGatling(slot) {
        this.weaponSlots[slot] = {
            ...this.weaponSlots[slot],
            type: "gatling",
            cooldownTime: 100,
            projectileVelocity: 1200,
            projectileDamage: 200,
            projectileScale: { x: 0.4, y: 0.4 },
            multiplier: this.multiplier,
        };

        // DPS = 166 * (1000 / 100) = 2000 damage per second
    }

    clearSlot(slot) {
        this.weaponSlots[slot].type = null;
    }

    primaryFire(time: number, point?: { worldX: number; worldY: number }) {
        this.fireAll("laser", time, point);
        this.fireAll("gatling", time, point);
    }

    fireAll(type: WeaponType, time: number, point?: { worldX: number; worldY: number }) {
        let playedSound = false;
        const weapons = this.getWeaponsOfType(type);
        const toAddShipMomentum = type === "gatling";

        weapons.forEach((weapon) => {
            if (time - weapon.lastFired > weapon.cooldownTime) {
                // Check if enough time passed since last shot
                this.shootProjectile(weapon, toAddShipMomentum, point);
                // Update cooldown
                this.weaponSlots[weapon.id].lastFired = time;
                // Play the apropriate sound one time, regardless of the amount of weapons
                if (!playedSound && this.ship.soundManager) {
                    this.ship.soundManager.play(type, {
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

    shootProjectile(weapon, addShipMomentum = false, point?: { worldX: number; worldY: number }) {
        const projectileVelocity = weapon.projectileVelocity;
        const projectileDistance = 900_000;
        const projectileLifespan = projectileDistance / projectileVelocity;

        const { offsetX, offsetY } = this.ship.getRotatedPoint(weapon, true);

        let rotation;
        if (point) {
            // If firing at a cursor, aim them to shoot at cursor
            const { worldX, worldY } = point;
            const cursorRotation =
                Phaser.Math.Angle.Between(offsetX, offsetY, worldX, worldY) + Math.PI / 2;
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
            // Take ship velocity in account when calculating the speed of a bullet
            const shipVelocityX = this.ship.body.velocity.x;
            const shipVelocityY = this.ship.body.velocity.y;
            velocityX = Math.sin(rotation) * projectileVelocity + shipVelocityX;
            velocityY = -Math.cos(rotation) * projectileVelocity + shipVelocityY;
        } else {
            velocityX = Math.sin(rotation) * projectileVelocity;
            velocityY = -Math.cos(rotation) * projectileVelocity;
        }

        const projectile = this.scene.physics.add
            .sprite(offsetX, offsetY, this.ship.isTextured ? weapon.type : null, 0)
            .setRotation(rotation - Math.PI / 2)
            .setScale(weapon.projectileScale.x, weapon.projectileScale.y);
        projectile["weapon"] = weapon;

        const hitboxSize = 2;
        projectile
            .setCircle(
                hitboxSize,
                projectile.width / 2 - hitboxSize,
                projectile.height / 2 - hitboxSize
            )
            .setVelocity(velocityX, velocityY);

        this.projectileGroup.add(projectile);

        this.ship.enemies.forEach((enemy) => {
            this.scene.physics.add.overlap(enemy, projectile, () => {
                if (enemy.status.shields <= 0) {
                    enemy.getHit(projectile);
                    // TODO reuse projectiles
                    projectile.destroy();
                }
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
