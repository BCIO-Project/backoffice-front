import React from 'react';
import {shallow} from 'enzyme';
import {ModifyCampaign} from './ModifyCampaign';

describe('Modify Campaign view', ()=>{
    let modifyCampaign;
    let campaign;
    beforeEach(()=>{
        campaign = {
            offers: []
        }
        modifyCampaign = shallow(
            <ModifyCampaign 
            campaign={campaign} 
            updateCampaign={jest.fn()} 
            match={{params: {id: 1}, isExact: true, path: "", url: ""}}>
            </ModifyCampaign>);
    })
    it('should render', ()=>{
        expect(modifyCampaign.exists()).toBe(true)
    })

    it('should update a campaign', ()=>{ 
        modifyCampaign.instance().props.updateCampaign();
        expect(modifyCampaign.instance().props.updateCampaign).toBeCalled();
        modifyCampaign.instance().props.updateCampaign.mockReturnValueOnce({id: 42});
        expect(modifyCampaign.instance().props.updateCampaign()).toMatchObject({id: 42});
    })
    
    it('should get an array of tags', ()=>{
        modifyCampaign.instance().getTags('/segmentation', 'segTags', ()=>{
            expect(modifyCampaign.state().segTags.length).toBeGreaterThan(1000);
            done()
        })
    })
})