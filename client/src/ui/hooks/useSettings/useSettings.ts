import { gameManager } from "~/game/core/GameManager";

export const useSettings = () => {
    const settings = gameManager.settings;

    return { settings };
};
