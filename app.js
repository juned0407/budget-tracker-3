// Budget Tracker Application - Perfect Version
class BudgetTracker {
    constructor() {
        // API Configuration
        this.API_KEY = "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";
        this.API_URL = "https://api.perplexity.ai/chat/completions";
        
        // Data Storage
        this.transactions = this.loadData('budget_transactions', []);
        this.accounts = this.loadData('budget_accounts', { savings: 0, current: 0 });
        this.limits = this.loadData('budget_limits', this.getDefaultLimits());
        this.goals = this.loadData('budget_goals', []);
        this.settings = this.loadData('budget_settings', { theme: 'light' });
        
        // State Management
        this.currentTransactionType = 'expense';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.activeSection = 'dashboard';
        this.categories = [
            'Food', 'Transport', 'Bills', 'Entertainment', 
            'Shopping', 'Health', 'Education', 'Investment', 'Other'
        ];
        
        // Initialize Application
        this.init();
    }
    
    // =================== INITIALIZATION ===================
    init() {
        this.setupEventListeners();
        this.updateGreeting();
        this.updateDisplay();
        this.loadTheme();
        this.populateCategoryFilters();
        
        // Update time every minute
        setInterval(() => this.updateGreeting(), 60000);
        
        // Show welcome message
        this.showToast('Welcome back, Juned! 👋', 'success');
    }
    
