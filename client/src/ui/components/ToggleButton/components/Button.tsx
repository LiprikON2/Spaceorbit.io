import React from "react";
import {
    Button as MantineButton,
    useComponentDefaultProps,
    createPolymorphicComponent,
} from "@mantine/core";
import type { ButtonProps as MantineButtonProps } from "@mantine/core";
import styled from "@emotion/styled";

import { excludeProps } from "../../../services/styled";

interface ButtonProps extends MantineButtonProps {
    isSquare?: boolean;
    onClick?: () => void;
}

const defaultProps: Partial<ButtonProps> = {
    isSquare: false,
};

const _StyledButton = styled(MantineButton, {
    shouldForwardProp: excludeProps(["isSquare"]),
})(({ isSquare }: any) => ({
    padding: isSquare && 0,
    aspectRatio: isSquare && 1 / 1,
    borderWidth: "2px",
}));

export const Button = (props: ButtonProps) => {
    const defaultedProps = useComponentDefaultProps("ButtonProps", defaultProps, props);

    const StyledButton = createPolymorphicComponent<"button", ButtonProps>(_StyledButton);

    return <StyledButton {...defaultedProps} />;
};
