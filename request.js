const https = require('https');

class Request {
    static get(url, headers) {
        return new Promise((resolve, reject) => {
            const req = https.request(url, {
                headers,
            }, res => {
                if (res.statusCode === 301) {
                    // moved permanently
                    const nextUrl = new URL(res.headers.location, url).toString();
                    this.redirectTo(nextUrl).then(res => {
                        resolve(res);
                    });
                } else if (res.statusCode === 200) {
                    let content = '';
                    res.on('data', d => {
                        content += d;
                    });

                    res.on('end', () => {
                        resolve(content);
                    })
                } else {
                    reject(`RequestError: status ${res.statusCode}`);
                }
            });

            req.on('error', err => {
                reject(err);
            });

            req.end();
        })
    }

    static redirectTo(nextUrl) {
        return new Promise((resolve, reject) => {
            this.get(nextUrl).then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err);
            })
        })
    }
}

module.exports = Request;
