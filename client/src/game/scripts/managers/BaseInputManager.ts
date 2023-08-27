import type { Spaceship } from "~/objects/Sprite/Spaceship";
import type { BaseScene } from "~/scenes/core/BaseScene";

export interface Keys {
    [key: string]: Phaser.Input.Keyboard.Key;
}

export interface Actions {
    up: boolean;
    right: boolean;
    down: boolean;
    left: boolean;
    primaryFire: boolean;
    secondaryFire: boolean;
    touchMode: boolean;
    autoattack: boolean;
    targetId: string | null;
    worldX: number | null;
    worldY: number | null;
}

const defaultActions = {
    worldX: null,
    worldY: null,

    up: false,
    right: false,
    down: false,
    left: false,

    primaryFire: false,
    secondaryFire: false,

    touchMode: false,
    autoattack: false,
    targetId: null,
};

export default class BaseInputManager {
    scene: BaseScene;
    player: Spaceship;
    keys: Keys;
    #actions: Required<Actions>;

    get actions() {
        return this.#actions;
    }

    /**
     * Returns action object without keys which have default values
     */
    get actionsCompact(): Partial<Actions> {
        const actionsCompactEntries = Object.entries(this.actions).filter(
            ([key, value]) => value !== defaultActions[key]
        );
        const actionsCompact = Object.fromEntries(actionsCompactEntries) as Partial<Actions>;
        return actionsCompact;
    }
    setActions(actions: Partial<Actions>) {
        this.#actions = { ...defaultActions, ...actions };
    }

    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.#actions = defaultActions;
    }

    update(time: number, delta: number) {
        // Movement
        this.player.setThrust();

        const { up, left, down, right } = this.actions;
        if (up && !left && !down && !right) this.player.thrustUp();
        else if (!up && left && !down && !right) this.player.thrustLeft();
        else if (!up && !left && down && !right) this.player.thrustDown();
        else if (!up && !left && !down && right) this.player.thrustRight();
        else if (up && left && !down && !right) this.player.thrustUpLeft();
        else if (up && !left && !down && right) this.player.thrustUpRight();
        else if (!up && left && down && !right) this.player.thrustDownLeft();
        else if (!up && !left && down && right) this.player.thrustDownRight();

        this.player.thrust();
        // if (!moved) this.player.onStopThrust();

        // Aiming
        const { worldX, worldY } = this.actions;
        const isPointerDetermined = worldX !== null && worldY !== null;
        if (isPointerDetermined) this.player.setPointer(worldX, worldY);

        // Shooting
        const { primaryFire, autoattack } = this.actions;
        this.player.primaryFireState = { active: primaryFire, autoattack };

        const { targetId } = this.actions;
        this.setTargetById(targetId);
    }

    setTargetById(targetId: string) {
        if (targetId) this.player.setTargetById(targetId);
    }
}
