import { type ServerName } from "./index";
import { type Diagnostic } from "vscode-languageserver-protocol";

type Uri = string;
export interface DiagnosticsStore {
  get: (uri: string) => Diagnostic[];
  set: (serverName: ServerName, uri: Uri, diagnostics: Diagnostic[]) => void;
}

export function getDiagnosticsStore(): DiagnosticsStore {
  const store = new Map<Uri, Map<ServerName, Diagnostic[]>>();

  return {
    get: (uri) => {
      const uriDiagnostics = store.get(uri) ?? new Map();
      return Array.from(uriDiagnostics.values()).flat();
    },
    set: (serverName, uri, diagnostics) => {
      const uriDiagnostics =
        store.get(uri) ?? new Map<ServerName, Diagnostic[]>();
      uriDiagnostics.set(serverName, diagnostics);
      store.set(uri, uriDiagnostics);
    },
  };
}
