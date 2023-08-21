import type ContainerLite from "phaser3-rex-plugins/plugins/gameobjects/container/containerlite/ContainerLite";
import type RotateTo from "phaser3-rex-plugins/plugins/rotateto";
import type MoveTo from "phaser3-rex-plugins/plugins/moveto";

import { Explosion, Exhausts, Weapons, Shields, Outfitting, type Outfit } from "./components";
import { Sprite, type SpriteClientOptions, type SpriteServerOptions } from "../Sprite";
import type { ProjectileGroup, SpaceshipGroup } from "~/managers/BaseEntityManager";
import { Status, type StatusState } from "./components/Status";
import { HealthbarUI } from "~/game/objects/Healthbar/HealthbarUI";

export enum AllegianceEnum {
    // AlienNeutral = "AlienNeutral",
    // AlienHostile = "AlienHostile",
    Unaffiliated = "Unaffiliated",
    Alien = "Alien",
    Venus = "Venus",
    Mars = "Mars",
    Earth = "Earth",
}
export type AllegianceKeys = keyof typeof AllegianceEnum;

interface MovementVector {
    rotation: number;
    magnitude: number;
    accelerationMultiplier: number;
}

type AllegianceOpposition = {
    [key in AllegianceKeys]: AllegianceKeys[];
};

type MovementActivity = "moving" | "stopped";

export type ActionsState = {
    id: string;
    groupName: "mob" | "players";
    x: number;
    y: number;
    angle: number;
    activity: MovementActivity;
    worldX: number;
    worldY: number;
    primaryFireAutoattack: 0 | 1;
    primaryFireActive: 0 | 1;
    targetId: string | undefined;
};

export interface Multipliers {
    speed: number;
    health: number;
    shields: number;
    damage: number;
}

export interface SpaceshipServerOptions extends SpriteServerOptions {
    id: string;
    outfit: Outfit;
    allegiance: AllegianceEnum | AllegianceKeys;
    multipliers: Multipliers;
    username: string;
}

export interface SpaceshipClientOptions extends SpriteClientOptions {
    entityGroup: SpaceshipGroup;
    projectileGroup: ProjectileGroup;
}

