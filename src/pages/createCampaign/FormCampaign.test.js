import React from 'react';
import { mount, shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import FormCampaign from './FormCampaign';

describe('<FormCampaign>', function() {
    it('Should render correctly', function() {
        const component = renderer.create(<FormCampaign />);
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    })

    it('Should have two <select>', function() {
        const component = shallow(<FormCampaign />);
        expect(component.find('select').length).toBe(2);
    })

    it('Should capture title correctly onChange and change component state', function(){
        const component = mount(<FormCampaign />);
        const input = component.find('input').at(0);
        input.instance().value = 'campaign';
        input.simulate('change');
        expect(component.state().name).toEqual('campaign');
    })

    it('Should capture from date correctly onChange and change component state', function(){
        const component = mount(<FormCampaign />);
        const input = component.find('input').at(1);
        const date = new Date().toLocaleString();
        input.instance().value = date;
        input.simulate('change');
        expect(component.state().startDate).toEqual(new Date(date));
    })

    // it('Should capture multi select pages correctly onChange', function(){
    //     const component = mount(<FormCampaign />);
    //     const input = component.find('select').at(0);
    //     const optionPortada = component.find('option').at(1);
    //     optionPortada.instance().selected = true;
    //     input.simulate('change')

    //     expect(component.find('select').at(0).props().value).toEqual(['1']);
        
    // })

})