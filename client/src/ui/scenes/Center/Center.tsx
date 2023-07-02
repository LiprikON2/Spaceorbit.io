import React from "react";

import { useGame } from "~/ui/hooks";
import { MainMenu } from "./scenes/MainMenu";
import { Loading } from "./scenes/Loading";

export const Center = ({ GroupComponent }) => {
    const { mode } = useGame();

    return <GroupComponent>{mode === "mainMenu" ? <MainMenu /> : <Loading />}</GroupComponent>;
};
