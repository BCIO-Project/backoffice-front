import React from 'react';
import { connect } from 'react-redux';
import OfferForm from './components/OfferForm';
import { Redirect } from 'react-router';
import './ModifyCampaign.scss';
import { Header, Icon, Label, Message, Loader, Dimmer } from 'semantic-ui-react';
import ErrorMessage from './../../components/message/ErrorMessage';
import MainHeader from '../../components/header/MainHeader';
import * as campaignService from './../../services/campaign.service';
import * as tagsService from './../../services/tags.service';
import * as offersService from '../../services/offers.service';
import Calendar from './../../components/calendar/Calendar';
import Modal from '../../components/modal/Modal';
/**
 * Campaing with its offers' information
 */
export class ModifyCampaign extends React.Component {
    constructor(props) {
        super(props)
        this.props.updateCampaign({id: this.props.match.params.id});
        this.state = {
            redirectHome: false,
            campaignData: '',
            from: null,
            to: null,
            name: '',
            error: [],
            classes: 'bcio errorMessage hidden',
            modal:{
                open:false
            },
            segTags: [],
            docTags: [],
            savedMsg: false, 
            hasBeenSaved: false,
            goalMsg: false,
            collisionMsg: false,
            loadingError: false,
            loading: false,

        }
        // bind component's functions
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleError = this.handleError.bind(this);
        this.getOfferError = this.getOfferError.bind(this);
        this.getTransformedError = this.getTransformedError.bind(this);
        this.isNumberValid = this.isNumberValid.bind(this);
        this.saveCampaign = this.saveCampaign.bind(this);
        this.conditionalSaving = this.conditionalSaving.bind(this);
        this.getTags = this.getTags.bind(this);
        this.launchCampaign = this.launchCampaign.bind(this);
        this.checkState = this.checkState.bind(this);
        this.handleClass = this.handleClass.bind(this);
        this.conditionalLaunch = this.conditionalLaunch.bind(this);
        this.handleSaveMsg = this.handleSaveMsg.bind(this);
        this.showMustSaveMessage = this.showMustSaveMessage.bind(this)
        this.handleStatusClass = this.handleStatusClass.bind(this)
    }
    /**
     * life cycle React component
     */
    componentDidMount() {
        try {
            campaignService.get(`${this.props.match.params.id}`)
                .then((data) => {
                    if(!data.errors){
                        this.props.updateCampaign({hasBeenSaved: true})
                        this.setState({
                            campaignData: data,
                            from: !!data.from ? new Date(data.from) : null,
                            to: !!data.to ? new Date(data.to) : null,
                            name: !!data.name ? data.name : '',
                        }, this.fetchOffers)
                        this.props.updateCampaign({
                            name: this.state.name,
                            to: this.state.to,
                            from: this.state.from,
                        })
                    }
                })
            this.getTags('/segmentation', 'segTags')
            this.getTags('/thematic', 'docTags')
        }catch(error) {
            this.setState({ loadingError: true })
        }
    }
    componentWillReceiveProps(props){
        const {hasBeenSaved} = props.campaign;
        if(hasBeenSaved !== undefined && this.state.hasBeenSaved !== hasBeenSaved){
            this.setState({hasBeenSaved: props.campaign.hasBeenSaved})
        }
    }
    /**
     * Fetch campaign's offers
     * @param {object} resolve
     * @memberof ModifyCampaign
     */
    fetchOffers(resolve = null){
        campaignService.get(`${this.props.match.params.id}/offers`)
            .then((data) => {
                // remove null values
                if (data.length) {
                    const offersCleaned = data.map(offer => {
                        return this.deleteNullProperties(offer)
                    })
                    const clearDocsAndTags = offersCleaned.map(offer => this.cleanArrays(offer))
                    this.props.updateOffers(clearDocsAndTags)
                }else{
                    this.props.addOffer()
                }
                if(resolve){
                    resolve(data)
                }
        })
    }

    /**
     * Handle tags arrays data
     * @param {object} offer - Offer's information
     * @memberof ModifyCampaign
     */
    cleanArrays(offer){
        offer.documentationTags = !!offer.documentationTags ? offer.documentationTags.length ? offer.documentationTags.map(tag => isNaN(tag) ? tag.id : tag) : [] : [];
        offer.segmentationTags = !!offer.segmentationTags ? offer.segmentationTags.length ? offer.segmentationTags.map(tag => isNaN(tag) ? tag.id : tag) : []: [];
        return offer
    }

