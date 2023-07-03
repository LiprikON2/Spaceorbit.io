import React from "react";

import { Chat } from "./scenes/Chat";
import { useGame } from "~/ui/hooks";

export const UnderTopRight = ({ GroupComponent }) => {
    const { mode } = useGame();

    return <GroupComponent>{mode === "multiplayer" && <Chat />}</GroupComponent>;
};
