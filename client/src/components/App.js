import React, { Component } from 'react';
// import Uploader from './Uploader/Uploader';
import ImageContainer from './ImageContainer/ImageContainer';
import axios from 'axios';
import './App.scss';

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      imageURL: '',
      imageID: 0,
      maxID: 0,
      prev: true,
      next: true
    }
  }

  getImageFromServer = (id) => {
    return new Promise((resolve, reject) => {
      // console.log("getting image id: ", id)
      const path = '/api/' + id
      this.instance.get(path, {
        responseType: 'blob',
        timeout: 30000,
      }).then(
        (res) => {
          if (res.status === 200) {
            const url = URL.createObjectURL(res.data)
            resolve(url)
            // this.setState({ imageURL: url, imageID: id })
          } else {
            console.log(res.status, res.statusText)
            reject(res.statusText)
          }
        }
      ).catch(
        err => {
          console.log(err)
          reject(err)
        }
      )
    })
  }

  updateMaxID = () => {
    this.instance.get('/api/getmax').then(
      (res) => {
        if (res.status === 200) {
          this.setState({ maxID: res.data })
          if (this.state.imageID >= res.data) {
            this.setState({ next: true })
          }
        }
        this.updateButtonStatus()
      }
    ).catch(
      (err) => {
        console.log(err)
      }
    )
  }

  updateButtonStatus = () => {
    if (this.state.imageID <= 1) {
      this.setState({ prev: true })
    }
    if (this.state.imageID >= this.state.maxID) {
      this.setState({ next: true })
    }
    if (this.state.imageID < this.state.maxID && this.state.next === true) {
      this.setState({ next: false })
    }
    if (this.state.imageID > 1 && this.state.prev === true) {
      this.setState({ prev: false })
    }
  }

  componentDidMount() {
    this.instance = axios.create({
      baseURL: 'http://localhost:8000'
    });
    // this.serverRoute = 'http://localhost:8000'
    this.eligibleFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
    this.getNextImage()
  }

  getUploadedImage = (event) => {
    const file = event.target.files[0]

    if (file !== undefined) {

      // check if file is image
      if (!this.eligibleFileTypes.includes(file.type)) {
        alert('Please upload an image!')
        return
      }

      // console.log("saving image in database")
      let bodyFormData = new FormData()
      bodyFormData.append('image', file)
      this.instance({
          method: 'post',
          url: '/api/upload',
          data: bodyFormData,
          config: { headers: {'Content-Type': 'multipart/form-data' } }
      }).then(
        (res) => {
          if (res.status === 200) {
            // console.log("uploaded:", URL.createObjectURL(file))
            this.setState({ imageURL: URL.createObjectURL(file), imageID: res.data, maxID: res.data }, () => {
              this.updateButtonStatus()
            })
          } else {
            console.log(res.status, res.statusText)
          }
        }
      ).catch(
        (err) => {
          console.log(err)
        }
      )      
    }
  }

  getPrevImage = () => {
    // console.log('showing prev image')
    this.getImageFromServer(this.state.imageID - 1).then(
      (url) => {
        this.setState({ imageURL: url, imageID: this.state.imageID - 1 }, () => {
          this.updateButtonStatus()
        })
      }
    ).catch(
      (err) => {
        console.log(err)
      }
    )
  }

  getNextImage = () => {
    // console.log('showing next image')
    this.getImageFromServer(this.state.imageID + 1).then(
      (url) => {
        this.setState({ imageURL: url, imageID: this.state.imageID + 1 }, () => {
          this.updateMaxID()
        })
      }
    ).catch(
      (err) => {
        console.log(err)
      }
    )
  }

  render() {
    return (
      <div>
        <div>
            <header className='upload-header'>
                <div className='header-field'>&#9633; IMAGE SHARE</div>
                <div className='header-field'>
                    <button onClick={this.getPrevImage} disabled={this.state.prev}>&#8592;</button>
                    <div className='date'>{this.state.imageID}</div>
                    <button onClick={this.getNextImage} disabled={this.state.next}>&#8594;</button>
                </div>
                <input className='upload-input' type='file' id='upload-image' onChange={this.getUploadedImage} />
                <label className='header-field' htmlFor='upload-image'>UPLOAD</label>
            </header>
        </div>
        <ImageContainer imageURL={this.state.imageURL} />
      </div>
    );
  }
}

export default App;
