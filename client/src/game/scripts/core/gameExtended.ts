import type { Emitter } from "nanoevents";
import { OutEvents } from ".";

export class GameExtended extends Phaser.Game {
    settings;
    outEmitter: Emitter<OutEvents> | null;
    constructor(GameConfig?: Phaser.Types.Core.GameConfig, settings = {}, outEmitter = null) {
        super(GameConfig);
        this.settings = settings;
        this.outEmitter = outEmitter;
    }
}