export class Spaceship extends Sprite {
    declare id: string;
    modules: {
        exhaustOrigins: { x: number; y: number }[];
        weaponOrigins: { x: number; y: number }[];
    };
    exhausts: Exhausts;
    weapons: Weapons;
    shields: Shields;
    #thrust: { rotation: number; velocityPercentage: number } = {
        rotation: 0,
        velocityPercentage: 0,
    };

    outfitting: Outfitting;

    status: Status;
    baseStats: { health: number; hitboxRadius: number; speed: number };

    target: Spaceship | null;
    targetedBy: Spaceship[] = [];
    entityGroup: SpaceshipGroup;
    projectileGroup: ProjectileGroup;

    allegiance: AllegianceEnum | AllegianceKeys;
    allegianceOpposition: AllegianceOpposition = {
        Unaffiliated: ["Unaffiliated", "Alien", "Venus", "Mars", "Earth"],
        Alien: ["Unaffiliated", "Venus", "Mars", "Earth"],
        Venus: ["Unaffiliated", "Alien", "Mars", "Earth"],
        Mars: ["Unaffiliated", "Alien", "Venus", "Earth"],
        Earth: ["Unaffiliated", "Alien", "Venus", "Mars"],
    };
    boundingBox: ContainerLite & { body: Phaser.Physics.Arcade.Body };
    rotateToPlugin: RotateTo;
    moveToPlugin: MoveTo;

    _pointer: { worldX: number; worldY: number };
    primaryFireState = { active: false, autoattack: false };

    get isAutoattacking() {
        return this.primaryFireState.autoattack && Boolean(this.target?.active);
    }

    get opposition(): AllegianceKeys[] {
        return this.allegianceOpposition[this.allegiance];
    }

    get enemies(): Spaceship[] {
        const all = this.entityGroup.getChildren();
        const enemies = all.filter(
            (ship) => this.opposition.includes(ship.allegiance) && ship.id !== this.id
        );

        return enemies;
    }

    get activity(): MovementActivity {
        return this.status.speed ? "moving" : "stopped";
    }

    get hitboxRadius() {
        const hasShields = this.status.shields > 0;
        return hasShields ? this.shields.body.radius : this.body.radius;
    }

    get hitboxCircle() {
        return {
            x: this.x,
            y: this.y,
            r: this.hitboxRadius,
        };
    }

    get isExplosionPlaying() {
        return this.boundingBox.body.enable;
    }

    get isDead() {
        return this.status.health <= 0;
    }

    get isDying() {
        return this.isDead && this.isExplosionPlaying;
    }

    get isMob() {
        return false;
    }
    get isPlayer() {
        return !this.isMob;
    }

    constructor(serverOptions: SpaceshipServerOptions, clientOptions: SpaceshipClientOptions) {
        super(serverOptions, clientOptions);
        const { baseStats } = this.atlasMetadata;
        this.baseStats = baseStats;
        this.setCircularHitbox(this.baseStats.hitboxRadius);

        const { x, y } = serverOptions;
        this.boundingBox = this.scene.add.rexContainerLite(
            x,
            y,
            this.body.width * this.scale,
            this.body.height * this.scale
        );
        this.scene.physics.world.enable(this.boundingBox);
        this.scene.physics.world.enableBody(this.boundingBox);
        this.boundingBox.body.setCollideWorldBounds(true);

        this.shields = new Shields(this);
        this.boundingBox.pin(this, { syncRotation: false });
        this.boundingBox.pin(this.shields, { syncRotation: false });

        // Modules
        const { modules } = this.atlasMetadata;
        this.modules = modules;

        const { scene } = clientOptions;
        this.exhausts = new Exhausts(scene, this, this.modules.exhaustOrigins);

        const { multipliers } = serverOptions;
        this.weapons = new Weapons(scene, this, this.modules.weaponOrigins, multipliers.damage);

        const { outfit } = serverOptions;
        this.outfitting = new Outfitting(scene, this, outfit);

        const { allegiance } = serverOptions;
        this.allegiance = allegiance;

        const { entityGroup } = clientOptions;
        this.entityGroup = entityGroup;

        const { projectileGroup } = clientOptions;
        this.projectileGroup = projectileGroup;

        const { username } = serverOptions;
        this.setName(username);

        this.status = new Status({ ship: this, baseStats, multipliers }, { scene: this.scene });
        if (this.status.shields === 0) this.shields.crack(false);

        // @ts-ignore
        this.rotateToPlugin = scene.plugins.get("rexRotateTo").add(this);
        // @ts-ignore
        this.moveToPlugin = scene.plugins.get("rexMoveTo").add(this.boundingBox);
        this.moveToPlugin.on("complete", () => this.onStopThrust());

        if (this.isTextured) {
            this.setPipeline("Light2D");
        }

        if (this.soundManager) {
            // Make sure relevant sounds are loaded
            this.soundManager.addSounds("hit", ["hit_sound_1", "hit_sound_2"]);
        }

        // Enables click events
        this.setInteractive();
        this.on("pointerdown", () => {
            this.scene.input.emit("clickTarget", this);
        });
        this.setPointer(x, y);
    }
    /**
     * Destroys not only the sprite itself, but also related objects pinned to its bounding box
     * @param fromScene
     */
    destroyFully(fromScene?: boolean) {
        this.setTarget();
        this.breakOffTargeting();
        this.boundingBox.destroy(fromScene);
    }

    getHit(damage: number) {
        if (this.status.shields > 0) this.getShieldsHit(damage);
        else this.getHullHit(damage);
    }

    getShieldsHit(damage: number) {
        this.shields.playShieldHit();
        this.status.damageShields(damage);

        if (this.status.shields <= 0) this.shields.crack();
    }
    getHullHit(damage: number) {
        this.playHullHit();
        this.status.damageHealth(damage);

        if (this.isDead) this.explode();
    }

    playHullHit() {
        if (this.soundManager) {
            this.soundManager.play("hit", {
                sourceX: this.x,
                sourceY: this.y,
                volume: 0.2,
            });
        }

        // TODO lastHit time variable in order not to bug out the tween, plus make it possible to regen shields
        this.setTint(0xee4824);
        this.scene.time.delayedCall(200, () => this.clearTint());
    }

    explode() {
        this.breakOffTargeting();
        this.setTarget();

        this.boundingBox.body.enable = false;
        this.disableBody(true, false);
        this.status.updateUI();
        this.stopThrust();

        if (this.isTextured) {
            new Explosion(this.scene, this.x, this.y, this.depth, this.soundManager, {
                double: true,
            });
        }

        const isNotAlreadyDying = !this.isDying;
        if (isNotAlreadyDying) {
            this.scene.time.delayedCall(2000, () => {
                this.boundingBox.setVisible(false);

                this.emit("entity:dead", this);
            });
        }
    }

    toggleAutoattack() {
        if (this.target) this.primaryFireState.autoattack = !this.primaryFireState.autoattack;
    }

    /**
     * Sets reference to spaceship for autoattacking, also:
     *  - adds brackets to that spaceship's name
     *  - updates list of targetedBy of that spaceship with current spaceship
     * @param target
     */
    setTarget(target: Spaceship = null) {
        const prevTarget = this.target;

        const notSameTarget = target !== prevTarget;
        const didNotTargetSelf = target !== this;

        const isValidNewTarget = notSameTarget && didNotTargetSelf;
        if (isValidNewTarget) {
            if (prevTarget) {
                const { followText } = prevTarget.status;
                followText.setText(followText.text.slice(1, -1));
                prevTarget.targetedBy = prevTarget.targetedBy.filter(
                    (targetee) => targetee !== this
                );
                this.primaryFireState.autoattack = false;
            }

            if (target) {
                target.status.followText.setText("[" + target.status.followText.text + "]");
                target.targetedBy.push(this);
            }
            this.target = target;
        }
    }

    setTargetById(targetId: string) {
        const [target] = this.entityGroup.getMatching("id", targetId);
        if (target) this.setTarget(target);
    }

    setPointer(worldX?: number, worldY?: number) {
        if (worldX === undefined || worldY === undefined) {
            const { x, y } = this.getActionsState();
            worldX = x;
            worldY = y;
        }
        this._pointer = { worldX, worldY };
    }
    get pointer() {
        if (!this.isAutoattacking) return this._pointer;
        else {
            const { x: worldX, y: worldY } = this.target.getActionsState();
            return { worldX, worldY };
        }
    }

    lookAtPointer() {
        let { worldX, worldY } = this.pointer;
        const rotation = Phaser.Math.Angle.Between(this.x, this.y, worldX, worldY);
        this.rotateTo(rotation);
    }

    breakOffTargeting() {
        this.targetedBy.forEach((targetee) => targetee.setTarget());
        this.targetedBy = [];
    }

    teleport(worldX: number, worldY: number, map?: string) {
        this.stopThrust();
        this.emit("entity:teleport", this, { worldX, worldY });
        this.boundingBox.setPosition(worldX, worldY);
    }

    respawn(worldX?: number, worldY?: number) {
        if (worldX === undefined || worldY === undefined) {
            [worldX, worldY] = this.scene.getRandomPositionOnMap();
        }
        this.teleport(worldX, worldY);

        this.boundingBox.setVisible(true);
        this.boundingBox.body.enable = true;
        this.status.setToMaxHealth();
        this.status.setToMaxShields();

        this.scene.physics.add.existing(this);
        this.scene.physics.add.existing(this.shields);
        this.shields.active = true;
        this.shields.visible = true;
        this.active = true;
        this.stopThrust();
        if (this.status.shields === 0) this.shields.crack(false);

        return [worldX, worldY];
    }

    setAngle(angle?: number) {
        super.setAngle(angle);
        if (this.exhausts) this.exhausts.updateExhaustPosition();
        return this;
    }
    setRotation(rotation?: number) {
        super.setRotation(rotation);
        if (this.exhausts) this.exhausts.updateExhaustPosition();
        return this;
    }

    rotateTo(rotation: number, speed = this.status.maxSpeed) {
        this.rotateToPlugin.rotateTo(Phaser.Math.RadToDeg(rotation + Math.PI / 2), 0, speed);
        if (this.exhausts) this.exhausts.updateExhaustPosition();
    }

    moveTo(x: number, y: number) {
        this.moveToPlugin.setSpeed(this.status.maxSpeed);

        this.moveToPlugin.moveTo(x, y);
        this.onStartThrust();
    }

    stopThrust() {
        // this.boundingBox.body.stop();
        this.moveToPlugin.stop();
        this.setThrust();
        this.onStopThrust();
    }

    onStartThrust() {
        this.exhausts.startExhaust();
    }
    onStopThrust() {
        this.exhausts.stopExhaust();
    }

    thrustUp() {
        if (this.active) {
            const rotation = -Math.PI / 2;
            this.setThrust(rotation, 1);
        }
    }
    thrustDown() {
        if (this.active) {
            const rotation = Math.PI / 2;
            this.setThrust(rotation, 1);
        }
    }
    thrustLeft() {
        if (this.active) {
            const rotation = Math.PI;
            this.setThrust(rotation, 1);
        }
    }
    thrustRight() {
        if (this.active) {
            const rotation = 0;
            this.setThrust(rotation, 1);
        }
    }

    thrustUpRight() {
        if (this.active) {
            const rotation = -Math.PI / 4;
            this.setThrust(rotation, 1);
        }
    }
    thrustUpLeft() {
        if (this.active) {
            const rotation = -Math.PI / 4 - Math.PI / 2;
            this.setThrust(rotation, 1);
        }
    }
    thrustDownRight() {
        if (this.active) {
            const rotation = Math.PI / 4;
            this.setThrust(rotation, 1);
        }
    }
    thrustDownLeft() {
        if (this.active) {
            const rotation = Math.PI / 4 + Math.PI / 2;
            this.setThrust(rotation, 1);
        }
    }
    /**
     * Moves ship right, relative to the ship rotation, instead of to the screen's right side
     */
    thrustSidewaysRight() {
        if (this.active) {
            const rotation = this.rotation;
            this.setThrust(rotation, 1);
        }
    }
    /**
     * Moves ship left relative to the ship rotation, instead of to the screen's left side
     */
    thrustSidewaysLeft() {
        if (this.active) {
            const rotation = this.rotation + Math.PI;
            this.setThrust(rotation, 1);
        }
    }

    thrust() {
        let movedFromThrust = false;
        if (this.active) {
            const { rotation, velocityPercentage } = this.#thrust;
            const speed = this.status.maxSpeed * velocityPercentage;

            // TODO tweak magnitude and acceleration multipliers
            const gravity = { ...this.scene.getGravity(this), accelerationMultiplier: 5 };

            this.move([{ rotation, magnitude: speed, accelerationMultiplier: 7 }, gravity]);
            movedFromThrust = velocityPercentage > 0;
        }

        if (movedFromThrust) this.onStartThrust();
        else this.onStopThrust();
    }

    setThrust(rotation: number = this.#thrust.rotation, velocityPercentage: number = 0) {
        this.#thrust.rotation = rotation;
        this.#thrust.velocityPercentage = velocityPercentage;
    }

    move(movements: MovementVector[]) {
        // Velocity
        let vx = 0;
        let vy = 0;
        // Acceleration
        let ax = 0;
        let ay = 0;

        movements.forEach(({ rotation, magnitude, accelerationMultiplier }) => {
            const velocityX = magnitude * Math.cos(rotation);
            const velocityY = magnitude * Math.sin(rotation);

            vx += velocityX;
            vy += velocityY;
            ax += velocityX * accelerationMultiplier;
            ay += velocityY * accelerationMultiplier;
        });
        const targetSpeed = (vx ** 2 + vy ** 2) ** 0.5;

        this.boundingBox.body.setAcceleration(ax, ay);
        this.boundingBox.body.setMaxSpeed(targetSpeed);
    }

    primaryFire(time: number) {
        this.weapons.primaryFire(time, this.pointer);
    }

    update(time: number, delta: number) {
        this.lookAtPointer();
        if (this.isAuthority) this.status.update(time, delta);

        if (this.isAutoattacking) {
            const dist = Phaser.Math.Distance.BetweenPoints(this, this.target);
            if (dist < 900) {
                this.primaryFire(time);
            }
        } else if (this.primaryFireState.active) {
            this.primaryFire(time);
        }
    }

    getActionsState(): ActionsState {
        const { id, x, y, angle, activity, _pointer: pointer } = this;

        const { active, autoattack } = this.primaryFireState;
        const primaryFireActive = active ? 1 : 0;
        const primaryFireAutoattack = autoattack ? 1 : 0;
        const targetId = this.target?.id;
        return {
            id,
            groupName: this.isPlayer ? "players" : "mob",
            x,
            y,
            angle,
            activity,
            ...pointer,
            primaryFireAutoattack,
            primaryFireActive,
            targetId,
        };
    }

    setActionsState({
        x,
        y,
        angle,
        worldX,
        worldY,
        activity,
        primaryFireActive,
        primaryFireAutoattack,
        targetId,
    }: ActionsState) {
        this.boundingBox.setPosition(x, y);
        this.setPointer(worldX, worldY);
        this.rotateTo(Phaser.Math.DegToRad(angle - 90));

        if (activity === "moving") {
            this.onStartThrust();
        } else if (activity === "stopped") {
            this.onStopThrust();
        }

        this.primaryFireState = {
            active: !!primaryFireActive,
            autoattack: !!primaryFireAutoattack,
        };
        if (targetId) this.setTargetById(targetId);
    }

    getStatusState() {
        return this.status.getState();
    }

    setStatusState(newStatus: StatusState) {
        const shieldDiff = this.status.shields - newStatus.shields;
        if (shieldDiff > 0) this.getShieldsHit(shieldDiff);
        else if (shieldDiff < 0) this.status.healShields(shieldDiff);

        const healthDiff = this.status.health - newStatus.health;
        if (healthDiff > 0) this.getHullHit(healthDiff);
        else if (healthDiff < 0) this.status.healHealth(healthDiff);
    }
}
