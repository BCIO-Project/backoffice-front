import Cookies from 'js-cookie';
export default class Service {
    constructor(url){
        this.url = url || '';
        this.apiURL = `${process.env.REACT_APP_API_BASE}/`  
        this.endpoint = `${this.apiURL}${this.url}`;
    }
    fetchData(id=null, method, body, addToUrl=null, onError = null){
        let url = !!id ? `${this.endpoint}/${id}`: this.endpoint;
        //Aditional params in url
        url = !!addToUrl ? `${url}/${addToUrl}` : url;
        const config = {
                method: method,
                body: !!body ? JSON.stringify(body): undefined,
                headers: {
                    'Content-Type': 'application/json',
                }
        }
        if(addToUrl!=="login" && Cookies.getJSON('auth')){
            config.headers['Authorization']=`Bearer ${Cookies.getJSON('auth').token}`
        }
        return this.getFetch(url, config, onError)
    }
    async getFetch(url, config, onError){
        const data = await fetch(url, config).then(res => {
            if(res.status >= 401 && res.status <= 403){
                Cookies.remove('auth');
                window.location.assign(`${window.location.origin}/`)
            }
            if ((res.status >= 500 || res.status === 422) && !!onError) {
                onError(res.status);
            }
            return res.json()
        })
        return data
    }
}
