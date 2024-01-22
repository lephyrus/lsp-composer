import { deepmerge } from "deepmerge-ts";
import type {
  Client,
  RequestInterceptors,
  Response,
  ResponseMergers,
  Server,
} from "./index";
import {
  catchAllMethod,
  getMethodSourceDestinationKey,
} from "./get-method-source-destination-key";
import { hasCapability } from "./has-capability";

export function setupRequestProxy(options: {
  client: Client;
  servers: Server[];
  requestInterceptors: RequestInterceptors;
  responseMergers: ResponseMergers;
}) {
  const { client, servers, requestInterceptors, responseMergers } = options;

  client.connection.onRequest(async (method, params) => {
    const responses = (
      await Promise.all(
        servers.map(async (server) => {
          if (!hasCapability(method, server.capabilities)) {
            console.error(
              `REQ::${method} client SKP> ${server.name} (skipped)`
            );
            return undefined;
          }

          console.error(`REQ::${method} client > ${server.name}`, params);
          const interceptor =
            requestInterceptors.get(
              getMethodSourceDestinationKey(method, client, server)
            ) ??
            requestInterceptors.get(
              getMethodSourceDestinationKey(catchAllMethod, client, server)
            );

          let response: Response = {};
          try {
            response = interceptor
              ? await interceptor({ method, params }, client, server)
              : await server.connection.sendRequest<Response>(method, params);
          } catch (err) {
            console.error(`REQ::${method} client <ERR ${server.name}`, err);
          }

          console.error(`REQ::${method} client < ${server.name}`, response);

          return response;
        })
      )
    ).filter(isDefined);

    const responseMerger = responseMergers.get(method);
    const response = responseMerger?.(responses) ?? deepmerge(...responses);

    console.error(`REQ::${method} client < (merged)`, response);
    return response;
  });

  servers.forEach((server) => {
    server.connection.onRequest(async (method, params) => {
      console.error(`REQ::${method} ${server.name} > client`, params);
      const interceptor =
        requestInterceptors.get(
          getMethodSourceDestinationKey(method, server, client)
        ) ??
        requestInterceptors.get(
          getMethodSourceDestinationKey(catchAllMethod, server, client)
        );
      const response = interceptor
        ? await interceptor({ method, params }, server, client)
        : await client.connection.sendRequest(method, params);

      console.error(`REQ::${method} ${server.name} < client`, response);

      return response;
    });
  });
}

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
