import '@testing-library/jest-dom/extend-expect';
import { render, wait, queryHelpers, act } from '@testing-library/react';
// import { act } from 'react-dom/test-utils';
import ManageFeeds from '../components/manage-feeds';
import { MY_FEEDS_QUERY } from '../queries';
import ApolloMockedProvider from '../test-utils/apollo-mocked-provider';
import types from '../types/digest-periods';
import { StateProvider } from '../components/state';

const getByNameAttribute = queryHelpers.queryByAttribute.bind(
    null,
    'data-name',
);

const createdAt = new Date('2019-04-19T00:11:00.000Z');
const lastUpdate = new Date('2019-04-19T00:12:00.000Z');
const mocks = [{
    request: { query: MY_FEEDS_QUERY },
    result: {
        data: {
            myFeeds: [{
                __typename: 'UserFeed',
                id: 'id1',
                createdAt,
                lastUpdate,
                schedule: types.DAILY,
                activated: true,
                withContentTable: 'DEFAULT',
                feed: {
                    id: 'testFeedId',
                    title: 'Test Feed Title',
                    link: 'http://testfeed.com',
                    url: 'http://testfeed.com/feed',
                    imageTitle: 'Image Title',
                    imageUrl: 'http://testfeed.com/logo.png',
                    __typename: 'Feed',
                },
            }],
        },
    },
}];

describe('Manage feeds', () => {
    let container;

    beforeAll(async () => {
        await act(async () => {
            ({ container } = render(
                <ApolloMockedProvider mocks={mocks}>
                    <StateProvider>
                        <ManageFeeds />
                    </StateProvider>
                </ApolloMockedProvider>,
            ));
        });
    });


    test('should match snapshot', async () => {
        await wait(() => {
            expect(container.firstChild).toMatchSnapshot();
        });
    });

    test('should render date and time in current locale', async () => {
        const createdAtLocale = new Date(createdAt).toLocaleDateString();
        const lastUpdateLocale = new Date(lastUpdate).toLocaleString();
        await wait(() => {
            expect(getByNameAttribute(container, 'ADDED')).toHaveTextContent(createdAtLocale);
            expect(getByNameAttribute(container, 'LAST DIGEST DATE')).toHaveTextContent(lastUpdateLocale);
        });
    });
});
