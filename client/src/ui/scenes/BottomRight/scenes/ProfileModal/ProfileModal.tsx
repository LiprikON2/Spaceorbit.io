import React, { useState } from "react";
import { Modal, Title } from "@mantine/core";

import { Register } from "./scenes/Register";
import { Login } from "./scenes/Login";
import { Me } from "./scenes/Me";
import { useProfile } from "./hooks";

export const ProfileModal = ({ opened, onClose }) => {
    const { isLoggedIn, logout } = useProfile();
    const [showLogIn, setShowLogIn] = useState<boolean>(true);

    // Share password and email between login and register forms
    const [initEmailPass, setInitEmailPass] = useState({
        email: "",
        password: "",
    });

    return (
        <>
            <Modal.Root opened={opened} onClose={onClose}>
                <Modal.Overlay />
                <Modal.Content>
                    <Modal.Header>
                        <Title order={2}>
                            {isLoggedIn ? "Profile" : showLogIn ? "Log In" : "Sign Up"}
                        </Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        {isLoggedIn ? (
                            <Me onLogout={logout} />
                        ) : showLogIn ? (
                            <Login
                                setShowLogIn={setShowLogIn}
                                initEmailPass={initEmailPass}
                                setInitEmailPass={setInitEmailPass}
                            />
                        ) : (
                            <Register
                                setShowLogIn={setShowLogIn}
                                initEmailPass={initEmailPass}
                                setInitEmailPass={setInitEmailPass}
                            />
                        )}
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </>
    );
};
