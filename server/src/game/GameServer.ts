import type { GeckosServer } from "@geckos.io/server";

export class GameServer extends Phaser.Game {
    server: GeckosServer;

    constructor(server: GeckosServer, GameConfig?: Phaser.Types.Core.GameConfig) {
        super(GameConfig);
        this.server = server;
    }
}
