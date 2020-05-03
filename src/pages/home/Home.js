import React, { Component } from 'react'
import {
  Icon
} from 'semantic-ui-react'
import InfiniteScroll from 'react-infinite-scroller';
import MainHeader from '../../components/header/MainHeader'
import SideBar from './components/SideBar'
import Campaign from './components/Campaign'
import * as campaignService from '../../services/campaign.service';
import * as notificationsService from './../../services/notifications.service';
import './Home.scss';
import ErrorMessage from '../../components/message/ErrorMessage';
import ToggleError from './../../components/message/ToggleError';
import { Link } from 'react-router-dom'
const queryString = require('query-string');

export default class Home extends Component {
  constructor(props){
    super(props);
    this.menuRef = React.createRef()
    this.toggleRef = React.createRef()
  }
  state = {
    increaseSidebar: true,
    page: 1,
    filterMsg: false,
    errorMsg: false,
    filters: {
      status: [],
    },
    filteredCampaigns:[],
    loadingError: false,
    showNotifications: false,
    notifications: [],
    unreadNotifications: null,
    singleCampain: false,
  }

  /**
   * life cycle React component
   */
  componentDidMount(){
    const { id } = this.props.match.params
    // if there is a campaign id in params only fetch that campaign
    if(id) {
      this.loadSingleCampaign(id)
    } else {
      try{
        this.loadFilteredCampaigns();
      }catch(error) {
        this.setState({ loadingError: true })
      }
    }
    this.getNotifications();
  }

  /**
   * life cycle React component
   */
  componentDidUpdate(){
    const { id } = this.props.match.params
    // if the url changes from /home/:id to /home fetch all campaigns
    if(!id && !!this.state.singleCampaign) {
      try{
        this.loadFilteredCampaigns();
      }catch(error) {
        this.setState({ loadingError: true })
      }
    } 
  }

  /**
   * determine when to load campaigns
   * @memberof Home
   * @param {object} prevState - Component's previous state
   */
  setCampaignFetchPage(prevState){
    this.setState({
      page: this.compareStates(prevState) ? this.state.page: 1,
    }, this.loadFilteredCampaigns)
  }

  /**
   * compare filters' previous state to its actual state
   * @memberof Home
   * @param {object} prevState - Component's previous state
   */
  compareStates(prevState){
    return JSON.stringify(prevState.filters.status) === JSON.stringify(this.state.filters.status);
  }

  /**
   * Load campaigns after delete/clone campaign
   * @memberof Home
   */
  loadCampaignAfterChangeCampaign(){
    this.setState({
      page: (this.state.page-1),
    }, this.loadFilteredCampaigns)
  }

  /**
   * fetch only one campaign
   * @memberof Home
   */
  loadSingleCampaign = (id) => {
    campaignService.get(`${id}`)
    .then((data) => {
        const singleCampaing = this.state.filteredCampaigns.concat(data)
        this.setState({
          filteredCampaigns: singleCampaing,
          singleCampaign: true,
        })
    })
  }

  /**
   * show and hide sidebar section
   */
  handleAnimationChange(){
    const oldState = this.state.increaseSidebar
    this.setState({ increaseSidebar: !oldState })
  }

  /**
   * fetch and load campaigns
   * @memberof Home
   */
  loadFilteredCampaigns = () => {
    // transform filters data's format and send it to API
    const filters = queryString.stringify(this.state.filters, {arrayFormat: 'bracket'});
    campaignService.get('','', `?page=${this.state.page}${this.state.filters.status.length ? '&' + filters : ''}`)
    .then(data => {
      this.setState((prevState)=>{
        // store campaings in component's state, determining if there's need to load another page
        return {
          filterMsg: false,
          filteredCampaigns: this.state.page === 1 ? data : [...prevState.filteredCampaigns, ...data],
          hasMore: data.length === 15 ? true : false,  
          page: this.state.page + 1,
          singleCampaign: false,
        }
      })
      // if there are no campaigns show informative message
      if(!data.length && !this.state.filteredCampaigns.length) {
        this.setState({ filterMsg : true })
      }
    })
  }

  /**
   * manage filters checkbox value
   * @memberof Home
   * @param {object} e - onChange event in input
   * @param {object} data - input's information
   */
  getFilterValue(e, data){
    this.props.history.push('/home')
    const checked = data.checked;
    // separte values if there is more than one
    const value = data.value.split(',');
    const prevStatus = {...this.state}
    this.setState(prevState => {
      return {
        filters: {
          ...prevState.filters,
          // if checked store input value in component's state, else remove the value from state
          status: checked ? this.state.filters.status.concat(value) : this.state.filters.status.filter(item => !value.includes(item))
        }
      }
    }, this.setCampaignFetchPage.bind(this, prevStatus))
  }

