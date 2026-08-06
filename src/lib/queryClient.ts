import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      // 마지막 observer 해제 후 30분간 캐시 유지 (기본 5분)
      gcTime: 1000 * 60 * 30,
      retry: false,
    },
  },
});
