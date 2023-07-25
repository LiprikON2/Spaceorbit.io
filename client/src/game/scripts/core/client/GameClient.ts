import type { Emitter } from "nanoevents";
import type { ClientChannel as GeckosClientChannel } from "@geckos.io/client";

import type { OutEvents } from "~/game/core/GameManager";
import type { MultiplayerEvents } from "~/scenes/core/BaseScene";

interface EventsMap {
    [event: string]: any;
}
interface DefaultEvents extends EventsMap {
    [event: string]: (...args: any) => void;
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

export class GameClient extends Phaser.Game {
    settings;
    outEmitter: Emitter<OutEvents> | null;
    channel?: ClientChannel<MultiplayerEvents>;

    constructor(
        GameConfig?: Phaser.Types.Core.GameConfig,
        settings = {},
        outEmitter = null,
        channel?
    ) {
        super(GameConfig);
        this.settings = settings;
        this.outEmitter = outEmitter;
        this.channel = channel;
    }
}
