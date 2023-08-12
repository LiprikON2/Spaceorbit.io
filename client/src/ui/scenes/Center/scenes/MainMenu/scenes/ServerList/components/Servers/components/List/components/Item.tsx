import React, { useEffect, useState } from "react";
import { Group, Transition } from "@mantine/core";

export const Item = ({
    index = 0,
    icon = null,
    visible = true,
    transitionDuration = 500,
    children = null,
    ...rest
}) => {
    const [slide, setSlide] = useState(false);

    // Play anim as soon item is visible
    useEffect(() => {
        if (visible) setSlide(true);
    }, [visible]);

    return (
        <Transition
            mounted={slide}
            transition="slide-right"
            duration={transitionDuration + index * transitionDuration * 0.2}
            timingFunction="ease"
        >
            {(styles) => (
                <Group noWrap style={styles} {...rest}>
                    {icon}
                    {children}
                </Group>
            )}
        </Transition>
    );
};
