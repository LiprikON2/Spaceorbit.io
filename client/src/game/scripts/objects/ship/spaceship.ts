import Explosion from "./explosion";
import Exhausts from "./exhausts";
import Weapons from "./weapons";
import Shields from "./shields";
import Outfitting from "./outfitting";

export class Spaceship extends Phaser.Physics.Arcade.Sprite {
    halfWidth: number;
    halfHeight: number;

    enemies: Spaceship[];
    modules: { exhaustOrigins: any; weaponOrigins: any };
    baseSpecs: { health: number; hitboxRadius: number; speed: number };
    status: {
        shields: number;
        health: number;
        multipliers: { speed: number; health: number; shields: number; damage: number };
    };
    exhausts: Exhausts;
    weapons: Weapons;
    shields: Shields;
    lastMoveInput: { rotation: number; force: number } = { rotation: 0, force: 0 };
    rotateToPlugin;
    moveToPlugin;
    outfitting;
    followText;
    nick;
    name;

    target: Spaceship | null;
    targetedBy: Spaceship[] = [];
    toggleFire = false;

    constructor(
        scene,
        x,
        y,
        atlasTexture,
        outfit,
        multipliers = { speed: 1, health: 1, shields: 1, damage: 1 },
        nick = "",
        enemies: Spaceship[] = [],
        depth = 10
    ) {
        super(scene, x, y, atlasTexture);

        const atlas = scene.textures.get(atlasTexture);
        const scale = atlas.customData["meta"].scale;

        this.modules = atlas.customData["meta"].modules;
        this.baseSpecs = atlas.customData["meta"].baseSpecs;
        this.status = {
            multipliers,
            health: 0,
            shields: 0,
        };
        this.status.health = this.getMaxHealth();
        this.status.shields = this.getMaxShields();

        // Phaser stuff
        scene.add.existing(this);
        scene.physics.add.existing(this);
        // @ts-ignore
        this.body.onWorldBounds = true;

        this.setCollideWorldBounds(true).setOrigin(0.5).setDepth(depth);
        this.setName(Phaser.Utils.String.UUID());
        this.resize(scale);

        // Sounds
        // @ts-ignore
        this.scene.soundManager.addSounds("hit", ["hit_sound_1", "hit_sound_2"]);

        // Dimentions
        this.halfWidth = this.body.width / 2;
        this.halfHeight = this.body.height / 2;
        this.setCircularHitbox(this.baseSpecs.hitboxRadius);

        // Enables pointerdown events
        this.setInteractive();
        this.on("pointerdown", () => {
            this.scene.input.emit("clickTarget", this);
        });

        // Text
        // TODO make a display class
        // TODO use `Nine Slice Game Object` to display hp
        this.nick = nick;
        this.followText = this.scene.add
            .text(-999, -999, nick, { fontSize: "2rem" })
            .setAlign("center")
            .setOrigin(0.5)
            .setAlpha(1)
            .setDepth(this.depth + 5);

        // Modules
        const damageMultiplier = this.status.multipliers.damage;
        this.exhausts = new Exhausts(scene, this, this.modules.exhaustOrigins);
        this.weapons = new Weapons(scene, this, this.modules.weaponOrigins, damageMultiplier);
        this.shields = new Shields(scene, this);
        this.outfitting = new Outfitting(scene, this, outfit);

        this.enemies = enemies;

        // Movement plugins
        // @ts-ignore
        this.rotateToPlugin = scene.plugins.get("rexRotateTo").add(this);
        this.moveToPlugin = scene.plugins.get("rexMoveTo").add(this);
        this.moveToPlugin.on("complete", () => this.onStopMoving());

        if (this.status.shields === 0) this.shields.crack(true);
    }

    resize(scale) {
        this.displayWidth = Number(this.scene.game.config.width) * scale;
        // Keeps 1:1 aspect ratio
        this.scaleY = this.scaleX;
    }

