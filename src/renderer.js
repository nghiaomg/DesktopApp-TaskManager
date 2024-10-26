const { ipcRenderer } = require('electron')

function getStore(key) {
    return ipcRenderer.sendSync('electron-store-get', key)
}

function setStore(key, value) {
    return ipcRenderer.sendSync('electron-store-set', key, value)
}

function initMonthFilter() {
    const monthFilter = document.getElementById('monthFilter')
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option')
        option.value = i
        option.textContent = `Tháng ${i}`
        monthFilter.appendChild(option)
    }
}

function formatDatetimeLocal(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

function validateTask(task) {
    if (!task.name.trim()) {
        alert('Vui lòng nhập tên công việc')
        return false
    }
    if (!task.deadline) {
        alert('Vui lòng chọn deadline')
        return false
    }
    return true
}

let currentEditingTask = null;

function openEditModal(task) {
    currentEditingTask = task
    const modal = document.getElementById('editModal')
    const editTaskId = document.getElementById('editTaskId')
    const editTaskName = document.getElementById('editTaskName')
    const editTaskDescription = document.getElementById('editTaskDescription')

    editTaskId.value = task.id
    editTaskName.value = task.name
    editTaskDescription.value = task.description || ''

    modal.style.display = 'block'
}

function closeEditModal() {
    const modal = document.getElementById('editModal')
    modal.style.display = 'none'
    currentEditingTask = null
}

async function updateTaskStatus(taskId, newStatus) {
    const updatedTask = {
        id: taskId,
        status: newStatus
    }
    const success = await ipcRenderer.invoke('update-task', updatedTask)
    if (success) {
        displayTasks()
    }
}

async function deleteTask(taskId) {
    if (confirm('Bạn có chắc muốn xóa công việc này?')) {
        await ipcRenderer.invoke('delete-task', taskId)
        displayTasks()
    }
}

async function deleteSelectedTasks() {
    const selectedTasks = document.querySelectorAll('.task-checkbox:checked')
    if (selectedTasks.length === 0) {
        alert('Vui lòng chọn ít nhất một công việc để xóa')
        return
    }

    if (confirm(`Bạn có chắc muốn xóa ${selectedTasks.length} công việc đã chọn?`)) {
        const taskIds = Array.from(selectedTasks).map(checkbox => checkbox.dataset.taskId)
        await ipcRenderer.invoke('delete-multiple-tasks', taskIds)
        displayTasks()
    }
}

async function displayTasks() {
    try {
        const tasks = await ipcRenderer.invoke('get-tasks')
        const taskList = document.getElementById('taskList')
        const monthFilter = document.getElementById('monthFilter').value
        const statusFilter = document.getElementById('statusFilter').value

        taskList.innerHTML = ''

        tasks.forEach(task => {
            const taskDate = new Date(task.deadline)
            
            if ((monthFilter && taskDate.getMonth() + 1 != monthFilter) ||
                (statusFilter && task.status !== statusFilter)) {
                return
            }

            const formattedDeadline = taskDate.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })

            const taskElement = document.createElement('div')
            taskElement.className = `task-item ${task.status}`
            taskElement.innerHTML = `
                <div class="task-content">
                    <label class="checkbox">
                        <input type="checkbox" class="task-checkbox" data-task-id="${task.id}">
                    </label>
                    <div class="task-details">
                        <h3 class="title is-5 mb-2">${task.name}</h3>
                        <p class="task-description">${task.description || ''}</p>
                        <div class="task-meta">
                            <p><strong>Deadline:</strong> ${formattedDeadline}</p>
                            <div class="field">
                                <label class="label is-small">Trạng thái:</label>
                                <div class="control">
                                    <div class="select is-small">
                                        <select class="status-select" data-task-id="${task.id}">
                                            <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Đang chờ</option>
                                            <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>Đang thực hiện</option>
                                            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="button is-small is-info edit-btn" data-task-id="${task.id}">
                                <span class="icon">
                                    <i class="fas fa-edit"></i>
                                </span>
                                <span>Sửa</span>
                            </button>
                            <button class="button is-small is-danger delete-btn" data-task-id="${task.id}">
                                <span class="icon">
                                    <i class="fas fa-trash"></i>
                                </span>
                                <span>Xóa</span>
                            </button>
                        </div>
                    </div>
                </div>
            `
            taskList.appendChild(taskElement)

            const statusSelect = taskElement.querySelector('.status-select')
            statusSelect.addEventListener('change', (e) => {
                const taskId = e.target.dataset.taskId
                const newStatus = e.target.value
                updateTaskStatus(taskId, newStatus)
            })

            const deleteBtn = taskElement.querySelector('.delete-btn')
            deleteBtn.addEventListener('click', () => deleteTask(task.id))

            const editBtn = taskElement.querySelector('.edit-btn')
            editBtn.addEventListener('click', () => openEditModal(task))
        })

        await createContributionsGraph()
    } catch (error) {
        console.error('Error displaying tasks:', error)
        alert('Có lỗi khi hiển thị danh sách công việc')
    }
}

