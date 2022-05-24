import GenericText from "../objects/genericText";
import Button from "../button";

export default class HUDScene extends Phaser.Scene {
    debugText: GenericText;
    player;
    currentScene;

    constructor() {
        super({ key: "HUDScene" });
    }
    init() {
        this.currentScene = this.scene.get("MainScene");
    }

    create() {
        const player = this.currentScene.player;
        const game = this.currentScene.game;
        this.debugText = new GenericText(this, player).setDepth(1000);
        console.log("game", game);

        const button = new Button(
            game.config.width - 20,
            game.config.height - 20,
            "Add engine",
            this,
            () => {
                console.log("click!");
                player.exhaust.createExhaust();
            }
        );
    }
    update() {
        this.debugText.update();
    }
}
