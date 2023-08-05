import { useListState } from "@mantine/hooks";
import { type ServersState, useServerPings } from "..";

const schemas = ["http://", "https://"];
const ips = ["localhost", "192.168.1.246", "192.168.1.143"];
const ports = [":3010"];

const defaultServerList = schemas
    .flatMap((schema) => ips.map((ip) => schema + ip))
    .flatMap((schemaIp) => ports.map((port) => schemaIp + port));

export const useLocalServers = () => {
    const [serverList, { append }] = useListState(defaultServerList);

    const [serverStateList, serverStateStatus] = useServerPings(serverList, true);

    const addLocalServer = (serverIp: string) => {
        let schemaIps: string[];

        const doNotHaveSchema = schemas.every((schema) => !serverIp.includes(schema));
        if (doNotHaveSchema) {
            schemaIps = schemas.map((schema) => schema + serverIp);
        } else schemaIps = [serverIp];

        let ips: string[];
        const doNotHavePort = schemaIps.every(
            (schemaIp) => !schemaIp.split("://")[1].includes(":")
        );

        if (doNotHavePort) {
            ips = schemaIps.flatMap((schemaIp) => ports.map((port) => schemaIp + port));
        } else ips = schemaIps;

        ips.forEach((ip) => {
            if (!serverList.includes(ip)) append(ip);
        });
    };

    return [serverStateList, serverStateStatus, addLocalServer] as [
        ServersState[],
        typeof serverStateStatus,
        typeof addLocalServer
    ];
};
