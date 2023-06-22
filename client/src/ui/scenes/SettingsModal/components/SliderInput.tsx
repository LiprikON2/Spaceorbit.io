import { Title, Slider } from "@mantine/core";
import React from "react";

export const SliderInput = ({
    className = "slider",
    color = "cyan",
    title,
    onChangeEnd,
    defaultValue,
    min = 0,
    max = 1,
}) => {
    return (
        <>
            <Title order={6}>{title}</Title>
            <Slider
                className={className}
                color={color}
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
                step={max * 0.01}
                onChangeEnd={onChangeEnd}
                defaultValue={defaultValue}
            />
        </>
    );
};
