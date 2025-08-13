# Custom Hooks

## useNavigationGuard

A custom hook that prevents double navigation in React Native apps using Expo Router.

### Features

- ✅ Prevents multiple rapid navigation attempts
- ✅ Configurable delay before re-enabling navigation
- ✅ Callback support for navigation events
- ✅ Convenience methods for common navigation patterns
- ✅ TypeScript support with proper Expo Router types

### Usage

#### Basic Usage

```tsx
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

const MyComponent = () => {
  const { navigate, isNavigating } = useNavigationGuard();

  return (
    <Button
      title="Go to Profile"
      disabled={isNavigating}
      onPress={() => navigate("/profile")}
    />
  );
};
```

#### With Custom Options

```tsx
const { navigate, isNavigating } = useNavigationGuard({
  delay: 1000, // 1 second delay
  onNavigationStart: () => console.log("Navigation started"),
  onNavigationComplete: () => console.log("Navigation completed"),
});
```

#### With Callbacks

```tsx
const { navigate, isNavigating, goBack, canNavigate } = useNavigationGuard({
  onNavigationStart: () => {
    // Show loading indicator
    setIsLoading(true);
  },
  onNavigationComplete: () => {
    // Hide loading indicator
    setIsLoading(false);
  },
});

// Use convenience methods
<Button onPress={goBack} disabled={!canNavigate} />;
```

### API

#### Parameters

- `options` (optional): Configuration object
  - `delay`: Number of milliseconds to wait before re-enabling navigation (default: 500)
  - `onNavigationStart`: Callback function called when navigation starts
  - `onNavigationComplete`: Callback function called when navigation completes

#### Returns

- `navigate(path)`: Function to navigate to a route (prevents double navigation)
- `isNavigating`: Boolean indicating if navigation is in progress
- `goBack()`: Function to go back (with navigation guard)
- `canNavigate`: Boolean indicating if navigation is allowed

### Examples

#### In a List Item

```tsx
const ListItem = ({ item }) => {
  const { navigate, isNavigating } = useNavigationGuard();

  return (
    <TouchableOpacity
      onPress={() => navigate(`/item/${item.id}`)}
      disabled={isNavigating}
    >
      <Text>{item.title}</Text>
    </TouchableOpacity>
  );
};
```

#### In a Form

```tsx
const SubmitForm = () => {
  const { navigate, isNavigating } = useNavigationGuard();

  const handleSubmit = async () => {
    // Form submission logic...
    await submitForm();
    navigate("/success");
  };

  return (
    <Button title="Submit" onPress={handleSubmit} disabled={isNavigating} />
  );
};
```

### Benefits

1. **Prevents Double Navigation**: Users can't accidentally trigger multiple navigation events
2. **Better UX**: Buttons are disabled during navigation, providing clear feedback
3. **Reusable**: Use the same hook across your entire app
4. **Configurable**: Customize behavior for different use cases
5. **Type Safe**: Full TypeScript support with Expo Router types
