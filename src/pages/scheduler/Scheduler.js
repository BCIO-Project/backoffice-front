import React, { Component } from 'react';
import { Redirect } from 'react-router';
import {
    Button,
    Form
} from 'semantic-ui-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

import MainHeader from '../../components/header/MainHeader';
import SideBar from './../home/components/SideBar';
import * as pagesService from './../../services/pages.service';
import * as campaignService from '../../services/campaign.service';
import './Scheduler.scss';

const localizer = momentLocalizer(moment);

const colors = ['#FCF2D1', '#DAF6EC', '#FDDBDF', '#D8E7F9', '#E9DDEE', '#ECF1C5', '#BEDAC8', '#F1B3D0', '#C5E1F7', '#DDB6E6', '#F9E0BB', '#D9EAC8', '#F1B3B8', '#D9DBF0', '#FACABF', '#C9CAE9', '#C1E1DC', '#C9EBD8', '#E5E2DE', '#D0D0D0']


export default class Scheduler extends Component {
    constructor(props) {
        super(props);
        this.menuRef = React.createRef()
        this.toggleRef = React.createRef()
    }
    state = {
        increaseSidebar: false,
        page: '',
        optionPages: [],
        optionPositions: [],
        originalCampaigns: [],
        filteredCampaigns: [],
        events: [],
        toggleLeyend: false,
        paginationPage: 1,
    }

    /**
     * life cycle React component
     */
    componentDidMount() {
        // search portada campaigns when page is loaded
        try {
            this.getCampaigns()
            this.getPages()
        } catch (error) {
            console.log(error)
        }
    }

    /**
   * life cycle React component
   * @param {object} prevProps 
   * @param {object} prevState 
   */
    componentDidUpdate(prevProps, prevState) {
        // get positions when page changes
        if (prevState.page !== this.state.page && this.state.page !== '') {
            this.getPositionsByPage()
        }
        // filter campaings by page when positions changes
        if (prevState.optionPositions !== this.state.optionPositions && this.state.optionPositions.length && this.state.originalCampaigns.length) {
            this.filterCampaignsbyPage()
        }
        // transform filteredCampaigns arr into events arr for scheduler
        if (prevState.filteredCampaigns !== this.state.filteredCampaigns) {
            this.transformFilteredCampaignsToEventsArr(this.state.filteredCampaigns)
        }
    }

    /**
     * fetch all campaigns
     * @memberof Scheduler
     */
    getCampaigns = () => {
        // transform filters data's format and send it to API
        campaignService.get('', '', `?page=${this.state.paginationPage}`)
            .then(data => {
                this.setState((prevState)=>{
                    // store campaings in component's state, determining if there's need to load another page
                    return {
                      originalCampaigns: this.state.paginationPage === 1 ? data : [...prevState.originalCampaigns, ...data],
                      hasMore: data.length === 15 ? true : false,  
                      paginationPage: this.state.paginationPage + 1
                    }
                  }, () => {
                      if(this.state.hasMore) {
                          this.getCampaigns()
                      }
                  })
            })
    }

    /**
     * fetch all pages
     * @memberof Scheduler
     */
    getPages = () => {
        pagesService.getList()
            .then((data) => {
                this.setState({
                    optionPages: data
                        .map(data => ({
                            key: data.id,
                            value: data.name,
                            text: data.name,
                            id: data.id
                        }))
                }, this.getDefaultPageID(data))
            })
    }

    /**
     * get lower page ID to set default page
     * @memberof Scheduler
     */
    getDefaultPageID = (pages) => {
        const pageIDs = pages.map(page => page.id)
        const orderArr = pageIDs.sort((a, b) => a - b)
        this.setState({
            page: orderArr[0]
        })
    }

    /**
     * fetch positions by page
     * @memberof Scheduler
     */
    getPositionsByPage = () => {
        pagesService.getList(`${this.state.page}/positions`)
            .then((data) => {
                this.setState({
                    optionPositions: this.getPositionsWithColors(data)
                })
            })
    }

    /**
     * filter campaigns by page selected and store them in component's state
     * @memberof Scheduler
     */
    filterCampaignsbyPage = () => {
        // eslint-disable-next-line
        const filteredCampaigns = this.state.originalCampaigns.filter(campaign => campaign.page.id == this.state.page)
        this.setState({
            filteredCampaigns: filteredCampaigns.map(campaign => ({ ...campaign, color: this.findColor(campaign.position.id) }))
        })
    }

    /**
     * get color from position item that matched in campaign's positionId and positionId comparision
     * @param {number} campaignPositionId 
     * @memberof Scheduler
     */
    findColor = (campaignPositionId) => {
        const index = this.state.optionPositions.findIndex(item => item.id === campaignPositionId)
        return this.state.optionPositions[index].color
    }

