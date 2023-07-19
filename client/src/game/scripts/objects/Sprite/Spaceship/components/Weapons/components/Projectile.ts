import { Sprite, type SpriteClientOptions, type SpriteServerOptions } from "~/objects/Sprite";

export interface ProjectileServerOptions extends SpriteServerOptions {
    scale: { scaleX: number; scaleY: number };
    velocity: { velocityX: number; velocityY: number };
}

export interface ProjectileClientOptions extends SpriteClientOptions {}

export class Projectile extends Sprite {
    constructor(serverOptions: ProjectileServerOptions, clientOptions: ProjectileClientOptions) {
        super(serverOptions, clientOptions);

        const { scaleX, scaleY } = serverOptions.scale;
        this.setScale(scaleX, scaleY);

        const hitboxSize = 2;
        this.setCircle(hitboxSize, this.width / 2 - hitboxSize, this.height / 2 - hitboxSize);

        const { velocityX, velocityY } = serverOptions.velocity;
        this.setVelocity(velocityX, velocityY);
    }
}
