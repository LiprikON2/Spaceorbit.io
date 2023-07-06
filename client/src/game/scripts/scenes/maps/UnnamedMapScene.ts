import { BaseMapScene } from ".";

export class UnnamedMapScene extends BaseMapScene {
    constructor() {
        super("UnnamedMapScene");
    }

    async create() {
        super.create();

        this.loadBackground("map_1-2", 0.5);
    }
}