    /**
     * Fetch tags options from API and store them in component's state
     * @param {string} url
     * @param {string} name
     * @memberof ModifyCampaign
     */
    getTags(url, name, callback=null){
        const afterSetState = callback ? callback : ()=>{};
        tagsService.get(url)
            .then((data) => {
                this.setState({
                    [name]: data.map(tag => {return {id: tag.id, name: tag.name, description: tag.description}})
                }, afterSetState);
        })
    }

    /**
     * Update campaign's information
     * @memberof ModifyCampaign
     */
    saveCampaign() {
        return new Promise((resolve, reject) => {
            // delete all campaign dates' values equal to null
            if(this.props.campaign.from === null) {
                delete this.props.campaign.from
            } else if(this.props.campaign.to === null) {
                delete this.props.campaign.to
            }
            const offers = this.props.campaign.offers.map(offer => {
                delete offer.sizes
                delete offer.campaign
                return offer
            });
            // store campaign's information in variable
            const campaign = {
                ...this.props.campaign,
                offers
            }
            // patch campaign's information
            campaignService.update(`${this.props.match.params.id}`, {...campaign},'',this.apiErrors).then((data) => {
                // check conditionals to save campaign
                this.conditionalSaving(data, resolve, reject)
            })
        })
    }

    /**
     * remove offer's null properties
     * @param {object} element - Offer data
     * @memberof ModifyCampaign
     */
    deleteNullProperties(element) {
        const keys = Object.keys(element)
        keys.map(key => {
            if (element[key] === null || element[key].length === 0) {
                delete element[key];
            } 
            return key
        })
        return element;
    }

    /**
     * life cycle React component
     */
    componentWillUnmount(){
        this.props.destroyCampaign();
    }

    /**
     * Check campaign's saving conditionals
     * @param {object} data - Campaign's data
     * @param {function} resolve
     * @param {function} reject
     * @memberof ModifyCampaign
     */
    conditionalSaving(data, resolve, reject) {
        const collisions = data.warning ? data.warning : '';
        //if there are errors show errors
        if(data.errors) {
            this.setState({ error: data.errors }, this.handleScroll)
            this.handleSaveMsg()
            reject(data)
        // if there are no errors and goal value is lower than 1000 show warnings(checking if there are collisions with another campaign)
        }else if(!!!data.errors && !this.isNumberValid()){
        this.fetchOffers(resolve)
        this.setState({ goalMsg: true, savedMsg: true, error: '', collisionMsg: collisions})
            this.props.updateCampaign({hasBeenSaved: true})
        //if there are no errors and goal value is higher than 1000
        }else if(!!!data.errors && this.isNumberValid()){
            this.fetchOffers(resolve)
            this.setState({  savedMsg: true, goalMsg: false, error: '', collisionMsg: collisions})
            this.props.updateCampaign({hasBeenSaved: true})

        }
    }

    /**
     * Check each offers' goal value
     * @memberof ModifyCampaign
     */
    isNumberValid() {   
        const goalValue = this.props.campaign.offers.filter(offer => offer.goal < 1000)
        return !!!goalValue.length   
    }

    /**
     * Create campaign's offers
     * @param {object} offer - Offer's information
     * @param {number} index - Offer's index
     * @param {object} campaignData - Campaign's information
     * @memberof ModifyCampaign
     */
    createOffer(offer, index, campaignData) {
        const component =
            <OfferForm
                id={offer.id}
                index={offer.index}
                uuid={offer.uuid}
                key={index}
                offerIndex={index}
                name={offer.name}
                description={offer.description}
                offerUrl={offer.offerUrl}
                brandName={offer.brandName}
                headline={offer.headline}
                kickerName={offer.kickerName}
                goal={offer.goal}
                campaign= {campaignData}
                image={offer.image}
                kickerUrl={offer.kickerUrl}
                subtitle={offer.subtitle}
                kickerClass={offer.kickerClass}
                author={offer.author}
                authorLink={offer.authorLink}
                footerUrl={offer.footerUrl}
                photoAuthor={offer.photoAuthor}
                copyright={offer.copyright}
                kickerText={offer.kickerText}
                status={offer.status}
                offerError={this.getTransformedError(this.getOfferError(index))}
                defaultOffer={offer.defaultOffer}
                error={this.state.error}
                goalMsg={this.state.goalMsg}
                handleSaveMsg={this.handleSaveMsg}
                segTags={this.state.segTags ? this.state.segTags : []}
                docTags={this.state.docTags ? this.state.docTags : []}
                segmentationTags={offer.segmentationTags}
                documentationTags={offer.documentationTags}
                cloneOffer={this.checkBeforeCloneOffer.bind(this)}
                deleteOffer={this.deleteOffer.bind(this)}
                campaignStatus={campaignData ? campaignData.status : ''}
            ></OfferForm>

        return component;
    }

