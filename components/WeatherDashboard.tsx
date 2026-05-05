"use client";

import { useState } from "react";
import type { Latitude, Longitude, Region, RegionId } from "@/lib/regions";
import { useWeather } from "../hooks/useWeather";
import { WeatherCard } from "./WeatherCard";

export function WeatherDashboard() {
  const [searchedRegions, _setSearchedRegions] = useState<Region[]>([
    {
      id: "1.44466845-139.64215289" as RegionId,
      name: "神奈川県横浜市中区",
      latitude: 35.44466845 as Latitude,
      longitude: 139.64215289 as Longitude,
    },
    {
      id: "2.16860042-136.91018386" as RegionId,
      name: "愛知県名古屋市中区",
      latitude: 35.16860042 as Latitude,
      longitude: 136.91018386 as Longitude,
    },
  ]);

  const { data, isLoading, error } = useWeather(searchedRegions);

  return (
    <div className="container mx-auto p-4 max-w-5xl pb-24 md:pb-4">
      {searchedRegions.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {searchedRegions.map((region) => (
              <button
                type="button"
                key={region.id}
                className="clay-btn clay-btn-active px-5 py-2.5 font-bold text-base cursor-pointer flex items-center gap-2 group"
                title="クリックで削除"
              >
                {region.name}
                <span className="text-white/70 group-hover:text-white transition-colors text-lg leading-none">
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="min-h-[300px]">
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
