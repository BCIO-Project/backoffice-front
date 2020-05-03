import React, { Component } from 'react';
import { Form, Label, Icon } from 'semantic-ui-react';
import './CreateCampaign.scss';
import * as pagesService from './../../services/pages.service';
import * as campaignService from './../../services/campaign.service';
import Calendar from './../../components/calendar/Calendar';
import { Redirect } from 'react-router';
import Modal from './../../components/modal/Modal';
import ErrorMessage from './../../components/message/ErrorMessage';

/**
 * Create campaign form
 */
export default class FormCampaign extends Component {
  constructor(props) {
    super(props);
    this.childInput = React.createRef();
    this.state = {
      name: '',
      startDate: '',
      endDate: '',
      page: '',
      optionPages: [],
      position: '',
      optionPositions: [], 
      error: '',
      redirectEdit: false,
      loadingError: false,
      modal:{
        open:false
      },
    }

    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * life cycle React component 
   */
  componentDidMount() {
    try{
      // fetch pages options to show in select
      pagesService.getList()
        .then((data) => {
          this.setState({
            optionPages: data
              .map(data => ({ 
                key: data.id, 
                value: data.name, 
                text: data.name, 
                id: data.id }))
              })
        }) 
    }catch(error) {
      this.setState({ loadingError: true })
    }
  }

  /**
   * life cycle React component
   * @param {object} prevProps 
   * @param {object} prevState 
   */
  componentDidUpdate(prevProps, prevState) {
    // fetch positions options each time the user selects a different page
    if (prevState.page !== this.state.page && this.state.page !== ''){
      pagesService.getList(`/${this.state.page}/positions`)
      .then((data) => {
          this.setState ({           
            optionPositions: data
              .map(data => ({ 
                key: data.id, 
                value: data.name, 
                text: data.name, 
                id: data.id }))
              })
        })
    }
  }
  
  /**
   * recover date values and save them in component's state
   * @memberof FormCampaign
   * @param {string} name - The date input's name.
   * @param {object} date - The date's value.
   */
  handleDateChange = (date, name) => {
    this.setState({[name]: date})
  };

  /**
   * recover page, position and title values and save them in component's state
   * @memberof FormCampaign
   * @param {object} event - The onChange input's event. 
   */
  handleChange (e) {
    const updateState = { [e.target.name]: e.target.value }
    // set position to empty string whenever the user changes the page to avoid sending a previous selected position by mistake
    const pageUpdate = e.target.name === 'page'? updateState['position'] = '' : '';  // eslint-disable-line no-unused-vars
    this.setState (updateState)
  }

  /** 
   * send campaign data stored in component's state to API
   * @memberof FormCampaign
   */
  createCampaign() {
    const rawData = {...this.state}
    const body = { 
      name: rawData.name,
      ...((rawData.page !== '') && { pageId: rawData.page }),
      ...((rawData.position !== '') && { positionId: rawData.position }),
      ...((rawData.endDate !== '') && { to: rawData.endDate.toISOString() }),
      ...((rawData.startDate !== '') && { from: rawData.startDate.toISOString() }),
    };
    campaignService.save('',body,'',this.apiErrors)
      .then((jsonObject) => {
        // if there are required fields errors show them
        jsonObject.errors ? this.setState({ error: jsonObject.errors}) : this.setState({ error : ''})
        // if there are no errors check for warnings
          if(!jsonObject.errors) {
            this.conditionalCampaignCreate(jsonObject)
          } 
        })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * check if there are warnings when saving
   * @memberof FormCampaign
   * @param {object} jsonObject - The json from API response. 
   */
  conditionalCampaignCreate = (jsonObject) => {
    // if there are collisions with another campaign show modal with warnings
    if(jsonObject.warning) {
      this.setState({
        modal:{
          ...this.state.modal,
          open: true,
          closeException: true,
          text: `Warning: You have created a campaign that has overlapping dates with another campaign`,
          optionalText: `${jsonObject.warning}`,
          textAccept: 'Continue',
          classes: '',
          action: ()=>{
            this.setCampaign(jsonObject)
          }
      }})
    // if there are no collisions
    } else {
      this.setCampaign(jsonObject)
    }
  }

  /** save campaign data and redirect to editCampaign view
   * @memberof FormCampaign
   * @param {object} jsonObject - The json from API response.
   */
  setCampaign = (jsonObject) => {
    this.setState({ 
      redirectEdit: true,
      response: {
        ...jsonObject
      }
    })
  }

  /** set state in parent component to show network error
   * @memberof FormCampaign
   * @param {number} response - The response status from API
   */
  apiErrors = (response) => {
    if(response >= 500) {
      this.props.handleNetworkError()
    } 
  }

  /** show label with errors in inputs
   * @memberof FormCampaign
   * @param {string} name - The input's name
   */
  handleError(name) {
    if(this.state.error !== '') {
      // match each error to its corresponding input
      const fieldError = this.state.error.filter(error => error.param === name)
      // show all input errors returned from API response
      if(fieldError && fieldError.length > 0) {
        const errors = fieldError.map((error, index) => <p key={index}>{error.msg}</p>)
        return <Label basic pointing='above'>{errors}</Label>
      } 
    } 
  }
         
  render() {
    if (this.state.redirectEdit) {
      const {id} = this.state.response.campaign
      return <Redirect push to={{
        pathname: `/modify-campaign/${id}`,
        state:{
          ...this.state.response
        }
      }} />;
    } 
    const { modal } = this.state
    return (
      <div className="form-container">
        <Form id='create-campaign' >
          <Form.Group widths='equal'>
            <Form.Field className='required'>
              <Icon name='asterisk' className='required-note'/>
              <select name="page" id="page" onChange={this.handleChange} required className='bcio'>
                <option value=''>Select Page</option>
                {this.state.optionPages
                  .map(option => <option value={option.id} key={option.key}>{option.value}</option>)}
              </select>
              {this.handleError('pageId')}
            </Form.Field>
            <Form.Field className='required position'>
              <Icon name='asterisk' className='required-note'/>
              <select name="position" id="position" onChange={this.handleChange} required className='bcio'>
                <option value=''>Select Position</option>
                {this.state.optionPositions
                  .map(option => <option value={option.id} key={option.key}>{option.value}</option>)}
              </select>
              {this.handleError('positionId')}
            </Form.Field>
            <Form.Field className='required'>
              <Form.Input
                className='bcio'
                onChange={this.handleChange}
                fluid placeholder='Campaign Title'
                field='name' id='name'
                name='name'
                icon='asterisk'
                required />
              {this.handleError('name')}
            </Form.Field >
            <Calendar 
              handleDateChange={(date) => {this.handleDateChange(date, 'startDate')}} 
              placeholder='00/00/0000' 
              field='startDate' 
              name='startDate' 
              value={this.state.startDate}
            />
            <Calendar 
              handleDateChange={(date) => {this.handleDateChange(date, 'endDate')}} 
              placeholder='00/00/0000' 
              field='endDate' 
              name='endDate' 
              value={this.state.endDate}
            />
          </Form.Group>
          <div className='bcio-label to'>
            {this.handleError('to')}
          </div>
        </Form>
        <p className='form-note'><Icon name='asterisk'/>Required to launch</p>
        <ErrorMessage classes={this.state.loadingError ? 'bcio errorMessage' : 'hidden'} text='Something went wrong, please try to reload the page or contact your administrator' />
        <Modal 
          open={modal.open} 
          text={modal.text}
          optionalText={modal.optionalText}
          title={modal.title}
          action={modal.action}
          textClose={modal.textClose}
          textAccept={modal.textAccept}
          classes={modal.classes}
          closeException={modal.closeException}
          scope={this}
          />
      </div>
    )
  }
}