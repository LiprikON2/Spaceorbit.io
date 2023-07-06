import { BaseMapScene } from ".";

export class UnnamedMapScene extends BaseMapScene {
    constructor() {
        super("UnnamedMapScene");
    }

    create() {
        super.create();

        this.loadBackground("map_1-2", 0.5);
    }
}
