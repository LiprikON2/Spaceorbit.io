import type { BaseScene } from "~/scenes/core/BaseScene";
import type { SoundManager } from "~/managers";

export type Status = {
    shields: number;
    health: number;
};

export interface SpriteServerOptions {
    id: string | number;
    x: number;
    y: number;
    angle: number;
    atlasTexture: string | Phaser.Textures.Texture;
    depth: number;
}

export interface SpriteClientOptions {
    scene: BaseScene;
    toPassTexture: boolean;
    soundManager?: SoundManager;
}

export class Sprite extends Phaser.Physics.Arcade.Sprite {
    id: string | number;
    name: string;
    soundManager?: SoundManager;
    scene: BaseScene;
    atlas: {
        metadata: any;
        width: number;
        height: number;
    };
    isTextured: boolean;

    get speed() {
        const { x: vx, y: vy } = this.body.velocity;
        const speed = Math.sqrt(vx ** 2 + vy ** 2);
        return speed;
    }

    /**
     * Half width of sprite texture, without scaling
     */
    get absoluteHalfWidth() {
        return this.atlas.width / 2;
    }
    /**
     * Half height of sprite texture, without scaling
     */
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

        scene.add.existing(this);
        scene.physics.add.existing(this);

        const { depth, angle } = serverOptions;
        this.setOrigin(0.5).setDepth(depth).setAngle(angle);

        const { soundManager } = clientOptions;
        this.soundManager = soundManager;

        const { id } = serverOptions;
        this.id = id;

        const textureMeta = this.scene.getTextureJson(atlasTexture).meta;
        const { w: textureWidth, h: textureHeight } = textureMeta.size;

        this.atlas = {
            metadata: textureMeta,
            height: textureHeight,
            width: textureWidth,
        };

        const { scale } = this.atlasMetadata;
        this.resize(scale);
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

    getRotatedPoint(point: { x: number; y: number }, absolute = false) {
        // The center of the ship is xOy
        // Distance from center of a ship to a point on a ship; Corresponds to Y
        const r = Phaser.Math.Distance.Between(
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
        const { rotation } = this;

        let originX: number;
        let originY: number;
        if (absolute) {
            // If needed absolute coordinates, use current position of a ship in a world as a circle origin
            originX = r * Math.cos(rotation + additionalRotation) + this.x;
            originY = r * Math.sin(rotation + additionalRotation) + this.y;
        } else {
            // Otherwise use relative to the sprite coordinates
            originX = r * Math.cos(rotation + additionalRotation);
            originY = r * Math.sin(rotation + additionalRotation);
        }
        return { originX, originY };
    }
}
