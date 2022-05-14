import Spaceship from "../objects/spaceship";
import GenericText from "../objects/genericText";

export default class MainScene extends Phaser.Scene {
    debugText: GenericText;
    player;
    background;
    keys;
    debugTextDict;
    constructor() {
        super({ key: "MainScene" });
    }

    create() {
        // Init keys
        this.keys = this.input.keyboard.addKeys("W,A,S,D,SPACE");
        this.loadBackground("bg 1-1");

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
                this.player.lookAtPoint(event.x, event.y);
            },
            this
        );
    }

    update() {
        this.debugText.update();
        this.player.setVelocity(0);

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

    loadBackground(texture: string | Phaser.Textures.Texture) {
        const image = this.add
            .image(this.cameras.main.width, this.cameras.main.height, texture)
            .setOrigin(1, 1);
        const scaleX = this.cameras.main.width / image.width;
        const scaleY = this.cameras.main.height / image.height;
        const scale = Math.max(scaleX, scaleY);
        image.setScale(scale);
        // todo dynamically get bg average dark color
        this.updateRootBackground("#181814");
    }
}
