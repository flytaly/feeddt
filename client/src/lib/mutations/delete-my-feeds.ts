import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MyFeedsQuery } from '@/gql/generated';
import { getGQLClient } from '@/lib/gqlClient.client';

export default function useDeleteFeedsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number | number[]) => {
      const { deleteMyFeeds } = await getGQLClient().deleteMyFeeds({ ids });
      if (deleteMyFeeds.errors) {
        return deleteMyFeeds;
      }
      const deleted = deleteMyFeeds.ids;
      if (!deleted?.length) return;
      queryClient.setQueryData<MyFeedsQuery>(['myFeeds'], (oldData) => {
        if (!oldData?.myFeeds) return oldData;
        const filtered = oldData.myFeeds.filter((uf) => !deleted.includes(String(uf.id)));
        return { ...oldData, myFeeds: filtered };
      });
      return deleteMyFeeds || {};
    },
  });
}
