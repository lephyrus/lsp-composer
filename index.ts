class Connection {
  public onNotification?: (notification: Notification) => void;
  public onRequest?: (request: Request) => Response;

  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  public get name(): string {
    return this._name;
  }

  public deliverNotification(notification: Notification): void {
    console.log(
      `[${this.name}] received notification: ${JSON.stringify(notification)}`
    );
  }

  public deliverRequest(request: Request): Response {
    console.log(`[${this.name}] received request: ${JSON.stringify(request)}`);
    return { payload: `--> ${request.payload} <-- response from ${this.name}` };
  }

  public notify(notification: Omit<Notification, "source">): void {
    console.log(
      `[${this.name}] sending notification: ${JSON.stringify(notification)}`
    );
    this.onNotification?.(notification);
  }

  public request(request: Omit<Request, "source">): void {
    console.log(`[${this.name}] sending request: ${JSON.stringify(request)}`);
    const response = this.onRequest?.(request);
    console.log(
      `[${this.name}] received response: ${JSON.stringify(response)}`
    );
  }
}

type Endpoint = {
  connection: Connection;
};

type Notification = {
  method: string;
  payload: string;
};
type Request = {
  method: string;
  payload: string;
};
type Response = {
  payload: string;
};

type RequestInterceptor = (
  request: Request,
  source: Endpoint,
  destination: Endpoint
) => Response;
type ResponseMerger = (responses: Response[]) => Response;

type RequestInterceptors = Map<
  `${string}:${string}:${string}`,
  RequestInterceptor
>;
type ResponseMergers = Map<string, ResponseMerger>;

function getKey(
  method: string,
  source: Endpoint,
  destination: Endpoint
): `${string}:${string}:${string}` {
  return `${method}:${source.connection.name}:${destination.connection.name}`;
}

function setupNotificationProxy(client: Endpoint, servers: Endpoint[]) {
  client.connection.onNotification = (notification: Notification) => {
    servers.forEach((server) => {
      server.connection.deliverNotification(notification);
    });
  };

  servers.forEach((server) => {
    server.connection.onNotification = (notification: Notification) => {
      client.connection.deliverNotification(notification);
    };
  });
}

function setupRequestProxy(client: Endpoint, servers: Endpoint[]) {
  client.connection.onRequest = (request: Request) => {
    const responses = servers.map((server) => {
      const interceptor = requestInterceptors.get(
        getKey(request.method, client, server)
      );
      const response = interceptor
        ? interceptor(request, client, server)
        : server.connection.deliverRequest(request);

      return response;
    });

    const responseMerger = responseMergers.get(request.method);
    const response = responseMerger?.(responses) ?? responses[0];

    return response;
  };

  servers.forEach((server) => {
    server.connection.onRequest = (request: Request) => {
      const interceptor = requestInterceptors.get(
        getKey(request.method, server, client)
      );
      const response = interceptor
        ? interceptor(request, server, client)
        : client.connection.deliverRequest(request);

      return response;
    };
  });
}

const client: Endpoint = {
  connection: new Connection("client"),
};
const serverA: Endpoint = {
  connection: new Connection("serverA"),
};
const serverB: Endpoint = {
  connection: new Connection("serverB"),
};
const servers = [serverA, serverB];
const requestInterceptors: RequestInterceptors = new Map();
const responseMergers: ResponseMergers = new Map();

requestInterceptors.set(getKey("get-config", serverA, client), () => {
  return { payload: "injected configuration for server A" };
});
responseMergers.set("init", (responses: Response[]) => {
  const payloads = responses.map((response) => response.payload);

  return { payload: payloads.join("\n") };
});

setupNotificationProxy(client, servers);
setupRequestProxy(client, servers);

client.connection.request({ method: "init", payload: "Client says hi!" });
serverA.connection.notify({ method: "message", payload: "Server A is ready." });
serverB.connection.request({ method: "get-config", payload: "gimme!" });
serverA.connection.request({ method: "get-config", payload: "gimme also!" });
