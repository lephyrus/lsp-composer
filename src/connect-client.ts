import { createMessageConnection } from "vscode-jsonrpc/node";
import { type Client } from "./index";

export function connectClient(): Client {
  const connection = createMessageConnection(process.stdin, process.stdout);

  connection.listen();

  return { name: "client", type: "client", connection };
}
