import Service from './service';
const service = new Service('images');

export const get = (options) => {
    const queryString = `getsignedurl?${Object.keys(options).map(key => key + '=' + options[key]).join('&')}`;
    return service.fetchData(null, 'GET', null, queryString)
};
