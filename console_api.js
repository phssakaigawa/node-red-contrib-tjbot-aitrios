const axios = require('axios');
const qs = require('qs');
const base64 = require('base-64');

class ConsoleRESTAPI {
    constructor(baseURL, client_id, client_secret, gcs_okta_domain) {
        this.BASE_URL = baseURL;
        this.CLIENT_ID = client_id;
        this.CLIENT_SECRET = client_secret;
        this.GCS_OKTA_DOMAIN = gcs_okta_domain;
        this.AUTHORIZATION_CODE = base64.encode(`${client_id}:${client_secret}`);
    }

    async getToken() {
        if (!this.GCS_OKTA_DOMAIN) {
            throw new Error(`The "GCS_OKTA_DOMAIN" argument is missing. Received: ${this.GCS_OKTA_DOMAIN}`);
        }
        const headers = {
            "accept": "application/json",
            "authorization": `Basic ${this.AUTHORIZATION_CODE}`,
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded",
        };

        const data = qs.stringify({
            "grant_type": "client_credentials",
            "scope": "system",
        });

        try {
            const response = await axios.post(this.GCS_OKTA_DOMAIN, data, { headers });
            return response.data.access_token;
        } catch (error) {
            throw new Error(`Error fetching token: ${error.message}`);
        }
    }

    async getHeaders(payload) {
        const token = await this.getToken();
        const headers = { "Accept": "application/json", "Authorization": `Bearer ${token}` };
        if (Object.keys(payload).length !== 0) {
            headers["Content-Type"] = "application/json";
        }
        return headers;
    }

    async request(url, method, options = {}) {
        let params = {};
        let payload = {};
        url = this.BASE_URL + url;

        for (let key in options) {
            if (options[key] !== null && options[key] !== undefined) {
                if (key === 'payload') {
                    payload = options[key];
                } else {
                    if (url.includes(`{${key}}`)) {
                        url = url.replace(`{${key}}`, options[key]);
                    } else {
                        params[key] = options[key].toString();
                    }
                }
            }
        }

        const headers = await this.getHeaders(payload);

        try {
            const response = await axios({
                method,
                url,
                headers,
                params,
                data: payload,
            });
            return response.data;
        } catch (error) {
            throw new Error(`Request error: ${error.message}`);
        }
    }

    async getDevices() {
        return await this.request("/devices", "GET", {});
    }

    async getImageDirectories(device_id) {
        return await this.request("/devices/images/directories", "GET", { device_id });
    }

    async getInferenceResults(device_id, number_of_results, filter, raw, time) {
        return await this.request(`/devices/${device_id}/inferenceresults`, "GET", {
            number_of_results, filter, raw, time
        });
    }
}

module.exports = ConsoleRESTAPI;
