import React, { Component } from 'react';
import * as THREE from 'three';
import './ImageContainer.scss';

// reference: https://medium.com/@colesayershapiro/using-three-js-in-react-6cb71e87bdf4
class ImageContainer extends Component {

    resizePlaneDependOnWindowAndRatio = (windowWidth, windowHeight, geometryRatio) => {
        if (geometryRatio < 1) {
            const longSideScale = 5.6
            this.plane.scale.x = longSideScale
            this.plane.scale.y = longSideScale * geometryRatio
        } else {
            const longSideScale = 4
            this.plane.scale.x = longSideScale / geometryRatio
            this.plane.scale.y = longSideScale
        }
    }

    createThreeScene = (imageURL) => {
        if (this.props.imageURL.length === 0) {
            return
        }
        // console.log("creating new scene:", imageURL)
        
        const width = this.mount.clientWidth
        const height = this.mount.clientHeight
        //Create Scene
        this.scene = new THREE.Scene()
        //Create Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        )
        this.camera.position.z = 3
        this.camera.position.y -= 0.15
        //Add renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        // this.renderer.setClearColor('#272B2F')
        this.renderer.setSize(width, height)
        this.mount.appendChild(this.renderer.domElement)
        //Add a Plane that has the image as material 
        let geometry = new THREE.PlaneGeometry(1, 1)
        const material = new THREE.MeshBasicMaterial({ color: '#272B2F' } )
        // const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide})
        this.plane = new THREE.Mesh(geometry, material)
        this.scene.add(this.plane)
        this.start()
        new THREE.TextureLoader().load(imageURL, (texture) => {
            this.geometryRatio = texture.image.height / texture.image.width
            this.resizePlaneDependOnWindowAndRatio(width, height, this.geometryRatio)
            const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide})
            this.plane.material = material
        })
        
    }

    updateImage = (imageURL) => {
        if (this.props.imageURL.length === 0) {
            return
        }
        if (this.plane !== undefined) {
            // console.log("updating image")
            this.plane.material.map = new THREE.TextureLoader().load(imageURL, (texture) => {
                this.geometryRatio = texture.image.height / texture.image.width
                this.resizePlaneDependOnWindowAndRatio(this.mount.clientWidth, this.mount.clientHeight, this.geometryRatio)
                const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide})
                this.plane.material = material
            })
        } else {
            this.createThreeScene(imageURL)
        }

    }

    updateDimensions = () => {
        const width = window.innerWidth
        const height = window.innerHeight
        this.renderer.setSize(width, height)
        this.camera.fov = Math.atan(height / 2 / this.camera.position.z) * 2 * THREE.Math.RAD2DEG
        this.camera.aspect = width / height
    }

    componentDidUpdate() {
        // console.log("the image url is: ", this.props.imageURL)
        this.updateImage(this.props.imageURL)
        window.addEventListener("resize", this.updateDimensions)
    }

    componentDidMount(){
        // console.log("the image url is: ", this.props.imageURL)
        this.createThreeScene(this.props.imageURL)
    
    }

    componentWillUnmount(){
        this.stop()
        this.mount.removeChild(this.renderer.domElement)
    }

    start = () => {
        this.translation = { x: 0, y:0, z:0 }
        this.rotation = 0
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId)
    }

    animate = () => {
        this.translation.x += 0.015
        this.translation.y += 0.01
        this.translation.z += 0.005
        this.rotation += 0.01
        this.plane.position.x = 0.1 * Math.cos(this.translation.x)
        this.plane.position.y = 0.1 * Math.sin(this.translation.y)
        this.plane.position.z = 0.05 * Math.sin(this.translation.z)
        this.plane.rotation.y = 0.03 * Math.cos(this.rotation)
        this.renderScene()
        this.frameId = window.requestAnimationFrame(this.animate)
    }

    renderScene = () => {
        this.renderer.render(this.scene, this.camera)
    }
     
    render(){
        return(
            <div className='image-scene' ref={(mount) => { this.mount = mount }}/>
        )
    }
}

export default ImageContainer;