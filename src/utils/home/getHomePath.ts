// 홈 쿼리(tab·menu·open)는 서로 독립이라, 하나를 바꿀 때 나머지가 지워지지 않도록 현재 쿼리 위에 덮어쓴다
export const getHomePath = (current: URLSearchParams, updates: Record<string, string | null>) => {
  const params = new URLSearchParams(current);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null) params.delete(key);
    else params.set(key, value);
  });
  const query = params.toString();
  return query ? `/home?${query}` : "/home";
};
