import { PhaserNavMeshPlugin } from "phaser-navmesh";

import { NavMesh } from "navmesh";
import Spaceship from "./objects/ship/spaceship";

enum Direction {
    Left,
    Right,
    Still,
}

export default class Mob extends Spaceship {
    isWandering: boolean = true;
    isReadyToFire: boolean = false;
    isSleeping: boolean = false;

    enemyTarget;
    readyToFireEvent;
    sleepEvent;
    preferedMovement: Direction = 0;
    reactionTime: number;

    constructor(scene, x, y, atlasTexture, enemies: Spaceship[] = [], depth = 10) {
        super(scene, x, y, atlasTexture, enemies, depth);
        this.reactionTime = Phaser.Math.Between(2500, 4500);
    }

    sleep(time) {
        // Usefull for doing some things only once in a while
        if (!this.sleepEvent) {
            this.sleepEvent = this.scene.time.delayedCall(time, () => {
                this.isSleeping = !this.isSleeping;
                this.sleepEvent.destroy();
                this.sleepEvent = null;

                const enumLength = Object.keys(Direction).length / 2;
                this.preferedMovement = Phaser.Math.Between(0, enumLength - 1);
            });
        }
    }

    update(time, delta) {
        this.sleep(this.reactionTime);
        this.exhausts.updateExhaustPosition();

        if (this.isWandering && !this.isSleeping) {
            const closestEnemy = this.scene.physics.closest(this, this.enemies);
            // @ts-ignore
            const dist = Phaser.Math.Distance.BetweenPoints(this, closestEnemy);
            if (dist < 1000) {
                this.isWandering = false;
                this.enemyTarget = closestEnemy;
            }
        }

        if (this.enemyTarget) {
            const { x, y } = this.enemyTarget;
            const dist = Phaser.Math.Distance.BetweenPoints(this, this.enemyTarget);

            // Shooting logic
            this.lookAtPoint(x, y);

            if (this.isReadyToFire && dist < 900) {
                // Fire
                this.primaryFire(time);
            } else if (!this.readyToFireEvent) {
                // Prepare to fire
                this.readyToFireEvent = this.scene.time.delayedCall(1500, () => {
                    // this.readyToFireEvent.hasDispatched = false;
                    this.isReadyToFire = true;
                });
            }

            // Movement logic
            this.resetMovement();

            if (!this.isSleeping) {
                if (dist < 2000 && dist > 700) {
                    // I need to be closer
                    const jitterX = Phaser.Math.Between(-25, 25);
                    const jitterY = Phaser.Math.Between(-25, 25);

                    this.moveTo(x + jitterX, y + jitterY);
                } else if (dist < 700 && dist > 400) {
                    // Perfect, stay still
                    // Now I act according to my preference
                    if (this.preferedMovement === Direction.Left) {
                        this.moveLeftRelative();
                    } else if (this.preferedMovement === Direction.Right) {
                        this.moveRightRelative();
                    } else {
                        this.stoppedMoving();
                    }
                } else if (dist < 400) {
                    // Too close; I need to back away
                    const mirrorX = -(x - this.x) + this.x;
                    const mirrorY = -(y - this.y) + this.y;
                    this.moveTo(mirrorX, mirrorY);
                } else {
                    // Target got away
                    this.resetMovement();
                    this.stoppedMoving();

                    // TODO catch target died event
                    this.enemyTarget = null;
                    this.readyToFireEvent.destroy();
                    this.readyToFireEvent = null;
                    this.isWandering = true;
                    this.isReadyToFire = false;
                }
            } else {
                this.stoppedMoving();
            }
        }
    }
}
