import React, { useMemo } from 'react';
import Link from 'next/link';
import BarsIcon from '../../../public/static/bars.svg';
import { useItemsCountUpdatedSubscription, UserFeed } from '../../generated/graphql';
import { createUpdateOnNewItems } from '../../utils/update-unread-count';

interface OverviewProps {
  feeds: UserFeed[];
  setSidebarModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Overview: React.FC<OverviewProps> = ({ feeds, setSidebarModalOpen }) => {
  useItemsCountUpdatedSubscription({ onSubscriptionData: createUpdateOnNewItems() });

  const feedsSorted = useMemo(() => {
    const unread = feeds?.filter((f) => f.newItemsCount) || [];
    const read = feeds?.filter((f) => !f.newItemsCount) || [];
    return unread.concat(read);
  }, [feeds]);

  return (
    <div className="px-4 py-1 my-1">
      <div className="flex items-center flex-wrap mb-4">
        <button
          type="button"
          className="md:hidden icon-btn mr-4"
          title="Open list of the feeds"
          onClick={() => setSidebarModalOpen((prev) => !prev)}
        >
          <BarsIcon className="h-4 w-4" />
        </button>
      </div>
      <div>
        <ul className="text-sm grid grid-cols-feed-overview  gap-4">
          {feedsSorted.map((f) => (
            <li
              key={f.id}
              className={`relative p-2 bg-white shadow-message hover:shadow-message-darker overflow-hidden max-h-full ${
                f.newItemsCount ? 'pt-4' : ''
              }`}
            >
              {f.newItemsCount ? (
                <div
                  className="absolute top-0 right-0 px-1 bg-gray-200
 text-xs text-gray-500 rounded-bl-md"
                >
                  {`${f.newItemsCount} new items`}
                </div>
              ) : null}
              <Link href={`/feed/${f.id}`}>
                <a className="font-bold hover:underline">{f.title || f.feed.title}</a>
              </Link>
              <div className="text-xs">{f.feed.description}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Overview;
