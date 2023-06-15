import { Modal, TextInput, PasswordInput, Space, Stack, Title } from "@mantine/core";
import React, { useState } from "react";
import { useMutation, useIsMutating } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { getFromBackend, postToBackend } from "../backend/api";

import Button from "./components/button";

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

    const isUserMutating = useIsMutating("user" as any);

    const signUpMutation = useMutation(signUp as any, {
        onSuccess: ({ json, ok }) => {
            if (ok) {
                queryClient.invalidateQueries("users");
                // closeModal();
            } else {
                // handleFieldErrors(json["field_errors"]);
            }
        },
        onError: console.log,

        retry: 0,
    });

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
                <form onSubmit={form.onSubmit(handleSignUp)}>
                    <Stack>
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
