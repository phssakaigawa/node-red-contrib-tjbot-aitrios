const ConsoleRESTAPI = require('./console_api');

module.exports = function (RED) {
    function GetInferenceResultsNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const configNode = RED.nodes.getNode(config.config);

        node.on('input', async function (msg) {
            const { device_id, number_of_results, filter, raw, time } = msg.payload;
            const consoleAPI = new ConsoleRESTAPI(configNode.baseURL, configNode.client_id, configNode.client_secret, configNode.gcs_okta_domain);
            try {
                const response = await consoleAPI.getInferenceResults(device_id, number_of_results, filter, raw, time);
                msg.payload = response;
                node.send(msg);
            } catch (error) {
                node.error(error.message, msg);
            }
        });
    }
    RED.nodes.registerType("aitrios-get-inference-results", GetInferenceResultsNode);
};
