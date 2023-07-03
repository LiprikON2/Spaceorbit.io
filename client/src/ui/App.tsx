import React, { useEffect } from "react";
import { BackgroundImage, Group } from "@mantine/core";
import styled from "@emotion/styled";

import { syncSettingsToSession, useGame } from "./hooks";
import { TopLeft } from "./scenes/TopLeft";
import { TopRight } from "./scenes/TopRight";
import { Center } from "./scenes/Center";
import { Right } from "./scenes/Right";
import { BottomLeft } from "./scenes/BottomLeft";
import { BottomRight } from "./scenes/BottomRight";
import background from "~/assets/ui/background-space.webp";
import { UnderTopRight } from "./scenes/UnderTopRight";

// @ts-ignore
const StyledUI = styled(BackgroundImage)`
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100vw;
    height: 100vh;
    pointer-events: none;

    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-rows: 1fr;
    grid-template-areas:
        "top-l top-l top-l    .     .     .    .    .    . top-r top-r top-r"
        "    .     .     .    .     .     .    .    .    .     .     .     ."
        "    .     .     .    .  cent  cent cent cent    .     .     .     ."
        " left  left  left    .  cent  cent cent cent    . right right right"
        " left  left  left    .  cent  cent cent cent    . right right right"
        "    .     .     .    .  cent  cent cent cent    .     .     .     ."
        "    .     .     .    .     .     .    .    .    .     .     .     ."
        "bot-l bot-l bot-l    .     .     .    .    .    . bot-r bot-r bot-r";

    & > * {
        margin: 1rem;
        pointer-events: auto;
    }
` as typeof BackgroundImage;

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
`;

const StyledUnderTopRightGroup = styled(Group)`
    grid-column: top-l-start / cent-start;
    grid-row: top-l-end / left-end;
    justify-self: start;
    align-self: start;

    display: flex;
    align-items: end;
    flex-wrap: nowrap;

    margin-block: 0;
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
        computed: { isLoaded },
    } = useGame();

    return (
        <StyledUI src={background} style={{ ...(isLoaded && { backgroundImage: "none" }) }}>
            {isLoaded && <TopLeft GroupComponent={StyledTopLeftGroup} />}
            {isLoaded && <TopRight GroupComponent={StyledTopRightGroup} />}
            {!isLoaded && <Center GroupComponent={StyledCenterGroup} />}
            {isLoaded && <UnderTopRight GroupComponent={StyledUnderTopRightGroup} />}
            <Right GroupComponent={StyledRightGroup} />
            {isLoaded && <BottomLeft GroupComponent={StyledBottomLeftGroup} />}
            <BottomRight GroupComponent={StyledBottomRightGroup} />
        </StyledUI>
    );
};
