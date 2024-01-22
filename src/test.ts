import { spawn } from "child_process";
import {
  createProtocolConnection,
  InitializeRequest,
  StreamMessageReader,
  StreamMessageWriter,
  type InitializeParams,
} from "vscode-languageserver-protocol/node";

const proxy = spawn("bun", ["./src/index.ts"], {
  stdio: ["pipe", "pipe", "inherit"],
});

const connection = createProtocolConnection(
  new StreamMessageReader(proxy.stdout),
  new StreamMessageWriter(proxy.stdin)
);
connection.listen();

const init: InitializeParams = {
  processId: process.pid,
  clientInfo: { name: "Proxy Test" },
  rootPath: "/home/lukas/Code/lsp-composer/",
  rootUri: "file:///home/lukas/Code/lsp-composer",
  initializationOptions: {},
  capabilities: {
    workspace: {
      applyEdit: true,
      executeCommand: { dynamicRegistration: false },
      workspaceEdit: { documentChanges: true },
      didChangeWatchedFiles: { dynamicRegistration: true },
      symbol: { dynamicRegistration: false },
      configuration: true,
      workspaceFolders: true,
    },
    textDocument: {
      synchronization: {
        dynamicRegistration: false,
        willSave: true,
        willSaveWaitUntil: true,
        didSave: true,
      },
      completion: {
        dynamicRegistration: false,
        completionItem: {
          snippetSupport: true,
          deprecatedSupport: true,
          resolveSupport: {
            properties: ["documentation", "details", "additionalTextEdits"],
          },
          tagSupport: { valueSet: [1] },
        },
        contextSupport: true,
      },
      hover: {
        dynamicRegistration: false,
        contentFormat: ["markdown", "plaintext"],
      },
      signatureHelp: {
        dynamicRegistration: false,
        signatureInformation: {
          parameterInformation: { labelOffsetSupport: true },
          documentationFormat: ["markdown", "plaintext"],
          activeParameterSupport: true,
        },
      },
      references: { dynamicRegistration: false },
      definition: { dynamicRegistration: false, linkSupport: true },
      declaration: { dynamicRegistration: false, linkSupport: true },
      implementation: { dynamicRegistration: false, linkSupport: true },
      typeDefinition: { dynamicRegistration: false, linkSupport: true },
      documentSymbol: {
        dynamicRegistration: false,
        hierarchicalDocumentSymbolSupport: true,
        symbolKind: {
          valueSet: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24, 25, 26,
          ],
        },
      },
      documentHighlight: { dynamicRegistration: false },
      codeAction: {
        dynamicRegistration: false,
        resolveSupport: { properties: ["edit", "command"] },
        dataSupport: true,
        codeActionLiteralSupport: {
          codeActionKind: {
            valueSet: [
              "quickfix",
              "refactor",
              "refactor.extract",
              "refactor.inline",
              "refactor.rewrite",
              "source",
              "source.organizeImports",
            ],
          },
        },
        isPreferredSupport: true,
      },
      formatting: { dynamicRegistration: false },
      rangeFormatting: { dynamicRegistration: false },
      rename: { dynamicRegistration: false },
      inlayHint: { dynamicRegistration: false },
      publishDiagnostics: {
        relatedInformation: false,
        codeDescriptionSupport: false,
        tagSupport: { valueSet: [1, 2] },
      },
    },
    window: { showDocument: { support: true }, workDoneProgress: true },
    general: { positionEncodings: ["utf-32", "utf-8", "utf-16"] },
    experimental: {},
  },
  workspaceFolders: [
    {
      uri: "file:///home/lukas/Code/lsp-composer",
      name: "~/Code/lsp-composer/",
    },
  ],
};

await connection.sendNotification("test", { hello: "world" });
await connection.sendRequest(InitializeRequest.type, init);
