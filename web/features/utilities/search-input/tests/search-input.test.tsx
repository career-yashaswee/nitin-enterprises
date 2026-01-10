import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchInput } from "../components/search-input";

jest.mock("react-speech-recognition", () => ({
  __esModule: true,
  default: {
    startListening: jest.fn(),
    stopListening: jest.fn(),
  },
}));

jest.mock("@/lib/providers/speech-recognition-provider", () => ({
  useSpeechRecognition: jest.fn(() => ({
    transcript: "",
    listening: false,
    resetTranscript: jest.fn(),
    browserSupportsSpeechRecognition: true,
  })),
}));

describe("SearchInput", () => {
  const mockData = [
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Cherry" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders input with placeholder", () => {
    render(
      <SearchInput
        data={mockData}
        searchKeys={["name"]}
        placeholder="Search fruits..."
      />,
    );

    expect(screen.getByPlaceholderText("Search fruits...")).toBeInTheDocument();
  });

  it("filters results based on query", async () => {
    render(<SearchInput data={mockData} searchKeys={["name"]} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Apple" } });

    jest.advanceTimersByTime(400);

    await waitFor(() => {
      expect(screen.getByText("Apple")).toBeInTheDocument();
    });
  });

  it("shows no results when query matches nothing", async () => {
    render(<SearchInput data={mockData} searchKeys={["name"]} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "XYZ" } });

    jest.advanceTimersByTime(400);

    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });

  it("calls onResultClick when result is clicked", async () => {
    const onResultClick = jest.fn();

    render(
      <SearchInput
        data={mockData}
        searchKeys={["name"]}
        onResultClick={onResultClick}
      />,
    );

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Apple" } });

    jest.advanceTimersByTime(400);

    await waitFor(() => {
      const result = screen.getByText("Apple");
      fireEvent.click(result);
      expect(onResultClick).toHaveBeenCalledWith({ id: 1, name: "Apple" });
    });
  });

  it("renders custom result using renderResult", async () => {
    const renderResult = (item: { id: number; name: string }) => (
      <div>Custom: {item.name}</div>
    );

    render(
      <SearchInput
        data={mockData}
        searchKeys={["name"]}
        renderResult={renderResult}
      />,
    );

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Apple" } });

    jest.advanceTimersByTime(400);

    await waitFor(() => {
      expect(screen.getByText("Custom: Apple")).toBeInTheDocument();
    });
  });

  it("shows loading spinner when searching", () => {
    render(<SearchInput data={mockData} searchKeys={["name"]} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "A" } });

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("does not show results when query is empty", () => {
    render(<SearchInput data={mockData} searchKeys={["name"]} />);

    expect(screen.queryByText("Apple")).not.toBeInTheDocument();
    expect(screen.queryByText("No results found")).not.toBeInTheDocument();
  });
});
