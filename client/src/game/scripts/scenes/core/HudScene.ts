import { DebugInfo } from "~/game/objects";
import type { ClientScene } from "./ClientScene";

export class HudScene extends Phaser.Scene {
    debugInfo: DebugInfo;
    parentScene: ClientScene;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super("HudScene");
    }

    init(parentScene: ClientScene) {
        this.parentScene = parentScene;
        this.scene.bringToTop("HudScene");
    }

    create() {
        this.debugInfo = new DebugInfo(this);
    }

    update(time: number, delta: number) {
        this.debugInfo.update();
    }
}