async function createContributionsGraph() {
    const contributionsGraph = document.querySelector('.contributions-graph')
    const monthsHeader = document.querySelector('.months-header')
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(today.getFullYear() - 1)

    contributionsGraph.innerHTML = ''
    monthsHeader.innerHTML = ''

    const months = []
    for (let d = new Date(oneYearAgo); d <= today; d.setMonth(d.getMonth() + 1)) {
        months.push(new Date(d))
    }
    monthsHeader.innerHTML = months.map(date => 
        `<span>${date.toLocaleString('vi-VN', { month: 'short' })}</span>`
    ).join('')

    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    weekdays.forEach((day, index) => {
        if (index % 2 === 0) {
            const label = document.createElement('div')
            label.className = 'weekday-label'
            label.textContent = day
            label.style.gridRow = index + 1
            contributionsGraph.appendChild(label)
        }
    })

    const tasks = await ipcRenderer.invoke('get-tasks')
    const completedTasks = new Map()

    tasks.forEach(task => {
        if (task.status === 'completed') {
            const date = new Date(task.deadline).toDateString()
            completedTasks.set(date, (completedTasks.get(date) || 0) + 1)
        }
    })

    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const cell = document.createElement('div')
        cell.className = 'contribution-cell'
        
        const count = completedTasks.get(d.toDateString()) || 0
        if (count > 0) {
            cell.setAttribute('data-count', count)
            cell.setAttribute('data-tooltip', `${count} công việc hoàn thành vào ${d.toLocaleDateString('vi-VN')}`)
            
            if (count >= 10) cell.classList.add('level-4')
            else if (count >= 5) cell.classList.add('level-3')
            else if (count >= 3) cell.classList.add('level-2')
            else cell.classList.add('level-1')
        }

        cell.style.gridColumn = Math.floor((d - oneYearAgo) / (24 * 60 * 60 * 1000) / 7) + 2
        cell.style.gridRow = d.getDay() + 1

        contributionsGraph.appendChild(cell)
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    initMonthFilter()
    await displayTasks()

    document.getElementById('taskForm').addEventListener('submit', async (e) => {
        e.preventDefault()
        try {
            const task = {
                id: Date.now().toString(),
                name: document.getElementById('taskName').value,
                description: document.getElementById('taskDescription').value,
                deadline: document.getElementById('deadline').value || new Date().toISOString(),
                status: document.getElementById('status').value,
                createdAt: new Date().toISOString()
            }

            if (!validateTask(task)) return

            await ipcRenderer.send('save-task', task)
            document.getElementById('taskForm').reset()
            document.getElementById('deadline').value = formatDatetimeLocal(new Date())
            displayTasks()
        } catch (error) {
            console.error('Error saving task:', error)
            alert('Có lỗi khi lưu công việc')
        }
    })

    document.getElementById('editForm').addEventListener('submit', async (e) => {
        e.preventDefault()
        try {
            const updatedTask = {
                id: document.getElementById('editTaskId').value,
                name: document.getElementById('editTaskName').value,
                description: document.getElementById('editTaskDescription').value
            }

            const success = await ipcRenderer.invoke('update-task', updatedTask)
            if (success) {
                closeEditModal()
                displayTasks()
            }
        } catch (error) {
            console.error('Error updating task:', error)
            alert('Có lỗi khi cập nhật công việc')
        }
    })

    document.getElementById('monthFilter').addEventListener('change', displayTasks)
    document.getElementById('statusFilter').addEventListener('change', displayTasks)

    document.getElementById('selectAllBtn').addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.task-checkbox')
        const areAllChecked = Array.from(checkboxes).every(cb => cb.checked)
        checkboxes.forEach(cb => cb.checked = !areAllChecked)
    })

    document.getElementById('deleteSelectedBtn').addEventListener('click', deleteSelectedTasks)

    document.querySelector('.delete').addEventListener('click', closeEditModal)
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('editModal')
        if (event.target === modal) {
            closeEditModal()
        }
    })
})
