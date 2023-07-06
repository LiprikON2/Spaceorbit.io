import type { Emitter } from "nanoevents";
import type { ClientChannel } from "@geckos.io/client";

import type { OutEvents } from ".";

export class GameClient extends Phaser.Game {
    settings;
    outEmitter: Emitter<OutEvents> | null;
    channel?: ClientChannel;
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
