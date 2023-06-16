import React, { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { Modal, TextInput, PasswordInput, Space, Stack, Title } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";
import { useMutation, useIsMutating } from "@tanstack/react-query";

import { getFromBackend, postToBackend } from "../backend/api";
import Button from "./components/button";
import NonFieldErrors from "./components/nonFieldErrors";

const signUp = async (body) => await postToBackend(["users", "register"] as any, "POST", body);

const ProfileModal = ({ queryClient, opened, onClose }) => {
    const form = useForm({
        initialValues: {
            email: "",
            username: "",
            password: "",
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
        },
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

    const isUserMutating = useIsMutating("user" as any);

    const signUpMutation = useMutation(signUp as any, {
        onSuccess: ({ json, ok }) => {
            if (ok) {
                queryClient.invalidateQueries("users");
                const { accessToken, refreshToken } = json;
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);

                // closeModal();
            } else {
                handleError(json.message);
                // handleFieldErrors(json["field_errors"]);
            }
        },
        onError: console.log,

        retry: 0,
    });

    useEffect(() => {
        if (accessToken) {
            console.log("logged in", accessToken);
        } else if (refreshToken) {
            console.log("timed out", refreshToken);
        } else {
            console.log("logged out");
        }
    }, [accessToken]);

    const handleSignUp = (fields, event) => {
        const isLoggedIn = false; // TODO
        if (!isLoggedIn && !isUserMutating) {
            signUpMutation.mutate(fields);
        }
    };

    return (
        <>
            <Modal
                className="modal"
                opened={opened}
                onClose={onClose}
                title={<Title order={4}>Sign Up</Title>}
            >
                <form onSubmit={form.onSubmit(handleSignUp, (a, b) => console.log("a", a, "b", b))}>
                    <Stack>
                        <NonFieldErrors errors={nonFieldErrors} />
                        <TextInput
                            placeholder="user123"
                            label="Username"
                            {...form.getInputProps("username")}
                        />
                        <TextInput
                            placeholder="example@gmail.com"
                            label="Email"
                            {...form.getInputProps("email")}
                        />
                        <PasswordInput
                            placeholder="Password"
                            label="Password"
                            {...form.getInputProps("password")}
                        />
                        <Space h="sm" />
                        <Button type="submit">Sign Up</Button>
                    </Stack>
                </form>
            </Modal>
        </>
    );
};

export default ProfileModal;
