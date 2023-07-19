import { Sprite, type SpriteClientOptions, type SpriteServerOptions } from "~/objects/Sprite";
import type { Weapon } from "../Weapons";

export interface ProjectileServerOptions extends SpriteServerOptions {
    scale: { scaleX: number; scaleY: number };
    velocity: { velocityX: number; velocityY: number };
    weapon: Weapon;
    travelDistance: number;
}

export interface ProjectileClientOptions extends SpriteClientOptions {}

export class Projectile extends Sprite {
    weapon: Weapon;

    constructor(serverOptions: ProjectileServerOptions, clientOptions: ProjectileClientOptions) {
        super(serverOptions, clientOptions);

        const { weapon } = serverOptions;
        this.weapon = weapon;

        const { scaleX, scaleY } = serverOptions.scale;
        this.setScale(scaleX, scaleY);

        this.setCircle(1);

        const { velocityX, velocityY } = serverOptions.velocity;
        this.setVelocity(velocityX, velocityY);

        const { travelDistance } = serverOptions;
        this.destroyAfterTravelling(travelDistance);
    }

    get damage() {
        const { projectileDamageMultiplier, projectileBaseDamage } = this.weapon;
        return projectileDamageMultiplier * projectileBaseDamage;
    }

    destroyAfterTravelling(distance: number) {
        const projectileLifespan = distance / this.speed;
        this.scene.time.delayedCall(projectileLifespan, () => this.destroy());
    }
}
