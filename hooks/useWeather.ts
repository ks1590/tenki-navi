import { useQueries } from "@tanstack/react-query";
import type { Region, RegionId } from "../lib/regions";
import type { IsoDateString, WmoWeatherCode } from "../lib/weather";

/** Open-Meteo APIの日次予報データ */
type DailyWeather = Readonly<{
  time: IsoDateString[];
  weather_code: WmoWeatherCode[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}>;

type OpenMeteoResponse = {
  daily: DailyWeather;
};

export type WeatherData = Readonly<{
  regionId: RegionId;
  daily: DailyWeather;
}>;

type UseWeatherReturn = {
  data: readonly WeatherData[];
  isLoading: boolean;
  error: Error | null;
};

const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";

/** 単一地域の天気データをフェッチする
 * @param region - 天気データを取得する地域
 * @returns - 取得した天気データ
 */
async function fetchRegionWeather(region: Region): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(region.latitude),
    longitude: String(region.longitude),
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "Asia/Tokyo",
  });

  const response = await fetch(`${OPEN_METEO_BASE_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`${region.name}の天気データ取得に失敗しました`);
  }

  const result: OpenMeteoResponse = await response.json();

  return {
    regionId: region.id,
    daily: result.daily,
  };
}

/**
 * 指定地域の天気データを管理するカスタムフック
 * @param selectedRegions - 地域の配列
 * @returns - 天気データ、ローディング状態、エラー状態
 */
export function useWeather(selectedRegions: Region[]): UseWeatherReturn {
  const queryResults = useQueries({
    queries: selectedRegions.map((region) => ({
      queryKey: ["weather", region.id],
      queryFn: () => fetchRegionWeather(region),
    })),
  });

  const data = queryResults
    .map((res) => res.data)
    .filter((d): d is WeatherData => !!d);

  const isLoading = queryResults.some((res) => res.isLoading);

  const error = (queryResults.find((res) => res.error)?.error as Error) || null;

  return { data, isLoading, error };
}
