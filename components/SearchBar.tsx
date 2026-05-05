"use client";

import { Loader2, Search } from "lucide-react";
import type React from "react";
import { useState } from "react";

type SearchBarProps = {
  onSearch: (query: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
  placeholder?: string;
};

/**
 * 地名検索バーコンポーネント
 * @param onSearch 検索実行時のコールバック関数
 * @param isLoading 検索中かどうかのフラグ
 * @param error エラーメッセージ（ある場合）
 * @param onClearError エラー状態をクリアするコールバック関数
 * @param placeholder 入力フィールドのプレースホルダーテキスト（省略時はデフォルトの説明文）
 */
export function SearchBar({
  onSearch,
  isLoading,
  error,
  onClearError,
  placeholder = "地名・住所から天気を検索（例: 東京、札幌市）",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    await onSearch(query.trim());
    setQuery("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="clay-search-container p-2 flex gap-2 items-center"
      >
        <div className="relative flex-1">
          <input
            id="search-location-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (error) onClearError();
            }}
            placeholder={placeholder}
            className="w-full pl-5 pr-5 py-4 text-lg font-medium rounded-[18px] bg-transparent text-slate-700 placeholder-slate-400/70 outline-none transition-all duration-300 clay-search-inset"
            disabled={isLoading}
          />
        </div>
        <button
          id="search-location-button"
          type="submit"
          disabled={isLoading || !query.trim()}
          className="clay-search-btn px-7 py-4 font-bold text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              検索中...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              検索
            </>
          )}
        </button>
      </form>

      {error && (
        <div id="search-error-message" className="mt-4 clay-error-message">
          <span className="text-xl mr-2">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
}
