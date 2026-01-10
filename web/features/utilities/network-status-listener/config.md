# Network Status Listener - Installation Guide

Monitors network connectivity and shows toast notifications when users go offline or come back online.

## Dependencies

Required packages:

- `@uidotdev/usehooks` - Network state detection
- `sonner` - Toast notifications

## Quick Start

### Step 1: Copy the Component

Copy `network-status-listener.tsx` to your components directory:

```
components/network-status-listener.tsx
```

### Step 2: Add to Your Layout

Import the component using Next.js dynamic import with `ssr: false`:

```tsx
// app/layout.tsx
import dynamic from "next/dynamic";
import { Toaster } from "sonner";

const NetworkStatusListener = dynamic(
  () =>
    import("@/components/network-status-listener").then((mod) => ({
      default: mod.NetworkStatusListener,
    })),
  { ssr: false },
);

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <NetworkStatusListener />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

**Important:** Include `Toaster` from `sonner` in your layout for toast notifications to work.

### Step 3: Done

The component automatically detects network status changes and shows toast notifications.

## Customization

### Basic Usage

```tsx
<NetworkStatusListener />
```

### Custom Messages

```tsx
<NetworkStatusListener
  offlineMessage="No internet connection"
  onlineMessage="Back online!"
/>
```

### Without Toast Notifications

```tsx
<NetworkStatusListener showToast={false} />
```

## File Structure

```
your-project/
├── app/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── network-status-listener.tsx
└── lib/
    └── utils.ts
```

## Testing

1. Open browser DevTools (F12)
2. Go to Network tab
3. Enable "Offline" mode
4. Toast notification appears
5. Reconnect to see "Connection restored" toast

## Configuration

### TypeScript

The component is fully typed. No additional type definitions needed.

## Troubleshooting

### Toasts not showing

- Ensure `Toaster` from `sonner` is in your layout
- Verify `sonner` is installed: `npm list sonner`

### Component not detecting offline state

- Uses browser's `navigator.onLine` API
- Some browsers may not accurately detect network state
- Use Chrome DevTools Network throttling for testing

## Props API

| Prop             | Type      | Default                                            | Description                           |
| ---------------- | --------- | -------------------------------------------------- | ------------------------------------- |
| `offlineMessage` | `string`  | `"You are offline. Please check your connection."` | Message shown when going offline      |
| `onlineMessage`  | `string`  | `"Connection restored. You are back online."`      | Message shown when coming back online |
| `showToast`      | `boolean` | `true`                                             | Show toast notifications              |

## Use Cases

- E-commerce sites: Warn users before losing cart data
- Form submissions: Prevent data loss when offline
- Real-time apps: Show connection status
- Progressive Web Apps: Essential for offline functionality
