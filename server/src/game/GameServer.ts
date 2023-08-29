import type { GeckosServer } from "@geckos.io/server";
import type { Game } from "@spaceorbit/client/src/game/scripts/core/GameClient";

export class GameServer extends Phaser.Game implements Game {
    server: GeckosServer;

    constructor(server: GeckosServer, GameConfig?: Phaser.Types.Core.GameConfig) {
        super(GameConfig);
        this.server = server;
    }

    get isClient() {
        return !this.isServer;
    }
    get isServer() {
        return true;
    }

    get isSingleplayer() {
        return !this.isSingleplayer;
    }
    get isMultiplayer() {
        return true;
    }

    get isAuthority() {
        return true;
    }
}
