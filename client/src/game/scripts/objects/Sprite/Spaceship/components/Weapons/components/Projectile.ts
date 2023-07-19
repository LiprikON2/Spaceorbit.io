import { Sprite, type SpriteClientOptions, type SpriteServerOptions } from "~/objects/Sprite";
import type { Weapon, Weapons } from "../Weapons";

export interface ProjectileServerOptions extends SpriteServerOptions {
    scale: { scaleX: number; scaleY: number };
    velocity: { velocityX: number; velocityY: number };
    firedFrom: Weapon;
    weapons: Weapons;
    travelDistance: number;
}

export interface ProjectileClientOptions extends SpriteClientOptions {}

export class Projectile extends Sprite {
    firedFrom: Weapon;
    weapons: Weapons;

    constructor(serverOptions: ProjectileServerOptions, clientOptions: ProjectileClientOptions) {
        super(serverOptions, clientOptions);

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
        const { projectileDamageMultiplier, projectileBaseDamage } = this.firedFrom;
        return projectileDamageMultiplier * projectileBaseDamage;
    }

    get owner() {
        return this.weapons.ship;
    }

    destroyAfterTravelling(distance: number) {
        const projectileLifespan = distance / this.speed;
        this.scene.time.delayedCall(projectileLifespan, () => this.destroy());
    }
}
