import type { ClientScene } from "~/scenes/core";
import type { Spaceship } from "~/objects/Sprite/Spaceship";
export class DebugInfo extends Phaser.GameObjects.Text {
    scene: ClientScene;
    player: Spaceship;

    constructor(scene, player) {
        super(scene, scene.game.config.width * 0.82, 100, "", { color: "white", fontSize: "2rem" });
        scene.add.existing(this);
        this.setOrigin(0).setScrollFactor(0);
        this.player = player;
    }

    getSpriteInfo(sprite) {
        const textLines = [
            sprite.constructor.name,
            `\tx: ${Math.floor(sprite.x)} y: ${Math.floor(sprite.y)}`,
            `\tangle: ${Math.floor(sprite.angle)}`,
            `\tvx: ${Math.floor(sprite.body.velocity.x)} vy: ${Math.floor(sprite.body.velocity.y)}`,
            "\n",
        ];

        return textLines.join("\n");
    }
    rounded(number: number | string) {
        return Math.floor(Number(number));
    }

    public update() {
        let text = "";
        // text += `zoom: ${this.scene.cameras.main.zoom.toFixed(2)}\n`;
        text += `fps: ${this.rounded(this.scene.game.loop.actualFps)} ping: ${
            this.scene.ping.avgDebounced
        }\n`;
        text += `${this.rounded(this.scene.game.config.width)}x${this.rounded(
            this.scene.game.config.height
        )}\n\n`;

        text += this.getSpriteInfo(this.player);
        text += this.getSpriteInfo(this.player.boundingBox);
        text += `world: ${this.scene.physics.world.bounds.width}x${this.scene.physics.world.bounds.height}\n\n`;
        text += `hp: ${this.rounded(this.player.status.health)}\n`;
        text += `shields: ${this.rounded(this.player.status.shields)}\n`;

        this.setText(text);
    }
}