  /**
   * render campaign's component
   * @memberof Home
   * @param {object} campaign - campaign's data
   * @param {number} index - campaign's index position
   */
  getCampaign(campaign, index){
    return <Campaign
            key={index}
            campaignId={campaign.id}
            title={campaign.name}
            page={campaign.page.name}
            status={campaign.status}
            start={campaign.from}
            end={campaign.to}
            handleError={this.handleError.bind(this)}
            position={campaign.position.name}
            showToggleError={this.showToggleError}
            singleCampaign={this.props.match.params.id}
            loadCampaignAfterChangeCampaign={this.loadCampaignAfterChangeCampaign.bind(this)}>
          </Campaign>
  }

  /**
   * E.g: when saving campaign show error if API response its 500
   * @memberof Home
   */
  handleError(){
    this.setState({errorMsg: true})
  }

  /**
   * show and hide sidebar menu on mobile
   * @memberof Home
   */
  handleMobileMenu = () => {
    this.menuRef.current.classList.toggle('mobile')
    this.setState({ showNotifications: false })
  }

  handleNotificationVisibility = () => {
    this.setState({ showNotifications: !this.state.showNotifications }, this.getNotifications())
  }

  /**
   * fetch notifications and store them in component's state
   * @memberof Home
   */
  getNotifications = () => {
    notificationsService.get()
    .then(data => {
      this.setState({ notifications: data.notifications, unreadNotifications: data.totalUnread})
    })
  }

  /**
   * store campaign's toggle errors
   * @param {array || object} msg - campaign's toggle errors or warnings
   * @memberof Home
   */
  showToggleError = (msg) => {
    this.toggleRef.current.child(msg)
  }

  /**
   * redirect to campaigns calendar
   * @memberof Home
   */
  handleViewScheduler = () => {
    this.props.history.push('/calendar')
  }

  render() {
    const { increaseSidebar, hasMore, filteredCampaigns, filterMsg, showNotifications } = this.state
    return (
      <section className="home_page">
        <button className='home_page_mobile_menu' onClick={this.handleMobileMenu} data-qa='home-mobile-sidebar'>
            <Icon name='align justify'/>
        </button>
        <button className='notifications_btn mobile' onClick={this.handleNotificationVisibility}>
            <div className='notifications_bcg'>
              <div className='notifications_unread'>{this.state.unreadNotifications}</div>
              <Icon name='bell outline' />
            </div>
        </button>
        <aside className={`home_page_sidebar ${increaseSidebar ? 'open':''} ${showNotifications ? 'notifications' : ''}`} ref={this.menuRef}>
          <Icon onClick={()=>{this.handleAnimationChange()}} className={`togglerMenu ${increaseSidebar ? 'open':''} ${showNotifications ? 'hidden':''}`} circular name={increaseSidebar ? 'chevron left' : 'chevron right'} data-qa='home-desktop-sidebar'></Icon>
          <SideBar
            increaseSidebar={increaseSidebar}
            getFilterValue={this.getFilterValue.bind(this)}
            showNotifications={this.state.showNotifications}
            handleNotificationVisibility={this.handleNotificationVisibility}
            unreadNotifications={this.state.unreadNotifications}
            notifications={this.state.notifications}
            getNotifications={this.getNotifications}
            handleViewScheduler={this.handleViewScheduler}
            />
        </aside>
        <Link to='/create-campaign'>
          <div className='link_create_mobile'>
            <Icon name='add' />
          </div>
        </Link>
        <article className={`home_page_container ${increaseSidebar ? 'open':''}`}>
          <MainHeader className="home" logoHidden={true}></MainHeader>
          <div className="home_page_container_list">
            <InfiniteScroll
              pageStart={0}
              loadMore={this.loadFilteredCampaigns}
              hasMore={hasMore}
              loader={<div className="loader" key={0}>Loading ...</div>}
              useWindow={false}
            >
              <ErrorMessage classes={this.state.errorMsg ? 'bcio errorMessage' : 'hidden'} text='The changes couldn’t be saved due to a network error. Try it again later.' />
              <ErrorMessage classes={this.state.loadingError ? 'bcio errorMessage' : 'hidden'} text='Something went wrong, please try to reload the page or contact your administrator' />
              <ErrorMessage classes={filterMsg? 'bcio errorMessage' : 'hidden'} text='There are no campaigns registered' />
              <ToggleError ref={this.toggleRef}/>
              {
              filterMsg ? '' : filteredCampaigns.map((campaign, index) => this.getCampaign(campaign,index))
              }
            </InfiniteScroll>
          </div>
        </article>
      </section>
    )
  }
}
