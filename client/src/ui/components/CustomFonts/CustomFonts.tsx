import React from "react";
import { Global } from "@mantine/core";

import CarterOneRegular from "~/assets/fonts/CarterOne-Regular.ttf";

export const CustomFonts = () => {
    return (
        <Global
            styles={[
                {
                    "@font-face": {
                        fontFamily: "Carter One",
                        src: `url('${CarterOneRegular}')`,
                        fontWeight: 600,
                        fontStyle: "normal",
                    },
                },
            ]}
        />
    );
};
