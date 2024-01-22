import {
  InitializeRequest,
  InlayHintRequest,
  InlineValueRequest,
  MonikerRequest,
  CompletionRequest,
  CompletionResolveRequest,
  SignatureHelpRequest,
  CodeActionRequest,
  DocumentColorRequest,
  DocumentFormattingRequest,
  DocumentRangeFormattingRequest,
  DocumentOnTypeFormattingRequest,
  RenameRequest,
  LinkedEditingRangeRequest,
  HoverRequest,
  DocumentHighlightRequest,
  DefinitionRequest,
  type ServerCapabilities,
  ReferencesRequest,
} from "vscode-languageserver-protocol";
import type { Method } from "./index";

export function hasCapability(
  method: Method,
  capabilities?: ServerCapabilities
): boolean {
  switch (method) {
    case InitializeRequest.method: {
      return true;
    }
    case InlayHintRequest.method: {
      return !!capabilities?.inlayHintProvider;
    }
    case InlineValueRequest.method: {
      return !!capabilities?.inlineValueProvider;
    }
    case MonikerRequest.method: {
      return !!capabilities?.monikerProvider;
    }
    case CompletionRequest.method: {
      return !!capabilities?.completionProvider;
    }
    case SignatureHelpRequest.method: {
      return !!capabilities?.signatureHelpProvider;
    }
    case CodeActionRequest.method: {
      return !!capabilities?.codeActionProvider;
    }
    case DocumentColorRequest.method: {
      return !!capabilities?.colorProvider;
    }
    case DocumentFormattingRequest.method: {
      return !!capabilities?.documentFormattingProvider;
    }
    case DocumentRangeFormattingRequest.method: {
      return !!capabilities?.documentRangeFormattingProvider;
    }
    case DocumentOnTypeFormattingRequest.method: {
      return !!capabilities?.documentOnTypeFormattingProvider;
    }
    case RenameRequest.method: {
      return !!capabilities?.renameProvider;
    }
    case LinkedEditingRangeRequest.method: {
      return !!capabilities?.linkedEditingRangeProvider;
    }
    case HoverRequest.method: {
      return !!capabilities?.hoverProvider;
    }
    case DocumentHighlightRequest.method: {
      return !!capabilities?.documentHighlightProvider;
    }
    case DefinitionRequest.method: {
      return !!capabilities?.definitionProvider;
    }
    case CompletionResolveRequest.method: {
      return !!capabilities?.completionProvider?.resolveProvider;
    }
    case ReferencesRequest.method: {
      return !!capabilities?.referencesProvider;
    }
    default: {
      return false;
    }
  }
}
