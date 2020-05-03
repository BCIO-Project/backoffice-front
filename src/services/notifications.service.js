import Service from './service';
const service = new Service('notifications');

export const save = (addToUrl) => service.fetchData(null, 'POST', null, addToUrl)
export const get = (addToUrl) => service.fetchData(null, 'GET', null, addToUrl)
export const erase = (addToUrl) => service.fetchData(null, 'DELETE', null, addToUrl);
