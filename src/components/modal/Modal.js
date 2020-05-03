import React, { Component } from 'react';
import { Button, Modal } from 'semantic-ui-react';

class ModalComponent extends Component {
    /**
     * life cycle React component
     * @param {object} props - props to be received
     * @memberof ModalComponent
     */
    componentWillReceiveProps(props){
        this.setState({
            ...props
        })
    }
    state = { open: false, size: 'tiny' }

    /**
     * close modal
     * @memberof ModalComponent
     */
    close = () => {
        this.conditional(false)
    }

    /**
     * handle modal closing conditionals
     * @memberof ModalComponent
     */
    execute = () => {
        if(!!this.state.action){
            this.state.action()
        }
        this.conditional(!!this.props.closeException)
    }

    /**
     * handle close and open in parent's components
     * @memberof ModalComponent
     */
    conditional = (bool) => {
        this.props.scope.setState({ modal:{open: bool} }, ()=>this.setState({ open: bool }))
    }
    render() {
        const { open, size } = this.state

        return (
            <Modal size={size} open={open} onClose={this.close} closeOnEscape={false} closeOnDimmerClick={false}>
                <Modal.Header>{this.props.title}</Modal.Header>
                <Modal.Content>
                    <p>{this.props.text}</p>
                    <p>{this.props.optionalText}</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button className={this.props.textClose ? 'bcio_button' : 'hidden'} onClick={this.close}>{this.props.textClose}</Button>
                    <Button className={`bcio_button ${this.props.classes}`} onClick={this.execute}>{this.props.textAccept ? this.props.textAccept : 'Yes'}</Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default ModalComponent