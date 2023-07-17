import type { Spaceship } from "~/objects/ship/Spaceship";
export class DebugInfo extends Phaser.GameObjects.Text {
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

    public update() {
        let text = "";
        // text += `zoom: ${this.scene.cameras.main.zoom.toFixed(2)}\n`;
        text += `fps: ${Math.floor(this.scene.game.loop.actualFps)}\n`;
        text += `${Math.floor(Number(this.scene.game.config.width))}x${Math.floor(
            Number(this.scene.game.config.height)
        )}\n\n`;

        text += this.getSpriteInfo(this.player);
        text += this.getSpriteInfo(this.player.boundingBox);
        text += `world: ${this.scene.physics.world.bounds.width}x${this.scene.physics.world.bounds.height}\n\n`;
        text += `hp: ${this.player.status.health}\n`;
        text += `shields: ${this.player.status.shields}\n`;

        this.setText(text);
    }
}
