import React, { useEffect, useState } from "react";
import { Modal, Title } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";

import { useGetMe } from "./hooks";
import SignUpForm from "./components/signUpForm";
import LogInForm from "./components/logInForm";
import Profile from "./components/profile";

const ProfileModal = ({ queryClient, opened, onClose }) => {
    const [accessToken, setAccessToken] = useSessionStorage({
        key: "accessToken",
        defaultValue: "",
    });
    const [refreshToken, setRefreshToken] = useSessionStorage({
        key: "refreshToken",
        defaultValue: "",
    });

    const { data: me, status: meStatus, remove: meRemove } = useGetMe(accessToken);
    const [showLogIn, setShowLogIn] = useState(false);

    // useEffect(() => {
    //     if (accessToken) {
    //         console.log("logged in", accessToken);
    //     } else if (refreshToken) {
    //         console.log("timed out", refreshToken);
    //     } else {
    //         console.log("logged out");
    //     }
    // }, [accessToken]);

    const handleLogout = () => {
        setAccessToken("");
        setRefreshToken("");
        meRemove();
    };

    return (
        <>
            <Modal
                className="modal"
                opened={opened}
                onClose={onClose}
                title={
                    <Title order={4}>
                        {accessToken ? "Profile" : showLogIn ? "Log In" : "Sign Up"}
                    </Title>
                }
            >
                {accessToken ? (
                    <Profile me={me} meStatus={meStatus} handleLogout={handleLogout} />
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
