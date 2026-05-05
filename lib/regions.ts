declare const __brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

/** 緯度（-90 〜 90） */
export type Latitude = Brand<number, "Latitude">;

/** 経度（-180 〜 180） */
export type Longitude = Brand<number, "Longitude">;

export type Coordinates = {
  readonly latitude: Latitude;
  readonly longitude: Longitude;
};

export type RegionId = Brand<string, "RegionId">;

export type Region = Readonly<{
  id: string;
  name: string;
}> &
  Coordinates;

/**
 * 座標からRegionIdを生成するヘルパー
 * @param latitude 緯度
 * @param longitude 経度
 * @returns RegionId（例: "search-35.12345-139.12345"）
 */
export function createRegionId(latitude: number, longitude: number) {
  return `search-${latitude}-${longitude}` as RegionId;
}
