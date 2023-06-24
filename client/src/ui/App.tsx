import React, { useEffect } from "react";
import { Group } from "@mantine/core";
import styled from "@emotion/styled";

import { game } from "~/game";
import { TopLeft } from "./scenes/TopLeft";
import { TopRight } from "./scenes/TopRight";
import { BottomLeft } from "./scenes/BottomLeft";
import { BottomRight } from "./scenes/BottomRight";
import { Right } from "./scenes/Right";
import { useSettings } from "./hooks";

const StyledUI = styled.div`
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100vw;
    height: 100vh;
    pointer-events: none;

    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(8, 1fr);
    grid-template-areas:
        "top-l top-l top-l . . . . . .     . top-r top-r"
        "    .     .     . . . . . . .     .     .     ."
        "    .     .     . . . . . . .     .     .     ."
        "    .     .     . . . . . . . right right right"
        "    .     .     . . . . . . . right right right"
        "    .     .     . . . . . . .     .     .     ."
        "    .     .     . . . . . . .     .     .     ."
        "bot-l bot-l bot-l . . . . . .     . bot-r bot-r";

    & > * {
        margin: 1rem;
        pointer-events: auto;
    }
`;

const StyledTopLeftGroup = styled(Group)`
    grid-area: top-l;
    justify-self: start;
    align-self: start;
`;
const StyledTopRightGroup = styled(Group)`
    grid-area: top-r;
    justify-self: end;
    align-self: start;
`;
const StyledBottomLeftGroup = styled(Group)`
    grid-area: bot-l;
    justify-self: start;
    align-self: end;
`;
const StyledBottomRightGroup = styled(Group)`
    grid-area: bot-r;
    justify-self: end;
    align-self: end;
`;
const StyledRightGroup = styled(Group)`
    grid-area: right;
    justify-self: end;
    align-self: center;
`;

export const App = () => {
    const { settings } = useSettings();

    useEffect(() => {
        game.init(settings);
    }, []);

    return (
        <StyledUI>
            <TopLeft GroupComponent={StyledTopLeftGroup} />
            <TopRight GroupComponent={StyledTopRightGroup} />
            <BottomLeft GroupComponent={StyledBottomLeftGroup} />
            <BottomRight GroupComponent={StyledBottomRightGroup} />
            <Right GroupComponent={StyledRightGroup} />
        </StyledUI>
    );
};
