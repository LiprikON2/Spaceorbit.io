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
        this.loadBackground("bg 1-1", 0.5);
        this.loadBackground("particles", 0.1);

        this.player = new Spaceship(
            this,
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "spaceship"
        );
        this.cameras.main.startFollow(this.player);
        this.debugText = new GenericText(this, this.player);

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

        // Parralax
        this.backgroundDict["bg 1-1"].x =
            this.cameras.main.scrollX * this.backgroundDict["bg 1-1"].parralax;
        this.backgroundDict["bg 1-1"].y =
            this.cameras.main.scrollY * this.backgroundDict["bg 1-1"].parralax;

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

    loadBackground(texture: string, parralax: number) {
        const gameWidth = Number(this.game.config.width);
        const gameHeight = Number(this.game.config.height);

        const dimX = gameWidth * 2;
        const dimY = gameHeight * 2;

        const parralaxMarginX = parralax * gameWidth;
        const parralaxMarginY = parralax * gameHeight;

        this.physics.world.setBounds(
            -parralaxMarginX,
            -parralaxMarginY,
            dimX + parralaxMarginX * 4,
            dimY + parralaxMarginY * 4
        );

        const background = this.add.image(0, 0, texture).setOrigin(0);
        console.log("background", background);
        this.backgroundDict[texture] = background;
        this.backgroundDict[texture].parralax = parralax;

        const scaleX = dimX / background.width;
        const scaleY = dimY / background.height;
        const scale = Math.max(scaleX, scaleY);
        // TODO potentially squezes the image
        // background.setScale(scale);
        background.setScale(scaleX, scaleY);
        // todo dynamically get bg average dark color
        this.updateRootBackground("#181814");
    }
}
