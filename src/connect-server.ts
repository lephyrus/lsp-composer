import { createMessageConnection } from "vscode-jsonrpc/node";
import { spawn } from "node:child_process";
import { type Server } from "./index";

export type ServerName = string;

export function connectServer(params: {
  name: ServerName;
  serverCommand: string;
  args: string[];
}): Server {
  const { name, serverCommand, args } = params;

  const childProcess = spawn(serverCommand, args, { cwd: process.cwd() });

  const connection = createMessageConnection(
    childProcess.stdout,
    childProcess.stdin
  );

  childProcess.on("exit", (code, signal) => {
    console.error(`${name} has exited!`, code, signal);
    process.exit(11);
  });
  connection.onClose = () => {
    console.error(`${name} has dropped connection!`);
    process.exit(12);
  };

  connection.listen();

  return { name, connection, type: "server" };
}
