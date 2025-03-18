# InfiniteScroll

A React component for a scrollable container that lazily loads items at the top and bottom when scrolled.

## Installation

```bash
npm install @maisonsmd/react-infinite-scroll
```

## Basic Usage

See the full example on [CodeSandbox](https://codesandbox.io/p/sandbox/react-infinite-scroll-lc47cj).

```tsx
import { useState } from 'react';
import { InfiniteScroll } from '@maisonsmd/react-infinite-scroll';

function App() {
  const [items, setItems] = useState<any[]>([/* initial data */]);

  const hasNext = /* boolean indicating more data at bottom */;
  const hasPrevious = /* boolean indicating more data at top */;

  function loadNext() {
    /* fetch or generate items for bottom */
  }

  function loadPrevious() {
    /* fetch or generate items for top */
  }

  return (
    <InfiniteScroll
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      onBottomReached={loadNext}
      onTopReached={loadPrevious}
      loaderToast={<div className="toast">Loading...</div>}
      topLoader={(ratio) => <div style={{ opacity: ratio }}>Loading Top...</div>}
      bottomLoader={(ratio) => <div style={{ opacity: ratio }}>Loading Bottom...</div>}
    >
      {items.map((item, index) => (
        <div key={item.id ?? index}>
          {/* item display */}
        </div>
      ))}
    </InfiniteScroll>
  );
}

export default App;
```

## Props

| Prop                   | Type                   | Description                                                                                                               |
| ---------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `className`            | `string`               | Optional classNames for the container.                                                                                    |
| `styles`               | `CSSProperties`        | Inline styles for the container.                                                                                          |
| `children`             | `ReactNode`            | Scrollable content.                                                                                                       |
| `debounceDelay`        | `number`               | Debounce interval in ms for top/bottom events. Default 100.                                                               |
| `hasPrevious`          | `boolean`              | Indicates if there are items to load above.                                                                               |
| `hasNext`              | `boolean`              | Indicates if there are items to load below.                                                                               |
| `useViewPortAsRoot`    | `boolean`              | Uses browser viewport as root for intersection.                                                                           |
| `loaderToast`          | `ReactNode`            | Toast displayed briefly after loading.                                                                                    |
| `toastVisibleDuration` | `number`               | Duration in ms to show the toast. Default 1000.                                                                           |
| `topLoader`            | `(ratio) => ReactNode` | Render function for top loader, with `ratio` being the interection percentage (0..1), good for render a circular progress |
| `bottomLoader`         | `(ratio) => ReactNode` | Render function for bottom loader, with `ratio` being the interection percentage (0..1)                                   |
| `endMessage`           | `ReactNode`            | Element displayed when there are no more items.                                                                           |
| `onTopReached`         | `() => void`           | Callback for when the top is reached.                                                                                     |
| `onBottomReached`      | `() => void`           | Callback for when the bottom is reached.                                                                                  |

## License

MIT.
