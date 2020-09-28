pragma solidity ^0.6.7;

import "./SharedStorage.sol";

contract Upgradeable is SharedStorage {
    bool internal instantiated;

    modifier onlyOnce() {
        require(!instantiated, "The contract has been initialized already");
        _;
    }

    function init() internal onlyOnce {
        instantiated = true;
    }

    function upgradeImplementation(address newImpl) public virtual {
        contractImplementation = newImpl;
    }

    function getImplementation() external view returns (address) {
        return contractImplementation;
    }
}
