const { contextBridge, ipcRenderer } = require('electron');

// 暴露一个名为 'electronAPI' 的全局对象到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 示例：暴露一个可以从渲染进程调用的函数
  // send: (channel, data) => ipcRenderer.send(channel, data),
  // receive: (channel, func) => {
  //   // Deliberately strip event as it includes `sender`
  //   ipcRenderer.on(channel, (event, ...args) => func(...args));
  // }
  // 你可以在这里添加更多需要从渲染进程访问的 Node.js 或 Electron API
  // 例如，读取文件、访问操作系统信息等，但要确保安全
  // getAppVersion: () => ipcRenderer.invoke('get-app-version') // 示例：如果主进程有对应处理
});

console.log('Preload script loaded.');