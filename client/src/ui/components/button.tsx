import React from "react";
import {
    Button as MantineButton,
    useComponentDefaultProps,
    createPolymorphicComponent,
} from "@mantine/core";
import type { ButtonProps as MantineButtonProps } from "@mantine/core";
import styled from "@emotion/styled";

interface ButtonProps extends MantineButtonProps {
    isSquare?: boolean;
    onClick?: () => void;
}

const defaultProps: Partial<ButtonProps> = {
    isSquare: false,
    variant: "outline",
    color: "gray",
    size: "lg",
};

export const Button = (props: ButtonProps) => {
    const { isSquare, variant, color, size, className, children, ...rest } =
        useComponentDefaultProps("ButtonProps", defaultProps, props);

    const _StyledButton = styled(MantineButton)`
        ${isSquare &&
        `
            padding: 0;
            aspect-ratio: 1 / 1;
        `}
    `;
    const StyledButton = createPolymorphicComponent<"button", MantineButtonProps>(_StyledButton);

    return (
        <>
            <StyledButton variant={variant} color={color} size={size} {...rest}>
                {children}
            </StyledButton>
        </>
    );
};
