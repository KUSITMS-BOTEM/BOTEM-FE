const listen = vi.fn();

vi.mock("@sentry/nextjs", () => ({ captureRequestError: vi.fn() }));
vi.mock("@/sentry.server.config", () => ({}));
vi.mock("@/sentry.edge.config", () => ({}));
vi.mock("@/mocks/server", () => ({ server: { listen } }));

const runRegister = async () => {
  vi.resetModules();
  const { register } = await import("@/instrumentation");
  await register();
};

beforeEach(() => {
  listen.mockClear();
  delete (globalThis as { __mswServerStarted?: boolean }).__mswServerStarted;
  vi.stubEnv("NEXT_RUNTIME", "nodejs");
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_MSW_ENABLED", "1");
});

afterEach(() => vi.unstubAllEnvs());

describe("instrumentation register", () => {
  it("개발 환경에서 MSW가 켜져 있으면 서버 MSW를 목에 없는 요청은 통과시키며 시작한다", async () => {
    await runRegister();

    expect(listen).toHaveBeenCalledWith({ onUnhandledFrame: "bypass" });
  });

  it("production에서는 플래그가 켜져 있어도 서버 MSW를 시작하지 않는다", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await runRegister();

    expect(listen).not.toHaveBeenCalled();
  });

  it("MSW 플래그가 꺼져 있으면 시작하지 않는다", async () => {
    vi.stubEnv("NEXT_PUBLIC_MSW_ENABLED", "0");

    await runRegister();

    expect(listen).not.toHaveBeenCalled();
  });

  it("edge 런타임에서는 시작하지 않는다", async () => {
    vi.stubEnv("NEXT_RUNTIME", "edge");

    await runRegister();

    expect(listen).not.toHaveBeenCalled();
  });

  it("register가 다시 호출돼도 한 번만 시작한다", async () => {
    await runRegister();
    await runRegister();

    expect(listen).toHaveBeenCalledTimes(1);
  });
});
