pragma solidity ^0.6.7;

import "./Upgradeability/Upgradeable.sol";

contract KeyVault is Upgradeable {
    bytes public sharedKey;

    struct Secret {
        bytes name;
        bytes value;
    }
    Secret[] public secrets;
    mapping(bytes => uint256) public secretsPointers;

    struct Share {
        address user;
        bytes encShare;
    }
    Share[] public shares;
    mapping(address => uint256) public sharesPointers;

    modifier onlyAuthorized() {
        uint256 sharePointer = sharesPointers[msg.sender];
        require(
            shares[sharePointer].user == msg.sender,
            "Sender is not authorized"
        );
        _;
    }

    function init(
        bytes memory encryptedSharedKey,
        bytes memory encOnwerShare,
        bytes memory encContractShare
    ) public {
        super.init();

        sharedKey = encryptedSharedKey;
        shares.push(Share(msg.sender, encOnwerShare));
        shares.push(Share(address(this), encContractShare));

        sharesPointers[msg.sender] = 0;
        sharesPointers[address(this)] = 1;
    }

    function authorize(address operator, bytes memory encKeyShare)
        external
        onlyAuthorized
    {
        shares.push(Share(operator, encKeyShare));
        sharesPointers[operator] = shares.length - 1;
    }

    function unauthorize(address operator) external onlyAuthorized {
        // Todo: check in case of zero
        uint256 sharePointer = sharesPointers[operator];
        shares[sharePointer] = shares[shares.length - 1];

        sharesPointers[shares[sharePointer].user] = sharePointer;
        sharesPointers[operator] = 0;

        shares.pop();
    }

    function addSecret(bytes memory name, bytes memory value)
        external
        onlyAuthorized
    {
        require(secretsPointers[name] == 0, "Such a secret already exists");

        if (secrets.length == 0) {
            secrets.push(Secret("", ""));
        }

        secrets.push(Secret(name, value));
        secretsPointers[name] = secrets.length - 1;
    }

    function upgradeImplementation(address newImpl)
        public
        override
        onlyAuthorized
    {
        super.upgradeImplementation(newImpl);
    }

    // Getters
    function getSharedKey() external view returns (bytes memory) {
        return sharedKey;
    }

    function getShareByOwner(address shareOwner)
        external
        view
        returns (address user, bytes memory encShare)
    {
        return getShareByIndex(sharesPointers[shareOwner]);
    }

    function getShareByIndex(uint256 index)
        public
        view
        returns (address user, bytes memory encShare)
    {
        Share memory share = shares[index];
        return (share.user, share.encShare);
    }

    function getSecretByName(bytes memory secretName)
        external
        view
        returns (bytes memory name, bytes memory value)
    {
        return getSecretByIndex(secretsPointers[secretName]);
    }

    function getSecretByIndex(uint256 index)
        public
        view
        returns (bytes memory name, bytes memory value)
    {
        Secret memory secret = secrets[index];
        return (secret.name, secret.value);
    }

    function secretsLength() external view returns (uint256) {
        return secrets.length;
    }

    function sharesLength() external view returns (uint256) {
        return shares.length;
    }
}
