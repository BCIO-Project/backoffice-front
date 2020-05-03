import React from 'react'
import { Modal, Button, Header, Icon, Dimmer, Loader } from 'semantic-ui-react';
import Cropper from 'react-easy-crop';
import './ImageComponent.scss';
import * as imageService from '../../../../services/images.service';
import ErrorMessage from '../../../../components/message/ErrorMessage';
import store from '../../../../store/store';
import axios from 'axios';
export default class ImageComponent extends React.Component {
    constructor(props) {
        super(props)
        
        this.state = {
            id: Date.now(),
            image: '',
            open: false,
            crop: { x: 0, y: 0 },
            zoom: 1,
            sizes: !!this.props.sizes ? this.props.sizes: [],
            file:{
                name:''
            },
            imgUrl: !!this.props.imgUrl ? this.props.imgUrl : '',
            cropper:[],
            errorImage: false
        }
        this.createSlot = this.createSlot.bind(this)
        this.getCropper = this.getCropper.bind(this)
    }
    componentDidMount(){
        document.onkeydown = (e)=>{
            this.close(e)
        }
    }
    getCropSize(messure){
        const value = !!this.props.campaign ? this.props.campaign.page[messure] : this.props[messure]
        return parseInt(value)
    }
    onFileChange(event) {
        if(!!event.currentTarget.value){
            const file = event.target.files[0];
            this.getImage(file)
        }else{
            this.setState({
                canvas: ''
            })
        }
    }
    getImage = async (file) => {
        const image = await this.getFromFileReader(file);
        const originalImage = {
            uuid: this.props.uuid,
            filetype: file.type,
            blob: this.dataURItoBlob(image.src),
            img: image
        }
        this.setState({
            image: originalImage.img,
            file: file,
            open: true,
            originalImage
        })
    }
    getFromFileReader = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result
            img.onload = () => {
                resolve(img)
            }
        };
        reader.onerror = error => reject(error);
    })
    onCropChange = crop => {
        this.setState({ crop })
    }

    onCropComplete = (croppedArea, croppedAreaPixels) => {
        this.getCroppedImage(this.state.image, croppedAreaPixels).then(canvas => {
            const canvasUrl = canvas.toDataURL(this.state.file.type)
            const sizes = this.state.sizes.map((clip, index) => {
                if(index === this.state.index){
                    clip.uuid = this.props.uuid;
                    clip.img = canvasUrl;
                    clip.blob = this.dataURItoBlob(canvasUrl)
                    clip.filetype = this.state.file.type
                }
                return clip;
            })
            this.setState({sizes, canvas})
        })
    }
    onZoomChange = zoom => {
        this.setState({ zoom })
    }
    getCroppedImage(image, crop) {
        return new Promise((resolve, reject)=>{
            const {cropper} = this.state
            const canvas = document.createElement("canvas");
            const img = new Image();
            canvas.width = cropper[0].width;
            canvas.height = cropper[0].height;
            const ctx = canvas.getContext('2d');
            img.onload = () => {
                ctx.drawImage(
                    img,
                    crop.x,
                    crop.y,
                    crop.width,
                    crop.height,
                    0,
                    0,
                    cropper[0].width,
                    cropper[0].height
                );
                resolve(canvas);
            }
            img.src = image.src
            img.onerror = (e) => reject(e)
        })
    }
    close(e) {
        if(e && (e.type ==="click" || e.keyCode === 27)){
            this.deleteImage();
            const stateRestarted = {
                ...this.state.oldState
            }
            this.setState(stateRestarted);
        }
        this.setState({ open: false })

    }
    dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
    
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
    
        return new Blob([ia], {type:mimeString});
    }
    download() {
        const download = document.getElementById("download");
        const image = this.state.canvas.toDataURL(this.state.file.type)
        .replace(this.state.file.type, "image/octet-stream");
        download.setAttribute("href", image);
    }
    checkRequiresImage(){
        const validImages = this.state.sizes.map(image => !!image.img && image.img !== '');
        return validImages.every((valid) => valid === true)
    }
    uploadImage(){
        if(this.checkRequiresImage()){
            this.setState({loading: true})
            this.setState({imgUrl: ''})
            const images = this.state.sizes.map(item => {
                delete item.img
                return item
            });
            images.push(this.state.originalImage);
            images.forEach(size => {
                const url = {
                    ...size   
                }
                delete url.blob
                delete url.template
                delete url.img
                
                imageService.get(url)
                .then(urlsCloud => {
                    const urls = urlsCloud;
                    const headers={'Content-Type': size.filetype}
                    const originalUrl = urlsCloud.getUrl.split(size.uuid)[0] + size.uuid +'.'+ size.filetype.split('/')[1];
                    axios.put(urls.putUrl, size.blob, {headers}).then(googleRes => {
                        if(googleRes.status >= 200 && googleRes.status < 300){
                            const image = new Image();
                            image.src = originalUrl
                            image.onload = ()=>{
                                this.setState({imgUrl: image.src})
                            }
                            this.setState({loading: false})
                            this.props.getUrl({[this.props.name]:originalUrl})
                            this.close()
                        }
                    })
                    .catch(e => console.log(e))
                })
            })
        }else{
            this.setState({errorImage: true})
            setTimeout(()=>{
                this.setState({errorImage: false})
            }, 3000)
        }
        store.dispatch({
            type:'UPDATE_CAMPAIGN',
            payload:{
                hasBeenSaved: false
            }
        })
    }
    deleteImage(){
        const clearImg = this.state.sizes.map(item => {
            delete item.img
            delete item.blob
            return item
        });

        this.setState({
            imgUrl: '',
            canvas: '',
            sizes: [...clearImg]
        })
        document.querySelector(`#file_${this.state.id}`).value = '';
        this.props.getUrl({[this.props.name]: ''})
    }
    copyState(){
        const state = {...this.state}
        this.setState({oldState: state})
    }
    createSlot(slot, index){
        const container = document.querySelector('.content_sizes');
        const slotHtml = (
            <div key={index} className="slot_image" onClick={()=>this.setSize(slot, index)} style={{width: container && (container.offsetWidth - 30) > slot.width ?  slot.width : ''}}>
                <div className={slot.img ? '' : 'hide'}>
                    <img src={slot.img} alt={slot.name}/>
                </div>
                <div className="slot_description">
                    <p className="slot_name">{slot.name}</p>
                    <p className="slot_size">{`${slot.width}x${slot.height}px`}</p>
                </div>
            </div>
        )
        return slotHtml;
    }
    setSize(slot, index){
        this.setState({
            cropper: []
        }, ()=> {
            const cropSize = {
                width: slot.width,
                height: slot.height
            }
            const cropper = [cropSize]
            this.setState({cropper, index})
        })
    }
    getCropper(size, index){
        return <div key={index}>
            <Cropper
                image={this.state.image.src}
                crop={this.state.crop}
                zoom={this.state.zoom}
                cropSize={size}
                onCropChange={this.onCropChange}
                onCropComplete={this.onCropComplete}
                onZoomChange={this.onZoomChange}
                minZoom={0.1}
                restrictPosition={false}
            />
        </div>
    }
    render() {
        const { inputClass } = this.props
        return (
            <div className={`image_component ${inputClass}`}>
                <Header as='h4'>
                    <Header.Content>{this.props.title}</Header.Content>
                </Header>
                <input className={this.state.canvas || this.state.imgUrl ? 'hide': ''} id={`file_${this.state.id}`} type="file" onClick={this.copyState.bind(this)} onChange={this.onFileChange.bind(this)} />
                <div className={`image_preview_container ${this.state.imgUrl ? '' : 'hide'}`}>
                    <label className="image_label" htmlFor={`file_${this.state.id}`}>
                        <img className={`image_preview ${this.state.imgUrl ? '' : 'hide'}`} src={this.state.imgUrl} alt='offer preview'/>
                    </label>
                    <div className={`bcio_icon ${this.state.canvas ? '': 'hide'}`} id="download" download={this.state.file.name} onClick={this.download.bind(this)}>
                        <i className="download icon"></i>
                    </div>
                    {this.props.disabled ? '' :
                    <div className={`bcio_icon ${this.state.imgUrl || this.state.canvas? '': 'hide'}`} onClick={this.deleteImage.bind(this)}>
                        <i className="trash icon"></i>
                    </div>}
                </div>
                <Modal size={'large'} open={this.state.open} onClose={this.close.bind(this)}>
                    <Modal.Header className="modal_image_component_header">
                        <Icon name="times" onClick={this.close.bind(this)}/>
                    </Modal.Header>
                    <Modal.Content className='modal_image_component_content' style={{ height: (window.innerHeight * 0.7) }}>
                            <Dimmer active={this.state.loading}>
                                <Loader />
                            </Dimmer>
                        <ErrorMessage classes={`bcio errorMessage ${this.state.errorImage? '' : 'hide'}`} text={`All sizes are required`}></ErrorMessage>
                        <div className="content_cropper">
                            {
                                this.state.cropper.map((crop, index) => this.getCropper(crop, index))
                            }
                        </div>
                        <div className="content_sizes">
                            {
                                this.state.sizes.map((slot, index) => this.createSlot(slot, index))
                            }
                        </div>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button className="bcio_button" onClick={this.close.bind(this)}>Close</Button>
                        <Button className="bcio_button" onClick={this.uploadImage.bind(this)}>Upload</Button>
                    </Modal.Actions>
                </Modal>

            </div>
        )
    }
}