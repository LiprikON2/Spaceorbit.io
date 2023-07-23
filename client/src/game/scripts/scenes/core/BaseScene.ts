import Factory from "phaser3-rex-plugins/plugins/gameobjects/container/containerlite/Factory";

import type { GameClient } from "~/game/core/client/GameClient";
import {
    type AllegianceKeys,
    Spaceship,
    type SpaceshipClientOptions,
    type SpaceshipServerOptions,
} from "~/game/objects/Sprite/Spaceship";
import type { Projectile } from "~/objects/Sprite/Spaceship/components";
import { MobManager } from "~/managers";
import { Status } from "../../..";

export type SpaceshipGroup = {
    getChildren: () => Spaceship[];
    getMatching: (
        property?: string,
        value?: any,
        startIndex?: number,
        endIndex?: number
    ) => Spaceship[];
} & Phaser.GameObjects.Group;

export type ProjectileGroup = {
    getChildren: () => Projectile[];
    getMatching: (
        property?: string,
        value?: any,
        startIndex?: number,
        endIndex?: number
    ) => Projectile[];
} & Phaser.GameObjects.Group;

/**
 * BaseScene is a scene, which provides shared logic between ClientScene and ServerScene
 */
export class BaseScene extends Phaser.Scene {
    game: GameClient | Phaser.Game;
    rootElem: HTMLElement | null;
    mobManager: MobManager;
    plugins: Phaser.Plugins.PluginManager;
    add: Phaser.GameObjects.GameObjectFactory & { rexContainerLite: Factory };
    playerGroup: SpaceshipGroup;
    otherPlayersGroup: SpaceshipGroup;
    mobGroup: SpaceshipGroup;
    allGroup: SpaceshipGroup;
    projectileGroup: ProjectileGroup;
    cumDelta = 0;

    get isClient() {
        return Boolean(this.rootElem);
    }
    get isServer() {
        return !this.isClient;
    }

    get halfWorldWidth() {
        return this.physics.world.bounds.width / 2;
    }
    get halfWorldHeight() {
        return this.physics.world.bounds.height / 2;
    }

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
        this.projectileGroup = this.add.group() as ProjectileGroup;
    }

    create() {}

    update(time: number, delta: number) {}

    getTextureJson(textureKey) {
        return this.cache.json.get(textureKey + "_json");
    }

    createPlayer(
        serverOptions: SpaceshipServerOptions,
        clientOptions?: Partial<SpaceshipClientOptions>,
        isMe = false
    ) {
        const defaultClientOptions = {
            allGroup: this.allGroup,
            scene: this,
            toPassTexture: true,
        };
        const mergedClientOptions = { ...defaultClientOptions, ...clientOptions };
        const player = new Spaceship(serverOptions, mergedClientOptions);

        if (!isMe) this.otherPlayersGroup.add(player);
        this.playerGroup.add(player);
        this.allGroup.add(player);

        return player;
    }

    destroyPlayer(playerId: string) {
        const [player] = this.playerGroup.getMatching("id", playerId) as Spaceship[];
        if (player) {
            player.on("destroy", () => console.log("Was destroyed:", playerId));

            this.allGroup.remove(player);
            this.playerGroup.remove(player);
            this.allGroup.remove(player);
            player.destroyFully();
        }
    }

    getPlayerServerOptions(id?) {
        const playerCount = this.playerGroup.getLength();
        const spaceshipServerOptions: SpaceshipServerOptions = {
            id: id ?? Phaser.Utils.String.UUID(),
            x: 400,
            y: 400,
            angle: 0,
            // TODO spaceship factory pattern
            outfit: this.getPlayerKit(),
            atlasTexture: "F5S4",
            multipliers: { speed: 1, health: 1, shields: 1, damage: 1 },
            username: "Player" + (playerCount + 1),
            allegiance: "Unaffiliated",
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

    hitEntity(entityId: string, damage: number) {
        const [entity] = this.allGroup.getMatching("id", entityId);
        if (entity) entity.getHit(damage);
    }

    respawnEntity(
        entityId: string,
        point: { worldX: number; worldY: number } = { worldX: null, worldY: null }
    ) {
        console.log("entity:respawn");
        let { worldX, worldY } = point;
        const [entity] = this.allGroup.getMatching("id", entityId) as Spaceship[];

        if (entity?.isDead) {
            const rogueAllegiances: AllegianceKeys[] = ["Alien", "Unaffiliated"];
            if (point.worldX && point.worldY) {
                entity.respawn(point.worldX, point.worldY);
            } else {
                if (rogueAllegiances.includes(entity.allegiance)) {
                    [worldX, worldY] = entity.respawn();
                } else {
                    [worldX, worldY] = entity.respawn(0, 0);
                }
            }
        }

        return [worldX, worldY];
    }

    updateEntityStatus(id: string, status: Status) {
        const [entity] = this.allGroup.getMatching("id", id);
        if (entity) entity.setStatus(status);
    }

    everyTick(tickrate: number, delta: number, callback: Function) {
        const tickrateDeltaTime = 1000 / tickrate;

        this.cumDelta += delta;
        if (this.cumDelta > tickrateDeltaTime) {
            this.cumDelta = 0;
            callback();
        }
    }
}
