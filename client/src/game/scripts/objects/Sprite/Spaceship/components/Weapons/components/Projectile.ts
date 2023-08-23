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

    destroyAfterTravelling(distance: number) {
        const projectileLifespan = distance / this.speed;
        this.scene.time.delayedCall(projectileLifespan, () => this.destroy());
    }
}
