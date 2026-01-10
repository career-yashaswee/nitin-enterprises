# Export Button - Installation Guide

A button component that exports data to CSV or JSON format with toast notifications and loading states.

## Dependencies

Required packages:

- `csv-stringify` - CSV conversion
- `framer-motion` - Smooth animations
- `sonner` - Toast notifications
- `lucide-react` - Icons (Download, Check)
- `class-variance-authority` - Button variant support

## Quick Start

### Step 1: Copy the Component

Copy `export-button.tsx` to your components directory:

```
components/export-button.tsx
```

### Step 2: Use in Your Page

Import and use the component:

```tsx
// app/page.tsx
"use client";

import { ExportButton } from "@/components/export-button";

async function fetchUsers() {
  const response = await fetch("/api/users");
  return response.json();
}

export default function UsersPage() {
  return (
    <div>
      <ExportButton fetchData={fetchUsers} resource="users" />
    </div>
  );
}
```

**Important:** Include `Toaster` from `sonner` in your layout for toast notifications to work.

### Step 3: Done

Click the button to export your data as CSV or JSON.

## Customization

### Basic Usage

```tsx
<ExportButton fetchData={fetchUsers} />
```

### Export as JSON

```tsx
<ExportButton fetchData={fetchUsers} format="json" />
```

### Custom Filename

```tsx
<ExportButton fetchData={fetchUsers} filename="my-data" />
```

### Custom Resource Name

```tsx
<ExportButton fetchData={fetchUsers} resource="users" />
```

### Custom Label

```tsx
<ExportButton fetchData={fetchUsers} label="Download Data" />
```

### Hide Icon

```tsx
<ExportButton fetchData={fetchUsers} showIcon={false} />
```

### Custom Button Variant

```tsx
<ExportButton fetchData={fetchUsers} variant="default" size="lg" />
```

### With Callbacks

```tsx
<ExportButton
  fetchData={fetchUsers}
  onSuccess={() => console.log("Exported!")}
  onError={(error) => console.error("Error:", error)}
/>
```

### Complete Example

```tsx
<ExportButton
  fetchData={fetchUsers}
  format="csv"
  filename="users-export"
  resource="users"
  label="Export Users"
  variant="outline"
  size="sm"
  showIcon={true}
  onSuccess={() => {
    console.log("Export completed!");
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
│   ├── export-button.tsx
│   └── ui/
│       └── button.tsx
└── lib/
    └── utils.ts
```

## Testing

1. Click the export button
2. Button should show loading state
3. Toast notification appears with progress
4. File downloads automatically
5. Success toast appears after download

## Configuration

### TypeScript

The component is fully typed. Your `fetchData` function should return `Promise<unknown[]>`:

```tsx
async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  return response.json();
}
```

## Troubleshooting

### File not downloading

- Check browser console for errors
- Ensure `fetchData` returns an array
- Verify data is not empty

### Toasts not showing

- Ensure `Toaster` from `sonner` is in your layout
- Verify `sonner` is installed: `npm list sonner`

### CSV format errors

- Ensure data is an array of objects
- Check that objects have consistent structure
- Verify `csv-stringify` is installed: `npm list csv-stringify`

### Button not showing loading state

- Check that `framer-motion` is installed: `npm list framer-motion`
- Verify button is not disabled by other logic

## Props API

| Prop        | Type                                             | Default                           | Description                             |
| ----------- | ------------------------------------------------ | --------------------------------- | --------------------------------------- |
| `fetchData` | `() => Promise<unknown[]>`                       | -                                 | Function that returns data to export    |
| `filename`  | `string`                                         | `"export"`                        | Base filename (timestamp will be added) |
| `resource`  | `string`                                         | `"data"`                          | Resource name for toast messages        |
| `label`     | `string`                                         | `"Export CSV"` or `"Export JSON"` | Button label                            |
| `format`    | `"csv" \| "json"`                                | `"csv"`                           | Export format                           |
| `onSuccess` | `() => void`                                     | -                                 | Callback when export succeeds           |
| `onError`   | `(error: Error) => void`                         | -                                 | Callback when export fails              |
| `className` | `string`                                         | -                                 | Additional CSS classes                  |
| `showIcon`  | `boolean`                                        | `true`                            | Show download icon                      |
| `variant`   | `VariantProps<typeof buttonVariants>["variant"]` | `"outline"`                       | Button variant                          |
| `size`      | `VariantProps<typeof buttonVariants>["size"]`    | `"sm"`                            | Button size                             |

## Features

- CSV and JSON export formats
- Automatic file download
- Toast notifications with progress
- Loading and success states
- Animated icon transitions
- Customizable filename with timestamp
- Error handling
- TypeScript support
- Zero configuration required

## Use Cases

- Data tables: Export table data
- Reports: Download reports as CSV/JSON
- User lists: Export user data
- Analytics: Download analytics data
- Admin panels: Export various data sets
- Dashboards: Quick data export functionality
