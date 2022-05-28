import Explosion from "./explosion";
import Exhaust from "./exhaust";
import Weapons from "./weapons";

export default class Spaceship extends Phaser.Physics.Arcade.Sprite {
    halfWidth: number;
    halfHeight: number;

    enemies: Spaceship[];
    modules;
    baseSpecs;
    sounds;
    status;
    exhaust: Exhaust;
    rotateTo;
    weapons;
    constructor(scene, x, y, atlasTexture, enemies: Spaceship[] = [], depth = 10) {
        super(scene, x, y, atlasTexture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const atlas = scene.textures.get(atlasTexture);
        const scale = atlas.customData["meta"].scale;
        this.setCollideWorldBounds(true).setOrigin(0.5).setDepth(depth);
        this.setScale(scale);

        this.baseSpecs = atlas.customData["meta"].baseSpecs;
        this.modules = atlas.customData["meta"].modules;

        this.status = { health: this.baseSpecs.health, shields: 0, laserCount: 1 };

        // Add ship sounds

        // @ts-ignore
        this.scene.soundManager.addSounds("hit", ["hit_sound_1", "hit_sound_2"]);

        this.halfWidth = this.body.width / 2;
        this.halfHeight = this.body.height / 2;
        this.setCircularHitbox(this.baseSpecs.hitboxRadius);

        this.exhaust = new Exhaust(scene, this, this.modules.exhaustOrigins);
        this.weapons = new Weapons(scene, this, this.modules.weaponOrigins);
        this.enemies = enemies;

        // @ts-ignore
        this.rotateTo = scene.plugins.get("rexRotateTo").add(this);
    }

    getSpeed() {
        // Each additional engine gives 20% speed boost
        const speed = this.baseSpecs.speed;
        const countOfAdditionalEngines = this.exhaust.exhaustCount - 1;

        const finalSpeed = 0.2 * speed * countOfAdditionalEngines + speed;
        return finalSpeed;
    }

    setCircularHitbox(hitboxRadius) {
        this.body.setCircle(
            hitboxRadius,
            this.halfWidth - hitboxRadius,
            this.halfHeight - hitboxRadius
        );
    }
    getHit(projectile) {
        // @ts-ignore
        this.scene.soundManager.play("hit", {
            sourceX: this.x,
            sourceY: this.y,
            volume: 0.2,
        });

        this.setTint(0xee4824);
        this.scene.time.delayedCall(200, () => this.clearTint());

        this.status.health -= projectile.weapon.projectileDamage;

        if (this.status.health <= 0) {
            this.status.health = 0;
            this.explode();
        }
    }
    explode() {
        this.disableBody(true, false);

        new Explosion(this.scene, this.x, this.y, this.depth, {
            double: true,
        });

        this.scene.time.delayedCall(2000, () => this.respawn());
    }

    respawn() {
        // @ts-ignore
        const { x, y } = this.scene.getRandomPositionOnMap();
        this.x = x;
        this.y = y;
        this.status.health = this.baseSpecs.health;

        this.scene.physics.add.existing(this);
        this.active = true;
    }

    lookAtPoint(cursorX, cursorY) {
        const rotation = Phaser.Math.Angle.Between(this.x, this.y, cursorX, cursorY) + Math.PI / 2;

        this.rotateTo.rotateTo(Phaser.Math.RadToDeg(rotation), 0, this.getSpeed());
        this.exhaust.updateExhaustPosition();
    }

    resetMovement() {
        this.setVelocity(0);
    }
    stoppedMoving() {
        this.exhaust.stopExhaust();
    }
    moveUp() {
        if (this.active) {
            this.setVelocityY(-this.getSpeed());
            this.exhaust.startExhaust();
        }
    }
    moveDown() {
        if (this.active) {
            this.setVelocityY(this.getSpeed());
            this.exhaust.startExhaust();
        }
    }
    moveLeft() {
        if (this.active) {
            this.setVelocityX(-this.getSpeed());
            this.exhaust.startExhaust();
        }
    }
    moveRight() {
        if (this.active) {
            this.setVelocityX(this.getSpeed());
            this.exhaust.startExhaust();
        }
    }

    moveUpRight() {
        if (this.active) {
            this.setVelocityY(-this.getSpeed() * Math.cos(Math.PI / 4));
            this.setVelocityX(this.getSpeed() * Math.cos(Math.PI / 4));
            this.exhaust.startExhaust();
        }
    }
    moveUpLeft() {
        if (this.active) {
            this.setVelocityY(-this.getSpeed() * Math.cos(Math.PI / 4));
            this.setVelocityX(-this.getSpeed() * Math.cos(Math.PI / 4));
            this.exhaust.startExhaust();
        }
    }
    moveDownRight() {
        if (this.active) {
            this.setVelocityY(this.getSpeed() * Math.cos(Math.PI / 4));
            this.setVelocityX(this.getSpeed() * Math.cos(Math.PI / 4));
            this.exhaust.startExhaust();
        }
    }
    moveDownLeft() {
        if (this.active) {
            this.setVelocityY(this.getSpeed() * Math.cos(Math.PI / 4));
            this.setVelocityX(-this.getSpeed() * Math.cos(Math.PI / 4));
            this.exhaust.startExhaust();
        }
    }

    primaryFire(time, cursor?: { cursorX: number; cursorY: number }) {
        if (this.active) {
            this.weapons.primaryFire(time, cursor);
        }
    }

    getRotatedPoint(point, absolute = false) {
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
            offsetX = R * Math.cos(this.rotation + additionalRotation) + this.x;
            offsetY = R * Math.sin(this.rotation + additionalRotation) + this.y;
        } else {
            // Otherwise use relative to the sprite coordinates
            offsetX = R * Math.cos(this.rotation + additionalRotation);
            offsetY = R * Math.sin(this.rotation + additionalRotation);
        }
        return { offsetX, offsetY };
    }
}
