/* eslint-env jest */

const { execute, makePromise } = require('apollo-link');
const bcrypt = require('bcrypt');
const { deleteData, runServer, getApolloLink } = require('./_common');
const db = require('../../bind-prisma');
const gq = require('./_gql-queries');

let yogaApp;
let link;
const watcher = {};

const moduleName = 'setpassword';
const mocks = {
    user: {
        email: `${moduleName}-testuser@test.com`,
        password: `${moduleName}_password`,
        setPasswordToken: 'setPasswordToken',
        setPasswordTokenExpiry: new Date(Date.now() + 1000 * 60),
    },
};

jest.mock('nanoid', () => jest.fn(async () => mocks.activationToken));

const clearDB = async () => {
    await deleteData(db, { email: mocks.user.email });
};

beforeAll(async () => {
    yogaApp = await runServer(db, watcher);
    const { port } = yogaApp.address();
    link = getApolloLink(port);
    await clearDB();

    await db.mutation.createUser({ data: { ...mocks.user, password: '' } });
});

afterAll(async () => {
    yogaApp.close();
    await clearDB();
});

describe('setPassword', () => {
    test('should save password\'s hash', async () => {
        const { email, password } = mocks.user;
        const { setPasswordToken: token } = await db.query.user({ where: { email } });

        const { data } = await makePromise(execute(link, {
            query: gq.SET_PASSWORD_MUTATION,
            variables: { email, password, token },
        }));
        expect(data.setPassword.email).toEqual(email.toLowerCase());

        const user = await db.query.user({ where: { email } });
        const validPassword = await bcrypt.compare(password, user.password);

        expect(validPassword).toBeTruthy();
        expect(user.setPasswordToken).toBeNull();
        expect(user.setPasswordTokenExpiry).toBeNull();
    });
});
