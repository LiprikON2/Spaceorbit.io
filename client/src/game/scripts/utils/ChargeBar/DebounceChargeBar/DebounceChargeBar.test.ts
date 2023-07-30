import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DebounceChargeBar, type DebounceChargeBarOptions } from "./DebounceChargeBar";

const executeAt = (fps = 60, func) => {
    const deltaTime = 1000 / fps;
    setInterval(() => func(0, deltaTime), deltaTime);
};

describe("DebounceChargeBar", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const getUpdateBar = () => {
        const updateBar = vi.fn((bar, time, deltaTime) => {
            bar.update(time, deltaTime);
        });
        return updateBar;
    };

    it("Test runs update every 16 ms", () => {
        const bar = new DebounceChargeBar();
        const updateBar = getUpdateBar();

        executeAt(60, (time, deltaTime) => updateBar(bar, time, deltaTime));

        vi.advanceTimersByTime(1);
        expect(updateBar).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(14);
        expect(updateBar).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(1);
        expect(updateBar).toHaveBeenCalledTimes(1);
    });

    const testDebounceBarOptions = (
        initialBarState: DebounceChargeBarOptions,
        fps = 60,
        testDuration = 10
    ) => {
        const bar = new DebounceChargeBar(initialBarState);

        const updateBar = getUpdateBar();
        const totalFrames = fps * testDuration;
        executeAt(fps, (time, deltaTime) => updateBar(bar, time, deltaTime));

        for (let frame = 0; frame < totalFrames; frame++) {
            const second = frame / fps;

            expect(updateBar).toHaveBeenCalledTimes(frame);

            if (second === 0) {
                expect(bar.decreaseDebounceBar.value).not.to.equal(1);
                expect(bar.value).toEqual(initialBarState.value);
            }
            if (second === 0) {
                expect(bar.increaseDebounceBar.value).not.to.equal(1);
                expect(bar.value).toEqual(initialBarState.value);
            }
            if (second <= initialBarState.decreaseDebouncingTime) {
                expect(bar.decreaseDebounceBar.value).not.to.equal(1);
                expect(bar.value).toEqual(initialBarState.value);
            }
            if (second <= initialBarState.increaseDebouncingTime) {
                expect(bar.increaseDebounceBar.value).not.to.equal(1);
                expect(bar.value).toEqual(initialBarState.value);
            }
            if (second > initialBarState.decreaseDebouncingTime) {
                if (initialBarState.state === "decreasing") {
                    expect(bar.decreaseDebounceBar.value).toEqual(1);
                    if (initialBarState.value !== initialBarState.minValue) {
                        expect(bar.value).not.to.equal(initialBarState.value);
                    }
                } else if (initialBarState.state === "paused") {
                    expect(bar.decreaseDebounceBar.value).toEqual(0);
                    expect(bar.increaseDebounceBar.value).toEqual(0);
                    expect(bar.value).toEqual(initialBarState.value);
                }
            }
            if (second > initialBarState.increaseDebouncingTime) {
                if (initialBarState.state === "increasing") {
                    expect(bar.increaseDebounceBar.value).toEqual(1);
                    if (initialBarState.value !== initialBarState.maxValue) {
                        expect(bar.value).not.to.equal(initialBarState.value);
                    }
                } else if (initialBarState.state === "paused") {
                    expect(bar.decreaseDebounceBar.value).toEqual(0);
                    expect(bar.increaseDebounceBar.value).toEqual(0);
                    expect(bar.value).toEqual(initialBarState.value);
                }
            }

            vi.advanceTimersToNextTimer();
        }
    };
    it("Debounces decrease of the value (from max)", () => {
        const initialBarState: DebounceChargeBarOptions = {
            value: 1,
            maxValue: 1,
            minValue: 0,

            decreasePerSecond: 0.05,
            decreaseDebouncingTime: 5,

            increasePerSecond: 0.05,
            increaseDebouncingTime: 5,

            state: "decreasing",
        };

        testDebounceBarOptions(initialBarState, 60, 6);
    });
    it("Debounces decrease of the value (from min)", () => {
        const initialBarState: DebounceChargeBarOptions = {
            value: 0,
            maxValue: 1,
            minValue: 0,

            decreasePerSecond: 0.05,
            decreaseDebouncingTime: 5,

            increasePerSecond: 0.05,
            increaseDebouncingTime: 5,

            state: "decreasing",
        };

        testDebounceBarOptions(initialBarState, 60, 6);
    });
    it("Debounces increase of the value (from max)", () => {
        const initialBarState: DebounceChargeBarOptions = {
            value: 1,
            maxValue: 1,
            minValue: 0,

            decreasePerSecond: 0.05,
            decreaseDebouncingTime: 5,

            increasePerSecond: 0.05,
            increaseDebouncingTime: 5,

            state: "increasing",
        };

        testDebounceBarOptions(initialBarState, 60, 6);
    });
    it("Debounces increase of the value (from min)", () => {
        const initialBarState: DebounceChargeBarOptions = {
            value: 0,
            maxValue: 1,
            minValue: 0,

            decreasePerSecond: 0.05,
            decreaseDebouncingTime: 5,

            increasePerSecond: 0.05,
            increaseDebouncingTime: 5,

            state: "increasing",
        };

        testDebounceBarOptions(initialBarState, 60, 6);
    });
    it("Can be paused", () => {
        const initialBarState: DebounceChargeBarOptions = {
            value: 0,
            maxValue: 1,
            minValue: 0,

            decreasePerSecond: 0.05,
            decreaseDebouncingTime: 5,

            increasePerSecond: 0.05,
            increaseDebouncingTime: 5,

            state: "paused",
        };

        testDebounceBarOptions(initialBarState, 60, 6);
    });
});
