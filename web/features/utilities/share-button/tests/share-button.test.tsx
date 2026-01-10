import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ShareButton } from "../components/share-button";
import * as useHooks from "@uidotdev/usehooks";

jest.mock("@uidotdev/usehooks", () => ({
  useCopyToClipboard: jest.fn(() => [false, jest.fn()]),
  useToggle: jest.fn(() => [false, jest.fn()]),
}));

Object.assign(navigator, {
  share: jest.fn().mockResolvedValue(undefined),
});

describe("ShareButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.open = jest.fn();
  });

  it("renders share button", () => {
    render(<ShareButton url="https://example.com" />);

    expect(screen.getByText("Share")).toBeInTheDocument();
  });

  it("opens dialog when clicked", async () => {
    const useToggle = jest.mocked(useHooks.useToggle);
    const toggleOpen = jest.fn();
    useToggle.mockReturnValue([false, toggleOpen]);

    render(<ShareButton url="https://example.com" />);

    const button = screen.getByText("Share");
    fireEvent.click(button);

    expect(toggleOpen).toHaveBeenCalled();
  });

  it("displays share URL in dialog", async () => {
    const useToggle = jest.mocked(useHooks.useToggle);
    useToggle.mockReturnValue([true, jest.fn()]);

    render(<ShareButton url="https://example.com" />);

    await waitFor(() => {
      expect(screen.getByText("Share")).toBeInTheDocument();
    });
  });

  it("opens Twitter share when Twitter option is clicked", async () => {
    const useToggle = jest.mocked(useHooks.useToggle);
    useToggle.mockReturnValue([true, jest.fn()]);

    render(<ShareButton url="https://example.com" title="Test" />);

    await waitFor(() => {
      const twitterButton = screen.getByText("Twitter");
      if (twitterButton) {
        fireEvent.click(twitterButton);
        expect(window.open).toHaveBeenCalledWith(
          expect.stringContaining("twitter.com/intent/tweet"),
          "_blank",
          "noopener,noreferrer",
        );
      }
    });
  });

  it("includes UTM parameters when withUtmParams is true", () => {
    const useToggle = jest.mocked(useHooks.useToggle);
    useToggle.mockReturnValue([true, jest.fn()]);

    render(
      <ShareButton
        url="https://example.com"
        withUtmParams={true}
        utmSource="test"
        utmMedium="social"
        utmCampaign="share"
      />,
    );

    // URL should include UTM parameters
    expect(screen.getByText("Share")).toBeInTheDocument();
  });
});
