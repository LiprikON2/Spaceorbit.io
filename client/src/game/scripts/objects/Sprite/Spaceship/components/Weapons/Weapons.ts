import type { BaseScene } from "~/scenes/core/BaseScene";
import type { Spaceship } from "~/objects/Sprite/Spaceship";
import { Projectile } from "./components";

type WeaponType = "laser" | "gatling" | null;

export interface Weapon {
    id: number;
    type: WeaponType;
    x: number;
    y: number;
    cooldownTime: number;
    lastFired: number;
    addShipMomentum: boolean;
    projectileVelocity: number;
    projectileBaseDamage: number;
    projectileScale: { x: number; y: number };
    projectileDamageMultiplier: number;
}
export class Weapons {
    scene: BaseScene;
    ship: Spaceship;
    // delay = 1000/fps
    primaryFireRate = 600;
    weaponSlots: Weapon[];

    multiplier = 1;
    projectileId = 0;

    getIncrementalId() {
        return this.projectileId++;
    }

    constructor(scene: BaseScene, ship: Spaceship, weaponOrigins, multiplier?: number) {
        this.scene = scene;
        this.ship = ship;
        this.multiplier = multiplier;
        // Sort by x value in ascending order
        this.weaponSlots = weaponOrigins
            .sort(({ x: x1 }, { x: x2 }) => x1 - x2)
            .map((origin, index) => ({
                ...origin,
                id: index,
                type: null,
                cooldownTime: 0,
                addShipMomentum: false,
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

    getWeaponById(weaponId: number) {
        return this.weaponSlots.find((slot) => slot.id === weaponId);
    }
    getDamageByWeapon(weapon: Weapon) {
        const { projectileDamageMultiplier, projectileBaseDamage } = weapon;
        return projectileDamageMultiplier * projectileBaseDamage;
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

    createLaser(slot: number) {
        this.weaponSlots[slot] = {
            ...this.weaponSlots[slot],
            type: "laser",
            addShipMomentum: false,
            cooldownTime: 600,
            projectileVelocity: 5000,
            projectileBaseDamage: 1000,
            projectileScale: { x: 3, y: 1 },
            projectileDamageMultiplier: this.multiplier,
        };

        // DPS = 1000 * (1000 / 600) = 1666 damage per second
    }

    createGatling(slot: number) {
        this.weaponSlots[slot] = {
            ...this.weaponSlots[slot],
            type: "gatling",
            addShipMomentum: true,
            cooldownTime: 100,
            projectileVelocity: 1200,
            projectileBaseDamage: 200,
            projectileScale: { x: 0.4, y: 0.4 },
            projectileDamageMultiplier: this.multiplier,
        };

        // DPS = 166 * (1000 / 100) = 2000 damage per second
    }

    clearSlot(slot: number) {
        this.weaponSlots[slot].type = null;
    }

    primaryFire(time: number, point?: { worldX: number; worldY: number }) {
        this.fireAll("laser", time, point);
        this.fireAll("gatling", time, point);
    }

    fireAll(type: WeaponType, time: number, point?: { worldX: number; worldY: number }) {
        let playedSound = false;
        const weapons = this.getWeaponsOfType(type);

        weapons.forEach((weapon) => {
            if (time - weapon.lastFired > weapon.cooldownTime) {
                // Check if enough time passed since last shot
                this.shootProjectile(weapon.id, point);
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

    getGimbalPointRotation(
        originPoint: { originX: number; originY: number },
        targetPoint?: { worldX: number; worldY: number },
        maxRotationOffset = Math.PI / 9
    ) {
        if (!targetPoint) return this.ship.rotation;
        // If firing at a cursor, aim them to shoot at cursor
        const { originX, originY } = originPoint;
        const { worldX, worldY } = targetPoint;

        const rotationToTarget =
            Phaser.Math.Angle.Between(originX, originY, worldX, worldY) + Math.PI / 2;

        let angleOffset = Math.abs(
            Phaser.Math.Angle.ShortestBetween(
                Phaser.Math.Angle.Wrap(rotationToTarget),
                this.ship.rotation
            )
        );
        // Dirty fix for aiming at the bottom of the screen (351 deg -> 9 deg)
        if (angleOffset > Math.PI) {
            angleOffset = 2 * Math.PI - angleOffset;
        }
        if (angleOffset > maxRotationOffset) {
            // Ensures you can't fire behind your back
            return this.ship.rotation;
        } else {
            return rotationToTarget;
        }
    }

    toVelocityVector(velocity: number, rotation: number, addShipMomentum = false) {
        let velocityX, velocityY;
        if (addShipMomentum) {
            // Take ship velocity in account when calculating the speed of a bullet
            const shipVelocityX = this.ship.body.velocity.x;
            const shipVelocityY = this.ship.body.velocity.y;
            velocityX = Math.sin(rotation) * velocity + shipVelocityX;
            velocityY = -Math.cos(rotation) * velocity + shipVelocityY;
        } else {
            velocityX = Math.sin(rotation) * velocity;
            velocityY = -Math.cos(rotation) * velocity;
        }

        return { velocityX, velocityY };
    }

    shootProjectile(weaponId: number, targetPoint?: { worldX: number; worldY: number }) {
        const serverOptions = this.getProjectileServerOptions(weaponId, targetPoint);
        const clientOptions = {
            scene: this.scene,
            toPassTexture: this.ship.isTextured,
        };
        const projectile = new Projectile(serverOptions, clientOptions);
        this.scene.projectileGroup.add(projectile);
    }

    getProjectileServerOptions(weaponId: number, targetPoint?: { worldX: number; worldY: number }) {
        const weapon = this.getWeaponById(weaponId);
        const originPoint = this.ship.getRotatedPoint(weapon, true);
        const rotation = this.getGimbalPointRotation(originPoint, targetPoint);
        const { velocityX, velocityY } = this.toVelocityVector(
            weapon.projectileVelocity,
            rotation,
            weapon.addShipMomentum
        );

        return {
            id: this.getIncrementalId(),
            x: originPoint.originX,
            y: originPoint.originY,
            angle: Phaser.Math.RadToDeg(rotation - Math.PI / 2),
            atlasTexture: weapon.type,
            depth: this.ship.depth - 1,
            scale: { scaleX: weapon.projectileScale.x, scaleY: weapon.projectileScale.y },
            velocity: { velocityX, velocityY },
            firedFrom: weapon,
            weapons: this,
            travelDistance: 900000,
        };
    }
}
