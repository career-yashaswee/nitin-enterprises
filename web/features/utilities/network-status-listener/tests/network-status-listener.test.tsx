import { render, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { useNetworkState, useIsFirstRender } from "@uidotdev/usehooks";
import { NetworkStatusListener } from "../components/network-status-listener";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@uidotdev/usehooks", () => ({
  useNetworkState: jest.fn(),
  useIsFirstRender: jest.fn(),
}));

const mockUseNetworkState = useNetworkState as jest.MockedFunction<
  typeof useNetworkState
>;
const mockUseIsFirstRender = useIsFirstRender as jest.MockedFunction<
  typeof useIsFirstRender
>;

describe("NetworkStatusListener", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsFirstRender.mockReturnValue(true);
  });

  it("renders nothing", () => {
    mockUseNetworkState.mockReturnValue({
      online: true,
    } as ReturnType<typeof useNetworkState>);
    const { container } = render(<NetworkStatusListener />);
    expect(container.firstChild).toBeNull();
  });

  it("does not show toast on initial render when online", () => {
    mockUseNetworkState.mockReturnValue({
      online: true,
    } as ReturnType<typeof useNetworkState>);
    render(<NetworkStatusListener />);
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("does not show toast on initial render when offline", () => {
    mockUseNetworkState.mockReturnValue({
      online: false,
    } as ReturnType<typeof useNetworkState>);
    render(<NetworkStatusListener />);
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("shows error toast when going offline", async () => {
    mockUseIsFirstRender.mockReturnValueOnce(true);
    mockUseNetworkState.mockReturnValue({
      online: true,
    } as ReturnType<typeof useNetworkState>);
    const { rerender } = render(<NetworkStatusListener />);

    mockUseIsFirstRender.mockReturnValue(false);
    mockUseNetworkState.mockReturnValue({
      online: false,
    } as ReturnType<typeof useNetworkState>);
    rerender(<NetworkStatusListener />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "You are offline. Please check your connection.",
        { duration: 5000 },
      );
    });
  });

  it("shows success toast when coming back online", async () => {
    mockUseIsFirstRender.mockReturnValueOnce(true);
    mockUseNetworkState.mockReturnValue({
      online: false,
    } as ReturnType<typeof useNetworkState>);
    const { rerender } = render(<NetworkStatusListener />);

    mockUseIsFirstRender.mockReturnValue(false);
    mockUseNetworkState.mockReturnValue({
      online: true,
    } as ReturnType<typeof useNetworkState>);
    rerender(<NetworkStatusListener />);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Connection restored. You are back online.",
        { duration: 3000 },
      );
    });
  });

  it("uses custom offline message", async () => {
    mockUseIsFirstRender.mockReturnValueOnce(true);
    mockUseNetworkState.mockReturnValue({
      online: true,
    } as ReturnType<typeof useNetworkState>);
    const { rerender } = render(
      <NetworkStatusListener offlineMessage="Custom offline message" />,
    );

    mockUseIsFirstRender.mockReturnValue(false);
    mockUseNetworkState.mockReturnValue({
      online: false,
    } as ReturnType<typeof useNetworkState>);
    rerender(<NetworkStatusListener offlineMessage="Custom offline message" />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Custom offline message", {
        duration: 5000,
      });
    });
  });

  it("uses custom online message", async () => {
    mockUseIsFirstRender.mockReturnValueOnce(true);
    mockUseNetworkState.mockReturnValue({
      online: false,
    } as ReturnType<typeof useNetworkState>);
    const { rerender } = render(
      <NetworkStatusListener onlineMessage="Custom online message" />,
    );

    mockUseIsFirstRender.mockReturnValue(false);
    mockUseNetworkState.mockReturnValue({
      online: true,
    } as ReturnType<typeof useNetworkState>);
    rerender(<NetworkStatusListener onlineMessage="Custom online message" />);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Custom online message", {
        duration: 3000,
      });
    });
  });

  it("does not show toast when showToast is false", async () => {
    // Test online → offline transition
    mockUseIsFirstRender.mockReturnValueOnce(true);
    mockUseNetworkState.mockReturnValue({
      online: true,
    } as ReturnType<typeof useNetworkState>);
    const { rerender } = render(<NetworkStatusListener showToast={false} />);

    mockUseIsFirstRender.mockReturnValue(false);
    mockUseNetworkState.mockReturnValue({
      online: false,
    } as ReturnType<typeof useNetworkState>);
    rerender(<NetworkStatusListener showToast={false} />);

    await waitFor(() => {
      expect(toast.error).not.toHaveBeenCalled();
    });

    // Clear mocks to avoid false positives
    jest.clearAllMocks();

    // Test offline → online transition
    mockUseIsFirstRender.mockReturnValueOnce(true);
    mockUseNetworkState.mockReturnValue({
      online: false,
    } as ReturnType<typeof useNetworkState>);
    rerender(<NetworkStatusListener showToast={false} />);

    mockUseIsFirstRender.mockReturnValue(false);
    mockUseNetworkState.mockReturnValue({
      online: true,
    } as ReturnType<typeof useNetworkState>);
    rerender(<NetworkStatusListener showToast={false} />);

    await waitFor(() => {
      expect(toast.success).not.toHaveBeenCalled();
    });
  });
});
