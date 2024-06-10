const axios = require('axios');
const qs = require('qs');
const base64 = require('base-64');

class ConsoleRESTAPI {
    constructor(baseURL, client_id, client_secret, gcs_okta_domain) {
        this.BASE_URL = baseURL;
        this.CLIENT_ID = client_id;
        this.CLIENT_SECRET = client_secret;
        this.GCS_OKTA_DOMAIN = gcs_okta_domain;
        this.AUTHORIZATION_CODE = base64.encode(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`);

        // Axiosインスタンスの作成
        this.axiosInstance = axios.create({
            baseURL: this.BASE_URL
        });

        // リクエストインターセプターの設定
        this.axiosInstance.interceptors.request.use(request => {
            console.log('Starting Request: ', request);
            return request;
        });

        // レスポンスインターセプターの設定
        this.axiosInstance.interceptors.response.use(response => {
            console.log('Response: ', response);
            return response;
        });
    }

    async getToken() {
        const headers = {
            'accept': 'application/json',
            'authorization': `Basic ${this.AUTHORIZATION_CODE}`,
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded'
        };

        const data = qs.stringify({
            'grant_type': 'client_credentials',
            'scope': 'system'
        });

        try {
            const response = await this.axiosInstance.post(this.GCS_OKTA_DOMAIN, data, { headers });
            console.log("get token:");
            console.dir(response);
            return response.data.access_token;
        } catch (error) {
            throw new Error(`Error fetching token: ${error.message}`);
        }
    }

    async getHeaders(payload) {
        const token = await this.getToken();
        const headers = { 'Accept': 'application/json', "Authorization": `Bearer ${token}` };
        if (Object.keys(payload).length !== 0) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    async request(url, method, options = {}) {
        let { params = {}, payload = {}, files = {} } = options;
        url = `${this.BASE_URL}${url}`;

        for (const [key, val] of Object.entries(options)) {
            if (val !== null && val !== undefined) {
                if (key === 'payload') {
                    payload = JSON.stringify(val);
                } else if (key === 'files') {
                    files = val;
                } else {
                    if (url.includes(`{${key}}`)) {
                        url = url.replace(`{${key}}`, val);
                    } else {
                        params[key] = String(val);
                    }
                }
            }
        }

        const headers = await this.getHeaders(payload);
        console.log("--------------------");
        console.dir(method);
        console.log("url" + url);
        console.log("headers");
        console.log(headers);
        console.log("data:");
        console.dir(payload);
        console.log("param:");
        console.dir(params);

        try {
            const response = await this.axiosInstance({
                method,
                url,
                headers,
                params,
                data: payload,
                files
            });

            console.log("request:");
            console.dir(response);

            return response.data;
        } catch (error) {
            throw new Error(`Error in request: ${error.message}`);
        }
    }

    async getDevices(connectionState = null, device_name = null, device_id = null, device_group_id = null) {
        return this.request('/devices', 'GET', {
            connectionState,
            device_name,
            device_id,
            device_group_id
        });
    }
}

module.exports = ConsoleRESTAPI;
