'use client'; // Error components must be Client Components

import { useEffect } from 'react';

import SmallCard from '@/components/card/small-card';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SmallCard>
      <div className="flex flex-col justify-center items-center m-auto gap-4 p-4">
        <h2>Something went wrong!</h2>
        <div className="p-2 border border-error">{error.message}</div>
        <button
          className="btn bg-secondary "
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </button>
      </div>
    </SmallCard>
  );
}
