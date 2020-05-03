import React, { Component } from 'react';
import { isArray } from 'util';
import ErrorMessage from '../message/ErrorMessage';
import { Message } from 'semantic-ui-react'

export default class ToggleError extends Component {
    state={
        toggleError: ''
    }
    child(msg){
        this.setState({ toggleError: msg })
    }
    /**
     * show error or warning if it is not possible to launch/pause a campaign
     * @memberof ToggleError
     */
    handleToggleErrors = () => {
        const { toggleError } = this.state
        // filter errors by format, show warning or error
        if(toggleError !== undefined && isArray(toggleError)) {
        return <ErrorMessage classes='bcio errorMessage campaign' text={toggleError.map(error => error.msg)} 
        aditionalText={toggleError.map(error => error.msg.includes('Collision') ? 'Please review if any of the previous campaings are live or scheduled' : '').filter(item => item !== '')}/> 
        } else if(typeof toggleError === 'string'){
        return <Message warning className={this.state.toggleError ? 'msg' : 'hidden'}>{this.state.toggleError}</Message>
        }
    }
    render() {
        return (
            <div>
                {this.handleToggleErrors()}
            </div>
        )
    }
}
