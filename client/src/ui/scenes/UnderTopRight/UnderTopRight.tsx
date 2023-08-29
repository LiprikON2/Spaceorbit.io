import React from "react";

import { Chat } from "./scenes/Chat";
import { useGame } from "~/ui/hooks";
import type { StyledGroup } from "~/ui/App";

export const UnderTopRight = ({ GroupComponent }: { GroupComponent: StyledGroup }) => {
    const { mode } = useGame();

    return <GroupComponent>{mode === "multiplayer" && <Chat />}</GroupComponent>;
};
