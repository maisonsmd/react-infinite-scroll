import { useState } from 'react';
import { InfiniteScroll } from '../lib';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const CACHE_SIZE = 20;
const ITEMS = Array.from({ length: 50 }, (_, i) => i);

function App() {
  // Mock items state
  const [items, setItems] = useState<number[]>(ITEMS.slice(0, CACHE_SIZE));

  const hasNext = items[items.length - 1]! < ITEMS[ITEMS.length - 1]!;
  const hasPrevious = items[0]! > ITEMS[0]!;

  function loadNext() {
    const lastItem = items[items.length - 1]!;
    const nextItems = ITEMS.slice(lastItem + 1, lastItem + 1 + CACHE_SIZE);
    setItems([...items, ...nextItems].slice(-CACHE_SIZE));
  }

  function loadPrevious() {
    const firstItem = items[0]!;
    const previousItems = ITEMS.slice(Math.max(0, firstItem - CACHE_SIZE), firstItem);
    setItems([...previousItems, ...items].slice(0, CACHE_SIZE));
  }

  return (
    <div className="flex h-screen w-screen flex-col gap-2 bg-black p-4">
      <h1 className="mx-auto text-6xl text-white">React Infinite Scroll</h1>

      <InfiniteScroll
        className="h-[500px] w-full bg-gray-900"
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onBottomReached={loadNext}
        onTopReached={loadPrevious}
        topLoader={(intersectionRatio: number) => (
          <div className="flex w-full flex-col items-center gap-4 p-4">
            <p className="text-white">Load previous 10 items</p>
            <CircularProgressbar
              className="h-8 w-8"
              value={intersectionRatio * 100}
              strokeWidth={10}
            />
          </div>
        )}
        bottomLoader={(intersectionRatio: number) => (
          <div className="flex w-full flex-col items-center gap-4 p-4">
            <CircularProgressbar
              className="h-8 w-8"
              value={intersectionRatio * 100}
              strokeWidth={10}
            />
            <p className="text-white">Load next 10 items</p>
          </div>
        )}
        endMessage={<div className="text-white">No more items</div>}
        loaderToast={
          <div className="rounded-full bg-blue-300 px-4 py-2 text-black">
            Displaying {items[0]! + 1} - {items[items.length - 1]! + 1} of {ITEMS.length}
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4 p-4">
          {items.map((item, index) => (
            <div
              className="flex h-32 w-full items-center justify-center bg-gray-600 text-4xl text-white"
              key={index}
            >
              {item + 1}
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}

export default App;
