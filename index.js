const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: false
    },
    icon: './sound-wave.ico',
    frame: false,
    transparent: true, 
  })

  win.loadFile('index.html')
  win.setMenuBarVisibility(false)
}
app.whenReady().then(createWindow)

global.closeApp = function(){
    app.quit();
}
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('maximize', () => {
    app.unmaximize()
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});