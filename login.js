const https = require('https');
const querystring = require('querystring');

const Request = require('./request');
const Config = require('./config');

const { LOGIN_URL, URL_FOR_TOKEN_CHECK, BASE_HEADERS } = require('./constants');

class Login {
    constructor(account, password) {
        this.account = account;
        this.password = password;
    }

    async getToken() {
        try {
            if (await this.checkCachedToken()) {
                console.log('Use cached token');
                return this.cachedToken;
            } else {
                console.log('No available token, trying to get one...');
                const fkey = await this.getFkey();
                const newToken = await new Promise((resolve, reject) => {
                    const postData = querystring.stringify({
                        fkey,
                        ssrc: 'login',
                        email: this.account,
                        password: this.password,
                    });
                    const req = https.request({
                        hostname: 'stackoverflow.com',
                        port: 443,
                        path: '/users/login',
                        method: 'POST',
                        protocol: 'https:',
                        headers: Object.assign({
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Content-Length': postData.length
                        }, BASE_HEADERS)
                    }, res => {
                        if (res.statusCode === 302) {
                            for (let index in res.headers["set-cookie"]) {
                                let cookie = res.headers["set-cookie"][index];
                                if (cookie.includes('acct=')) {
                                    const matches = cookie.match(/acct=([^;]*);/);
                                    if (!matches) {
                                        reject('Extract cookies failed.');
                                    } else {
                                        if (matches[1].split('&s').filter(d => d).length >= 2) {
                                            resolve(matches[1]);
                                        } else {
                                            reject('Invalid token:', matches[1]);
                                        }
                                    }
                                }
                            }
                            reject('No available cookies found');
                        } else if (res.statusCode === 200) {
                            reject('Account or password incorrect');
                        } else {
                            reject(`Status: ${res.statusCode}`);
                        }
                    });

                    req.on('error', (e) => {
                        reject(e);
                    });

                    req.write(postData);
                    req.end();
                });

                await Config.getInstance().mutateConfig('cachedToken', newToken);

                return newToken;
            }
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    }

    async getFkey() {
        return await new Promise((resolve, reject) => {
            const req = https.request(LOGIN_URL, {
                headers: BASE_HEADERS,
            }, res => {
                let content = '';
                res.on('data', d => {
                    content += d;
                });
                res.on('end', () => {
                    const matches = content.match(/"fkey":"([^"]*)"/);
                    // console.log(content);
                    if (!matches) {
                        reject('Fetch fkey failed');
                    } else {
                        resolve(matches[1]);
                    }
                });
            });
            req.on('error', err => {
                reject(err);
            });
            req.end();
        });
    }

    async getTokenHeader() {
        try {
            const token = await this.getToken();
            if (token) {
                return {
                    Cookie: `acct=${token}`
                };
            }
        } catch (err) {
            console.error(err);
        }
        return false;
    }

    async checkCachedToken() {
        console.log('Checking token...');
        this.cachedToken = await Config.getInstance().getConfig('cachedToken');

        if (!this.cachedToken) {
            return false;
        }

        const headers = Object.assign({
            Cookie: `acct=${this.cachedToken}`
        }, BASE_HEADERS);

        try {
            let userId;
            const html = await Request.get(URL_FOR_TOKEN_CHECK, headers);
            if (html) {
                const matches = html.toString().match(/<a href="\/users\/(\d+)/);
                if (matches) {
                    userId = matches[1];
                }
            }
            if (userId) {
                return true;
            }
        } catch (err) {
            console.error(err);
        }
        return false;
    }
}

// (async function() {
//     const login = new Login(USERNAME, PWD);
//     try {
//         const tokenHeaders = await login.getTokenHeader();
//         console.log('access token:', tokenHeaders);
//     } catch (err) {
//         console.error(err);
//     }
// })();

module.exports = Login;
