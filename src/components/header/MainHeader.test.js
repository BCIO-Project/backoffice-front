import React from 'react';
import {shallow} from 'enzyme';
import { MainHeader } from './MainHeader';
import { Button, Header } from 'semantic-ui-react';

describe('Header component', ()=>{
    let header: ShallowWrapper;
    let buttons: Props;
    beforeEach(()=>{
        buttons = [
            {
                title: 'Save',
                cls:'btn-save',
                action:jest.fn()
            },
            {
                title: 'Exit',
                cls:'btn-exit',
                action:jest.fn()
            }
        ]
        header = shallow(<MainHeader history={{push:jest.fn()}} buttons={buttons}></MainHeader>)
    })
    
    test('should render a list of buttons', () => {
        expect(header.find(Button)).toHaveLength(2);
    })
    test('shouldn\'t render any button', () => {
        header = shallow(<MainHeader></MainHeader>)
        expect(header.find(Button)).toHaveLength(0);
    })
    test('should execute any action passed to a button', () =>{
        header.find(Button).map((button, index)=>{
            button.props().onClick()
            expect(buttons[index].action).toHaveBeenCalled()
        })
    })
    test('should render any title passed to a button', () =>{
        header.find(Button).map((button, index)=>{
            expect(button.render().text().trim()).toBe(buttons[index].title)
        })
    })
    it('should logout when the logout button is clicked', ()=> {
        const logout = jest.fn(()=>{
            header.instance().props.history.push();
        })
        header.instance().logout = logout;
        header.instance().forceUpdate()
        header.update()
        header.find(Header).map((link,index)=>{
            if(index === 0){
                link.props().onClick();
            }
        });
        expect(header.instance().logout).toHaveBeenCalled();
        expect(header.instance().props.history.push).toHaveBeenCalled();
    })
})