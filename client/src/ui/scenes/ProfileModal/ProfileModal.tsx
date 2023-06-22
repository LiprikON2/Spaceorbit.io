import React, { useState } from "react";
import { Modal, Title } from "@mantine/core";

import { Register } from "./scenes/Register";
import { Login } from "./scenes/Login";
import { Me } from "./scenes/Me";
import { useProfile } from "./hooks";

export const ProfileModal = ({ opened, onClose }) => {
    const { me, meStatus, isLoggedIn, logout } = useProfile();
    const [showLogIn, setShowLogIn] = useState(true);

    return (
        <>
            <Modal
                className="modal"
                opened={opened}
                onClose={onClose}
                title={
                    <Title order={4}>
                        {isLoggedIn ? "Profile" : showLogIn ? "Log In" : "Sign Up"}
                    </Title>
                }
            >
                {isLoggedIn ? (
                    <Me me={me} meStatus={meStatus} handleLogout={logout} />
                ) : showLogIn ? (
                    <Login setShowLogIn={setShowLogIn} />
                ) : (
                    <Register setShowLogIn={setShowLogIn} />
                )}
            </Modal>
        </>
    );
};
