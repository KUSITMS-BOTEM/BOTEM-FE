import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: error => alert(error.message),
  }),
  mutationCache: new MutationCache({
    onError: error => alert(error.message),
  }),
});
