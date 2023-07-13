import { BaseMapScene } from "./BaseMapScene";

// Class Mixin
// https://www.typescriptlang.org/docs/handbook/mixins.html
// https://blog.bitsrc.io/multiple-inheritance-or-typescript-mixins-10076c4f136a
type Constructor<T = {}> = new (...args: any[]) => T;

export function MixinUnnamedMapScene<ClientOrServerScene extends Constructor<BaseMapScene>>(
    clientOrServer: ClientOrServerScene
) {
    return class extends clientOrServer {
        constructor(...args: any[]) {
            super("UnnamedMapScene");
        }

        async create() {
            super.create();

            this.loadBackground("map_1-2", 0.5);
        }
    };
}
