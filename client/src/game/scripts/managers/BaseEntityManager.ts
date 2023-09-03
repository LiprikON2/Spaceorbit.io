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
import { Mob, type MobServerOptions } from "~/objects/Sprite/Spaceship/Mob";
import { AllegianceEnum } from "~/objects/Sprite/Spaceship";
import type { StatusState } from "~/game/objects/Sprite/Spaceship/components/Status/Status";

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
}

type GroupNames = "entity" | "players" | "otherPlayers" | "mob";

export class BaseEntityManager {
    scene: BaseScene;

    entityGroup: SpaceshipGroup;
    otherPlayersGroup: SpaceshipGroup;
    playerGroup: SpaceshipGroup;
    mobGroup: SpaceshipGroup;
    projectileGroup: ProjectileGroup;
    soundManager?: SoundManager;

    get isAuthority() {
        return this.scene.game.isAuthority;
    }

    getById(id: string, from: GroupNames = "entity") {
        let fromGroup: SpaceshipGroup;
        if (from === "entity") fromGroup = this.entityGroup;
        else if (from === "players") fromGroup = this.playerGroup;
        else if (from === "otherPlayers") fromGroup = this.otherPlayersGroup;
        else if (from === "mob") fromGroup = this.mobGroup;

        const [entity] = fromGroup.getMatching("id", id);
        return entity ?? null;
    }

    getAll(from: GroupNames = "entity") {
        let fromGroup: SpaceshipGroup;
        if (from === "entity") fromGroup = this.entityGroup;
        else if (from === "players") fromGroup = this.playerGroup;
        else if (from === "otherPlayers") fromGroup = this.otherPlayersGroup;
        else if (from === "mob") fromGroup = this.mobGroup;

        return fromGroup.getChildren();
    }

    constructor(
        serverOptions: EntityManagerServerOptions,
        clientOptions: EntityManagerClientOptions
    ) {
        const { scene } = clientOptions;
        this.scene = scene;

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
            projectileGroup: this.projectileGroup,
            enableNormals: true,
            depth: isMe ? 110 : 100,
        };
        const mergedClientOptions = { ...defaultClientOptions, ...clientOptions };
        const player = new Spaceship(serverOptions, mergedClientOptions);
        if (mergedClientOptions.soundManager) {
            if (isMe) mergedClientOptions.soundManager.setPlayer(player);
            else mergedClientOptions.soundManager.initEntity(player);
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
            projectileGroup: this.projectileGroup,
            soundManager: this.soundManager,
            enableNormals: true,
            depth: 90,
        };
        const mergedClientOptions = { ...defaultClientOptions, ...clientOptions };
        const mob = new Mob(serverOptions, mergedClientOptions);

        if (mergedClientOptions.soundManager) mergedClientOptions.soundManager.initEntity(mob);

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

    explodeEntity(entityId: string) {
        const entity = this.getById(entityId);
        if (entity) {
            entity.explode();
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
            multipliers: { speed: 1, hullHp: 1, shieldsHp: 1, damage: 1 },
            username: `Player${playerCount + 1}`,
            allegiance: "Unaffiliated",
            attackerReward: { exp: 1000, currency: 5000 },
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
                { itemName: "engine", itemType: "engines", label: "Eng", color: "yellow" },
                { itemName: "engine", itemType: "engines", label: "Eng", color: "yellow" },
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

    hitEntity(
        attackerId: string,
        entityId: string,
        damage: number,
        callback: (entity: Spaceship) => void = () => {}
    ) {
        const entity = this.getById(entityId);
        if (entity) {
            entity.getHit(damage, attackerId);
            callback(entity);
        }
    }

    getRespawnPoint(entity: Spaceship): [number, number] {
        if (Spaceship.rogueAllegiances.includes(entity.allegiance)) {
            const [worldX, worldY] = this.scene.getRandomPositionOnMap();
            return [worldX, worldY];
        } else {
            return [0, 0];
        }
    }

    handleDeadEntity(
        entityId: string,
        respawnCallback: (respawnPoint: [number, number]) => void = () => {},
        instantRespawn = true
    ) {
        console.log("entity:dead");
        const entity = this.getById(entityId);
        if (entity) {
            if (instantRespawn) {
                const respanwPoint = this.respawnEntity(entity);
                respawnCallback(respanwPoint);
            }

            if (this.isAuthority) {
                const rewards = entity.status.getAttackerRewards();
                rewards.map(([contributorId, reward]) => {
                    const contributor = this.getById(contributorId);
                    if (contributor) contributor.pilot.receiveReward(reward);

                    console.log("reward", reward);
                });
            }
        }
    }

    respawnEntity(
        entity: Spaceship | string,
        point?: [number, number],
        respawnCallback: (respawnPoint: [number, number]) => void = () => {}
    ) {
        console.log("entity:respawn");
        if (typeof entity === "string") entity = this.getById(entity);

        if (!point) point = this.getRespawnPoint(entity);
        if (entity?.isDead) entity.respawn(...point);

        respawnCallback(point);
        return point;
    }

    /**
     * Reoutfits the entity, ensuring no new items were added
     * @param entityId
     * @param newOutfit
     * @param callback
     */
    reoutfitEntity(
        entityId: string,
        newOutfit: Outfit,

        callback: (outfit: Outfit) => void = () => {}
    ) {
        console.log("entity:reoutfit");

        const entity = this.getById(entityId);
        if (entity) {
            const [added] = entity.outfitting.diffOutfitItems(newOutfit);

            if (added.length === 0) {
                entity.outfitting.setOutfit(newOutfit, false);
                callback(entity.outfitting.outfit);
            }
        }
    }

    updateEntityStatus(id: string, status: StatusState) {
        const entity = this.getById(id);
        if (entity) entity.setStatusState(status);
    }

    spawnMobs(
        upToCount: number,
        mobCallback: (mob: Spaceship) => void = () => {},
        optionsCallback: (mobOptions: MobServerOptions) => void = () => {}
    ) {
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
                attackerReward: { exp: 300, currency: 1000 },
            };

            const mob = this.createMob(serverOptions);

            mobCallback(mob);
            optionsCallback(serverOptions);
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
            // return { speed: 0.6, health: 0.3, shields: 0.6, damage: 0.3 };
            return { speed: 0.6, hullHp: 0.3, shieldsHp: 0.6, damage: 4 };
        }
    }
}
