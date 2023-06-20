import React from "react";
import { Avatar, createPolymorphicComponent, useComponentDefaultProps } from "@mantine/core";
import type { AvatarProps } from "@mantine/core";

import engine from "~/assets/inventory/engine.jpg";
import laser from "~/assets/inventory/laser.jpg";
import gatling from "~/assets/inventory/gatling.jpg";
import styled from "@emotion/styled";

const icon = {
    engine,
    laser,
    gatling,
};

const defaultProps: Partial<AvatarProps> = {
    size: "lg",
};

const _StyledIcon = styled(Avatar)`
    width: 100%;
    height: 100%;
`;

export const Icon = (props) => {
    const { itemName, ...rest } = useComponentDefaultProps("AvatarProps", defaultProps, props);
    const StyledIcon = createPolymorphicComponent<"div", AvatarProps>(_StyledIcon);

    return <StyledIcon src={icon[itemName]} {...rest} />;
};
