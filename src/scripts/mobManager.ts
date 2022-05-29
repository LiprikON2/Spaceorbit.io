import { PhaserNavMeshPlugin } from "phaser-navmesh";

import { NavMesh } from "navmesh";
import Spaceship from "./objects/ship/spaceship";

enum Direction {
    Left,
    Right,
    Still,
}

export default class MobManager {
    scene;
    mobs: Spaceship[] = [];
    isWandering: boolean = true;
    isReadyToFire: boolean = false;
    isSleeping: boolean = false;
    enemyTarget; // TODO move to the dedicated AI class
    readyToFireEvent;
    sleepEvent;

    preferedMovement: Direction = 0;
    constructor(scene) {
        this.scene = scene;

        // ship.x = 2500;
        // ship.y = 1000;

        // const maxX = scene.physics.world.bounds.width;
        // const maxY = scene.physics.world.bounds.height;

        // const meshPolygonPoints = [
        //     // [
        //     //     { x: 0, y: 0 },
        //     //     { x: maxX, y: 0 },
        //     //     { x: maxX, y: maxY },
        //     //     { x: 0, y: maxY },
        //     // ],
        //     [
        //         { x: 0, y: 0 },
        //         { x: maxX, y: 0 },
        //         { x: maxX, y: 500 },
        //         { x: 0, y: 500 },
        //     ],
        //     [
        //         { x: 2400, y: 500 },
        //         { x: 2600, y: 500 },
        //         { x: 2600, y: maxY },
        //         { x: 2400, y: maxY },
        //     ],
        // ];
        // const navMesh = new NavMesh(meshPolygonPoints);

        // const path = navMesh.findPath({ x: player.x, y: player.y }, { x: 150, y: 150 });
        // console.log("path", path);
        // if (path) {
        //     player.moveTo(path[1].x, path[1].y);
        // }
        // this.spawnMobs(20);
    }

    sleep(time = 4000) {
        // Usefull for doing some things only once in a while
        if (!this.sleepEvent) {
            this.sleepEvent = this.scene.time.delayedCall(time, () => {
                this.isSleeping = !this.isSleeping;
                this.sleepEvent.destroy();
                this.sleepEvent = null;
                this.preferedMovement = Phaser.Math.Between(0, 2);
            });
        }
    }

    spawnMobs(count, mobEnemies) {
        const mobsToSpawn = count - this.mobs.length;
        for (let i = 0; i < mobsToSpawn; i++) {
            const { x, y } = this.scene.getRandomPositionOnMap();
            const mob = new Spaceship(this.scene, x, y, "F5S4", mobEnemies);
            this.mobs.push(mob);
        }
    }
    update(time, delta) {
        this.sleep();
        console.log("this.preferedMovement", this.preferedMovement);

        this.mobs.forEach((mob) => {
            mob.exhausts.updateExhaustPosition();

            if (this.isWandering && !this.isSleeping) {
                const closestEnemy = this.scene.physics.closest(mob, mob.enemies);
                const dist = Phaser.Math.Distance.BetweenPoints(mob, closestEnemy);
                if (dist < 1000) {
                    this.isWandering = false;
                    this.enemyTarget = closestEnemy;
                }
            }

            if (this.enemyTarget) {
                const { x, y } = this.enemyTarget;
                const dist = Phaser.Math.Distance.BetweenPoints(mob, this.enemyTarget);

                // Shooting logic
                mob.lookAtPoint(x, y);

                if (this.isReadyToFire && dist < 900) {
                    // Fire
                    mob.primaryFire(time);
                } else if (!this.readyToFireEvent) {
                    // Prepare to fire
                    this.readyToFireEvent = this.scene.time.delayedCall(1500, () => {
                        // this.readyToFireEvent.hasDispatched = false;
                        this.isReadyToFire = true;
                    });
                }

                // Movement logic
                mob.resetMovement();

                if (!this.isSleeping) {
                    if (dist < 2000 && dist > 700) {
                        // I need to be closer
                        const jitterX = Phaser.Math.Between(-25, 25);
                        const jitterY = Phaser.Math.Between(-25, 25);

                        mob.moveTo(x + jitterX, y + jitterY);
                    } else if (dist < 700 && dist > 400) {
                        // Perfect, stay still

                        // Now I act according to my preference
                        if (this.preferedMovement === Direction.Left) {
                            mob.moveLeftRelative();
                        } else if (this.preferedMovement === Direction.Right) {
                            mob.moveRightRelative();
                        }
                    } else if (dist < 400) {
                        // Too close; I need to back away
                        const mirrorX = -(x - mob.x) + mob.x;
                        const mirrorY = -(y - mob.y) + mob.y;
                        mob.moveTo(mirrorX, mirrorY);
                    } else {
                        // Target got away
                        mob.resetMovement();
                        mob.stoppedMoving();

                        // TODO catch target died event
                        this.enemyTarget = null;
                        this.readyToFireEvent.destroy();
                        this.readyToFireEvent = null;
                        this.isWandering = true;
                        this.isReadyToFire = false;
                    }
                }
            }
        });
    }
}
