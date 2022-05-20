import Spaceship from "../objects/spaceship";
import GenericText from "../objects/genericText";

export default class MainScene extends Phaser.Scene {
    debugText: GenericText;
    player;
    background;
    keys;
    debugTextDict = {};
    backgroundDict = {};
    screen;
    emitter;
    constructor() {
        super({ key: "MainScene" });
    }

    create() {
        // Init keys
        this.keys = this.input.keyboard.addKeys("W,A,S,D,SPACE,CTRL,UP,LEFT,DOWN,RIGHT");

        this.player = new Spaceship(
            this,
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "spaceship"
        ).setDepth(10);
        this.cameras.main.startFollow(this.player);
        this.debugText = new GenericText(this, this.player).setDepth(100);
        this.loadBackground("map_1-1", 0.5);
        // this.loadBackground("particles", 0.5, true);
        this.createAligned(
            this,
            this.physics.world.bounds.width,
            this.physics.world.bounds.height,
            "particles",
            0.75
        );
        this.createAligned(
            this,
            this.physics.world.bounds.width,
            this.physics.world.bounds.height,
            "particles",
            1,
            180
        );

        // Make player look at the cursor
        this.input.on("pointermove", (event) => {
            this.player.lookAtPoint(event.worldX, event.worldY);
        });
    }

    update() {
        this.debugText.update();
        this.updateBackground();

        this.player.stopMoving();

        // Key bindings
        const upBtn = this.keys.W.isDown || this.keys.UP.isDown;
        const leftBtn = this.keys.A.isDown || this.keys.LEFT.isDown;
        const rightBtn = this.keys.D.isDown || this.keys.RIGHT.isDown;
        const downBtn = this.keys.S.isDown || this.keys.DOWN.isDown;
        const primaryShootBtn = this.input.activePointer.isDown;

        // Moving
        if (upBtn && !leftBtn && !downBtn && !rightBtn) {
            this.player.moveUp();
        } else if (!upBtn && leftBtn && !downBtn && !rightBtn) {
            this.player.moveLeft();
        } else if (!upBtn && !leftBtn && downBtn && !rightBtn) {
            this.player.moveDown();
        } else if (!upBtn && !leftBtn && !downBtn && rightBtn) {
            this.player.moveRight();
        } else if (upBtn && leftBtn && !downBtn && !rightBtn) {
            this.player.moveUpLeft();
        } else if (upBtn && !leftBtn && !downBtn && rightBtn) {
            this.player.moveUpRight();
        } else if (!upBtn && leftBtn && downBtn && !rightBtn) {
            this.player.moveDownLeft();
        } else if (!upBtn && !leftBtn && downBtn && rightBtn) {
            this.player.moveDownRight();
        }

        // Shooting
        if (primaryShootBtn) {
            this.player.shoot();
        }
    }

    updateRootBackground(color?) {
        const root = document.getElementById("phaser-game");
        root!.style.backgroundColor = color ?? "#1d252c";
    }

    createAligned = (
        scene: Phaser.Scene,
        totalWidth: number,
        totalHeight: number,
        texture: string,
        scrollFactor: number,
        angle: number = 0
    ) => {
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
    };

    loadBackground(texture: string, parallax: number) {
        const background = this.add.image(0, 0, texture).setOrigin(0);
        // Check if texture name corresponds to the map texture,
        // for example: map_1-1, map_3-2...
        if (/map_\d-\d/g.test(texture)) {
            const offsetX = parallax * background.width;
            const offsetY = parallax * background.height;
            // TODO fix magic numer 37
            this.physics.world.setBounds(
                0,
                0,
                background.width + 2 * offsetX - 2 * 1.5 * (0.5 * this.player.hitboxRadius),
                background.height + 2 * offsetY - 2 * 1.5 * (0.5 * this.player.hitboxRadius)
            );
        }

        this.backgroundDict[texture] = background;
        this.backgroundDict[texture].parallax = parallax;

        // background.setScale(mapScale);

        // TODO blur map edges
        this.updateRootBackground("#181814");
    }
    updateBackground() {
        for (const [key, value] of Object.entries(this.backgroundDict)) {
            // parallax
            // this.backgroundDict[key].x =
            //     this.cameras.main.scrollX * this.backgroundDict[key].parallax;
            // this.backgroundDict[key].y =
            //     this.cameras.main.scrollY * this.backgroundDict[key].parallax;
            this.backgroundDict[key].x = this.player.body.x * this.backgroundDict[key].parallax;
            this.backgroundDict[key].y = this.player.body.y * this.backgroundDict[key].parallax;
        }
    }
}
