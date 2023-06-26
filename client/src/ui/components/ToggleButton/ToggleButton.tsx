import React from "react";

import { Button } from "..";

export const ToggleButton = ({ on, iconOn, iconOff, isSquare = true, ...rest }) => {
    return (
        <Button isSquare={isSquare} {...rest}>
            {on ? iconOn : iconOff}
        </Button>
    );
};