    /**
     * get input date value and stored it in component's state
     * @param {object} date - inputs' dates
     * @param {string} name - inputs' name
     * @memberof ModifyCampaign
     */
    handleDateChange = (date, name) => {
        this.setState({ [name]: date })
        this.props.updateCampaign({hasBeenSaved: false})
        this.props.updateCampaign({ [name]: date.toISOString() });
    };

    /**
     * handle network error msg
     * @memberof ModifyCampaign
     */
    handleClass() {
        this.setState({ classes: 'bcio errorMessage' })
    }

    /**
     * get input value and stored it in component's state
     * @param {object} e - onChange campaign's form inputs
     * @memberof ModifyCampaign
     */
    handleChange(e) {
        this.setState ({ 
            [e.target.name]: e.target.value
        })
        this.props.updateCampaign({ [e.target.name]: e.target.value, hasBeenSaved: false });
        this.handleSaveMsg()
    }

    /**
     * get first offer error and scroll to it
     * @memberof ModifyCampaign
     */
    handleScroll = () => {
        const error = document.querySelector('.offer-errors')
        if(error !== null){
            const parentError = error.closest('.offer_component_content ')
            const scroll = parentError.scrollIntoView()
            return scroll
        }
    }

    /**
     * handle offer's errors from API
     * @param {string} name - input name
     * @memberof ModifyCampaign
     */
    handleError(name) {
        // if there are errors
        if(this.state.error.length) {
            // get input offer errors
            const fieldError = this.state.error.filter(error => error.param === name)
            // get global offer errors
            const globalError = this.state.error.filter(error => error.param === 'offers')
            // if there are global offer errors show msg
            if(name === 'offers' && !!globalError.length) {
                const offerErrors = globalError.map((error, index) => <span key={index}>{error.msg}</span>)
                return <ErrorMessage classes='bcio errorMessage' text={offerErrors}/>;
            // if there are specific offer input errors show input label
            } else if (fieldError && fieldError.length > 0) {
                const errors = fieldError.map((error, index) => <p key={index}>{error.msg}</p>)
                return <Label basic pointing='above'>{errors}</Label>
            }
        } 
    }


    /**
     * handle campaign's errors from API
     * @memberof ModifyCampaign
     */
    handleCampaignGlobalErrors = () => {
        // store errors that have only 1 key
        const globalCampaignErrors = this.state.error.length ? this.state.error.filter(error => Object.keys(error).length === 1) : []
        // if there are errors show msg
        const errors = globalCampaignErrors.length ? <ErrorMessage classes='bcio errorMessage' text={globalCampaignErrors.map(error => error.msg)}/> : ''
        return errors
    }

    /**
     * match errors with its offer
     * @param {number} index - offer's index
     * @memberof ModifyCampaign
     */
    getOfferError(index) {
        // get errors
        const filteredErrors = this.state.error.length ? this.state.error.filter(error => {
            // discard errors that don't match with offers format errors
            if(!(error.param && error.msg)){
                return false
            }
            // match error index with offer index
            const splitError =  error.param.split('.')
            return splitError[0] === `offers[${index}]`   
            }) : [];
            return filteredErrors; 
    }

    /**
     * get offer name from API error format
     * @param {object} arr - offer's errors
     * @memberof ModifyCampaign
     */
    getTransformedError(arr) {
        const errorName = arr.map(error => {
            const splitError =  error.param.split('.')
            return {...error, prettyName: splitError[1]} 
        });
        return errorName;
    }

