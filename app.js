// ============================================
// The Keeper's Mandate - App Logic
// ============================================

// Data Structure
const appState = {
    today: new Date().toISOString().split('T')[0],
    tasks: {
        craft: { completed: false, points: 30, name: '3 Focus Sessions' },
        vitality: { completed: false, points: 15, name: 'Training Run' },
        domain: { completed: false, points: 25, name: "Today's Cleaning Quest" },
        kin: { completed: false, points: 10, name: 'Quality Time with Family' },
        essence: { completed: false, points: 10, name: '30 Minutes for Yourself' }
    },
    streak: 0,
    longestStreak: 0,
    history: {},
    sessions: 0,
    maxSessions: 6,
    timerState: {
        minutes: 25,
        seconds: 0,
        isRunning: false,
        interval: null,
        currentArea: 'craft'
    }
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initializeApp();
    setupEventListeners();
    checkForNewDay();
    updateAllUI();
});

function initializeApp() {
    // Set current date
    const dateEl = document.getElementById('current-date');
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateEl.textContent = today.toLocaleDateString('en-US', options);
    
    // Initialize timer display
    updateTimerDisplay();
    updateSessionDots();
    
    // Setup edit tasks
    setupEditTasksUI(); // ADD THIS LINE
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Task checkboxes
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleTaskToggle);
    });
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });
    
    // Timer controls
    document.getElementById('timer-start').addEventListener('click', startTimer);
    document.getElementById('timer-pause').addEventListener('click', pauseTimer);
    document.getElementById('timer-stop').addEventListener('click', stopTimer);
    
    // Achievement modal
    document.getElementById('close-achievement').addEventListener('click', closeAchievementModal);
}

// ============================================
// Task Management
// ============================================

function handleTaskToggle(e) {
    const taskCard = e.target.closest('.task-card');
    const area = taskCard.dataset.area;
    
    appState.tasks[area].completed = e.target.checked;
    
    // Update card appearance
    if (e.target.checked) {
        taskCard.classList.add('completed');
        
        // Animate
        e.target.style.animation = 'checkGlow 0.3s ease';
        setTimeout(() => {
            e.target.style.animation = '';
        }, 300);
    } else {
        taskCard.classList.remove('completed');
    }
    
    updateTodayStats();
    checkForDayCompletion();
    saveToStorage();
}

function checkForDayCompletion() {
    const allCompleted = Object.values(appState.tasks).every(task => task.completed);
    
    if (allCompleted) {
        // Save to history
        if (!appState.history[appState.today]) {
            appState.history[appState.today] = {
                completed: true,
                areas: { ...appState.tasks }
            };
            
            // Update streak
            updateStreak();
            
            // Check for achievements
            checkAchievements();
            
            saveToStorage();
        }
        
        showAchievement('balance', 'Balance Achieved', 
            'You showed up for every part of your life today.');
    }
}

function updateStreak() {
    const dates = Object.keys(appState.history).sort();
    if (dates.length === 0) return;
    
    let currentStreak = 1;
    const today = new Date(appState.today);
    
    for (let i = dates.length - 1; i > 0; i--) {
        const date = new Date(dates[i]);
        const prevDate = new Date(dates[i - 1]);
        const dayDiff = Math.floor((date - prevDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
            currentStreak++;
        } else {
            break;
        }
    }
    
    appState.streak = currentStreak;
    appState.longestStreak = Math.max(appState.longestStreak, currentStreak);
}

// ============================================
// UI Updates
// ============================================

function updateTodayStats() {
    const totalPoints = Object.values(appState.tasks)
        .filter(task => task.completed)
        .reduce((sum, task) => sum + task.points, 0);
    
    document.getElementById('points-today').textContent = totalPoints;
    document.getElementById('streak-display').textContent = `🔥 ${appState.streak} days`;
    
    // Check if essence is neglected
    const essenceCompleted = appState.tasks.essence.completed;
    const essenceAlert = document.getElementById('essence-alert');
    
    if (!essenceCompleted && getTotalCompleted() >= 3) {
        essenceAlert.classList.remove('hidden');
    } else {
        essenceAlert.classList.add('hidden');
    }
}

function getTotalCompleted() {
    return Object.values(appState.tasks).filter(task => task.completed).length;
}

function updateAllUI() {
    // Update today view
    Object.keys(appState.tasks).forEach(area => {
        const checkbox = document.getElementById(`${area}-task`);
        const card = checkbox.closest('.task-card');
        const task = appState.tasks[area];
        
        checkbox.checked = task.completed;
        if (task.completed) {
            card.classList.add('completed');
        }
    });
    
    updateTodayStats();
    updateStatsView();
}

function updateStatsView() {
    // Update streak
    document.getElementById('stat-streak').textContent = `${appState.streak} days`;
    document.getElementById('stat-longest').textContent = appState.longestStreak;
    
    // Calculate week stats
    const weekStats = getWeekStats();
    const weekPoints = Object.values(weekStats).reduce((sum, count) => {
        const area = Object.keys(appState.tasks).find(a => 
            Object.keys(weekStats).indexOf(a) === Object.keys(weekStats).indexOf(Object.keys(weekStats).find(k => weekStats[k] === count))
        );
        return sum + (count * 10); // Simplified points calc
    }, 0);
    
    document.getElementById('stat-week-points').textContent = `${weekPoints} points`;
    
    const weekProgress = (weekPoints / 600) * 100;
    document.getElementById('week-progress').style.width = `${Math.min(weekProgress, 100)}%`;
    
    // Update mastery levels for each area
    Object.keys(appState.tasks).forEach(area => {
        const count = weekStats[area] || 0;
        document.getElementById(`${area}-count`).textContent = count;
        
        // Update dots
        const dotsContainer = document.getElementById(`${area}-dots`);
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                if (index < count) {
                    dot.classList.add('filled');
                } else {
                    dot.classList.remove('filled');
                }
            });
        }
        
        // Update stars
        const stars = Math.min(Math.floor(count / 2) + 1, 4);
        const levelEl = document.getElementById(`${area}-level`);
        if (levelEl) {
            levelEl.textContent = '⭐'.repeat(stars);
        }
    });
    
    // Check if essence is lowest
    const essenceCount = weekStats.essence || 0;
    const avgCount = Object.values(weekStats).reduce((a, b) => a + b, 0) / 5;
    
    if (essenceCount < avgCount && essenceCount < 4) {
        document.getElementById('stats-insight').classList.remove('hidden');
    } else {
        document.getElementById('stats-insight').classList.add('hidden');
    }
}

