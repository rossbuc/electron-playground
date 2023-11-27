import { app, shell, BrowserWindow, ipcMain, dialog } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import { opendir, isDirectory, stat, readdirSync } from "fs"
const path = require("path")
const fs = require("fs")
const mm = require("music-metadata")
const util = require("util")
const { writeFile } = require("fs/promises")

const handleFileOpen = async (): Promise<T> => {
  const { canceled, filePaths } = await dialog.showOpenDialog({})
  if (!canceled) {
    return filePaths[0]
  }
}

const handleFileExplorer = async (): Promise<T> => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory", "openFile", "multiSelections", "treatPackageAsDirectory"]
  })
  // await opendir("./main", (err, dir): T => {
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     console.log("Path of the directory", dir.path)
  //     return dir.read()
  //   }
  // })

  if (!canceled) {
    console.log(filePaths)

    console.log("The timer has started at ")
    await parseDir(filePaths)
    console.log("The timer has finished at ")
    return filePaths
  }
}

// const parseDir = (dirContents: string[] | string): void => {
//   dirContents.isArray()
//     ? dirContents.map((path) => {
//         stat(path, (err, stats) => {
//           if (err) {
//             console.log(err)
//           } else {
//             console.log("The stats of this path are:", stats)
//             stats.isDirectory() ? parseDir(path) : parseFile(path)
//           }
//         })
//       })
//     : typeof dirContents === "string"
//       ? readdirSync(dirPath).map((file) => {
//           const filePath = path.join(dirPath, file)
//           const stat = fs.statSync(filePath)

//           stat.isDirectory() ? parseDir(filePath) : parseFile(path)
//         })
//       : console.log("No files or diretory selected.")
// }

const parseDir = async (dirContents: string[] | string): Promise<void> => {
  try {
    dirContents.map((path) => {
      console.log("This is path in the first loop in the map: ", path)
      stat(path, (err, stats) => {
        console.log("This is path in the stat loop of the dirContents.map: ", path)
        if (err) {
          console.log(err)
        } else {
          console.log("The stats of this path are:", stats)
          stats.isDirectory() ? parseDir(path) : parseFile(path)
        }
      })
    })
  } catch (err) {
    if (err instanceof TypeError) {
      try {
        readdirSync(dirContents).map((file) => {
          const filePath = path.join(dirContents, file)
          const stat = fs.statSync(filePath)
          console.log("This is path for parseFile in the try block: ", filePath)
          stat.isDirectory() ? parseDir(filePath) : parseFile(filePath)
        })
      } catch (error) {
        console.log("An error occured", error)
      }
    } else {
      console.log("An error occured", err)
    }
  }
}

const parseFile = async (filePath: string): Promise<void> => {
  console.log(`now parsing this file ${filePath}`)
  console.log("this is the files metadata maybe?", fs.statSync(filePath))
  try {
    const metadata = await mm.parseFile(filePath)
    console.log(
      "This is the metadata from the npm ",
      util.inspect(metadata, { showHidden: false, depth: null })
    )
    fs.writeFile(
      "/Users/rossbuchan/personal_projects/electron-playground/data.json",
      JSON.stringify(metadata),
      { flag: "a+" },
      (err) => {
        if (err) {
          console.log("The following error occured, ", err)
        } else {
          console.log("The file was written sucessfully")
        }
      }
    )
  } catch (error) {
    console.error(error.message)
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  })

  mainWindow.on("ready-to-show", () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: "deny" }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"])
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron")

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle("dialog:openFile", handleFileOpen)
  ipcMain.handle("dialog:fileExplorer", handleFileExplorer)

  createWindow()

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
