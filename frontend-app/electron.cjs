const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');


function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'), // 如果您有预加载脚本
      contextIsolation: true,
      nodeIntegration: false, // 为了安全，推荐设置为 false，并通过 preload 暴露特定 API
    },
  });

  // 加载应用
  // app.isPackaged 在应用打包后为 true，开发时为 false
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    // 开发模式下加载 Vite 开发服务器
    mainWindow.loadURL('http://localhost:5173');
    // 打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式下加载打包后的 index.html
    // 通常打包工具会将 vite build 的输出（默认为 dist 目录的内容）放到asar包的根目录
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    // 在生产环境也打开开发者工具，以便调试白屏问题
    mainWindow.webContents.openDevTools(); 
  }

  // 可以在这里处理 IPC 事件，例如：
  // ipcMain.on('some-event', (event, arg) => {
  //   console.log(arg); // "ping"
  //   event.reply('some-reply', 'pong');
  // });
}

// Electron 应用准备好后创建窗口
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // 在 macOS 上，当单击 dock 图标并且没有其他窗口打开时，
    // 通常会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 当所有窗口都关闭时退出应用，除了 macOS。
// 在 macOS 上，应用程序及其菜单栏通常保持活动状态，直到用户使用 Cmd + Q 显式退出。
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// 您可以在此文件中包含应用程序的其他主进程代码。
// 也可以将它们放在单独的文件中并在此处 require 它们。