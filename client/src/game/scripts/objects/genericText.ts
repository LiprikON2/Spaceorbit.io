export class GenericText extends Phaser.GameObjects.Text {
    player;
    constructor(scene, player) {
        super(scene, scene.game.config.width * 0.85, 100, "", { color: "white", fontSize: "2rem" });
        scene.add.existing(this);
        this.setOrigin(0).setScrollFactor(0);
        this.player = player;
    }

    public update() {
        let text = "";
        text += `fps: ${Math.floor(this.scene.game.loop.actualFps)}\n`;

        text += `ship:\n`;
        text += `\tx: ${Math.floor(this.player.x)} y: ${Math.floor(this.player.y)}\n`;
        text += `\tangle: ${Math.floor(this.player.angle)}\n`;
        text += `\tz: ${Math.floor(this.player.z)} w: ${Math.floor(this.player.w)}\n`;

        text += `bounding box:\n`;
        text += `\tx: ${Math.floor(this.player.boundingBox.x)} y: ${Math.floor(
            this.player.boundingBox.y
        )}\n`;
        text += `\tangle: ${Math.floor(this.player.boundingBox.angle)}\n`;
        // text += `zoom: ${this.scene.cameras.main.zoom.toFixed(2)}\n`;
        text += `${Math.floor(Number(this.scene.game.config.width))}x${Math.floor(
            Number(this.scene.game.config.height)
        )}\n`;

        this.setText(text);
    }
}
