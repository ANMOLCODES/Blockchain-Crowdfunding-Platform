import Web3 from "web3";

let web3;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    //CASE 1: We are in the browser and metamask is running.
    //if 'window' var does not return undefined, meaning it is defined, that means we are running on the browser
    window.ethereum.request({ method: "eth_requestAccounts" });
    web3 = new Web3(window.ethereum);
} 
else {
    //CASE 2: We are on the server *OR* the user is not running metamask
    const provider = new Web3.providers.HttpProvider(
    "https://rinkeby.infura.io/v3/6cb3c1fc47eb46f593c13d6385b1c222"
    );
    web3 = new Web3(provider);
}

export default web3;