import { ChargeBar, type ChargeBarState, type ChargeBarOptions } from "..";

export interface DebounceChargeBarOptions extends ChargeBarOptions {
    /**
     * Time in seconds until debounce ends and value starts actually decreasing
     */
    decreaseDebouncingTime?: number;

    /**
     * Time in seconds until debounce ends and value starts actually increasing
     */
    increaseDebouncingTime?: number;
}

const defaultOptions: DebounceChargeBarOptions = {
    value: 0,
    maxValue: 1,
    minValue: 0,

    decreasePerSecond: 0.05,
    decreaseDebouncingTime: 5,

    increasePerSecond: 0.05,
    increaseDebouncingTime: 5,

    state: "decreasing",
};

export class DebounceChargeBar extends ChargeBar {
    decreaseDebounceBar: ChargeBar;
    increaseDebounceBar: ChargeBar;

    get isIncreasing() {
        return this.state === "increasing" && this.increaseDebounceBar.isFull;
    }
    get isDecreasing() {
        return this.state === "decreasing" && this.decreaseDebounceBar.isFull;
    }

    setState(state: ChargeBarState) {
        if (state === "increasing") {
            this.increaseDebounceBar.setState("increasing");
            this.decreaseDebounceBar.setState("decreasing");
        } else if (state === "decreasing") {
            this.decreaseDebounceBar.setState("increasing");
            this.increaseDebounceBar.setState("decreasing");
        } else if (state === "paused") {
            this.decreaseDebounceBar.setState("paused");
            this.increaseDebounceBar.setState("paused");
        }
        this.state = state;
    }

    constructor(options?: DebounceChargeBarOptions) {
        options = { ...defaultOptions, ...options };
        super(options);

        const { decreaseDebouncingTime } = options;
        this.decreaseDebounceBar = new ChargeBar({
            decreasePerSecond: 1 / decreaseDebouncingTime,
            increasePerSecond: 1 / decreaseDebouncingTime,
            state: "increasing",
            value: 0,
        });

        const { increaseDebouncingTime } = options;
        this.increaseDebounceBar = new ChargeBar({
            decreasePerSecond: 1 / increaseDebouncingTime,
            increasePerSecond: 1 / increaseDebouncingTime,
            state: "increasing",
            value: 0,
        });

        const { state } = options;
        this.setState(state);
    }

    update(time: number, delta: number) {
        this.updateDebounce(time, delta);
        super.update(time, delta);
    }

    updateDebounce(time: number, delta: number) {
        // console.log("this.decreaseDebounceBar BEFORE:", this.decreaseDebounceBar.value);
        this.decreaseDebounceBar.update(time, delta);
        // console.log("this.decreaseDebounceBar AFTER:", this.decreaseDebounceBar.value);
        this.increaseDebounceBar.update(time, delta);
    }
}
