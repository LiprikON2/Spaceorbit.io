import type { HudScene } from "~/scenes/core";
import type { Keys } from "../managers/BaseInputManager";

export class DebugInfo extends Phaser.GameObjects.Text {
    declare scene: HudScene;
    keys: Keys;

    constructor(scene) {
        super(scene, 0, 0, "", {
            color: "rgba(255, 255, 255, 0.7)",
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

    rounded(number: number | string) {
        return Math.floor(Number(number)) ?? 0;
    }

    updatePos(displaySize: { width: number; height: number }) {
        this.setX(displaySize.width - 25);
        this.setY(100);
    }

    showHitboxes() {
        this.scene.parentScene.physics.world.drawDebug = true;
        this.scene.parentScene.parallaxDebug.forEach((hitbox) => hitbox.setVisible(true));
        this.scene.parentScene.gravityDebugVector?.setVisible(true);
    }
    hideHitboxes() {
        this.scene.parentScene.physics.world.drawDebug = false;
        this.scene.parentScene.physics.world.debugGraphic.clear();
        this.scene.parentScene.parallaxDebug.forEach((hitbox) => hitbox.setVisible(false));
        this.scene.parentScene.gravityDebugVector?.setVisible(false);
    }
    toggleHitboxes() {
        if (this.scene.parentScene.physics.world.drawDebug) this.hideHitboxes();
        else this.showHitboxes();
    }

    // TODO use circular buffer
    getSpriteInfo(sprite: any) {
        if (!sprite) return "";
        const textLines = [
            sprite.constructor.name,
            `\tx: ${this.rounded(sprite.x)} y: ${this.rounded(sprite.y)}`,
            `\tangle: ${this.rounded(sprite.angle)} speed: ${this.rounded(sprite.body.speed)}`,
            `\tvx: ${this.rounded(sprite.body.velocity.x)} vy: ${this.rounded(
                sprite.body.velocity.y
            )}`,
            `\tax: ${this.rounded(sprite.body.acceleration.x)} ay: ${this.rounded(
                sprite.body.acceleration.y
            )}`,
            "\n",
        ];

        return textLines.join("\n");
    }
    getDisplayInfo() {
        const { width: gameWidth, height: gameHeight } = this.scene.parentScene.scale.gameSize;
        const { width: baseWidth, height: baseSize } = this.scene.parentScene.scale.baseSize;
        const { width: displayWidth, height: displaySize } =
            this.scene.parentScene.scale.displaySize;

        const textLines = [
            "Display",
            `\tgameSize: ${this.rounded(gameWidth)}x${this.rounded(gameHeight)}`,
            `\tbaseSize: ${this.rounded(baseWidth)}x${this.rounded(baseSize)}`,
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

    getCamInfo() {
        const { scrollX, scrollY } = this.scene.cameras.main;
        const { x: midPointX, y: midPointY } = this.scene.cameras.main;

        const textLines = [
            // Top left corner of viewport
            "Camera scroll:",
            `\tx: ${this.rounded(scrollX)} y: ${this.rounded(scrollY)}`,
            // Center of viewport
            "Camera midPoint:",
            `\tx: ${this.rounded(midPointX)} y: ${this.rounded(midPointY)}`,
            "\n",
        ];
        return textLines.join("\n");
    }

    public update() {
        let text = "";
        text += `Zoom: ${this.scene.parentScene.cameras.main.zoom.toFixed(2)}\n`;
        text += this.getFpsPing();
        text += this.getDisplayInfo();

        text += this.getSpriteInfo(this.scene.parentScene.player);
        text += this.getSpriteInfo(this.scene.parentScene.player?.staticBox);

        text += this.getCamInfo();

        text += `World: ${this.scene.parentScene.physics.world.bounds.width}x${this.scene.parentScene.physics.world.bounds.height}\n\n`;
        text += `HP: ${this.rounded(this.scene.parentScene.player?.status?.health)}\n`;
        text += `Shields: ${this.rounded(this.scene.parentScene.player?.status?.shields)}\n`;

        this.setText(text);
    }
}
