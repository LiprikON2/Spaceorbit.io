import React from "react";
import { Button as MantineButton, ButtonVariant, MantineSize } from "@mantine/core";

import "./button.css";

const Button = ({
    isSquare = false,
    variant = "outline",
    color = "gray",
    size = "lg",
    className = "",
    children = null,
    ...rest
}) => {
    return (
        <>
            <MantineButton
                variant={variant as ButtonVariant}
                color={color}
                size={size as MantineSize}
                className={isSquare ? className + " square-button" : className}
                {...rest}
            >
                {children}
            </MantineButton>
        </>
    );
};

export default Button;
