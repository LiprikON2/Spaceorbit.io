import React, { useState } from "react";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput, Space, Stack, Anchor } from "@mantine/core";

import Button from "../components/button";
import NonFieldErrors from "../components/nonFieldErrors";
import { useSignUpMutation } from "../hooks";

const signUpForm = ({ queryClient, setShowLogIn }) => {
    const form = useForm({
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
    const [nonFieldErrors, setNonFieldErrors] = useState("");

    const handleSignUp = useSignUpMutation(queryClient, (errors) => setNonFieldErrors([...errors]));

    return (
        <form
            onSubmit={form.onSubmit(
                handleSignUp,
                (a, b) => console.log("a", a, "b", b) // TODO
            )}
        >
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
                <Anchor type="button" onClick={() => setShowLogIn(true)}>
                    Log In
                </Anchor>
            </Stack>
        </form>
    );
};

export default signUpForm;
