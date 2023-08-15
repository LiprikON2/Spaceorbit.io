import { TouchSensor } from "@dnd-kit/core";
import { BaseScene } from "../core/BaseScene";

export class BaseMapScene extends BaseScene {
    background: Phaser.GameObjects.Image = null;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }
    preload() {
        super.preload();
    }

    create() {
        super.create();

        if (this.game.isClient) {
            this.loadTileBackground("particles", 0.65, 0);
            this.loadTileBackground("particles", 0.75, 90);
            this.loadTileBackground("particles", 0.85, -90);
            this.loadTileBackground("particles", 1, 180);
        }
    }

    loadTileBackground(
        texture: string,
        parallaxCoef = 1,
        angle = 0,
        paddingPercent = 0.5,
        totalWidth = this.physics.world.bounds.width,
        totalHeight = this.physics.world.bounds.height
    ) {
        const widthWithPadding = totalWidth * (1 * parallaxCoef + paddingPercent);
        const heightWithPadding = totalHeight * (1 * parallaxCoef + paddingPercent);

        const rightAngle = Math.floor(angle / 90) * 90;
        const isOrientationFlipped = rightAngle % 180 !== 0;

        const widthWithRespectToOrientation = isOrientationFlipped
            ? heightWithPadding
            : widthWithPadding;
        const heightWithRespectToOrientation = isOrientationFlipped
            ? widthWithPadding
            : heightWithPadding;

        const [centerX, centerY] = this.getCameraParallaxCenterOffset(parallaxCoef);

        const tileLayer = this.add
            .tileSprite(
                centerX,
                centerY,
                widthWithRespectToOrientation,
                heightWithRespectToOrientation,
                texture
            )
            .setOrigin(0.5)
            .setScrollFactor(parallaxCoef)
            .setDepth(1)
            .setAngle(rightAngle);

        return tileLayer;
    }

    loadBackground(textureKey: string, parallaxCoef: number, bounds = false, debug = true) {
        const json = this.getTextureJson(textureKey);
        const { w: width, h: height } = json.meta.size;

        const [centerX, centerY] = this.getCameraParallaxCenterOffset(parallaxCoef);
        let background: Phaser.GameObjects.Image = null;
        if (this.game.isClient) {
            background = this.add
                .image(centerX, centerX, textureKey)
                .setOrigin(0.5)
                .setDepth(0)
                .setScrollFactor(parallaxCoef);
        }

        if (debug) {
            // Physics of Parralaxed rectangle
            const red = this.add
                .rectangle(0, 0, width, height)
                .setOrigin(0.5)
                .setStrokeStyle(2, 0xff0000)
                .setDepth(100)
                .setScrollFactor(1);

            // Position (texture) of Parralaxed rectangle
            const blue = this.add
                .rectangle(centerX, centerY, width, height)
                .setOrigin(0.5)
                .setStrokeStyle(3, 0x1a65ac)
                .setDepth(100)
                .setScrollFactor(parallaxCoef);

            // Physics of Parralaxed rectangle,
            // scaled to match the parralax
            const pink = this.add
                .rectangle(0, 0, width * (1 / parallaxCoef), height * (1 / parallaxCoef))
                .setOrigin(0.5)
                .setStrokeStyle(2, 0xffc0cb)
                .setDepth(100)
                .setScrollFactor(1);
        }

        const parallaxWidth = width * (1 / parallaxCoef);
        const parallaxHeight = height * (1 / parallaxCoef);

        this.physics.world.setBounds(
            -(parallaxWidth / 2),
            -(parallaxHeight / 2),
            parallaxWidth,
            parallaxHeight
        );
        if (!bounds) this.physics.world.setBoundsCollision(false, false, false, false);

        const color = json.meta.bgColor;
        this.updateRootBackground(color);

        return background;
    }

    /**
     * Because:
     * - Scrolling factor in Phaser based around `scrollX`, `scrollY` point
     * - `scrollX` and `scrollY` corresponds to the top left corner of the viewport
     *
     * The positions of *camera scroll* and *world* is off by half width and height of the viewport.
     *
     * ---
     * For example:
     * - Viewport `1920x1080`
     * - Player at `worldX = 0`, `worldY = 0`
     * - Camera centered on player
     * - Camera scrolls are `scrollX = 960`, `scrollY = 540`
     * - Offsets from this functions are are `offsetX = 960`, `offsetY = 540`
     *
     * @param scrollFactor equivalent to parallax coefficient
     * @returns offsetX, offsetY
     */
    getCameraParallaxCenterOffset(scrollFactor): [number, number] {
        const { main } = this.cameras;
        const { centerX, centerY, scrollX, scrollY } = main;

        const offsetX = (centerX - scrollX) * (1 - scrollFactor);
        const offsetY = (centerY - scrollY) * (1 - scrollFactor);

        return [offsetX, offsetY];
    }

    updateRootBackground(color = "#1d252c") {
        if (this.rootElem) {
            this.rootElem.style.backgroundColor = color;
        }
    }

    addLights(origins: [number, number][]) {
        origins.forEach(([originX, originY]) => {
            this.lights
                .addLight(this.halfWorldWidth * originX, this.halfWorldHeight * originY, 5000)
                .setIntensity(0.5);
        });
        this.lights.enable().setAmbientColor(0x888888);
    }
}
