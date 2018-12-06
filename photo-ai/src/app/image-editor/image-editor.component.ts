import { Component, OnInit } from '@angular/core';
import 'fabric';
import 'jquery';
import { ConfirmationService } from 'primeng/api';
import * as JSZip from 'jszip';
import 'file-saver';
import { Point } from 'fabric/fabric-impl';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

declare const fabric: any;
declare function pyRun(input, outDir, brightnessFactor, callback): any;


@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.css'],
  providers: [ConfirmationService]
})
export class ImageEditorComponent implements OnInit {
  public canCrop: boolean;
  private isOriginalOrientation: boolean;
  private clipPath: any;
  private canvas: any;
  private mainImage: any;
  private mainImageExists: boolean;
  private canSave: boolean;
  private isTuning: boolean;
  private undoStack: Object[] = [];
  private redoStack: Object[] = [];
  private savedCoords: Point[] = [];
  private savedBound: Object[] = [];
  private left: number;
  private top: number;
  private width: number;
  private height: number;
  public ngxLoading = false;
  private panning = false;

  constructor(private confirmationService: ConfirmationService) { }

  /**
   * This will allow to instantiate the canvas and will apply zoom onto canvas.
   * Left means a certain amount of pixels from the left of the object or the canvas.
   * Top mean a certain amount of pixels form the top of the object or the canvas
   */
  ngOnInit() {
    const CLASS_CTX = this

    this.canvas = new fabric.Canvas('image-view', {
      backgroundColor: 'rgb(0,0,0,.5)',
      // selectionColor: 'grey',
      // selectionLineWidth: 10
    });
    this.canvas.selection = false;
    this.canSave = false;
    this.mainImageExists = false;
    this.canCrop = false;
    this.isOriginalOrientation = true;
    this.canvas.on('mouse:wheel', function (opt) {
      const delta = opt.e.deltaY;
      const pointer = this.getPointer(opt.e);
      let zoom = this.getZoom();
      zoom = zoom + delta / 200;
      if (zoom > 20) { zoom = 20; }
      if (zoom < 0.01) { zoom = 0.01; }
      this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
    this.canvas.on('mouse:up', function (e) {
      if(CLASS_CTX.mainImageExists && !CLASS_CTX.canCrop)
        CLASS_CTX.panning = false;
    });

    this.canvas.on('mouse:down', function (e) {
      if (CLASS_CTX.mainImageExists && !CLASS_CTX.canCrop)
        CLASS_CTX.panning = true;
    });
    this.canvas.on('mouse:move', function (e) {
      if (!CLASS_CTX.canCrop && CLASS_CTX.panning && e && e.e) {
        const units = 10;
        const delta = new fabric.Point(e.e.movementX, e.e.movementY);
        CLASS_CTX.canvas.relativePan(delta);
      }
    });
  }

  /**
   * This will allow the person to upload the file after clicking the button to trigger
   * the preview file
   */
  uploadFile(event: any): void {
    const uploadBtn = document.getElementById('upload');
    uploadBtn.click();
  }

  /**
   * This will allow the image to show on the canvas after uploading
   */
  previewFile(event: any): void {
    const reader = new FileReader();
    const file: any = event.target.files[0];
    console.log("FILE TYPE:", file.type)

    const CONVERT_DIR = "converted"

    if (file.type === "image/x-sony-arw") {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to convert photo from dark to light?',
        accept: () => {
          this.ngxLoading = true;
          // this.http.get("../data/navItems.json")
          // Actual logic to perform a confirmation

          const algorithmInput = file.path
          console.log("algorithm input:", algorithmInput)

          pyRun(algorithmInput, CONVERT_DIR, 200.0, (err, stdout, stderr) => {
            const inform = err ? console.error : console.log
            inform(err)
            inform(stdout)
            inform(stderr)

            if (err) {
              console.error("ML script failed! See above for details.")
            } else {
              console.log("Algorithm finished!")

              // get the converted file
              const fileNameNoExtension = file.path.split("/").pop().slice(0, -4)
              const convertedFileName = fileNameNoExtension + "_out.png"
              const convertedFilePath = CONVERT_DIR + "/" + convertedFileName
              console.log("Expected file name:", convertedFileName)

              console.log("Reading buffer...")
              const convertedBuffer = window['fs'].readFileSync(convertedFilePath)
              console.log(convertedBuffer)
              reader.readAsDataURL(new Blob([convertedBuffer.buffer]))
            }
          })

        },
      });
    } else {
      // case: not a RAW photo
      console.log("Reading as normal image")
      reader.readAsDataURL(file);
    }
    const ImageEditor = this;
    const canvasHere = this.canvas;
    const MainImageExist = this.mainImageExists;

    reader.onload = function (loadevent: Event) {
      ImageEditor.ngxLoading = false;
      const imageElement = reader.result;
      const imgInstance = new fabric.Image.fromURL(imageElement, function (img) {
        const image = img.set({
          originX: 'left',
          originY: 'top',
          selectable: false
        });
        if (MainImageExist === false) {
          ImageEditor.setMainImage(image);
        } else {
          const clearBtn = document.getElementById('clear-btn');
          clearBtn.click();
          ImageEditor.setMainImage(image);
        }
        canvasHere.add(image);
        canvasHere.centerObject(image);
        image.setCoords();
        ImageEditor.saveOrientationCoords();
        canvasHere.renderAll();
        ImageEditor.canSave = true;
        ImageEditor.isOriginalOrientation = true;
      });
    };
    this.mainImageExists = true;
    event.target.value = '';
  }


