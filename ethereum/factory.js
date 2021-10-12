import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    '0x0EadD2ADa41A59e7A00D1D98372b57D9D42e78C4'
);

export default instance;