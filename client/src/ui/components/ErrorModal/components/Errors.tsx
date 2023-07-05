import React from "react";
import { Text } from "@mantine/core";

export const Errors = ({ errors }) => {
    return (
        <>
            {errors &&
                errors.map((error, index) => (
                    <Text key={index} color="red">
                        {error}
                    </Text>
                ))}
        </>
    );
};
