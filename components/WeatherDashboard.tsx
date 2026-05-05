"use client";

import { useCallback, useState } from "react";
import { useGeocode } from "../hooks/useGeocode";
import { useWeather } from "../hooks/useWeather";
import type { Region, RegionId } from "../lib/regions";
import { createRegionId } from "../lib/regions";
import { SearchBar } from "./SearchBar";
import { WeatherCard } from "./WeatherCard";
import { WeatherCardSkeleton } from "./WeatherCardSkeleton";

export function WeatherDashboard() {
  const [searchedRegions, setSearchedRegions] = useState<Region[]>([]);

  const {
    isLoading: isGeocoding,
    error: geocodeError,
    geocode,
    clearError: clearGeocodeError,
  } = useGeocode();

  const { data, isLoading, error } = useWeather(searchedRegions);

  const handleRegionSearch = useCallback(
    async (query: string) => {
      const result = await geocode(query);
      if (result) {
        // 重複チェック（既に同じ座標の地域がないか確認）
        const regionId = createRegionId(result.latitude, result.longitude);
        const alreadyExists = searchedRegions.some((r) => r.id === regionId);

        if (alreadyExists) {
          return;
        }

        const newRegion: Region = {
          id: regionId,
          name: result.name,
          latitude: result.latitude,
          longitude: result.longitude,
        };
        setSearchedRegions((prev) => [...prev, newRegion]);
      }
    },
    [geocode, searchedRegions],
  );

  const handleRemoveSearchedRegion = (regionId: RegionId) => {
    setSearchedRegions((prev) => prev.filter((r) => r.id !== regionId));
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl pb-24 md:pb-4">
      {/* デスクトップ: 上部に検索バー表示 */}
      <div className="hidden md:block text-center mb-12 mt-2">
        <SearchBar
          onSearch={handleRegionSearch}
          isLoading={isGeocoding}
          error={geocodeError}
          onClearError={clearGeocodeError}
        />
      </div>

      {searchedRegions.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {searchedRegions.map((region) => (
              <button
                type="button"
                key={region.id}
                onClick={() => handleRemoveSearchedRegion(region.id)}
                className="clay-btn clay-btn-active px-5 py-2.5 font-bold text-base cursor-pointer flex items-center gap-2 group"
                title="クリックで削除"
              >
                {region.name}
                <span className="text-lg leading-none">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="min-h-75">
        {isLoading && searchedRegions.length > 0 && (
          <div className="flex flex-col gap-8">
            {searchedRegions.map((region) => (
              <div key={`skeleton-${region.id}`}>
                <WeatherCardSkeleton />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center text-destructive p-4 clay-card">
            エラーが発生しました: {error.message}
          </div>
        )}

        {!isLoading && !error && data.length > 0 && (
          <div className="flex flex-col gap-8">
            {searchedRegions.map((region) => {
              const weatherData = data.find((d) => d.regionId === region.id);
              if (!weatherData) return null;
              return (
                <div key={region.id}>
                  <WeatherCard region={region} weather={weatherData} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* モバイル: 画面最下部に検索バーを固定表示 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-t from-sky-50/95 via-sky-50/80 to-transparent backdrop-blur-md md:hidden">
        <SearchBar
          onSearch={handleRegionSearch}
          isLoading={isGeocoding}
          error={geocodeError}
          onClearError={clearGeocodeError}
          placeholder="天気を検索"
        />
      </div>
    </div>
  );
}
