import { makeAutoObservable } from "mobx";

import type { Reward } from "~/objects/Sprite/Spaceship";

export interface PilotServerOptions {
    exp: number;
    currency: number;
}

const defaultServerOptions: PilotServerOptions = {
    exp: 0,
    currency: 0,
};

interface Pilot extends PilotServerOptions {}

class Pilot {
    constructor(serverOptions?: Partial<PilotServerOptions>) {
        Object.assign(this, defaultServerOptions, serverOptions);

        makeAutoObservable(this);
    }

    receiveReward(reward: Reward) {
        const { exp, currency } = reward;

        this.exp += exp;
        this.currency += currency;
    }
}

export { Pilot };
