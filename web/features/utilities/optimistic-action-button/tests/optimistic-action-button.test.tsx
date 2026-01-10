import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { OptimisticActionButton } from "../components/optimistic-action-button";

jest.mock("sonner", () => ({
  toast: {
    promise: jest.fn(),
  },
}));

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

describe("OptimisticActionButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children", () => {
    render(
      <OptimisticActionButton
        action={jest.fn().mockResolvedValue(undefined)}
        optimisticState={false}
        onOptimisticUpdate={jest.fn()}
        onRollback={jest.fn()}
      >
        <span>Click me</span>
      </OptimisticActionButton>,
    );
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onOptimisticUpdate immediately on click", () => {
    const onOptimisticUpdate = jest.fn();
    const action = jest.fn().mockResolvedValue(undefined);

    render(
      <OptimisticActionButton
        action={action}
        optimisticState={true}
        onOptimisticUpdate={onOptimisticUpdate}
        onRollback={jest.fn()}
      >
        <span>Click</span>
      </OptimisticActionButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(onOptimisticUpdate).toHaveBeenCalled();
  });

  it("calls action when clicked", async () => {
    const action = jest.fn().mockResolvedValue(undefined);

    render(
      <OptimisticActionButton
        action={action}
        optimisticState={true}
        onOptimisticUpdate={jest.fn()}
        onRollback={jest.fn()}
      >
        <span>Click</span>
      </OptimisticActionButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(action).toHaveBeenCalled();
    });
  });

  it("calls onRollback when action fails", async () => {
    const onRollback = jest.fn();
    const action = jest.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      throw new Error("Failed");
    });

    render(
      <OptimisticActionButton
        action={action}
        optimisticState={true}
        onOptimisticUpdate={jest.fn()}
        onRollback={onRollback}
      >
        <span>Click</span>
      </OptimisticActionButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(onRollback).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Wait for promise to settle to avoid unhandled rejection warnings
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

  it("calls onSuccess when action succeeds", async () => {
    const onSuccess = jest.fn();
    const action = jest.fn().mockResolvedValue(undefined);

    render(
      <OptimisticActionButton
        action={action}
        optimisticState={true}
        onOptimisticUpdate={jest.fn()}
        onRollback={jest.fn()}
        onSuccess={onSuccess}
      >
        <span>Click</span>
      </OptimisticActionButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("calls onError when action fails", async () => {
    const onError = jest.fn();
    const action = jest.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      throw new Error("Failed");
    });

    render(
      <OptimisticActionButton
        action={action}
        optimisticState={true}
        onOptimisticUpdate={jest.fn()}
        onRollback={jest.fn()}
        onError={onError}
      >
        <span>Click</span>
      </OptimisticActionButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(onError).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Wait for promise to settle to avoid unhandled rejection warnings
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

  it("shows toast with custom messages", async () => {
    const action = jest.fn().mockResolvedValue(undefined);

    render(
      <OptimisticActionButton
        action={action}
        optimisticState={true}
        onOptimisticUpdate={jest.fn()}
        onRollback={jest.fn()}
        loadingMessage="Saving"
        successMessage="Saved!"
        errorMessage="Error!"
      >
        <span>Click</span>
      </OptimisticActionButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalledWith(
        expect.any(Promise),
        expect.objectContaining({
          loading: "Saving",
          success: "Saved!",
          error: "Error!",
        }),
      );
    });
  });

  it("disables button when disabled prop is true", () => {
    render(
      <OptimisticActionButton
        action={jest.fn().mockResolvedValue(undefined)}
        optimisticState={true}
        onOptimisticUpdate={jest.fn()}
        onRollback={jest.fn()}
        disabled={true}
      >
        <span>Click</span>
      </OptimisticActionButton>,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("does not call action when disabled", () => {
    const action = jest.fn().mockResolvedValue(undefined);

    render(
      <OptimisticActionButton
        action={action}
        optimisticState={true}
        onOptimisticUpdate={jest.fn()}
        onRollback={jest.fn()}
        disabled={true}
      >
        <span>Click</span>
      </OptimisticActionButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(action).not.toHaveBeenCalled();
  });
});
