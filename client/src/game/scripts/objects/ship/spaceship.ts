import Explosion from "./explosion";
import Exhausts from "./exhausts";
import Weapons from "./weapons";
import Shields from "./shields";
import Outfitting, { type Outfit } from "./outfitting";
import { Sprite, SpriteClientOptions, SpriteServerOptions } from "../Sprite";

export enum AllegianceEnum {
    // AlienNeutral = "AlienNeutral",
    // AlienHostile = "AlienHostile",
    Unaffiliated = "Unaffiliated",
    Alien = "Alien",
    Venus = "Venus",
    Mars = "Mars",
    Earth = "Earth",
}
type AllegianceKeys = keyof typeof AllegianceEnum;

type AllegianceOpposition = {
    [key in AllegianceKeys]: AllegianceKeys[];
};

export interface SpaceshipServerOptions extends SpriteServerOptions {
    outfit: Outfit;
    allegiance: AllegianceEnum;
}

export interface SpaceshipClientOptions extends SpriteClientOptions {
    allGroup: Phaser.GameObjects.Group;
}

export class Spaceship extends Sprite {
    modules: {
        exhaustOrigins: { x: number; y: number }[];
        weaponOrigins: { x: number; y: number }[];
    };
    exhausts: Exhausts;
    weapons: Weapons;
    shields: Shields;
    lastMoveInput: { rotation: number; force: number } = { rotation: 0, force: 0 };

    outfitting;
    followText;

    target: Spaceship | null;
    targetedBy: Spaceship[] = [];
    allGroup: Phaser.GameObjects.Group;
    toggleFire = false;

    allegiance: AllegianceEnum | AllegianceKeys;
    allegianceOpposition: AllegianceOpposition = {
        Unaffiliated: ["Unaffiliated", "Alien", "Venus", "Mars", "Earth"],
        Alien: ["Unaffiliated", "Venus", "Mars", "Earth"],
        Venus: ["Unaffiliated", "Alien", "Mars", "Earth"],
        Mars: ["Unaffiliated", "Alien", "Venus", "Earth"],
        Earth: ["Unaffiliated", "Alien", "Venus", "Mars"],
    };

    // constructor(
    //     scene: Phaser.Scene,
    //     x: number,
    //     y: number,
    //     atlasTexture: string | Phaser.Textures.Texture,
    //     outfit,
    //     multipliers = { speed: 1, health: 1, shields: 1, damage: 1 },
    //     nick = "",
    //     enemies: Spaceship[] = [],
    //     depth = 10
    // ) {
    constructor(serverOptions: SpaceshipServerOptions, clientOptions: SpaceshipClientOptions) {
        super(serverOptions, clientOptions);

        const { modules } = this.atlasMetadata;
        this.modules = modules;

        // Dimentions
        this.setCircularHitbox(this.baseStats.hitboxRadius);

        // Text
        // TODO make a display class
        // TODO use `Nine Slice Game Object` to display hp
        const { username } = serverOptions;
        this.nick = username;
        this.followText = this.scene.add
            .text(-999, -999, username, { fontSize: "2rem" })
            .setAlign("center")
            .setOrigin(0.5)
            .setAlpha(1)
            .setDepth(this.depth + 5);

        // Modules
        const { scene } = clientOptions;
        const damageMultiplier = this.status.multipliers.damage;
        this.exhausts = new Exhausts(scene, this, this.modules.exhaustOrigins);
        this.weapons = new Weapons(scene, this, this.modules.weaponOrigins, damageMultiplier);
        this.shields = new Shields(this);

        const { outfit } = serverOptions;
        this.outfitting = new Outfitting(scene, this, outfit);

        const { allegiance } = serverOptions;
        this.allegiance = allegiance;

        const { allGroup } = clientOptions;
        this.allGroup = allGroup;

        this.soundManager.makeTarget(this);
        if (this.status.shields === 0) this.shields.crack(true);
    }

    get opposition(): AllegianceKeys[] {
        return this.allegianceOpposition[this.allegiance];
    }

    get enemies(): Spaceship[] {
        const all = this.allGroup.getChildren() as Spaceship[];
        const enemies = all.filter((ship) => this.opposition.includes(ship.allegiance));

        return enemies;
    }

    get maxSpeed() {
        const speedBoost = 0.2;
        const speed = this.baseStats.speed;
        const countOfAdditionalEngines = this.exhausts.getEngineCount() - 1;
        const speedMultiplier = this.status.multipliers.speed;

        // Each additional engine gives 20% speed boost
        const shipSpeed = speed + speed * speedBoost * countOfAdditionalEngines;
        return shipSpeed * speedMultiplier;
    }

    getHit(projectile) {
        const damageMultiplier = projectile.weapon.multiplier;
        const damage = projectile.weapon.projectileDamage * damageMultiplier;
        // console.log(this.status.shields, this.status.health);
        if (this.status.shields > 0) {
            // Damage to the shield
            this.shields.getHit();

            this.status.shields -= damage;

            if (this.status.shields <= 0) {
                this.status.shields = 0;
                this.shields.crack();
            }
        } else {
            // Damage to the hull
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

            this.status.health -= damage;

            if (this.status.health <= 0) {
                this.status.health = 0;
                this.explode();
            }
        }
    }

    explode() {
        this.disableBody(true, false);
        this.resetMovement();
        this.emit("dead", this.name); // todo

        // TODO add variety ("explosion patterns")
        new Explosion(this.scene, this.x, this.y, this.depth, {
            double: true,
        });

        this.scene.time.delayedCall(2000, () => this.respawn());
    }

