import React from "react";
import { useToggle } from "@mantine/hooks";
import { Home, User } from "tabler-icons-react";

import { Button } from "~/ui/components";
import { ProfileModal } from "./scenes/ProfileModal";
import { useGame } from "~/ui/hooks";

export const BottomRight = ({ GroupComponent }) => {
    const {
        gameManager,
        loadMainMenu,
        computed: { isLoaded },
    } = useGame();
    const [openedProfileModal, toggleProfileModal] = useToggle([false, true]);

    const toggleProfile = () => {
        if (isLoaded) {
            if (openedProfileModal) {
                gameManager.unlockInput();
            } else {
                gameManager.lockInput();
            }
        }

        toggleProfileModal();
    };

    const handleMainMenu = () => {
        loadMainMenu();
    };

    return (
        <>
            <GroupComponent>
                {isLoaded && (
                    <Button isSquare onClick={handleMainMenu}>
                        <Home />
                    </Button>
                )}
                <Button isSquare onClick={toggleProfile}>
                    <User />
                </Button>
            </GroupComponent>
            <ProfileModal opened={openedProfileModal} onClose={toggleProfile} />
        </>
    );
};
