import type { DiagnosticsStore } from "./diagnostics-store";
import type { Client, Server } from "./index";
import {
  PublishDiagnosticsNotification,
  type PublishDiagnosticsParams,
} from "vscode-languageserver-protocol";

export function setupNotificationProxy(
  client: Client,
  servers: Server[],
  diagnosticsStore: DiagnosticsStore
) {
  client.connection.onNotification((method, params) => {
    servers.forEach((server) => {
      console.error(`NTF::${method} client > ${server.name}`, params);
      server.connection.sendNotification(method, params);
    });
  });

  servers.forEach((server) => {
    server.connection.onNotification((method, params) => {
      if (method === PublishDiagnosticsNotification.method) {
        const { uri, diagnostics } = params as PublishDiagnosticsParams;
        diagnosticsStore.set(server.name, uri, diagnostics);

        const response = {
          uri,
          diagnostics: diagnosticsStore.get(uri),
        };
        console.error(`NTF::${method} ${server.name} > client`, response);
        client.connection.sendNotification(method, response);
      } else {
        console.error(`NTF::${method} ${server.name} > client`, params);
        client.connection.sendNotification(method, params);
      }
    });
  });
}
