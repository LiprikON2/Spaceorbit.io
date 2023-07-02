import React, { useEffect } from "react";
import { Group } from "@mantine/core";
import styled from "@emotion/styled";

import { syncSettingsToSession, useGame } from "./hooks";
import { TopLeft } from "./scenes/TopLeft";
import { TopRight } from "./scenes/TopRight";
import { Center } from "./scenes/Center";
import { Right } from "./scenes/Right";
import { BottomLeft } from "./scenes/BottomLeft";
import { BottomRight } from "./scenes/BottomRight";

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
        "top-l top-l top-l .    .    .    .    . .     . top-r top-r"
        "    .     .     . .    .    .    .    . .     .     .     ."
        "    .     .     . . cent cent cent cent .     .     .     ."
        "    .     .     . . cent cent cent cent . right right right"
        "    .     .     . . cent cent cent cent . right right right"
        "    .     .     . . cent cent cent cent .     .     .     ."
        "    .     .     . .    .    .    .    . .     .     .     ."
        "bot-l bot-l bot-l .    .    .    .    . .     . bot-r bot-r";

    & > * {
        margin: 1rem;
        pointer-events: auto;
    }
`;

const StyledTopLeftGroup = styled(Group)`
    grid-area: top-l;
    justify-self: start;
    align-self: start;

    display: flex;
    flex-wrap: nowrap;
`;
const StyledTopRightGroup = styled(Group)`
    grid-area: top-r;
    justify-self: end;
    align-self: start;
`;
const StyledCenterGroup = styled(Group)`
    grid-area: cent;
    justify-self: stretch;
    align-self: center;

    display: flex;
    flex-direction: column;
    & > {
        flex-grow: 1;
    }
`;
const StyledRightGroup = styled(Group)`
    grid-area: right;
    justify-self: end;
    align-self: center;
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

export const App = () => {
    useEffect(() => {
        const unsub = syncSettingsToSession();
        return unsub;
    }, []);

    const {
        mode,
        computed: { isLoaded },
    } = useGame();

    return (
        <StyledUI>
            {isLoaded && <TopLeft GroupComponent={StyledTopLeftGroup} />}
            {isLoaded && <TopRight GroupComponent={StyledTopRightGroup} />}
            {!isLoaded && <Center GroupComponent={StyledCenterGroup} />}
            <Right GroupComponent={StyledRightGroup} />
            {isLoaded && <BottomLeft GroupComponent={StyledBottomLeftGroup} />}
            <BottomRight GroupComponent={StyledBottomRightGroup} />
        </StyledUI>
    );
};
