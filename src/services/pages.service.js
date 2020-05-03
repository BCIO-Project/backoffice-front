import Service from './service';
const service = new Service('pages');

export const getList = (addToUrl) => service.fetchData(null, 'GET', null, addToUrl)
