import {
    BaseEntityManager,
    type EntityManagerClientOptions,
    type EntityManagerServerOptions,
} from "@spaceorbit/client/src/game/scripts/managers/BaseEntityManager";
import BaseInputManager from "@spaceorbit/client/src/game/scripts/managers/BaseInputManager";
import type {
    ActionsState,
    Spaceship,
    SpaceshipServerOptions,
} from "@spaceorbit/client/src/game/scripts/objects/Sprite/Spaceship";

import type {
    MobServerOptions,
    MobClientOptions,
} from "@spaceorbit/client/src/game/scripts/objects/Sprite/Spaceship/Mob";
import { DeepRequired } from "~/server/types/utility";

interface Entities {
    [key: string]: {
        serverOptions: SpaceshipServerOptions;
        entity: Spaceship;
        inputManager?: BaseInputManager;
    };
}

export interface ServerEntityManagerServerOptions extends EntityManagerServerOptions {}

export interface ServerEntityManagerClientOptions extends EntityManagerClientOptions {}

export class ServerEntityManager extends BaseEntityManager {
    players: DeepRequired<Entities> = {};
    mobs: Entities = {};

    get playersActionsState(): ActionsState[] {
        const playersState = Object.values(this.players).map(({ entity: player }) =>
            player.getActionsState()
        );

        return playersState;
    }

    get mobsActionsState(): ActionsState[] {
        const mobsState = Object.values(this.mobs).map(({ entity: mob }) => mob.getActionsState());

        return mobsState;
    }

    getUpdatedServerOptions(serverOptions: SpaceshipServerOptions, entity: Spaceship) {
        const { x, y, angle } = entity.getActionsState();
        const { outfit } = entity.outfitting;
        return { ...serverOptions, x, y, angle, outfit };
    }

    getPlayerById(playerId: string) {
        return this.players[playerId!];
    }

    getOtherPlayersOptions(playerId: string): SpaceshipServerOptions[] {
        const otherPlayersEntries = Object.entries(this.players).filter(
            ([key]) => key !== playerId
        );
        const otherPlayersOptions = otherPlayersEntries.map(
            ([key, { entity: player, serverOptions }]) =>
                this.getUpdatedServerOptions(serverOptions, player)
        );
        return otherPlayersOptions;
    }
    getMobsOptions(): MobServerOptions[] {
        const mobsOptions = Object.entries(this.mobs).map(
            ([key, { entity: player, serverOptions }]) =>
                this.getUpdatedServerOptions(serverOptions, player)
        );
        return mobsOptions;
    }

    constructor(
        serverOptions: ServerEntityManagerServerOptions,
        clientOptions: ServerEntityManagerClientOptions
    ) {
        super(serverOptions, clientOptions);
    }

    addPlayer(serverOptions: SpaceshipServerOptions) {
        const player = this.createPlayer(serverOptions);
        const inputManager = new BaseInputManager(this, player);

        this.players[serverOptions.id] = {
            entity: player,
            serverOptions,
            inputManager,
        };
        return player;
    }

    removePlayer(playerId: string, callback: (playerId: string) => void = () => {}) {
        this.destroyEntity(playerId!);
        delete this.players[playerId!];

        callback(playerId);
    }

    spawnPlayer(
        serverOptions: SpaceshipServerOptions,
        callback: (player: Spaceship) => void = () => {}
    ) {
        const player = this.addPlayer(serverOptions);
        callback(player);
    }

    addMob(serverOptions: SpaceshipServerOptions) {
        const mob = this.createMob(serverOptions);

        this.mobs[serverOptions.id] = {
            entity: mob,
            serverOptions,
        };
        return mob;
    }

    update(time: number, delta: number) {
        this.updatePlayersInput(time, delta);
    }

    updatePlayersInput(time: number, delta: number) {
        Object.values(this.players).forEach(({ inputManager }) => inputManager.update(time, delta));
    }
}
