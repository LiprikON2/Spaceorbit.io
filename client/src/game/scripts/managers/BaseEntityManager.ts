import type { SoundManager } from "~/managers";
import type { BaseScene } from "~/scenes/core/BaseScene";
import {
    Spaceship,
    type AllegianceKeys,
    type SpaceshipClientOptions,
    type SpaceshipServerOptions,
    type Multipliers,
} from "~/objects/Sprite/Spaceship";
import type { Outfit, Projectile } from "~/objects/Sprite/Spaceship/components";
import { Mob, type MobClientOptions, type MobServerOptions } from "~/objects/Sprite/Spaceship/Mob";
import { AllegianceEnum } from "~/objects/Sprite/Spaceship";
import type { StatusState } from "~/objects/Sprite/Spaceship/components/Status";

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

export interface EntityManagerServerOptions {}

export interface EntityManagerClientOptions {
    scene: BaseScene;
    isTextured: boolean;
}

export class BaseEntityManager {
    scene: BaseScene;

    entityGroup: SpaceshipGroup;
    otherPlayersGroup: SpaceshipGroup;
    playerGroup: SpaceshipGroup;
    mobGroup: SpaceshipGroup;
    projectileGroup: ProjectileGroup;
    soundManager?: SoundManager;

    isTextured: boolean;

    getById(id: string, from: "entity" | "players" | "otherPlayers" | "mob" = "entity") {
        let fromGroup: SpaceshipGroup;
        if (from === "entity") fromGroup = this.entityGroup;
        else if (from === "players") fromGroup = this.entityGroup;
        else if (from === "otherPlayers") fromGroup = this.entityGroup;
        else if (from === "mob") fromGroup = this.entityGroup;

        const [entity] = fromGroup.getMatching("id", id);
        return entity;
    }

    constructor(
        serverOptions: EntityManagerServerOptions,
        clientOptions: EntityManagerClientOptions
    ) {
        const { scene, isTextured } = clientOptions;
        this.scene = scene;
        this.isTextured = isTextured;

        this.playerGroup = this.scene.add.group({ runChildUpdate: true }) as SpaceshipGroup;
        this.otherPlayersGroup = this.scene.add.group() as SpaceshipGroup;
        this.mobGroup = this.scene.add.group({ runChildUpdate: true }) as SpaceshipGroup;
        this.entityGroup = this.scene.add.group() as SpaceshipGroup;
        this.projectileGroup = this.scene.add.group() as ProjectileGroup;
    }

    addSoundManager(soundManager: SoundManager) {
        this.soundManager = soundManager;
    }

    createPlayer(
        serverOptions: SpaceshipServerOptions,
        clientOptions?: Partial<SpaceshipClientOptions>,
        isMe = false
    ) {
        const defaultClientOptions = {
            scene: this.scene,
            entityGroup: this.entityGroup,
            projectileGroup: this.projectileGroup,
            isTextured: this.isTextured,
            depth: isMe ? 110 : 100,
        };
        const mergedClientOptions = { ...defaultClientOptions, ...clientOptions };
        const player = new Spaceship(serverOptions, mergedClientOptions);
        if (clientOptions.soundManager) {
            if (isMe) clientOptions.soundManager.setPlayer(player);
            else clientOptions.soundManager.initEntity(player);
        }

        if (!isMe) this.otherPlayersGroup.add(player);
        this.playerGroup.add(player);
        this.entityGroup.add(player);

        return player;
    }

    createMob(
        serverOptions: SpaceshipServerOptions,
        clientOptions?: Partial<SpaceshipClientOptions>
    ) {
        const defaultClientOptions = {
            scene: this.scene,
            entityGroup: this.entityGroup,
            projectileGroup: this.projectileGroup,
            isTextured: this.isTextured,
            depth: 90,
        };
        const mergedClientOptions = { ...defaultClientOptions, ...clientOptions };
        const mob = new Mob(serverOptions, mergedClientOptions);

        if (clientOptions.soundManager) clientOptions.soundManager.initEntity(mob);

        this.entityGroup.add(mob);
        this.mobGroup.add(mob);

        return mob;
    }

