import Service from './service';
const service = new Service('auth');

export const login = (body, addToUrl='login') => service.fetchData(null, 'POST', body, addToUrl);
