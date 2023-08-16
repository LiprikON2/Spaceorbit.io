import type { HudScene } from "~/scenes/core";
import type { Keys } from "../managers/BaseInputManager";

export class DebugInfo extends Phaser.GameObjects.Text {
    scene: HudScene;
    keys: Keys;

    constructor(scene) {
        super(scene, 0, 0, "", {
            color: "rgba(255, 255, 255, 0.75)",
            font: "300 1.5rem Kanit",
        });
        scene.add.existing(this);

        this.setOrigin(1, 0).setScrollFactor(0);

        this.keys = this.scene.input.keyboard.addKeys("F3,F4") as Keys;

        this.setVisible(false);
        this.keys.F3.on("down", () => this.setVisible(!this.visible));

        this.hideHitboxes();
        this.keys.F4.on("down", () => this.toggleHitboxes());

        this.updatePos(this.scene.scale.displaySize);
        this.scene.scale.on("resize", (gameSize, baseSize, displaySize) =>
            this.updatePos(displaySize)
        );
    }

    updatePos(displaySize: { width: number; height: number }) {
        this.setX(displaySize.width - 25);
        this.setY(100);
    }

    showHitboxes() {
        this.scene.parentScene.physics.world.drawDebug = true;
        this.scene.parentScene.parallaxDebug.forEach((hitbox) => hitbox.setVisible(true));
    }
    hideHitboxes() {
        this.scene.physics.world.drawDebug = false;
        this.scene.physics.world.debugGraphic.clear();
        this.scene.parentScene.parallaxDebug.forEach((hitbox) => hitbox.setVisible(false));
    }
    toggleHitboxes() {
        if (this.scene.physics.world.drawDebug) this.hideHitboxes();
        else this.showHitboxes();
    }

    getSpriteInfo(sprite: any) {
        if (!sprite) return "";
        const textLines = [
            sprite.constructor.name,
            `\tx: ${Math.floor(sprite.x)} y: ${Math.floor(sprite.y)}`,
            `\tangle: ${Math.floor(sprite.angle)}`,
            `\tvx: ${Math.floor(sprite.body.velocity.x)} vy: ${Math.floor(sprite.body.velocity.y)}`,
            "\n",
        ];

        return textLines.join("\n");
    }
    getDisplayInfo() {
        const { width: gameWidth, height: gameHeight } = this.scene.scale.gameSize;
        const { width: baseWidth, height: baseSize } = this.scene.scale.baseSize;
        const { width: displayWidth, height: displaySize } = this.scene.scale.displaySize;

        const textLines = [
            "Display",
            `\tgameSize: ${gameWidth}x${gameHeight}`,
            `\tbaseSize: ${baseWidth}x${baseSize}`,
            `\tdisplaySize: ${this.rounded(displayWidth)}x${this.rounded(displaySize)}`,
            "\n",
        ];

        return textLines.join("\n");
    }

    getFpsPing() {
        const fps = this.rounded(this.scene.game.loop.actualFps);
        const ping = this.scene.parentScene.ping.avgDebounced;

        const textLines = [`fps: ${fps} ping: ${ping}`, "\n"];

        return textLines.join("\n");
    }

    rounded(number: number | string) {
        return Math.floor(Number(number)) ?? 0;
    }

    public update() {
        let text = "";
        text += `zoom: ${this.scene.cameras.main.zoom.toFixed(2)}\n`;
        text += this.getFpsPing();
        text += this.getDisplayInfo();

        text += this.getSpriteInfo(this.scene.parentScene.player);
        text += this.getSpriteInfo(this.scene.parentScene.player?.boundingBox);

        // (top left corner of viewport)
        text += `camera scroll:\n\tx: ${this.rounded(
            this.scene.cameras.main.scrollX
        )} y: ${this.rounded(this.scene.cameras.main.scrollY)}\n`;
        // (center of viewport)
        text += `camera midPoint:\n\tx: ${this.rounded(
            this.scene.cameras.main.midPoint.x
        )} y: ${this.rounded(this.scene.cameras.main.midPoint.y)}\n`;

        text += `world: ${this.scene.physics.world.bounds.width}x${this.scene.physics.world.bounds.height}\n\n`;
        text += `hp: ${this.rounded(this.scene.parentScene.player?.status?.health)}\n`;
        text += `shields: ${this.rounded(this.scene.parentScene.player?.status?.shields)}\n`;

        this.setText(text);
    }
}
