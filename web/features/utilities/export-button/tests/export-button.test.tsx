import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { toast } from "sonner";
import { ExportButton } from "../components/export-button";

jest.mock("@/lib/utils", () => ({
  cn: (...classes: (string | undefined | null | false)[]) =>
    classes.filter(Boolean).join(" "),
}));

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

const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();

global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

const originalCreateElement = document.createElement;

describe("ExportButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue("blob:url");
    document.createElement = originalCreateElement;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.createElement = originalCreateElement;
  });

  it("renders with default label", () => {
    const fetchData = jest.fn().mockResolvedValue([]);
    render(<ExportButton fetchData={fetchData} />);
    expect(screen.getByText("Export CSV")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    const fetchData = jest.fn().mockResolvedValue([]);
    render(<ExportButton fetchData={fetchData} label="Download" />);
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("exports data as CSV", async () => {
    const fetchData = jest.fn().mockResolvedValue([
      { id: 1, name: "Test" },
      { id: 2, name: "Test2" },
    ]);
    const mockLink = originalCreateElement.call(
      document,
      "a",
    ) as HTMLAnchorElement;
    mockLink.click = mockClick;
    Object.defineProperty(mockLink, "href", { writable: true, value: "" });
    Object.defineProperty(mockLink, "download", { writable: true, value: "" });

    const createElementSpy = jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName) => {
        if (tagName === "a") {
          return mockLink;
        }
        return originalCreateElement.call(document, tagName);
      });

    render(<ExportButton fetchData={fetchData} format="csv" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchData).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    createElementSpy.mockRestore();
  });

  it("exports data as JSON", async () => {
    const fetchData = jest.fn().mockResolvedValue([{ id: 1, name: "Test" }]);
    const mockLink = originalCreateElement.call(
      document,
      "a",
    ) as HTMLAnchorElement;
    mockLink.click = mockClick;
    Object.defineProperty(mockLink, "href", { writable: true, value: "" });
    Object.defineProperty(mockLink, "download", { writable: true, value: "" });

    const createElementSpy = jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName) => {
        if (tagName === "a") {
          return mockLink;
        }
        return originalCreateElement.call(document, tagName);
      });

    render(<ExportButton fetchData={fetchData} format="json" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchData).toHaveBeenCalled();
    });

    createElementSpy.mockRestore();
  });

  it("shows toast with custom resource", async () => {
    const fetchData = jest.fn().mockResolvedValue([{ id: 1 }]);
    const mockLink = originalCreateElement.call(
      document,
      "a",
    ) as HTMLAnchorElement;
    mockLink.click = mockClick;
    Object.defineProperty(mockLink, "href", { writable: true, value: "" });
    Object.defineProperty(mockLink, "download", { writable: true, value: "" });

    const createElementSpy = jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName) => {
        if (tagName === "a") {
          return mockLink;
        }
        return originalCreateElement.call(document, tagName);
      });

    render(<ExportButton fetchData={fetchData} resource="users" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalledWith(
        expect.any(Promise),
        expect.objectContaining({
          loading: "Preparing users export",
          success: "users exported successfully!",
          error: "Failed to export users.",
        }),
      );
    });

    createElementSpy.mockRestore();
  });

  it("calls onSuccess callback", async () => {
    const fetchData = jest.fn().mockResolvedValue([{ id: 1 }]);
    const onSuccess = jest.fn();
    const mockLink = originalCreateElement.call(
      document,
      "a",
    ) as HTMLAnchorElement;
    mockLink.click = mockClick;
    Object.defineProperty(mockLink, "href", { writable: true, value: "" });
    Object.defineProperty(mockLink, "download", { writable: true, value: "" });

    const createElementSpy = jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName) => {
        if (tagName === "a") {
          return mockLink;
        }
        return originalCreateElement.call(document, tagName);
      });

    render(<ExportButton fetchData={fetchData} onSuccess={onSuccess} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    createElementSpy.mockRestore();
  });

  it("calls onError callback on failure", async () => {
    const fetchData = jest.fn().mockRejectedValue(new Error("Export failed"));
    const onError = jest.fn();

    render(<ExportButton fetchData={fetchData} onError={onError} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(onError).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it("throws error when data is empty", async () => {
    const fetchData = jest.fn().mockResolvedValue([]);
    const onError = jest.fn();

    render(<ExportButton fetchData={fetchData} onError={onError} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(onError).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it("disables button when exporting", async () => {
    const fetchData = jest
      .fn()
      .mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve([{ id: 1 }]), 100)),
      );
    const mockLink = originalCreateElement.call(
      document,
      "a",
    ) as HTMLAnchorElement;
    mockLink.click = mockClick;
    Object.defineProperty(mockLink, "href", { writable: true, value: "" });
    Object.defineProperty(mockLink, "download", { writable: true, value: "" });

    const createElementSpy = jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName) => {
        if (tagName === "a") {
          return mockLink;
        }
        return originalCreateElement.call(document, tagName);
      });

    render(<ExportButton fetchData={fetchData} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Assert button is disabled immediately after click
    expect(button).toBeDisabled();

    // Advance timers to let the async operation complete
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    // Assert button becomes enabled again after export completes
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    createElementSpy.mockRestore();
  });

  it("generates filename with timestamp", async () => {
    const fetchData = jest.fn().mockResolvedValue([{ id: 1 }]);
    const mockLink = originalCreateElement.call(
      document,
      "a",
    ) as HTMLAnchorElement;
    mockLink.click = mockClick;
    Object.defineProperty(mockLink, "href", { writable: true, value: "" });
    Object.defineProperty(mockLink, "download", { writable: true, value: "" });

    const createElementSpy = jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName) => {
        if (tagName === "a") {
          return mockLink;
        }
        return originalCreateElement.call(document, tagName);
      });

    render(<ExportButton fetchData={fetchData} filename="test-data" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLink.download).toMatch(/^test-data-.*\.csv$/);
    });

    createElementSpy.mockRestore();
  });
});
