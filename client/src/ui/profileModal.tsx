import React, { useState } from "react";
import { Modal, Title } from "@mantine/core";

import { useMe } from "~/hooks";
import SignUpForm from "./components/signUpForm";
import LogInForm from "./components/logInForm";
import Profile from "./components/profile";

const ProfileModal = ({ queryClient, opened, onClose }) => {
    const { me, meStatus, isLoggedIn, logout } = useMe();
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
                    <Profile
                        queryClient={queryClient}
                        me={me}
                        meStatus={meStatus}
                        handleLogout={logout}
                    />
                ) : showLogIn ? (
                    <LogInForm queryClient={queryClient} setShowLogIn={setShowLogIn} />
                ) : (
                    <SignUpForm queryClient={queryClient} setShowLogIn={setShowLogIn} />
                )}
            </Modal>
        </>
    );
};

export default ProfileModal;