    /**
     * asign color to position
     * @param {array} positions 
     * @memberof Scheduler
     */
    getPositionsWithColors = (positions) => {
        // make colors array copy
        let colorCopy = [...colors];
        return positions
            .map((data, index) => {
                // if colors array doesn't have any values make another copy
                if (!colorCopy.length) {
                    colorCopy = [...colors];
                }
                return {
                    key: data.id,
                    value: data.name,
                    text: data.name,
                    id: data.id,
                    // get first value from colors copy array
                    color: colorCopy.shift()
                }
            });
    }

    /**
     * transform api campaign object to calendar object 
     * @param {object} apiObj - campaign's object from api
     * @memberof Scheduler
     */
    transformApiCampaignObjToCalendarObj = (apiObj) => {
        return {
            id: apiObj.id,
            title: apiObj.name,
            start: new Date(apiObj.from),
            end: new Date(apiObj.to),
            color: apiObj.color,
            status: apiObj.status,
            slot: apiObj.position.name
        }
    }

    /**
     * get events array and store it in component's state
     * @param {array} arr - filtered campaigns array by page
     * @memberof Scheduler
     */
    transformFilteredCampaignsToEventsArr = (arr) => {
        const events = arr.map(item => this.transformApiCampaignObjToCalendarObj(item))
        this.setState({
            events: events
        })
    }    

    /**
   * recover page, position and title values and save them in component's state
   * @memberof Scheduler
   * @param {object} event - The onChange input's event. 
   */
    handleChange = (e) => {
        const updateState = { [e.target.name]: e.target.value }
        this.setState(updateState)
    }

    /**
     * hide and show leyend onclick
     * @memberof Scheduler
     */
    handleLeyendVisibility = () => {
        this.setState({toggleLeyend: !this.state.toggleLeyend})
    }

    /**
     * modify scheduler tooltip text 
     * @param {object} event - scheduler's event object from array passed
     * @memberof Scheduler
     */
    handleTooltip(event) {
        return `${event.title} | ${event.slot} | ${event.status}`
    }

    /**
     * modify scheduler tooltip text 
     * @param {object} event - scheduler's event object from array passed
     * @memberof Scheduler
     */
    onSelectCampaign = (event) => {
        this.setState({ 
            redirect: true, 
            campaignId: event.id 
        })
    }

    /**
     * event styles
     * @param {object} event - scheduler's event object from array passed
     * @memberof Scheduler
     */
    eventStyleGetter(event) {
        const backgroundColor = event.color;
        const border = event.status === 'DRAFT' ? '2px dotted #88868B' : 'none';
        const style = {
            background: backgroundColor,
            borderRadius: '0px',
            color: 'black',
            border: border,
            display: 'block',
            fontFamily: "'Quattrocento Sans', 'sans-serif'",
            fontWeight: '700',
        };
        return {
            style: style
        };
    }

    /**
     * day styles
     * @memberof Scheduler
     */
    dayStyleGetter() {
        const style = {
            borderLeft: '0.1px solid #b5bffd',
        };
        return {
            style: style
        };
    }
    render() {
        const { increaseSidebar, showNotifications, campaignId, redirect } = this.state
        if (redirect) {
            return <Redirect push to={`home/${campaignId}`} />;
        }
        return (
            <section className="home_page">
                <aside className={`home_page_sidebar ${increaseSidebar ? 'open' : ''} ${showNotifications ? 'notifications' : ''}`} ref={this.menuRef}>
                    <SideBar
                        increaseSidebar={increaseSidebar}
                        schedulerView={true}
                    />
                </aside>
                <article className='scheduler_page_container'>
                    <MainHeader className="home" logoHidden={true}></MainHeader>
                    <div className='scheduler_manager'>
                        <div className='scheduler_leyend_container'>
                            <Button className='leyend_btn' onClick={this.handleLeyendVisibility}>Legend</Button>
                            <div className={this.state.toggleLeyend ? 'leyend_content' : 'hidden'}>
                                {this.state.optionPositions
                                    .map(position =>
                                        <p key={position.id}><span className='leyend_color' style={{ backgroundColor: position.color }}></span>{position.value}</p>
                                    )}
                            </div>
                        </div>
                        <div>
                            <Form.Field>
                                <select name="page" id="page" onChange={this.handleChange} className='bcio' value={this.state.page}>
                                    <option value='' className='placeholder'>Filter by page</option>
                                    {this.state.optionPages
                                        .map(option => <option value={option.id} key={option.key}>{option.value}</option>)}
                                </select>
                            </Form.Field>
                        </div>
                    </div>
                    <div style={{ height: '620pt' }} className='calendar_component'>
                        <Calendar
                            events={this.state.events}
                            startAccessor="start"
                            endAccessor="end"
                            defaultDate={moment().toDate()}
                            view='month'
                            onView={() => console.log('month view')}
                            views={['month']}
                            localizer={localizer}
                            onSelectEvent={this.onSelectCampaign}
                            eventPropGetter={(this.eventStyleGetter)}
                            tooltipAccessor={this.handleTooltip}
                            dayPropGetter={(this.dayStyleGetter)}
                            popup={true}
                        />
                    </div>
                </article>
            </section>
        )
    }
}