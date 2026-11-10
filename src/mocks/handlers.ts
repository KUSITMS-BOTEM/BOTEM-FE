import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";

// proxy.ts는 isLoggedIn 쿠키 존재 여부만 보는데, MSW는 응답 바디만 가로채고 실제 백엔드의 Set-Cookie를 거치지 않아
// 로그인 흉내만으론 /main 가드를 통과하지 못한다. 핸들러 안에서 직접 document.cookie를 심어 흉내 낸다.
const MOCK_REFRESH_TOKEN_COOKIE = "refreshToken";
const MOCK_IS_LOGGED_IN_COOKIE = "isLoggedIn";

// 평범한 문자열이면 isTokenExpired가 JWT로 파싱하지 못해 항상 만료로 보고 매 요청마다 reissue를 탄다
// — exp가 먼 미래인 JWT 형태로 흉내 낸다.
const createMockAccessToken = () => {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 * 60 }));
  return `mock.${payload}.signature`;
};

// 카카오 신규/기존 유저 온보딩 분기 테스트용 — 계정 탈퇴 API가 없어 실제 카카오 계정으로는 isNewUser 값을
// 임의로 재현할 수 없어 로그인 교환 응답만 가로채 code 값으로 분기한다.
export const EXISTING_USER_KAKAO_CODE = "existing-user-code";
// 클라이언트(src/app/helpers.ts)가 이 host인지만 검사해 그대로 리다이렉트하므로, e2e에서 실제 카카오 동의 화면 대신
// page.route로 가로챌 수 있도록 kauth.kakao.com host를 유지한다.
export const MOCK_KAKAO_LOGIN_URI = "https://kauth.kakao.com/oauth/authorize?client_id=mock";

const MOCK_RECOMMENDED_PRODUCTS = [
  {
    id: 1,
    name: "에어팟 프로 3",
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400, blur: 0 }),
    price: 359000,
    sellerName: "Apple 공식 브랜드관",
    category: "EARPHONE_HEADPHONE",
    status: "ON_SALE",
  },
  {
    id: 2,
    name: "다이슨 에어랩 i.d.",
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400, blur: 0 }),
    price: 659000,
    sellerName: "다이슨 공식 스토어",
    category: "HAIR_BEAUTY_DEVICE",
    status: "ON_SALE",
  },
  {
    id: 3,
    name: "닌텐도 스위치 2",
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400, blur: 0 }),
    price: 492000,
    sellerName: "닌텐도 공식 스토어",
    category: "SMART_DEVICE_GAME",
    status: "ON_SALE",
  },
  {
    id: 4,
    name: "조 말론 라임 바질 앤 만다린",
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400, blur: 0 }),
    price: 128000,
    sellerName: "조 말론 런던",
    category: "PERFUME",
    status: "ON_SALE",
  },
  {
    id: 5,
    name: "스탠리 터블러 1.18L",
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400, blur: 0 }),
    price: 59000,
    sellerName: "스탠리 공식 스토어",
    category: "TUMBLER_LIVING",
    status: "ON_SALE",
  },
  {
    id: 6,
    name: "라네즈 크림 스킨 세트",
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400, blur: 0 }),
    price: 45000,
    sellerName: "라네즈 공식 스토어",
    category: "SKINCARE_MAKEUP",
    status: "ON_SALE",
  },
];

