import { PhaserNavMeshPlugin } from "phaser-navmesh";

import { NavMesh } from "navmesh";
import Spaceship from "./objects/ship/spaceship";

export default class MobManager {
    scene;
    player;
    mobs: Spaceship[] = [];

    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

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

    spawnMobs(count) {
        const mobsToSpawn = count - this.mobs.length;
        for (let i = 0; i < mobsToSpawn; i++) {
            const { x, y } = this.scene.getRandomPositionOnMap();
            const mob = new Spaceship(this.scene, x, y, "F5S4", [this.player]);
            this.mobs.push(mob);
        }
    }
    update() {
        this.mobs.forEach((mob) => mob.exhausts.updateExhaustPosition());
    }
}
