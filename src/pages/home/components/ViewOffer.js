import React, { Component } from 'react';
import { Icon, Progress, Label } from 'semantic-ui-react';
import './ViewOffer.scss';
import { HashLink as Link } from 'react-router-hash-link';
import * as offersService from './../../../services/offers.service';
import ErrorMessage from './../../../components/message/ErrorMessage'
/**
 * campaing's offers general information
 */
export default class ViewOffer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: this.props.status,
            error:[]
        }
    }

    /**
     * life cycle React component
     * @param {object} props - new component's props
     */
    componentWillReceiveProps(props) {
        this.setState({status: props.status})
    }

    /**
     * remove ceros and add K to numbers over 1000
     * @memberof ViewOffer
     * @param {number} num - number to change format
     */
    formatter(num) {
        return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'K' : Math.sign(num)*Math.abs(num)
    }

    /**
     * calculate division between a and b and remove decimals of the result
     * @memberof ViewOffer
     * @param {number} a - dividend
     * @param {number} b - divisor
     */
    calculator(a,b) {
        const result = a/b*100
        return result.toFixed(2);
    }

    /**
     * change offers' status button styles when launching/pausing a campaign
     * @memberof ViewOffer
     */
    handleStatus = () => {
        offersService.save('',`${this.props.id}/${this.offerState()}`, this.apiErrors)
        .then((data) => {
            if(data.errors) {
                // store errors in component's state
                this.setState({ error: data.errors })
            } else {
                // update parent's state to receive updated props
                this.props.updateChildProps()
            }
        })
    }

    /**
     * manage API error responses
     * @memberof ViewOffer
     * @param {number} response - API status response
     */
    apiErrors = (response) => {
        if(response >= 500) {
            console.log('500')
        } else if (response === 422) {
            console.log('422')
        }
    }

    /**
     * check offers' status and change it
     * @memberof ViewOffer 
     */
    offerState = () => {
        const { status } = this.state
        if(status === 'PAUSED') {
            return 'launch'
        } else if(status === 'LIVE') {
            return 'pause'
        } 
    }

    /**
     * styling offers' status button
     * @memberof ViewOffer
     */
    handleStatusClass = () => {
        const { status } = this.state
        const commonClass = 'bcio_status z-index'
        const liveDefault = this.props.defaultOffer && this.props.campaignStatus === 'LIVE' ? 'default' : ''
        return `${commonClass} ${status.toLowerCase()} ${liveDefault}`
    }

    /**
     * Asign class to offer's progress range
     * @memberof ViewOffer
     * @param {number} percentage - offer's progress percentage
     */
    handleProgress = (percentage) => {
        const progress = percentage > 75 ? 'high' : percentage <= 75 && percentage >= 25 ? 'medium' : 'low'
        return progress
    }
    /**
     * Calculate offer's progress percentage
     * @memberof ViewOffer
     * @param {number} a - dividend
     * @param {number} b - divisor
     */
    getProgress = (a, b) => {
        const percentage = a > 0 && b !== null ? (a/b)*100 : '0%'
        return percentage
    }
    /**
     * Manage offer's icon status visibility
     * @memberof ViewOffer
     */
    handleIconVisibility = () => {
        const {campaignStatus} = this.props
        const parentStatus = campaignStatus === 'DRAFT' || campaignStatus === 'CLOSED'
        const showTooltip = parentStatus || this.state.status === 'PAUSED' ? 'hidden-icon' : ''
        return showTooltip
    }
    /**
     * show error if it is not possible to launch/pause a campaign
     * @memberof ViewOffer
     */
    handleToggleErrors = () => {
        // filter errors by format, store the ones that have only one key
        const filteredErrors = this.state.error.length ? this.state.error.filter(error => Object.keys(error).length === 1) : []
        const error = filteredErrors.length ? <ErrorMessage classes={this.state.error.length ? 'bcio errorMessage offer' : 'hidden'} text={filteredErrors.map(error => error.msg)}/> : ''
        return error
    }
    render() {
        const { campaignId, id, name, headline, url, goal, clicks, impressions, image, defaultOffer, campaignStatus } = this.props;
        const { status } = this.state
        const liveDefault = status === 'LIVE' && defaultOffer && campaignStatus === 'LIVE'
        return (
            <React.Fragment>
                {this.state.error.length ? this.handleToggleErrors() : ''}
                <div className='offer' data-qa={name}>
                    <div className='offer_info_container'>
                        <div className='offer_image  z-index' style={image !== null ? { backgroundImage: `url(${image})` } : {backgroundColor: '#d8d8d8'} }>
                            <div className={defaultOffer === true ? 'offer_default' : 'hide'}>
                                <Icon name='lock'></Icon>
                            </div>
                        </div>
                        <div className='offer_content'>
                            <div className='offer_content_text z-index'>
                                <h3 className='offer_title'>{name}</h3>
                                <h4 className='offer_subtitle'>{headline}</h4>
                                <p className='offer_url'>{url}</p>
                            </div>
                            <Link to={`/modify-campaign/${campaignId}#${id}`} className="ui button bcio_button_edit z-index" onClick={this.props.editCampaign} data-qa='offer-edit'>
                                <Icon.Group className={`offer_icon_group ${campaignStatus === 'CLOSED' ? '' : status === 'DRAFT' ? status.toLowerCase() : ''}`}>
                                    <Icon name={campaignStatus === 'CLOSED' ? 'eye' : 'pencil'}/>
                                    <Icon corner='top right' name={status === 'DRAFT' ? 'exclamation circle' : 'check circle'} id={this.handleIconVisibility()} />
                                    <Label basic pointing='above' data-qa='offer-label'>This offer may have some empty fields that wouldn’t allow you to launch it</Label>
                                </Icon.Group>
                            </Link>
                        </div>
                    </div>
                    <div className='offer_status_container'>
                        <div className={`left ${campaignStatus === 'CLOSED' ? 'progress_closed' : ''}`}>
                            <div className='offer_progress'>
                                <p>{`${this.formatter(clicks)} / ${this.formatter(goal)} clicks`}</p>
                                <p>{clicks > 0 && goal !== null ? this.calculator(clicks, goal) + '%' : '0%'}</p>
                            </div>
                            <Progress className={this.handleProgress(this.getProgress(clicks, goal))} percent={this.getProgress(clicks, goal)}/>
                            <div className='offer_status_info'>
                                <div>
                                    <p>CTR</p>
                                    <p>{isNaN(this.calculator(clicks,impressions)) ? '0%' : this.calculator(clicks,impressions) + '%'}</p>
                                </div>
                                <div>
                                    <p>Viewed pages</p>
                                    <p>{this.formatter(impressions)}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className={campaignStatus === 'CLOSED' ? 'hidden' : this.handleStatusClass()}>
                                <Icon size='big' id={status === 'DRAFT' || liveDefault ? 'hidden-icon' : 'status-icon'} name={status === 'LIVE' ? 'pause circle' : 'play circle'} onClick={this.handleStatus} data-qa='offer-toggle'>
                                    <div className='toggle_bcg'></div>
                                </Icon>
                                {status ? this.props.transformText(status) : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
