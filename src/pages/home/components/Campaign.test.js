import React from 'react';
import {shallow} from 'enzyme';
import {Campaign} from './Campaign';

describe('Campaign component', ()=>{
    let campaign;
    beforeEach(()=>{
        campaign = shallow(<Campaign title="jest"></Campaign>)
    })
    it('renders', ()=>{
        expect(campaign.exists()).toBe(true);
    })
    it('should toggle the accordionClicked property', ()=>{
        campaign.instance().toggleAccordion()
        expect(campaign.state().accordionClicked).toBe(true);
    })
    it('should capitalize a string ', ()=>{
        const capText = 'JEST';
        expect(campaign.instance().transformText(capText)).toBe('Jest')
    })
    it('', ()=>{
        
    })
})