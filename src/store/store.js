import { createStore, combineReducers } from 'redux';
import modifyCampaign from '../reducers/modifyCampaign';

const store = createStore(combineReducers({
    modifyCampaign,
}))

export default store
