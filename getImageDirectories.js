const ConsoleRESTAPI = require('./console_api');

module.exports = function (RED) {
    function GetImageDirectoriesNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const configNode = RED.nodes.getNode(config.config);

        node.on('input', async function (msg) {
            const device_id = msg.payload.device_id;
            const consoleAPI = new ConsoleRESTAPI(configNode.baseURL, configNode.client_id, configNode.client_secret, configNode.gcs_okta_domain);
            try {
                const response = await consoleAPI.getImageDirectories(device_id);
                msg.payload = response;
                node.send(msg);
            } catch (error) {
                node.error(error.message, msg);
            }
        });
    }
    RED.nodes.registerType("aitrios-get-image-directories", GetImageDirectoriesNode);
};