    getSpeed() {
        const speedBoost = 0.2;
        const speed = this.baseSpecs.speed;
        const countOfAdditionalEngines = this.exhausts.getEngineCount() - 1;
        const speedMultiplier = this.status.multipliers.speed;

        // Each additional engine gives 20% speed boost
        const shipSpeed = speed + speed * speedBoost * countOfAdditionalEngines;
        return shipSpeed * speedMultiplier;
    }

    setCircularHitbox(hitboxRadius) {
        this.body.setCircle(
            hitboxRadius,
            this.halfWidth - hitboxRadius,
            this.halfHeight - hitboxRadius
        );
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
            // @ts-ignore
            this.scene.soundManager.play("hit", {
                sourceX: this.x,
                sourceY: this.y,
                volume: 0.2,
            });

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

    setTarget(target: Spaceship | null = null) {
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

    getMaxHealth() {
        const healthMultiplier = this.status.multipliers.health;
        return this.baseSpecs.health * healthMultiplier;
    }
    getMaxShields() {
        const shieldsMultiplier = this.status.multipliers.shields;
        return 10000 * shieldsMultiplier;
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
        this.status.health = this.getMaxHealth();
        this.status.shields = this.getMaxShields();

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
        this.rotateToPlugin.rotateTo(Phaser.Math.RadToDeg(rotation), 0, this.getSpeed());
        this.exhausts.updateExhaustPosition();
    }

    moveTo(x, y) {
        const speed = this.getSpeed();
        this.moveToPlugin.setSpeed(speed);

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
            this.setVelocityY(-this.getSpeed());
            this.shields.setVelocityY(-this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveDown() {
        if (this.active && !this.isUsingJoystick()) {
            this.setVelocityY(this.getSpeed());
            this.shields.setVelocityY(this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveLeft() {
        if (this.active && !this.isUsingJoystick()) {
            this.setVelocityX(-this.getSpeed());
            this.shields.setVelocityX(-this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveRight() {
        if (this.active && !this.isUsingJoystick()) {
            this.setVelocityX(this.getSpeed());
            this.shields.setVelocityX(this.getSpeed());
            this.exhausts.startExhaust();
        }
    }

    moveUpRight() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = -Math.PI / 4;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveUpLeft() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = -Math.PI / 4 - Math.PI / 2;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveDownRight() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = Math.PI / 4;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveDownLeft() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = Math.PI / 4 + Math.PI / 2;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }

    // Move right relative to the ship rotation, instead of to the screen's right side
    moveRightRelative() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = this.rotation;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    // Move left relative to the ship rotation, instead of to the screen's left side
    moveLeftRelative() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = this.rotation + Math.PI;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
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
            const speed = this.getSpeed() * this.lastMoveInput.force;

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

    getRotatedPoint(point, absolute = false, rotation = this.rotation) {
        // The center of the ship is xOy
        // Distance from center of a ship to a point on a ship; Corresponds to Y
        const R = Phaser.Math.Distance.Between(this.halfWidth, this.halfHeight, point.x, point.y);

        // Corresponds to X
        const additionalRotation = Phaser.Math.Angle.Between(
            this.halfWidth,
            this.halfHeight,
            point.x,
            point.y
        );

        let offsetX;
        let offsetY;
        if (absolute) {
            // If needed absolute coordinates, use current position of a ship in a world as a circle origin
            offsetX = R * Math.cos(rotation + additionalRotation) + this.x;
            offsetY = R * Math.sin(rotation + additionalRotation) + this.y;
        } else {
            // Otherwise use relative to the sprite coordinates
            offsetX = R * Math.cos(rotation + additionalRotation);
            offsetY = R * Math.sin(rotation + additionalRotation);
        }
        return { offsetX, offsetY };
    }
    updateTextPos() {
        this.followText.setPosition(
            this.body.position.x + this.baseSpecs.hitboxRadius,
            this.body.position.y + this.baseSpecs.hitboxRadius * 3.5 + 20
        );
    }

    update(time: number, delta: number) {
        this.updateTextPos();
    }
}
