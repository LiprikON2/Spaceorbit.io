export type ChargeBarState = "increasing" | "decreasing" | "paused";

const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
};

export interface ChargeBarOptions {
    value?: number;
    maxValue?: number;
    minValue?: number;

    decreasePerSecond?: number;
    increasePerSecond?: number;

    state?: ChargeBarState;
}

const defaultOptions: ChargeBarOptions = {
    value: 0,
    maxValue: 1,
    minValue: 0,

    decreasePerSecond: 0.05,
    increasePerSecond: 0.05,

    state: "decreasing",
};

export class ChargeBar {
    #value: number;
    maxValue: number;
    minValue: number;

    decreasePerSecond: number;
    increasePerSecond: number;

    state: ChargeBarState;

    get value() {
        return this.#value;
    }
    setValue(newValue: number) {
        this.#value = clamp(newValue, this.minValue, this.maxValue);
    }

    get isPaused() {
        return this.state === "paused";
    }
    get isIncreasing() {
        return this.state === "increasing";
    }
    get isDecreasing() {
        return this.state === "decreasing";
    }

    get isFull() {
        return this.#value === this.maxValue;
    }
    get isEmpty() {
        return this.#value === this.minValue;
    }

    getDecreasePerDelta(delta: number) {
        return this.decreasePerSecond / (1000 / delta);
    }
    getIncreasePerDelta(delta: number) {
        // console.log(
        //     "this.decreasePerSecond",
        //     this.decreasePerSecond,
        //     "=>",
        //     this.decreasePerSecond / (1000 / delta)
        // );
        return this.increasePerSecond / (1000 / delta);
    }

    setDecrease(decreasePerSecond: number) {
        this.decreasePerSecond = decreasePerSecond;
    }
    setIncrease(increasePerSecond: number) {
        this.increasePerSecond = increasePerSecond;
    }

    setState(state: ChargeBarState) {
        this.state = state;
    }

    constructor(options?: ChargeBarOptions) {
        options = { ...defaultOptions, ...options };

        const { value } = options;
        this.#value = value;
        const { maxValue } = options;
        this.maxValue = maxValue;
        const { minValue } = options;
        this.minValue = minValue;

        const { decreasePerSecond } = options;
        this.setDecrease(decreasePerSecond);
        const { increasePerSecond } = options;
        this.setIncrease(increasePerSecond);

        const { state } = options;
        this.state = state;
    }

    update(time: number, delta: number) {
        if (this.isIncreasing && !this.isFull) {
            const newValue = this.value + this.getIncreasePerDelta(delta);
            this.setValue(newValue);
        } else if (this.isDecreasing && !this.isEmpty) {
            const newValue = this.value - this.getDecreasePerDelta(delta);
            this.setValue(newValue);
        }
    }
}
