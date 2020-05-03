import React from 'react'
import { Input, Button, Checkbox } from 'semantic-ui-react'
import './Login.scss';
import * as loginService from '../../services/login.service';
import Cookies from 'js-cookie';
export default class Login extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            username: '',
            password: ''
        }
    }
    loginRequest(){
        loginService.login({
            ...this.state
        }).then(response => {
            Cookies.set('auth', response);
            this.props.history.push('/home');
        }).catch(e => console.log(e))
    }
    onChangeHandler(e){
        this.setState({ [e.target.name]: e.target.value })
    }
    render(){
        if(Cookies.get('auth')){
            this.props.history.push('/home')
        }
        const max_logo = `${process.env.PUBLIC_URL}/images/max-logo.svg`;
        return(
            <div className="login">
                <img className="sidebar_max_logo" src={max_logo} alt='bcio logo'/>
                <p className='login_instructions'>To <strong>Sign up in Bcio</strong> you have to send your request by email to the <strong><u>Administrator</u></strong>. In a short time you’ll receive in your email box your username and password.</p>
                <div className="login_form">
                    <Input name="username" placeholder="Insert Username" onChange={this.onChangeHandler.bind(this)}></Input>
                    <Input name="password" type="password" placeholder="Insert Password" onChange={this.onChangeHandler.bind(this)}></Input>
                    <Checkbox label='Remember me'></Checkbox>
                    <Button className="bcio_button" onClick={this.loginRequest.bind(this)}>Login</Button>
                </div>
                {/* <p><u className='recover_password'>Forgot password?</u></p> */}
            </div>
        )
    }
}