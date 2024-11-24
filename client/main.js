const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { exec } = require('child_process');
var fs = require('fs');

const path = require('path')


const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true,
      preload: path.join(app.getAppPath(), 'preload.js')
    },
  })
  win.setMenuBarVisibility(false)

  win.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    win.webContents.session.on('serial-port-added', (event, port) => {
      console.log('serial-port-added FIRED WITH', port)
    })

    win.webContents.session.on('serial-port-removed', (event, port) => {
      console.log('serial-port-removed FIRED WITH', port)
    })

    event.preventDefault()
    if (portList && portList.length > 0) {
      callback(portList[0].portId)
    } else {
      // eslint-disable-next-line n/no-callback-literal
      callback('') // Could not find any matching devices
    }
  })

  win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (permission === 'serial' && details.securityOrigin === 'file:///') {
      return true
    }

    return false
  })

  win.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === 'serial' && details.origin === 'file://') {
      return true
    }

    return false
  })

  win.loadFile('index.html')
}

ipcMain.handle("compile", async (_, args) => {
  let result;
  exec(`arduino-cli compile /tmp/ss/ss.ino --fqbn Rudiron:MDR32F9Qx:buterbrodR916 --port /dev/ttyUSB0 --upload`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error creating file: ${error}`);
      return;
    }
  });
  return result;
});


ipcMain.handle("select_file", async (_, args) => {
  console.log("Load file ask")
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
  });

  if (result.canceled) return null;

  const filePath = result.filePaths[0];
  const content = fs.readFileSync(filePath, 'utf-8');
  return content;
});


app.whenReady().then(() => {
  createWindow()
})
