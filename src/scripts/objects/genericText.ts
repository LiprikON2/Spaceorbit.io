export default class FpsText extends Phaser.GameObjects.Text {
    player;
    constructor(scene, player) {
        super(scene, 10, 10, "", { color: "white", fontSize: "2rem" });
        scene.add.existing(this);
        this.setOrigin(0);
        this.player = player;
    }

    public update() {
        this.setText(
            `fps: ${Math.floor(this.scene.game.loop.actualFps)}\nx: ${this.player.x} y: ${
                this.player.y
            }`
        );
    }
}
