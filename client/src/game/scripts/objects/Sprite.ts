import type { BaseScene } from "~/scenes/core/BaseScene";
import type SoundManager from "~/game/managers/SoundManager";

interface Multipliers {
    speed: number;
    health: number;
    shields: number;
    damage: number;
}

export type Status = {
    shields: number;
    health: number;
};

export interface SpriteServerOptions {
    id: string;
    x: number;
    y: number;
    angle: number;
    atlasTexture: string | Phaser.Textures.Texture;
    multipliers: Multipliers;
    username: string;
    depth: number;
}

export interface SpriteClientOptions {
    scene: Phaser.Scene;
    soundManager?: SoundManager;
    toPassTexture: boolean;
}

export class Sprite extends Phaser.Physics.Arcade.Sprite {
    id: string;
    name: string;
    baseStats: { health: number; hitboxRadius: number; speed: number };
    status: Status;
    multipliers: Multipliers;
    soundManager?: SoundManager;
    scene: BaseScene;
    atlas: {
        metadata: any;
        width: number;
        height: number;
    };
    isTextured: boolean;

    get maxHealth() {
        const healthMultiplier = this.multipliers.health;
        return this.baseStats.health * healthMultiplier;
    }
    get maxShields() {
        const shieldsMultiplier = this.multipliers.shields;
        return 10000 * shieldsMultiplier;
    }
    get absoluteHalfWidth() {
        return this.atlas.width / 2;
    }
    get absoluteHalfHeight() {
        return this.atlas.height / 2;
    }
    get atlasMetadata() {
        return this.atlas.metadata;
    }

    constructor(serverOptions: SpriteServerOptions, clientOptions: SpriteClientOptions) {
        const { x, y, atlasTexture } = serverOptions;
        const { scene, toPassTexture } = clientOptions;
        super(scene, x, y, toPassTexture ? atlasTexture : "");
        this.isTextured = toPassTexture;

        // Phaser stuff
        scene.add.existing(this);
        scene.physics.add.existing(this);
        // @ts-ignore
        // this.body.onWorldBounds = true;
        const { depth, angle } = serverOptions;
        // this.setCollideWorldBounds(true).setOrigin(0.5).setDepth(depth);
        this.setOrigin(0.5).setDepth(depth).setAngle(angle);
        const { id } = serverOptions;
        this.id = id;

        const textureMeta = this.scene.getTextureJson(atlasTexture).meta;
        const { w: textureWidth, h: textureHeight } = textureMeta.size;

        this.atlas = {
            metadata: textureMeta,
            height: textureHeight,
            width: textureWidth,
        };

        const { baseStats, scale } = this.atlasMetadata;
        this.baseStats = baseStats;
        this.resize(scale);

        const { multipliers } = serverOptions;
        this.multipliers = multipliers;

        this.status = {
            health: 0,
            shields: 0,
        };
        this.status.health = this.maxHealth;
        this.status.shields = this.maxShields;

        const { soundManager } = clientOptions;
        this.soundManager = soundManager;
        // Make sure relevant sounds are loaded
        if (this.soundManager) {
            soundManager.addSounds("hit", ["hit_sound_1", "hit_sound_2"]);
        }

        // Enables click events
        this.setInteractive();
        this.on("pointerdown", () => {
            this.scene.input.emit("clickTarget", this);
        });
    }

    resize(scale: number) {
        this.displayWidth = Number(this.scene.game.config.width) * scale;
        // Keeps 1:1 aspect ratio
        this.scaleY = this.scaleX;
    }

    setCircularHitbox(hitboxRadius: number) {
        this.body.setCircle(
            hitboxRadius,
            this.absoluteHalfWidth - hitboxRadius,
            this.absoluteHalfHeight - hitboxRadius
        );
    }

    getRotatedPoint(point: { x: number; y: number }, absolute = false, rotation = this.rotation) {
        // The center of the ship is xOy
        // Distance from center of a ship to a point on a ship; Corresponds to Y
        const R = Phaser.Math.Distance.Between(
            this.absoluteHalfWidth,
            this.absoluteHalfHeight,
            point.x,
            point.y
        );

        // Corresponds to X
        const additionalRotation = Phaser.Math.Angle.Between(
            this.absoluteHalfWidth,
            this.absoluteHalfHeight,
            point.x,
            point.y
        );

        let offsetX;
        let offsetY;
        if (absolute) {
            // If needed absolute coordinates, use current position of a ship in a world as a circle origin
            offsetX = R * Math.cos(rotation + additionalRotation) + this.x;
            offsetY = R * Math.sin(rotation + additionalRotation) + this.y;
        } else {
            // Otherwise use relative to the sprite coordinates
            offsetX = R * Math.cos(rotation + additionalRotation);
            offsetY = R * Math.sin(rotation + additionalRotation);
        }
        return { offsetX, offsetY };
    }

    onStopMoving() {}
}