function getWeekStats() {
    const stats = { craft: 0, vitality: 0, domain: 0, kin: 0, essence: 0 };
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    Object.keys(appState.history).forEach(date => {
        const historyDate = new Date(date);
        if (historyDate >= weekAgo && historyDate <= today) {
            const day = appState.history[date];
            if (day.completed && day.areas) {
                Object.keys(day.areas).forEach(area => {
                    if (day.areas[area].completed) {
                        stats[area]++;
                    }
                });
            }
        }
    });
    
    return stats;
}

// ============================================
// Navigation
// ============================================

function handleNavigation(e) {
    const button = e.currentTarget;
    const targetView = button.dataset.view;
    
    if (!targetView) return;
    
    // Update active states
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    button.classList.add('active');
    
    // Show correct view
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${targetView}-view`).classList.add('active');
    
    // Update stats if viewing stats
    if (targetView === 'stats') {
        updateStatsView();
    }
}

// ============================================
// Timer Functions
// ============================================

function startTimer() {
    if (appState.timerState.isRunning) return;
    
    appState.timerState.isRunning = true;
    document.getElementById('timer-start').classList.add('hidden');
    document.getElementById('timer-pause').classList.remove('hidden');
    document.getElementById('timer-stop').classList.remove('hidden');
    
    const totalSeconds = 25 * 60;
    const circumference = 2 * Math.PI * 80; // Updated radius
    const circle = document.getElementById('progress-circle');
    circle.style.strokeDasharray = circumference;
    
    appState.timerState.interval = setInterval(() => {
        if (appState.timerState.seconds === 0) {
            if (appState.timerState.minutes === 0) {
                // Timer complete
                completeTimer();
                return;
            }
            appState.timerState.minutes--;
            appState.timerState.seconds = 59;
        } else {
            appState.timerState.seconds--;
        }
        
        updateTimerDisplay();
        
        // Update progress ring
        const elapsed = (25 * 60) - (appState.timerState.minutes * 60 + appState.timerState.seconds);
        const progress = (elapsed / totalSeconds) * circumference;
        circle.style.strokeDashoffset = circumference - progress;
    }, 1000);
}

function pauseTimer() {
    appState.timerState.isRunning = false;
    clearInterval(appState.timerState.interval);
    
    document.getElementById('timer-start').classList.remove('hidden');
    document.getElementById('timer-pause').classList.add('hidden');
}

function stopTimer() {
    appState.timerState.isRunning = false;
    clearInterval(appState.timerState.interval);
    appState.timerState.minutes = 25;
    appState.timerState.seconds = 0;
    
    updateTimerDisplay();
    
    document.getElementById('timer-start').classList.remove('hidden');
    document.getElementById('timer-pause').classList.add('hidden');
    document.getElementById('timer-stop').classList.add('hidden');
    
    // Reset progress ring
    const circle = document.getElementById('progress-circle');
    circle.style.strokeDashoffset = 0;
}

function completeTimer() {
    stopTimer();
    
    // Increment session
    appState.sessions = Math.min(appState.sessions + 1, appState.maxSessions);
    updateSessionDots();

    // ============================================
// Edit Tasks
// ============================================

function setupEditTasksUI() {
    const editBtn = document.getElementById('edit-tasks-btn');
    if (editBtn) {
        editBtn.addEventListener('click', showEditTasksModal);
    }
}

function showEditTasksModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content edit-tasks-modal">
            <h2 class="modal-title">Edit Today's Tasks</h2>
            
            <div class="edit-task-group">
                <label>📜 CRAFT</label>
                <input type="text" id="edit-craft" value="${appState.tasks.craft.name}" class="task-input">
            </div>
            
            <div class="edit-task-group">
                <label>⚡ VITALITY</label>
                <input type="text" id="edit-vitality" value="${appState.tasks.vitality.name}" class="task-input">
            </div>
            
            <div class="edit-task-group">
                <label>🏰 DOMAIN</label>
                <input type="text" id="edit-domain" value="${appState.tasks.domain.name}" class="task-input">
            </div>
            
            <div class="edit-task-group">
                <label>💛 KIN</label>
                <input type="text" id="edit-kin" value="${appState.tasks.kin.name}" class="task-input">
            </div>
            
            <div class="edit-task-group">
                <label>✨ ESSENCE</label>
                <input type="text" id="edit-essence" value="${appState.tasks.essence.name}" class="task-input">
            </div>
            
            <div class="modal-buttons">
                <button class="secondary-btn" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="primary-btn" onclick="saveEditedTasks()">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function saveEditedTasks() {
    appState.tasks.craft.name = document.getElementById('edit-craft').value;
    appState.tasks.vitality.name = document.getElementById('edit-vitality').value;
    appState.tasks.domain.name = document.getElementById('edit-domain').value;
    appState.tasks.kin.name = document.getElementById('edit-kin').value;
    appState.tasks.essence.name = document.getElementById('edit-essence').value;
    
    // Update UI
    document.querySelector('[data-area="craft"] .task-name').textContent = appState.tasks.craft.name;
    document.querySelector('[data-area="vitality"] .task-name').textContent = appState.tasks.vitality.name;
    document.querySelector('[data-area="domain"] .task-name').textContent = appState.tasks.domain.name;
    document.querySelector('[data-area="kin"] .task-name').textContent = appState.tasks.kin.name;
    document.querySelector('[data-area="essence"] .task-name').textContent = appState.tasks.essence.name;
    
    saveToStorage();
    document.querySelector('.modal').remove();
}
    
    // Show completion message
    showAchievement('timer', 'Focus Charm Complete!', 
        `+10 House Points earned!\n\nSessions today: ${appState.sessions}/${appState.maxSessions}`);
}

function updateTimerDisplay() {
    const mins = String(appState.timerState.minutes).padStart(2, '0');
    const secs = String(appState.timerState.seconds).padStart(2, '0');
    
    document.getElementById('timer-minutes').textContent = mins;
    document.getElementById('timer-seconds').textContent = secs;
}

function updateSessionDots() {
    const dots = document.querySelectorAll('.session-dots .dot');
    dots.forEach((dot, index) => {
        if (index < appState.sessions) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

// ============================================
// Achievements
// ============================================

function checkAchievements() {
    // Check for "Always" achievement (30 days)
    if (appState.streak === 30) {
        showAchievement('always', 'ALWAYS', 
            `30 days of unwavering loyalty to yourself and your goals.\n\n"After all this time?"\n"Always."\n\nThis is the magic of consistency.\n\nBoth houses honor your dedication.`);
    }
    
    // Check for 90 days
    if (appState.streak === 90) {
        showAchievement('unbreakable', 'THE UNBREAKABLE VOW', 
            `You've kept your promise to yourself for 90 consecutive days.\n\nThis is the magic few understand.\nThe quiet, relentless, unseen work.`);
    }
    
    // Check for 7 days
    if (appState.streak === 7) {
        showAchievement('week', 'One Week Strong', 
            `7 days of showing up. This is how habits are forged.`);
    }
}

