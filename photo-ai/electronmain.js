const Splashscreen = require('@trodi/electron-splashscreen/index');
const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const notify = require('electron-main-notification');

let win;
function createWindow () {
  const windowOptions = {width: 1400, height: 900, show:false};
  win = new BrowserWindow(windowOptions); // load the dist folder from Angular

// Open the DevTools optionally:
  win.webContents.openDevTools();
  win.on('closed', () => { win = null });

  win = Splashscreen.initSplashScreen({
    windowOpts: windowOptions,
    templateUrl: path.join(__dirname, '', 'hangman.svg'),
    delay: 0, // force show immediately since example will load fast
    minVisible: 1500, // show for 1.5s so example is obvious
    splashScreenOpts: {
      height: 500,
      width: 500,
      transparent: true,
    },
  });
  win.loadURL(url.format({ pathname: path.join(__dirname, 'dist/index.html'), protocol: 'file:', slashes: true }));
  win.setMenu(null);
}


app.setAppUserModelId('Night-2-Light');
app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') { app.quit() } });
app.on('activate', () => { if (win === null) { createWindow() } });
app.on('ready', () => {
  notify('Welcome!', { body: 'This is Night-2-Light in Electron!' }, () => {
    console.log('The notification got clicked on!')
  })
});