    setTarget(target?: Spaceship) {
        const prevTarget = this.target;

        if (target !== prevTarget && target !== this) {
            if (prevTarget) {
                const { followText } = prevTarget;
                followText.setText(followText.text.slice(1, -1));
                prevTarget.targetedBy = prevTarget.targetedBy.filter(
                    (targetee) => targetee !== this
                );
                this.toggleFire = false;
            }

            if (target) {
                target.followText.setText("[" + target.followText.text + "]");
                target.targetedBy.push(this);
            }
            this.target = target;
        }
    }

    breakOffTargeting() {
        this.targetedBy.forEach((targetee) => targetee.setTarget());
        this.targetedBy = [];
    }

    respawn(x?, y?) {
        this.breakOffTargeting();
        this.setTarget();
        if (typeof x === "undefined" || typeof y === "undefined") {
            // @ts-ignore
            ({ x, y } = this.scene.getRandomPositionOnMap());
        }
        this.x = x;
        this.y = y;
        this.shields.x = x;
        this.shields.y = y;
        this.status.health = this.maxHealth;
        this.status.shields = this.maxShields;

        this.scene.physics.add.existing(this);
        this.scene.physics.add.existing(this.shields);
        this.shields.active = true;
        this.shields.visible = true;
        this.active = true;
        this.onStopMoving();
        if (this.status.shields === 0) this.shields.crack(true);
    }

    lookAtPoint(cursorX, cursorY) {
        const rotation = Phaser.Math.Angle.Between(this.x, this.y, cursorX, cursorY) + Math.PI / 2;

        this.rotateTo(rotation);
    }

    toggleAttack() {
        if (this.target) {
            this.toggleFire = !this.toggleFire;
        }
    }

    rotateTo(rotation) {
        this.rotateToPlugin.rotateTo(Phaser.Math.RadToDeg(rotation), 0, this.maxSpeed);
        this.exhausts.updateExhaustPosition();
    }

    moveTo(x, y) {
        this.moveToPlugin.setSpeed(this.maxSpeed);

        this.moveToPlugin.moveTo(x, y);
        this.shields.moveTo(x, y);
        this.exhausts.startExhaust();
    }

    resetMovement() {
        this.setVelocity(0);
        this.shields.setVelocity(0);
        this.moveToPlugin.stop();
        this.shields.moveToPlugin.stop();
    }
    onStopMoving() {
        this.exhausts.stopExhaust();
    }
    moveUp() {
        if (this.active && !this.isUsingJoystick()) {
            this.setVelocityY(-this.maxSpeed);
            this.shields.setVelocityY(-this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    moveDown() {
        if (this.active && !this.isUsingJoystick()) {
            this.setVelocityY(this.maxSpeed);
            this.shields.setVelocityY(this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    moveLeft() {
        if (this.active && !this.isUsingJoystick()) {
            this.setVelocityX(-this.maxSpeed);
            this.shields.setVelocityX(-this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    moveRight() {
        if (this.active && !this.isUsingJoystick()) {
            this.setVelocityX(this.maxSpeed);
            this.shields.setVelocityX(this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }

    moveUpRight() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = -Math.PI / 4;
            this.body.velocity.setToPolar(angle, this.maxSpeed);
            this.shields.body.velocity.setToPolar(angle, this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    moveUpLeft() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = -Math.PI / 4 - Math.PI / 2;
            this.body.velocity.setToPolar(angle, this.maxSpeed);
            this.shields.body.velocity.setToPolar(angle, this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    moveDownRight() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = Math.PI / 4;
            this.body.velocity.setToPolar(angle, this.maxSpeed);
            this.shields.body.velocity.setToPolar(angle, this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    moveDownLeft() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = Math.PI / 4 + Math.PI / 2;
            this.body.velocity.setToPolar(angle, this.maxSpeed);
            this.shields.body.velocity.setToPolar(angle, this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }

    // Move right relative to the ship rotation, instead of to the screen's right side
    moveRightRelative() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = this.rotation;
            this.body.velocity.setToPolar(angle, this.maxSpeed);
            this.shields.body.velocity.setToPolar(angle, this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    // Move left relative to the ship rotation, instead of to the screen's left side
    moveLeftRelative() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = this.rotation + Math.PI;
            this.body.velocity.setToPolar(angle, this.maxSpeed);
            this.shields.body.velocity.setToPolar(angle, this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    isUsingJoystick() {
        return this.lastMoveInput.force !== 0;
    }
    // For using virtual omni-directional joystick
    move() {
        let hasMoved = false;
        if (this.active && this.isUsingJoystick()) {
            const rotation = this.lastMoveInput.rotation;
            const speed = this.maxSpeed * this.lastMoveInput.force;

            this.body.velocity.setToPolar(rotation, speed);
            this.shields.body.velocity.setToPolar(rotation, speed);
            this.exhausts.startExhaust();
            hasMoved = true;
        }

        return hasMoved;
    }

    setMove(angle, force) {
        this.lastMoveInput.rotation = Phaser.Math.DegToRad(angle);
        this.lastMoveInput.force = force;
    }

    primaryFire(time, cursor?: { cursorX: number; cursorY: number }) {
        if (this.active) {
            this.weapons.primaryFire(time, cursor);
        }
    }

    updateTextPos() {
        this.followText.setPosition(
            this.body.position.x + this.baseStats.hitboxRadius,
            this.body.position.y + this.baseStats.hitboxRadius * 3.5 + 20
        );
    }

    update(time: number, delta: number) {
        this.updateTextPos();
    }
}
