export interface StatusEvent {
    name: string;
    progress: number;
}
export interface ConnectionErrorEvent {
    message: string;
    navigateToMode: "mainMenu" | "singleplayer" | "multiplayer";
}
export interface OutEvents {
    "world:create": () => void;
    loading: (status: StatusEvent) => void;
    connectionError: (errorDetails: ConnectionErrorEvent) => void;
}
