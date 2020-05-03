import React from 'react';
import {shallow} from 'enzyme';
import ModalComponent from './Modal';

describe('Modal component', ()=>{

    it('should render', ()=>{
        const modal = shallow(<ModalComponent></ModalComponent>);
        expect(modal.exists()).toBe(true);
    })
})