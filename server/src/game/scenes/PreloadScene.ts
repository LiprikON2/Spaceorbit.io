import { GameServer } from "~/server/game";

export class PreloadScene extends Phaser.Scene {
    declare game: GameServer;
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {}

    create() {}
}
