const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Store = require('electron-store')

const store = new Store()

ipcMain.on('electron-store-get', (event, key) => {
    event.returnValue = store.get(key)
})

ipcMain.on('electron-store-set', (event, key, value) => {
    store.set(key, value)
    event.returnValue = true
})

ipcMain.handle('get-tasks', () => {
    return store.get('tasks') || []
})

ipcMain.on('save-task', (event, task) => {
    const tasks = store.get('tasks') || []
    tasks.push(task)
    store.set('tasks', tasks)
})

ipcMain.handle('update-task', (event, updatedTask) => {
    const tasks = store.get('tasks') || []
    const index = tasks.findIndex(task => task.id === updatedTask.id)
    if (index !== -1) {
        const oldTask = tasks[index]
        tasks[index] = { 
            ...oldTask,
            ...updatedTask,
            deadline: updatedTask.status !== oldTask.status ? new Date().toISOString() : oldTask.deadline
        }
        store.set('tasks', tasks)
        return true
    }
    return false
})

ipcMain.handle('delete-task', (event, taskId) => {
    const tasks = store.get('tasks') || []
    const filteredTasks = tasks.filter(task => task.id !== taskId)
    store.set('tasks', filteredTasks)
    return true
})

ipcMain.handle('delete-multiple-tasks', (event, taskIds) => {
    const tasks = store.get('tasks') || []
    const filteredTasks = tasks.filter(task => !taskIds.includes(task.id))
    store.set('tasks', filteredTasks)
    return true
})

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'src/assets/logo.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: 'Task Manager',
        autoHideMenuBar: true
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
