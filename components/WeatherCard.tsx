import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeatherData } from "../hooks/useWeather";
import type { Region } from "../lib/regions";
import { formatDate, getWeatherDetails } from "../lib/weather";

type WeatherCardProps = Readonly<{
  region: Region;
  weather: WeatherData;
}>;

export function WeatherCard({ region, weather }: WeatherCardProps) {
  const { time, weather_code, temperature_2m_max, temperature_2m_min } =
    weather.daily;

  return (
    <Card className="clay-card border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-slate-700">
          {region.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-slate-100/60 mx-4 p-6 rounded-[32px] shadow-inner border border-slate-200/50 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {time.map((date, index) => {
            const details = getWeatherDetails(weather_code[index]);
            return (
              <div
                key={date}
                className="clay-pill flex flex-col items-center py-6 px-3 flex-1 min-w-[100px]"
              >
                <span className="text-sm font-bold text-slate-500 mb-2">
                  {formatDate(date)}
                </span>
                <span
                  className="text-5xl mb-3 drop-shadow-lg cursor-default"
                  role="img"
                  aria-label={details.text}
                >
                  {details.icon}
                </span>
                <span className="text-sm font-extrabold text-slate-700 text-center mb-1">
                  {details.text}
                </span>
                <div className="flex gap-2 text-sm mt-auto">
                  <span className="text-rose-500 font-extrabold">
                    {Math.round(temperature_2m_max[index])}°
                  </span>
                  <span className="text-sky-600 font-bold">
                    {Math.round(temperature_2m_min[index])}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