    destroyEntity(entityId: string) {
        const entity = this.getById(entityId);
        if (entity) {
            entity.on("destroy", () => console.log("Was destroyed:", entityId));

            this.entityGroup.remove(entity);
            this.playerGroup.remove(entity);
            this.otherPlayersGroup.remove(entity);
            this.mobGroup.remove(entity);
            entity.destroyFully();
        }
    }

    getPlayerServerOptions(id?: string) {
        const playerCount = this.playerGroup.getLength();
        const spaceshipServerOptions: SpaceshipServerOptions = {
            id: id ?? Phaser.Utils.String.UUID(),
            x: 0,
            y: 0,
            angle: 0,
            // TODO spaceship factory pattern
            outfit: this.getPlayerKit(),
            atlasTexture: "F5S4",
            multipliers: { speed: 1, health: 1, shields: 1, damage: 1 },
            username: `Player${playerCount + 1}`,
            allegiance: "Unaffiliated",
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
            engines: [
                null,
                null,
                // TODO server crashes with this
                // { itemName: "engine", itemType: "engines", label: "Eng", color: "yellow" },
                // { itemName: "engine", itemType: "engines", label: "Eng", color: "yellow" },
            ],
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

    hitEntity(entityId: string, damage: number, callback: (entity: Spaceship) => void = () => {}) {
        const [entity] = this.entityGroup.getMatching("id", entityId);
        if (entity) {
            entity.getHit(damage);
            callback(entity);
        }
    }

    respawnEntity(
        entityId: string,
        point: { worldX: number | null; worldY: number | null } = { worldX: null, worldY: null },
        callback: (worldX: number, worldY: number) => void = () => {}
    ) {
        console.log("entity:respawn");
        let { worldX, worldY } = point;
        const [entity] = this.entityGroup.getMatching("id", entityId) as Spaceship[];

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

        callback(worldX, worldY);

        return [worldX, worldY];
    }

    updateEntityStatus(id: string, status: StatusState) {
        const [entity] = this.entityGroup.getMatching("id", id);
        if (entity) entity.setStatusState(status);
    }

    spawnMobs(upToCount, callback: (mob: Spaceship) => void = () => {}) {
        const mobsToSpawn = upToCount - this.mobGroup.getLength();

        for (let i = 0; i < mobsToSpawn; i++) {
            const [worldX, worldY] = this.scene.getRandomPositionOnMap();

            const serverOptions: MobServerOptions = {
                id: Phaser.Utils.String.UUID(),
                x: worldX,
                y: worldY,
                angle: 90,
                outfit: this.getMobKit("normal"),
                atlasTexture: "F5S4",
                multipliers: this.getMobMultipliers("normal"),
                username: "Enemy",
                allegiance: AllegianceEnum.Alien,
            };
            const clientOptions: MobClientOptions = {
                scene: this.scene,
                entityGroup: this.scene.entityManager.entityGroup,
                projectileGroup: this.scene.entityManager.projectileGroup,
                soundManager: this.soundManager,
                isTextured: this.isTextured,
                depth: 90,
            };

            const mob = this.createMob(serverOptions, clientOptions);

            callback(mob);
        }
    }

    getMobKit(type): Outfit {
        if (type === "normal") {
            return {
                weapons: [
                    null,
                    { itemName: "laser", itemType: "weapons", label: "Wpn", color: "red" },
                    null,
                ],
                engines: [null, null],
                inventory: [],
            };
        }
    }

    getMobMultipliers(type): Multipliers {
        if (type === "normal") {
            return { speed: 0.6, health: 0.3, shields: 0.6, damage: 0.3 };
        }
    }
}
