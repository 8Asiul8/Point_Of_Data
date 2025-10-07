import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.platform === "win32") {
  app.setAppUserModelId("com.pointofdata.app");
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: path.join(__dirname, "../assets/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      // opcional: sandbox: false
    },
  });

  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ---------- IPC handlers ----------
ipcMain.handle("open-config-file", async () => {
  const result = await dialog.showOpenDialog({
    title: "Abrir Configuração",
    filters: [{ name: "JSON", extensions: ["json"] }],
    properties: ["openFile"],
  });
  if (result.canceled || result.filePaths.length === 0) return null;

  try {
    const content = fs.readFileSync(result.filePaths[0], "utf-8");
    const json = JSON.parse(content);
    return json.configuration || null;
  } catch (err) {
    console.error("Erro ao ler arquivo JSON:", err);
    return null;
  }
});

ipcMain.handle("save-config", async (_evt, filePathSuggest, data) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: "Salvar Configuração",
      defaultPath: filePathSuggest,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (!filePath) return false;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
});

ipcMain.handle("open-csv-file", async () => {
  const result = await dialog.showOpenDialog({
    title: "Abrir Dataset",
    filters: [{ name: "CSV", extensions: ["csv"] }],
    properties: ["openFile"],
  });
  if (result.canceled || result.filePaths.length === 0) return null;

  try {
    return fs.readFileSync(result.filePaths[0], "utf-8");
  } catch (err) {
    console.error("Erro ao ler CSV:", err);
    return null;
  }
});
