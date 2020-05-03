import React, { Component } from 'react';
import { Header, Input } from 'semantic-ui-react';
import './OfferForm.scss';

export default class OfferInput extends Component {
    render() {
        const  {label, inputClass, name, handleChange, value, placeholder, handleError, type } = this.props
        return (
            <div className={inputClass}>
                <Header as='h4'>
                    <Header.Content>{label}</Header.Content>
                </Header>
                <Input name={name} onChange={handleChange} value={value} placeholder={placeholder} type={type}/>
                { handleError ? handleError(name) : null}
            </div>
        )
    }
}
