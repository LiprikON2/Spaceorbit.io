import React from "react";

import { FullscreenBtn } from "./scenes/FullscreenBtn";
import type { StyledGroup } from "~/ui/App";

export const TopRight = ({ GroupComponent }: { GroupComponent: StyledGroup }) => {
    return (
        <>
            <GroupComponent>
                <FullscreenBtn />
            </GroupComponent>
        </>
    );
};
