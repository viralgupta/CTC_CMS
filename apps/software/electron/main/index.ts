import { app, BrowserWindow, shell, session, ipcMain, inAppPurchase } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import * as cookieParser from 'cookie'
import dotenv from "dotenv"
import crypto from "node:crypto"
import fs from "node:fs"
import * as shutdown from 'electron-shutdown-command';
// import { Client } from "whatsapp-web.js"

dotenv.config();

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { Client, LocalAuth } = require('whatsapp-web.js');
if (require('electron-squirrel-startup')) app.quit();

process.env.APP_ROOT = path.join(__dirname, '../..')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: app.getPath("userData")
  })
})

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload
    },
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  const allFilter = { urls: [`${process.env.VITE_API_BASE_URL}/*`] };

  session.defaultSession.cookies.on("changed", (_event, cookie, cause, removed) => {
    if (cookie.name == "__Secure-authjs.session-token") {
      if ((removed && cause !== "overwrite") || cookie.value == "") {
        app.quit();
      };
    }
  })

  // set headers in request using electron class before sending
  session.defaultSession.webRequest.onBeforeSendHeaders(allFilter, async (details, callback) => {

    // set cookies
    const cookies = await session.defaultSession.cookies.get({ domain: new URL(details.url).hostname }).then((cookies) => {
      return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
    })
    
    if (cookies.length > 0) details.requestHeaders.cookie = cookies;

    // set timestamp & signature
    if(details.url.includes("/api/")){
        const timestamp = Date.now().toString();

        const privateKeyPem = fs.readFileSync(path.join(process.env.VITE_PUBLIC, 'private_key.pem'), "utf-8");
        
        const sign = crypto.createSign('SHA256');
        sign.update(timestamp);
        const signature = sign.sign(privateKeyPem, 'base64'); 
      
        details.requestHeaders.timestamp = timestamp;
        details.requestHeaders.signature = signature;
    }

    callback({ requestHeaders: details.requestHeaders });
  });

  // set cookies using electron class when receiving response
  session.defaultSession.webRequest.onHeadersReceived(allFilter, (details, callback) => {

    // cancel redirect
    if(details.responseHeaders && details.responseHeaders['location'] !== null && details.responseHeaders['location'] !== undefined) {
      if(details.responseHeaders['location'][0].includes('error=Configuration')){
        win?.webContents.send('Error', "Invalid OTP!!!")
        callback({ responseHeaders: details.responseHeaders });
        return;
      } else if(details.responseHeaders['location'][0].includes('error')) {
        win?.webContents.send('Error', "Some error occured while logging in!!!")
        callback({ responseHeaders: details.responseHeaders });
        return;
      }
    }

    if(details.responseHeaders && details.responseHeaders['set-cookie']) {
      const cookies = details.responseHeaders['set-cookie'];
      cookies.forEach(async (cookie) => {
        const parsedCookie = cookieParser.parse(cookie);
          if (parsedCookie) {
            const firstKey = Object.keys(parsedCookie)[0];
            session.defaultSession.cookies.set({
              url: details.url,
              name: firstKey,
              value: parsedCookie[firstKey],
              path: parsedCookie.Path,
              sameSite: "no_restriction",
            });
          }
      })
    }
    callback({ responseHeaders: details.responseHeaders });
  })

  client.initialize();

  client.on("qr", (qr: string) => {
    if(win) {
      win.webContents.send("whatsapp-disconnected");
      win.webContents.send("qr-created", qr);
    }
  })

  client.on('disconnected', () => {
    if(win) {
      win.webContents.send("whatsapp-disconnected");
    }
  })

  client.on("ready", () => {
    if(win) {
      win.webContents.send("whatsapp-connected");
    }
  })

  ipcMain.handle("get-whatsapp-info", async (_event, data) => {
    const WID = await client.getNumberId(data.country_code + data.phone_number);
    let profileUrl = null;
    if(WID?._serialized){
      profileUrl = await client.getProfilePicUrl(WID._serialized);
    }
    return {
      WID: WID?._serialized ?? null,
      ProfileUrl: profileUrl ?? null,
    }
  });

  ipcMain.handle("is-whatsapp-client-ready", async ()=> {
    if(!win || !client) return false;
    try {
      const whatsappState = await client.getState();
      return whatsappState == "CONNECTED";
    } catch (error) {
      return false;
    }
  })

  ipcMain.handle("EMERGENCY", async () => {
    await clearAppData(true);
    // lock the db
    shutdown.shutdown({
      force: true,
      quitapp: true
    })
  })

  createWindow();
})

app.on('window-all-closed', () => {
  win = null;
  if (process.platform !== 'darwin') app.quit();
})

app.on("before-quit", async () => {
  await clearAppData()
})


app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

async function clearAppData(deep = false) {
  const promises = [];
  const clearStoragePromise = session.defaultSession.clearStorageData();
  promises.push(clearStoragePromise);
  const clearCache = session.defaultSession.clearCache();
  promises.push(clearCache);
  const authCachePromise = session.defaultSession.clearAuthCache();
  promises.push(authCachePromise);
  const clearCodeCachesPromise = session.defaultSession.clearCodeCaches({});
  promises.push(clearCodeCachesPromise);
  const clearHostResolverCachePromise = session.defaultSession.clearHostResolverCache();
  promises.push(clearHostResolverCachePromise);
  // const clearDataPromise = session.defaultSession.clearData();
  // promises.push(clearDataPromise);
  if (deep) {
    const rmDirPromise = new Promise((res) => {
      try {
        fs.rm(app.getPath("userData"), {
          force: true,
          recursive: true,
          maxRetries: 1
        }, () => {
          res(true);
        });
      } catch (error) {
        console.log("error while removing app data", error)
      }
    })
    promises.push(rmDirPromise);
  }
  await Promise.all(promises);
}