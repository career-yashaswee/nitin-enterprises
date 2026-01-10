import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "../components/empty-state";

describe("EmptyState", () => {
  it("renders default no-data state", () => {
    render(<EmptyState type="no-data" />);

    expect(screen.getByText("No data available")).toBeInTheDocument();
    expect(
      screen.getByText("There's nothing to display here yet."),
    ).toBeInTheDocument();
  });

  it("renders error state", () => {
    render(<EmptyState type="error" />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("We encountered an error. Please try again."),
    ).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<EmptyState type="loading" />);

    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("renders not-found state", () => {
    render(<EmptyState type="not-found" />);

    expect(screen.getByText("Not found")).toBeInTheDocument();
  });

  it("renders search state", () => {
    render(<EmptyState type="search" />);

    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(
      <EmptyState
        type="no-data"
        title="Custom Title"
        description="Custom description"
      />,
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });

  it("renders action button when actionLabel is provided", () => {
    render(
      <EmptyState
        type="no-data"
        actionLabel="Custom Action"
        onAction={jest.fn()}
      />,
    );

    expect(screen.getByText("Custom Action")).toBeInTheDocument();
  });

  it("calls onAction when button is clicked", () => {
    const onAction = jest.fn();

    render(
      <EmptyState type="no-data" actionLabel="Click me" onAction={onAction} />,
    );

    const button = screen.getByText("Click me");
    fireEvent.click(button);

    expect(onAction).toHaveBeenCalled();
  });

  it("disables button when onAction is not provided", () => {
    render(<EmptyState type="no-data" actionLabel="Click me" />);

    const button = screen.getByText("Click me");
    expect(button).toBeDisabled();
  });

  it("renders default action label for no-data type", () => {
    render(<EmptyState type="no-data" onAction={jest.fn()} />);

    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });
});
