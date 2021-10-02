const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const compiledFactory = require('./build/CampaignFactory.json');
//go into build directory and find that json file and assign all that to 'compiledFactory'

const provider = new HDWalletProvider(
    "velvet flush frame merry know coil gossip announce thing spell disease host",

    "https://rinkeby.infura.io/v3/6cb3c1fc47eb46f593c13d6385b1c222"

);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log("Attempting to deploy from account", accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ gas: '1000000', from: accounts[0], gasPrice: '50000000000' });

    console.log("Contract deployed to", result.options.address);
};
deploy();
