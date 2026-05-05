import { useCallback, useState } from "react";
import type { Coordinates } from "../lib/regions";

export type GeocodeResult = Readonly<{
  name: string;
  address: string;
}> &
  Coordinates;

type GeocodeErrorResponse = Readonly<{
  error: string;
}>;

type GeocodeApiResponse = GeocodeResult | GeocodeErrorResponse;

type UseGeocodeReturn = {
  readonly data: GeocodeResult | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly geocode: (query: string) => Promise<GeocodeResult | null>;
  readonly clearError: () => void;
};

function isGeocodeError(
  response: GeocodeApiResponse,
): response is GeocodeErrorResponse {
  return "error" in response;
}

/**
 * Yahoo!ジオコーダAPIを呼び出すカスタムフック
 * 内部API Route（/api/geocode）を経由してリクエストする
 */
export function useGeocode(): UseGeocodeReturn {
  const [data, setData] = useState<GeocodeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (query: string) => {
    if (!query.trim()) {
      setError("検索キーワードを入力してください");
      return null;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(`/api/geocode?query=${encodedQuery}`);
      const result: GeocodeApiResponse = await response.json();

      if (!response.ok || isGeocodeError(result)) {
        setError(
          isGeocodeError(result) ? result.error : "エラーが発生しました",
        );
        return null;
      }

      setData(result);
      return result;
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { data, isLoading, error, geocode, clearError };
}
