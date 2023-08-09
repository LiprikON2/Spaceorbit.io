import React from "react";
import { Global } from "@mantine/core";

import CarterOneRegular from "~/assets/fonts/CarterOne-Regular.ttf";
import KanitLight from "~/assets/fonts/Kanit-Light.ttf";
import KanitLightItalic from "~/assets/fonts/Kanit-LightItalic.ttf";
import KanitRegular from "~/assets/fonts/Kanit-Regular.ttf";
import KanitRegularItalic from "~/assets/fonts/Kanit-Italic.ttf";
import TomorrowLight from "~/assets/fonts/Tomorrow-Light.ttf";
import TomorrowLightItalic from "~/assets/fonts/Tomorrow-LightItalic.ttf";
import TomorrowRegular from "~/assets/fonts/Tomorrow-Regular.ttf";
import TomorrowRegularItalic from "~/assets/fonts/Tomorrow-Italic.ttf";

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
                {
                    "@font-face": {
                        fontFamily: "Kanit",
                        src: `url('${KanitLight}')`,
                        fontWeight: 300,
                        fontStyle: "normal",
                    },
                },
                {
                    "@font-face": {
                        fontFamily: "Kanit",
                        src: `url('${KanitLightItalic}')`,
                        fontWeight: 300,
                        fontStyle: "italic",
                    },
                },
                {
                    "@font-face": {
                        fontFamily: "Kanit",
                        src: `url('${KanitRegular}')`,
                        fontWeight: 400,
                        fontStyle: "normal",
                    },
                },
                {
                    "@font-face": {
                        fontFamily: "Kanit",
                        src: `url('${KanitRegularItalic}')`,
                        fontWeight: 400,
                        fontStyle: "italic",
                    },
                },

                {
                    "@font-face": {
                        fontFamily: "Tomorrow",
                        src: `url('${TomorrowLight}')`,
                        fontWeight: 300,
                        fontStyle: "normal",
                    },
                },
                {
                    "@font-face": {
                        fontFamily: "Tomorrow",
                        src: `url('${TomorrowLightItalic}')`,
                        fontWeight: 300,
                        fontStyle: "italic",
                    },
                },

                {
                    "@font-face": {
                        fontFamily: "Tomorrow",
                        src: `url('${TomorrowRegular}')`,
                        fontWeight: 400,
                        fontStyle: "normal",
                    },
                },
                {
                    "@font-face": {
                        fontFamily: "Tomorrow",
                        src: `url('${TomorrowRegularItalic}')`,
                        fontWeight: 400,
                        fontStyle: "italic",
                    },
                },
            ]}
        />
    );
};
