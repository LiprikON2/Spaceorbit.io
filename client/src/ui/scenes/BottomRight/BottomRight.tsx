import React, { useState } from "react";
import { Home, User } from "tabler-icons-react";

import { Button } from "~/ui/components";
import { ProfileModal } from "./scenes/ProfileModal";
import { useGame } from "~/ui/hooks";

export const BottomRight = ({ GroupComponent }) => {
    const {
        gameManager,
        exit,
        computed: { isLoaded, isLoading },
    } = useGame();

    const [openedProfileModal, setOpenedProfileModal] = useState(false);

    const openProfile = () => {
        if (isLoaded) gameManager.lockInput();
        setOpenedProfileModal(true);
    };
    const closeProfile = () => {
        if (isLoaded) gameManager.unlockInput();
        setOpenedProfileModal(false);
    };

    return (
        <>
            <GroupComponent>
                {isLoaded && (
                    <Button isSquare onClick={() => exit(true)}>
                        <Home strokeWidth={2.5} />
                    </Button>
                )}
                {!isLoading && (
                    <Button isSquare onClick={openProfile}>
                        <User strokeWidth={2.5} />
                    </Button>
                )}
            </GroupComponent>
            <ProfileModal opened={openedProfileModal} onClose={closeProfile} />
        </>
    );
};
