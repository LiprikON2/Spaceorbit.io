import React from "react";
import {
    Button as MantineButton,
    useComponentDefaultProps,
    createPolymorphicComponent,
} from "@mantine/core";
import type { ButtonProps as MantineButtonProps } from "@mantine/core";
import styled from "@emotion/styled";
import { excludeProps } from "~/ui/services/excludeProps";

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

const _StyledButton = styled(MantineButton, {
    shouldForwardProp: excludeProps(["isSquare"]),
})((props) => ({
    padding: props.isSquare && 0,
    aspectRatio: props.isSquare && 1 / 1,
}));

export const Button = (props: ButtonProps) => {
    const defaultedProps = useComponentDefaultProps("ButtonProps", defaultProps, props);

    const StyledButton = createPolymorphicComponent<"button", MantineButtonProps>(_StyledButton);

    return <StyledButton {...defaultedProps} />;
};
