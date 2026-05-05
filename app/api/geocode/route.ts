import type { NextRequest } from "next/server";
import type { GeocodeResult } from "@/hooks/useGeocode";
import type { Latitude, Longitude } from "@/lib/regions";

type GeocoderFeature = Readonly<{
  Name: string;
  Geometry: {
    Coordinates: string; // "経度,緯度" 形式の文字列
  };
  Property: {
    Address: string;
  };
}>;

type GeocoderResponse = Readonly<{
  ResultInfo: {
    Count: number;
    Total: number;
  };
  Feature?: GeocoderFeature[];
}>;

type ErrorResponse = Readonly<{
  error: string;
}>;

const _YAHOO_API_URL = "https://map.yahooapis.jp/geocode/V1/geoCoder";

/**
 * Yahoo!ジオコーダAPIへのプロキシエンドポイント
 * クライアントからのリクエストを受けて、サーバーサイドでAPIキーを付与してリクエストする
 */
export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams.get("query");

  if (!query || query.trim() === "") {
    return Response.json(
      { error: "検索キーワードを入力してください" } satisfies ErrorResponse,
      { status: 400 },
    );
  }

  const appId = process.env.YAHOO_CLIENT_ID;
  if (!appId) {
    console.error("YAHOO_CLIENT_ID が設定されていません");
    return Response.json(
      { error: "サーバーの設定エラーが発生しました" } satisfies ErrorResponse,
      { status: 500 },
    );
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `${_YAHOO_API_URL}?appid=${appId}&query=${encodedQuery}&output=json`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Yahoo API エラー: ${response.status}`);
      return Response.json(
        {
          error: "ジオコーダAPIの呼び出しに失敗しました",
        } satisfies ErrorResponse,
        { status: 500 },
      );
    }

    const data: GeocoderResponse = await response.json();

    // 結果が0件の場合
    if (!data.Feature || data.ResultInfo.Count === 0) {
      return Response.json(
        {
          error: `「${query}」に一致する地名が見つかりませんでした`,
        } satisfies ErrorResponse,
        { status: 404 },
      );
    }

    const feature = data.Feature[0];
    // Coordinates は "経度,緯度" 形式
    const [longitude, latitude] =
      feature.Geometry.Coordinates.split(",").map(Number);

    return Response.json({
      name: feature.Name,
      address: feature.Property.Address,
      latitude: latitude as Latitude,
      longitude: longitude as Longitude,
    } satisfies GeocodeResult);
  } catch (error) {
    console.error("ジオコーダAPI呼び出しエラー:", error);
    return Response.json(
      {
        error: "ジオコーダAPIの呼び出し中にエラーが発生しました",
      } satisfies ErrorResponse,
      { status: 500 },
    );
  }
}
