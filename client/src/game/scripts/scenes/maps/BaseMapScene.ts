import { BaseScene } from "../core/BaseScene";

export class BaseMapScene extends BaseScene {
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    create() {
        super.create();

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

    loadBackground(texture: string, parallax: number) {
        const json = this.cache.json.get(texture + "_json");

        const { w: width, h: height } = json.meta.size;
        const [imageOffset, boundsSize] = this.getScrollingFactorCollisionAdjustment(
            parallax,
            width,
            height
        );
        if (this.textures.exists(texture)) {
            this.add
                .image(imageOffset.x, imageOffset.y, texture)
                .setOrigin(0, 0)
                .setScrollFactor(parallax);
        }

        // TODO solve magic numbers
        // TODO make it obvious when you hit world bounds
        this.physics.world.setBounds(0, 0, boundsSize.width - 500, boundsSize.height - 700);

        const { color } = json.meta.bgColor;
        this.updateRootBackground(color);
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
}
