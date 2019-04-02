import 'jest-dom/extend-expect';
import { render } from 'react-testing-library';
import ConfirmFeed, { CONFIRM_SUBSCRIPTION_MUTATION } from '../components/confirm-feed';
import ApolloMockedProvider from '../test-utils/apollo-mocked-provider';
import '../test-utils/disable-act-warning';
import wait from '../test-utils/wait';

const successMessage = 'Feed "feed_name" was activated';
const errorMessage = 'Wrong or expired token';
const mocks = [{
    request: {
        query: CONFIRM_SUBSCRIPTION_MUTATION,
        variables: { token: 'token' },
    },
    result: { data: { confirmSubscription: { message: successMessage } } },
}, {
    request: {
        query: CONFIRM_SUBSCRIPTION_MUTATION,
        variables: { token: 'wrongToken' },
    },
    error: new Error(errorMessage),
},
];

describe('Confirm a feed subscription', () => {
    const { getByTestId, rerender } = render(
        <ApolloMockedProvider mocks={mocks}>
            <ConfirmFeed token="token" />
        </ApolloMockedProvider>,
    );

    test('should display response message', async () => {
        await wait();
        expect(getByTestId('message')).toHaveTextContent(successMessage);
    });

    test('should render header', () => {
        expect(getByTestId('card-header')).toBeVisible();
    });

    test('should display error message', async () => {
        rerender(
            <ApolloMockedProvider mocks={mocks}>
                <ConfirmFeed token="wrongToken" />
            </ApolloMockedProvider>,
        );
        await wait();
        expect(getByTestId('error-message')).toHaveTextContent(errorMessage);
    });
});