export const handlers = [
  // getKakaoLoginUri는 cross-origin 절대 URL로 나가 MSW 서비스워커가 자체적으로 네트워크에 흘려보내므로,
  // Playwright page.route로는 가로챌 수 없다 — 반드시 MSW 핸들러로 응답해야 한다.
  http.get("*/api/auth/kakao/login-uri", () => {
    return HttpResponse.json({
      success: true,
      data: { loginUri: MOCK_KAKAO_LOGIN_URI },
      error: null,
    });
  }),
  http.post("/api/auth/kakao/login", async ({ request }) => {
    // 실제 네트워크 왕복 없이 응답이 바로 와서 /auth/callback 경유 화면이 깜빡할 새도 없이 지나가버린다 — 눈으로 보려고 지연을 둔다.
    await delay(1000);
    document.cookie = `${MOCK_REFRESH_TOKEN_COOKIE}=mock-refresh-token; path=/`;
    document.cookie = `${MOCK_IS_LOGGED_IN_COOKIE}=true; path=/`;

    const { code } = (await request.json()) as { code: string };

    return HttpResponse.json({
      success: true,
      data: { accessToken: createMockAccessToken(), isNewUser: code !== EXISTING_USER_KAKAO_CODE },
      error: null,
    });
  }),
  // mock 로그인 상태(가짜 refreshToken 쿠키)로도 accessToken 만료 → 재발급 → 원요청 재시도 흐름을 테스트할 수 있게 한다
  http.post("/api/auth/reissue", async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: { accessToken: createMockAccessToken() },
      error: null,
    });
  }),
  http.post("/api/auth/logout", () => {
    document.cookie = `${MOCK_REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`;
    document.cookie = `${MOCK_IS_LOGGED_IN_COOKIE}=; path=/; max-age=0`;

    return HttpResponse.json({ success: true, data: null, error: null });
  }),
  // NEXT_PUBLIC_API_BASE_URL(절대 cross-origin URL)로 나가는 요청이라 origin 무관 매칭(`*/`)이 필요하다
  http.get("*/api/users/me/profile", () => {
    return HttpResponse.json({
      success: true,
      data: {
        nickname: "지유",
        profileImageUrl: "https://example.com/profile.jpg",
        birthday: "10-13",
        wishProfileUrl: "https://botem.site/@8f0c6d779fae47f3a979302f2782d20f",
        kakaoConnected: true,
      },
      error: null,
    });
  }),
  // "시작하기" 버튼의 loading 상태를 눈으로 확인할 수 있게 지연을 둔다
  http.post("*/api/users/me/onboarding", async () => {
    await delay(800);
    return HttpResponse.json({ success: true, data: null, error: null });
  }),
  http.delete("/api/users/me", () => {
    document.cookie = `${MOCK_REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`;
    document.cookie = `${MOCK_IS_LOGGED_IN_COOKIE}=; path=/; max-age=0`;

    return HttpResponse.json({ success: true, data: null, error: null });
  }),
  http.get("*/api/wishes/:wishId", async () => {
    // 스켈레톤 UI를 눈으로 확인할 수 있게 지연을 둔다
    await delay(1000);
    return HttpResponse.json({
      success: true,
      data: {
        id: 1,
        productName: "에어팟 프로 3",
        productImageUrl: faker.image.urlPicsumPhotos({ width: 720, height: 720, blur: 0 }),
        price: 350000,
        productUrl: "https://link.coupang.com/a/example",
        status: "AVAILABLE",
        fundingId: null,
      },
      error: null,
    });
  }),
  // 다이얼로그의 로딩 상태를 눈으로 확인할 수 있게 지연을 둔다
  http.delete("*/api/wishes/:wishId", async () => {
    await delay(1000);
    return HttpResponse.json({ success: true, data: null, error: null });
  }),
  // 버튼의 로딩 상태를 눈으로 확인할 수 있게 지연을 둔다
  http.post("*/api/product-requests", async () => {
    await delay(800);
    return HttpResponse.json({ success: true, data: null, error: null }, { status: 201 });
  }),
  http.get("*/api/recommended-products", async ({ request }) => {
    // 스켈레톤 UI를 눈으로 확인할 수 있게 지연을 둔다
    await delay(1000);
    const category = new URL(request.url).searchParams.get("category");
    const data = category
      ? MOCK_RECOMMENDED_PRODUCTS.filter(product => product.category === category)
      : MOCK_RECOMMENDED_PRODUCTS;

    return HttpResponse.json({ success: true, data, error: null });
  }),
  http.get("*/api/recommended-products/:productId", async ({ params }) => {
    // 스켈레톤 UI를 눈으로 확인할 수 있게 지연을 둔다
    await delay(1000);
    const product = MOCK_RECOMMENDED_PRODUCTS.find(item => item.id === Number(params.productId));
    if (!product) {
      return HttpResponse.json({
        success: false,
        data: null,
        error: { code: "PRODUCT_001", message: "추천 상품을 찾을 수 없습니다." },
      });
    }

    return HttpResponse.json({ success: true, data: product, error: null });
  }),
  // 다이얼로그의 로딩 상태를 눈으로 확인할 수 있게 지연을 둔다
  http.post("*/api/wishes", async ({ request }) => {
    await delay(1000);
    const { recommendedProductId } = (await request.json()) as { recommendedProductId: number };
    const product = MOCK_RECOMMENDED_PRODUCTS.find(item => item.id === recommendedProductId);

    return HttpResponse.json({
      success: true,
      data: {
        id: recommendedProductId,
        productName: product?.name ?? "",
        productImageUrl: product?.imageUrl ?? "",
        price: product?.price ?? 0,
        productUrl: "https://link.coupang.com/a/example",
        status: "AVAILABLE",
        fundingId: null,
      },
      error: null,
    });
  }),
];
