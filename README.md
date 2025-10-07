# 📊 Point of Data

Application for interactive visualization of multidimensional datasets.
Built with Vite + React and packaged as a desktop app with Electron.

Requirements
- Node.js 18+ (LTS recommended)
- Windows (packaging scripts target Windows/NSIS)
- (Optional) PowerShell for some clean-up commands

# 🛠️ How to Run the Project
## 1. Clone the repository
git clone https://github.com/8Asiul8/Point_Of_Data.git
cd your-repo

## 2. Install dependencies

Before running the project, you need to install all the dependencies listed in package.json.
These dependencies are not included in the repository (the node_modules folder is ignored by Git), so this step is required:

npm install

## 3. Run in development mode

This command will start the project with hot-reloading so you can develop and test changes quickly:

npm run dev

## 4. Build a production version (executable)

Once the project is ready, you can build the production version and generate a desktop executable (for Windows):

npm run dist


The built installer will be created inside the dist or dist_electron folder (depending on your configuration).

# 💻 How to Run the Executable

If you don’t want to modify the code and just want to run the application, simply:
- Go to the dist folder created after running the build.
- Double-click the generated .exe installer.
- Follow the installation steps.
- Launch the app from the Start Menu or desktop shortcut.

# 🔄 How to Make Changes and Rebuild
If you make any changes to the code:

- Save your changes.
- Run the build command again:
  npm run dist

This will generate a new executable with your updates.
