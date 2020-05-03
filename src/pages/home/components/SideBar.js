import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Form, Checkbox } from 'semantic-ui-react';
import {
  Icon,
  Menu,
} from 'semantic-ui-react'
import './SideBar.scss';
import Notification from './Notification'

const min_logo = `${process.env.PUBLIC_URL}/images/min-logo1.svg`;
const max_logo = `${process.env.PUBLIC_URL}/images/max-logo1.svg`;
const max_logo_black = `${process.env.PUBLIC_URL}/images/max-logo.svg`;
export default class SidebarMenu extends Component {
  /**
   * Defines filter checkbox value
   * @memberof SidebarMenu
   * @param {string} item - status filter
   */
  setValue = (item) => {
    const value = item === 'live' ? 'live,paused' : item
    return value.toUpperCase();
  }
  render() {
    const arrStatus = ['live', 'scheduled', 'draft', 'closed']
    return (
      <React.Fragment>
        <div className={`${!this.props.increaseSidebar ? "sidebar_logo center" : "sidebar_logo"} ${!this.props.handleNotificationVisibility ? 'sidebar_notifications' : ''}`}>
          <Link to='/home'><img className="sidebar_min_logo" src={min_logo} alt='bcio logo' /></Link>
          <Link to='/home'><img className="sidebar_max_logo" src={max_logo} alt='bcio logo' /></Link>
          <img className="sidebar_max_logo_black" src={max_logo_black} alt='bcio logo' />
          <button className={!this.props.increaseSidebar ? 'hidden' : 'notifications_btn'} onClick={this.props.handleNotificationVisibility} disabled={this.props.showNotifications}>
            <div className='notifications_bcg'>
              <div className={`${this.props.unreadNotifications !== 0 ? 'notifications_unread' : 'hidden'}`}>{this.props.unreadNotifications}</div>
              <Icon name='bell outline' />
            </div>
          </button>
        </div>
        <Menu className={!this.props.increaseSidebar ? "sidebar_menu center" : "sidebar_menu"}>
          <Menu.Item className="sidebar_menu_item" as={Link} to="/create-campaign">
            <Icon name='plus' />
            <span className="sidebar_menu_item_title">New</span>
          </Menu.Item>
        </Menu>
        <Form className={this.props.increaseSidebar && !this.props.showNotifications ? 'sidebar_filters' : 'hidden'}>
          <h4 className='sidebar_title'>Campaigns States</h4>
          <div className='sidebar_filter_status'>
            {arrStatus.map((item, index) => <Checkbox label={item} onChange={this.props.getFilterValue} value={this.setValue(item)} key={index}></Checkbox>)}
          </div>
        </Form>
        <div className={this.props.showNotifications ? 'sidebar_notifications' : 'hidden'}>
          <Icon name='chevron circle left' onClick={this.props.handleNotificationVisibility} id='icon_back' />
          <h4 className='sidebar_title notifications'>Notifications</h4>
          {this.props.notifications ? this.props.notifications
            .map((note, index) => <Notification
              key={index}
              campaignId={note.campaignId}
              campaignName={note.Campaign.name}
              notificationId={note.id}
              text={note.text}
              read={note.read}
              date={note.createdAt}
              page={note.Campaign.page.name}
              position={note.Campaign.position.name}
              getNotifications={this.props.getNotifications} />) : ''}
        </div>
        <div className={`sidebar_calendar_link ${this.props.schedulerView ? 'calendar_disabled' : ''}`} onClick={this.props.handleViewScheduler}>
          <Icon name='calendar alternate outline' />
          <p className={this.props.increaseSidebar ? '' : 'hidden'}> View Calendar</p>
        </div>
      </React.Fragment>
    )
  }
}