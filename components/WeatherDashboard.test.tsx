import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WeatherDashboard } from "./WeatherDashboard";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("WeatherDashboard コンポーネント", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it("初期状態が正しくレンダリングされること", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <WeatherDashboard />
      </QueryClientProvider>,
    );

    const searchInputs = screen.getAllByPlaceholderText(/天気を検索/);
    expect(searchInputs.length).toBeGreaterThanOrEqual(1);
  });

  it("地名検索後に天気データが表示されること", async () => {
    const user = userEvent.setup();

    const mockGeocodeResponse = {
      name: "東京都港区六本木",
      address: "東京都港区六本木",
      latitude: 35.66288632,
      longitude: 139.73359259,
    };

    const mockWeatherResponse = {
      daily: {
        time: ["2026-05-01", "2026-05-02"],
        weather_code: [0, 61],
        temperature_2m_max: [25, 22],
        temperature_2m_min: [15, 18],
      },
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGeocodeResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse,
      });

    render(
      <QueryClientProvider client={queryClient}>
        <WeatherDashboard />
      </QueryClientProvider>,
    );

    const searchInputs = screen.getAllByPlaceholderText(/天気を検索/);
    const searchInput = searchInputs[searchInputs.length - 1];
    await user.type(searchInput, "六本木");
    const searchButtons = screen.getAllByRole("button", { name: /検索/ });
    const searchButton = searchButtons[searchButtons.length - 1];
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("東京都港区六本木")).toBeInTheDocument();
    });

    expect(screen.getByText("快晴")).toBeInTheDocument();
    expect(screen.getByText("25°")).toBeInTheDocument();
    expect(searchInput).toHaveValue("");
  });
});
