const ConsoleRESTAPI = require('./console_api');

module.exports = function (RED) {
    function GetDevicesNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const configNode = RED.nodes.getNode(config.config);

        if (configNode) {
            node.log(`ConfigNode: baseURL=${configNode.baseURL}, client_id=${configNode.client_id}, client_secret=${configNode.client_secret}, gcs_okta_domain=${configNode.gcs_okta_domain}`);
        } else {
            node.log('ConfigNode is not defined');
        }

        node.on('input', async function (msg) {
            if (!configNode || !configNode.baseURL || !configNode.client_id || !configNode.client_secret || !configNode.gcs_okta_domain) {
                node.error("Missing configuration parameters", msg);
                return;
            }

            const consoleAPI = new ConsoleRESTAPI(configNode.baseURL, configNode.client_id, configNode.client_secret, configNode.gcs_okta_domain);
            try {
                const response = await consoleAPI.getDevices();
                console.log("---------------");
                console.log("!!!response!!!");
                console.dir(response);
                console.log("---------------");

                msg.payload = response;
                node.send(msg);
            } catch (error) {
                node.error(`Error fetching token: ${error.message}`, msg);
            }
        });
    }
    RED.nodes.registerType("aitrios-get-devices", GetDevicesNode);
};
