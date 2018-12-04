const Splashscreen = require('@trodi/electron-splashscreen/index');
const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const notify = require('electron-main-notification');

let win;
function createWindow () {
  const windowOptions = {width: 1400, height: 900, show: false};
  win = new BrowserWindow(windowOptions); // load the dist folder from Angular
  win.on('closed', () => {
    win = null
  });

  win = Splashscreen.initSplashScreen({
    windowOpts: windowOptions,
    templateUrl: path.join(__dirname, '', 'day-night.png'),
    delay: 0, // force show immediately since example will load fast
    minVisible: 1500, // show for 1.5s so example is obvious
    splashScreenOpts: {
      height: 512,
      width: 512,
      transparent: true,
    },
  });
  const fileurl = url.format({
    pathname: path.join(__dirname, 'dist/photo-ai/index.html'),
    protocol: 'file:',
    slashes: true
  });
  win.loadURL(fileurl);
// Open the DevTools optionally:
  win.webContents.openDevTools();
  win.setMenu(null);
}

  app.setAppUserModelId('Photo-Ai');
  app.on('ready', createWindow);
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  });
  app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
  });
  app.on('ready', () => {
    notify('Welcome!', {body: 'This is photo-editor in Electron!'}, () => {
      console.log('The notification got clicked on!')
    })
  });

