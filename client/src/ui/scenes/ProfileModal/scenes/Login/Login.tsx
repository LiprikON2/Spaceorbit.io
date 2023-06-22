import React, { useState } from "react";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput, Space, Stack, Anchor } from "@mantine/core";

import { Button } from "~/ui/components";
import { NonFieldErrors } from "../../components";
import { useLoginMutation } from "./hooks";

export const Login = ({ setShowLogIn }) => {
    const form = useForm({
        initialValues: {
            email: "",
            password: "",
        },

        validate: (fields) => ({
            email: /^\S+@\S+$/.test(fields.email) ? null : "Invalid email",
            password: fields.password.length === 0 ? "Please, enter your password" : null,
        }),
    });

    const [nonFieldErrors, setNonFieldErrors] = useState("");

    const handleLogIn = useLoginMutation((errors) => setNonFieldErrors([...errors]));

    return (
        <form onSubmit={form.onSubmit(handleLogIn)}>
            <Stack>
                <NonFieldErrors errors={nonFieldErrors} />
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
                <Button type="submit">Log In</Button>
                <Anchor type="button" onClick={() => setShowLogIn(false)}>
                    Sign Up
                </Anchor>
            </Stack>
        </form>
    );
};
