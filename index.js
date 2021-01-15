require('dotenv').config()

const Login = require('./login');
const Request = require('./request');
const Badge = require('./badge');
const Config = require('./config');

const { BASE_HEADERS, URL_FOR_TOKEN_CHECK  } = require('./constants');


(async () => {
    await Config.getInstance().init();

    const email = process.env.FC_EMAIL;
    const password = process.env.FC_PASSWORD;

    try {
        console.log('Accessing Stack Overflow...');
        const login = new Login(email, password);
        const tokenHeaders = await login.getTokenHeader();

        if (tokenHeaders) {
            let badgeUrl;

            // visit site
            const html = await Request.get(URL_FOR_TOKEN_CHECK, Object.assign(tokenHeaders, BASE_HEADERS));
            if (html) {
                const matches = html.toString().match(/<a href="\/users\/(\d+)/);
                if (matches) {
                    console.log('user id:', matches[1]);
                    badgeUrl = `https://stackoverflow.com/users/activity/next-badge-popup?userId=${matches[1]}&isTagBadge=false&_=${Date.now()}`;
                }
            }

            if (!badgeUrl) {
                console.error('Cannot extract userId.');
                process.exit(1);
            }

            const ret = await Request.get(badgeUrl, Object.assign(tokenHeaders, BASE_HEADERS));
            if (ret) {
                ['Enthusiast', 'Fanatic'].forEach(badge => {
                    const badgeString = extractBadgeString(ret, badge);
                    const badgeObj = new Badge(badgeString);
                    console.log(badgeObj.toString());
                });
                console.log('ok');
            } else {
                console.error('Fetch badges info failed');
            }
        } else {
            console.error('Token header is empty!');
        }
    } catch (err) {
        console.error(err);
    }

    function extractBadgeString(ret, badge) {
        const matches = ret.match(new RegExp(`>(${badge}[^<]*)<`));
        if (matches) {
            return matches[1];
        } else {
            return false;
        }
    }
})();

