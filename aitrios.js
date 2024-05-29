const axios = require('axios');
const qs = require('qs');
const base64 = require('base-64');

module.exports = function (RED) {
    function AITRIOSNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const baseURL = config.baseURL;
        const client_id = config.client_id;
        const client_secret = config.client_secret;
        const gcs_okta_domain = config.gcs_okta_domain;

        const AUTHORIZATION_CODE = base64.encode(`${client_id}:${client_secret}`);

        async function getToken() {
            const headers = {
                "accept": "application/json",
                "authorization": `Basic ${AUTHORIZATION_CODE}`,
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded",
            };

            const data = qs.stringify({
                "grant_type": "client_credentials",
                "scope": "system",
            });

            try {
                const response = await axios.post(gcs_okta_domain, data, { headers });
                return response.data.access_token;
            } catch (error) {
                node.error(error);
                throw error;
            }
        }

        async function getHeaders(payload) {
            const token = await getToken();
            const headers = { "Accept": "application/json", "Authorization": `Bearer ${token}` };
            if (Object.keys(payload).length !== 0) {
                headers["Content-Type"] = "application/json";
            }
            return headers;
        }

        async function request(url, method, options = {}) {
            let params = {};
            let payload = {};
            let files = {};
            url = baseURL + url;

            for (let key in options) {
                if (options[key] !== null && options[key] !== undefined) {
                    if (key === 'payload') {
                        payload = options[key];
                    } else if (key === 'files') {
                        files = options[key];
                    } else {
                        if (url.includes(`{${key}}`)) {
                            url = url.replace(`{${key}}`, options[key]);
                        } else {
                            params[key] = options[key].toString();
                        }
                    }
                }
            }

            const headers = await getHeaders(payload);

            try {
                const response = await axios({
                    method,
                    url,
                    headers,
                    params,
                    data: payload,
                    files
                });
                return response.data;
            } catch (error) {
                node.error(error);
                return error.response ? error.response.data : error.message;
            }
        }

        node.on('input', async function (msg) {
            const { url, method, options } = msg.payload;
            try {
                const result = await request(url, method, options);
                msg.payload = result;
                node.send(msg);
            } catch (error) {
                node.error(error);
                msg.payload = { error: error.message };
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("aitrios", AITRIOSNode);
};
