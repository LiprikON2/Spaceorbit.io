import React, { useState } from "react";
import { useDidUpdate } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput, Space, Stack, Anchor } from "@mantine/core";

import { Button, Errors } from "~/ui/components";
import { useLoginMutation } from "./hooks";

export const Login = ({ setShowLogIn, initEmailPass = {}, setInitEmailPass }) => {
    const form = useForm({
        initialValues: {
            ...{ email: "", password: "" },
            ...initEmailPass,
        },

        validate: (fields) => ({
            email: /^\S+@\S+$/.test(fields.email) ? null : "Invalid email",
            password: fields.password.length === 0 ? "Please, enter your password" : null,
        }),
    });

    const [nonFieldErrors, setNonFieldErrors] = useState<string[]>([]);

    const handleLogin = useLoginMutation((errors) => setNonFieldErrors([...errors]));

    // Share password and email between login and register forms
    useDidUpdate(() => {
        if (setInitEmailPass) setInitEmailPass(() => form.values);
    }, [form.values]);

    return (
        <form onSubmit={form.onSubmit(handleLogin)}>
            <Stack>
                <Errors errors={nonFieldErrors} />
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
