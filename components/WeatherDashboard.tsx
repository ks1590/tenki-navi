"use client";

import { useCallback, useState } from "react";
import { useGeocode } from "../hooks/useGeocode";
import { useWeather } from "../hooks/useWeather";
import type { Region, RegionId } from "../lib/regions";
import { createRegionId } from "../lib/regions";
import { SearchBar } from "./SearchBar";
import { WeatherCard } from "./WeatherCard";

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
        {error && (
          <div className="text-center text-destructive p-4 clay-card">
            エラーが発生しました: {error.message}
          </div>
        )}

        {!isLoading && !error && searchedRegions.length === 0 && (
          <div className="flex flex-col items-center justify-center text-muted-foreground p-12 clay-card border-none">
            <p className="text-lg">地名を検索してください</p>
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
    </div>
  );
}
