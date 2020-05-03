import React, { Component } from 'react';
import { Message, Icon } from 'semantic-ui-react';
import './ErrorMessage.scss'

export default class ErrorMessage extends Component {
    render() {
        return (
            <Message className={this.props.classes}>
                <Icon name='warning sign' />
                {this.props.text}
                {this.props.aditionalText && this.props.aditionalText.length ? `. ${this.props.aditionalText}` : ''}
            </Message>
        )
    }
}
