import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    '0x61ad5dBC524d35E2096bc2C71fCBd78845F66ab5'
);

export default instance;