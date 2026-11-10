import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

// meta 키를 타입으로 등록해, skipGlobalError 같은 키 오타를 컴파일 타임에 잡는다
declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: { skipGlobalError?: boolean };
    mutationMeta: { skipGlobalError?: boolean };
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.skipGlobalError) return;
      alert(error.message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.skipGlobalError) return;
      alert(error.message);
    },
  }),
});
