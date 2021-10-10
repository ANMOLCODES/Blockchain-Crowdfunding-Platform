import React, { Component } from 'react';
import {Form, Button, Input, Message} from 'semantic-ui-react';
import Layout from '../../components/Layout';
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3';
import {Router} from '../../routes';

class CampaignNew extends Component {
    state = {
        minimumContribution: '',
        errorMessage: '',
        loading: false
    };
    
    //wehenever we call a function on a contract it's always going to be async in nature
    onSubmit = async (event) => {
        event.preventDefault();

        this.setState({ loading: true, errorMessage: '' });

        try {
            const accounts = await web3.eth.getAccounts(); 
            await factory.methods.createCampaign(this.state.minimumContribution)
                .send({
                    from: accounts[0] 
                });
            Router.pushRoute('/');
        } catch (err) {
            this.setState({ errorMessage: err.message }); //'err' variable is a thrown error, 'message' is a property of it, it is a string that can be safely printed into our component, it is not human readable types but it does show the error on the screen to users
        }

        this.setState({loading: false});

    };

    render() {
        return (
            <Layout>
                <h3>Create a Campaign</h3>
                <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}> 
                    <Form.Field>
                        <label>Minimum Contribution</label>
                        <Input
                            placeholder='idk vro something like 0.1 wei' 
                            labelPosition='right' 
                            label='wei'
                            value={this.state.minimumContribution}
                            onChange={event => this.setState({ minimumContribution: event.target.value })}
                        />
                    </Form.Field>

                    <Message error header="Oops!" content={this.state.errorMessage} />

                    <Button loading={this.state.loading} primary>Create!</Button>
                </Form>
            </Layout>
        
        );
    }
}

export default CampaignNew;