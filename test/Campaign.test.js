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
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        }); //contribute is a public variable that we created in our contract
        //if a variable is marked public we automatically get a method to access it for eg. 'manager' and 'approvers' in contract.sol
        const isContributor = await campaign.methods.approvers(accounts[1]).call(); //'approvers' is the method that we get because 'approvers' is a public variable of type mapping (that returns a 'bool' when we pass an 'address' to it) that we made in our contract that allows us to access that mapping 
        assert(isContributor); //if isContributor return a true value, assert will pass so the test will pass otherwise the test will fail
    });

    it('requires a minimum contribution', async ()=> {
        try {
            await campaign.methods.contribute().send({
                value: '200',
                from: accounts[1]
            });
            console.log('enough contribution');
        } catch (err) {
            console.log('not enough contribution');
        }
    });

    it('allows a manager to make a payment request', async ()=> {
        await campaign.methods.createRequest('Buy batteries','100',accounts[1])
            .send({
                from: accounts[0],
                gas: '1000000'
            });
        const request = await campaign.methods.requests(0).call(); //'requests' is a public variable of type struct we made in our contract that contains the list of all requests made by the manager
        
        assert.equal('Buy batteries', request.description); //we can check for other protperties of the 'Request' struct from our contract but one gives us a fair enough idea if it is working or not
    });

    it('it processes requests/works end-to-end', async () => {
        console.log('Commencing end-2-end test:');
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        }); //now accounts[0] is marked as a contributor
        console.log('campaign created...');

        await campaign.methods.createRequest('Buy batteries', web3.utils.toWei('5', 'ether'), accounts[1]).send({
            from: accounts[0], 
            gas: '1000000'
        }); //creating a request to send some amount of ether to accounts[1] 
        console.log('request for 5 ether created...');

        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        }); //approved the request before finallizing it
        //accounts[0] is the only contributor in this campaign and he's also the manager 
        console.log('request approved...');

        //get balance of receiver before finalize request
        let preBalance = await web3.eth.getBalance(accounts[1]);
        preBalance = web3.utils.fromWei(preBalance, 'ether');
        preBalance = parseFloat(preBalance);
        console.log('preBalance of receiver acquired...');
        console.log('preBalance = ', preBalance);
        
        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        }); //here we use accounts[0] because it is the manager and only manager can call finalizeRequest() function/method 
        console.log('request finalized...');

        // Note:  ganache initialises accounts with 100 ether each time
        let postBalance = await web3.eth.getBalance(accounts[1]); //after calling finalizeRequest() accounts[1] should've recevied some amount of ether, we are checking if that's the case 
        // 'web3.eth.getBalance(accounts[1])' this returns a string to assert() it we need to change it into ether then to a number
        postBalance = web3.utils.fromWei(postBalance, 'ether');
        postBalance = parseFloat(postBalance); //parseFloat is a built in JS function that turns strings into decimal numbers
        if(postBalance > preBalance) { 
            console.log('request paid...'); 
        };
        console.log('transaction postBalance = ', postBalance);
        assert(postBalance > 104); //we are doing this because some of it gets used up in gas so exactly 105 nahi hoga
    });
});
