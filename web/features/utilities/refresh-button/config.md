# Refresh Button - Installation Guide

A button component that invalidates React Query cache keys with toast notifications and loading states.

## Dependencies

Required packages:

- `@tanstack/react-query` - Query client for cache invalidation
- `framer-motion` - Smooth animations for loading icon
- `sonner` - Toast notifications
- `lucide-react` - Refresh icon
- `class-variance-authority` - Button variant support

## Quick Start

### Step 1: Copy the Component

Copy `refresh-button.tsx` to your components directory:

```
components/refresh-button.tsx
```

### Step 2: Set Up React Query

Ensure React Query is set up in your app:

```tsx
// app/layout.tsx or app/providers.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

### Step 3: Use in Your Page

Import and use the component:

```tsx
// app/page.tsx
"use client";

import { RefreshButton } from "@/components/refresh-button";

export default function UsersPage() {
  return (
    <div>
      <RefreshButton queryKeys={[["users"]]} resource="users" />
    </div>
  );
}
```

**Important:** Include `Toaster` from `sonner` in your layout for toast notifications to work.

### Step 4: Done

Click the button to refresh your data by invalidating React Query cache.

## Customization

### Basic Usage

```tsx
<RefreshButton queryKeys={[["users"]]} />
```

### Multiple Query Keys

```tsx
<RefreshButton queryKeys={[["users"], ["posts"], ["comments"]]} />
```

### Custom Resource Name

```tsx
<RefreshButton queryKeys={[["users"]]} resource="users" />
```

### Custom Label

```tsx
<RefreshButton queryKeys={[["users"]]} label="Reload" />
```

### Custom Aria Label

```tsx
<RefreshButton queryKeys={[["users"]]} ariaLabel="Refresh user list" />
```

### Hide Icon

```tsx
<RefreshButton queryKeys={[["users"]]} showIcon={false} />
```

### Custom Button Variant

```tsx
<RefreshButton queryKeys={[["users"]]} variant="default" size="lg" />
```

### With Callbacks

```tsx
<RefreshButton
  queryKeys={[["users"]]}
  onSuccess={() => console.log("Refreshed!")}
  onError={(error) => console.error("Error:", error)}
/>
```

### Complete Example

```tsx
<RefreshButton
  queryKeys={[["users"], ["posts"]]}
  resource="data"
  label="Refresh"
  ariaLabel="Refresh users and posts"
  variant="outline"
  size="sm"
  showIcon={true}
  onSuccess={() => {
    console.log("Refresh completed!");
  }}
/>
```

## File Structure

```
your-project/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── refresh-button.tsx
│   └── ui/
│       └── button.tsx
└── lib/
    └── utils.ts
```

## Testing

1. Click the refresh button
2. Button should show loading state with rotating icon
3. Toast notification appears with progress
4. React Query cache is invalidated
5. Success toast appears after refresh

## Configuration

### TypeScript

The component is fully typed. Query keys should match your React Query setup:

```tsx
// Single query key
<RefreshButton queryKeys={[["users"]]} />

// Nested query key
<RefreshButton queryKeys={[["users", userId]]} />

// Multiple query keys
<RefreshButton queryKeys={[["users"], ["posts"]]} />
```

## Troubleshooting

### Cache not invalidating

- Ensure React Query is properly set up
- Verify query keys match your useQuery keys
- Check that QueryClientProvider wraps your app

### Toasts not showing

- Ensure `Toaster` from `sonner` is in your layout
- Verify `sonner` is installed: `npm list sonner`

### Button not showing loading state

- Check that `framer-motion` is installed: `npm list framer-motion`
- Verify button is not disabled by other logic

### React Query not found

- Ensure `@tanstack/react-query` is installed: `npm list @tanstack/react-query`
- Verify QueryClientProvider is set up correctly

## Props API

| Prop        | Type                                             | Default                | Description                       |
| ----------- | ------------------------------------------------ | ---------------------- | --------------------------------- |
| `queryKeys` | `QueryKey[]`                                     | -                      | Array of query keys to invalidate |
| `resource`  | `string`                                         | `"data"`               | Resource name for toast messages  |
| `label`     | `string`                                         | `"Refresh"`            | Button label                      |
| `ariaLabel` | `string`                                         | `"Refresh {resource}"` | ARIA label for accessibility      |
| `onSuccess` | `() => void`                                     | -                      | Callback when refresh succeeds    |
| `onError`   | `(error: Error) => void`                         | -                      | Callback when refresh fails       |
| `className` | `string`                                         | -                      | Additional CSS classes            |
| `showIcon`  | `boolean`                                        | `true`                 | Show refresh icon                 |
| `variant`   | `VariantProps<typeof buttonVariants>["variant"]` | `"outline"`            | Button variant                    |
| `size`      | `VariantProps<typeof buttonVariants>["size"]`    | `"sm"`                 | Button size                       |

## Features

- React Query cache invalidation
- Multiple query key support
- Toast notifications with progress
- Loading states with animated icon
- Error handling
- TypeScript support
- Zero configuration required

## Use Cases

- Data tables: Refresh table data
- Dashboards: Refresh dashboard metrics
- User lists: Refresh user data
- Admin panels: Refresh various data sets
- Real-time data: Manual refresh option
- Cache management: Invalidate stale data
