// import { ServerScene } from "@spaceorbit/server/src/game/scenes/ServerScene";
// import { BaseMapSceneClient, BaseMapSceneServer, MixinBaseMapScene } from "./BaseMapScene";
import { BaseMapSceneClient, MixinBaseMapScene } from "./BaseMapScene";
import { ClientScene } from "../core/ClientScene";

let baseMapScene = new BaseMapSceneClient("t");
baseMapScene = null;

type Constructor<T = {}> = new (...args: any[]) => T;
// type BaseMappable = GConstructor<typeof baseMapScene>;

// Class Mixin from Class Mixin
// https://www.typescriptlang.org/docs/handbook/mixins.html
export function MixinUnnamedMapScene<
    BaseMapClientOrServerScene extends Constructor<typeof baseMapScene>
>(BaseMapClientOrServer: BaseMapClientOrServerScene) {
    return class extends BaseMapClientOrServer {
        constructor(...args: any[]) {
            super("UnnamedMapScene");
        }

        async create() {
            super.create();

            this.loadBackground("map_1-2", 0.5);
        }
    };
}

// const test = MixinUnnamedMapScene(MixinBaseMapScene(ClientScene));
