const { ipcRenderer } = require('electron')

function getCurrentISOString() {
    return new Date().toISOString()
}

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
    const deadlineDate = new Date(task.deadline)
    if (isNaN(deadlineDate.getTime())) {
        alert('Deadline không hợp lệ')
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
    const editTaskStatus = document.getElementById('editTaskStatus')

    editTaskId.value = task.id
    editTaskName.value = task.name
    editTaskDescription.value = task.description || ''
    editTaskStatus.value = task.status
    
    modal.classList.add('is-active')
}

function closeEditModal() {
    const modal = document.getElementById('editModal')
    modal.classList.remove('is-active')
    currentEditingTask = null
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        const tasks = await ipcRenderer.invoke('get-tasks')
        const task = tasks.find(t => t.id === taskId)
        if (!task) return

        const updatedTask = {
            ...task,
            status: newStatus,
            completedAt: newStatus === 'completed' ? getCurrentISOString() : 
                        (task.status === 'completed' ? null : task.completedAt)
        }

        const success = await ipcRenderer.invoke('update-task', updatedTask)
        if (success) {
            await displayTasks()
        }
    } catch (error) {
        console.error('Error updating task status:', error)
        alert('Có lỗi khi cập nhật trạng thái')
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

        const fragment = document.createDocumentFragment()

        const filteredTasks = tasks.filter(task => {
            const taskDate = new Date(task.deadline)
            return (!monthFilter || taskDate.getMonth() + 1 == monthFilter) &&
                   (!statusFilter || task.status === statusFilter)
        })

        filteredTasks.forEach(task => {
            const taskDate = new Date(task.deadline)
            
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
            fragment.appendChild(taskElement)

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

        const oldElements = taskList.querySelectorAll('.task-item')
        oldElements.forEach(el => {
            const statusSelect = el.querySelector('.status-select')
            const deleteBtn = el.querySelector('.delete-btn')
            const editBtn = el.querySelector('.edit-btn')
            
            statusSelect?.removeEventListener('change', statusSelect.changeHandler)
            deleteBtn?.removeEventListener('click', deleteBtn.clickHandler)
            editBtn?.removeEventListener('click', editBtn.clickHandler)
        })

        taskList.innerHTML = ''
        taskList.appendChild(fragment)

        await createContributionsGraph()
    } catch (error) {
        console.error('Error displaying tasks:', error)
        alert('Có lỗi khi hiển thị danh sách công việc')
    }
}

async function createContributionsGraph() {
    try {
        const contributionsGraph = document.querySelector('.contributions-graph')
        const monthsHeader = document.querySelector('.months-header')
        
        contributionsGraph.innerHTML = ''
        monthsHeader.innerHTML = ''

        const today = new Date()
        const oneYearAgo = new Date(today)
        oneYearAgo.setFullYear(today.getFullYear() - 1)

        const months = []
        let currentMonth = new Date(oneYearAgo)
        while (currentMonth <= today) {
            months.push(new Date(currentMonth))
            currentMonth.setMonth(currentMonth.getMonth() + 1)
        }

        monthsHeader.innerHTML = months
            .map(date => {
                const monthName = date.toLocaleString('vi-VN', { month: 'short' })
                    .replace('thg', 'Thg')
                return `<span>${monthName}</span>`
            })
            .join('')

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
        console.log('All tasks:', tasks); 

        const completedTasks = new Map()
        let totalCompleted = 0
        let maxCompletionsInDay = 0

        tasks.forEach(task => {
            if (task.status === 'completed' && task.completedAt) {
                const dateStr = task.completedAt.split('T')[0]
                const count = (completedTasks.get(dateStr) || 0) + 1
                completedTasks.set(dateStr, count)
                totalCompleted++
                maxCompletionsInDay = Math.max(maxCompletionsInDay, count)
            }
        })

        console.log('Completed tasks map:', Array.from(completedTasks.entries()));

        let currentDate = new Date(oneYearAgo)
        while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split('T')[0]
            const completions = completedTasks.get(dateStr) || 0

            const cell = document.createElement('div')
            cell.className = 'contribution-cell'

            if (completions > 0) {
                if (completions >= 10) cell.classList.add('level-4')
                else if (completions >= 5) cell.classList.add('level-3')
                else if (completions >= 3) cell.classList.add('level-2')
                else cell.classList.add('level-1')

                cell.setAttribute('data-count', completions)
                cell.setAttribute('data-tooltip', 
                    `${completions} công việc hoàn thành vào ${currentDate.toLocaleDateString('vi-VN')}`)
            }

            const weekNumber = Math.floor((currentDate - oneYearAgo) / (7 * 24 * 60 * 60 * 1000))
            cell.style.gridColumn = weekNumber + 2
            cell.style.gridRow = currentDate.getDay() + 1

            contributionsGraph.appendChild(cell)
            
            currentDate.setDate(currentDate.getDate() + 1)
        }

        const statsContainer = document.querySelector('.contribution-stats')
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="level is-mobile mt-4">
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="heading">Tổng công việc đã hoàn thành</p>
                            <p class="title">${totalCompleted}</p>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="heading">Ngày hoạt động nhiều nhất</p>
                            <p class="title">${maxCompletionsInDay}</p>
                        </div>
                    </div>
                </div>
            `
        }

    } catch (error) {
        console.error('Error creating contributions graph:', error)
        contributionsGraph.innerHTML = '<p class="has-text-danger">Có lỗi khi tạo biểu đồ đóng góp</p>'
    }
}

function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        initMonthFilter()
        await displayTasks()

        const oldForm = document.getElementById('taskForm')
        const newForm = oldForm.cloneNode(true)
        oldForm.parentNode.replaceChild(newForm, oldForm)
        
        document.getElementById('taskForm').addEventListener('submit', async (e) => {
            e.preventDefault()
            try {
                const task = {
                    id: Date.now().toString(),
                    name: document.getElementById('taskName').value,
                    description: document.getElementById('taskDescription').value,
                    deadline: document.getElementById('deadline').value || new Date().toISOString(),
                    status: document.getElementById('status').value,
                    createdAt: getCurrentISOString(),
                    completedAt: null
                }

                if (!validateTask(task)) return

                await ipcRenderer.invoke('save-task', task)
                document.getElementById('taskForm').reset()
                document.getElementById('deadline').value = formatDatetimeLocal(new Date())
                await displayTasks()
            } catch (error) {
                console.error('Error saving task:', error)
                alert('Có lỗi khi lưu công việc')
            }
        })

        document.getElementById('editForm').addEventListener('submit', async (e) => {
            e.preventDefault()
            try {
                const oldStatus = currentEditingTask.status;
                const newStatus = document.getElementById('editTaskStatus').value;
                
                const updatedTask = {
                    id: document.getElementById('editTaskId').value,
                    name: document.getElementById('editTaskName').value,
                    description: document.getElementById('editTaskDescription').value,
                    status: newStatus,
                    deadline: currentEditingTask.deadline,
                    completedAt: newStatus === 'completed' ? 
                                (oldStatus !== 'completed' ? new Date().toISOString() : currentEditingTask.completedAt) : 
                                null
                }

                console.log('Updating task:', updatedTask); 

                const success = await ipcRenderer.invoke('update-task', updatedTask)
                if (success) {
                    closeEditModal()
                    await displayTasks()
                }
            } catch (error) {
                console.error('Error updating task:', error)
                alert('Có lỗi khi cập nhật công việc')
            }
        })

        const debouncedDisplayTasks = debounce(displayTasks, 300)
        document.getElementById('monthFilter').addEventListener('change', debouncedDisplayTasks)
        document.getElementById('statusFilter').addEventListener('change', debouncedDisplayTasks)

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
    } catch (error) {
        console.error('Error initializing app:', error)
        alert('Có lỗi khi khởi tạo ứng dụng')
    }
})
