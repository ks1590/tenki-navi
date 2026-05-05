import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Latitude, Longitude, Region, RegionId } from "../lib/regions";
import { useWeather } from "./useWeather";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const testRegion: Region = {
  id: "test-tokyo" as RegionId,
  name: "東京",
  latitude: 35.6895 as Latitude,
  longitude: 139.6917 as Longitude,
};

describe("useWeatherフック", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("天気データをフェッチして返すこと", async () => {
    const selectedRegions = [testRegion];
    const mockResponse = {
      daily: {
        time: ["2026-05-01"],
        weather_code: [0],
        temperature_2m_max: [25],
        temperature_2m_min: [15],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useWeather(selectedRegions), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].regionId).toBe("test-tokyo");
    expect(result.current.data[0].daily.time).toEqual(["2026-05-01"]);
    expect(result.current.error).toBeNull();
  });

  it("APIエラー時にエラー状態を正しく処理すること", async () => {
    const selectedRegions = [testRegion];
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useWeather(selectedRegions), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe(
      "東京の天気データ取得に失敗しました",
    );
    expect(result.current.data).toEqual([]);
  });
});
