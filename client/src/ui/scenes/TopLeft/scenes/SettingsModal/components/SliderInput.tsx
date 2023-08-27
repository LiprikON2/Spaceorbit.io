import React, { useState } from "react";
import { Text, Slider, Space } from "@mantine/core";
import { useDidUpdate } from "@mantine/hooks";

export const SliderInput = ({
    label = null,
    onChangeEnd = (value: number) => {},
    value = undefined,
    min = 0,
    max = 1,
}) => {
    const [internalValue, setInternalValue] = useState(value);

    useDidUpdate(() => setInternalValue(value), [value]);

    return (
        <>
            {label && <Text>{label}</Text>}
            <Slider
                label={(value) => `${(value * 100 * (1 / max)).toFixed(0)}%`}
                marks={[
                    { value: max * 0, label: "0%" },
                    { value: max * 0.25, label: "25%" },
                    { value: max * 0.5, label: "50%" },
                    { value: max * 0.75, label: "75%" },
                    { value: max * 1, label: "100%" },
                ]}
                min={min}
                max={max}
                precision={4}
                step={max * 0.01}
                onChange={(value) => setInternalValue(value)}
                onChangeEnd={onChangeEnd}
                value={internalValue}
            />
            <Space h="md" />
        </>
    );
};
