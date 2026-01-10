import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationShade } from "../components/notification-shade";

jest.mock("sonner", () => ({
  toast: {
    loading: jest.fn(() => "toast-id"),
    dismiss: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@uidotdev/usehooks", () => ({
  useMediaQuery: jest.fn(() => false),
}));

const mockNotifications = [
  {
    id: "1",
    title: "Test Notification",
    message: "Test message",
    type: "info" as const,
    category: "system" as const,
    timestamp: new Date().toISOString(),
    isRead: false,
  },
];

describe("NotificationShade", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders notification button", () => {
    render(
      <NotificationShade
        notifications={mockNotifications}
        onNotificationClick={jest.fn()}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("shows unread count badge", () => {
    render(
      <NotificationShade notifications={mockNotifications} unreadCount={5} />,
    );

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("opens dropdown when clicked", async () => {
    render(
      <NotificationShade
        notifications={mockNotifications}
        onNotificationClick={jest.fn()}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Notifications Shade")).toBeInTheDocument();
    });
  });

  it("displays notifications", async () => {
    render(
      <NotificationShade
        notifications={mockNotifications}
        onNotificationClick={jest.fn()}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Test Notification")).toBeInTheDocument();
    });
  });

  it("calls onNotificationClick when notification is clicked", async () => {
    const onNotificationClick = jest.fn();

    render(
      <NotificationShade
        notifications={mockNotifications}
        onNotificationClick={onNotificationClick}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      const notification = screen.getByText("Test Notification");
      fireEvent.click(notification);
      expect(onNotificationClick).toHaveBeenCalled();
    });
  });

  it("switches tabs", async () => {
    render(
      <NotificationShade
        notifications={mockNotifications}
        onNotificationClick={jest.fn()}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      const allTab = screen.getByText("All");
      fireEvent.click(allTab);
      expect(screen.getByText("All")).toBeInTheDocument();
    });
  });
});
