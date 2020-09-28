pragma solidity ^0.6.7;

import "./SharedStorage.sol";
import "./Forwardable.sol";

contract UpgradeableProxy is SharedStorage, Forwardable {
    constructor(address contractImpl) public {
        contractImplementation = contractImpl;
    }

    fallback() external {
        delegatedFwd(contractImplementation);
    }
}
