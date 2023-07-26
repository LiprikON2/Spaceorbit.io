import type { SoundManager } from "~/managers";
import type { BaseScene } from "~/scenes/core/BaseScene";
import {
    Spaceship,
    type AllegianceKeys,
    type SpaceshipClientOptions,
    type SpaceshipServerOptions,
} from "~/objects/Sprite/Spaceship";
import type { Status } from "~/objects/Sprite";
import type { Projectile } from "~/objects/Sprite/Spaceship/components";
import { Mob, type MobClientOptions, type MobServerOptions } from "~/objects/Sprite/Spaceship/Mob";
import { AllegianceEnum } from "~/objects/Sprite/Spaceship";

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
    soundManager?: SoundManager;
    toPassTexture: boolean;
}

export class BaseEntityManager {
    scene: BaseScene;

    allGroup: SpaceshipGroup;
    otherPlayersGroup: SpaceshipGroup;
    playerGroup: SpaceshipGroup;
    mobGroup: SpaceshipGroup;
    projectileGroup: ProjectileGroup;

    toPassTexture: boolean;

    getById(id: string, from: "all" | "players" | "otherPlayers" | "mob" = "all") {
        let fromGroup: SpaceshipGroup;
        if (from === "all") fromGroup = this.allGroup;
        else if (from === "players") fromGroup = this.allGroup;
        else if (from === "otherPlayers") fromGroup = this.allGroup;
        else if (from === "mob") fromGroup = this.allGroup;

        const [entity] = fromGroup.getMatching("id", id);
        return entity;
    }

    constructor(
        serverOptions: EntityManagerServerOptions,
        clientOptions: EntityManagerClientOptions
    ) {
        const { scene, toPassTexture } = clientOptions;
        this.scene = scene;
        this.toPassTexture = toPassTexture;

        this.playerGroup = this.scene.add.group({ runChildUpdate: true }) as SpaceshipGroup;
        this.otherPlayersGroup = this.scene.add.group() as SpaceshipGroup;
        this.mobGroup = this.scene.add.group({ runChildUpdate: true }) as SpaceshipGroup;
        this.allGroup = this.scene.add.group() as SpaceshipGroup;
        this.projectileGroup = this.scene.add.group() as ProjectileGroup;
    }

    createPlayer(
        serverOptions: SpaceshipServerOptions,
        clientOptions?: Partial<SpaceshipClientOptions>,
        isMe = false
    ) {
        const defaultClientOptions = {
            scene: this.scene,
            allGroup: this.allGroup,
            projectileGroup: this.projectileGroup,
            toPassTexture: this.toPassTexture,
        };
        const mergedClientOptions = { ...defaultClientOptions, ...clientOptions };
        const player = new Spaceship(serverOptions, mergedClientOptions);

        const { soundManager } = mergedClientOptions;
        if (soundManager) {
            if (isMe) soundManager.setPlayer(player);
            else soundManager.initEntity(player);
        }

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
            username: `Player${playerCount + 1}`,
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

    hitEntity(entityId: string, damage: number) {
        const [entity] = this.allGroup.getMatching("id", entityId);
        if (entity) entity.getHit(damage);
    }

    respawnEntity(
        entityId: string,
        point: { worldX: number; worldY: number } = { worldX: null, worldY: null },
        respawnCallback: (worldX: number, worldY: number) => void = () => {}
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

        respawnCallback(worldX, worldY);

        return [worldX, worldY];
    }

    updateEntityStatus(id: string, status: Status) {
        const [entity] = this.allGroup.getMatching("id", id);
        if (entity) entity.setStatus(status);
    }

    spawnMobs(count, soundManager?) {
        const mobsToSpawn = count - this.mobGroup.getLength();
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
                depth: 90,
            };
            const clientOptions: MobClientOptions = {
                scene: this.scene,
                allGroup: this.scene.entityManager.allGroup,
                projectileGroup: this.scene.entityManager.projectileGroup,
                soundManager,
                toPassTexture: true,
            };
            const mob = new Mob(serverOptions, clientOptions);
            this.scene.entityManager.allGroup.add(mob);
            this.scene.entityManager.mobGroup.add(mob);
            // TODO make it into emit event
            // Needed to be called when soundManager knows about player, and player knows about soundManager
            mob.exhausts.initExhaustSound();
        }
    }

    getMobKit(type) {
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

    getMobMultipliers(type) {
        if (type === "normal") {
            return { speed: 0.6, health: 0.3, shields: 0.6, damage: 0.3 };
        }
    }
}
