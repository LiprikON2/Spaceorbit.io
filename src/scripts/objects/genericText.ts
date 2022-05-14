export default class FpsText extends Phaser.GameObjects.Text {
    player;
    constructor(scene, player) {
        super(scene, 10, 10, "", { color: "white", fontSize: "2rem" });
        scene.add.existing(this);
        this.setOrigin(0).setScrollFactor(0);
        this.player = player;
    }

    public update() {
        let text = "";
        text += `fps: ${Math.floor(this.scene.game.loop.actualFps)}\n`;
        text += `x: ${Math.floor(this.player.x)} y: ${Math.floor(this.player.y)}\n`;

        this.setText(text);
    }
}
