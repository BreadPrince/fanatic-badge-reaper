const fs = require('fs');
const path = require('path');

const { CONFIG_FILENAME, PACKAGE_NAME, CMD_NAME, GIT_ISSUE } = require('./constants');

const CONFIG_FILE_PATH = path.resolve(__dirname, CONFIG_FILENAME);

class Config {
    constructor() {}

    static getInstance() {
        return _instance;
    }

    async init() {
        if ( !this.isInitable() ) {
            console.log('Already initialized.');
            return;
        }

        const data = JSON.stringify({});

        try {
            fs.writeFileSync(CONFIG_FILE_PATH, data);
            console.log('Successfully initialized.');
            return true;
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    }

    async mutateConfig(name, value) {
        if ( !this.isValid() ) {
            console.error(`Cannot mutate configs, if this is the first time you use ${PACKAGE_NAME}, try "${CMD_NAME} init".`);
            console.error(`Or, issue your problem on ${GIT_ISSUE}`);
            return;
        }

        switch (name) {
            case 'cachedToken':
                break;
            default:
                console.error(`Invalid config name: ${name}`);
                return;
        }

        try {
            const configs = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf-8'));
            configs[name] = value;
            fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(configs));
            return true;
        } catch (err) {
            // console.error(err);
        }
    }

    async getConfig(name) {
        if ( !this.isValid() ) {
            console.error(`Cannot get config "${name}", please check your env variables.`);
            console.error(`Or, issue your problem on ${GIT_ISSUE}`);
            return;
        }

        try {
            const configs = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf-8'));
            return configs[name] || '';
        } catch (err) {
            console.error(err);
        }
    }

    // check whether the config file is exist, if exist, not initable.
    isInitable() {
        try {
            fs.accessSync(CONFIG_FILE_PATH, fs.constants.F_OK);
            return false;
        } catch (err) {
            return true;
        }
    }

    // check whether the config file is valid.
    isValid() {
        try {
            fs.accessSync(CONFIG_FILE_PATH, fs.constants.R_OK | fs.constants.W_OK);
            return true;
        } catch (err) {
            return false;
        }
    }
}

// if ( !this.isValid() ) {
//     console.error('Error: cannot read/write config file.');
//     return;
// }

const _instance = new Config();

module.exports = Config;
