import { app, shell, BrowserWindow, ipcMain, dialog, webContents } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import { opendir, isDirectory, stat, readdirSync } from "fs"
import { ICommonTagsResult, IPicture } from "music-metadata"
const path = require("path")
const fs = require("fs")
const mm = require("music-metadata")
const util = require("util")
const { writeFile } = require("fs/promises")
import { stat, readdir, promises as fsPromises } from "fs"

interface ISongData {
  songPath: string
  songMetaData: ICommonTagsResult
}

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
    await parseInput(filePaths)
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

const parseInput = async (libInput: string[]): Promise<void> => {
  for (const filePath of libInput) {
    try {
      const stats = await fsPromises.stat(filePath)

      if (stats.isDirectory()) {
        await parseDir(filePath)
      } else {
        await parseFile(filePath)
      }
    } catch (error) {
      console.error(`Error processing file/directory ${filePath}:`, error.message)
    }
  }
}

const parseDir = async (dirPath: string): Promise<void> => {
  try {
    const dirContents = await fsPromises.readdir(dirPath)

    for (const file of dirContents) {
      const filePath = join(dirPath, file)
      const fileStats = await fsPromises.stat(filePath)

      if (fileStats.isDirectory()) {
        await parseDir(filePath)
      } else {
        await parseFile(filePath)
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message)
  }
}

const parseFile = async (filePath: string): Promise<void> => {
  console.log(`Now parsing this file ${filePath}`)

  try {
    const existingDataBuffer = await fsPromises.readFile(
      "/Users/rossbuchan/personal_projects/electron-playground/data.json",
      "utf8"
    )

    let existingData: ISongData[] = []

    if (existingDataBuffer.length > 0) {
      existingData = JSON.parse(existingDataBuffer)
    }

    const metadata = await mm.parseFile(filePath)
    delete metadata.common.picture

    const formattedData: ISongData = {
      songPath: filePath,
      songMetaData: metadata.common
    }

    existingData.push(formattedData)

    await fsPromises.writeFile(
      "/Users/rossbuchan/personal_projects/electron-playground/data.json",
      JSON.stringify(existingData),
      { flag: "w" }
    )

    console.log(`The file at path ${filePath} was written successfully`)
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message)
  }
}

// const loadLibrary = async (): Promise<T> => {
//   try {
//     console.log("trying to find the lib ")
//     const lib = await JSON.parse(
//       fs.readFile(
//         "/Users/rossbuchan/personal_projects/electron-playground/data.json",
//         "utf8",
//         (err, data) => {
//           if (err) {
//             console.log("Error in the readFile callback", err)
//           } else {
//             console.log("this is the data yoiu have got, ", data)
//             webContents.sender.send(data)
//           }
//         }
//       )
//     )
//     console.log("this is the lib returned from the parse, ", lib)
//     return lib
//   } catch (err) {
//     console.error("Error finding Library, ", err.message)
//   }
// }

const loadLibrary = async (): Promise<T> => {
  const libData = await fs.promises.readFile(
    "/Users/rossbuchan/personal_projects/electron-playground/data.json",
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err)
      } else {
        return data
      }
    }
  )
  libData.typeof === undefined
    ? await fs.promises.writeFile(
        "/Users/rossbuchan/personal_projects/electron-playground/data.json",
        JSON.stringify([])
      )
    : console.log("The lib data is not undefined apparently")
  console.log("Lib data in he main prcess after the callback", libData)
  return libData
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
  // ipcMain.handle("loadLib", loadLibrary)
  ipcMain.handle("loadLib", loadLibrary)

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
