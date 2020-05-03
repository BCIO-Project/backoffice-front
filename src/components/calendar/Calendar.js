import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Form } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './Calendar.scss'
/**
 * calendar (date and hour)
 */
class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }
    render() {
        return (
            <React.Fragment>
                <DatePicker
                    onChange={this.props.handleDateChange}
                    showTimeSelect
                    timeFormat='HH:mm'
                    timeIntervals={60}
                    selected={this.props.value}
                    timeCaption='time'
                    dateFormat='MMM d, yyyy h:mm aa'
                    ref={this.myRef}
                    name={this.props.name}
                    value={this.props.value}
                />
                <Form.Input
                    fluid placeholder={this.props.placeholder}
                    field={this.props.field}
                    type='text'
                    icon='calendar outline'
                    value={!!this.props.value ? this.props.value.toLocaleString() : ''}
                    onClick={() => this.myRef.current.onInputClick()}
                    disabled={this.props.disabled}
                />
            </React.Fragment>
        );
    }
}

export default Calendar;
