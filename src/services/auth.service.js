import Cookies from 'js-cookie';
import React, {Component} from 'react'
import {Route, Redirect} from 'react-router-dom'
export default class Auth extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            auth: Cookies.getJSON('auth') || false,
        };
    }
    render(){
        const component = this.state.auth ? (<Route {...this.props} render={props => (<Component {...props} />)}/>) : ( <Redirect to={{ pathname: "/"}}/>)
        return component;
    }
}

