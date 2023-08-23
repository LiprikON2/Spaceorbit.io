import { Sprite } from "~/game/objects/";
import type { Spaceship } from "~/game/objects/Sprite/Spaceship";
import type { WeaponType, Weapons } from "../Weapons";

interface WeaponServerOptions {
    id: number;
    x: number;
    y: number;
    type: WeaponType;
    variation: string;
    toFlip: boolean;
}
interface WeaponClientOptions {
    ship: Spaceship;
}

export class Weapon extends Sprite {
    ship: Spaceship;
    constructor(serverOptions: WeaponServerOptions, clientOptions: WeaponClientOptions) {
        const { x, y, id, type, variation } = serverOptions;
        const { ship } = clientOptions;

        super(
            {
                id,
                x,
                y,
                atlasTexture: type + variation,
                disablePhysics: true,
            },
            {
                scene: ship.scene,
                enableNormals: true,
            }
        );

        this.ship = ship;

        const { toFlip } = serverOptions;

        if (toFlip) this.setFlipX(true);
    }
}
