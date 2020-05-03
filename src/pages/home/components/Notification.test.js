import React from 'react';
import { mount, shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import Notification from './Notification';

describe('<Notification>', ()=>{
    let notification;
    beforeEach(()=>{
        notification = shallow(<Notification></Notification>)
    })
    test('renders', ()=>{
        expect(notification.exists()).toBe(true);
    })
    test('Should render correctly', () =>{
        const component = renderer.create(<Notification />)
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })
    test('should execute function onClick', ()=>{
        const instance = notification.instance();
        const handleEraseNotificationSpy = jest.spyOn(instance, 'handleEraseNotification');
        instance.forceUpdate();
        notification.find('.notifications_erase').simulate('click')
        expect(handleEraseNotificationSpy).toHaveBeenCalled();
    })
    it('should return read if checked', ()=>{
        const onChangeMockEvent = {} 
        const onChangeMockData = {checked: true}  
        expect(notification.instance().handleReadStatus(onChangeMockEvent, onChangeMockData)).toBe('read')
    })
})