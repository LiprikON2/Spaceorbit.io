import React from "react";
import { useToggle } from "@mantine/hooks";
import { User } from "tabler-icons-react";

import { game } from "~/game";
import { Button } from "~/ui/components";
import { ProfileModal } from "./scenes/ProfileModal";

export const BottomRight = ({ GroupComponent }) => {
    const [openedProfileModal, toggleProfileModal] = useToggle([false, true]);

    const toggleProfile = () => {
        const player = game.getPlayer();
        if (player) {
            toggleProfileModal();
            // todo this will enable you to shoot and move in dying animation
            player.active = openedProfileModal;
        }
    };

    return (
        <>
            <GroupComponent>
                <Button isSquare onClick={toggleProfile}>
                    <User />
                </Button>
            </GroupComponent>
            <ProfileModal opened={openedProfileModal} onClose={toggleProfile} />
        </>
    );
};