    /**
     * launch campaign
     * @memberof ModifyCampaign
     */
    launchCampaign() {
        // show confirmation modal
        this.setState({ modal:{
            ...this.state.modal,
            open: true,
            closeException: true,
            text: ` All the changes are going to be saved. Are you sure you want to ${this.state.campaignData.status === 'SCHEDULED' || this.state.campaignData.status === 'LIVE' ? 'pause' : 'launch'} this campaign?`,
            optionalText: `${!this.isNumberValid() ? 'Warning: Some goal values may be lower than 1000' : ''}`,
            textClose: 'No, go back',
            classes: '',
            action: function(){
                this.setState({ loading: true })
                // save campaign
                campaignService.update(`${this.props.match.params.id}`, {...this.props.campaign},'',this.apiErrors)
                .then((data) => {
                        // check campaign's conditionals before launching
                        this.conditionalLaunch(data)
                    })
            }.bind(this)
        }})
    }

    /**
     * check launching conditionals
     * @param {object} data - Campaign's data
     * @memberof ModifyCampaign
     */
    conditionalLaunch(data){
        // if there are errors when saving campaign show them
        if(data.errors) {
            this.setState({ error: data.errors, loading: false, modal:{ ...this.state.modal, open: false}})
        } else {
            // if there are no errors check campaign's current state and send action to API
            campaignService.save(`${this.props.match.params.id}`, '',this.checkState(), this.apiErrors)
                .then((data) => {
                    // if there are errors when launching show them in modal
                    if(data.errors) {
                        this.setState({
                            loading: false,
                            modal:{ ...this.state.modal,
                                open: true,
                                textClose: 'Close', 
                                classes:'hidden', 
                                text: data.errors.map(error => error.msg), 
                                optionalText: data.errors.map(error => error.msg.includes('Collision') ? 'Please review if any of the previous campaings are live or scheduled' : '')}, 
                            globalError: data.errors,
                            error: [] })
                        // if there are warnings show them in modal
                        } else if(data.warning) {
                            this.setState({
                                loading: false,
                                modal:{ ...this.state.modal,
                                    open: true,
                                    text: data.warning,
                                    textAccept: 'Continue',
                                    action: function() {
                                        this.setState({redirectHome: true})
                                    }.bind(this),
                                }
                            })
                        // if there are no launching errors redirect to home
                        } else {
                            this.setState({loading: false, redirectHome: true})
                        }
                    })
        }
    }

    /**
     * check campaign's current state and define action to send
     * @memberof ModifyCampaign
     */
    checkState() {
        if(this.state.campaignData.status === 'DRAFT' || this.state.campaignData.status === 'PAUSED') {
            return 'launch'
        } else if(this.state.campaignData.status === 'LIVE' || this.state.campaignData.status === 'SCHEDULED') {
            return 'pause'
        } 
    }

    /**
     * show msg if saving is succesfull
     * @memberof ModifyCampaign
     */
    handleSaveMsg() {
        this.setState({ savedMsg: false })
    }

    /**
     * handle errors from API
     * @param {number} response - response status
     * @memberof ModifyCampaign
     */
    apiErrors = (response) => {
        if(response >= 500) {
            this.handleClass()
        }
    }

    /**
     * check if campaign has been saved before adding new offer
     * @memberof ModifyCampaign
     */
    checkBeforeChanges(){
        if(this.state.hasBeenSaved){
           this.addOffer()
        }else{
           this.showMustSaveMessage({
               callback: ()=>this.saveCampaign().then(res => {
                    this.addOffer()
               }).catch(e => this.props.updateCampaign({hasBeenSaved: false}))
           })
        }
    }

    /**
     * add new offer
     * @memberof ModifyCampaign
     */
    addOffer(){
        this.props.addOffer()
        this.props.updateCampaign({hasBeenSaved: false})
    }

    /**
     * check clone offer's conditionals
     * @param {object} offer - offer's data
     * @memberof ModifyCampaign
     */
    checkBeforeCloneOffer(offer){
        // if campaign has been saved clone offer
        if(this.state.hasBeenSaved){
            this.cloneOffer(offer)
         }else{
            // if campaign hasnt' been saved, show msg, save it and clone offer
            this.showMustSaveMessage({
                text: 'You need to save all your changes before cloning this offer. Do you want to save them?',
                callback: ()=>this.saveCampaign().then(res => {
                    this.cloneOffer(offer)
                }).catch(e => this.props.updateCampaign({hasBeenSaved: false}))
            })
         }
    }

