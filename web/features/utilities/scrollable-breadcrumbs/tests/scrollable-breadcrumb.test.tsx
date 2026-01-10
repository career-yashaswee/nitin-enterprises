import { render, screen } from "@testing-library/react";
import { ScrollableBreadcrumb } from "../components/scrollable-breadcrumb";

const mockItems = [
  { href: "/", label: "Home" },
  { href: "/category", label: "Category" },
  { href: "/category/item", label: "Item" },
];

describe("ScrollableBreadcrumb", () => {
  beforeEach(() => {
    // Mock scrollLeft property
    Object.defineProperty(HTMLElement.prototype, "scrollLeft", {
      writable: true,
      value: 0,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      writable: true,
      value: 1000,
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      writable: true,
      value: 500,
    });
  });

  it("renders breadcrumb items", () => {
    render(<ScrollableBreadcrumb items={mockItems} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Item")).toBeInTheDocument();
  });

  it("renders last item as non-link", () => {
    render(<ScrollableBreadcrumb items={mockItems} />);

    const lastItem = screen.getByText("Item");
    expect(lastItem.closest("a")).not.toBeInTheDocument();
  });

  it("renders other items as links", () => {
    render(<ScrollableBreadcrumb items={mockItems} />);

    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders custom separator", () => {
    render(
      <ScrollableBreadcrumb items={mockItems} separator={<span>/</span>} />,
    );

    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("renders icons when provided", () => {
    const itemsWithIcons = [
      {
        href: "/",
        label: "Home",
        icon: () => <div data-testid="home-icon">🏠</div>,
      },
      { href: "/category", label: "Category" },
    ];

    render(<ScrollableBreadcrumb items={itemsWithIcons} />);

    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
  });

  it("uses custom renderLink when provided", () => {
    const customRenderLink = (
      item: (typeof mockItems)[0],
      children: React.ReactNode,
    ) => <button>{children}</button>;

    render(
      <ScrollableBreadcrumb items={mockItems} renderLink={customRenderLink} />,
    );

    const homeButton = screen.getByText("Home").closest("button");
    expect(homeButton).toBeInTheDocument();
  });
});
