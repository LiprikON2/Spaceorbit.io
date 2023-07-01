import React from "react";
import { useToggle } from "@mantine/hooks";
import { Home, User } from "tabler-icons-react";

import { Button } from "~/ui/components";
import { ProfileModal } from "./scenes/ProfileModal";
import { useGame } from "~/ui/hooks";

export const BottomRight = ({ GroupComponent }) => {
    const {
        loadMainMenu,
        computed: { isLoaded, player },
    } = useGame();
    const [openedProfileModal, toggleProfileModal] = useToggle([false, true]);

    const toggleProfile = () => {
        toggleProfileModal();
        if (isLoaded) {
            // todo this will enable you to shoot and move in dying animation
            player.active = openedProfileModal;
        }
    };

    const handleLoadMainMenu = () => {
        loadMainMenu();
    };

    return (
        <>
            <GroupComponent>
                <Button isSquare onClick={handleLoadMainMenu}>
                    <Home />
                </Button>
                <Button isSquare onClick={toggleProfile}>
                    <User />
                </Button>
            </GroupComponent>
            <ProfileModal opened={openedProfileModal} onClose={toggleProfile} />
        </>
    );
};
