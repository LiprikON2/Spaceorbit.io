import React, { useState } from "react";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput, Space, Stack, Anchor } from "@mantine/core";

import { Button } from "~/ui/components";
import { NonFieldErrors } from "../../components";
import { useRegisterMutation } from "./hooks";

export const Register = ({ setShowLogIn }) => {
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
    const [nonFieldErrors, setNonFieldErrors] = useState<string[]>([]);

    const handleSignUp = useRegisterMutation((errors) => setNonFieldErrors([...errors]));

    return (
        <form onSubmit={form.onSubmit(handleSignUp)}>
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

export default Register;
