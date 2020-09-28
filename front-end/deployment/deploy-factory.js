const fs = require('fs');
const path = require('path');
const etherlime = require('etherlime-lib');
const deployer = new etherlime.EtherlimeGanacheDeployer();

const KeyVault = require('./contracts/KeyVault');
const KeyVaultFactory = require('./contracts/KeyVaultFactory');

(async () => {
    const contractCode = await deployer.deploy(KeyVault);
    const factory = await deployer.deploy(KeyVaultFactory, {}, contractCode.contractAddress);

    const configPath = path.resolve(__dirname, '../web/src/config/configs.json');
    const rawData = fs.readFileSync(configPath);

    const configs = JSON.parse(rawData);
    configs.FACTORY_ADDRESS = factory.contractAddress;

    fs.writeFileSync(configPath, JSON.stringify(configs));
})();