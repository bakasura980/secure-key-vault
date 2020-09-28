const secrets = require('secrets.js-grempe');
const { encryptWithPublicKey, cipher } = require('eth-crypto');

const etherlime = require('etherlime-lib');
const deployer = new etherlime.EtherlimeGanacheDeployer();

const KeyVault = require('./../build/KeyVault');
const KeyVaultFactory = require('./../build/KeyVaultFactory');

describe('Key Vault Contract', () => {

    const OWNER = accounts[0].signer;
    const ALICE = accounts[1].signer;

    let contract;

    const SHARED_KEY = secrets.random(512);
    const shares = secrets.share(SHARED_KEY, 2, 2);

    let OWNER_SHARE = '';
    let ALICE_SHARE = '';
    let CONTRACT_SHARE = '';

    const encryptShare = async function (pubKey, share) {
        return '0x' + cipher.stringify(await encryptWithPublicKey(pubKey.substr(4), share));
    }

    before(async () => {
        OWNER_SHARE = await encryptShare(OWNER.signingKey.publicKey, shares[0]);
        ALICE_SHARE = await encryptShare(ALICE.signingKey.publicKey, shares[1]);
        CONTRACT_SHARE = await encryptShare(OWNER.signingKey.publicKey, secrets.newShare(3, shares));
    });

    beforeEach(async () => {
        contract = await deployer.deploy(KeyVault);
        await contract.init(`0x${SHARED_KEY}`, OWNER_SHARE, CONTRACT_SHARE)
    });

    describe('Initialization', function () {
        it('Should deploy the contract with correct parameters', async () => {
            contract = await deployer.deploy(KeyVault);
            await contract.init(`0x${SHARED_KEY}`, OWNER_SHARE, CONTRACT_SHARE)

            const sharedKey = await contract.sharedKey();
            const ownerShare = await contract.shares(0);
            const contractShare = await contract.shares(1);

            assert(sharedKey == `0x${SHARED_KEY}`);

            assert(ownerShare.user == OWNER.address);
            assert(ownerShare.encShare == OWNER_SHARE);

            assert(contractShare.user == contract.contractAddress);
            assert(contractShare.encShare == CONTRACT_SHARE);
        });

        it('Should be initialized only once', async () => {
            contract = await deployer.deploy(KeyVault);
            await contract.init(`0x${SHARED_KEY}`, OWNER_SHARE, CONTRACT_SHARE)

            await assert.revertWith(
                contract.init(`0x${SHARED_KEY}`, OWNER_SHARE, CONTRACT_SHARE),
                'The contract has been initialized already'
            );
        });
    });

    describe('Authorize address', function () {
        it('Should authorize an address', async () => {
            await contract.authorize(ALICE.address, ALICE_SHARE);

            const aliceShare = await contract.getShareByOwner(ALICE.address);
            assert(aliceShare.user == ALICE.address);
            assert(aliceShare.encShare == ALICE_SHARE);
        });

        it('Should throw if unauthorized address performs authorization', async () => {
            await assert.revertWith(
                contract.from(ALICE).authorize(ALICE.address, ALICE_SHARE),
                'Sender is not authorized'
            );
        });
    });

    describe('Authorize address', function () {
        it('Should unauthorize an address', async () => {
            await contract.authorize(ALICE.address, ALICE_SHARE);
            await contract.unauthorize(ALICE.address);

            const aliceShare = await contract.getShareByOwner(ALICE.address);

            assert(aliceShare.user != ALICE.address);
            assert(aliceShare.encShare != ALICE_SHARE);
        });

        it('Should throw if unauthorized address performs unauthorization', async () => {
            await assert.revertWith(
                contract.from(ALICE).unauthorize(ALICE.address),
                'Sender is not authorized'
            );
        });
    });

    describe('Add secret', function () {

        const SECRET = {
            name: '0x' + Buffer.from('secret').toString('hex'),
            value: '0x' + Buffer.from('secret').toString('hex')
        }

        it('Should add a secret', async () => {
            await contract.addSecret(SECRET.name, SECRET.value);

            const emptySecret = await contract.secrets(0);
            assert(emptySecret.name == '0x');
            assert(emptySecret.value == '0x');

            const secret = await contract.secrets(1);
            assert(secret.value == SECRET.value);

            await contract.authorize(ALICE.address, ALICE_SHARE);

            const ALICE_SECRET = {
                name: '0x' + Buffer.from('alice').toString('hex'),
                value: '0x' + Buffer.from('alice_secret').toString('hex')
            }
            await contract.from(ALICE).addSecret(ALICE_SECRET.name, ALICE_SECRET.value);

            const aliceSecret = await contract.getSecretByName(ALICE_SECRET.name);
            assert(aliceSecret.value == ALICE_SECRET.value);
        });

        it('Should throw in case of re-adding a secret', async () => {
            await contract.addSecret(SECRET.name, SECRET.value);

            await assert.revertWith(
                contract.addSecret(SECRET.name, SECRET.value + '123'),
                'Such a secret already exists'
            );
        });

        it('Should throw if unauthorized address tries to add a secret', async () => {
            await assert.revertWith(
                contract.from(ALICE).addSecret(SECRET.name, SECRET.value),
                'Sender is not authorized'
            );
        });
    });

    describe('Upgradeability', function () {

        let contractCode;
        let factory;

        beforeEach(async () => {
            contractCode = await deployer.deploy(KeyVault);
            factory = await deployer.deploy(KeyVaultFactory, {}, contractCode.contractAddress);
            await factory.create();

            contract = await etherlime.ContractAt(KeyVault, await factory.keyVaults(OWNER.address));
            await contract.init(`0x${SHARED_KEY}`, OWNER_SHARE, CONTRACT_SHARE);
        });

        const validateContractState = async function () {
            const sharedKey = await contract.getSharedKey();
            const ownerShare = await contract.getShareByOwner(OWNER.address);
            const contractShare = await contract.getShareByOwner(contract.contractAddress);

            assert(sharedKey == `0x${SHARED_KEY}`);

            assert(ownerShare.user == OWNER.address);
            assert(ownerShare.encShare == OWNER_SHARE);

            assert(contractShare.user == contract.contractAddress);
            assert(contractShare.encShare == CONTRACT_SHARE);
        }

        it('Should instantiate a proxy instance properly', async () => {
            await validateContractState();

            const implementation = await contract.getImplementation();
            assert(implementation == contractCode.contractAddress);
        });

        it('Should upgrade the contract code without changing the storage', async () => {
            const contractCode = await deployer.deploy(KeyVault);
            await contract.upgradeImplementation(contractCode.contractAddress)

            const implementation = await contract.getImplementation();
            assert(implementation == contractCode.contractAddress);

            await validateContractState();
        });

        it('Should throw in case a non-authorized address tries to upgrade the contract code', async () => {
            await assert.revertWith(
                contract.from(ALICE).upgradeImplementation(contractCode.contractAddress)
            );
        });
    });

});
