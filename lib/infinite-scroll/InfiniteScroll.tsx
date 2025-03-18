import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { cn } from './utils';

export interface InfiniteScrollProps {
  // The class name to apply to the root element
  className?: string;
  // The style to apply to the root element
  styles?: CSSProperties;
  // The children to render
  children: ReactNode;
  // The delay in milliseconds to debounce the onTopReached and onBottomReached events, defaults to 100
  debounceDelay?: number;
  // Whether there are more items to load at the top
  hasPrevious?: boolean;
  // Whether there are more items to load at the bottom
  hasNext?: boolean;
  // Whether to use the viewport as the root for the IntersectionObserver, defaults to false
  useViewPortAsRoot?: boolean;
  // The loader toast to render when the loader is triggered
  loaderToast?: ReactNode;
  // The duration in milliseconds to show the loader toast, defaults to 1000
  toastVisibleDuration?: number;
  // The loader to render at the top
  topLoader?: (pullPercentage: number) => ReactNode;
  // The loader to render at the bottom
  bottomLoader?: (pullPercentage: number) => ReactNode;
  // The end message to render at the bottom when there are no more items to load
  endMessage?: ReactNode;
  // The callback to call when the top is reached
  onTopReached?: () => void;
  // The callback to call when the bottom is reached
  onBottomReached?: () => void;
}

export function InfiniteScroll({
  children,
  className,
  styles,
  hasNext = false,
  hasPrevious = false,
  debounceDelay = 100,
  toastVisibleDuration = 1000,
  topLoader,
  bottomLoader,
  loaderToast,
  endMessage,
  useViewPortAsRoot,
  onBottomReached,
  onTopReached,
}: InfiniteScrollProps) {
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const [loaderToastVisible, setLoaderToastVisible] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const topLoaderRef = useRef<HTMLDivElement>(null);
  const bottomLoaderRef = useRef<HTMLDivElement>(null);
  const topTimeoutRef = useRef<number | null>(null);
  const bottomTimeoutRef = useRef<number | null>(null);
  const loaderToastTimeoutRef = useRef<number | null>(null);
  const topTriggeredRef = useRef(false);
  const bottomTriggeredRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === topLoaderRef.current) {
            setIntersectionRatio(entry.intersectionRatio);
          } else if (entry.target === bottomLoaderRef.current) {
            setIntersectionRatio(entry.intersectionRatio);
          }
        });
      },
      {
        root: useViewPortAsRoot ? null : scrollAreaRef.current,
        threshold: Array.from({ length: 11 }, (_, i) => i / 10), // Create thresholds from 0 to 1
      },
    );

    if (topLoaderRef.current) observer.observe(topLoaderRef.current);
    if (bottomLoaderRef.current) observer.observe(bottomLoaderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [useViewPortAsRoot]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollArea = scrollAreaRef.current;

      if (!scrollArea) return;

      const isAtTop = scrollArea.scrollTop === 0;
      const isAtBottom =
        scrollArea.scrollHeight - scrollArea.scrollTop - 5 <= scrollArea.clientHeight;

      // Only trigger onTopReached again if user leaves top and comes back
      if (isAtTop && hasPrevious && !topTriggeredRef.current) {
        if (!topTimeoutRef.current) {
          topTimeoutRef.current = setTimeout(() => {
            onTopReached?.();
            setLoaderToastVisible(true);
            topTimeoutRef.current = null;
          }, debounceDelay);
        }
        topTriggeredRef.current = true;
      } else if (!isAtTop && topTriggeredRef.current) {
        // reset so we can trigger again next time we scroll to top
        topTriggeredRef.current = false;
        if (topTimeoutRef.current) {
          clearTimeout(topTimeoutRef.current);
          topTimeoutRef.current = null;
        }
      }

      // Only trigger onBottomReached again if user leaves bottom and comes back
      if (isAtBottom && hasNext && !bottomTriggeredRef.current) {
        if (!bottomTimeoutRef.current) {
          bottomTimeoutRef.current = setTimeout(() => {
            onBottomReached?.();
            setLoaderToastVisible(true);
            bottomTimeoutRef.current = null;
          }, debounceDelay);
        }
        bottomTriggeredRef.current = true;
      } else if (!isAtBottom && bottomTriggeredRef.current) {
        // reset so we can trigger again next time we scroll to bottom
        bottomTriggeredRef.current = false;
        if (bottomTimeoutRef.current) {
          clearTimeout(bottomTimeoutRef.current);
          bottomTimeoutRef.current = null;
        }
      }
    };

    const scrollArea = scrollAreaRef.current;

    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener('scroll', handleScroll);
      }
      if (topTimeoutRef.current) {
        clearTimeout(topTimeoutRef.current);
      }
      if (bottomTimeoutRef.current) {
        clearTimeout(bottomTimeoutRef.current);
      }
    };
  }, [hasPrevious, hasNext, onTopReached, onBottomReached, debounceDelay]);

  useEffect(() => {
    if (loaderToastVisible) {
      if (loaderToastTimeoutRef.current) {
        clearTimeout(loaderToastTimeoutRef.current);
      }

      loaderToastTimeoutRef.current = setTimeout(() => {
        setLoaderToastVisible(false);
      }, toastVisibleDuration);
    }

    return () => {
      if (loaderToastTimeoutRef.current) {
        clearTimeout(loaderToastTimeoutRef.current);
      }
    };
  }, [loaderToastVisible, toastVisibleDuration]);

  return (
    <div
      className={cn('relative h-full', className)}
      style={{
        ...styles,
      }}
    >
      <div
        ref={scrollAreaRef}
        className="h-full snap-y snap-mandatory overflow-y-scroll"
      >
        <div
          ref={topLoaderRef}
          className={cn('flex w-full justify-center', hasPrevious && topLoader && 'p-4 pt-14')}
        >
          {hasPrevious && topLoader?.(intersectionRatio)}
        </div>

        <div className="my-4 h-fit min-h-full w-full snap-start">{children}</div>

        <div
          ref={bottomLoaderRef}
          className={cn(
            'flex w-full justify-center p-4 pb-14',
            ((hasNext && bottomLoader) || (!hasNext && endMessage)) && 'p-4 pb-14',
          )}
        >
          {hasNext ? bottomLoader?.(intersectionRatio) : endMessage}
        </div>
      </div>

      {loaderToast && (
        <div
          className={cn(
            'absolute bottom-2 left-1/2 h-fit -translate-x-1/2 -translate-y-1/2 transition-opacity',
            {
              'opacity-0': !loaderToastVisible,
              'opacity-100': loaderToastVisible,
            },
          )}
        >
          {loaderToast}
        </div>
      )}
    </div>
  );
}
