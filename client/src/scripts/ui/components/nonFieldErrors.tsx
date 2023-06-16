import React from "react";
import { Text } from "@mantine/core";

const NonFieldErrors = ({ errors }) => {
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

export default NonFieldErrors;
