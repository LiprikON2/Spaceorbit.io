import React from "react";
import { BackgroundImage as MantineBackgroundImage } from "@mantine/core";

export const BackgroundImage = ({ src, style = undefined, showBg = true, ...rest }) => {
    return (
        <MantineBackgroundImage
            src={src}
            style={{ ...(showBg ? style : { ...style, backgroundImage: "none" }) }}
            {...rest}
        />
    );
};
