import uuid from 'uuid/v4';
const createOffer = (name, index, defaultOffer = false) => {
    return {
        id: '',
        uuid: uuid(),
        index: index,
        name: name,
        description: '',
        offerUrl: '',
        brandName: '',
        headline: '',
        kickerName: '',
        image:'',
        goal: '',
        kickerUrl: '',
        subtitle: '',
        kickerClass: '',
        segmentationTags: [],
        documentationTags: [],
        kickerText: '',
        status: '',
        author: '',
        authorLink: '',
        footerUrl: '',
        photoAuthor: '',
        copyright: '',
        defaultOffer: defaultOffer
    }
}
const initialState = {
    id: '',
    offers:[]
}
const modifyCampaign = (state = initialState, action) => {
    switch (action.type){
        case 'UPDATE_DEFAULT_OFFER':
            const defaultOffer = state.offers.map(offer => {
                if(offer.index === action.payload.index){
                    if(!offer.defaultOffer){
                        offer.defaultOffer = true;
                    }
                }else{
                    offer.defaultOffer = false;
                }
                return offer;
            })
            state = {
                ...state,
                offers: [...defaultOffer]
            }
            break;
        case 'UPDATE_CAMPAIGN':
            state = {
                ...state,
                ...action.payload
            }
            break;
        case 'ADD_OFFER':
            const defaultOfferValue = !!!state.offers.length;
            const defaultName = `Offer_${state.name}_${new Date().toLocaleTimeString()}`;
            const payload = !!Object.values(action.payload).length ? action.payload 
            : createOffer(defaultName, Date.now() * Math.floor((Math.random() * 10) + 1), defaultOfferValue);
            state = {
                ...state,
                offers: [...state.offers, payload]
            };
            break;
        case 'UPDATE_OFFER':
            const newOffers = state.offers.map(offer => { 
                if(offer.index === action.payload.index){
                    offer = {
                        ...action.payload
                    }
                }
                return offer
            })
            state = {
                ...state,
                offers: [...newOffers]
            }
            break;
        case 'UPDATE_OFFERS':
            const offer = createOffer()
            const offersFiltered = action.payload.map((element, index)=> {
                return {
                    ...offer,
                    ...element,
                    index: Date.now() * (index + 1) // weird case duplicate Date.now() :S
                }
            })
            state = {
                ...state,
                offers: [...offersFiltered]
            }
            break;
        case 'DELETE_OFFER':
            const offers = state.offers.filter(offer => offer.index !== action.payload.index);
            state = {
                ...state,
                offers: offers
            }
            action.payload.resolve(state);
            break;
        case 'DESTROY_CAMPAIGN':
            state = {
                ...initialState
            }
            break
        default:
            //do nothing
    }
    return state;
}
export default modifyCampaign;
