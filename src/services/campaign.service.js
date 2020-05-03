import Service from './service';
const service = new Service('campaigns');

export const save = (id=null, body, addToUrl, onError) => service.fetchData(id, 'POST', body, addToUrl, onError);
export const update = (id, body, addToUrl, onError) => service.fetchData(id, 'PATCH', body, addToUrl, onError);
export const erase = (id, body, addToUrl) => service.fetchData(id, 'DELETE', body, addToUrl);
export const get = (id=null, body, addToUrl) => service.fetchData(id, 'GET', body, addToUrl)
export const clone = (id=null, onError) => service.fetchData(id, 'POST', '', 'clone', onError);