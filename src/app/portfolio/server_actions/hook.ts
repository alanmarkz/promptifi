import { useQuery } from "@tanstack/react-query";
import { getTokenBalances } from "./TokenBalances";

export function useTokenBalances(address: string) {
  return useQuery({
    queryFn: async () => getTokenBalances(address),
    queryKey: ["useTokenBalances", address],
  });
}
