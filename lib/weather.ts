/** WMO天気コードの有効な値（Open-Meteo APIが返すコード） */
export type WmoWeatherCode =
  | 0
  | 1
  | 2
  | 3
  | 45
  | 48
  | 51
  | 53
  | 55
  | 56
  | 57
  | 61
  | 63
  | 65
  | 66
  | 67
  | 71
  | 73
  | 75
  | 77
  | 80
  | 81
  | 82
  | 85
  | 86
  | 95
  | 96
  | 99;

export type WeatherDetails = Readonly<{
  icon: string;
  text: string;
}>;

/**
 * WMO天気コードに基づくコード → 表示データのマッピング
 */
const WEATHER_CODE_MAP = {
  0: { icon: "☀️", text: "快晴" },
  1: { icon: "🌤️", text: "晴れ時々曇り" },
  2: { icon: "🌤️", text: "晴れ時々曇り" },
  3: { icon: "☁️", text: "曇り" },
  45: { icon: "🌫️", text: "霧" },
  48: { icon: "🌫️", text: "霧" },
  51: { icon: "🌧️", text: "霧雨" },
  53: { icon: "🌧️", text: "霧雨" },
  55: { icon: "🌧️", text: "霧雨" },
  56: { icon: "🌧️", text: "霧雨" },
  57: { icon: "🌧️", text: "霧雨" },
  61: { icon: "☔", text: "雨" },
  63: { icon: "☔", text: "雨" },
  65: { icon: "☔", text: "雨" },
  66: { icon: "☔", text: "雨" },
  67: { icon: "☔", text: "雨" },
  71: { icon: "❄️", text: "雪" },
  73: { icon: "❄️", text: "雪" },
  75: { icon: "❄️", text: "雪" },
  77: { icon: "❄️", text: "雪" },
  80: { icon: "🌦️", text: "にわか雨" },
  81: { icon: "🌦️", text: "にわか雨" },
  82: { icon: "🌦️", text: "にわか雨" },
  85: { icon: "🌨️", text: "雪・吹雪" },
  86: { icon: "🌨️", text: "雪・吹雪" },
  95: { icon: "⛈️", text: "雷雨" },
  96: { icon: "⛈️", text: "雷雨" },
  99: { icon: "⛈️", text: "雷雨" },
} as const satisfies Record<WmoWeatherCode, WeatherDetails>;

/** 不明な天気コードに対するフォールバック */
const UNKNOWN_WEATHER: WeatherDetails = { icon: "❓", text: "不明" };

/**
 * WMO天気コードから表示用の天気情報を取得する
 * @param code WMO天気コード
 * @returns 対応する天気のアイコンとテキスト。コードが不明な場合はフォールバックを返す
 */
export function getWeatherDetails(code: number): WeatherDetails {
  if (code in WEATHER_CODE_MAP) {
    return WEATHER_CODE_MAP[code as WmoWeatherCode];
  }
  return UNKNOWN_WEATHER;
}

/** 日本語の曜日定数 */
const DAYS_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** 日付文字列の型（YYYY-MM-DD形式） */
export type IsoDateString = `${number}-${number}-${number}`;

/** 日付文字列を「M/D(曜日)」形式にフォーマットする
 * @param dateString 日付文字列
 * @returns フォーマットされた日付文字列
 */
export function formatDate(dateString: IsoDateString): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
  return `${month}/${day}(${dayOfWeek})`;
}