function showAchievement(type, title, text) {
    const modal = document.getElementById('achievement-modal');
    const iconEl = document.getElementById('achievement-icon');
    const titleEl = document.getElementById('achievement-title');
    const textEl = document.getElementById('achievement-text');
    
    // Set icon based on type
    const icons = {
        balance: '✨',
        always: '🖤',
        unbreakable: '🖤',
        week: '🔥',
        timer: '⚡'
    };
    
    iconEl.textContent = icons[type] || '✨';
    titleEl.textContent = title;
    textEl.textContent = text;
    
    modal.classList.remove('hidden');
}

function closeAchievementModal() {
    document.getElementById('achievement-modal').classList.add('hidden');
}

// ============================================
// Data Persistence
// ============================================

function saveToStorage() {
    localStorage.setItem('keepersMandate', JSON.stringify(appState));
}

function loadFromStorage() {
    const saved = localStorage.getItem('keepersMandate');
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.assign(appState, loaded);
    }
}

function checkForNewDay() {
    const today = new Date().toISOString().split('T')[0];
    
    if (appState.today !== today) {
        // New day - reset tasks
        Object.keys(appState.tasks).forEach(area => {
            appState.tasks[area].completed = false;
        });
        
        appState.today = today;
        appState.sessions = 0;
        saveToStorage();
        updateAllUI();
    }
}

// ============================================
// Utility Functions
// ============================================

function getDayOfWeek() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
}

// Check for new day every minute
setInterval(checkForNewDay, 60000);

