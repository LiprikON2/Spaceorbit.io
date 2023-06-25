import React from "react";

import { FullscreenBtn } from "./scenes/FullscreenBtn";

export const TopRight = ({ GroupComponent }) => {
    return (
        <>
            <GroupComponent>
                <FullscreenBtn />
            </GroupComponent>
        </>
    );
};
