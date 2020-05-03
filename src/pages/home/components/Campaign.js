import React from 'react';
import './Campaign.scss'
import { Button, Icon } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom'
import * as campaignService from './../../../services/campaign.service';
import ViewOffer from './ViewOffer';
import * as notificationsService from './../../../services/notifications.service';
import Modal from './../../../components/modal/Modal';
/**
 * campaing's general information
 */
export class Campaign extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accordionClicked: this.props.singleCampaign ? true : false,
            statusClicked: false,
            campaignOffers: [],
            status: this.props.status,
            warning: '',
            styleToggle: 'status-icon',
            error: [],
            modal:{
                open:false
              }
        }
        this.editCampaign = this.editCampaign.bind(this)
        this.deleteCampaign = this.deleteCampaign.bind(this)
        this.handleStatus = this.handleStatus.bind(this)
        this.campaignState = this.campaignState.bind(this)
        this.cloneCampaign = this.cloneCampaign.bind(this)
    }

    /**
     * life cycle React component
     */
    componentDidMount() {
        if (this.props.singleCampaign) {
            this.getOffers()
        }
    }

    /**
     * life cycle React component
     * @param {object} prevProps - Component's previous props
     * @param {object} prevState - Component's previous state
     */
    componentDidUpdate(prevProps, prevState) {
        const conditionalAccordion = prevState.accordionClicked !== this.state.accordionClicked && !!this.state.accordionClicked
        const conditionalStatus = prevState.statusClicked !== this.state.statusClicked
        if (conditionalAccordion || conditionalStatus) {
            this.getOffers()
        }
        const conditionalParam = prevProps.singleCampaign !== this.props.singleCampaign && !!!this.props.singleCampaign
        if (conditionalParam) {
            this.setState({
                accordionClicked: false
            })
        }
    }

    /**
     * life cycle React component
     * @param {object} props - new component's props
     */
    componentWillReceiveProps(props) {
        this.setState({ status: props.status })
    }

    /**
     * get campaign offers
     */
    getOffers = () => {
        campaignService.get(`/${this.props.campaignId}/offers`)
            .then((data) => {
                this.setState({
                    campaignOffers: data,
                    statusClicked: false
                })
            })
    }
    /**
     * change parent's state to update props passed to child component
     * @memberof Campaign
     */
    updateChildProps = () => {
        this.setState({ statusClicked: true });
    }

    /**
     * open and close accordion
     * @memberof Campaign
     */
    toggleAccordion() {
        const accordionClicked = !this.state.accordionClicked;
        this.setState({ accordionClicked });
    }

    /**
     * change campaign's status button styles when launching/pausing a campaign
     * @memberof Campaign
     */
    handleStatus() {
        campaignService.save(`${this.props.campaignId}`, '', this.campaignState(), this.apiErrors)
            .then((data) => {
                // if there are errors store them in component's state
                if (data.errors) {
                    this.props.showToggleError(data.errors)
                } else {
                    //if there are no errors send action to API but show message if there are warnings
                    this.props.showToggleError(data.warning)
                    campaignService.get(`${this.props.campaignId}`)
                        .then((data) => {
                            this.setState({ status: data.status })
                        })
                }
                this.forceUpdate()
            })
    }


    /**
     * Delete campaign
     * @memberof Campaign
     */
    deleteCampaign() {
        const {campaignId} = this.props
        this.showMessageBefore({
            text: 'You are about to delete this campaign. Are you sure?',
            callback: ()=>{
                campaignService.erase(`${campaignId}`, '', '', this.apiErrors)
                .then((data) => {
                    if(data.errors) {
                        this.setState({ error: data.errors })
                    } else {
                        notificationsService.get(`/campaign/${this.props.campaignId}/`)
                        .then((data) => {
                            if(data.errors) {
                                this.setState({ error: data.errors })
                            } else {
                                data.notifications.forEach(notification => {
                                    notificationsService.erase(`${notification.id}`)
                                });
                            }
                        })
                        this.props.loadCampaignAfterChangeCampaign();
                    }
                })
            }
        })
    }

    /**
     * clone campaign
     * @memberof Campaign
     */
    cloneCampaign() {
        this.showMessageBefore({
            text: 'You are about to clone this campaign. Are you sure?',
            callback: ()=>{
                campaignService.clone(`${this.props.campaignId}`,this.apiErrors)
                .then((data) => {
                // if there are errors store them in component's state
                if(data.errors) {
                    this.props.showToggleError(data.errors)
                } 
                this.props.loadCampaignAfterChangeCampaign();
                })
            }
        })
    }

    /**
     * handle show msg before
     * @param {object} options
     * @memberof ModifyCampaign
     */
    showMessageBefore(options){
        const {callback, text}=options
        this.setState({ modal:{
            ...this.state.modal,
            open: true,
            title: 'Warning',
            text: text || '',
            textClose: 'No',
            classes: '',
            action:()=>{
                callback()
            }
        }
        })
    }


    /**
     * check campaign's status and change it
     * @memberof Campaign
     */
    campaignState() {
        const { status } = this.state
        if (status === 'PAUSED') {
            return 'launch'
        } else if (status === 'LIVE' || status === 'SCHEDULED') {
            return 'pause'
        }
    }

    /**
     * manage API error responses
     * @memberof Campaign
     * @param {number} response - API status response
     */
    apiErrors = (response) => {
        if (response >= 500) {
            this.props.handleError()
        } else if (response === 422) {
            this.setState({ accordionClicked: true })
        }
    }

    /**
     * styling campaign's status button
     * @memberof Campaign
     */
    handleStatusClass = () => {
        const { status } = this.state
        const commonClass = 'bcio_status z-index'
        return `${commonClass} ${!!status ? status === 'CLOSED' ? 'b-closed' : status.toLowerCase() : ''}`
    }

    /**
     * Redirect to edit campaign view
     * @memberof Campaign
     */
    editCampaign() {
        const { campaignId } = this.props
        this.props.history.push(`/modify-campaign/${campaignId}`)
    }

    /**
     * change dates format
     * @memberof Campaign
     * @param {string} date - campaign's dates
     */
    formatDate(date) {
        const campaignDate = new Date(date);
        return campaignDate.toLocaleString()
    }

    /**
     * capitalize status text that comes from API
     * @memberof Campaign
     * @param {string} string - campaign's status text
     */
    transformText = (string) => {
        const capitalizeText = string.charAt(0) + string.slice(1).toLowerCase();
        return capitalizeText
    }

    render() {
        const { title, page, campaignId, position } = this.props
        const { status, modal } = this.state
        let { start, end } = this.props
        return (
            <React.Fragment>
                <div className='campaign' data-qa={title}>
                    <div className="campaign_header">
                        <div className={`mobile-status ${this.handleStatusClass()}`}>
                            <Icon size='big' id={status === 'DRAFT' || status === 'CLOSED' ? 'hidden-icon' : `${this.state.styleToggle}`} name={status === 'PAUSED' ? 'play circle' : 'pause circle'} onClick={this.handleStatus}>
                                <div className='toggle_bcg'></div>
                            </Icon>
                            {status ? status === 'SCHEDULED' ? 'Sched.' : this.transformText(status) : ''}
                        </div>
                        <div className={status === "CLOSED" ? "closed" : status === "PAUSED" ? "c_paused" : "hidden"}></div>
                        <div className="campaign_description">
                            <div className="campaign_title">
                                <p className="title_text">{title}</p>
                            </div>
                            <div className="campaign_category">
                                <p className="campaign_category_text">
                                    {`${page} / ${position}`}
                                </p>
                            </div>
                            <div className="campaign_date">
                                <div className="campaign_date_wrapper">
                                    <p className='left'>{start === null ? '-' : this.formatDate(start)}</p>
                                    <span> | </span>
                                    <p className='right'>{end === null ? '-' : this.formatDate(end)}</p>
                                </div>
                            </div>
                            <div className={`campaign_actions ${status === 'CLOSED' ? 'actions_closed' : ''}`}>
                                <Button className={`bcio_button ${status === 'PAUSED' ? 'z-index' : ''}`} onClick={this.editCampaign.bind(this)} disabled={status === 'CLOSED'} data-qa='campaign-edit'>
                                    <Icon name="pencil" />
                                    Edit
                                </Button>
                                <Button className="bcio_button z-index" data-qa='campaign-clone'  onClick={this.cloneCampaign.bind(this)} >
                                    <Icon name="clone" />
                                    Clone
                                </Button>
                                <Button className="bcio_button z-index" disabled={status === 'LIVE'} onClick={this.deleteCampaign} data-qa='campaign-erase'>
                                    <Icon name="trash alternate" />
                                    Erase
                                </Button>
                                <div className={this.handleStatusClass()}>
                                    <Icon size='big' id={status === 'DRAFT' || status === 'CLOSED' ? 'hidden-icon' : `${this.state.styleToggle}`} name={status === 'PAUSED' ? 'play circle' : 'pause circle'} onClick={this.handleStatus} data-qa='campaign-toggle'>
                                        <div className='toggle_bcg'></div>
                                    </Icon>
                                    {status ? status === 'SCHEDULED' ? 'Sched.' : this.transformText(status) : ''}
                                </div>
                            </div>
                            <span className="campaign_accordion">
                                <div className="campaign_accordion_button" onClick={this.toggleAccordion.bind(this)} data-qa='campaign-accordion'>
                                    <Icon className="z-index" name={`caret ${this.state.accordionClicked ? 'up' : 'down'}`}></Icon>
                                </div>
                            </span>
                        </div>
                    </div>
                    <div className={`campaign_content ${this.state.accordionClicked ? 'campaign_content_open' : ''}`} data-qa='campaign-offers'>
                        {this.state.campaignOffers.length > 0 && this.state.accordionClicked ? this.state.campaignOffers.map(offer =>
                            <ViewOffer
                                key={offer.id}
                                id={offer.id}
                                name={offer.name}
                                headline={offer.headline}
                                description={offer.description}
                                url={offer.offerUrl}
                                goal={offer.goal}
                                status={offer.status}
                                clicks={offer.clicks}
                                impressions={offer.impressions}
                                image={offer.image}
                                editCampaign={this.editCampaign}
                                defaultOffer={offer.defaultOffer}
                                campaignId={campaignId}
                                campaignStatus={this.state.status}
                                updateChildProps={this.updateChildProps}
                                transformText={this.transformText}
                            />
                        ) : this.state.campaignOffers.length === 0 && this.state.accordionClicked ? <div className='campaign_content_open_empty'><h3>No offers registered</h3></div>
                                : ''}
                    </div>
                </div>
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
            </React.Fragment>
        )
    }
}
export default withRouter(Campaign)
