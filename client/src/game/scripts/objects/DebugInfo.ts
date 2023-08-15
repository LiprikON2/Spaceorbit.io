import type { ClientScene } from "~/scenes/core";
import type { Spaceship } from "~/objects/Sprite/Spaceship";
import type { Keys } from "../managers/BaseInputManager";
export class DebugInfo extends Phaser.GameObjects.Text {
    scene: ClientScene;
    player: Spaceship;
    keys: Keys;

    constructor(scene, player) {
        super(scene, scene.game.config.width * 0.9, 100, "", {
            color: "rgba(255, 255, 255, 0.6)",
            font: "300 1.5rem Kanit",
        });
        scene.add.existing(this);
        this.setOrigin(0).setScrollFactor(0);
        this.player = player;

        this.keys = this.scene.input.keyboard.addKeys("F3,F4") as Keys;

        this.setVisible(false);
        this.keys.F3.on("down", () => this.setVisible(!this.visible));

        this.hideHitboxes();
        this.keys.F4.on("down", () => this.toggleHitboxes());
    }

    showHitboxes() {
        this.scene.physics.world.drawDebug = true;
    }
    hideHitboxes() {
        this.scene.physics.world.drawDebug = false;
        this.scene.physics.world.debugGraphic.clear();
    }
    toggleHitboxes() {
        if (this.scene.physics.world.drawDebug) this.hideHitboxes();
        else this.showHitboxes();
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

        // (top left corner of viewport)
        text += `camera scroll:\n\tx: ${this.rounded(
            this.scene.cameras.main.scrollX
        )} y: ${this.rounded(this.scene.cameras.main.scrollY)}\n`;
        // (center of viewport)
        text += `camera midPoint:\n\tx: ${this.rounded(
            this.scene.cameras.main.midPoint.x
        )} y: ${this.rounded(this.scene.cameras.main.midPoint.y)}\n`;

        text += `world: ${this.scene.physics.world.bounds.width}x${this.scene.physics.world.bounds.height}\n\n`;
        text += `hp: ${this.rounded(this.player.status.health)}\n`;
        text += `shields: ${this.rounded(this.player.status.shields)}\n`;

        this.setText(text);
    }
}
