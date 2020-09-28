pragma solidity ^0.6.7;

import "./Upgradeability/UpgradeableProxy.sol";

contract KeyVaultProxy is UpgradeableProxy {
    constructor(address contractImpl) public UpgradeableProxy(contractImpl) {}
}
