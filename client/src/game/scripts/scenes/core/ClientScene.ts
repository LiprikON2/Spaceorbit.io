import { InputManager, MobManager, SoundManager } from "~/managers";
import { Spaceship, GenericText } from "~/objects";
import { BaseScene } from "~/scenes/core";

export class ClientScene extends BaseScene {
    inputManager;
    soundManager;
    mobManager;
    player;
    background;
    debugText;
    mobs = [];

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    // TODO use polyfill or something to prevent game from stopping requesting animation frames on blur
    create() {
        super.create();

        this.soundManager = new SoundManager(this);
        this.mobManager = new MobManager(this);
        this.player = new Spaceship(
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
        // Init input manager
        this.inputManager = new InputManager(this, this.player);

        this.soundManager.makeTarget(this.player);
        this.soundManager.addMusic(["track_1", "track_2", "track_3"], true);

        this.debugText = new GenericText(this, this.player).setDepth(1000);
        this.mobManager.spawnMobs(0, [this.player]);

        // Prevents shield from running away when ship hits the world bounds
        this.physics.world.on("worldbounds", (body) => {
            const UUID = body.gameObject.name.length >= 36 ? body.gameObject.name : undefined;
            if (UUID) {
                const collidingShip = this.children.getByName(UUID);
                if (collidingShip) {
                    // @ts-ignore
                    collidingShip.shields.x = collidingShip.x;
                    // @ts-ignore
                    collidingShip.shields.y = collidingShip.y;
                }
            }
        });
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

    getRandomPositionOnMap(margin = 300) {
        const maxX = this.physics.world.bounds.width;
        const maxY = this.physics.world.bounds.height;
        const randomX = Phaser.Math.Between(margin, maxX - margin);
        const randomY = Phaser.Math.Between(margin, maxY - margin);

        return { x: randomX, y: randomY };
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        this.inputManager.update(time, delta);
        this.debugText.update();
        this.mobManager.update(time, delta);
        this.soundManager.updateLooping();
        this.player.update();
    }
}
