import Service from './service';
const service = new Service('tags');

export const get = (id=null, body, addToUrl) => service.fetchData(id, 'GET', body, addToUrl);
