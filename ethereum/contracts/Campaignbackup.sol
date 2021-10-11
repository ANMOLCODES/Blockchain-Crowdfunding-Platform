pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;
    
    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender); //creates new instance of the contract that gets deployed to the blockchain and returns an address which we store in a variable called 'newCampaign' of type 'address'
        deployedCampaigns.push(newCampaign); //pushing address of new Campaign into the deployedCampaigns address array
        
    }
    
    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign{
    struct Request { //use capital letters to define struct, for eg: 'Request', not 'Request' is like any other data type in solidity
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount; //number of approvals or number of people who vote 'yes'. we are not recording no's and not approved because they are equivalent
        mapping(address => bool) approvals; //to check if a person has voted has already voted on a given request or nah
    }
    
    Request[] public requests; //'Request' now acts like any other data type in solidity, 'requests' is a variable of type array of 'Request'
    address public manager; //'manager' variable is of address type, is public, anyone can view, necessary for a crowd funding campaign to have transparency
    uint public minimumContribution;
    // address[] public approvers;
    mapping(address => bool) public approvers;
    uint public approversCount; //everytime someone donates to the campaign we arre going to increment the approvers approversCount
    
    modifier restricted() {
        require(msg.sender == manager); //purpose of this whole modifier is to restrict access to certain functions, that only the manager can call
        _; //this virtually kind of places the code from other functions which have 'restricted' keyword present in their function declaration
    }
    
    
    function Campaign(uint minimum, address creator) public {  //constructor function
        manager = creator;//msg is global variable, 'msg.sender' is used to assign the address of the person who is creating the contract and assigning it to 'manager' variable
        minimumContribution = minimum;
        
    }
    
    function contribute() public payable {
        require(msg.value>minimumContribution); //to make sure that the transaction that user creates is greater than the minimumContribution
        // approvers.push(msg.sender); //we push the address of the person that has initiated this transaction in the 'approvers' array if their amount is greater than minimumContribution
        approvers[msg.sender] = true;//'msg.sender' gets us the address of the user that's accesing the contract rn, it's of type address, so it's the 'key' to mapping 'approvers', we sit it's 'value' as 'true' which is bool
        //so this adds a new 'key' of 'msg.sender' address to the 'approvers' mapping and gives it a 'value' 'true'
        approversCount++; //after adding the contributors address to the approvers mapping, we increment approversCount        
    } 
    
    function createRequest(string description, uint value, address recipient) public restricted { //purpose of createRequest function is to be able to create a new struct of type Request[] and add it to the requests array
        Request memory newRequest = Request({ //created a new struct. 'Request newRequest' new variable named 'newRequest' of 'Request' type. 'Request({})' creates a new instance of a Request
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
            //we did not have to initialise 'approvals' mapping because we only have to initialise value types, we don't have to initialise reference types, aka mappings 
        });
        
        requests.push(newRequest); //pushing 'newRequest' of type struct 'Request' is 'requests' array
    }
    
    function approveRequest(uint index) public { // 'index' arguement is the index of the request we are trying to approve, remember, there are multiple requests created by the manager at once    
        require(approvers[msg.sender]); // if (approvers[msg.sender] return 'True' then only we can proceed. it means that the user with this acc address is a contributor
        require(!requests[index].approvals[msg.sender]); //to check if a particular person has previously voted on a particular request or not, if requests[index].approvals[msg.sender] because !requests[in dex].approvals[msg.sender] will return false, it means that that person has already voted once and should not be able to vote again
        //require statements only allow us to move forward if it gets truth values throws us out of the function if we get false value, so we use '!' in front of the whole condition to kick us out when requests[index].approvals[msg.sender] because !requests[in dex].approvals[msg.sender] will return false
        
        requests[index].approvals[msg.sender] = true; //adding address to approvals mapping and making value as 'true' so that if user tries to approve this specific request at 'requests[index]', it fails at 2nd require statement
         requests[index].approvalCount++; //incrementing approvalCount by one 
        
    }
    
    //alternative
    
    // function approveRequest(uint index) public { // 'index' arguement is the index of the request we are trying to approve, remember, there are multiple requests created by the manager at once    
    //     Request storage request = requests[index]; 
    //     require(approvers[msg.sender]); // if (approvers[msg.sender] return 'True' then only we can proceed. it means that the user with this acc address is a contributor
    //     require(!request.approvals[msg.sender]); //to check if a particular person has previously voted on a particular request or not, if requests[index].approvals[msg.sender] because !requests[in dex].approvals[msg.sender] will return false, it means that that person has already voted once and should not be able to vote again
    //     //require statements only allow us to move forward if it gets truth values throws us out of the function if we get false value, so we use '!' in front of the whole condition to kick us out when requests[index].approvals[msg.sender] because !requests[in dex].approvals[msg.sender] will return false
        
    //     request.approvals[msg.sender] = true; //adding address to approvals mapping and making value as 'true' so that if user tries to approve this specific request at 'requests[index]', it fails at 2nd require statement
    //     request.approvalCount++; //incrementing approvalCount by one 
        
    // }
    
    
    function finalizeRequest(uint index) public restricted {
        require(requests[index].approvalCount > (approversCount/2)); //approvals on a req should be > 50% of total no. of approvers
        require(!requests[index].complete);//to check if a certain request has been completed or not, we cannot finalize a request for the second time so we can only proceed if 'requests[index].complete' return false, but 'require' only moves ahead if it gets true values so we have to add '!' infront of 'requests[index].complete'.
        
        requests[index].recipient.transfer(requests[index].value); //sending the money specified in the request and send it to the recipient/contractor/vendor, 'recipient' is the address of the vendor, because it's of type 'address' it has a property called 'transfer'. 'requests' struct we have been working with has a property 'value', it denotes the amount requested by the manager to send to the vendor in this particular request
        requests[index].complete = true; //marking 'complete' property as 'true' after the finalizeRequest function has been called for a particular index
        
    }
    
    //alternate
    
    // function finalizeRequest(uint index) public restricted {
        // require(request.approvalCount > (approversCount/2));
    //     Request storage request = requests[index]; //the 'Request' here indicates that we're going to create a variable 'request' that is going to refer to 'Request' struct
    //     require(!request.complete);//to check if a certain request has been completed or not, we cannot finalize a request for the second time so we can only proceed if 'requests[index].complete' return false, but 'require' only moves ahead if it gets true values so we have to add '!' infront of 'requests[index].complete'.
    //     request.recipient.transfer(request.value);
    //     request.complete = true;
        
    // }

    function getSummary() public view returns (uint, uint, uint, uint, address) {
        return (
            minimumContribution,
            this.balance,
            requests.length,
            approversCount,
            manager
        );
    }

    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
}





