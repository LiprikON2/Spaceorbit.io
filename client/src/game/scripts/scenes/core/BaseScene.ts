import Factory from "phaser3-rex-plugins/plugins/gameobjects/container/containerlite/Factory";

import {
    AllegianceEnum,
    Spaceship,
    type SpaceshipClientOptions,
    type SpaceshipServerOptions,
} from "~/game/objects/ship/spaceship";
import { MobManager } from "~/managers";

type SpaceshipGroup = {
    getChildren: () => Spaceship[];
} & Phaser.GameObjects.Group;

/**
 * BaseScene is a scene, which provides shared logic between ClientScene and ServerScene
 */
export class BaseScene extends Phaser.Scene {
    rootElem: HTMLElement;
    mobManager: MobManager;
    plugins: Phaser.Plugins.PluginManager;
    add: Phaser.GameObjects.GameObjectFactory & { rexContainerLite: Factory };
    playerGroup: SpaceshipGroup;
    otherPlayersGroup: SpaceshipGroup;
    mobGroup: SpaceshipGroup;
    allGroup: SpaceshipGroup;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.rootElem = document.getElementById("phaser-game");
        this.mobManager = new MobManager(this);
    }

    preload() {
        this.playerGroup = this.add.group({ runChildUpdate: true }) as SpaceshipGroup;
        this.otherPlayersGroup = this.add.group() as SpaceshipGroup;
        this.mobGroup = this.add.group({ runChildUpdate: true }) as SpaceshipGroup;
        this.allGroup = this.add.group() as SpaceshipGroup;

        this.allGroup.getChildren();
    }

    create() {}

    update(time: number, delta: number) {}

    createPlayer(
        serverOptions: SpaceshipServerOptions,
        clientOptions?: Partial<SpaceshipClientOptions>,
        isOther = false
    ) {
        const defaultClientOptions = {
            allGroup: this.allGroup,
            scene: this,
        };
        const mergedClientOptions = { ...defaultClientOptions, ...clientOptions };
        const player = new Spaceship(serverOptions, mergedClientOptions);

        if (isOther) this.otherPlayersGroup.add(player);
        this.playerGroup.add(player);
        this.allGroup.add(player);

        return player;
    }

    getPlayerServerOptions(id?) {
        const spaceshipServerOptions: SpaceshipServerOptions = {
            id: id ?? Phaser.Utils.String.UUID(),
            x: 400,
            y: 400,
            // TODO spaceship factory pattern
            outfit: this.getPlayerKit(),
            atlasTexture: "F5S4",
            multipliers: { speed: 1, health: 1, shields: 1, damage: 1 },
            username: "Player",
            allegiance: AllegianceEnum.Earth,
            depth: 100,
        };

        return spaceshipServerOptions;
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
