import React from "react";

import { useGame } from "~/ui/hooks";
import { MainMenu } from "./scenes/MainMenu";
import { Loading } from "./scenes/Loading";
import type { StyledGroup } from "~/ui/App";

export const Center = ({ GroupComponent }: { GroupComponent: StyledGroup }) => {
    const { mode } = useGame();

    return <GroupComponent>{mode === "mainMenu" ? <MainMenu /> : <Loading />}</GroupComponent>;
};
