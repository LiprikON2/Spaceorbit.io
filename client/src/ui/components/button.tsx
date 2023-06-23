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

interface StyledButtonProps extends MantineButtonProps {
    readonly $isSquare?: boolean;
}

const defaultProps: Partial<ButtonProps> = {
    isSquare: false,
};

const _StyledButton = styled(MantineButton)<StyledButtonProps>(({ $isSquare }: any) => ({
    padding: $isSquare && 0,
    aspectRatio: $isSquare && 1 / 1,
    borderWidth: "2px",
}));

export const Button = (props: ButtonProps) => {
    const { isSquare, ...rest } = useComponentDefaultProps("ButtonProps", defaultProps, props);

    const StyledButton = createPolymorphicComponent<"button", StyledButtonProps>(_StyledButton);

    return <StyledButton $isSquare={isSquare} {...rest} />;
};
