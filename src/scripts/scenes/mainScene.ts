import Spaceship from "../objects/spaceship";
import GenericText from "../objects/genericText";

export default class MainScene extends Phaser.Scene {
    debugText: GenericText;
    player;
    background;
    keys = {};
    constructor() {
        super({ key: "MainScene" });
        // const spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // const W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        // const A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        // const S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        // const D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // this.keys = {
        //     spacebar,
        //     W,
        //     A,
        //     S,
        //     D,
        // };
    }

    create() {
        this.loadBackground("bg 1-1");

        this.player = new Spaceship(
            this,
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "spaceship"
        );

        this.debugText = new GenericText(this, {
            fps: Math.floor(this.game.loop.actualFps),
            x: this.player.x,
            y: this.player.y,
        });

        // Make player look at the cursor
        this.input.on(
            "pointermove",
            (event) => {
                this.player.lookAtPoint(event.x, event.y);
            },
            this
        );
        // Make player shoot by precssing spacebar
        this.input.keyboard.on(
            "keydown-SPACE",
            (event) => {
                this.player.shoot();
            },
            this
        );
    }

    update() {
        this.debugText.update();
        // console.log("Phaser.Input.Keyboard", Phaser.Input.Keyboard);
        // if (Phaser.Input.Keyboard == this.keys["SPACE"]) {
        //     this.player.shoot();
        // }
        // if (key == this.keys["W"]) {
        //     this.player.moveUp();
        // }
        // if (key == this.keys["A"]) {
        //     this.player.moveLeft();
        // }
        // if (key == this.keys["S"]) {
        //     this.player.moveDown();
        // }
        // if (key == this.keys["D"]) {
        //     this.player.moveRight();
        // }
    }

    loadBackground(texture: string | Phaser.Textures.Texture) {
        const image = this.add
            .image(this.cameras.main.width, this.cameras.main.height, texture)
            .setScale(100)
            .setOrigin(1, 1);
        const scaleX = this.cameras.main.width / image.width;
        const scaleY = this.cameras.main.height / image.height;
        const scale = Math.max(scaleX, scaleY);
        image.setScale(scale).setScrollFactor(0);
    }
}
