const mjml2html = require('mjml');
const url = require('url');
const moment = require('moment-timezone');
const themes = require('./themes');
const share = require('./share');
const { htmlToTxt } = require('../feed-watcher/utils');

/**
 * @typedef {Object} enclosure
 * @property {String} type
 * @property {String} url
 */
/**
 * Enclosures url could be too long.
 * This function reduces them to filename and saves them as 'title' property.
 * @param {Array.<enclosure>} enclosures
 */
const addTitlesToEnclosures = enclosures => enclosures.reduce((acc, enc) => {
    const parsedUrl = url.parse(enc.url).pathname;
    const filename = parsedUrl.split('/').pop();
    acc.push({ ...enc, title: filename || enc.url });
    return acc;
}, []);

const imagesTypes = ['image/gif', 'image/jpg', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/tiff', 'image/webp'];

const getImageFromEnclosures = (enclosures) => {
    const enc = enclosures.find(({ type }) => imagesTypes.includes(type));
    if (enc) return enc.url;
    return null;
};

/**
 * @typedef {Object} feedItem
 * @property {String} title
 * @property {String} link
 * @property {String} [imageUrl]
 * @property {String} summary
 * @property {String} description
 * @property {String} pubDate
 * @property {enclosures} enclosures
 */
/**
 * Generate Email HTML content with given feed's articles
 * @param {Object} info - information about feed and mail
 * @param {String} feedInfo.title - feed title
 * @param {String} [feedInfo.theme='default'] - email's theme
 * @param {Array.<feedItem>} feedItems
 * @param {String} userFeedId - id of user's feed for unsubscribing
 * @return {{html: String, errors: Array}}
 */
const composeHTML = (info, feedItems, userFeed = {}) => {
    const {
        id: userFeedId = '',
        user: {
            timeZone = 'GMT',
            locale = 'en',
            shareEnable = true,
            filterShare = [],
            withContentTableDefault = false,
            itemBodyDefault = true,
            attachmentsDefault = true,
        } = {},
        withContentTable = 'DEFAULT',
        itemBody = 'DEFAULT',
        attachments = 'DEFAULT',
    } = userFeed;

    const withToC = withContentTable === 'DEFAULT' ? withContentTableDefault : withContentTable === 'ENABLE';
    const withItemBody = itemBody === 'DEFAULT' ? itemBodyDefault : itemBody === 'ENABLE';
    const withAttachments = attachments === 'DEFAULT' ? attachmentsDefault : attachments === 'ENABLE';

    const theme = themes[info.theme ? info.theme : 'default'];
    const header = theme.header(info);
    const items = feedItems.reduce((acc, _item) => {
        const item = { ..._item };
        // if there is no image try to find it in enclosures. Many feeds save images in enclosures.
        if (!item.imageUrl) { item.imageUrl = getImageFromEnclosures(item.enclosures); }

        if (!withAttachments) item.enclosures = [];
        if (item.enclosures) { item.enclosures = addTitlesToEnclosures(item.enclosures); }

        item.date = moment(item.pubDate).tz(timeZone).locale(locale).format('llll');
        item.share = shareEnable
            ? share
                //  Empty filterShare array means nothing should be filtered!
                .filter(s => !filterShare.length || filterShare.includes(s.id))
                .map(s => ({ ...s, url: s.getUrl(item.link, item.title) }))
            : [];
        item.content = withItemBody ? item.summary || item.description : '';
        return acc + theme.item(item);
    }, '');

    let tableOfContent = '';
    if (withToC) {
        tableOfContent = theme.contentTable({ items: feedItems });
    }

    const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?id=${userFeedId}`;
    const footer = theme.footer({ unsubscribeUrl });
    return mjml2html(header + tableOfContent + items + footer, { minify: true });
};

const composeTXT = (info, feedItems, userFeed = {}) => {
    const {
        id: userFeedId = '',
        user: {
            timeZone = 'GMT',
            locale = 'en',
            itemBodyDefault = true,
            attachmentsDefault = true,
        } = {},
        itemBody = 'DEFAULT',
        attachments = 'DEFAULT',
    } = userFeed;

    const withItemBody = itemBody === 'DEFAULT' ? itemBodyDefault : itemBody === 'ENABLE';
    const withAttachments = attachments === 'DEFAULT' ? attachmentsDefault : attachments === 'ENABLE';

    const header = `${info.title} digest\n`;
    const items = feedItems.reduce((acc, _item) => {
        const item = { ..._item };

        if (!withAttachments) item.enclosures = [];
        if (item.enclosures) { item.enclosures = addTitlesToEnclosures(item.enclosures); }
        item.date = moment(item.pubDate).tz(timeZone).locale(locale).format('llll');
        item.content = htmlToTxt(withItemBody ? item.summary || item.description : '');

        return `${acc}\n\n${item.title}\n${item.date}\n${item.link}\n\n${item.content}\n`;
    }, '');

    const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?id=${userFeedId}`;
    const footer = `\n\n========\nUnsubscribe: ${unsubscribeUrl}`;
    return header + items + footer;
};

module.exports = { composeHTML, composeTXT };
