export class EveryTick {
    cumDelta = 0;
    tickrate;

    get tickrateDeltaTime() {
        return 1000 / this.tickrate;
    }

    constructor(tickrate = 30) {
        this.tickrate = tickrate;
    }

    update(time: number, delta: number, callback: Function) {
        this.cumDelta += delta;

        if (this.cumDelta > this.tickrateDeltaTime) {
            this.cumDelta = 0;
            callback();
        }
    }
}
