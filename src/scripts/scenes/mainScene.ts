import Spaceship from "../objects/spaceship";
import GenericText from "../objects/genericText";

export default class MainScene extends Phaser.Scene {
    debugText: GenericText;
    player;
    background;
    keys;
    debugTextDict;
    backgroundDict = {};
    constructor() {
        super({ key: "MainScene" });
    }

    create() {
        // Init keys
        this.keys = this.input.keyboard.addKeys("W,A,S,D,SPACE");

        this.player = new Spaceship(
            this,
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "spaceship"
        ).setDepth(10);
        this.cameras.main.startFollow(this.player);
        this.debugText = new GenericText(this, this.player).setDepth(100);
        this.loadBackground("map_1-1", 0.5);
        this.loadBackground("particles", 0.25, true);

        // Make player look at the cursor
        this.input.on(
            "pointermove",
            (event) => {
                this.player.lookAtPoint(event.worldX, event.worldY);
            },
            this
        );
    }

    update() {
        this.debugText.update();
        this.player.setVelocity(0);
        this.updateBackground();

        // Handle player movement
        if (this.keys.A.isDown) {
            this.player.setVelocityX(-1000);
        } else if (this.keys.D.isDown) {
            this.player.setVelocityX(1000);
        }
        if (this.keys.W.isDown) {
            this.player.setVelocityY(-1000);
        } else if (this.keys.S.isDown) {
            this.player.setVelocityY(1000);
        }

        // Make player shoot by pressing spacebar
        if (this.keys.SPACE.isDown) {
            this.player.shoot();
        }
    }

    updateRootBackground(color?) {
        const root = document.getElementById("phaser-game");
        root!.style.backgroundColor = color ?? "#1d252c";
    }

    loadBackground(texture: string, parallax: number, isTileSprite = false) {
        let background;
        if (!isTileSprite) {
            background = this.add.image(0, 0, texture).setOrigin(0);
        } else {
            console.log("this.physics.world.bounds", this.physics.world.bounds);
            background = this.add
                .tileSprite(
                    this.physics.world.bounds.centerX,
                    this.physics.world.bounds.centerY,
                    17280,
                    9720,
                    texture
                )
                .setOrigin(0.5);
        }
        // Check if texture name corresponds to the map texture,
        // for example: map_1-1, map_3-2...
        if (/map_\d-\d/g.test(texture)) {
            const offsetX = parallax * background.width;
            const offsetY = parallax * background.height;
            // TODO fix magic numer 37
            this.physics.world.setBounds(
                0,
                0,
                background.width + offsetX * 2 - 2 * 37,
                background.height + offsetY * 2 - 2 * 37
            );
        }

        this.backgroundDict[texture] = background;
        this.backgroundDict[texture].parallax = parallax;

        // background.setScale(mapScale);

        // todo dynamically get bg average dark color
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
