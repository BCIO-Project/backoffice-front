import React from 'react';
import {shallow} from 'enzyme';
import Scheduler from './Scheduler';

const defaultProps = {
    match: {
        params: {}
    }
}

const optionPositions = [
    {
        color: "#FCF2D1",
        id: 34,
        key: 34,
        text: "Premium",
        value: "Premium"
    }
]

const apiObject = {
    createdAt: "2020-02-14T14:48:05.925Z",
    deletedAt: null,
    from: "2020-02-04T23:00:00.000Z",
    id: 106,
    lastNotificationDate: null,
    name: "Tests01",
    page: {id: 28, name: "El País - PORTADA", slug: "el-pais-portada", createdAt: "2019-10-10T13:52:54.827Z"},
    position: {id: 34, name: "Premium", createdAt: "2019-10-11T11:30:25.552Z", updatedAt: "2019-10-11T11:30:25.552Z"},
    status: "DRAFT",
    to: "2020-02-13T23:00:00.000Z",
    updatedAt: "2020-02-14T14:48:05.940Z",
    color: "#FCF2D1",
}

const e = {
    preventDefault() {},
    target: { value: 1, name: 'page' }
};

describe('Scheduler component', ()=>{
    let scheduler;
    beforeEach(()=>{
        scheduler = shallow(<Scheduler></Scheduler>)
    })
    it('renders correctly', ()=>{
        expect(scheduler).toMatchSnapshot();
    })
    it('should return color string', () => {
        scheduler.setState({ optionPositions: optionPositions })
        const id = 34;
        expect(scheduler.instance().findColor(id)).toStrictEqual('#FCF2D1')
    });
    it('should transform object into scheduler object', () => {
        expect(scheduler.instance().transformApiCampaignObjToCalendarObj(apiObject)).toStrictEqual({
            id: 106,
            title: "Tests01",
            start: new Date("2020-02-04T23:00:00.000Z"),
            end: new Date("2020-02-13T23:00:00.000Z"),
            color: "#FCF2D1",
            status: "DRAFT",
            slot: "Premium"
        })
    });
    test('should call handleLeyendVisibility onClick and show leyend', ()=>{
        const instance = scheduler.instance();
        const handleLeyendVisibilitySpy = jest.spyOn(instance, 'handleLeyendVisibility');
        instance.forceUpdate();
        scheduler.find('.leyend_btn').simulate('click')

        const leyendContainer= scheduler.find('.leyend_content')
        expect(handleLeyendVisibilitySpy).toHaveBeenCalled();
        expect(!leyendContainer.hasClass('hidden'));
    });
    test('should change redirect and campaignId state', ()=>{
        const event = { id: 37 };
        const instance = scheduler.instance()

        instance.onSelectCampaign(event)
        expect(scheduler.state().redirect).toStrictEqual(true)
        expect(scheduler.state().campaignId).toStrictEqual(event.id)
    });
})