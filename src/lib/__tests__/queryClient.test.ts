import { queryClient } from "../queryClient";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import { ApiError } from "@/types/api";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

const failQuery = (error: Error, meta?: { skipGlobalError: boolean }) =>
  queryClient
    .fetchQuery({
      queryKey: [Math.random()],
      queryFn: () => Promise.reject(error),
      retry: false,
      meta,
    })
    .catch(() => undefined);

describe("queryClient 전역 onError", () => {
  afterEach(() => {
    useErrorDialogStore.getState().closeErrorDialog();
  });

  it("action이 dialog인 코드는 테이블 메시지로 Dialog를 띄운다", async () => {
    await failQuery(new ApiError("USER_002", "서버 원문 메시지"));

    expect(useErrorDialogStore.getState().message).toBe(
      "진행 중인 펀딩이 끝난 뒤 탈퇴할 수 있어요.",
    );
  });

  it("테이블에 없는 코드는 기본 메시지로 Dialog를 띄운다", async () => {
    await failQuery(new ApiError("NOT_IN_TABLE"));

    expect(useErrorDialogStore.getState().message).toBe(
      "일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
    );
  });

  it("ApiError가 아닌 에러도 기본 메시지로 Dialog를 띄운다", async () => {
    await failQuery(new TypeError("boom"));

    expect(useErrorDialogStore.getState().message).toBe(
      "일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
    );
  });

  it("action이 dialog가 아닌 코드(none·inline)는 Dialog를 띄우지 않는다", async () => {
    await failQuery(new ApiError("WISH_002"));
    await failQuery(new ApiError("PRODUCT_003"));

    expect(useErrorDialogStore.getState().message).toBeNull();
  });

  it("skipGlobalError meta가 있으면 Dialog를 띄우지 않는다", async () => {
    await failQuery(new ApiError("USER_002"), { skipGlobalError: true });

    expect(useErrorDialogStore.getState().message).toBeNull();
  });
});
