module.exports = function (RED) {
    function ConfigNode(config) {
        RED.nodes.createNode(this, config);
        this.baseURL = config.baseURL;
        this.client_id = config.client_id;
        this.client_secret = config.client_secret;
        this.gcs_okta_domain = config.gcs_okta_domain;
        this.log(`ConfigNode created: baseURL=${this.baseURL}, client_id=${this.client_id}, client_secret=${this.client_secret}, gcs_okta_domain=${this.gcs_okta_domain}`);
    }
    RED.nodes.registerType("aitrios-config", ConfigNode);
};
