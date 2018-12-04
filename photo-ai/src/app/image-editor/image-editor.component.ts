import {Component, OnInit} from '@angular/core';
import 'fabric';
import 'jquery';
import {ConfirmationService} from 'primeng/api';

import { Canvas, Point } from 'fabric/fabric-impl';
declare const fabric: any;


@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.css'],
  providers: [ConfirmationService]
})
export class ImageEditorComponent implements OnInit {
  canCrop: boolean = false;
  clipPath: any;
  canvas: any;
  mainImage:any;
  mainImageExists:boolean;
  canSave:boolean;
  undoStack: Object[] = [];
  redoStack: Object[] =[];

  constructor(private confirmationService: ConfirmationService){}

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
    let img = this.mainImage;
    this.canSave = false;
    this.mainImageExists = false;
    let imageExists = this.mainImageExists;
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
   * This will allow the person to upload the file after clicking the button to trigger 
   * the preview file 
   * @param event 
   */
  uploadFile(event:any): void {
    const uploadBtn = document.getElementById("upload");
    uploadBtn.click();
  }



  /**
   * This will allow the image to show on the canvas after uploading
   * @param event 
   */
  previewFile(event:any): void {
    let reader = new FileReader();
    const file: Blob = event.target.files[0];
    console.log(file.type);
    reader.readAsDataURL(file);

    //Need some sort of if-check here!
    if(file.type.includes('arw')) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to convert photo from dark to light?',
      accept: () => {
        //Actual logic to perform a confirmation
      },
    });
    }

    let ImageEditor = this;
    let canvasHere = this.canvas;
    let MainImageExist = this.mainImageExists;


    reader.onload = function (event: Event) {
      let imageElement = reader.result;
      let imgInstance = new fabric.Image.fromURL(imageElement, function(img) {
        let image = img.set({
            originX: "left",
            originY: "top",
            selectable: false
          });
          if(MainImageExist == null) {
            ImageEditor.setMainImage(image);
          }
          else {
            const clearBtn = document.getElementById("clear-btn");
            clearBtn.click();
            ImageEditor.setMainImage(image);
          }
          canvasHere.add(image);
          canvasHere.centerObject(image);
          image.setCoords();
          canvasHere.renderAll();
          ImageEditor.canSave = true;
        })};
    event.target.value="";
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
   * This will push into either the undo or redo stack.
   * @param stack 
   */
  pushIntoStack(stack:object[]) : void{
    let data = this.canvas.toJSON();
    stack.push(data);
  }



  /**
   * This will allow the user to undo changes up until 3 times.
   * @param event 
   */
  undo(event:any): void {
    let ImageEditor = this;
    if(this.undoStack.length > 0){
      this.pushIntoStack(this.redoStack);
      let oldState = this.undoStack.pop();
      this.canvas.loadFromJSON(oldState, this.canvas.renderAll.bind(this.canvas), function(o,object){
        ImageEditor.setMainImage(object);
      });
    }
  }




  /**
   * This will allow the user to redo changes up until 3 times.
   * @param event 
   */
  redo(event:any): void {
    let ImageEditor = this;
    if(this.redoStack.length > 0){
      this.pushIntoStack(this.undoStack);
      let oldState = this.redoStack.pop();
      this.canvas.loadFromJSON(oldState, this.canvas.renderAll.bind(this.canvas), function(o,object){
        ImageEditor.setMainImage(object);
      });
    }
  }







  /**
   * This will save the image from the canvas
   * @param event 
   */
  saveFile(event:any): void {
    this.canvas.setViewportTransform([1,0,0,1,0,0]);
    if(this.canSave){
        let dataUrl = this.canvas.toDataURL({
          format:'png',
          left:this.mainImage.left,
          top:this.mainImage.top,
          width:this.mainImage.width,
          height:this.mainImage.height,
        });
        const dlBtn = document.getElementById("save");
        dlBtn.setAttribute("href",dataUrl);

    }
  }

  /**
   * This will show the applyable crop area
   * @param event 
   */
  showCropArea(event) : void {
    this.canCrop = true;
    this.pushIntoStack(this.undoStack); //this will push into the undo stack
    let clippath = new fabric.Rect({
      width:this.mainImage.width,
      height:this.mainImage.height,
      opacity: 0,
      originX: "left",
      originY: "top",
      lockRotation: true
    });
    let topBorder = this.mainImage.aCoords.tl.y;
    let leftBorder = this.mainImage.aCoords.tl.x;
    let rightBorder = this.mainImage.aCoords.tr.x;
    let bottomBorder = this.mainImage.aCoords.br.y;
    clippath.on('moved', function(){
      if(this.aCoords.tl.y < topBorder)
        this.top = topBorder;
      if(this.aCoords.bl.y > bottomBorder)
        this.top = bottomBorder-(this.height*this.scaleY);
      if(this.aCoords.tr.x > rightBorder)
        this.left = rightBorder-(this.width*this.scaleX);
      if(this.aCoords.tl.x < leftBorder)
        this.left = leftBorder;
    });
    let canvasHere = this.canvas;
    canvasHere.add(clippath);
    canvasHere.centerObject(clippath);
    canvasHere.setActiveObject(clippath);
    clippath.setCoords();
    canvasHere.renderAll();
    this.clipPath = clippath;
    }
  
  








  /**
   * This will apply the crop form the cropArea
   * This origin for the cropping is based on the center of the main image.
   * Rendering is not enough to reveal the image. You must set the image cache to be true
   * so it can be rerendered.
   * @param event 
   */
  crop(event) : void {
    this.canvas.setViewportTransform([1,0,0,1,0,0]);
    let ImageEditor = this;
    let originOfMainX = this.mainImage.getCenterPoint().x;
    let originOfMainY = this.mainImage.getCenterPoint().y;
    //This moves the crop according to the center of the main image
    let cropMainTop = this.clipPath.top - originOfMainY;
    let cropMainLeft = this.clipPath.left - originOfMainX; 
    //If the user rescales, then the cropping will follow the rescaling
    let cropWidth = this.clipPath.width*this.clipPath.scaleX; 
    let cropHeight = this.clipPath.height*this.clipPath.scaleY;

    let dataUrl = this.canvas.toDataURL({
      format:'png',
      left:this.clipPath.left,
      top:this.clipPath.top,
      width:cropWidth,
      height:cropHeight
    });
    //This is clipping where the origin is the center of the main image!
    let imgInstance = new fabric.Image.fromURL(dataUrl,function(img){
      let image = img.set({
        originX:"left",
        originY:"top",
        selectable:false
      });
      ImageEditor.canvas.remove(ImageEditor.mainImage);
      ImageEditor.setMainImage(image);
      ImageEditor.canvas.add(image);
      ImageEditor.canvas.centerObject(image);
      image.setCoords();
    });
    this.canvas.remove(this.clipPath);
    this.canvas.renderAll();
    this.canCrop = false;
  }




  /**
   * This removes the image and will clear all information from the canvas
   * @param event 
   */
  clear(event:any) :void {
    if(this.canCrop)
      this.canCrop = false;
    let active = this.canvas.getActiveObject();
    let canvasObjects = this.canvas.getObjects();
    let length=canvasObjects.length;
    for (let i= 0; i< length; i++) {
      this.canvas.remove(canvasObjects[i]);
    } 
    this.undoStack=[];
    this.redoStack=[];
    this.mainImage = false;
    this.mainImageExists = false;
    this.canvas.renderAll();
    this.canSave = false;
  }
  
}
