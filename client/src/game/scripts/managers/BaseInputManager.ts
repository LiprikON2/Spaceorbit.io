import type { Spaceship } from "~/objects/ship/Spaceship";
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
    lookAtWorldX: number | null;
    lookAtWorldY: number | null;
}

const defaultActions = {
    lookAtWorldX: null,
    lookAtWorldY: null,

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
    isTouchMode = false;
    _actions: Actions;

    get actions(): Actions {
        return this._actions;
    }

    /**
     * Returns action object without keys which have default values
     */
    get actionsCompact(): Actions {
        const actionsCompactEntries = Object.entries(this.actions).filter(
            ([key, value]) => value !== defaultActions[key]
        );
        const actionsCompact = Object.fromEntries(actionsCompactEntries) as Actions;
        return actionsCompact;
    }
    setActions(actions: Partial<Actions>) {
        this._actions = { ...defaultActions, ...actions };
    }

    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this._actions = defaultActions;
    }

    getPointerPosition() {
        // Updates mouse worldX, worldY manually, since when camera moves,
        // but cursor doesn't it doesn't update them
        this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main);

        const { worldX, worldY } = this.scene.input.activePointer;
        return { worldX, worldY };
    }

    update(time: number, delta: number) {
        const { up, left, down, right, primaryFire, autoattack, lookAtWorldX, lookAtWorldY } =
            this.actions;

        let haveMoved = false;

        this.player.resetMovement();
        haveMoved = this.player.move();

        // Movement
        if (up && !left && !down && !right) {
            this.player.moveUp();
            haveMoved = true;
        } else if (!up && left && !down && !right) {
            this.player.moveLeft();
            haveMoved = true;
        } else if (!up && !left && down && !right) {
            this.player.moveDown();
            haveMoved = true;
        } else if (!up && !left && !down && right) {
            this.player.moveRight();
            haveMoved = true;
        } else if (up && left && !down && !right) {
            this.player.moveUpLeft();
            haveMoved = true;
        } else if (up && !left && !down && right) {
            this.player.moveUpRight();
            haveMoved = true;
        } else if (!up && left && down && !right) {
            this.player.moveDownLeft();
            haveMoved = true;
        } else if (!up && !left && down && right) {
            this.player.moveDownRight();
            haveMoved = true;
        }
        if (!haveMoved) this.player.onStopMoving();

        // Shooting
        if (primaryFire && !autoattack) {
            this.player.primaryFire(time, { cursorX: lookAtWorldX, cursorY: lookAtWorldY });
        } else if (autoattack) {
            const dist = Phaser.Math.Distance.BetweenPoints(this.player, this.player.target);
            if (dist < 900) {
                this.player.primaryFire(time, { cursorX: lookAtWorldX, cursorY: lookAtWorldY });
            }
        }

        // Aiming
        if (lookAtWorldX && lookAtWorldY) this.player.lookAtPoint(lookAtWorldX, lookAtWorldY);
    }
}
