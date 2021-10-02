const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts; //list of all accounts that exist on this local ganache network
let factory; //reference to the deployed instance of the factory
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts(); //list of accounts
    
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas:'1000000' }); //launching a new instance of the contract

    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'
    }); // 'factory' is the instance of factory contract, '.methods' is used to access the functions that we created in the factory contract
        //'createCampaign' is the method, it takes 'uint minimum' as an arguement, which is the minimum amount of wei or eth reqd. to create a campaign
        //'from: accounts[0]' depicts that accounts[0] is the manager of this contract

    [campaignAddress] = await factory.methods.getDeployedCampaigns().call(); //'getDeployedCampaigns()' mehtod of the factory contract is view only, means we can't change anything about it so we just 'call()' it instead of sending a transaction
    //same as below but used ES2016
    // const addresses = await factory.methods.getDeployedCampaigns().call(); //'getDeployedCampaigns()' mehtod of the factory contract is view only, means we can't change anything about it so we just 'call()' it instead of sending a transaction
    // campaignAddress = addresses[0];

    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    ); //if we have already deployed the contract and we want to make web3 aware of it's existence that's where we pass in the interface(ABI) as the first arguement and the address of the already deployed version as the second arguement  
    
});

describe('Campaigns', () => {
    it('Deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller of createCampaign on the factory as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call(); //'manager' is a 'public' variable of 'address' type that we made in our 'Campaign' contract. We are not modifying any data here we're just calling it so we use 'call()' instead of sending a transaction using 'send()'
        assert.equal(accounts[0], manager); //first arguement is what we want it to be i.e. 'accounts[0]' and second is what it actually is i.e. address stored inside 'manager' variable
    });

    it('allows people to contrbute money and makrs them as approvers', async () => {
        await campaign.,
    });
});