  /**
   * This will save the bounding rectangle coordinates, original and rotated
   */
  saveOrientationCoords(): void {
    this.savedCoords['original'] = new fabric.Point(this.mainImage.left, this.mainImage.top);
    this.savedBound['original'] = this.mainImage.aCoords;
    this.mainImage.rotate(-90);
    this.mainImage.setCoords();
    this.savedCoords['rotated'] = new fabric.Point(this.mainImage.left, (this.mainImage.top - this.mainImage.width));
    this.savedBound['rotated'] = {
      tl: this.mainImage.aCoords.tr, tr:
        this.mainImage.aCoords.br, br: this.mainImage.aCoords.bl, bl: this.mainImage.aCoords.tl
    };
    this.mainImage.rotate(0);
    this.mainImage.setCoords();
  }

  /**
   * This will set the main image to be edited on
   */
  setMainImage(image): boolean {
    this.mainImage = image;
    return true;
  }
  /**
   * This will push into either the undo or redo stack.
   */
  pushIntoStack(stack: Object[]): void {
    const data = this.canvas.toJSON();
    stack.push(data)
    if (stack.length > 3) {
      stack.shift();
    }
  }

  /**
   * This will allow the user to undo changes up until 3 times.
   *
   */
  undo(event: any): void {
    if (this.mainImageExists === false) {
      return;
    }
    const ImageEditor = this;
    if (this.undoStack.length > 0) {
      this.pushIntoStack(this.redoStack);
      const oldState = this.undoStack.pop();
      this.canvas.loadFromJSON(oldState, this.canvas.renderAll.bind(this.canvas), function (o, object) {
        object.set('selectable',false);
        ImageEditor.setMainImage(object);
      });
    }
  }

  /**
   * This will allow the user to redo changes up until 3 times.
   */
  redo(event: any): void {
    if (this.mainImageExists === false) {
      return;
    }
    const ImageEditor = this;
    if (this.redoStack.length > 0) {
      this.pushIntoStack(this.undoStack);
      const oldState = this.redoStack.pop();
      this.canvas.loadFromJSON(oldState, this.canvas.renderAll.bind(this.canvas), function (o, object) {
        object.set('selectable',false);
        ImageEditor.setMainImage(object);
      });
    }
  }

  //
  //
  // /**
  //  * This will save the image from the canvas
  //  *
  //  */
  // saveFile(event:any): void {
  //   this.canvas.setViewportTransform([1,0,0,1,0,0]);
  //   if(this.canSave){
  //       let dataUrl = this.canvas.toDataURL({
  //         format:'png',
  //         left:this.mainImage.left,
  //         top:this.mainImage.top,
  //         width:this.mainImage.width,
  //         height:this.mainImage.height,
  //       });
  //       const dlBtn = document.getElementById("save");
  //       dlBtn.setAttribute("href",dataUrl);
  //
  //   }
  // }

  /**
   * This will show the applyable crop area
   *
   */
  showCropArea(event): void {
    if (this.mainImageExists === false) {
      return;
    }
    this.canCrop = true;
    let topBorder :number;
    let leftBorder :number;
    let rightBorder :number;
    let bottomBorder :number;
    if(!this.isOriginalOrientation){
      this.left = this.savedCoords["rotated"].x;
      this.top = this.savedCoords["rotated"].y;
      this.width = this.mainImage.height;
      this.height = this.mainImage.width;
      topBorder = this.savedBound['rotated'].tl.y;
      leftBorder = this.savedBound['rotated'].tl.x;
      rightBorder = this.savedBound['rotated'].tr.x;
      bottomBorder = this.savedBound['rotated'].br.y;
    } else {
      this.left = this.savedCoords['original'].x;
      this.top = this.savedCoords['original'].y;
      this.width = this.mainImage.width;
      this.height = this.mainImage.height;
      topBorder = this.savedBound['original'].tl.y;
      leftBorder = this.savedBound['original'].tl.x;
      rightBorder = this.savedBound['original'].tr.x;
      bottomBorder = this.savedBound['original'].br.y;
    }
    const clippath = new fabric.Rect({
      width: this.width,
      height: this.height,
      opacity: 0,
      originX: 'left',
      originY: 'top',
      left: this.left,
      top: this.top,
      lockRotation: true
    });
    clippath.on('moved', function () {
      if (this.aCoords.tl.y < topBorder) {
        this.top = topBorder;
      }
      if (this.aCoords.bl.y > bottomBorder) {
        this.top = bottomBorder - (this.height * this.scaleY);
      }
      if (this.aCoords.tr.x > rightBorder) {
        this.left = rightBorder - (this.width * this.scaleX);
      }
      if (this.aCoords.tl.x < leftBorder) {
        this.left = leftBorder;
      }
    });
    const canvasHere = this.canvas;
    canvasHere.add(clippath);
    canvasHere.centerObject(clippath);
    canvasHere.setActiveObject(clippath);
    clippath.setCoords();
    canvasHere.renderAll();
    this.clipPath = clippath;
  }


