import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StatefulButton } from "../components/stateful-button";

jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<"div">) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("StatefulButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders children", () => {
    render(
      <StatefulButton onAction={jest.fn().mockResolvedValue(undefined)}>
        Click me
      </StatefulButton>,
    );
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onAction when clicked", async () => {
    const onAction = jest.fn().mockResolvedValue(undefined);

    render(<StatefulButton onAction={onAction}>Click</StatefulButton>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(onAction).toHaveBeenCalled();
    });
  });

  it("shows loading state during action", async () => {
    const onAction = jest.fn(
      () => new Promise<void>((resolve) => setTimeout(resolve, 100)),
    );

    render(<StatefulButton onAction={onAction}>Click</StatefulButton>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Loading")).toBeInTheDocument();
    });
  });

  it("shows success state after successful action", async () => {
    const onAction = jest.fn().mockResolvedValue(undefined);

    render(<StatefulButton onAction={onAction}>Click</StatefulButton>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(screen.getByText("Success")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("shows error state after failed action", async () => {
    const onAction = jest.fn().mockRejectedValue(new Error("Failed"));

    render(<StatefulButton onAction={onAction}>Click</StatefulButton>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(screen.getByText("Error")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("calls onSuccess when action succeeds", async () => {
    const onAction = jest.fn().mockResolvedValue(undefined);
    const onSuccess = jest.fn();

    render(
      <StatefulButton onAction={onAction} onSuccess={onSuccess}>
        Click
      </StatefulButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("calls onError when action fails", async () => {
    const onAction = jest.fn().mockRejectedValue(new Error("Failed"));
    const onError = jest.fn();

    render(
      <StatefulButton onAction={onAction} onError={onError}>
        Click
      </StatefulButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(onError).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it("disables button when disabled prop is true", () => {
    render(
      <StatefulButton
        onAction={jest.fn().mockResolvedValue(undefined)}
        disabled={true}
      >
        Click
      </StatefulButton>,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("requires double tap when doubleTapToConfirm is true", async () => {
    const onAction = jest.fn().mockResolvedValue(undefined);

    render(
      <StatefulButton
        onAction={onAction}
        doubleTapToConfirm={true}
        doubleTapConfirmMessage="Press again"
      >
        Click
      </StatefulButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("Press again")).toBeInTheDocument();
    expect(onAction).not.toHaveBeenCalled();

    fireEvent.click(button);

    await waitFor(() => {
      expect(onAction).toHaveBeenCalled();
    });
  });

  it("resets double tap confirmation after timeout", async () => {
    const onAction = jest.fn().mockResolvedValue(undefined);

    render(
      <StatefulButton
        onAction={onAction}
        doubleTapToConfirm={true}
        doubleTapTimeoutMs={100}
        doubleTapConfirmMessage="Press again"
      >
        Click
      </StatefulButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("Press again")).toBeInTheDocument();

    jest.advanceTimersByTime(150);

    await waitFor(() => {
      expect(screen.queryByText("Press again")).not.toBeInTheDocument();
    });
  });
});
