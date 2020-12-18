/* eslint-env jest */

const { execute, makePromise } = require('apollo-link');
const { deleteData, runServer, getApolloLink } = require('./_common');
const { sendConfirmSubscription } = require('../../mail-sender/dispatcher');
const { getFeedStream } = require('../../feed-parser');
const db = require('../../bind-prisma');
const gq = require('./_gql-queries');


const moduleName = 'addfeed';
const mocks = {
    addFeed: {
        email: `${moduleName}TestUser@test.com`,
        feedUrl: `http://${moduleName}testfeed.com`,
        feedSchedule: 'EVERY2HOURS',
        timeZone: 'Europe/Paris',
        locale: 'en-US',
    },
    addNewFeed: {
        email: `${moduleName}TestUser@test.com`,
        feedSchedule: 'EVERYHOUR',
        feedUrl: `http://${moduleName}testfeed2.com`,
    },
    addNotAFeed: {
        email: `${moduleName}TestUser@test.com`,
        feedUrl: `http://${moduleName}notafeed.com`,
        feedSchedule: 'EVERY2HOURS',
    },
    activationToken: `---${moduleName}-activation-token---`,
    feedTitle: 'Test Feed Title',
};

jest.mock('../../feed-parser', () => ({
    getFeedStream: jest.fn((feedUrl) => {
        let feedStream = 'feedStream';
        if (feedUrl === mocks.addNotAFeed.feedUrl) feedStream = 'fakeFeedStream';
        return { feedStream, feedUrl };
    }),
    checkFeedInfo: jest.fn(stream => ({
        isFeed: stream === 'feedStream',
        meta: { title: mocks.feedTitle },
    })),
}));

jest.mock('../../mail-sender/dispatcher.js', () => ({
    sendConfirmSubscription: jest.fn(() => Promise.resolve()),
}));

jest.mock('nanoid', () => jest.fn(async () => mocks.activationToken));


let yogaApp;
let link;
const watcher = {};

const clearDB = async () => {
    await deleteData(db, { email: mocks.addFeed.email, url: mocks.addFeed.feedUrl });
    return deleteData(db, { email: mocks.addNewFeed.email, url: mocks.addNewFeed.feedUrl });
};

beforeAll(async () => {
    yogaApp = await runServer(db, watcher);
    const { port } = yogaApp.address();
    link = getApolloLink(port);
    await clearDB();
});

afterAll(async () => {
    yogaApp.close();
    await clearDB();
});

describe('addFeed mutation', () => {
    test('should create user with email and feed', async () => {
        const { email, feedUrl, feedSchedule } = mocks.addFeed;
        const { data: { addFeed: { message } }, errors } = await makePromise(execute(link, {
            query: gq.ADD_FEED_MUTATION,
            variables: { email, feedUrl, feedSchedule },
        }));
        expect(getFeedStream).toHaveBeenCalledWith(feedUrl, { timeout: 3000 }, true);
        const user = await db.query.user({ where: { email } }, '{ email locale timeZone permissions feeds { schedule activated activationToken feed { url } }  }');
        expect(errors).toBeUndefined();
        expect(message).toEqual(`Activation link has been sent to ${email.toLowerCase()}`);
        expect(user).toMatchObject({
            email: mocks.addFeed.email.toLowerCase(),
            permissions: ['USER'],
            locale: 'en-GB',
            timeZone: 'GMT',
            feeds: [{
                schedule: mocks.addFeed.feedSchedule,
                activated: false,
                activationToken: mocks.activationToken,
                feed: { url: mocks.addFeed.feedUrl.toLowerCase() },
            }],
        });
        expect(sendConfirmSubscription).toHaveBeenCalledWith(
            email.toLowerCase(),
            mocks.activationToken,
            mocks.feedTitle,
        );
    });

    test('should add new feed to existing user', async () => {
        const { email, feedUrl, feedSchedule } = mocks.addNewFeed;
        const { data: { addFeed: { message } }, errors } = await makePromise(execute(link, {
            query: gq.ADD_FEED_MUTATION,
            variables: { email, feedUrl, feedSchedule },
        }));
        const user = await db.query.user({ where: { email } }, '{ feeds { schedule feed { url } }  }');
        expect(errors).toBeUndefined();
        expect(message).toEqual(`Activation link has been sent to ${mocks.addNewFeed.email.toLowerCase()}`);
        expect(user.feeds.length).toEqual(2);
        expect(user.feeds[1]).toMatchObject({
            schedule: mocks.addNewFeed.feedSchedule,
            feed: { url: mocks.addNewFeed.feedUrl.toLowerCase() },
        });
    });

    test('should return error if adding existing feed', async () => {
        const { feedUrl: url } = mocks.addFeed;
        const feeds = await db.query.userFeeds({ where: { feed: { url } } });
        const { id } = feeds[0];

        await db.mutation.updateUserFeed({
            data: { activated: true },
            where: { id },
        });

        const { errors } = await makePromise(execute(link, {
            query: gq.ADD_FEED_MUTATION,
            variables: {
                email: mocks.addFeed.email,
                feedUrl: mocks.addFeed.feedUrl,
                feedSchedule: mocks.addFeed.feedSchedule,
            },
        }));

        expect(errors[0].message).toEqual('The feed was already added');

        await db.mutation.updateUserFeed({
            where: { id },
            data: { activated: false },
        });
    });

    test('should return error if adding not a feed', async () => {
        const { errors } = await makePromise(execute(link, {
            query: gq.ADD_FEED_MUTATION,
            variables: {
                email: mocks.addNotAFeed.email,
                feedUrl: mocks.addNotAFeed.feedUrl,
                feedSchedule: mocks.addNotAFeed.feedSchedule,
            },
        }));

        expect(errors[0].message).toEqual('Not a feed');
    });

    test('should return error if email is not an email', async () => {
        const { errors: e1 } = await makePromise(execute(link, {
            query: gq.ADD_FEED_MUTATION,
            variables: { email: 'notAnEmail', feedUrl: mocks.addFeed.feedUrl },
        }));
        expect(e1[0].message).toEqual('Not valid argument: email');

        const { errors: e2 } = await makePromise(execute(link, {
            query: gq.ADD_FEED_MUTATION,
            variables: { email: '', feedUrl: mocks.addFeed.feedUrl },
        }));
        expect(e2[0].message).toEqual('Not valid argument: email');
    });
});

describe('user info', () => {
    beforeEach(clearDB);
    test('should save locale and timeZone', async () => {
        const { email, feedUrl, feedSchedule, locale, timeZone } = mocks.addFeed;
        await makePromise(execute(link, {
            query: gq.ADD_FEED_MUTATION,
            variables: { email, feedUrl, feedSchedule, locale, timeZone },
        }));
        const user = await db.query.user({ where: { email } }, '{ locale timeZone }');
        expect(user.timeZone).toBe(timeZone);
        expect(user.locale).toBe(locale);
    });

    test('should not save incorrect timezone', async () => {
        const { email, feedUrl, feedSchedule } = mocks.addFeed;
        const { errors } = await makePromise(execute(link, {
            query: gq.ADD_FEED_MUTATION,
            variables: { email, feedUrl, feedSchedule, timeZone: 'wrongTimeZone' },
        }));
        expect(errors[0]).toHaveProperty('message', 'Not valid argument: timeZone');
    });
});