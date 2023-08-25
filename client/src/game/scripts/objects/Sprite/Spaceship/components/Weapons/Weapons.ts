import ContainerLite from "phaser3-rex-plugins/plugins/gameobjects/container/containerlite/ContainerLite";

import { Sprite } from "~/objects/Sprite";
import type { BaseScene } from "~/scenes/core/BaseScene";
import type { Spaceship, WeaponOrigin } from "~/objects/Sprite/Spaceship";
import { Projectile, Weapon } from "./components";

type WorldPoint = { worldX: number; worldY: number };

export type WeaponType = "laser" | "gatling" | null;

export interface WeaponSlot extends WeaponOrigin {
    id: number;
    type: WeaponType;
    lastFired: number;
    sprite?: Sprite;
}

interface WeaponStats {
    cooldownTime: number;
    addShipMomentum: boolean;
    projectileVelocity: number;
    projectileBaseDamage: number;
    projectileScale: { x: number; y: number };
}
export class Weapons {
    scene: BaseScene;
    ship: Spaceship;
    weaponSlots: WeaponSlot[];
    box: ContainerLite;

    multiplier = 1;
    projectileId = 0;

    get slotCount() {
        return this.weaponSlots.length;
    }

    get weaponCount() {
        return this.weaponSlots.filter((slot) => slot.type !== null).length;
    }

    getWeaponSlot(slot: number) {
        return this.weaponSlots[slot];
    }

    getWeaponsOfType(type: WeaponType) {
        return this.weaponSlots.filter((slot) => slot.type === type);
    }

    getWeaponById(weaponId: number) {
        return this.weaponSlots.find((slot) => slot.id === weaponId);
    }
    getDamageByWeapon(weapon: WeaponSlot) {
        const weaponStats = Weapons.getWeaponStats(weapon.type);
        const { projectileBaseDamage } = weaponStats;
        return this.multiplier * projectileBaseDamage;
    }

    getIncrementalId() {
        return this.projectileId++;
    }

    constructor(
        scene: BaseScene,
        ship: Spaceship,
        weaponOrigins: WeaponOrigin[],
        multiplier?: number
    ) {
        this.scene = scene;
        this.ship = ship;
        this.multiplier = multiplier;

        this.box = this.scene.add.rexContainerLite();
        this.ship.rotatingBox.pinLocal(this.box);

        // Sort by x value in ascending order
        this.weaponSlots = weaponOrigins
            .sort(({ x: x1 }, { x: x2 }) => x1 - x2)
            .map((weaponOrigin, slot) => ({
                ...weaponOrigin,
                id: slot,
                type: null,
                lastFired: -Infinity,
            }));
        if (this.ship.soundManager) {
            this.ship.soundManager.addSounds("laser", [
                "laser_sound_2",
                "laser_sound_1",
                "laser_sound_3",
            ]);
            this.ship.soundManager.addSounds("gatling", ["gatling_sound_1"]);
        }
    }

    static getWeaponStats(type: WeaponType): WeaponStats {
        if (type === "laser") {
            return {
                addShipMomentum: false,
                cooldownTime: 600,
                projectileVelocity: 5000,
                projectileBaseDamage: 1000,
                projectileScale: { x: 3, y: 1 },
            };
        } else if (type === "gatling") {
            return {
                addShipMomentum: true,
                cooldownTime: 100,
                projectileVelocity: 1200,
                projectileBaseDamage: 200,
                projectileScale: { x: 0.4, y: 0.4 },
            };
        } else if (type === null) return null;
    }

    fillSlot(type: WeaponType, slot: number) {
        const doesSlotExists = slot <= this.slotCount - 1;
        if (doesSlotExists) {
            const tryingToClearSlot = type === null;
            const isSlotEmpty = this.getWeaponSlot(slot).type === null;

            if (!tryingToClearSlot && isSlotEmpty) {
                this.createWeapon(type, slot);
            } else if (tryingToClearSlot) this.clearSlot(slot);
        }
    }
    canBePlaced(type: string, slot: number) {
        const isEnoughSlots = slot <= this.slotCount - 1;
        const isWeaponType = [null, "laser", "gatling"].includes(type);
        return isEnoughSlots && isWeaponType;
    }

