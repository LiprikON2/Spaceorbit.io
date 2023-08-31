import type { Emitter } from "nanoevents";
import type { ClientChannel as GeckosClientChannel } from "@geckos.io/client";

import type { MultiplayerEvents } from "~/scenes/core/BaseScene";
import { type SettingsManager } from "~/game/core/GameManager/components";
import type { OutEvents } from "~/game/core";

interface EventsMap {
    [event: string]: any;
}
interface DefaultEvents extends EventsMap {
    [event: string]: {
        emit: any;
        on: (...args: any) => void;
    };
}
export interface ClientChannel<Events extends EventsMap = DefaultEvents>
    extends GeckosClientChannel {
    emit<K extends keyof Events>(
        eventName: K,
        data: Events[K]["emit"] | null,
        options?: {
            interval?: number;
            reliable?: boolean;
            runs?: number;
        }
    ): void;
    on<K extends keyof Events>(eventName: K, callback: Events[K]["on"]): void;
}

export interface Game {
    get isClient(): boolean;
    get isServer(): boolean;

    get isSingleplayer(): boolean;
    get isMultiplayer(): boolean;

    /**
     * Determines if this instance of the game can act as the authority for server-side calculations
     * - Singleplayer: always `true`
     * - Multiplayer: `true` if it's a server
     */
    get isAuthority(): boolean;
}

export class GameClient extends Phaser.Game implements Game {
    settings: SettingsManager;
    outEmitter: Emitter<OutEvents> | null;
    channel?: ClientChannel<MultiplayerEvents>;

    constructor(
        GameConfig: Phaser.Types.Core.GameConfig,
        settings: SettingsManager,
        outEmitter: Emitter<OutEvents> = null,
        channel?: ClientChannel<MultiplayerEvents>
    ) {
        super(GameConfig);
        this.settings = settings;
        this.outEmitter = outEmitter;
        this.channel = channel;
    }

    get isClient() {
        return true;
    }
    get isServer() {
        return !this.isClient;
    }

    get isSingleplayer() {
        return !this.isMultiplayer;
    }
    get isMultiplayer() {
        return Boolean(this.channel);
    }

    get isAuthority() {
        if (this.isMultiplayer) return this.isServer;
        return true;
    }
}
