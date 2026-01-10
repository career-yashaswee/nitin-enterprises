# Optimistic Action Button - Installation Guide

A button component that performs optimistic UI updates, showing immediate feedback while the action executes in the background.

## Dependencies

Required packages:

- `framer-motion` - Smooth animations for loading states
- `sonner` - Toast notifications
- `class-variance-authority` - Button variant support

## Quick Start

### Step 1: Copy the Component

Copy `optimistic-action-button.tsx` to your components directory:

```
components/optimistic-action-button.tsx
```

### Step 2: Use in Your Page

Import and use the component:

```tsx
// app/page.tsx
"use client";

import { useState } from "react";
import { OptimisticActionButton } from "@/components/optimistic-action-button";

export default function MyPage() {
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    await fetch("/api/like", { method: "POST" });
  };

  return (
    <OptimisticActionButton
      action={handleLike}
      optimisticState={liked}
      onOptimisticUpdate={() => setLiked(true)}
      onRollback={() => setLiked(false)}
    >
      {liked ? "Unlike" : "Like"}
    </OptimisticActionButton>
  );
}
```

**Important:** Include `Toaster` from `sonner` in your layout for toast notifications to work.

### Step 3: Done

The button shows immediate feedback while the action executes.

## Customization

### Basic Usage

```tsx
<OptimisticActionButton
  action={handleAction}
  optimisticState={state}
  onOptimisticUpdate={() => setState(true)}
  onRollback={() => setState(false)}
>
  Click Me
</OptimisticActionButton>
```

### Custom Messages

```tsx
<OptimisticActionButton
  action={handleAction}
  optimisticState={state}
  onOptimisticUpdate={() => setState(true)}
  onRollback={() => setState(false)}
  loadingMessage="Processing request..."
  successMessage="Action completed!"
  errorMessage="Something went wrong"
>
  Submit
</OptimisticActionButton>
```

### Custom Button Variant

```tsx
<OptimisticActionButton
  action={handleAction}
  optimisticState={state}
  onOptimisticUpdate={() => setState(true)}
  onRollback={() => setState(false)}
  variant="default"
  size="lg"
>
  Submit
</OptimisticActionButton>
```

### With Callbacks

```tsx
<OptimisticActionButton
  action={handleAction}
  optimisticState={state}
  onOptimisticUpdate={() => setState(true)}
  onRollback={() => setState(false)}
  onSuccess={() => console.log("Success!")}
  onError={(error) => console.error("Error:", error)}
>
  Submit
</OptimisticActionButton>
```

### Disabled State

```tsx
<OptimisticActionButton
  action={handleAction}
  optimisticState={state}
  onOptimisticUpdate={() => setState(true)}
  onRollback={() => setState(false)}
  disabled={!canSubmit}
>
  Submit
</OptimisticActionButton>
```

### Complete Example

```tsx
<OptimisticActionButton
  action={handleLike}
  optimisticState={liked}
  onOptimisticUpdate={() => setLiked(true)}
  onRollback={() => setLiked(false)}
  loadingMessage="Liking post..."
  successMessage="Post liked!"
  errorMessage="Failed to like post"
  variant="default"
  size="sm"
  onSuccess={() => {
    console.log("Like successful!");
  }}
>
  {liked ? "Unlike" : "Like"}
</OptimisticActionButton>
```

## File Structure

```
your-project/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── optimistic-action-button.tsx
│   └── ui/
│       └── button.tsx
└── lib/
    └── utils.ts
```

## Testing

1. Click the button
2. Button should immediately show loading state
3. Optimistic update should apply immediately
4. Toast notification shows progress
5. On success, success toast appears
6. On error, rollback occurs and error toast appears

## Configuration

### TypeScript

The component is fully typed. Your `action` function should return `Promise<void>`:

```tsx
async function handleAction(): Promise<void> {
  await fetch("/api/action", { method: "POST" });
}
```

## Troubleshooting

### Optimistic update not working

- Ensure `onOptimisticUpdate` updates your state immediately
- Check that state is properly managed in parent component

### Rollback not working

- Ensure `onRollback` properly restores previous state
- Verify error handling in your `action` function

### Toasts not showing

- Ensure `Toaster` from `sonner` is in your layout
- Verify `sonner` is installed: `npm list sonner`

### Loading animation not working

- Check that `framer-motion` is installed: `npm list framer-motion`
- Verify button is not disabled by other logic

## Props API

| Prop                 | Type                                             | Default                              | Description                             |
| -------------------- | ------------------------------------------------ | ------------------------------------ | --------------------------------------- |
| `action`             | `() => Promise<void>`                            | -                                    | Async function to execute               |
| `optimisticState`    | `boolean`                                        | -                                    | Current optimistic state (for tracking) |
| `onOptimisticUpdate` | `() => void`                                     | -                                    | Callback to apply optimistic update     |
| `onRollback`         | `() => void`                                     | -                                    | Callback to rollback on error           |
| `children`           | `ReactNode`                                      | -                                    | Button content                          |
| `loadingMessage`     | `string`                                         | `"Processing..."`                    | Toast message during loading            |
| `successMessage`     | `string`                                         | `"Action completed successfully."`   | Toast message on success                |
| `errorMessage`       | `string`                                         | `"Action failed. Please try again."` | Toast message on error                  |
| `onSuccess`          | `() => void`                                     | -                                    | Callback when action succeeds           |
| `onError`            | `(error: Error) => void`                         | -                                    | Callback when action fails              |
| `className`          | `string`                                         | -                                    | Additional CSS classes                  |
| `disabled`           | `boolean`                                        | `false`                              | Disable button                          |
| `variant`            | `VariantProps<typeof buttonVariants>["variant"]` | -                                    | Button variant                          |
| `size`               | `VariantProps<typeof buttonVariants>["size"]`    | -                                    | Button size                             |

## Features

- Optimistic UI updates
- Automatic rollback on error
- Loading states with animations
- Toast notifications
- Error handling
- TypeScript support
- Zero configuration required

## Use Cases

- Like/Unlike buttons: Immediate feedback
- Follow/Unfollow: Optimistic updates
- Toggle switches: Instant state changes
- Form submissions: Immediate feedback
- Vote buttons: Quick user feedback
- Bookmark actions: Instant visual feedback
