import type ContainerLiteFactory from "phaser3-rex-plugins/plugins/gameobjects/container/containerlite/Factory";
import type CustomShapeFactory from "phaser3-rex-plugins/plugins/gameobjects/shape/customshapes/Factory.js";

import type { Snapshot } from "@geckos.io/snapshot-interpolation/lib/types";
import type { ChannelId } from "@geckos.io/client";
import BezierEasing from "bezier-easing";

import type { GameClient } from "~/game/core/GameClient/GameClient";
import { Spaceship, type SpaceshipServerOptions } from "~/game/objects/Sprite/Spaceship";
import {
    type Actions,
    type ClientHitData,
    BaseEntityManager,
    BaseCollisionManager,
} from "~/managers";
import type { MobServerOptions } from "~/game/objects/Sprite/Spaceship/Mob";
import type { StatusState } from "~/game/objects/Sprite/Spaceship/components/Status/Status";
import type { Outfit } from "~/game/objects/Sprite/Spaceship/components";

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
        emit: null;
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
    "player:request-reoutfit"?: {
        emit: Outfit;
        on: (outfit: Outfit) => void;
    };
    "entity:reoutfit"?: {
        on: (entityRespawnData: { id: string; outfit: Outfit }) => void;
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
    declare game: GameClient;
    rootElem: HTMLElement | null;
    declare plugins: Phaser.Plugins.PluginManager;
    declare add: Phaser.GameObjects.GameObjectFactory & {
        rexContainerLite: ContainerLiteFactory;
        rexCustomShapes: CustomShapeFactory;
    };

    entityManager: BaseEntityManager;
    collisionManager: BaseCollisionManager;
    cumDelta = 0;

    gravityBezier = BezierEasing(0.115, 0.35, 1.0, -0.15);

    get halfWorldWidth() {
        return this.physics.world.bounds.width / 2;
    }
    get halfWorldHeight() {
        return this.physics.world.bounds.height / 2;
    }

    get isTextured() {
        return this.game.isClient;
    }

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.rootElem = document.getElementById("phaser-game");
    }

    preload() {
        this.entityManager = new BaseEntityManager(null, {
            scene: this,
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
            const { weaponId, enemyId, ownerId } = hitData;

            const weapon = entity.weapons.getWeaponById(weaponId);
            if (weapon) {
                const damage = entity.weapons.getDamageByWeapon(weapon);
                this.entityManager.hitEntity(ownerId, enemyId, damage);
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

    getGravity(entity: Phaser.GameObjects.Sprite, maxDistance = 2000, maxSpeed = 500) {
        const [closestX, closestY] = this.getClosestPointInsideWorldBorder({
            x: entity.x,
            y: entity.y,
        });
        const rotation = Phaser.Math.Angle.Between(entity.x, entity.y, closestX, closestY);

        const distance = Phaser.Math.Distance.Between(entity.x, entity.y, closestX, closestY);
        const normalizedDistance = distance / maxDistance;
        const magnitude = this.gravityBezier(normalizedDistance) * maxSpeed;

        return { rotation, magnitude };
    }
}
