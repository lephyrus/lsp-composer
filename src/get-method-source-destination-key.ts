import type { Client, Method, Server } from "./index";

export const catchAllMethod = "*";

export function getMethodSourceDestinationKey<
  Source extends Client,
  Destination extends Server
>(method: Method, source: Source, destination: Destination): string;
export function getMethodSourceDestinationKey<
  Source extends Server,
  Destination extends Client
>(method: Method, source: Source, destination: Destination): string;

export function getMethodSourceDestinationKey<
  Source extends Client | Server,
  Destination extends Client | Server
>(method: Method, source: Source, destination: Destination): string {
  if (
    (isClient(source) && isServer(destination)) ||
    (isServer(source) && isClient(destination))
  ) {
    return `${method}:${source.name}:${destination.name}`;
  }

  throw new Error("Invalid source/destination combination");
}

function isClient(value: Client | Server): value is Client {
  return value.type === "client";
}
function isServer(value: Client | Server): value is Server {
  return value.type === "server";
}
