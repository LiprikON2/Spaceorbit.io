export class Disposable {
    scene: Phaser.Scene;
    #disposers: Function[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        this.scene.events.on("destroy", () => {
            this.destroy();
        });
    }
    destroy() {
        this.#disposers.forEach((disposer) => disposer());
    }

    addDisposer(disposer: Function) {
        this.#disposers.push(disposer);
    }
}
