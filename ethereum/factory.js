import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    '0xE8f11a359c731770e8CC5eCFbcCF9F51eabe9464'
);

export default instance;