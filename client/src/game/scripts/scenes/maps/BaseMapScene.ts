import { TouchSensor } from "@dnd-kit/core";
import { BaseScene } from "../core/BaseScene";

export class BaseMapScene extends BaseScene {
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }
    preload() {
        super.preload();
    }

    create() {
        super.create();

        if (this.game.isClient) {
            this.loadTileBackground(
                this,
                this.physics.world.bounds.width,
                this.physics.world.bounds.height,
                "particles",
                0.75
            );
            this.loadTileBackground(
                this,
                this.physics.world.bounds.width,
                this.physics.world.bounds.height,
                "particles",
                1,
                180
            );
        }
    }

    // https://blog.ourcade.co/posts/2020/add-pizazz-parallax-scrolling-phaser-3/
    // TODO a way to optimize it further would be to recylcle the tiles
    loadTileBackground(
        scene: Phaser.Scene,
        totalWidth: number,
        totalHeight: number,
        texture: string,
        scrollFactor: number,
        angle: number = 0
    ) {
        const { width: w, height: h } = scene.textures.get(texture).getSourceImage();
        const countX = Math.floor(totalWidth / w) * scrollFactor;
        const countY = Math.floor(totalHeight / h) * scrollFactor;

        let y = -h;
        for (let i = 0; i < countY + 3; i++) {
            let x = -w;
            for (let j = 0; j < countX + 3; ++j) {
                const m = scene.add
                    .image(x, y, texture)
                    .setOrigin(0, 1)
                    .setScrollFactor(scrollFactor)
                    .setAngle(angle);

                x += m.width;
            }
            y += scene.scale.height;
        }
    }

    loadBackground(textureKey: string, parallaxCoef: number, bounds = true, debug = true) {
        const json = this.getTextureJson(textureKey);
        const { w: width, h: height } = json.meta.size;

        const [centerX, centerY] = this.getCameraParallaxCenterOffset(parallaxCoef);
        if (this.game.isClient) {
            this.add
                .image(centerX, centerX, textureKey)
                .setOrigin(0.5)
                .setScrollFactor(parallaxCoef);
        }

        if (debug) {
            // Physics of Parralaxed rectangle
            const red = this.add
                .rectangle(0, 0, width, height)
                .setOrigin(0.5)
                .setStrokeStyle(2, 0xff0000)
                .setScrollFactor(1);

            // Position (texture) of Parralaxed rectangle
            const blue = this.add
                .rectangle(centerX, centerY, width, height)
                .setOrigin(0.5)
                .setStrokeStyle(3, 0x1a65ac)
                .setScrollFactor(parallaxCoef);

            // Physics of Parralaxed rectangle,
            // scaled to match the parralax
            const pink = this.add
                .rectangle(0, 0, width * (1 / parallaxCoef), height * (1 / parallaxCoef))
                .setOrigin(0.5)
                .setStrokeStyle(2, 0xffc0cb)
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
    }

    getCameraParallaxCenterOffset(scrollFactor): [number, number] {
        const { main } = this.cameras;
        const { centerX, centerY, scrollX, scrollY } = main;

        const offsetX = (centerX - scrollX) * (1 - scrollFactor);
        const offsetY = (centerY - scrollY) * (1 - scrollFactor);

        return [offsetX, offsetY];
    }

    // https://newdocs.phaser.io/docs/3.54.0/focus/Phaser.GameObjects.Container-setScrollFactor
    // Scrolling factor doesn't adjust the collision boundaries,
    // so they need to be adjusted manually
    // TODO look at 'space' example
    getScrollingFactorCollisionAdjustment(
        parallax,
        textureWidth,
        textureHeight
    ): [{ x: number; y: number }, { width: number; height: number }] {
        const csx = this.cameras.main.scrollX;
        const csy = this.cameras.main.scrollY;

        const px = 0 + csx * parallax - csx;
        const py = 0 + csy * parallax - csy;

        const imageOffset: { x: number; y: number } = { x: px, y: py };
        const boundsSize: { width: number; height: number } = {
            width: (textureWidth * 1) / parallax,
            height: (textureHeight * 1) / parallax,
        };
        return [imageOffset, boundsSize];
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
