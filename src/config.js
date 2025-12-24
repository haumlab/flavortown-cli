const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_PATH = path.join(os.homedir(), '.flavortown-cli.json');

const getConfig = () => {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    return {};
  }
};

const setConfig = (config) => {
  const currentConfig = getConfig();
  const newConfig = { ...currentConfig, ...config };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
};

const getApiKey = () => getConfig().apiKey;

module.exports = {
  getApiKey,
  setConfig,
};
