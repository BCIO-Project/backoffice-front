import React, { Component } from 'react';
import { Checkbox, Icon } from 'semantic-ui-react';
import * as notificationsService from './../../../services/notifications.service';

export default class Notification extends Component {
    /**
     * manage checkbox value
     * @memberof Notification
     * @param {object} e - onChange event in input
     * @param {object} data - input's information
     */
    handleReadStatus(e, data){
        //if checked or unchecked define action
        const checked = data.checked ? 'read' : 'unread';
        return checked
    }
    
    /**
     * handle read/unread notifications value
     * @memberof Notification
     */
    handleReadChange = (e, data) => {
        notificationsService.save(`${this.props.notificationId}/${this.handleReadStatus(e, data)}`)
        .then(() => {
            // fetch and update notifications
            this.props.getNotifications()
                      
        })
    }

    /**
     * delete notifications
     * @memberof Notification
     */
    handleEraseNotification = () => {
        notificationsService.erase(`${this.props.notificationId}`)
        .then(() => {
            // fetch and update notifications
            this.props.getNotifications()
        })
    }
    render() {
        const { text, read, page, position } = this.props
        return (
            <div className='notification_info'>
                <div className="campaign_category">
                    <p className="campaign_category_text">
                        {`${page} / ${position}`}
                    </p>
                    <div>
                        <Checkbox label='Read' onChange={this.handleReadChange} checked={read}/>
                        <button className='notifications_erase' onClick={this.handleEraseNotification}><Icon name='close'/></button>
                    </div>
                </div>
                <p className='notifications_text'>{text}</p>
            </div>
        )
    }
}
