'use client';

import FeedReader from '@/app/feed/(components)/feed-reader/feed-reader';

export default function FeedPage({ params: { id } }: { params: { id?: string } }) {
  return <FeedReader id={Number(id)} />;
}
