import { Sprite, type SpriteClientOptions, type SpriteServerOptions } from "~/objects/Sprite";
import type { WeaponSlot, Weapons } from "../Weapons";

export interface ProjectileServerOptions extends SpriteServerOptions {
    scale: { scaleX: number; scaleY: number };
    velocity: { velocityX: number; velocityY: number };
    firedFrom: WeaponSlot;
    weapons: Weapons;
    travelDistance: number;
}

export interface ProjectileClientOptions extends SpriteClientOptions {}

export class Projectile extends Sprite {
    firedFrom: WeaponSlot;
    weapons: Weapons;
    firedFromPoint: { x: number; y: number };

    constructor(serverOptions: ProjectileServerOptions, clientOptions: ProjectileClientOptions) {
        super(serverOptions, clientOptions);
        // if absent,body and texture ends up disaligned
        this.setCircularHitbox(1);

        const { x, y } = serverOptions;
        this.firedFromPoint = { x, y };

        const { firedFrom, weapons } = serverOptions;
        this.firedFrom = firedFrom;
        this.weapons = weapons;

        const { scaleX, scaleY } = serverOptions.scale;
        this.setScale(scaleX, scaleY);

        this.setCircle(1);

        const { velocityX, velocityY } = serverOptions.velocity;
        this.setVelocity(velocityX, velocityY);

        const { travelDistance } = serverOptions;
        this.destroyAfterTravelling(travelDistance);

        const { angle } = serverOptions;
        this.maskSelf(x, y, angle, travelDistance);
    }

    get damage() {
        const damage = this.weapons.getDamageByWeapon(this.firedFrom);
        return damage;
    }

    get owner() {
        return this.weapons.ship;
    }

    get ownerId() {
        return this.owner.id;
    }

    destroy(fromScene?: boolean) {
        this.clearMask(true);
        super.destroy(fromScene);
    }

    maskSelf(x: number, y: number, angle: number, distance: number) {
        const height = distance * 1.25;
        const width = 150;
        const graphics = this.scene.make
            .graphics({ x, y }, false)
            .fillTriangle(0, 0, -(width / 2), -height, width / 2, -height)
            .setAngle(angle - 90);
        const mask = graphics.createGeometryMask();
        this.setMask(mask);
    }

    destroyAfterTravelling(distance: number) {
        const projectileLifespan = distance / this.speed;
        this.scene.time.delayedCall(projectileLifespan * 1000, () => this.destroy());
    }
}
