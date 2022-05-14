import Spaceship from "../objects/spaceship";
import FpsText from "../objects/fpsText";

export default class MainScene extends Phaser.Scene {
    fpsText: FpsText;
    player;
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
        this.player = new Spaceship(this, this.cameras.main.width / 2, 0, "spaceship");
        this.fpsText = new FpsText(this);

        // Look at the cursor
        this.input.on("pointermove", (event) => {
            this.player.lookAtPoint(event.x, event.y);
        });
        // Look at the cursor
        this.input.keyboard.on("keydown-SPACE", (event) => {
            this.player.shoot();
        });
    }

    update() {
        this.fpsText.update();
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
}
