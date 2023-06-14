// import { PhaserNavMeshPlugin } from "phaser-navmesh";

// import { NavMesh } from "navmesh";
import Mob from "./mob";

export default class MobManager {
    scene;
    mobs: Mob[] = [];

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

    spawnMobs(count, mobEnemies) {
        const mobsToSpawn = count - this.mobs.length;
        for (let i = 0; i < mobsToSpawn; i++) {
            const { x, y } = this.scene.getRandomPositionOnMap();
            const mob = new Mob(
                this.scene,
                x,
                y,
                "F5S4",
                this.getMobKit("normal"),
                this.getMobMultiplier("normal"),
                "Enemy",
                mobEnemies
            );
            // Needed to be called when soundManager knows about player, and player knows about soundManager
            mob.exhausts.initExhaustSound();
            this.mobs.push(mob);
        }
    }
    update(time, delta) {
        this.mobs.forEach((mob) => {
            mob.update(time, delta);
        });
    }

    getMobKit(type) {
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

    getMobMultiplier(type) {
        if (type === "normal") {
            return { speed: 0.6, health: 0.3, shields: 0.6, damage: 0.3 };
        }
    }
}