    /**
     * clone offer
     * @param {object} offer - offer's data
     * @memberof ModifyCampaign
     */
    cloneOffer(offer){
        const payload = {
            ...offer,
            index: Date.now() * Math.floor((Math.random() + Math.random() * 2)),
            id:'',
            status: '',
            defaultOffer: false,
            name: `${offer.name}_cloned`,
        }
        this.props.addOffer(payload)
        this.props.updateCampaign({hasBeenSaved: false})
    }

    /**
     * delete offer
     * @param {*} offer - offer's data
     * @memberof ModifyCampaign
     */
    deleteOffer(offer){
        const payload={...offer}
        // show confirmation msg
        this.showMustSaveMessage({
            text: 'You are about to delete this offer. Are you sure?',
            callback: ()=>{
                // delete offer
                this.props.deleteOffer(payload).then(res => {
                    offersService.erase(offer.id)
                    this.setState({error: []})
                })
            }
        })
    }

    /**
     * handle save msg before adding new offer
     * @param {object} options
     * @memberof ModifyCampaign
     */
    showMustSaveMessage(options){
        const {callback, text}=options
        this.setState({ modal:{
            ...this.state.modal,
            open: true,
            title: 'Warning',
            text: text || 'You need to save all your changes before adding a new offer. Do you want to save them?',
            textClose: 'No',
            classes: '',
            action:()=>{
                callback()
            }
        }
        })
    }

    /**
     * styling campaign's status button
     * @memberof ModifyCampaign
     */
    handleStatusClass = () => {
        const status  = this.state.campaignData ? this.state.campaignData.status : '';
        const commonClass = 'bcio_status'
        return `${commonClass} ${!!status ? status === 'CLOSED' ? 'b-closed' : status.toLowerCase(): ''}`
    }

