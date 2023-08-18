import Factory from "phaser3-rex-plugins/plugins/gameobjects/container/containerlite/Factory";
import type { Snapshot } from "@geckos.io/snapshot-interpolation/lib/types";
import type { ChannelId } from "@geckos.io/client";

import type { GameClient } from "~/game/core/client/GameClient";
import { Spaceship, type SpaceshipServerOptions } from "~/game/objects/Sprite/Spaceship";
import {
    type Actions,
    type ClientHitData,
    BaseEntityManager,
    BaseCollisionManager,
} from "~/managers";
import type { MobServerOptions } from "~/game/objects/Sprite/Spaceship/Mob";
import type { StatusState } from "~/objects/Sprite/Spaceship/components/Status";

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
        emit: { id: string; status: StatusState };
        on: (entityStatusData: { id: string; status: StatusState }) => void;
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
    game: GameClient;
    rootElem: HTMLElement | null;
    plugins: Phaser.Plugins.PluginManager;
    add: Phaser.GameObjects.GameObjectFactory & { rexContainerLite: Factory };

    entityManager: BaseEntityManager;
    collisionManager: BaseCollisionManager;
    cumDelta = 0;

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
            isTextured: this.game.isClient,
        });

        this.collisionManager = new BaseCollisionManager({
            projectileGroup: this.entityManager.projectileGroup,
            entityGroup: this.entityManager.entityGroup,
        });
    }

    create() {}

    resize(
        gameObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | Phaser.GameObjects.Shape,
        scale = 1
    ) {
        const resizeCoef = gameObject.width / 1920;
        // Makes texture the same size, regardless of render size
        gameObject.displayWidth = this.scale.baseSize.width * resizeCoef * scale;
        // Maintains 1:1 aspect ratio
        gameObject.scaleY = gameObject.scaleX;
    }

    update(time: number, delta: number) {}

    getTextureJson(textureKey) {
        return this.cache.json.get(textureKey + "_json");
    }

    getRandomPositionOnMap(worldMargin = 300) {
        const worldWidth = this.physics.world.bounds.width;
        const worldHeight = this.physics.world.bounds.height;
        const randomWorldX = Phaser.Math.Between(
            -(worldWidth / 2) + worldMargin,
            worldWidth / 2 - worldMargin
        );
        const randomWorldY = Phaser.Math.Between(
            -(worldHeight / 2) + worldMargin,
            worldHeight / 2 - worldMargin
        );
        const isInEllipse = this.collisionManager.isPointInEllipse(
            { x: randomWorldX, y: randomWorldY },
            { x: 0, y: 0, width: worldWidth, height: worldHeight }
        );

        if (!isInEllipse) return this.getRandomPositionOnMap(worldMargin);
        return [randomWorldX, randomWorldY];
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

    // TODO tickrate limit and/or memoize
    getClosestPointInsideWorldBorder(originPoint: { x: number; y: number }): [number, number] {
        const ellipticalWorldBorder = {
            x: 0,
            y: 0,
            width: this.physics.world.bounds.width,
            height: this.physics.world.bounds.height,
        };

        if (!this.collisionManager.isPointInEllipse(originPoint, ellipticalWorldBorder)) {
            return this.collisionManager.closestPointOnEllipse(originPoint, ellipticalWorldBorder);
        }
        return [originPoint.x, originPoint.y];
    }

    // TODO make magnitude nonlinear
    getGravity(entity: Phaser.GameObjects.Sprite, magnitudeMultiplier = 0.1) {
        const [closestX, closestY] = this.getClosestPointInsideWorldBorder({
            x: entity.x,
            y: entity.y,
        });
        const distance = Phaser.Math.Distance.Between(entity.x, entity.y, closestX, closestY);

        const rotation = Phaser.Math.Angle.Between(entity.x, entity.y, closestX, closestY);
        const magnitude = distance * magnitudeMultiplier;

        return { rotation, magnitude };
    }
}
