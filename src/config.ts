const tsServer = {
  name: "typescript",
  serverCommand: "typescript-language-server",
  args: ["--stdio"],
};

const eslintServer = {
  name: "vscode-eslint",
  serverCommand: "vscode-eslint-language-server",
  args: ["--stdio"],
};

export default {
  servers: [tsServer, eslintServer],
};
