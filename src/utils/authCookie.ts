const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const ACCESS_TOKEN_MAX_AGE = 60 * 60; // 60분
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7일

export const setAuthCookies = (accessToken: string, refreshToken: string) => {
  document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; path=/; max-age=${ACCESS_TOKEN_MAX_AGE}; Secure; SameSite=Lax`;
  document.cookie = `${REFRESH_TOKEN_KEY}=${refreshToken}; path=/; max-age=${REFRESH_TOKEN_MAX_AGE}; Secure; SameSite=Lax`;
};

export const clearAuthCookies = () => {
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0`;
};
