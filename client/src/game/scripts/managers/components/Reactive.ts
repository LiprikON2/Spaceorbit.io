import { IAutorunOptions, IReactionOptions, IReactionPublic, autorun, reaction } from "mobx";

export class Reactive {
    scene: Phaser.Scene;
    private disposers: Function[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        this.scene.events.on("destroy", () => this.destroy());
    }
    destroy() {
        this.disposers.forEach((disposer) => disposer());
    }

    addDisposer(disposer: Function) {
        this.disposers.push(disposer);
    }

    autorun(view: (r: IReactionPublic) => any, opts?: IAutorunOptions) {
        this.addDisposer(autorun(view, opts));
    }

    reaction<T, FireImmediately extends boolean = false>(
        expression: (r: IReactionPublic) => T,
        effect: (
            arg: T,
            prev: FireImmediately extends true ? T | undefined : T,
            r: IReactionPublic
        ) => void,
        opts?: IReactionOptions<T, FireImmediately>
    ) {
        this.addDisposer(reaction(expression, effect, opts));
    }
}
