import React from 'react';
import {shallow} from 'enzyme';
import Home from './Home';

const defaultProps = {
    match: {
        params: {}
    }
}
describe('Home view', ()=>{
    let home;
    beforeEach(()=>{
        home = shallow(<Home {...defaultProps}></Home>)
    })
    it('renders', ()=>{
        expect(home.exists()).toBe(true);
    })
    it('should toggle increaseSidebar property when handleAnimationChange is executed', ()=>{
        home.instance().handleAnimationChange();
        expect(home.state().increaseSidebar).toBe(false);
    })
    it('should toggle increaseSidebar property when the toggle menu icon is clicked', ()=>{
        home.find('.togglerMenu').props().onClick();
        expect(home.state().increaseSidebar).toBe(false);
    })
    it('should show notifications', ()=>{
        home.instance().handleNotificationVisibility();
        expect(home.state().showNotifications).toBe(true);
    })
})