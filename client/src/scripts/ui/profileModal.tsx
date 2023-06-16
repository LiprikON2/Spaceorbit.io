import React, { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { Modal, TextInput, PasswordInput, Space, Stack, Title, Anchor } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";
import { useMutation, useIsMutating } from "@tanstack/react-query";

import { getFromBackend, postToBackend } from "../backend/api";
import { useGetMe } from "./hooks";
import Button from "./components/button";
import NonFieldErrors from "./components/nonFieldErrors";

const logIn = async (body) => await postToBackend(["users", "login"] as any, "POST", body);
const signUp = async (body) => await postToBackend(["users", "register"] as any, "POST", body);

const ProfileModal = ({ queryClient, opened, onClose }) => {
    const formLogIn = useForm({
        initialValues: {
            username: "",
            password: "",
        },

        validate: (fields) => ({
            username: fields.username.length === 0 ? "Please, enter your username" : null,
            password: fields.password.length === 0 ? "Please, enter your password" : null,
        }),
    });

    const formSignUp = useForm({
        initialValues: {
            email: "",
            username: "",
            password: "",
        },

        validate: (fields) => ({
            email: /^\S+@\S+$/.test(fields.email) ? null : "Invalid email",
            username: fields.username.length === 0 ? "Please, enter your username" : null,
            password: fields.password.length === 0 ? "Please, enter your password" : null,
        }),
    });

    const [accessToken, setAccessToken] = useSessionStorage({
        key: "accessToken",
        defaultValue: "",
    });
    const [refreshToken, setRefreshToken] = useSessionStorage({
        key: "refreshToken",
        defaultValue: "",
    });

    const [nonFieldErrors, setNonFieldErrors] = useState("");
    const handleError = (message) => {
        setNonFieldErrors([message]);
    };

    const { data: me, status: meStatus, remove: meRemove } = useGetMe(accessToken);
    const [showLogIn, setShowLogIn] = useState(false);

    const isUserMutating = useIsMutating("user" as any);

    const handleSuccess = ({ json, ok }) => {
        if (ok) {
            queryClient.invalidateQueries("users");
            const { accessToken, refreshToken } = json;
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
        } else {
            handleError(json.message);
        }
    };

    const logInMutation = useMutation(logIn as any, {
        onSuccess: handleSuccess,
        retry: 0,
    });
    const signUpMutation = useMutation(signUp as any, {
        onSuccess: handleSuccess,
        retry: 0,
    });

    console.log("meStatus", meStatus, "me", me);

    useEffect(() => {
        if (accessToken) {
            console.log("logged in", accessToken);
        } else if (refreshToken) {
            console.log("timed out", refreshToken);
        } else {
            console.log("logged out");
        }
    }, [accessToken]);

    const handleLogIn = (fields, event) => {
        if (!isUserMutating) {
            logInMutation.mutate(fields);
        }
    };

    const handleSignUp = (fields, event) => {
        if (!isUserMutating) {
            signUpMutation.mutate(fields);
        }
    };

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
                    <>
                        {meStatus === "success" ? (
                            <>
                                Username: {me.username}
                                Email: {me.email}
                                Map: {me.map}
                            </>
                        ) : (
                            "Loading..."
                        )}
                        <Button onClick={handleLogout}>Log Out</Button>
                    </>
                ) : showLogIn ? (
                    <form onSubmit={formLogIn.onSubmit(handleLogIn)}>
                        <Stack>
                            <NonFieldErrors errors={nonFieldErrors} />
                            <TextInput
                                placeholder="example@gmail.com"
                                label="Email"
                                {...formLogIn.getInputProps("email")}
                            />
                            <PasswordInput
                                placeholder="Password"
                                label="Password"
                                {...formLogIn.getInputProps("password")}
                            />
                            <Space h="sm" />
                            <Button type="submit">Log In</Button>
                            <Anchor type="button" onClick={() => setShowLogIn(false)}>
                                Sign Up
                            </Anchor>
                        </Stack>
                    </form>
                ) : (
                    <form
                        onSubmit={formSignUp.onSubmit(
                            handleSignUp,
                            (a, b) => console.log("a", a, "b", b) // TODO
                        )}
                    >
                        <Stack>
                            <NonFieldErrors errors={nonFieldErrors} />
                            <TextInput
                                placeholder="user123"
                                label="Username"
                                {...formSignUp.getInputProps("username")}
                            />
                            <TextInput
                                placeholder="example@gmail.com"
                                label="Email"
                                {...formSignUp.getInputProps("email")}
                            />
                            <PasswordInput
                                placeholder="Password"
                                label="Password"
                                {...formSignUp.getInputProps("password")}
                            />
                            <Space h="sm" />
                            <Button type="submit">Sign Up</Button>
                            <Anchor type="button" onClick={() => setShowLogIn(true)}>
                                Log In
                            </Anchor>
                        </Stack>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default ProfileModal;
