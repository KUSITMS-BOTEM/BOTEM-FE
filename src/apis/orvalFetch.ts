// BOTEM-BE가 OpenAPI 스펙에 응답 content-type을 */*로 선언해, orval 기본 fetch 템플릿이
// JSON 파싱 없이 raw text를 그대로 타입드 데이터로 대입해버리는 버그가 있다 — 실제 응답 헤더 기준으로 파싱 방식을 결정해 우회한다.
const parseBody = async <T>(response: Response): Promise<T> => {
  if ([204, 205, 304].includes(response.status)) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) return response.json() as Promise<T>;
  return response.text() as Promise<T>;
};

export const customFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  const data = await parseBody<T>(response);
  return { status: response.status, data, headers: response.headers } as T;
};
