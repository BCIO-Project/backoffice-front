import React from 'react';
import {shallow} from 'enzyme';
import SideBar from './SideBar';
import Home from './../Home';

const defaultProps = {
    match: {
        params: {}
    }
}
describe('SideBar component', ()=>{
    let sidebar;
    beforeEach(()=>{
        sidebar = shallow(<SideBar></SideBar>)
    })
    it('renders', ()=>{
        expect(sidebar.exists()).toBe(true);
    })
    it('should return a uppercase string', ()=>{
        const toUpper = 'jest';
        expect(sidebar.instance().setValue(toUpper)).toBe('JEST');
    })
    
    it('should return live and paused when live is being passed', ()=>{
        const prop = 'live';
        expect(sidebar.instance().setValue(prop)).toBe('LIVE,PAUSED');
    })

    test('should change parent state onClick', ()=>{
        const home = shallow(<Home {...defaultProps}></Home>)
        sidebar.find('#icon_back').simulate('click')
        expect(home.state().showNotifications).toBe(false);
    })
})