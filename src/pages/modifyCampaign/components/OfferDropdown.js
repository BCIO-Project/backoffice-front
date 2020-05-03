import React, { Component } from 'react'
import { Header, Dropdown } from 'semantic-ui-react';

export default class OfferDropdown extends Component {

    render() {
        const { label, options, handleChange, disabled } = this.props
        return (
            <div className={label}>
                <Header as='h4'>
                    <Header.Content>{label}</Header.Content>
                </Header>
                <Dropdown
                    placeholder='Write a tag or select one of the list'
                    fluid
                    multiple
                    search
                    selection
                    options={options}
                    onChange={handleChange}
                    value={this.props.tagValue ? this.props.tagValue : ''}
                    disabled={disabled}
                />                    
            </div>
        )
    }
}
