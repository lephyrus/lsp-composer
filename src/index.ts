import {
  InitializeRequest,
  type InitializeParams,
  type InitializeResult,
  type ServerCapabilities,
} from "vscode-languageserver-protocol";
import { type MessageConnection } from "vscode-jsonrpc/node";
import { connectClient } from "./connect-client";
import { connectServer } from "./connect-server";
import config from "./config";
import { getDiagnosticsStore } from "./diagnostics-store";
import { getMethodSourceDestinationKey } from "./get-method-source-destination-key";
import { setupNotificationProxy } from "./setup-notification-proxy";
import { setupRequestProxy } from "./setup-request-proxy";

export type ServerName = string;
export type Method = string;

export type Connection = {
  connection: MessageConnection;
};
export type Server = Connection & {
  type: "server";
  name: ServerName;
  capabilities?: ServerCapabilities;
};
export type Client = Connection & {
  type: "client";
  name: "client";
  initializeParams?: InitializeParams;
};

export type Notification = {
  method: Method;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  params?: any[] | object;
};
export type Request = {
  method: Method;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  params?: any[] | object;
};
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type Response = any[] | object;

type RequestInterceptor = (
  request: Request,
  source: Connection,
  destination: Connection
) => Promise<Response>;
type ResponseMerger = (responses: Response[]) => Response;

export type RequestInterceptors = Map<string, RequestInterceptor>;
export type ResponseMergers = Map<Method, ResponseMerger>;

const client = connectClient();
let servers: Server[] = [];
for (const server of config.servers) {
  servers = [...servers, connectServer(server)];
  console.error(`Server ${server.name} connected.`);
}
const requestInterceptors: RequestInterceptors = new Map();
const responseMergers: ResponseMergers = new Map();

// server-specific interceptors
requestInterceptors.set(
  getMethodSourceDestinationKey("workspace/configuration", servers[1], client),
  () => {
    return Promise.resolve([
      {
        validate: "on",
        packageManager: "npm",
        useESLintClass: true,
        experimental: {},
        codeAction: {
          disableRuleComment: {
            enable: true,
            location: "separateLine",
            commentStyle: "block",
          },
          showDocumentation: { enable: true },
        },
        codeActionOnSave: { mode: "problems" },
        format: false,
        quiet: false,
        onIgnoredFiles: "warn",
        options: undefined,
        rulesCustomizations: [],
        run: "onType",
        problems: { shortenToSingleLine: false },
        nodePath: null,
        workspaceFolder: {
          uri: client.initializeParams?.workspaceFolders?.[0].uri,
        },
        workingDirectory: undefined,
      },
    ]);
  }
);

// save capabilities
for (const server of servers) {
  requestInterceptors.set(
    getMethodSourceDestinationKey(InitializeRequest.method, client, server),
    async (request) => {
      client.initializeParams = request.params as InitializeParams;

      const response = await server.connection.sendRequest<InitializeResult>(
        request.method,
        request.params
      );
      server.capabilities = response.capabilities;

      return response;
    }
  );
}

setupNotificationProxy(client, servers, getDiagnosticsStore());
setupRequestProxy({
  client,
  servers,
  requestInterceptors,
  responseMergers,
});
