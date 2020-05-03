import Service from './service';
const service = new Service('offers');

export const save = (body, addToUrl, onError=null) => service.fetchData(null, 'POST', body, addToUrl, onError);
export const update = (id, body, addToUrl) => service.fetchData(id, 'PATCH', body, addToUrl);
export const erase = (id, body, addToUrl) => service.fetchData(id, 'DELETE', body, addToUrl);
export const get = (body, addToUrl) => service.fetchData(null, 'GET', body, addToUrl)
