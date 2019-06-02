const addFeed = require('./mutations/addFeed');
const confirmSubscription = require('./mutations/confirmSubscription');
const deleteMyFeed = require('./mutations/deleteMyFeed');
const requestUnsubscribe = require('./mutations/requestUnsubscribe');
const requestPasswordChange = require('./mutations/requestPasswordChange');
const setPassword = require('./mutations/setPassword');
const signIn = require('./mutations/signIn');
const signOut = require('./mutations/signOut');
const unsubscribe = require('./mutations/unsubscribe');
const updateMyFeed = require('./mutations/updateMyFeed');
const updateMyInfo = require('./mutations/updateMyInfo');

const Mutations = {
    addFeed,
    confirmSubscription,
    deleteMyFeed,
    requestUnsubscribe,
    requestPasswordChange,
    setPassword,
    signIn,
    signOut,
    unsubscribe,
    updateMyFeed,
    updateMyInfo,
};

module.exports = Mutations;
