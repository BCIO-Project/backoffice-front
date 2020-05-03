import React from 'react';
import { Redirect } from 'react-router';
import 'semantic-ui-css/semantic.min.css';
import './CreateCampaign.scss';
import ErrorMessage from './../../components/message/ErrorMessage';
import FormCampaign from './FormCampaign';
import MainHeader from '../../components/header/MainHeader';

/**
 * Container that holds createCampaign form
 */
export default class CreateCampaign extends React.Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      redirectHome: false,
      errorMsg: false,
    }
    this.handleNetworkError = this.handleNetworkError.bind(this);
  }
   
  /**
   * E.g: when saving campaign show error if API response its 500
   * @memberof CreateCampaign
   */
  handleNetworkError(){
    this.setState({errorMsg: true})
  }
  
  render() {
    if (this.state.redirectHome) {
      return <Redirect push to="/" />;
    }
    const buttons = [
      {
        title: 'Save',
        cls: 'btn-save',
        name: 'redirectEdit',
        icon: 'save',
        action: () => {
          this.child.current.createCampaign();
        }
      },
      {
        title: 'Exit',
        cls: 'btn-exit',
        name: 'redirectHome',
        icon: 'times',
        action: () => {
          this.setState({redirectHome:true})
        }
      },
    ]
    return (
      <div className='create-page'>
        <MainHeader title={"New Campaign"} buttons={buttons} />
        <div className='content-wr'>
          <div className='container'>
            <div className='error'>
              <ErrorMessage classes={this.state.errorMsg ? 'bcio errorMessage' : 'hidden'} text='The changes couldn’t be saved due to a network error. Try it again later.'/>
            </div>
            <FormCampaign ref={ this.child } handleNetworkError={this.handleNetworkError} />
          </div>
        </div>
      </div>
    );
  }
}
