import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshButton } from "../components/refresh-button";

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    promise: jest.fn(),
  },
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<"div">) => (
      <div {...props}>{children}</div>
    ),
  },
}));

const mockUseQueryClient = useQueryClient as jest.MockedFunction<
  typeof useQueryClient
>;
const mockInvalidateQueries = jest.fn();

describe("RefreshButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidateQueries.mockResolvedValue(undefined);
    mockUseQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    } as unknown as ReturnType<typeof useQueryClient>);
  });

  it("renders with default label", () => {
    render(<RefreshButton queryKeys={[["test"]]} />);
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<RefreshButton queryKeys={[["test"]]} label="Reload" />);
    expect(screen.getByText("Reload")).toBeInTheDocument();
  });

  it("renders with custom aria-label", () => {
    render(<RefreshButton queryKeys={[["test"]]} ariaLabel="Refresh users" />);
    expect(screen.getByLabelText("Refresh users")).toBeInTheDocument();
  });

  it("calls invalidateQueries when clicked", async () => {
    render(<RefreshButton queryKeys={[["test"]]} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["test"],
      });
    });
  });

  it("invalidates multiple query keys", async () => {
    render(
      <RefreshButton queryKeys={[["users"], ["posts"]]} resource="data" />,
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
    });
  });

  it("shows toast with custom resource", async () => {
    render(<RefreshButton queryKeys={[["test"]]} resource="users" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalledWith(
        expect.any(Promise),
        expect.objectContaining({
          loading: "Refreshing users",
          success: "users refreshed successfully!",
          error: "Failed to refresh users.",
        }),
      );
    });
  });

  it("calls onSuccess callback", async () => {
    const onSuccess = jest.fn();
    render(<RefreshButton queryKeys={[["test"]]} onSuccess={onSuccess} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("calls onError callback on failure", async () => {
    const onError = jest.fn();
    mockInvalidateQueries.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      throw new Error("Network error");
    });
    render(<RefreshButton queryKeys={[["test"]]} onError={onError} />);
    const button = screen.getByRole("button");

    // Wrap in try-catch to handle the thrown error
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(onError).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Wait for promise to settle to avoid unhandled rejection
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  it("disables button when refreshing", async () => {
    mockInvalidateQueries.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );
    render(<RefreshButton queryKeys={[["test"]]} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it("does not render icon when showIcon is false", () => {
    render(<RefreshButton queryKeys={[["test"]]} showIcon={false} />);
    const button = screen.getByRole("button");
    expect(button.querySelector("svg")).not.toBeInTheDocument();
  });

  it("does nothing when queryKeys is empty", () => {
    render(<RefreshButton queryKeys={[]} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
