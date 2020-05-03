import React, { Component } from 'react';
import { Header, TextArea } from 'semantic-ui-react';
import './OfferForm.scss';

export default class OfferTextArea extends Component {
    render() {
        const  {label, inputClass, name, handleChange, value, placeholder, handleError, rows } = this.props
        return (
            <div className={inputClass}>
                <Header as='h4'>
                    <Header.Content>{label}</Header.Content>
                </Header>
                <TextArea name={name} onChange={handleChange} value={value} placeholder={placeholder} rows={rows}/>
                {handleError(name)}
            </div>
        )
    }
}