    createWeapon(type: Exclude<WeaponType, null>, slot: number) {
        // Laser DPS = 1000 * (1000 / 600) = 1666 damage per second
        // Gatling DPS = 166 * (1000 / 100) = 2000 damage per second

        const weaponSlot = this.getWeaponSlot(slot);

        const x = weaponSlot.x - this.ship.halfWidth;
        const y = weaponSlot.y - this.ship.halfHeight;

        const toFlip = weaponSlot.x > this.ship.halfWidth;

        const weaponSprite = new Weapon(
            { id: slot, x, y, type: "laser", variation: weaponSlot.variation, toFlip },
            { ship: this.ship }
        );

        this.weaponSlots[slot].type = type;
        this.weaponSlots[slot].sprite = weaponSprite;

        this.box.pinLocal(weaponSprite, { syncRotation: false });
    }

    clearSlot(slot: number) {
        this.weaponSlots[slot].type = null;

        if (this.weaponSlots[slot].sprite) {
            this.box.unpin(this.weaponSlots[slot].sprite, true);
            this.weaponSlots[slot].sprite = null;
        }
    }

    primaryFire(time: number, point?: WorldPoint) {
        this.fireAll("laser", time, point);
        this.fireAll("gatling", time, point);
    }

    fireAll(type: WeaponType, time: number, point?: WorldPoint) {
        let playedSound = false;
        const weapons = this.getWeaponsOfType(type);
        const weaponStats = Weapons.getWeaponStats(type);

        weapons.forEach((weapon) => {
            // Check if enough time passed since last shot
            if (time - weapon.lastFired > weaponStats.cooldownTime) {
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
        targetPoint?: WorldPoint,
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

    shootProjectile(weaponId: number, targetPoint?: WorldPoint) {
        const serverOptions = this.getProjectileServerOptions(weaponId, targetPoint);
        const clientOptions = {
            scene: this.scene,
            isTextured: this.scene.isTextured,
            depth: this.ship.depth - 1,
        };
        const projectile = new Projectile(serverOptions, clientOptions);
        this.ship.projectileGroup.add(projectile);
    }

    getProjectileServerOptions(weaponId: number, targetPoint?: WorldPoint) {
        const weapon = this.getWeaponById(weaponId);
        const weaponStats = Weapons.getWeaponStats(weapon.type);
        const originPoint = this.ship.getRotatedPoint(weapon);

        const angle = this.getWeaponAngle(weaponId, targetPoint);
        const rotation = Phaser.Math.DegToRad(angle);
        const { velocityX, velocityY } = this.toVelocityVector(
            weaponStats.projectileVelocity,
            rotation,
            weaponStats.addShipMomentum
        );

        return {
            id: this.getIncrementalId(),
            x: originPoint.originX,
            y: originPoint.originY,
            angle: angle + 90,
            atlasTexture: weapon.type,
            scale: { scaleX: weaponStats.projectileScale.x, scaleY: weaponStats.projectileScale.y },
            velocity: { velocityX, velocityY },
            firedFrom: weapon,
            weapons: this,
            travelDistance: 900,
            isAuthority: this.scene.game.isAuthority,
        };
    }

    getWeaponAngle(slot: number, targetPoint: WorldPoint = this.ship.pointer) {
        const weapon = this.getWeaponSlot(slot);
        const originPoint = this.ship.getRotatedPoint(weapon);
        const rotation = this.getGimbalPointRotation(originPoint, targetPoint);
        const angle = Phaser.Math.RadToDeg(rotation);

        return angle;
    }

    update(time: number, delta: number) {
        this.weaponSlots.forEach((weaponSlot, slot) => {
            if (weaponSlot.type !== null) {
                const angle = this.getWeaponAngle(slot);
                weaponSlot.sprite.setAngle(angle);
            }
        });
    }
}
