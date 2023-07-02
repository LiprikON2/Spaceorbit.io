export class GameExtended extends Phaser.Game {
    settings;
    outEmitter;
    constructor(GameConfig?: Phaser.Types.Core.GameConfig, settings = {}, outEmitter = null) {
        super(GameConfig);
        this.settings = settings;
        this.outEmitter = outEmitter;
    }
}
