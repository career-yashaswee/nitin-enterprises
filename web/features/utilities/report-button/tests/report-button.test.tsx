import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReportButton } from "../components/report-button";

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

const mockIssues = [
  {
    id: "issue1",
    label: "Issue 1",
    description: "Description 1",
  },
  {
    id: "issue2",
    label: "Issue 2",
    description: "Description 2",
  },
  {
    id: "OTHER",
    label: "Other",
    description: "Other issue",
  },
];

describe("ReportButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders trigger button", () => {
    render(
      <ReportButton
        reportId="test"
        reportTitle="Test Report"
        issues={mockIssues}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByText("Report")).toBeInTheDocument();
  });

  it("opens dialog when clicked", async () => {
    render(
      <ReportButton
        reportId="test"
        reportTitle="Test Report"
        issues={mockIssues}
        onSubmit={jest.fn()}
      />,
    );

    const button = screen.getByText("Report");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Report Test Report")).toBeInTheDocument();
    });
  });

  it("displays report title in dialog", async () => {
    render(
      <ReportButton
        reportId="test"
        reportTitle="Test Report"
        issues={mockIssues}
        onSubmit={jest.fn()}
      />,
    );

    const button = screen.getByText("Report");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Test Report")).toBeInTheDocument();
    });
  });

  it("displays issue options", async () => {
    render(
      <ReportButton
        reportId="test"
        reportTitle="Test Report"
        issues={mockIssues}
        onSubmit={jest.fn()}
      />,
    );

    const button = screen.getByText("Report");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Issue 1")).toBeInTheDocument();
      expect(screen.getByText("Issue 2")).toBeInTheDocument();
    });
  });

  it("shows custom issue input when OTHER is selected", async () => {
    render(
      <ReportButton
        reportId="test"
        reportTitle="Test Report"
        issues={mockIssues}
        onSubmit={jest.fn()}
      />,
    );

    const button = screen.getByText("Report");
    fireEvent.click(button);

    await waitFor(() => {
      const otherCheckbox = screen.getByLabelText(/Other/i);
      fireEvent.click(otherCheckbox);

      expect(
        screen.getByPlaceholderText("Summarize what is wrong"),
      ).toBeInTheDocument();
    });
  });

  it("disables submit button when no issues selected", async () => {
    render(
      <ReportButton
        reportId="test"
        reportTitle="Test Report"
        issues={mockIssues}
        onSubmit={jest.fn()}
      />,
    );

    const button = screen.getByText("Report");
    fireEvent.click(button);

    await waitFor(() => {
      const submitButton = screen.getByText("Submit report");
      expect(submitButton).toBeDisabled();
    });
  });
});
