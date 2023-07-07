import { MobManager } from "~/managers";
import { Spaceship } from "~/objects";
import type { GameClient } from "~/game";

/**
 * BaseScene is a scene, which provides shared logic between ClientScene and ServerScene
 */
export class BaseScene extends Phaser.Scene {
    rootElem: HTMLElement;
    game: GameClient;
    mobManager: MobManager;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.rootElem = document.getElementById("phaser-game");
        this.mobManager = new MobManager(this);
    }

    preload() {}

    create() {}

    update(time: number, delta: number) {}

    createPlayer() {
        return new Spaceship(
            this,
            400,
            400,
            "F5S4",
            this.getPlayerKit(),
            undefined,
            "Player",
            this.mobManager.mobs,
            100
        );
    }

    getPlayerKit() {
        return {
            weapons: [
                { itemName: "laser", itemType: "weapons", label: "Wpn", color: "red" },
                null,
                { itemName: "laser", itemType: "weapons", label: "Wpn", color: "red" },
                { itemName: "gatling", itemType: "weapons", label: "Wpn", color: "red" },
            ],
            engines: [null, null],
            inventory: [
                null,
                null,
                null,
                null,
                { itemName: "engine", itemType: "engines", label: "Eng", color: "yellow" },
                { itemName: "engine", itemType: "engines", label: "Eng", color: "yellow" },
                { itemName: "gatling", itemType: "weapons", label: "Wpn", color: "red" },
                { itemName: "gatling", itemType: "weapons", label: "Wpn", color: "red" },
                { itemName: "laser", itemType: "weapons", label: "Wpn", color: "red" },
            ],
        };
    }

    getRandomPositionOnMap(worldMargin = 300) {
        const maxX = this.physics.world.bounds.width;
        const maxY = this.physics.world.bounds.height;
        const randomX = Phaser.Math.Between(worldMargin, maxX - worldMargin);
        const randomY = Phaser.Math.Between(worldMargin, maxY - worldMargin);

        return { x: randomX, y: randomY };
    }
}
