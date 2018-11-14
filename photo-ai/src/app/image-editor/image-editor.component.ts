import { Component, OnInit } from '@angular/core';
import 'fabric';
import {saveAs} from 'file-saver';
declare const fabric: any;


@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.css']
})
export class ImageEditorComponent implements OnInit {
  isCropping: boolean = false;
  clipPath: any;
  canvas: any;
  mainImage:any;
  mainImageExists:boolean;

  constructor() { 
   
  }










  /**
   * This will allow to instantiate the canvas and will apply zoom onto canvas.
   * Left means a certain amount of pixels from the left of the object or the canvas.
   * Top mean a certain amount of pixels form the top of the object or the canvas
   */
  ngOnInit() {
    this.canvas = new fabric.Canvas('image-view',{
      backgroundColor: 'rgb(0,0,0,.5)',
      selectionColor: 'blue',
      selectionLineWidth: 5
      });
    this.mainImageExists = false;
    this.canvas.on('mouse:wheel', function(opt) {
        var delta = opt.e.deltaY;
        var pointer = this.getPointer(opt.e);
        var zoom = this.getZoom();
        zoom = zoom + delta/200;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
    }










  /**
   * This will allow the image to show on the canvas after uploading
   * @param event 
   */
  previewFile(event:any): void {
    let reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);

    let ImageEditor = this;
    let canvasHere = this.canvas;
    let MainImageExist = this.mainImageExists;


    reader.onload = function (event: Event) {
      let imageElement = reader.result;
      let imgInstance = new fabric.Image.fromURL(imageElement, function(img) {
        let image = img.set({
            originX: "left",
            originY: "top",
          });
        canvasHere.add(image);
        canvasHere.centerObject(image);
        canvasHere.setActiveObject(image);
        image.setCoords();
        canvasHere.renderAll();
        if(!MainImageExist) {
          ImageEditor.setMainImage(image);
          console.log("Main Image: " + JSON.stringify(image)); 
        }
        else console.log("Image: " + JSON.stringify(image));
      })};
    }








  /**
   * This will set the main image to be edited on
   * @param image 
   */
  setMainImage(image): boolean {
    this.mainImage = image; 
    return true;
  }







  /**
   * This will save the image from the canvas
   * @param event 
   */
  saveFile(event:any): void {
    this.canvas.getElement().toBlob(function(blob){
      saveAs(blob, "editedIMG.png");
    });
  }








  /**
   * This will show the applyable crop area
   * @param event 
   */
  showCropArea(event) {
    this.isCropping = true;
    let clippath = new fabric.Rect({
      width:300,
      height:300,
      opacity: 0,
      originX: "left",
      originY: "top",
    });
    this.canvas.add(clippath);
    let canvasHere = this.canvas;
    let newElement = this.canvas.getObjects().length -1;
    this.clipPath = this.canvas.getObjects()[newElement];
    this.clipPath.on('modified', function() {
      console.log(JSON.stringify(this.getBoundingRect()));
    });
    this.canvas.setActiveObject(this.clipPath);
    this.canvas.renderAll();
  }
  








  /**
   * This will apply the crop form the cropArea
   * @param event 
   */
  crop(event) {
    let mainImage =this.canvas.getObjects()[0];
    let originOfMainX = this.mainImage.getCenterPoint().x;
    let originOfMainY = this.mainImage.getCenterPoint().y;
    let cropMainTop = this.clipPath.top - originOfMainY;
    let cropMainLeft = this.clipPath.left - originOfMainX; 
    console.log("This is the origin of the main image: " + this.mainImage.getCenterPoint());

    //This is clipping where the origin is the center of the main image!
    let actualClipping = new fabric.Rect({
      width:300,
      height:300,
      originX: "left",
      originY: "top",
      top: cropMainTop,
      left: cropMainLeft
    });
    console.log("actualClipping: " + JSON.stringify(actualClipping));
    mainImage.clipPath = actualClipping;
    this.canvas.remove(this.clipPath);
    this.canvas.remove(actualClipping);
    this.canvas.add(mainImage);
    this.canvas.renderAll();
  }

  /**
   * This removes the image
   * @param event 
   */
  remove(event) {
    let active = this.canvas.getActiveObject();
    this.canvas.remove(active);
    this.canvas._objects.pop();
    this.canvas.renderAll();
  }
  
}
