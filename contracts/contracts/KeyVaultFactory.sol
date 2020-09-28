pragma solidity ^0.6.7;

import "./KeyVaultProxy.sol";

contract KeyVaultFactory {
    address public initialImplementation;
    // Owner to key vault implementation
    mapping(address => address) public keyVaults;

    constructor(address initialImpl) public {
        initialImplementation = initialImpl;
    }

    function create() external {
        keyVaults[msg.sender] = address(
            new KeyVaultProxy(initialImplementation)
        );
    }
}
