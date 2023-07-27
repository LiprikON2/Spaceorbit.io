import Factory from "phaser3-rex-plugins/plugins/gameobjects/container/containerlite/Factory";
import type { Snapshot } from "@geckos.io/snapshot-interpolation/lib/types";
import type { ChannelId } from "@geckos.io/client";

import type { GameClient } from "~/game/core/client/GameClient";
import { Spaceship, type SpaceshipServerOptions } from "~/game/objects/Sprite/Spaceship";
import { type Actions, type ClientHitData, BaseEntityManager } from "~/managers";
import type { Status } from "~/objects/Sprite";
import type { MobServerOptions } from "~/game/objects/Sprite/Spaceship/Mob";

export interface MultiplayerEvents {
    "connection:established"?: {
        emit: null;
        on: () => void;
    };
    "player:request-options"?: {
        emit: null;
        on: (serverOptions: SpaceshipServerOptions) => void;
    };
    "player:connected"?: {
        emit: SpaceshipServerOptions;
        on: (serverOptions: SpaceshipServerOptions) => void;
    };
    "player:assert-hit"?: {
        emit: ClientHitData;
        on: () => void;
    };
    "player:request-respawn"?: {
        on: () => void;
    };
    "players:already-connected"?: {
        emit: null;
        on: (serverOptionsList: SpaceshipServerOptions[]) => void;
    };

    "world:mobs-options"?: {
        emit: null;
        on: (serverOptionsList: MobServerOptions[]) => void;
    };

    "player:actions"?: {
        emit: Partial<Actions> & { time: number };
        on: (actionsCompact: Partial<Actions> & { time: number }) => void;
    };
    "world:server-snapshot"?: {
        emit: Snapshot;
        on: (serverSnapshot: Snapshot) => void;
    };
    "entity:respawn"?: {
        emit: { id: string; point: { worldX: number; worldY: number } };
        on: (entityRespawnData: { id: string; point: { worldX: number; worldY: number } }) => void;
    };
    "entity:status"?: {
        emit: { id: string; status: Status };
        on: (entityStatusData: { id: string; status: Status }) => void;
    };
    "player:disconnected"?: {
        emit: ChannelId;
        on: (playerId: ChannelId) => void;
    };
    message?: {
        emit: { name: string; message: string; isoTime: string };
        on: (messageEntry: { name: string; message: string; isoTime: string }) => void;
    };
}

/**
 * BaseScene is a scene, which provides shared logic between ClientScene and ServerScene
 */
export class BaseScene extends Phaser.Scene {
    game: GameClient | Phaser.Game;
    rootElem: HTMLElement | null;
    plugins: Phaser.Plugins.PluginManager;
    add: Phaser.GameObjects.GameObjectFactory & { rexContainerLite: Factory };

    entityManager: BaseEntityManager;
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
    }

    preload() {
        this.entityManager = new BaseEntityManager(null, {
            scene: this,
            toPassTexture: this.isClient,
        });
    }

    create() {}

    update(time: number, delta: number) {}

    getTextureJson(textureKey) {
        return this.cache.json.get(textureKey + "_json");
    }

    getRandomPositionOnMap(worldMargin = 300) {
        const maxX = this.physics.world.bounds.width;
        const maxY = this.physics.world.bounds.height;
        const randomWorldX = Phaser.Math.Between(worldMargin, maxX - worldMargin);
        const randomWorldY = Phaser.Math.Between(worldMargin, maxY - worldMargin);

        return [randomWorldX, randomWorldY];
    }

    everyTick(tickrate: number, delta: number, callback: Function) {
        const tickrateDeltaTime = 1000 / tickrate;

        this.cumDelta += delta;
        if (this.cumDelta > tickrateDeltaTime) {
            this.cumDelta = 0;
            callback();
        }
    }

    setSingleplayerListeners(entity: Spaceship) {
        entity.on("entity:hit", (hitData) => {
            const { weaponId, enemyId } = hitData;

            const weapon = entity.weapons.getWeaponById(weaponId);
            if (weapon) {
                const damage = entity.weapons.getDamageByWeapon(weapon);
                this.entityManager.hitEntity(enemyId, damage);
            }
        });
        entity.on("entity:dead", () => this.entityManager.respawnEntity(entity.id));
    }
}
