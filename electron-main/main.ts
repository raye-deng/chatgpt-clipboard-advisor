import {app, BrowserWindow, globalShortcut} from "electron";
import path from "path";
import {addShortCutListener} from "./listener";
import ChannelListener from "./channel";


const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true, // 是否开启隔离上下文
            nodeIntegration: true, // 渲染进程使用Node API
            preload: path.join(__dirname, "./preload.js"), // 需要引用js文件
        },
    });


    console.log('app ready,start listening');
    addShortCutListener(); //注册全局监听事件
    new ChannelListener(win).init(); // 初始化openai client
    // 如果打包了，渲染index.html
    if (app.isPackaged) {
        win.loadFile(path.join(__dirname, "../index.html"));
    } else {
        let url = "http://localhost:3000"; // 本地启动的vue项目路径
        win.loadURL(url);
    }
};


app.whenReady().then(() => {
    createWindow(); // 创建窗口
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});


// 关闭窗口
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll()
})