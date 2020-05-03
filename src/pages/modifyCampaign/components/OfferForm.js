import React from 'react';
import './OfferForm.scss';
import { Button, Form, Icon, Label } from 'semantic-ui-react';
import OfferInput from './OfferInput';
import OfferTextArea from './OfferTextArea';
import OfferDropdown from './OfferDropdown';
import store from '../../../store/store';
import ImageComponent from './imageEditor/ImageComponent';
import uuid from 'uuid/v4';
export default class OfferForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            accordionClicked: false,
            segmentationTags: [],
            documentationTags: [],
            modal:{
                open:false
            },
            ...this.props,
            kikerImgWidth: !!this.props.campaign ? this.props.campaign.page.width : 90,
            sizes: !!this.props.campaign ? this.props.campaign.page.sizes : []
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleOfferError = this.handleOfferError.bind(this)
        this.handleTagsChange = this.handleTagsChange.bind(this)
    }

    /**
     * life cycle React component
     * @param {object} newProps
     * @memberof OfferForm
     */
    componentWillReceiveProps(newProps){
        this.setState({...newProps});
    }

    /**
     * handle campaign's accordion visibility
     * @memberof OfferForm
     */
    toggleAccordion() {
        const accordionClicked = !this.state.accordionClicked;
        this.setState({accordionClicked});
    }

    /**
     * get input's values
     * @param {object} e - onChange event
     * @memberof OfferForm
     */
    handleChange(e) {
        const name = e.target.name;
        const value = name === 'goal' ? isNaN(parseInt(e.target.value)) || parseInt(e.target.value) < 0 ? 0 : parseInt(e.target.value) : e.target.value;
        this.setState({ [name]: value });
        store.dispatch({
            type: 'UPDATE_OFFER',
            payload: {
                ...this.state,
                [name]: value
            }
        })
        store.dispatch({
            type:'UPDATE_CAMPAIGN',
            payload:{
                hasBeenSaved: false
            }
        })
        this.props.handleSaveMsg()
    }
    
    /**
     * handle campaign's default offer
     * @param {object} e - onChange event
     * @memberof OfferForm
     */
    handleDefault(e){
        this.setState({ defaultOffer: e.target.checked });
        store.dispatch({
            type: 'UPDATE_DEFAULT_OFFER',
            payload: {
                ...this.state,
                defaultOffer: e.target.checked 
            }
        })
    }
    handlerStore = (options)=>{
        return new Promise((resolve, reject)=>{
            const {type, payload} = options;
            const response = store.dispatch({
                type,
                payload
            })
            if(!!response){
                resolve(response)
            }else{
                reject(response);
            }
        })
    }

    /**
     * delete offer
     * @memberof OfferForm
     */
    deleteOffer(){
        this.props.deleteOffer({...this.state})
    }

    /**
     * clone offer
     * @memberof OfferForm
     */
    cloneOffer(){
        this.props.cloneOffer({...this.state})
    }

    /**
     * store image's url in component's state and update it
     * @param {object} image - image url
     * @memberof OfferForm
     */
    setImageUrl(image){
        this.setState(image)
        store.dispatch({
            type: 'UPDATE_OFFER',
            payload: {
                ...this.state,
                ...image
            }
        })
    }

    /**
     * Match the errors with their corresponding input
     * @param {string} name - input's name
     * @memberof OfferForm
     */
    filteredErrors = (name) => {
        const filteredErrorName = this.props.offerError.filter(error => error.prettyName === name)
        return filteredErrorName
    }

    /**
     * Handle general offer errors
     * @param {string} name - input's name
     * @memberof OfferForm
     */
    handleOfferError(name) {
        if(this.filteredErrors(name).length > 0) {
            const errors = this.filteredErrors(name).map((error, index) => <p key={index}>{error.msg}</p>)
            return <Label basic className='offer-errors' pointing='above'>{errors}</Label>
        }else if(this.props.goalMsg && name === 'goal' && this.state.goal < 1000) {
            return <Label basic className='warning' pointing='above'>Warning: goal value lower than 1000</Label>
        }else {
            return null
        }
    }

    /**
     * get selected options value, stored in state and dispatch new value to store. Remove save msg onChange
     * @param {string} name - input's name
     * @param {object} event - onChange event
     * @param {array} value - select's option values
     * @memberof OfferForm
     */
    handleTagsChange = (name) => (e, {value}) => {
        this.setState({ [name]: value })
        store.dispatch({
            type: 'UPDATE_OFFER',
            payload: {
                ...this.state,
                [name]: value 
            }
        })
        this.props.handleSaveMsg()
    };
    render(){
        const segTags = this.props.segTags ? this.props.segTags.map(tag => ({key: tag.id, text: tag.description, value: tag.id})) : [];
        const docTags = this.props.docTags ? this.props.docTags.map(tag => ({ key: tag.id, text: tag.description, value: tag.id})) : [];
        const { campaignStatus } = this.props
        return(
            <React.Fragment>
                <article id={!!this.state.id ? this.state.id: this.state.index} className={`offer_component ${this.state.accordionClicked ? '': 'offer_row'}`} data-qa={this.props.offerIndex}>
                    <div className="offer_component_header">
                        <h4>{this.state.name}</h4>
                        <div className="offer_component_accordion_button" onClick={this.toggleAccordion.bind(this)}>
                            <Icon name={`caret ${this.state.accordionClicked ? 'up': 'down'}`}></Icon>
                        </div>
                    </div>
                    <div className={`offer_component_content ${this.state.accordionClicked ? 'open': ''}`}>
                        <Form className="offer_form" autoComplete='off'>
                            <fieldset disabled={campaignStatus === 'CLOSED'}>
                                <div className="offer_form_columns two">
                                    <OfferInput 
                                        inputClass='offer_component_title'
                                        label='Offer Name *'
                                        name='name'
                                        handleChange={this.handleChange}
                                        placeholder='Write an offer name'
                                        handleError={this.handleOfferError}
                                        value={this.state.name} />
                                    <div className='actions_container'>
                                        <div className='default_container'>
                                            <input className="default_offer" type="checkbox" id={`check_${this.props.index}`} name="defaultOffer" onChange={this.handleDefault.bind(this)} checked={this.state.defaultOffer} />
                                            <label htmlFor={`check_${this.props.index}`}>
                                                <Icon className={`lock ${this.state.defaultOffer ? 'default': 'grey'}`}/>
                                                <div className={`default_bcg ${this.state.defaultOffer ? '': 'grey'}`}></div>
                                            </label>
                                        </div>
                                        <div className="offer_form_component_actions">
                                            <Button className="bcio_button" onClick={this.cloneOffer.bind(this)}>
                                                <Icon name="clone" />
                                                Clone</Button>
                                            <Button className={`bcio_button ${this.state.defaultOffer ? 'hidden': ''}`} onClick={this.deleteOffer.bind(this)}>
                                                <Icon name="trash alternate" />
                                                Erase
                                            </Button>
                                        </div>
                                    </div>
                                    <OfferTextArea
                                        inputClass='offer_form_offer_description'
                                        label='Offer Description'
                                        name='description'
                                        handleChange={this.handleChange}
                                        placeholder='Write the description'
                                        handleError={this.handleOfferError}
                                        value={this.state.description}
                                        rows='1' />
                                     <OfferInput 
                                        label='Offer Goal *'
                                        name='goal'
                                        handleChange={this.handleChange}
                                        placeholder='Write the goal'
                                        handleError={this.handleOfferError}
                                        value={this.state.goal} 
                                        type='number'/>
                                </div>
                                <div className="offer_form_columns one">
                                    <OfferInput 
                                        label='Kicker text'
                                        name='kickerText'
                                        handleChange={this.handleChange}
                                        placeholder='Write the text of the Kicker'
                                        handleError={this.handleOfferError}
                                        value={this.state.kickerText} />
                                     <OfferInput 
                                        label='Kicker Url'
                                        name='kickerUrl'
                                        handleChange={this.handleChange}
                                        placeholder='Insert the url to link the Kicker'
                                        handleError={this.handleOfferError}
                                        value={this.state.kickerUrl} />
                                    <OfferInput 
                                        label='Kicker class name'
                                        name='kickerClass'
                                        handleChange={this.handleChange}
                                        placeholder='Insert the class to customize the Kicker'
                                        handleError={this.handleOfferError}
                                        value={this.state.kickerClass} />
                                </div>
                                <div className="offer_form_columns">
                                     <OfferTextArea
                                        inputClass='headline'
                                        label='Headline *'
                                        name='headline'
                                        handleChange={this.handleChange}
                                        placeholder='Write the headline'
                                        handleError={this.handleOfferError}
                                        value={this.state.headline}
                                        rows='1' />
                                    <OfferInput 
                                        inputClass='offer_form_offer_url'
                                        label='Offer Url *'
                                        name='offerUrl'
                                        handleChange={this.handleChange}
                                        placeholder='Insert the Url'
                                        handleError={this.handleOfferError}
                                        value={this.state.offerUrl} />
                                    <OfferTextArea
                                        inputClass='subtitle'
                                        label='Subtitle'
                                        name='subtitle'
                                        handleChange={this.handleChange}
                                        placeholder='Write the subtitle'
                                        handleError={this.handleOfferError}
                                        value={this.state.subtitle}
                                        rows='1'/>
                                    <OfferInput 
                                        label='Author'
                                        name='author'
                                        handleChange={this.handleChange}
                                        placeholder='Write the author'
                                        handleError={this.handleOfferError}
                                        value={this.state.author} />
                                    <ImageComponent 
                                        title="Image *" 
                                        name="image"
                                        inputClass='image' 
                                        imgUrl={this.state.image} 
                                        getUrl={this.setImageUrl.bind(this)} 
                                        sizes={this.state.sizes}
                                        uuid={uuid()}
                                        disabled={campaignStatus === 'CLOSED'}
                                        />
                                    <OfferInput 
                                        label='Photographer'
                                        name='photoAuthor'
                                        handleChange={this.handleChange}
                                        placeholder='Write the name of the Photographer'
                                        handleError={this.handleOfferError}
                                        value={this.state.photoAuthor} />
                                    <OfferInput 
                                        label='Url Author Page'
                                        name='authorLink'
                                        handleChange={this.handleChange}
                                        placeholder='Write the url of the Author Page'
                                        handleError={this.handleOfferError}
                                        value={this.state.authorLink} />
                                    <OfferInput 
                                        label='Image Caption'
                                        name='footerUrl'
                                        handleChange={this.handleChange}
                                        placeholder='Write the Image Caption'
                                        handleError={this.handleOfferError}
                                        value={this.state.footerUrl} />
                                    <OfferInput
                                        inputClass='copyright'
                                        label='Image Copyright'
                                        name='copyright'
                                        handleChange={this.handleChange}
                                        placeholder='Write the Image Copyright'
                                        handleError={this.handleOfferError}
                                        value={this.state.copyright} />
                                </div>
                                <div className="offer_form_columns one">
                                    <OfferInput 
                                        label='Brand Name'
                                        name='brandName'
                                        handleChange={this.handleChange}
                                        placeholder='Write the Brand Name'
                                        handleError={this.handleOfferError}
                                        value={this.state.brandName} />
                                    <OfferDropdown 
                                        label='Tags segmentation *'
                                        options={segTags} 
                                        handleChange={this.handleTagsChange('segmentationTags')} 
                                        tagValue={this.state.segmentationTags}
                                        disabled={campaignStatus === 'CLOSED'}/>
                                    <OfferDropdown 
                                        label='Tags documentation *'
                                        options={docTags} 
                                        handleChange={this.handleTagsChange('documentationTags')} 
                                        tagValue={this.state.documentationTags}
                                        disabled={campaignStatus === 'CLOSED'}/>
                                </div>
                            </fieldset>
                        </Form>
                    </div>
                </article>
            </React.Fragment>
        )
    }
}