  /**
   * This will allow the user to remove the crop area
   *
   */
  removeCropArea(event): void {
    this.canvas.remove(this.clipPath);
    this.clipPath = null;
    this.canCrop = false;
    this.canvas.renderAll();
  }

  /**
   * This will apply the crop form the cropArea
   * This origin for the cropping is based on the center of the main image.
   * Rendering is not enough to reveal the image. You must set the image cache to be true
   * so it can be rerendered.
   *
   */
  crop(event) : void {
    // Crop is pushed onto undoStack and resets redoStack
    this.pushIntoStack(this.undoStack); 
    this.redoStack = [];
    this.canvas.setViewportTransform([1,0,0,1,0,0]);
    let ImageEditor = this;
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
    // This is clipping where the origin is the center of the main image!
    const imgInstance = new fabric.Image.fromURL(dataUrl, function (img) {
      const image = img.set({
        originX: 'left',
        originY: 'top',
        selectable: false
      });
      ImageEditor.canvas.remove(ImageEditor.mainImage);
      ImageEditor.setMainImage(image);
      ImageEditor.isOriginalOrientation = true;
      ImageEditor.canvas.add(image);
      ImageEditor.canvas.centerObject(image);
      ImageEditor.saveOrientationCoords();
      image.setCoords();
    });
    this.canvas.remove(this.clipPath);
    this.canvas.renderAll();
    this.canCrop = false;
  }

  /**
   * This will allow the image to rotate
   */
  rotate(number: number): void {
    if (this.mainImageExists === false) 
      return;
    // Adds the previous rotation state into undo stack
    this.pushIntoStack(this.undoStack);
    this.redoStack = [];
    let currentAngle = this.mainImage.angle;
    this.mainImage.rotate((currentAngle + number) % 360);
    this.mainImage.setCoords();
    if (Math.abs(this.mainImage.angle) === 0 || Math.abs(this.mainImage.angle) === 180) {
      this.isOriginalOrientation = true;
    } else { this.isOriginalOrientation = false; }
    this.canvas.renderAll();
  }

  /**
   * This removes the image and will clear all information from the canvas
   *
   */
  clear(event: any): void {
    if (this.mainImageExists === false) {
      return;
    }
    const active = this.canvas.getActiveObject();
    const canvasObjects = this.canvas.getObjects();
    const length = canvasObjects.length;
    for (let i = 0; i < length; i++) {
      this.canvas.remove(canvasObjects[i]);
    }
    this.resetAllValues();
    this.canvas.renderAll();
  }

  /**
   * This returns all instance variables back to default values
   */
  resetAllValues(): void {
    this.canCrop = false;
    this.undoStack = [];
    this.redoStack = [];
    this.mainImage = null;
    this.mainImageExists = false;
    this.canSave = false;
    this.isOriginalOrientation = true;
    this.clipPath = null;
    this.savedCoords = [];
    this.savedBound = [];
    this.left = null;
    this.top = null;
    this.width = null;
    this.height = null;
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  }

  /**
   * This will save the image from the canvas
   */
  saveFile(event: any): void {
    if (this.mainImageExists === false) {
      return;
    }
    if (this.canSave) {
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      if (!this.isOriginalOrientation) {
        this.left = this.savedCoords['rotated'].x;
        this.top = this.savedCoords['rotated'].y;
        this.width = this.mainImage.height;
        this.height = this.mainImage.width;
      } else {
        this.left = this.savedCoords['original'].x;
        this.top = this.savedCoords['original'].y;
        this.width = this.mainImage.width;
        this.height = this.mainImage.height;
      }
      const dataUrl = this.canvas.toDataURL({
        format: 'png',
        left: this.left,
        top: this.top,
        width: this.width,
        height: this.height
      });

      const imageData = dataUrl.split(',')[1];
      const zip = new JSZip();
      zip.file('download.png', imageData, { base64: true });
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        saveAs(content, 'image.zip');
      });
    }
  }

}
