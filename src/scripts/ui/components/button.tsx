import React from "react";
import { Button as MantineButton } from "@mantine/core";

import "./button.css";

const Button = ({
    isSquare = false,
    variant = "outline",
    color = "gray",
    size = "lg",
    className = "",
    children = {},
    ...rest
}) => {
    return (
        <MantineButton
            // @ts-ignore
            variant={variant}
            color={color}
            // @ts-ignore
            size={size}
            className={isSquare ? className + " square-button" : className}
            {...rest}
        >
            {children}
        </MantineButton>
    );
};

export default Button;