    /**
     * capitalize status text that comes from API
     * @param {string} string - campaign's status text
     */
    transformText = (string) => {
        const capitalizeText = string.charAt(0) + string.slice(1).toLowerCase();
        return capitalizeText
    }    
    render(){
        if (this.state.redirectHome) {
            return <Redirect push to="/" />;
        }
        const globalCampaignErrors = this.state.error.length ? this.state.error.filter(error => Object.keys(error).length === 1) : []
        const { offers } = this.props.campaign;
        const { campaignData, modal } = this.state;
        const buttons = [
            {
                title: 'Save',
                cls: 'btn-save',
                icon: 'save',
                action: () => {
                    this.saveCampaign()
                }
            },
            {
                title: campaignData.status === 'SCHEDULED' || campaignData.status === 'LIVE' ? 'Pause' : 'Launch' ,
                cls: 'btn-save',
                icon: campaignData.status === 'SCHEDULED' || campaignData.status === 'LIVE' ? 'pause' : 'rocket',
                action: () => {
                    this.launchCampaign()
                }
            },
            {
                title: 'Exit',
                cls: 'btn-exit',
                icon: 'times',
                action: () => {
                    if(this.state.hasBeenSaved){
                        this.setState({redirectHome: true});
                        return
                    }
                    this.setState({ modal:{
                        ...this.state.modal,
                        open: true,
                        title: 'Are you sure you want to leave this page?',
                        text: 'You\'ll lose any unsaved changes',
                        textClose: 'No',
                        classes: '',
                        action: function(){
                            this.setState({ redirectHome: true })
                        }.bind(this)
                    } })
                }
            },
        ]
        const buttonClosedCampaign = [
            {
                title: 'Exit',
                cls: 'btn-exit',
                icon: 'close',
                action: () => {
                    this.setState({ modal:{
                        ...this.state.modal,
                        open: true,
                        title: 'Are you sure you want to leave this page?',
                        textClose: 'No',
                        classes: '',
                        action: function(){
                            this.setState({ redirectHome: true })
                        }.bind(this)
                    } })
                }
            },
        ]
        return (
            <main className="modify_campaign">
                <MainHeader title={campaignData.status === 'CLOSED' ? 'Closed Campaign' : 'Edit Campaign'} buttons={campaignData.status === 'CLOSED' ? buttonClosedCampaign : buttons}></MainHeader>
                <Message info className={this.state.savedMsg ? 'msg' : 'hidden'}>The campaign has been saved successfully</Message>
                <Message warning className={this.state.collisionMsg.length ? 'msg' : 'hidden'}>{this.state.collisionMsg}</Message>
                <ErrorMessage classes={this.state.error.length && !globalCampaignErrors.length ? 'bcio errorMessage' : 'hidden'} text='Please review all the offers, some fields may have errors'></ErrorMessage>
                <ErrorMessage classes={campaignData.status === 'CLOSED' ? 'bcio errorMessage' : 'hidden'} text="This is a CLOSED campaign, you won't be able to save any changes"></ErrorMessage>
                <ErrorMessage classes={this.state.loadingError ? 'bcio errorMessage' : 'hidden'} text='Something went wrong, please try to reload the page or contact your administrator' />              
                {this.handleError('offers')}
                {this.handleCampaignGlobalErrors()}
                <fieldset disabled={campaignData.status === 'CLOSED'}>
                    <section className='modify_campaign_content_top'>
                        <div className="modify_campaign_category">
                            <p className="modify_campaign_category_text">
                                {this.state.campaignData.page !== undefined && this.state.campaignData.position !== undefined ? this.state.campaignData.page.name + '/' + this.state.campaignData.position.name : ''}
                            </p>
                        </div>
                        <input type="text" className="modify_campaign_title" value={this.state.name} name="name" onChange={this.handleChange}/>
                        <div className='bcio-label title'>
                            {this.handleError('name')}
                        </div>
                        <Calendar 
                            handleDateChange={(date) => {this.handleDateChange(date, 'from')}} 
                            placeholder='00/00/0000' 
                            field='from' 
                            name='from' 
                            value={this.state.from}
                            disabled={campaignData.status === 'CLOSED'}
                        />
                        <div className='bcio-label left'>
                            {this.handleError('from')}
                        </div>
                        <Calendar
                            handleDateChange={(date) => { this.handleDateChange(date, 'to') }}
                            placeholder='00/00/0000'
                            field='to'
                            name='to'
                            value={this.state.to}
                            disabled={campaignData.status === 'CLOSED'}
                        />
                        <div className='bcio-label'>
                            {this.handleError('to')}
                        </div>
                        <div className="modify_campaign_button_top">
                        <div className={this.handleStatusClass()}>{campaignData.status ? this.transformText(campaignData.status) : ''}</div>
                        </div>
                    </section>
                </fieldset>
                <ErrorMessage classes={this.state.classes} handleClass={this.handleClass} text='The changes couldn’t be saved due to a network error. Try it again later.'/>
                <section className="modify_campaign_content" >
                    {
                        offers.map((offer, index) => this.createOffer(offer, index, campaignData))
                    }
                    <div className={campaignData.status === 'CLOSED' ? 'hidden' : 'modify_campaign_add_offer'}>
                        <Header className="modify_campaign_add_offer_button" as="a" onClick={this.checkBeforeChanges.bind(this)}>
                            <Header.Content>
                                <Icon name='plus' />
                                New Offer
                            </Header.Content>
                        </Header>
                        <div className='add_offer_border'></div>
                    </div>
                </section>
                <Dimmer active={this.state.loading} className='modal_loader'>
                    <Loader />
                </Dimmer>
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
            </main>
        )
    }
}

const mapStateToProps = (store) => {
    return {
        campaign: store.modifyCampaign
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addOffer: (offer) => {
            dispatch({
                type: "ADD_OFFER",
                payload: !!offer ? offer : ''
            })
        },
        updateCampaign: (campaign) => {
            dispatch({
                type: "UPDATE_CAMPAIGN",
                payload: campaign
            })
        },
        updateOffer: (state) => {
            dispatch({
                type: 'UPDATE_OFFER',
                payload: state
            })
        },
        deleteOffer: (payload) => {
          return new Promise((resolve, reject)=>{
            dispatch({
                type:'DELETE_OFFER',
                payload: {
                    ...payload,
                    resolve
                }
            })
          })  
        },
        updateOffers: (offers) => {
            dispatch({
                type: 'UPDATE_OFFERS',
                payload: offers
            })
        },
        destroyCampaign: () => {
            dispatch({
                type: 'DESTROY_CAMPAIGN'
            })
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ModifyCampaign)
