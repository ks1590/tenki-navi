import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GeocodeResult } from "./useGeocode";
import { useGeocode } from "./useGeocode";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useGeocode フック", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("初期状態が正しいこと", () => {
    const { result } = renderHook(() => useGeocode());

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("正常にジオコーディングできること", async () => {
    const mockResult = {
      name: "神奈川県横浜市中区",
      address: "神奈川県横浜市中区",
      latitude: 35.44466845,
      longitude: 139.64215289,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    });

    const { result } = renderHook(() => useGeocode());

    let geocodeResult: GeocodeResult | null = null;
    await act(async () => {
      geocodeResult = await result.current.geocode(mockResult.name);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(mockResult);
    expect(geocodeResult).toEqual(mockResult);
    expect(result.current.error).toBeNull();
  });

  it("空文字の入力時にエラーを返すこと", async () => {
    const { result } = renderHook(() => useGeocode());

    let geocodeResult: GeocodeResult | null = null;
    await act(async () => {
      geocodeResult = await result.current.geocode("  ");
    });

    expect(result.current.error).toBe("検索キーワードを入力してください");
    expect(result.current.data).toBeNull();
    expect(geocodeResult).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("APIがエラーレスポンスを返した際にエラー状態になること", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "地名が見つかりませんでした" }),
    });

    const { result } = renderHook(() => useGeocode());

    await act(async () => {
      await result.current.geocode("存在しない場所");
    });

    expect(result.current.error).toBe("地名が見つかりませんでした");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
  });
});