    setupEventListeners() {
        // Navigation
        document.getElementById('menu-toggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('close-sidebar').addEventListener('click', () => this.closeSidebar());
        
        // Sidebar menu
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
                this.closeSidebar();
            });
        });
        
        // Quick actions
        document.getElementById('quick-income').addEventListener('click', () => this.openAmountModal('income'));
        document.getElementById('quick-expense').addEventListener('click', () => this.openAmountModal('expense'));
        
        // Amount modal
        document.getElementById('close-amount-modal').addEventListener('click', () => this.closeAmountModal());
        document.getElementById('add-description-btn').addEventListener('click', () => this.toggleDescriptionSection());
        document.getElementById('confirm-amount').addEventListener('click', () => this.addTransaction());
        
        // Quick amount buttons
        document.querySelectorAll('.quick-amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.dataset.amount;
                document.getElementById('amount-input').value = amount;
            });
        });
        
        // Amount input enter key
        document.getElementById('amount-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTransaction();
        });
        
        // Transaction controls
        document.getElementById('view-all-transactions').addEventListener('click', () => this.showSection('transactions'));
        document.getElementById('export-csv').addEventListener('click', () => this.exportCSV());
        
        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => this.changePage(-1));
        document.getElementById('next-page').addEventListener('click', () => this.changePage(1));
        
        // Settings
        document.getElementById('theme-toggle').addEventListener('change', (e) => this.toggleTheme(e.target.checked));
        document.getElementById('edit-accounts').addEventListener('click', () => this.editAccounts());
        document.getElementById('export-all-data').addEventListener('click', () => this.exportAllData());
        document.getElementById('clear-all-data').addEventListener('click', () => this.clearAllData());
        
        // Chat
        document.getElementById('chat-toggle').addEventListener('click', () => this.toggleChat());
        document.getElementById('close-chat').addEventListener('click', () => this.closeChat());
        document.getElementById('chat-send').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });
        
        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    // =================== NAVIGATION ===================
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }
    
    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
    }
    
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        document.getElementById(`${sectionName}-section`).classList.add('active');
        
        // Update menu
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        this.activeSection = sectionName;
        
        // Load section-specific data
        switch(sectionName) {
            case 'transactions':
                this.updateAllTransactionsList();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
            case 'categories':
                this.updateCategoryLimits();
                break;
            case 'goals':
                this.updateGoalsList();
                break;
        }
    }
    
    // =================== TIME AND GREETING ===================
    updateGreeting() {
        const now = new Date();
        const hour = now.getHours();
        let greeting = "Good evening";
        
        if (hour < 12) greeting = "Good morning";
        else if (hour < 18) greeting = "Good afternoon";
        
        document.getElementById('greeting-text').textContent = `${greeting}, Juned`;
        document.getElementById('current-time').textContent = now.toLocaleString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
        });
    }
    
    // =================== TRANSACTION MANAGEMENT ===================
    openAmountModal(type) {
        this.currentTransactionType = type;
        document.getElementById('modal-title').textContent = type === 'income' ? 'Add Income' : 'Add Expense';
        document.getElementById('amount-modal').classList.remove('hidden');
        document.getElementById('amount-input').focus();
        
        // Reset form
        document.getElementById('amount-input').value = '';
        document.getElementById('description-input').value = '';
        document.getElementById('category-select').value = '';
        document.getElementById('description-section').classList.add('hidden');
        document.getElementById('add-description-btn').textContent = '+ Description';
    }
    
    closeAmountModal() {
        document.getElementById('amount-modal').classList.add('hidden');
    }
    
    toggleDescriptionSection() {
        const section = document.getElementById('description-section');
        const btn = document.getElementById('add-description-btn');
        
        if (section.classList.contains('hidden')) {
            section.classList.remove('hidden');
            btn.textContent = '- Hide Description';
            document.getElementById('description-input').focus();
        } else {
            section.classList.add('hidden');
            btn.textContent = '+ Description';
        }
    }
    
    addTransaction() {
        const amount = parseFloat(document.getElementById('amount-input').value);
        const description = document.getElementById('description-input').value.trim() || 
                          (this.currentTransactionType === 'income' ? 'Income' : 'Expense');
        const category = document.getElementById('category-select').value || 
                        this.guessCategory(description);
        
        // Validation
        if (!amount || amount <= 0) {
            this.showToast('Please enter a valid amount', 'error');
            return;
        }
        
        if (amount > 1000000) {
            this.showToast('Amount seems too large. Please verify.', 'warning');
            return;
        }
        
        // Create transaction
        const transaction = {
            id: Date.now() + Math.random(), // Ensure uniqueness
            type: this.currentTransactionType,
            amount: amount,
            description: description,
            category: category,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            location: 'Manual Entry'
        };
        
        // Add to beginning of array
        this.transactions.unshift(transaction);
        this.saveData('budget_transactions', this.transactions);
        
        // Update display
        this.updateDisplay();
        this.closeAmountModal();
        
        // Show success message
        const emoji = this.currentTransactionType === 'income' ? '💰' : '💸';
        this.showToast(`${emoji} ₹${amount} ${this.currentTransactionType} added successfully!`, 'success');
        
        // Auto-save to prevent data loss
        this.autoSave();
    }
    
    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;
        
        // Open modal with transaction data
        this.currentTransactionType = transaction.type;
        document.getElementById('modal-title').textContent = `Edit ${transaction.type === 'income' ? 'Income' : 'Expense'}`;
        document.getElementById('amount-input').value = transaction.amount;
        document.getElementById('description-input').value = transaction.description;
        document.getElementById('category-select').value = transaction.category;
        
        // Show description section
        document.getElementById('description-section').classList.remove('hidden');
        document.getElementById('add-description-btn').textContent = '- Hide Description';
        
        // Change confirm button
        const confirmBtn = document.getElementById('confirm-amount');
        confirmBtn.textContent = 'Update Transaction';
        confirmBtn.onclick = () => this.updateTransaction(id);
        
        document.getElementById('amount-modal').classList.remove('hidden');
    }
    
    updateTransaction(id) {
        const amount = parseFloat(document.getElementById('amount-input').value);
        const description = document.getElementById('description-input').value.trim() || 'Transaction';
        const category = document.getElementById('category-select').value || this.guessCategory(description);
        
        if (!amount || amount <= 0) {
            this.showToast('Please enter a valid amount', 'error');
            return;
        }
        
        // Find and update transaction
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            this.transactions[index] = {
                ...this.transactions[index],
                amount: amount,
                description: description,
                category: category,
                type: this.currentTransactionType
            };
            
            this.saveData('budget_transactions', this.transactions);
            this.updateDisplay();
            this.closeAmountModal();
            
            // Reset confirm button
            const confirmBtn = document.getElementById('confirm-amount');
            confirmBtn.textContent = 'Add Transaction';
            confirmBtn.onclick = () => this.addTransaction();
            
            this.showToast('Transaction updated successfully! ✅', 'success');
        }
    }
    
    deleteTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;
        
        if (confirm(`Delete ${transaction.description} (₹${transaction.amount})?`)) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveData('budget_transactions', this.transactions);
            this.updateDisplay();
            this.showToast('Transaction deleted successfully! 🗑️', 'success');
        }
    }
    
    // =================== DISPLAY UPDATES ===================
    updateDisplay() {
        this.updateBalanceDisplay();
        this.updateMonthlySummary();
        this.updateRecentTransactions();
        
        if (this.activeSection === 'transactions') {
            this.updateAllTransactionsList();
        }
    }
    
    updateBalanceDisplay() {
        const totalBalance = this.calculateTotalBalance();
        document.getElementById('total-balance').textContent = this.formatCurrency(totalBalance);
    }
    
    updateMonthlySummary() {
        const currentMonth = new Date().toISOString().substring(0, 7);
        
        const monthlyIncome = this.transactions
            .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
            
        const monthlyExpenses = this.transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netSavings = monthlyIncome - monthlyExpenses;
        
        document.getElementById('monthly-income').textContent = this.formatCurrency(monthlyIncome);
        document.getElementById('monthly-expenses').textContent = this.formatCurrency(monthlyExpenses);
        document.getElementById('net-savings').textContent = this.formatCurrency(netSavings);
        
        // Update colors based on positive/negative
        const savingsElement = document.getElementById('net-savings');
        savingsElement.style.color = netSavings >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
    }
    
    updateRecentTransactions() {
        const recentList = document.getElementById('recent-list');
        const recentTransactions = this.transactions.slice(0, 5);
        
        if (recentTransactions.length === 0) {
            recentList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💳</div>
                    <p>No transactions yet</p>
                    <small>Add your first transaction above</small>
                </div>
            `;
            return;
        }
        
        recentList.innerHTML = recentTransactions.map(transaction => 
            this.createTransactionHTML(transaction)
        ).join('');
        
        // Add event listeners
        recentTransactions.forEach(transaction => {
            const editBtn = document.getElementById(`edit-${transaction.id}`);
            const deleteBtn = document.getElementById(`delete-${transaction.id}`);
            
            if (editBtn) editBtn.addEventListener('click', () => this.editTransaction(transaction.id));
            if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteTransaction(transaction.id));
        });
    }
    
    updateAllTransactionsList() {
        const allList = document.getElementById('all-transactions-list');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageTransactions = this.transactions.slice(startIndex, endIndex);
        
        if (this.transactions.length === 0) {
            allList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <p>No transactions found</p>
                    <small>Add transactions to see them here</small>
                </div>
            `;
            document.getElementById('pagination').classList.add('hidden');
            return;
        }
        
        allList.innerHTML = pageTransactions.map(transaction => 
            this.createTransactionHTML(transaction)
        ).join('');
        
        // Add event listeners
        pageTransactions.forEach(transaction => {
            const editBtn = document.getElementById(`edit-${transaction.id}`);
            const deleteBtn = document.getElementById(`delete-${transaction.id}`);
            
            if (editBtn) editBtn.addEventListener('click', () => this.editTransaction(transaction.id));
            if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteTransaction(transaction.id));
        });
        
        this.updatePagination();
    }
    
    createTransactionHTML(transaction) {
        const date = new Date(transaction.timestamp);
        const timeString = date.toLocaleString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
        });
        
        const iconEmoji = transaction.type === 'income' ? '💰' : '💸';
        const categoryEmoji = this.getCategoryEmoji(transaction.category);
        
        return `
            <div class="transaction-item">
                <div class="transaction-icon ${transaction.type}">
                    ${iconEmoji}
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${transaction.description}</div>
                    <div class="transaction-meta">
                        <span>${categoryEmoji} ${transaction.category}</span>
                        <span>📅 ${timeString}</span>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-actions">
                    <button id="edit-${transaction.id}" class="action-btn" title="Edit">✏️</button>
                    <button id="delete-${transaction.id}" class="action-btn delete" title="Delete">🗑️</button>
                </div>
            </div>
        `;
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            document.getElementById('pagination').classList.add('hidden');
            return;
        }
        
        document.getElementById('pagination').classList.remove('hidden');
        document.getElementById('page-info').textContent = `Page ${this.currentPage} of ${totalPages}`;
        document.getElementById('prev-page').disabled = this.currentPage <= 1;
        document.getElementById('next-page').disabled = this.currentPage >= totalPages;
    }
    
    changePage(direction) {
        const totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);
        const newPage = this.currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.updateAllTransactionsList();
        }
    }
    
    // =================== ANALYTICS ===================
    updateAnalytics() {
        this.updateCategoryBreakdown();
        this.updateStatsGrid();
    }
    
    updateCategoryBreakdown() {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyExpenses = this.transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
        
        const categoryTotals = {};
        monthlyExpenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
        
        const breakdown = document.getElementById('category-breakdown');
        const categories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        if (categories.length === 0) {
            breakdown.innerHTML = '<p class="text-center">No expenses this month</p>';
            return;
        }
        
        breakdown.innerHTML = categories.map(([category, amount], index) => {
            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
            return `
                <div class="category-item">
                    <div class="category-info">
                        <div class="category-color" style="background: ${colors[index]}"></div>
                        <span>${this.getCategoryEmoji(category)} ${category}</span>
                    </div>
                    <div class="category-amount">${this.formatCurrency(amount)}</div>
                </div>
            `;
        }).join('');
    }
    
    updateStatsGrid() {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyExpenses = this.transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
        
        // Daily average
        const daysInMonth = new Date().getDate();
        const totalExpenses = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
        const dailyAverage = totalExpenses / daysInMonth;
        
        // Largest expense
        const largestExpense = monthlyExpenses.reduce((max, t) => t.amount > max ? t.amount : max, 0);
        
        document.getElementById('daily-average').textContent = this.formatCurrency(dailyAverage);
        document.getElementById('largest-expense').textContent = this.formatCurrency(largestExpense);
        document.getElementById('total-transactions').textContent = this.transactions.length.toString();
    }
    
    // =================== CHAT SYSTEM ===================
    toggleChat() {
        const chatModal = document.getElementById('chat-modal');
        chatModal.classList.remove('hidden');
        document.getElementById('chat-input').focus();
    }
    
    closeChat() {
        document.getElementById('chat-modal').classList.add('hidden');
    }
    
    async sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addChatMessage(message, 'user');
        input.value = '';
        
        // Show typing indicator
        this.showChatStatus('AI is thinking...');
        const sendBtn = document.getElementById('chat-send');
        sendBtn.disabled = true;
        
        try {
            // Try local commands first
            const localResponse = await this.processLocalCommand(message);
            if (localResponse) {
                this.addChatMessage(localResponse, 'bot');
                return;
            }
            
            // Send to AI API
            const response = await this.sendToPerplexityAI(message);
            this.addChatMessage(response, 'bot');
            
        } catch (error) {
            console.error('Chat error:', error);
            let errorMessage = 'Sorry, I encountered an error. ';
            
            if (error.message.includes('API key')) {
                errorMessage += 'Please check the API configuration.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage += 'Please check your internet connection.';
            } else {
                errorMessage += 'Please try again in a moment.';
            }
            
            this.addChatMessage(errorMessage, 'bot');
        } finally {
            this.hideChatStatus();
            sendBtn.disabled = false;
        }
    }
    
    async processLocalCommand(message) {
        const lower = message.toLowerCase();
        
        // Balance inquiry
        if (lower.includes('balance') || lower.includes('total money')) {
            const balance = this.calculateTotalBalance();
            return `Your current balance is ${this.formatCurrency(balance)}. ${balance >= 0 ? '💰' : '⚠️'}`;
        }
        
        // Monthly summary
        if (lower.includes('this month') || lower.includes('monthly summary')) {
            return this.getMonthlyReport();
        }
        
        // Add transaction commands
        const addExpenseMatch = message.match(/add expense (?:of )?(?:₹)?(\d+(?:\.\d{2})?)(?: for (.+))?/i);
        if (addExpenseMatch) {
            const amount = parseFloat(addExpenseMatch[1]);
            const description = addExpenseMatch[2] || 'Quick expense';
            return this.addQuickTransaction('expense', amount, description);
        }
        
        const addIncomeMatch = message.match(/add income (?:of )?(?:₹)?(\d+(?:\.\d{2})?)(?: for (.+))?/i);
        if (addIncomeMatch) {
            const amount = parseFloat(addIncomeMatch[1]);
            const description = addIncomeMatch[2] || 'Quick income';
            return this.addQuickTransaction('income', amount, description);
        }
        
        // Delete last transaction
        if (lower.includes('delete last') || lower.includes('remove last')) {
            if (this.transactions.length > 0) {
                const deleted = this.transactions.shift();
                this.saveData('budget_transactions', this.transactions);
                this.updateDisplay();
                return `Deleted: ${deleted.description} (₹${deleted.amount}) ✅`;
            }
            return 'No transactions to delete.';
        }
        
        // Recent transactions
        if (lower.includes('recent') || lower.includes('latest')) {
            return this.getRecentTransactionsReport();
        }
        
        // Category spending
        for (const category of this.categories) {
            if (lower.includes(category.toLowerCase())) {
                return this.getCategorySpendingReport(category);
            }
        }
        
        return null; // No local command matched
    }
    
    async sendToPerplexityAI(message) {
        const context = this.generateFinancialContext();
        
        const systemPrompt = `You are Juned's personal budget assistant. You have access to his financial data and can provide helpful insights and advice.

Current Financial Overview:
${context}

Instructions:
- Be conversational and helpful
- Use Indian Rupees (₹) for all amounts
- Provide specific insights based on the data
- Keep responses concise but informative
- Use appropriate emojis
- If asked about transactions or balances, refer to the data above`;

        const response = await fetch(this.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    addChatMessage(message, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'bot' ? '🤖' : '👤';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showChatStatus(status) {
        document.getElementById('chat-status').textContent = status;
    }
    
    hideChatStatus() {
        document.getElementById('chat-status').textContent = '';
    }
    
    // =================== UTILITY FUNCTIONS ===================
    addQuickTransaction(type, amount, description) {
        if (!amount || amount <= 0) {
            return 'Invalid amount. Please specify a positive number.';
        }
        
        const transaction = {
            id: Date.now() + Math.random(),
            type: type,
            amount: amount,
            description: description,
            category: this.guessCategory(description),
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            location: 'Chat Command'
        };
        
        this.transactions.unshift(transaction);
        this.saveData('budget_transactions', this.transactions);
        this.updateDisplay();
        
        const emoji = type === 'income' ? '💰' : '💸';
        return `${emoji} Added ${type}: ${description} for ₹${amount} ✅`;
    }
    
    getMonthlyReport() {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyIncome = this.transactions
            .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        const monthlyExpenses = this.transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        const net = monthlyIncome - monthlyExpenses;
        
        return `📊 This Month Summary:
💰 Income: ${this.formatCurrency(monthlyIncome)}
💸 Expenses: ${this.formatCurrency(monthlyExpenses)}
📈 Net: ${this.formatCurrency(net)} ${net >= 0 ? '✅' : '⚠️'}`;
    }
    
    getRecentTransactionsReport() {
        const recent = this.transactions.slice(0, 5);
        if (recent.length === 0) return 'No recent transactions found.';
        
        const list = recent.map(t => 
            `${t.type === 'income' ? '💰' : '💸'} ${t.description}: ₹${t.amount}`
        ).join('\n');
        
        return `📝 Recent Transactions:\n${list}`;
    }
    
    getCategorySpendingReport(category) {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const categoryExpenses = this.transactions
            .filter(t => t.type === 'expense' && 
                         t.category === category && 
                         t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        
        const emoji = this.getCategoryEmoji(category);
        return `${emoji} ${category} spending this month: ${this.formatCurrency(categoryExpenses)}`;
    }
    
    generateFinancialContext() {
        const balance = this.calculateTotalBalance();
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyIncome = this.transactions
            .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        const monthlyExpenses = this.transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        
        const recentTransactions = this.transactions.slice(0, 5);
        
        return `
Total Balance: ₹${balance}
This Month Income: ₹${monthlyIncome}
This Month Expenses: ₹${monthlyExpenses}
Net This Month: ₹${monthlyIncome - monthlyExpenses}

Recent Transactions:
${recentTransactions.map(t => 
    `- ${t.date}: ${t.description} (${t.type === 'income' ? '+' : '-'}₹${t.amount})`
).join('\n')}

Total Transactions: ${this.transactions.length}
        `;
    }
    
    calculateTotalBalance() {
        return this.transactions.reduce((sum, transaction) => {
            return transaction.type === 'income' ? sum + transaction.amount : sum - transaction.amount;
        }, 0);
    }
    
    guessCategory(description) {
        const lower = description.toLowerCase();
        
        const categoryKeywords = {
            'Food': ['food', 'restaurant', 'grocery', 'lunch', 'dinner', 'breakfast', 'cafe', 'snack', 'meal'],
            'Transport': ['transport', 'uber', 'bus', 'train', 'taxi', 'petrol', 'fuel', 'auto', 'metro'],
            'Bills': ['bill', 'electricity', 'rent', 'internet', 'wifi', 'mobile', 'water', 'gas'],
            'Entertainment': ['movie', 'entertainment', 'game', 'concert', 'netflix', 'spotify', 'party'],
            'Shopping': ['shopping', 'clothes', 'amazon', 'flipkart', 'purchase', 'buy', 'shop'],
            'Health': ['health', 'doctor', 'medicine', 'hospital', 'pharmacy', 'medical', 'clinic'],
            'Education': ['education', 'book', 'course', 'class', 'school', 'college', 'study'],
            'Investment': ['investment', 'mutual fund', 'stock', 'fd', 'sip', 'trading']
        };
        
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => lower.includes(keyword))) {
                return category;
            }
        }
        
        return 'Other';
    }
    
    getCategoryEmoji(category) {
        const emojis = {
            'Food': '🍕',
            'Transport': '🚗',
            'Bills': '📄',
            'Entertainment': '🎬',
            'Shopping': '🛒',
            'Health': '🏥',
            'Education': '📚',
            'Investment': '📈',
            'Other': '📦'
        };
        return emojis[category] || '📦';
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    }
    
    getDefaultLimits() {
        return {
            'Food': 8000,
            'Transport': 3000,
            'Bills': 5000,
            'Entertainment': 2000,
            'Shopping': 4000,
            'Health': 2000,
            'Education': 3000,
            'Investment': 5000,
            'Other': 2000
        };
    }
    
    // =================== DATA MANAGEMENT ===================
    loadData(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return defaultValue;
        }
    }
    
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            this.showToast('Error saving data', 'error');
        }
    }
    
    autoSave() {
        // Save all critical data
        this.saveData('budget_transactions', this.transactions);
        this.saveData('budget_accounts', this.accounts);
        this.saveData('budget_settings', this.settings);
    }
    
    // =================== SETTINGS ===================
    toggleTheme(isDark) {
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        this.settings.theme = theme;
        this.saveData('budget_settings', this.settings);
    }
    
    loadTheme() {
        const isDark = this.settings.theme === 'dark';
        document.getElementById('theme-toggle').checked = isDark;
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }
    
    editAccounts() {
        const savings = prompt('Enter Savings Account Balance (₹):', this.accounts.savings || 0);
        const current = prompt('Enter Current Account Balance (₹):', this.accounts.current || 0);
        
        if (savings !== null && current !== null) {
            this.accounts.savings = parseFloat(savings) || 0;
            this.accounts.current = parseFloat(current) || 0;
            this.saveData('budget_accounts', this.accounts);
            this.updateDisplay();
            this.showToast('Account balances updated! 💳', 'success');
        }
    }
    
    // =================== EXPORT/IMPORT ===================
    exportCSV() {
        if (this.transactions.length === 0) {
            this.showToast('No transactions to export', 'warning');
            return;
        }
        
        const headers = ['Date', 'Type', 'Amount', 'Description', 'Category', 'Timestamp'];
        const rows = this.transactions.map(t => [
            t.date,
            t.type,
            t.amount,
            t.description,
            t.category,
            t.timestamp
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
        
        this.downloadFile(csvContent, `budget-tracker-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
        this.showToast('CSV exported successfully! 📊', 'success');
    }
    
    exportAllData() {
        const allData = {
            transactions: this.transactions,
            accounts: this.accounts,
            limits: this.limits,
            goals: this.goals,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const jsonContent = JSON.stringify(allData, null, 2);
        this.downloadFile(jsonContent, `budget-tracker-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        this.showToast('Full backup exported! 💾', 'success');
    }
    
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    clearAllData() {
        if (confirm('⚠️ This will delete ALL your data permanently. Are you sure?')) {
            const secondConfirm = confirm('This action cannot be undone. Type "DELETE" to confirm:');
            if (secondConfirm) {
                localStorage.clear();
                location.reload();
            }
        }
    }
    
    // =================== UI HELPERS ===================
    populateCategoryFilters() {
        const filterSelect = document.getElementById('filter-category');
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = `${this.getCategoryEmoji(category)} ${category}`;
            filterSelect.appendChild(option);
        });
    }
    
    updateCategoryLimits() {
        // Implementation for category limits section
        this.showToast('Category limits feature coming soon! 🎯', 'info');
    }
    
    updateGoalsList() {
        // Implementation for goals section
        this.showToast('Goals feature coming soon! 🎯', 'info');
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 4000);
    }
    
    showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.budgetTracker = new BudgetTracker();
    
    // Service Worker Registration for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(error => console.log('SW registration failed:', error));
    }
});