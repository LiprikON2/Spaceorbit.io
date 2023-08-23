import type { BaseScene } from "~/scenes/core/BaseScene";
import type { SoundManager } from "~/managers";

export interface SpriteServerOptions {
    id: string | number;
    x: number;
    y: number;
    atlasTexture: string | Phaser.Textures.Texture;
    angle?: number;
    disablePhysics?: boolean;
}

export interface SpriteClientOptions {
    scene: BaseScene;
    soundManager?: SoundManager;
    depth?: number;
    enableNormals?: boolean;
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

    get speed() {
        const { x: vx, y: vy } = this.body.velocity;
        const speed = Math.sqrt(vx ** 2 + vy ** 2);
        return speed;
    }

    /**
     * Half width of sprite texture, without scaling
     */
    get halfWidth() {
        return this.width / 2;
    }
    /**
     * Half height of sprite texture, without scaling
     */
    get halfHeight() {
        return this.height / 2;
    }
    get atlasMetadata() {
        return this.atlas.metadata;
    }

    get isAuthority() {
        return this.scene.game.isAuthority;
    }

    constructor(serverOptions: SpriteServerOptions, clientOptions: SpriteClientOptions) {
        const { x, y, atlasTexture } = serverOptions;
        const { scene } = clientOptions;

        super(scene, x, y, scene.isTextured ? atlasTexture : "");

        scene.add.existing(this);
        const { disablePhysics } = serverOptions;
        if (!disablePhysics) scene.physics.add.existing(this);

        const { depth } = clientOptions;
        if (depth) this.setDepth(depth);

        const { angle } = serverOptions;
        if (angle) this.setAngle(angle);

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
        this.setScale(scale);

        const { enableNormals } = clientOptions;
        if (this.scene.isTextured && enableNormals) {
            this.setPipeline("Light2D");
        }
    }

    setCircularHitbox(hitboxRadius: number) {
        this.body.setCircle(
            hitboxRadius,
            this.halfWidth - hitboxRadius,
            this.halfHeight - hitboxRadius
        );
    }

    getTinted(color: number = 0xee4824, duration: number = 200) {
        this.setTint(color);
        this.scene.time.delayedCall(duration, () => this.clearTint());
    }

    getRotatedPoint(point: { x: number; y: number }, absolute = true) {
        // The center of the ship is xOy
        // Distance from center of a ship to a point on a ship; Corresponds to Y
        const r = Phaser.Math.Distance.Between(this.halfWidth, this.halfHeight, point.x, point.y);

        // Corresponds to X
        const additionalRotation = Phaser.Math.Angle.Between(
            this.halfWidth,
            this.halfHeight,
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
