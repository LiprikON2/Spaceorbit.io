import { useListState } from "@mantine/hooks";

import { useServerPings } from "..";
import type { ServersState } from "~/ui/services/api";

const schemas = ["http://", "https://"];
const ips = ["localhost", "192.168.1.246", "192.168.1.143"];
const ports = [":3010"];

const defaultServerList = schemas
    .flatMap((schema) => ips.map((ip) => schema + ip))
    .flatMap((schemaIp) => ports.map((port) => schemaIp + port));

export interface CustomServersHandler {
    status: "success" | "loading" | "error";
    add: (serverIp: string) => void;
    remove: (serverUrl: string) => void;
}

export const useLocalServers = () => {
    const [serverList] = useListState(defaultServerList);
    const [customServerList, { append, remove }] = useListState([]);

    const [serverStateList, serverStateStatus] = useServerPings(serverList, true);
    const [customServerStateList, customServerStateStatus] = useServerPings(
        customServerList,
        false
    );

    const addLocalServer = (serverIp: string) => {
        let schemaIps: string[];

        const doesNotHaveSchema = schemas.every((schema) => !serverIp.includes(schema));
        if (doesNotHaveSchema) {
            schemaIps = schemas.map((schema) => schema + serverIp);
        } else schemaIps = [serverIp];

        let ips: string[];
        const doesNotHavePort = schemaIps.every(
            (schemaIp) => !schemaIp.split("://")[1].includes(":")
        );
        const isIpAddress = schemaIps.every((schemaIp) =>
            /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(schemaIp.split("://")[1])
        );

        if (doesNotHavePort && isIpAddress) {
            ips = schemaIps.flatMap((schemaIp) => ports.map((port) => schemaIp + port));
        } else ips = schemaIps;

        ips.forEach((ip) => {
            if (!customServerList.includes(ip) && !serverList.includes(ip)) append(ip);
        });
    };

    const removeLocalServer = (serverUrl: string) => {
        remove(customServerList.findIndex((serverKey) => serverKey === serverUrl));
    };

    const userServerStateListExtended = customServerStateList.map((serverState) => ({
        ...serverState,
        removeable: true,
    }));

    const serverStateListCombined = [...serverStateList, ...userServerStateListExtended];

    return [
        serverStateListCombined,
        serverStateStatus,
        { status: customServerStateStatus, add: addLocalServer, remove: removeLocalServer },
    ] as [ServersState[], typeof serverStateStatus, CustomServersHandler];
};
