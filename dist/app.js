(function () {
  'use strict';

  var STORAGE_KEY = 'todo-controle-local-v3';
  var LEGACY_KEY = 'todo-controle-local-v1';
  var THEME_KEY = 'todo-controle-theme';
  var activeView = 'dashboard';
  var activeFilter = 'all';
  var searchTerm = '';
  var modal = null;
  var quickMenu = false;
  var importRows = [];
  var toastTimer = null;
  var theme = localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  var monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  var colors = ['#9a5cf2', '#35c7b4', '#52a7ff', '#f3a85b', '#ed6d88', '#8d9baa'];

  function uid(prefix) { return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function pad(value) { return String(value).padStart(2, '0'); }
  function todayISO() { var date = new Date(); return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); }
  function currentMonth() { return todayISO().slice(0, 7); }
  function addMonths(iso, count) { var date = new Date(iso + 'T12:00:00'); date.setMonth(date.getMonth() + count); return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); }
  function money(value) { return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function parseMoney(value) { var text = String(value || '').trim().replace(/[R$\s]/g, ''); if (!text) return 0; if (text.indexOf(',') >= 0) text = text.replace(/\./g, '').replace(',', '.'); var number = Number(text); return Number.isFinite(number) ? number : 0; }
  function dateBR(iso) { if (!iso) return '-'; var parts = iso.split('-'); return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : iso; }
  function monthLabel(month) { var parts = month.split('-'); return monthNames[Number(parts[1]) - 1] + ' de ' + parts[0]; }
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]; }); }
  function selected(condition) { return condition ? ' selected' : ''; }
  function checked(condition) { return condition ? ' checked' : ''; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function defaultState() {
    var date = todayISO();
    var month = currentMonth();
    return {
      version: 3,
      selectedMonth: month,
      accounts: [
        { id: 'account-main', name: 'Conta principal', institution: 'Banco do Brasil', type: 'Conta corrente', openingBalance: 1200, color: '#7c3aed' },
        { id: 'account-wallet', name: 'Carteira', institution: 'Dinheiro físico', type: 'Carteira', openingBalance: 180, color: '#35c7b4' }
      ],
      cards: [
        { id: 'card-nubank', name: 'Nubank', brand: 'Mastercard', limit: 5000, closingDay: 25, dueDay: 7, color: '#9a5cf2' },
        { id: 'card-ouro', name: 'Ourocard', brand: 'Visa', limit: 6500, closingDay: 12, dueDay: 18, color: '#52a7ff' }
      ],
      categories: [
        { id: 'cat-home', name: 'Casa', parentId: '', color: '#52a7ff' },
        { id: 'cat-food', name: 'Alimentação', parentId: '', color: '#35c7b4' },
        { id: 'cat-transport', name: 'Transporte', parentId: '', color: '#f3a85b' },
        { id: 'cat-leisure', name: 'Lazer', parentId: '', color: '#ed6d88' },
        { id: 'cat-subscriptions', name: 'Assinaturas', parentId: '', color: '#9a5cf2' },
        { id: 'cat-health', name: 'Saúde', parentId: '', color: '#8d9baa' },
        { id: 'cat-pix', name: 'Pix', parentId: '', color: '#c76df2' },
        { id: 'cat-market', name: 'Mercado', parentId: 'cat-food', color: '#35c7b4' },
        { id: 'cat-restaurants', name: 'Restaurantes', parentId: 'cat-food', color: '#35c7b4' }
      ],
      transactions: [
        { id: 'tx-salary', date: date, description: 'Salário', type: 'income', amount: 6000, accountId: 'account-main', categoryId: '', status: 'paid', note: '', tags: [] },
        { id: 'tx-rent', date: date, description: 'Aluguel', type: 'expense', amount: 1800, accountId: 'account-main', categoryId: 'cat-home', status: 'paid', recurring: true, note: '', tags: ['fixa'] },
        { id: 'tx-market', date: date, description: 'Supermercado', type: 'expense', amount: 482.35, accountId: 'account-main', categoryId: 'cat-market', status: 'paid', note: '', tags: [] },
        { id: 'tx-internet', date: date, description: 'Internet e celular', type: 'expense', amount: 180, accountId: 'account-main', categoryId: 'cat-subscriptions', status: 'pending', recurring: true, note: '', tags: ['fixa'] },
        { id: 'tx-transport', date: date, description: 'Transporte da semana', type: 'expense', amount: 126.9, accountId: 'account-wallet', categoryId: 'cat-transport', status: 'paid', note: '', tags: [] },
        { id: 'tx-cinema', date: date, description: 'Cinema', type: 'expense', amount: 68, cardId: 'card-nubank', categoryId: 'cat-leisure', status: 'paid', note: '', tags: [] }
      ],
      bills: [
        { id: 'bill-rent', description: 'Aluguel', amount: 1800, dueDate: date, categoryId: 'cat-home', status: 'paid', recurring: true },
        { id: 'bill-internet', description: 'Internet e celular', amount: 180, dueDate: date, categoryId: 'cat-subscriptions', status: 'open', recurring: true },
        { id: 'bill-health', description: 'Plano de saúde', amount: 320, dueDate: date, categoryId: 'cat-health', status: 'open', recurring: true }
      ],
      budgets: [
        { id: 'budget-home', month: month, categoryId: 'cat-home', amount: 2200 },
        { id: 'budget-food', month: month, categoryId: 'cat-food', amount: 900 },
        { id: 'budget-transport', month: month, categoryId: 'cat-transport', amount: 600 },
        { id: 'budget-leisure', month: month, categoryId: 'cat-leisure', amount: 400 },
        { id: 'budget-subscriptions', month: month, categoryId: 'cat-subscriptions', amount: 700 }
      ],
      goals: [
        { id: 'goal-reserve', name: 'Reserva de emergência', target: 12000, saved: 3400, dueDate: addMonths(date, 8), color: '#35c7b4' }
      ],
      connections: []
    };
  }

  function migrateLegacy() {
    var legacy = null;
    try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null'); } catch (error) { legacy = null; }
    if (!legacy) return null;
    var migrated = defaultState();
    if (Array.isArray(legacy.envelopes)) {
      migrated.budgets = legacy.envelopes.map(function (envelope, index) {
        var category = migrated.categories.find(function (item) { return item.name.toLowerCase() === String(envelope.name || '').toLowerCase(); });
        if (!category) { category = { id: uid('cat'), name: envelope.name || 'Categoria ' + (index + 1), parentId: '', color: colors[index % colors.length] }; migrated.categories.push(category); }
        return { id: uid('budget'), month: migrated.selectedMonth, categoryId: category.id, amount: Number(envelope.planned || envelope.amount || 0) };
      });
    }
    if (Array.isArray(legacy.transactions)) {
      migrated.transactions = legacy.transactions.map(function (transaction) {
        var category = migrated.categories.find(function (item) { return item.name.toLowerCase() === String(transaction.category || '').toLowerCase(); });
        if (!category && transaction.category) { category = { id: uid('cat'), name: transaction.category, parentId: '', color: colors[migrated.categories.length % colors.length] }; migrated.categories.push(category); }
        return { id: transaction.id || uid('tx'), date: transaction.date || todayISO(), description: transaction.description || transaction.name || 'Lançamento importado', type: transaction.type === 'income' || transaction.type === 'Entrada' ? 'income' : 'expense', amount: Number(transaction.amount || 0), accountId: 'account-main', categoryId: category ? category.id : '', status: transaction.status || 'paid', tags: transaction.tags || [], note: transaction.note || '' };
      });
    }
    return migrated;
  }

  function normalize(value) {
    var base = defaultState();
    var result = Object.assign(base, value || {});
    ['accounts', 'cards', 'categories', 'transactions', 'bills', 'budgets', 'goals', 'connections'].forEach(function (key) { if (!Array.isArray(result[key])) result[key] = base[key]; });
    result.selectedMonth = result.selectedMonth || currentMonth();
    return result;
  }

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && saved.version >= 3) return normalize(saved);
    } catch (error) {}
    return normalize(migrateLegacy() || defaultState());
  }

  var state = loadState();
  state.telegram = state.telegram || { status: 'not-configured', botUsername: '', chatId: '' };
  var activeCardFilter = 'all';
  var activeCategoryFilter = 'all';
  var activeAccountFilter = 'all';
  var reportStartDate = '';
  var reportEndDate = '';
  var reportCardFilter = 'all';
  var reportCategoryFilter = 'all';
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f4f1eb' : '#101217');
  }
  function ensureThemeControl() {
    var button = document.getElementById('theme-control');
    if (!button) {
      button = document.createElement('button');
      button.id = 'theme-control';
      button.className = 'theme-toggle-floating';
      button.setAttribute('data-action', 'toggle-theme');
      document.body.appendChild(button);
    }
    button.setAttribute('aria-label', theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
    button.innerHTML = '<span class="theme-toggle-icon">' + (theme === 'dark' ? '☼' : '◐') + '</span><span>' + (theme === 'dark' ? 'Claro' : 'Escuro') + '</span>';
  }
  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, theme);
    applyTheme();
    ensureThemeControl();
    showToast(theme === 'light' ? 'Tema claro ativado.' : 'Tema escuro ativado.');
  }
  function categoryById(id) { return state.categories.find(function (item) { return item.id === id; }); }
  function accountById(id) { return state.accounts.find(function (item) { return item.id === id; }); }
  function cardById(id) { return state.cards.find(function (item) { return item.id === id; }); }
  function monthTransactions(month) { return state.transactions.filter(function (item) { return String(item.date || '').slice(0, 7) === month; }); }
  function displayCategory(transaction) {
    if (transaction.type === 'income') return 'Receita';
    if (transaction.type === 'transfer') return 'Transferência';
    var category = categoryById(transaction.categoryId);
    if (!category) return 'Sem categoria';
    var parent = category.parentId ? categoryById(category.parentId) : null;
    return parent ? parent.name + ' · ' + category.name : category.name;
  }
  function categoryExpense(month, categoryId) {
    return monthTransactions(month).filter(function (item) {
      var category = categoryById(item.categoryId);
      return item.type === 'expense' && (item.categoryId === categoryId || category && category.parentId === categoryId);
    }).reduce(function (total, item) { return total + Number(item.amount || 0); }, 0);
  }
  function accountBalance(accountId) {
    var account = accountById(accountId);
    var total = Number(account && account.openingBalance || 0);
    state.transactions.forEach(function (item) {
      if (item.type === 'income' && item.accountId === accountId) total += Number(item.amount || 0);
      if (item.type === 'expense' && item.accountId === accountId) total -= Number(item.amount || 0);
      if (item.type === 'transfer' && item.fromAccountId === accountId) total -= Number(item.amount || 0);
      if (item.type === 'transfer' && item.toAccountId === accountId) total += Number(item.amount || 0);
      if (item.type === 'card-payment' && item.accountId === accountId) total -= Number(item.amount || 0);
    });
    return total;
  }
  function cardBill(cardId, month) {
    return state.transactions.reduce(function (total, item) {
      if (item.cardId !== cardId) return total;
      var itemMonth = item.type === 'expense' ? (item.billingMonth || String(item.date || '').slice(0, 7)) : String(item.date || '').slice(0, 7);
      if (itemMonth !== month) return total;
      if (item.type === 'expense') return total + Number(item.amount || 0);
      if (item.type === 'card-payment') return total - Number(item.amount || 0);
      return total;
    }, 0);
  }
  function summary(month) {
    var transactions = monthTransactions(month);
    var income = transactions.filter(function (item) { return item.type === 'income'; }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);
    var expense = transactions.filter(function (item) { return item.type === 'expense'; }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);
    var planned = state.budgets.filter(function (item) { return item.month === month; }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);
    var balance = state.accounts.reduce(function (sum, account) { return sum + accountBalance(account.id); }, 0);
    var pending = transactions.filter(function (item) { return item.status === 'pending'; }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);
    var openBills = state.bills.filter(function (item) { return String(item.dueDate || '').slice(0, 7) === month && item.status === 'open'; }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);
    return { income: income, expense: expense, planned: planned, balance: balance, monthly: income - expense, pending: pending, openBills: openBills, transactions: transactions };
  }

  function navItems() { return [['dashboard', '⌂', 'Principal'], ['transactions', '☷', 'Transações'], ['planning', '◫', 'Planejamento'], ['accounts', '▣', 'Contas e cartões'], ['reports', '◌', 'Relatórios'], ['telegram', '✦', 'Telegram'], ['openfinance', '⌁', 'Open Finance'], ['more', '⋯', 'Mais']]; }
  function renderSidebar() {
    return '<aside class="sidebar" id="sidebar"><a class="brand" href="#dashboard" data-view="dashboard"><span class="brand-mark">+</span><span>Todo Controle<small>suas regras, seu ritmo</small></span></a><p class="side-label">Workspace</p><nav class="side-nav">' + navItems().map(function (item) { return '<button class="nav-item' + (activeView === item[0] ? ' active' : '') + '" data-view="' + item[0] + '"><span class="nav-icon">' + item[1] + '</span>' + item[2] + '</button>'; }).join('') + '</nav><div class="sidebar-footer"><span class="privacy-dot"></span>Modo local ativo<br><span>Seus dados ficam neste navegador.</span></div></aside>';
  }
  function renderMobileNav() {
    var items = navItems().slice(0, 5);
    return '<nav class="mobile-nav">' + items.map(function (item) { return '<button class="' + (activeView === item[0] ? 'active' : '') + '" data-view="' + item[0] + '"><span class="nav-icon">' + item[1] + '</span><span>' + item[2].split(' ')[0] + '</span></button>'; }).join('') + '</nav>';
  }
  function monthOptions() {
    var values = [];
    for (var i = -2; i <= 3; i += 1) values.push(addMonths(state.selectedMonth + '-01', i).slice(0, 7));
    return values.map(function (month) { return '<option value="' + month + '"' + selected(month === state.selectedMonth) + '>' + monthLabel(month) + '</option>'; }).join('');
  }
  function renderTopbar(title, subtitle) {
    return '<header class="topbar"><div><h1>' + esc(title) + '</h1><p>' + esc(subtitle || monthLabel(state.selectedMonth)) + '</p></div><div class="topbar-actions"><select class="month-select" id="month-picker" aria-label="Mês de referência">' + monthOptions() + '</select><button class="button primary" data-action="quick-add">＋ Adicionar</button></div></header>';
  }
  function accountMarkup(account) {
    return '<div class="account-row"><div class="account-main"><span class="account-badge" style="background:' + esc(account.color || '#7c3aed') + '">' + esc(account.name.slice(0, 1).toUpperCase()) + '</span><span><strong>' + esc(account.name) + '</strong><span>' + esc(account.institution || account.type || 'Conta') + '</span></span></div><div class="row-value"><strong>' + money(accountBalance(account.id)) + '</strong><span>saldo atual</span></div></div>';
  }
  function cardMarkup(card) {
    var bill = cardBill(card.id, state.selectedMonth);
    var percentage = card.limit ? clamp(bill / card.limit * 100, 0, 100) : 0;
    return '<div class="card-row"><div class="card-main"><span class="card-badge" style="background:' + esc(card.color || '#9a5cf2') + '">▣</span><span><strong>' + esc(card.name) + '</strong><span>' + esc(card.brand || 'Cartão') + ' · vence dia ' + esc(card.dueDay || '-') + '</span></span></div><div class="row-value"><strong class="' + (bill > card.limit ? 'negative' : '') + '">' + money(bill) + '</strong><span>' + Math.round(percentage) + '% do limite</span></div></div>';
  }
  function transactionMarkup(transaction, withActions) {
    var isIncome = transaction.type === 'income';
    var isTransfer = transaction.type === 'transfer';
    var owner = transaction.cardId ? cardById(transaction.cardId) : accountById(transaction.accountId);
    var icon = isIncome ? '↑' : isTransfer ? '↔' : '↓';
    var amountClass = isIncome ? 'positive' : isTransfer ? 'accent' : 'negative';
    var amountPrefix = isIncome ? '+ ' : isTransfer ? '' : '- ';
    return '<div class="transaction-row"><div class="transaction-description"><span class="transaction-icon">' + icon + '</span><span><strong>' + esc(transaction.description) + '</strong><span class="transaction-secondary">' + esc(displayCategory(transaction)) + (owner ? ' · ' + esc(owner.name) : '') + (transaction.recurring ? ' · recorrente' : '') + '</span></span></div><span class="transaction-secondary">' + dateBR(transaction.date) + '</span><span class="transaction-secondary">' + (transaction.status === 'pending' ? '<span class="status">pendente</span>' : (transaction.installments ? transaction.installmentNumber + '/' + transaction.installments + ' parcela' : 'confirmado')) + '</span><div class="transaction-amount ' + amountClass + '">' + amountPrefix + money(transaction.amount) + '</div>' + (withActions ? '<div class="transaction-actions"><button class="icon-button" title="Editar lançamento" aria-label="Editar lançamento" data-action="edit-transaction" data-id="' + transaction.id + '">✎</button><button class="icon-button" title="Excluir lançamento" aria-label="Excluir lançamento" data-action="delete-transaction" data-id="' + transaction.id + '">×</button></div>' : '') + '</div>';
  }
  function categorySummary(month) {
    return state.categories.filter(function (category) { return !category.parentId; }).map(function (category) { return { category: category, amount: categoryExpense(month, category.id) }; }).filter(function (row) { return row.amount > 0; }).sort(function (a, b) { return b.amount - a.amount; });
  }
  function renderDashboard() {
    var data = summary(state.selectedMonth);
    var categories = categorySummary(state.selectedMonth);
    var totalCategory = categories.reduce(function (sum, row) { return sum + row.amount; }, 0) || 1;
    var angle = 0;
    var stops = categories.map(function (row, index) { var start = angle; angle += row.amount / totalCategory * 360; return (row.category.color || colors[index % colors.length]) + ' ' + start + 'deg ' + angle + 'deg'; });
    if (!stops.length) stops = ['#3a3845 0deg 360deg'];
    var recent = data.transactions.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 6);
    return renderTopbar('Visão geral', 'Um retrato claro do seu mês financeiro') + '<div class="content"><div class="grid summary-grid"><div class="card summary-card"><span class="label">Saldo em contas</span><div class="value ' + (data.balance < 0 ? 'negative' : 'positive') + '">' + money(data.balance) + '</div><div class="helper">patrimônio em contas cadastradas</div></div><div class="card summary-card"><span class="label">Receitas</span><div class="value positive">' + money(data.income) + '</div><div class="helper">entradas no mês</div></div><div class="card summary-card"><span class="label">Despesas</span><div class="value negative">' + money(data.expense) + '</div><div class="helper">saídas no mês</div></div><div class="card summary-card"><span class="label">Balanço mensal</span><div class="value ' + (data.monthly < 0 ? 'negative' : 'positive') + '">' + money(data.monthly) + '</div><div class="helper">' + data.transactions.length + ' movimentos registrados</div></div></div><div class="grid alert-grid section"><div class="alert-card"><span class="alert-icon">↓</span><span><strong>' + money(data.pending) + '</strong><span>lançamentos pendentes</span></span></div><div class="alert-card"><span class="alert-icon teal">▤</span><span><strong>' + money(data.openBills) + '</strong><span>contas em aberto</span></span></div><div class="alert-card"><span class="alert-icon yellow">◫</span><span><strong>' + state.cards.filter(function (card) { return cardBill(card.id, state.selectedMonth) > 0; }).length + '</strong><span>faturas com movimento</span></span></div></div><div class="grid two-column"><section class="card section"><div class="section-heading"><div><h2>Contas</h2><p>Saldo consolidado por conta</p></div><button class="button small ghost" data-view="accounts">Ver todas →</button></div><div class="account-list">' + state.accounts.slice(0, 4).map(accountMarkup).join('') + '</div></section><section class="card section"><div class="section-heading"><div><h2>Cartões de crédito</h2><p>Faturas do mês atual</p></div><button class="button small ghost" data-view="accounts">Gerenciar →</button></div><div class="card-list">' + state.cards.slice(0, 4).map(cardMarkup).join('') + '</div></section></div><div class="grid two-column"><section class="card section"><div class="section-heading"><div><h2>Despesas por categoria</h2><p>Onde seu dinheiro está indo</p></div><button class="button small ghost" data-view="reports">Relatórios →</button></div><div class="category-layout"><div class="donut" style="background:conic-gradient(' + stops.join(',') + ')"></div><div class="legend">' + (categories.length ? categories.slice(0, 6).map(function (row) { return '<div class="legend-row"><span class="legend-label"><i class="legend-dot" style="background:' + esc(row.category.color) + '"></i>' + esc(row.category.name) + '</span><span>' + money(row.amount) + '</span></div>'; }).join('') : '<div class="empty">Ainda não há despesas categorizadas.</div>') + '</div></div></section><section class="card section"><div class="section-heading"><div><h2>Planejamento mensal</h2><p>Orçamento por categoria</p></div><button class="button small secondary" data-action="open-budget">＋ Orçamento</button></div><div class="budget-list">' + state.budgets.filter(function (budget) { return budget.month === state.selectedMonth; }).slice(0, 5).map(function (budget) { var category = categoryById(budget.categoryId); var used = categoryExpense(state.selectedMonth, budget.categoryId); var pct = budget.amount ? clamp(used / budget.amount * 100, 0, 100) : 0; return '<div class="budget-row"><div class="budget-row-top"><strong>' + esc(category ? category.name : 'Sem categoria') + '</strong><span>' + money(used) + ' / ' + money(budget.amount) + '</span></div><div class="progress ' + (pct > 100 ? 'red' : '') + '"><span style="width:' + pct + '%"></span></div><div class="budget-meta"><span>' + Math.round(pct) + '% usado</span><span>' + money(Math.max(0, budget.amount - used)) + ' restante</span></div></div>'; }).join('') + '</div></section></div><section class="card section"><div class="section-heading"><div><h2>Movimentos recentes</h2><p>Entradas, despesas e transferências de ' + esc(monthLabel(state.selectedMonth)) + '</p></div><div class="actions"><button class="button small secondary" data-action="quick-add">＋ Lançamento</button><button class="button small ghost" data-view="transactions">Ver todos →</button></div></div><div class="transaction-list">' + (recent.length ? recent.map(function (item) { return transactionMarkup(item, false); }).join('') : '<div class="empty">Nenhum lançamento neste mês.</div>') + '</div></section></div>';
  }
  function renderTransactions() {
    var transactions = monthTransactions(state.selectedMonth).filter(function (item) { var text = (item.description + ' ' + displayCategory(item)).toLowerCase(); var filterMatch = activeFilter === 'all' || activeFilter === item.type || activeFilter === 'pending' && item.status === 'pending'; return filterMatch && text.indexOf(searchTerm.toLowerCase()) >= 0; }).sort(function (a, b) { return b.date.localeCompare(a.date); });
    return renderTopbar('Transações', 'Registre e revise tudo o que acontece com seu dinheiro') + '<div class="content"><section class="card section"><div class="section-heading"><div><h2>Seus lançamentos</h2><p>' + transactions.length + ' resultados em ' + esc(monthLabel(state.selectedMonth)) + '</p></div><button class="button primary" data-action="quick-add">＋ Novo lançamento</button></div><div class="filter-bar"><input class="search" id="transaction-search" value="' + esc(searchTerm) + '" placeholder="Buscar por descrição ou categoria" aria-label="Buscar lançamentos" /><button class="filter-chip' + (activeFilter === 'all' ? ' active' : '') + '" data-filter="all">Todos</button><button class="filter-chip' + (activeFilter === 'expense' ? ' active' : '') + '" data-filter="expense">Despesas</button><button class="filter-chip' + (activeFilter === 'income' ? ' active' : '') + '" data-filter="income">Receitas</button><button class="filter-chip' + (activeFilter === 'pending' ? ' active' : '') + '" data-filter="pending">Pendentes</button></div><div class="transaction-list">' + (transactions.length ? transactions.map(function (item) { return transactionMarkup(item, true); }).join('') : '<div class="empty">Nenhum lançamento encontrado.</div>') + '</div></section></div>';
  }
  function renderPlanning() {
    var budgets = state.budgets.filter(function (item) { return item.month === state.selectedMonth; });
    var bills = state.bills.filter(function (item) { return String(item.dueDate || '').slice(0, 7) === state.selectedMonth; }).sort(function (a, b) { return a.dueDate.localeCompare(b.dueDate); });
    var recurring = state.transactions.filter(function (item) { return item.recurring; }).slice(0, 6);
    return renderTopbar('Planejamento', 'Dê uma função para cada real antes de gastá-lo') + '<div class="content"><div class="grid two-column"><section class="card section"><div class="section-heading"><div><h2>Orçamento por categoria</h2><p>Limites definidos para ' + esc(monthLabel(state.selectedMonth)) + '</p></div><button class="button primary small" data-action="open-budget">＋ Novo limite</button></div><div class="budget-list">' + (budgets.length ? budgets.map(function (budget) { var cat = categoryById(budget.categoryId); var spent = categoryExpense(state.selectedMonth, budget.categoryId); var pct = budget.amount ? spent / budget.amount * 100 : 0; return '<div class="budget-row"><div class="budget-row-top"><strong>' + esc(cat ? cat.name : 'Sem categoria') + '</strong><span>' + money(spent) + ' / ' + money(budget.amount) + '</span></div><div class="progress ' + (pct > 100 ? 'red' : '') + '"><span style="width:' + clamp(pct, 0, 100) + '%"></span></div><div class="budget-meta"><span>' + (pct > 100 ? 'acima do limite' : Math.round(pct) + '% utilizado') + '</span><button class="icon-button" data-action="delete-budget" data-id="' + budget.id + '" aria-label="Excluir orçamento">×</button></div></div>'; }).join('') : '<div class="empty">Crie seu primeiro limite mensal.</div>') + '</div></section><section class="card section"><div class="section-heading"><div><h2>Metas</h2><p>Objetivos que você quer alcançar</p></div><button class="button small secondary" data-action="open-goal">＋ Meta</button></div><div class="goal-list">' + (state.goals.length ? state.goals.map(function (goal) { var pct = goal.target ? clamp(goal.saved / goal.target * 100, 0, 100) : 0; return '<div class="budget-row"><div class="budget-row-top"><strong>' + esc(goal.name) + '</strong><span>' + money(goal.saved) + ' / ' + money(goal.target) + '</span></div><div class="progress teal"><span style="width:' + pct + '%"></span></div><div class="budget-meta"><span>' + Math.round(pct) + '% concluído</span><span>até ' + dateBR(goal.dueDate) + '</span></div></div>'; }).join('') : '<div class="empty">Cadastre uma meta para acompanhar seu progresso.</div>') + '</div></section></div><section class="card section"><div class="section-heading"><div><h2>Contas a pagar e receber</h2><p>Agenda financeira do mês</p></div><button class="button small ghost" data-action="open-bill">＋ Nova conta</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Descrição</th><th>Vencimento</th><th>Categoria</th><th>Valor</th><th>Status</th><th></th></tr></thead><tbody>' + (bills.length ? bills.map(function (bill) { var cat = categoryById(bill.categoryId); return '<tr><td><strong>' + esc(bill.description) + '</strong></td><td>' + dateBR(bill.dueDate) + '</td><td>' + esc(cat ? cat.name : 'Sem categoria') + '</td><td class="' + (bill.status === 'paid' ? 'positive' : 'negative') + '">' + money(bill.amount) + '</td><td>' + (bill.status === 'paid' ? '<span class="status" style="color:var(--green)">paga</span>' : '<span class="status">aberta</span>') + '</td><td><button class="button small ghost" data-action="toggle-bill" data-id="' + bill.id + '">' + (bill.status === 'paid' ? 'Reabrir' : 'Marcar paga') + '</button></td></tr>'; }).join('') : '<tr><td colspan="6" class="empty">Nenhuma conta cadastrada para este mês.</td></tr>') + '</tbody></table></div></section><section class="card section"><div class="section-heading"><div><h2>Recorrências</h2><p>Despesas que se repetem e merecem acompanhamento</p></div><button class="button small ghost" data-view="transactions">Gerenciar →</button></div><div class="transaction-list">' + (recurring.length ? recurring.map(function (item) { return transactionMarkup(item, false); }).join('') : '<div class="empty">Nenhuma recorrência cadastrada.</div>') + '</div></section></div>';
  }
  function renderAccounts() {
    return renderTopbar('Contas e cartões', 'Separe saldos, limites e faturas para enxergar o todo') + '<div class="content"><div class="grid two-column"><section class="card section"><div class="section-heading"><div><h2>Contas</h2><p>' + state.accounts.length + ' contas cadastradas</p></div><button class="button primary small" data-action="open-account">＋ Nova conta</button></div><div class="account-list">' + state.accounts.map(function (account) { return '<div class="account-row"><div class="account-main"><span class="account-badge" style="background:' + esc(account.color || '#7c3aed') + '">' + esc(account.name.slice(0, 1).toUpperCase()) + '</span><span><strong>' + esc(account.name) + '</strong><span>' + esc(account.institution || account.type) + '</span></span></div><div class="row-value"><strong>' + money(accountBalance(account.id)) + '</strong><span>' + esc(account.type || 'conta') + '</span></div></div>'; }).join('') + '</div></section><section class="card section"><div class="section-heading"><div><h2>Cartões de crédito</h2><p>Controle de limite e fatura</p></div><button class="button primary small" data-action="open-card">＋ Novo cartão</button></div><div class="card-list">' + state.cards.map(function (card) { var bill = cardBill(card.id, state.selectedMonth); var pct = card.limit ? clamp(bill / card.limit * 100, 0, 100) : 0; return '<div class="card-row" style="display:block"><div class="card-main"><span class="card-badge" style="background:' + esc(card.color || '#9a5cf2') + '">▣</span><span><strong>' + esc(card.name) + '</strong><span>' + esc(card.brand || 'Cartão') + ' · fecha dia ' + esc(card.closingDay || '-') + ' · vence dia ' + esc(card.dueDay || '-') + '</span></span><span class="row-value" style="margin-left:auto"><strong>' + money(bill) + '</strong><span>fatura atual</span></span></div><div class="progress ' + (pct > 80 ? 'red' : '') + '"><span style="width:' + pct + '%"></span></div><div class="budget-meta"><span>Limite: ' + money(card.limit) + '</span><button class="button small secondary" data-action="pay-card" data-id="' + card.id + '">Pagar fatura</button></div></div>'; }).join('') + '</div></section></div><section class="card section"><div class="section-heading"><div><h2>Resumo de faturas</h2><p>Movimentos de cartões em ' + esc(monthLabel(state.selectedMonth)) + '</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Cartão</th><th>Fechamento</th><th>Vencimento</th><th>Fatura</th><th>Disponível</th></tr></thead><tbody>' + state.cards.map(function (card) { var bill = cardBill(card.id, state.selectedMonth); return '<tr><td><strong>' + esc(card.name) + '</strong></td><td>dia ' + esc(card.closingDay) + '</td><td>dia ' + esc(card.dueDay) + '</td><td class="negative">' + money(bill) + '</td><td class="positive">' + money(Math.max(0, card.limit - bill)) + '</td></tr>'; }).join('') + '</tbody></table></div></section></div>';
  }
  function renderReports() {
    var data = summary(state.selectedMonth);
    var categories = categorySummary(state.selectedMonth);
    var max = categories.length ? categories[0].amount : 1;
    var previousMonth = addMonths(state.selectedMonth + '-01', -1).slice(0, 7);
    var previous = summary(previousMonth);
    return renderTopbar('Relatórios', 'Entenda seus hábitos e tome decisões melhores') + '<div class="content"><div class="grid summary-grid"><div class="card summary-card"><span class="label">Média diária de despesas</span><div class="value negative">' + money(data.expense / Math.max(new Date().getDate(), 1)) + '</div><div class="helper">estimativa no mês atual</div></div><div class="card summary-card"><span class="label">Comparação com mês anterior</span><div class="value ' + (data.expense <= previous.expense ? 'positive' : 'negative') + '">' + (previous.expense ? Math.round((data.expense / previous.expense - 1) * 100) + '%' : '—') + '</div><div class="helper">despesas versus ' + monthLabel(previousMonth) + '</div></div><div class="card summary-card"><span class="label">Maior categoria</span><div class="value accent">' + esc(categories[0] ? categories[0].category.name : '—') + '</div><div class="helper">' + (categories[0] ? money(categories[0].amount) : 'sem dados') + '</div></div><div class="card summary-card"><span class="label">Taxa de sobra</span><div class="value ' + (data.income && data.monthly >= 0 ? 'positive' : 'negative') + '">' + (data.income ? Math.round(data.monthly / data.income * 100) + '%' : '—') + '</div><div class="helper">receitas que não foram consumidas</div></div></div><div class="grid two-column"><section class="card section"><div class="section-heading"><div><h2>Despesas por categoria</h2><p>Ranking em ' + esc(monthLabel(state.selectedMonth)) + '</p></div><button class="button small secondary" data-action="export-csv">Exportar CSV</button></div><div class="report-bars">' + (categories.length ? categories.map(function (row) { return '<div class="report-bar-row"><label>' + esc(row.category.name) + '</label><div class="report-bar"><span style="width:' + clamp(row.amount / max * 100, 0, 100) + '%"></span></div><strong>' + money(row.amount) + '</strong></div>'; }).join('') : '<div class="empty">Registre despesas para gerar o relatório.</div>') + '</div></section><section class="card section"><div class="section-heading"><div><h2>Fluxo do mês</h2><p>Entradas e saídas consolidadas</p></div></div><div class="budget-list"><div class="budget-row"><div class="budget-row-top"><strong>Receitas</strong><span class="positive">' + money(data.income) + '</span></div><div class="progress teal"><span style="width:100%"></span></div></div><div class="budget-row"><div class="budget-row-top"><strong>Despesas</strong><span class="negative">' + money(data.expense) + '</span></div><div class="progress red"><span style="width:' + (data.income ? clamp(data.expense / data.income * 100, 0, 100) : 0) + '%"></span></div></div><div class="budget-row"><div class="budget-row-top"><strong>Planejado</strong><span class="accent">' + money(data.planned) + '</span></div><div class="progress"><span style="width:' + (data.income ? clamp(data.planned / data.income * 100, 0, 100) : 0) + '%"></span></div></div></div></section></div><section class="card section"><div class="section-heading"><div><h2>Patrimônio e metas</h2><p>Uma visão além do saldo do mês</p></div><button class="button small ghost" data-action="open-goal">＋ Nova meta</button></div><div class="grid three-column">' + (state.goals.length ? state.goals.map(function (goal) { return '<div class="budget-row"><div class="budget-row-top"><strong>' + esc(goal.name) + '</strong><span>' + money(goal.target) + '</span></div><div class="progress teal"><span style="width:' + clamp(goal.saved / goal.target * 100, 0, 100) + '%"></span></div><div class="budget-meta"><span>' + money(goal.saved) + ' acumulados</span><span>' + dateBR(goal.dueDate) + '</span></div></div>'; }).join('') : '<div class="empty">Nenhuma meta cadastrada.</div>') + '</div></section></div>';
  }
  function renderOpenFinance() {
    var providers = [{ name: 'Pluggy', text: 'Conectores de Open Finance e dados padronizados de contas, cartões e transações.' }, { name: 'Belvo', text: 'Integração para compartilhar dados financeiros com consentimento do usuário.' }, { name: 'Celcoin', text: 'Sandbox e infraestrutura para avaliar uma conexão regulada no futuro.' }];
    return renderTopbar('Open Finance', 'Conecte seus bancos quando houver uma integração segura disponível') + '<div class="content"><section class="card hero"><div><h2>Central de conexões</h2><p>A conexão automática exige backend, consentimento, certificados e um provedor ou parceria regulada. Esta tela organiza o futuro da integração sem guardar senha bancária no navegador.</p></div><span class="hero-icon">⌁</span></section><div class="callout warning section">O compartilhamento de dados é autorizado por você no ambiente do banco. O Todo Controle nunca deve receber sua senha. Para o MVP, use importação OFX/CSV e lançamento manual.</div><div class="grid provider-grid section">' + providers.map(function (provider) { var connection = state.connections.find(function (item) { return item.provider === provider.name; }); return '<section class="card provider-card"><h3>' + provider.name + '</h3><p>' + provider.text + '</p><span class="status">' + (connection ? 'configuração pendente' : 'não conectado') + '</span><div style="margin-top:15px"><button class="button small secondary" data-action="open-connection" data-provider="' + provider.name + '">Preparar conexão</button></div></section>'; }).join('') + '</div><section class="card section"><div class="section-heading"><div><h2>Importação segura</h2><p>Traga seu histórico sem compartilhar credenciais</p></div><button class="button primary" data-action="open-import">Importar OFX/CSV</button></div><div class="callout">Os arquivos são processados localmente neste navegador e transformados em lançamentos revisáveis.</div></section><section class="card section"><div class="section-heading"><div><h2>Conexões registradas</h2><p>As conexões futuras terão status, última sincronização e erros visíveis.</p></div></div>' + (state.connections.length ? state.connections.map(function (item) { return '<div class="account-row"><div class="account-main"><span class="account-badge" style="background:var(--purple)">⌁</span><span><strong>' + esc(item.provider) + '</strong><span>' + esc(item.institution || 'Instituição não definida') + '</span></span></div><span class="status">aguardando backend</span></div>'; }).join('') : '<div class="empty">Nenhuma conexão foi iniciada.</div>') + '</section></div>';
  }
  function renderMore() {
    return renderTopbar('Mais', 'Configurações, dados e ferramentas para manter o controle') + '<div class="content"><div class="grid two-column"><section class="card section"><div class="section-heading"><div><h2>Dados e backup</h2><p>Seus dados pertencem a você</p></div></div><div class="grid"><button class="button secondary full" data-action="export-json">↓ Exportar backup JSON</button><button class="button full" data-action="open-import">Importar OFX/CSV</button><button class="button ghost full" data-action="reset-data">Restaurar dados de exemplo</button></div><div class="callout" style="margin-top:16px">O app salva os dados neste dispositivo usando armazenamento local. Exporte um backup antes de trocar de navegador ou computador.</div></section><section class="card section"><div class="section-heading"><div><h2>Preferências</h2><p>Recursos previstos para as próximas versões</p></div></div><div class="budget-list"><div class="budget-row"><div class="budget-row-top"><strong>Notificações de vencimento</strong><span class="status">em preparação</span></div><div class="budget-meta"><span>Alertas de contas e cartões</span></div></div><div class="budget-row"><div class="budget-row-top"><strong>WhatsApp e Telegram</strong><span class="status">futuro</span></div><div class="budget-meta"><span>Dependerá de uma API segura no servidor</span></div></div><div class="budget-row"><div class="budget-row-top"><strong>Privacidade</strong><span class="positive">local-first</span></div><div class="budget-meta"><span>Nenhuma senha bancária é solicitada</span></div></div></div></section></div><section class="card section"><div class="section-heading"><div><h2>Sobre o Todo Controle</h2><p>Uma ferramenta independente inspirada em boas práticas de organização financeira.</p></div><a class="button small ghost" href="https://github.com/actualbudget/actual" target="_blank" rel="noreferrer">Ver Actual Budget →</a></div><div class="callout">Esta aplicação não é uma cópia do Mobills, do Fina ou do Actual Budget. Ela combina ideias de organização financeira em uma experiência própria.</div></section></div>';
  }
  function renderView() {
    if (activeView === 'transactions') return renderTransactions();
    if (activeView === 'planning') return renderPlanning();
    if (activeView === 'accounts') return renderAccounts();
    if (activeView === 'reports') return renderReports();
    if (activeView === 'openfinance') return renderOpenFinance();
    if (activeView === 'more') return renderMore();
    return renderDashboard();
  }
  function optionCategories(value) { return state.categories.map(function (category) { return '<option value="' + category.id + '"' + selected(category.id === value) + '>' + (category.parentId ? '↳ ' : '') + esc(category.name) + '</option>'; }).join(''); }
  function optionAccounts(value) { return state.accounts.map(function (account) { return '<option value="' + account.id + '"' + selected(account.id === value) + '>' + esc(account.name) + '</option>'; }).join(''); }
  function optionCards(value) { return state.cards.map(function (card) { return '<option value="' + card.id + '"' + selected(card.id === value) + '>' + esc(card.name) + '</option>'; }).join(''); }
  function modalShell(title, subtitle, content, footer) { return '<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal-content><div class="modal-header"><div><h2 id="modal-title">' + esc(title) + '</h2><p>' + esc(subtitle || '') + '</p></div><button class="icon-button" data-action="close-modal" aria-label="Fechar">×</button></div>' + content + (footer ? '<div class="modal-footer">' + footer + '</div>' : '') + '</div></div>'; }
  function renderTransactionModal() {
    var existing = modal.id ? state.transactions.find(function (item) { return item.id === modal.id; }) : null;
    var item = existing || { type: modal.defaultType || 'expense', amount: '', description: '', date: todayISO(), accountId: state.accounts[0] && state.accounts[0].id, cardId: state.cards[0] && state.cards[0].id, categoryId: state.categories[0] && state.categories[0].id, status: 'paid', installments: 1, recurring: false, tags: [], note: '' };
    var type = modal.typeValue || item.type;
    var transfer = type === 'transfer';
    var cardExpense = type === 'card-expense' || Boolean(item.cardId);
    return modalShell(existing ? 'Editar lançamento' : 'Novo lançamento', 'Preencha os detalhes e confirme antes de salvar', '<form id="transaction-form" data-id="' + esc(existing ? existing.id : '') + '"><div class="form-grid"><div class="field"><label for="tx-type">Tipo</label><select id="tx-type" name="type"><option value="expense"' + selected(type === 'expense') + '>Despesa</option><option value="income"' + selected(type === 'income') + '>Receita</option><option value="transfer"' + selected(transfer) + '>Transferência</option><option value="card-expense"' + selected(cardExpense) + '>Despesa no cartão</option></select></div><div class="field"><label for="tx-amount">Valor</label><input id="tx-amount" name="amount" inputmode="decimal" placeholder="0,00" value="' + esc(item.amount || '') + '" required /></div><div class="field wide"><label for="tx-description">Descrição</label><input id="tx-description" name="description" placeholder="Ex.: Mercado, salário ou aluguel" value="' + esc(item.description || '') + '" required /></div><div class="field"><label for="tx-date">Data</label><input id="tx-date" name="date" type="date" value="' + esc(item.date || todayISO()) + '" required /></div>' + (transfer ? '<div class="field"><label for="tx-from">Sai de</label><select id="tx-from" name="fromAccountId">' + optionAccounts(item.fromAccountId || item.accountId) + '</select></div><div class="field"><label for="tx-to">Vai para</label><select id="tx-to" name="toAccountId">' + optionAccounts(item.toAccountId) + '</select></div>' : cardExpense ? '<div class="field"><label for="tx-card">Cartão</label><select id="tx-card" name="cardId">' + optionCards(item.cardId) + '</select></div><div class="field"><label for="tx-category">Categoria</label><select id="tx-category" name="categoryId">' + optionCategories(item.categoryId) + '</select></div>' : '<div class="field"><label for="tx-account">Conta</label><select id="tx-account" name="accountId">' + optionAccounts(item.accountId) + '</select></div><div class="field"><label for="tx-category">Categoria</label><select id="tx-category" name="categoryId">' + optionCategories(item.categoryId) + '</select></div>') + (!transfer ? '<div class="field"><label for="tx-status">Status</label><select id="tx-status" name="status"><option value="paid"' + selected(item.status !== 'pending') + '>Confirmado</option><option value="pending"' + selected(item.status === 'pending') + '>Pendente</option></select></div><div class="field"><label for="tx-installments">Parcelas</label><input id="tx-installments" name="installments" type="number" min="1" max="60" value="' + esc(item.installments || 1) + '" /><small>Para cartão, gera as parcelas nos meses seguintes.</small></div><div class="field wide"><label for="tx-tags">Tags</label><input id="tx-tags" name="tags" placeholder="ex.: fixa, trabalho, família" value="' + esc((item.tags || []).join(', ')) + '" /></div><div class="field wide"><label for="tx-note">Observação</label><textarea id="tx-note" name="note" placeholder="Anote algo importante sobre este lançamento">' + esc(item.note || '') + '</textarea></div><label class="check-row wide"><input type="checkbox" name="recurring"' + checked(item.recurring) + ' /> Marcar como recorrente</label>' : '') + '</div></form>', '<button class="button ghost" data-action="close-modal">Cancelar</button><button class="button primary" form="transaction-form">Salvar lançamento</button>');
  }
  function renderAccountModal() { return modalShell('Nova conta', 'Adicione uma conta, carteira ou investimento manual', '<form id="account-form"><div class="form-grid"><div class="field"><label for="account-name">Nome</label><input id="account-name" name="name" placeholder="Ex.: Banco principal" required /></div><div class="field"><label for="account-institution">Instituição</label><input id="account-institution" name="institution" placeholder="Ex.: Banco do Brasil" /></div><div class="field"><label for="account-type">Tipo</label><select id="account-type" name="type"><option>Conta corrente</option><option>Conta poupança</option><option>Carteira</option><option>Investimento</option></select></div><div class="field"><label for="account-balance">Saldo inicial</label><input id="account-balance" name="openingBalance" inputmode="decimal" placeholder="0,00" /></div><div class="field"><label for="account-color">Cor</label><input id="account-color" name="color" type="color" value="#7c3aed" /></div></div></form>', '<button class="button ghost" data-action="close-modal">Cancelar</button><button class="button primary" form="account-form">Criar conta</button>'); }
  function renderCardModal() { return modalShell('Novo cartão', 'Cadastre limite, fechamento e vencimento da fatura', '<form id="card-form"><div class="form-grid"><div class="field"><label for="card-name">Nome do cartão</label><input id="card-name" name="name" placeholder="Ex.: Nubank" required /></div><div class="field"><label for="card-brand">Bandeira</label><input id="card-brand" name="brand" placeholder="Ex.: Visa" /></div><div class="field"><label for="card-limit">Limite</label><input id="card-limit" name="limit" inputmode="decimal" placeholder="0,00" required /></div><div class="field"><label for="card-closing">Dia de fechamento</label><input id="card-closing" name="closingDay" type="number" min="1" max="31" value="25" /></div><div class="field"><label for="card-due">Dia de vencimento</label><input id="card-due" name="dueDay" type="number" min="1" max="31" value="7" /></div><div class="field"><label for="card-color">Cor</label><input id="card-color" name="color" type="color" value="#9a5cf2" /></div></div></form>', '<button class="button ghost" data-action="close-modal">Cancelar</button><button class="button primary" form="card-form">Criar cartão</button>'); }
  function renderBudgetModal() { return modalShell('Novo orçamento', 'Defina um limite mensal para uma categoria', '<form id="budget-form"><div class="form-grid"><div class="field"><label for="budget-category">Categoria</label><select id="budget-category" name="categoryId">' + optionCategories('') + '</select></div><div class="field"><label for="budget-amount">Limite mensal</label><input id="budget-amount" name="amount" inputmode="decimal" placeholder="0,00" required /></div><div class="field wide"><small>O orçamento será aplicado a ' + esc(monthLabel(state.selectedMonth)) + '.</small></div></div></form>', '<button class="button ghost" data-action="close-modal">Cancelar</button><button class="button primary" form="budget-form">Salvar orçamento</button>'); }
  function renderGoalModal() { return modalShell('Nova meta', 'Acompanhe um objetivo financeiro com clareza', '<form id="goal-form"><div class="form-grid"><div class="field wide"><label for="goal-name">Nome da meta</label><input id="goal-name" name="name" placeholder="Ex.: Viagem ou reserva" required /></div><div class="field"><label for="goal-target">Valor alvo</label><input id="goal-target" name="target" inputmode="decimal" placeholder="0,00" required /></div><div class="field"><label for="goal-saved">Já guardado</label><input id="goal-saved" name="saved" inputmode="decimal" value="0" /></div><div class="field"><label for="goal-date">Prazo</label><input id="goal-date" name="dueDate" type="date" value="' + addMonths(todayISO(), 6) + '" /></div><div class="field"><label for="goal-color">Cor</label><input id="goal-color" name="color" type="color" value="#35c7b4" /></div></div></form>', '<button class="button ghost" data-action="close-modal">Cancelar</button><button class="button primary" form="goal-form">Criar meta</button>'); }
  function renderBillModal() { return modalShell('Nova conta a pagar', 'Inclua um vencimento no seu planejamento', '<form id="bill-form"><div class="form-grid"><div class="field wide"><label for="bill-description">Descrição</label><input id="bill-description" name="description" placeholder="Ex.: Escola, condomínio ou assinatura" required /></div><div class="field"><label for="bill-amount">Valor</label><input id="bill-amount" name="amount" inputmode="decimal" placeholder="0,00" required /></div><div class="field"><label for="bill-date">Vencimento</label><input id="bill-date" name="dueDate" type="date" value="' + todayISO() + '" required /></div><div class="field"><label for="bill-category">Categoria</label><select id="bill-category" name="categoryId">' + optionCategories('') + '</select></div><label class="check-row"><input type="checkbox" name="recurring" /> Recorrente</label></div></form>', '<button class="button ghost" data-action="close-modal">Cancelar</button><button class="button primary" form="bill-form">Adicionar conta</button>'); }
  function renderImportModal() { return modalShell('Importar OFX ou CSV', 'O arquivo é processado localmente no seu navegador', '<form id="import-form"><div class="field"><label for="import-file">Arquivo</label><input id="import-file" name="file" type="file" accept=".ofx,.qfx,.csv,text/csv,application/x-ofx" required /><small>O formato pode conter data, descrição e valor. Revise o resultado antes de importar.</small></div>' + (importRows.length ? '<div class="import-preview"><table class="data-table"><thead><tr><th>Data</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>' + importRows.slice(0, 12).map(function (row) { return '<tr><td>' + dateBR(row.date) + '</td><td>' + esc(row.description) + '</td><td class="' + (row.type === 'income' ? 'positive' : 'negative') + '">' + money(row.amount) + '</td></tr>'; }).join('') + '</tbody></table></div><div class="field" style="margin-top:14px"><label for="import-account">Conta de destino</label><select id="import-account" name="accountId">' + optionAccounts(state.accounts[0] && state.accounts[0].id) + '</select></div>' : '') + '</form>', '<button class="button ghost" data-action="close-modal">Cancelar</button><button class="button primary" form="import-form">' + (importRows.length ? 'Importar ' + importRows.length + ' lançamentos' : 'Ler arquivo') + '</button>'); }
  function renderConnectionModal() { return modalShell('Preparar conexão', 'Nenhuma senha bancária será solicitada', '<form id="connection-form"><div class="callout">O provedor será integrado somente quando existir um backend seguro e credenciais protegidas. Este registro serve para organizar a próxima etapa.</div><div class="form-grid" style="margin-top:14px"><div class="field"><label for="connection-provider">Provedor</label><input id="connection-provider" name="provider" value="' + esc(modal.provider || '') + '" readonly /></div><div class="field"><label for="connection-institution">Instituição desejada</label><input id="connection-institution" name="institution" placeholder="Ex.: Nubank, Itaú, BB" required /></div></div></form>', '<button class="button ghost" data-action="close-modal">Cancelar</button><button class="button primary" form="connection-form">Salvar preparação</button>'); }
  function renderCardPaymentModal() { var card = cardById(modal.cardId); return modalShell('Pagar fatura', card ? card.name + ' · ' + monthLabel(state.selectedMonth) : '', '<form id="card-payment-form"><div class="form-grid"><div class="field"><label for="payment-amount">Valor da fatura</label><input id="payment-amount" name="amount" inputmode="decimal" value="' + esc(card ? cardBill(card.id, state.selectedMonth).toFixed(2).replace('.', ',') : '') + '" required /></div><div class="field"><label for="payment-account">Conta de origem</label><select id="payment-account" name="accountId">' + optionAccounts(state.accounts[0] && state.accounts[0].id) + '</select></div></div><div class="callout" style="margin-top:14px">O pagamento reduz o saldo da conta e a fatura do cartão, sem contar novamente como despesa.</div></form>', '<button class="button ghost" data-action="close-modal">Cancelar</button><button class="button primary" form="card-payment-form">Registrar pagamento</button>'); }
  function renderModal() {
    if (!modal) return '';
    if (modal.type === 'transaction') return renderTransactionModal();
    if (modal.type === 'account') return renderAccountModal();
    if (modal.type === 'card') return renderCardModal();
    if (modal.type === 'budget') return renderBudgetModal();
    if (modal.type === 'goal') return renderGoalModal();
    if (modal.type === 'bill') return renderBillModal();
    if (modal.type === 'import') return renderImportModal();
    if (modal.type === 'connection') return renderConnectionModal();
    if (modal.type === 'card-payment') return renderCardPaymentModal();
    return '';
  }
  function render() {
    var mobileMenu = '<button class="icon-button menu-button" data-action="toggle-sidebar" aria-label="Abrir menu">☰</button>';
    document.getElementById('app').innerHTML = mobileMenu + '<div class="app-shell">' + renderSidebar() + '<main class="main">' + renderView() + '</main></div>' + (activeView === 'dashboard' || activeView === 'transactions' ? '<button class="fab" data-action="quick-add" aria-label="Adicionar lançamento">＋</button>' : '') + renderMobileNav() + renderModal() + (quickMenu ? modalShell('Adicionar movimento', 'Escolha o tipo de lançamento', '<div class="quick-actions"><button class="quick-action" data-action="open-transaction" data-type="income"><span class="qa-icon positive">↑</span><span><b>Receita</b><span>Salário, venda ou entrada</span></span></button><button class="quick-action" data-action="open-transaction" data-type="expense"><span class="qa-icon negative">↓</span><span><b>Despesa</b><span>Compra ou pagamento</span></span></button><button class="quick-action" data-action="open-transaction" data-type="card-expense"><span class="qa-icon">▣</span><span><b>Despesa no cartão</b><span>Fatura e parcelamento</span></span></button><button class="quick-action" data-action="open-transaction" data-type="transfer"><span class="qa-icon">↔</span><span><b>Transferência</b><span>Entre suas contas</span></span></button></div>', '<button class="button ghost" data-action="close-quick">Cancelar</button>') : '');
  }

  function showToast(message) { var element = document.getElementById('toast'); element.textContent = message; element.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { element.classList.remove('show'); }, 2800); }
  function closeAll() { modal = null; quickMenu = false; importRows = []; render(); }
  function openTransaction(type, id) { modal = { type: 'transaction', defaultType: type || 'expense', typeValue: type || 'expense', id: id || null, cardMode: type === 'card-expense' }; render(); }
  function download(name, content, mime) { var link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type: mime || 'application/octet-stream' })); link.download = name; link.click(); setTimeout(function () { URL.revokeObjectURL(link.href); }, 800); }
  function exportJSON() { download('todo-controle-backup.json', JSON.stringify(state, null, 2), 'application/json'); showToast('Backup exportado.'); }
  function exportCSV() {
    var rows = [['data', 'descricao', 'tipo', 'categoria', 'conta_cartao', 'valor', 'status']];
    monthTransactions(state.selectedMonth).forEach(function (item) { var owner = item.cardId ? cardById(item.cardId) : accountById(item.accountId); rows.push([item.date, item.description, item.type, displayCategory(item), owner ? owner.name : '', String(item.amount).replace('.', ','), item.status]); });
    download('todo-controle-' + state.selectedMonth + '.csv', rows.map(function (row) { return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(';'); }).join('\n'), 'text/csv;charset=utf-8');
    showToast('Relatório CSV exportado.');
  }
  function parseOFX(text) {
    var rows = [];
    text.split(/<STMTTRN>/i).slice(1).forEach(function (block) {
      var amount = parseMoney((block.match(/<TRNAMT>([^<\r\n]+)/i) || [])[1] || '0');
      var date = ((block.match(/<DTPOSTED>(\d{4})(\d{2})(\d{2})/i) || []).slice(1)).join('-');
      var description = (block.match(/<(?:NAME|MEMO)>([^<\r\n]+)/i) || [])[1] || 'Lançamento OFX';
      if (date && amount) rows.push({ date: date, description: description.trim(), amount: Math.abs(amount), type: amount >= 0 ? 'income' : 'expense' });
    });
    return rows;
  }
  function parseCSV(text) {
    var lines = text.split(/\r?\n/).filter(function (line) { return line.trim(); });
    if (!lines.length) return [];
    var delimiter = lines[0].indexOf(';') >= 0 ? ';' : ',';
    var header = lines[0].split(delimiter).map(function (value) { return value.replace(/^"|"$/g, '').trim().toLowerCase(); });
    var dateIndex = header.findIndex(function (value) { return /data|date/.test(value); });
    var descriptionIndex = header.findIndex(function (value) { return /descri|histor|memo|name/.test(value); });
    var amountIndex = header.findIndex(function (value) { return /valor|amount|value/.test(value); });
    if (dateIndex < 0 || amountIndex < 0) { dateIndex = 0; descriptionIndex = 1; amountIndex = 2; }
    return lines.slice(1).map(function (line) {
      var values = line.split(delimiter).map(function (value) { return value.replace(/^"|"$/g, '').trim(); });
      var rawDate = values[dateIndex] || '';
      var date = rawDate.indexOf('/') >= 0 ? rawDate.split('/').reverse().join('-') : rawDate;
      var amount = parseMoney(values[amountIndex] || '0');
      var negative = String(values[amountIndex] || '').indexOf('-') >= 0;
      return { date: date, description: values[descriptionIndex] || 'Lançamento CSV', amount: Math.abs(amount), type: negative ? 'expense' : 'income' };
    }).filter(function (row) { return row.date && row.amount; });
  }
  function readImportFile(file) { var reader = new FileReader(); reader.onload = function () { var text = String(reader.result || ''); importRows = /\.ofx$|\.qfx$/i.test(file.name) || text.indexOf('<OFX>') >= 0 ? parseOFX(text) : parseCSV(text); render(); if (!importRows.length) showToast('Não consegui identificar lançamentos nesse arquivo.'); }; reader.readAsText(file); }

  function filterOptions(items, value, emptyLabel) {
    return '<option value="all">' + esc(emptyLabel) + '</option>' + items.map(function (item) { return '<option value="' + esc(item.id) + '"' + selected(item.id === value) + '>' + esc(item.name) + '</option>'; }).join('');
  }
  function billingMonthOptions(value) {
    var target = value || state.selectedMonth;
    var months = [];
    for (var index = -3; index <= 6; index += 1) months.push(addMonths(target + '-01', index).slice(0, 7));
    if (months.indexOf(target) < 0) months.push(target);
    return months.map(function (month) { return '<option value="' + month + '"' + selected(month === target) + '>' + monthLabel(month) + '</option>'; }).join('');
  }
  function dateAfter(iso) { return addMonths(iso.slice(0, 7) + '-01', 0).slice(0, 7) === iso.slice(0, 7) ? (function () { var date = new Date(iso + 'T12:00:00'); date.setDate(date.getDate() + 1); return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); })() : iso; }
  function summaryFromTransactions(transactions) {
    return {
      income: transactions.filter(function (item) { return item.type === 'income'; }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0),
      expense: transactions.filter(function (item) { return item.type === 'expense'; }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0),
      pending: transactions.filter(function (item) { return item.status === 'pending'; }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0)
    };
  }
  function reportTransactions() {
    var start = reportStartDate || state.selectedMonth + '-01';
    var end = reportEndDate ? dateAfter(reportEndDate) : addMonths(state.selectedMonth + '-01', 1);
    return state.transactions.filter(function (item) {
      var date = String(item.date || '');
      var cardMatch = reportCardFilter === 'all' || item.cardId === reportCardFilter;
      var categoryMatch = reportCategoryFilter === 'all' || item.categoryId === reportCategoryFilter || categoryById(item.categoryId) && categoryById(item.categoryId).parentId === reportCategoryFilter;
      return date >= start && date < end && cardMatch && categoryMatch;
    });
  }
  function categorySummaryFromTransactions(transactions) {
    return state.categories.filter(function (category) { return !category.parentId; }).map(function (category) {
      return { category: category, amount: transactions.filter(function (item) { var child = categoryById(item.categoryId); return item.type === 'expense' && (item.categoryId === category.id || child && child.parentId === category.id); }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0) };
    }).filter(function (row) { return row.amount > 0; }).sort(function (a, b) { return b.amount - a.amount; });
  }
  function parseDelimitedLine(line, delimiter) {
    var values = [], value = '', quoted = false;
    for (var index = 0; index < line.length; index += 1) {
      var character = line[index];
      if (character === '"' && line[index + 1] === '"') { value += '"'; index += 1; }
      else if (character === '"') quoted = !quoted;
      else if (character === delimiter && !quoted) { values.push(value.trim()); value = ''; }
      else value += character;
    }
    values.push(value.trim());
    return values;
  }
  function csvDate(value) {
    var raw = String(value || '').trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw.split('/').reverse().join('-');
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(raw)) return raw.replace(/\//g, '-');
    return raw;
  }
  function csvMonth(value) {
    var raw = String(value || '').trim();
    if (/^\d{2}\/\d{4}$/.test(raw)) return raw.split('/').reverse().join('-');
    if (/^\d{4}\/\d{2}$/.test(raw)) return raw.replace('/', '-');
    return /^\d{4}-\d{2}/.test(raw) ? raw.slice(0, 7) : '';
  }

  function renderTransactions() {
    var transactions = monthTransactions(state.selectedMonth).filter(function (item) {
      var owner = item.cardId ? cardById(item.cardId) : accountById(item.accountId);
      var text = (item.description + ' ' + displayCategory(item) + ' ' + (owner ? owner.name : '')).toLowerCase();
      var typeMatch = activeFilter === 'all' || activeFilter === item.type || activeFilter === 'pending' && item.status === 'pending';
      var cardMatch = activeCardFilter === 'all' || item.cardId === activeCardFilter;
      var categoryMatch = activeCategoryFilter === 'all' || item.categoryId === activeCategoryFilter || categoryById(item.categoryId) && categoryById(item.categoryId).parentId === activeCategoryFilter;
      var accountMatch = activeAccountFilter === 'all' || item.accountId === activeAccountFilter;
      return typeMatch && cardMatch && categoryMatch && accountMatch && text.indexOf(searchTerm.toLowerCase()) >= 0;
    }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    var totals = summaryFromTransactions(transactions);
    return renderTopbar('Transações', 'Registre e revise tudo o que acontece com seu dinheiro') + '<div class="content"><section class="card section"><div class="section-heading"><div><h2>Seus lançamentos</h2><p>' + transactions.length + ' resultados em ' + esc(monthLabel(state.selectedMonth)) + '</p></div><button class="button primary" data-action="quick-add">＋ Novo lançamento</button></div><div class="filter-grid"><div class="field filter-field"><label for="transaction-search">Buscar</label><input class="search" id="transaction-search" value="' + esc(searchTerm) + '" placeholder="Descrição ou categoria" aria-label="Buscar lançamentos" /></div><div class="field filter-field"><label for="transaction-card-filter">Cartão</label><select id="transaction-card-filter">' + filterOptions(state.cards, activeCardFilter, 'Todos os cartões') + '</select></div><div class="field filter-field"><label for="transaction-category-filter">Categoria</label><select id="transaction-category-filter">' + filterOptions(state.categories, activeCategoryFilter, 'Todas as categorias') + '</select></div><div class="field filter-field"><label for="transaction-account-filter">Conta</label><select id="transaction-account-filter">' + filterOptions(state.accounts, activeAccountFilter, 'Todas as contas') + '</select></div></div><div class="filter-bar"><button class="filter-chip' + (activeFilter === 'all' ? ' active' : '') + '" data-filter="all">Todos</button><button class="filter-chip' + (activeFilter === 'expense' ? ' active' : '') + '" data-filter="expense">Despesas</button><button class="filter-chip' + (activeFilter === 'income' ? ' active' : '') + '" data-filter="income">Receitas</button><button class="filter-chip' + (activeFilter === 'pending' ? ' active' : '') + '" data-filter="pending">Pendentes</button></div><div class="selection-summary"><div class="selection-total"><span>Receitas selecionadas</span><strong class="positive">' + money(totals.income) + '</strong></div><div class="selection-total"><span>Despesas selecionadas</span><strong class="negative">' + money(totals.expense) + '</strong></div></div><div class="transaction-list">' + (transactions.length ? transactions.map(function (item) { return transactionMarkup(item, true); }).join('') : '<div class="empty">Nenhum lançamento encontrado.</div>') + '</div></section></div>';
  }

  function renderReports() {
    var transactions = reportTransactions();
    var data = summaryFromTransactions(transactions);
    var categories = categorySummaryFromTransactions(transactions);
    var max = categories.length ? categories[0].amount : 1;
    var previousMonth = addMonths(state.selectedMonth + '-01', -1).slice(0, 7);
    var previous = summary(previousMonth);
    var dateSummary = reportStartDate || reportEndDate ? dateBR(reportStartDate || state.selectedMonth + '-01') + ' até ' + dateBR(reportEndDate || todayISO()) : monthLabel(state.selectedMonth);
    return renderTopbar('Relatórios', 'Entenda seus hábitos e tome decisões melhores') + '<div class="content"><section class="card section"><div class="section-heading"><div><h2>Filtros do relatório</h2><p>Combine período, cartão e categoria para uma leitura precisa.</p></div><button class="button small ghost" data-action="reset-report-filters">Limpar filtros</button></div><div class="filter-grid report-filter-grid"><div class="field filter-field"><label for="report-start">Data inicial</label><input id="report-start" type="date" value="' + esc(reportStartDate) + '" /></div><div class="field filter-field"><label for="report-end">Data final</label><input id="report-end" type="date" value="' + esc(reportEndDate) + '" /></div><div class="field filter-field"><label for="report-card-filter">Cartão</label><select id="report-card-filter">' + filterOptions(state.cards, reportCardFilter, 'Todos os cartões') + '</select></div><div class="field filter-field"><label for="report-category-filter">Categoria</label><select id="report-category-filter">' + filterOptions(state.categories, reportCategoryFilter, 'Todas as categorias') + '</select></div></div></section><div class="grid summary-grid"><div class="card summary-card"><span class="label">Receitas no período</span><div class="value positive">' + money(data.income) + '</div><div class="helper">' + transactions.length + ' movimentos selecionados</div></div><div class="card summary-card"><span class="label">Despesas no período</span><div class="value negative">' + money(data.expense) + '</div><div class="helper">saldo do recorte: ' + money(data.income - data.expense) + '</div></div><div class="card summary-card"><span class="label">Maior categoria</span><div class="value accent">' + esc(categories[0] ? categories[0].category.name : '—') + '</div><div class="helper">' + (categories[0] ? money(categories[0].amount) : 'sem dados') + '</div></div><div class="card summary-card"><span class="label">Período analisado</span><div class="value accent report-period-value">' + esc(dateSummary) + '</div><div class="helper">filtros aplicados ao relatório</div></div></div><div class="grid two-column"><section class="card section"><div class="section-heading"><div><h2>Despesas por categoria</h2><p>Ranking do recorte selecionado</p></div><button class="button small secondary" data-action="export-filtered-csv">Exportar CSV</button></div><div class="report-bars">' + (categories.length ? categories.map(function (row) { return '<div class="report-bar-row"><label>' + esc(row.category.name) + '</label><div class="report-bar"><span style="width:' + clamp(row.amount / max * 100, 0, 100) + '%"></span></div><strong>' + money(row.amount) + '</strong></div>'; }).join('') : '<div class="empty">Registre despesas ou ajuste os filtros para gerar o relatório.</div>') + '</div></section><section class="card section"><div class="section-heading"><div><h2>Fluxo selecionado</h2><p>Entradas e saídas consolidadas</p></div></div><div class="budget-list"><div class="budget-row"><div class="budget-row-top"><strong>Receitas</strong><span class="positive">' + money(data.income) + '</span></div><div class="progress teal"><span style="width:100%"></span></div></div><div class="budget-row"><div class="budget-row-top"><strong>Despesas</strong><span class="negative">' + money(data.expense) + '</span></div><div class="progress red"><span style="width:' + (data.income ? clamp(data.expense / data.income * 100, 0, 100) : 0) + '%"></span></div></div><div class="budget-row"><div class="budget-row-top"><strong>Comparação mensal</strong><span class="accent">' + (previous.expense ? Math.round((data.expense / previous.expense - 1) * 100) + '%' : '—') + '</span></div><div class="budget-meta"><span>versus ' + esc(monthLabel(previousMonth)) + '</span><span>pendentes: ' + money(data.pending) + '</span></div></div></div></section></div><section class="card section"><div class="section-heading"><div><h2>Patrimônio e metas</h2><p>Uma visão além do saldo do período</p></div><button class="button small ghost" data-action="open-goal">＋ Nova meta</button></div><div class="grid three-column">' + (state.goals.length ? state.goals.map(function (goal) { return '<div class="budget-row"><div class="budget-row-top"><strong>' + esc(goal.name) + '</strong><span>' + money(goal.target) + '</span></div><div class="progress teal"><span style="width:' + clamp(goal.target ? goal.saved / goal.target * 100 : 0, 0, 100) + '%"></span></div><div class="budget-meta"><span>' + money(goal.saved) + ' acumulados</span><span>' + dateBR(goal.dueDate) + '</span></div></div>'; }).join('') : '<div class="empty">Nenhuma meta cadastrada.</div>') + '</div></section></div>';
  }

  function renderTelegram() {
    var telegramState = state.telegram || { status: 'not-configured', botUsername: '', chatId: '' };
    var telegramTransactions = state.transactions.filter(function (item) { return (item.tags || []).indexOf('telegram') >= 0; }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }).slice(0, 6);
    var configured = telegramState.status === 'configured';
    return renderTopbar('Telegram', 'Transforme mensagens simples em lançamentos organizados') + '<div class="content"><div class="telegram-layout"><section class="card telegram-card telegram-intake"><div class="eyebrow">Entrada rápida</div><h2>Escreva como você fala</h2><p>O Todo Controle identifica valor, tipo, data, conta, cartão, categoria e mês da fatura.</p><form id="telegram-message-form"><div class="field"><label for="telegram-message">Mensagem financeira</label><textarea id="telegram-message" name="message" rows="4" placeholder="Ex.: gastei R$ 35,90 no mercado"></textarea></div><div class="telegram-examples"><button type="button" class="example-chip" data-telegram-example="gastei R$ 35,90 no mercado">gastei R$ 35,90 no mercado</button><button type="button" class="example-chip" data-telegram-example="recebi R$ 2.500,00 de salário">recebi R$ 2.500,00 de salário</button><button type="button" class="example-chip" data-telegram-example="compra R$ 89,90 no cartão Nubank, fatura outubro">compra no cartão + fatura</button></div><button class="button primary full" type="submit">＋ Registrar lançamento</button></form></section><section class="card telegram-card"><div class="section-heading"><div><div class="eyebrow">Ponte do bot</div><h2>Ponte segura do Telegram</h2><p>Esta configuração não pede nem armazena o token do bot no navegador.</p></div><span class="status ' + (configured ? 'positive' : '') + '">' + (configured ? 'configurado localmente' : 'interface pronta') + '</span></div><form id="telegram-config-form"><div class="field"><label for="telegram-bot-username">Usuário do bot</label><input id="telegram-bot-username" name="botUsername" value="' + esc(telegramState.botUsername) + '" placeholder="@todo_controle_bot" /></div><div class="field"><label for="telegram-chat-id">Chat ID vinculado</label><input id="telegram-chat-id" name="chatId" value="' + esc(telegramState.chatId) + '" placeholder="Será preenchido pelo pareamento" /></div><button class="button secondary full" type="submit">Salvar configuração local</button></form><div class="callout warning" style="margin-top:16px">O site publicado no GitHub Pages é estático. Para receber mensagens automaticamente no bot, ainda é necessário ligar um endpoint HTTPS seguro ao Telegram. Enquanto isso, esta tela já permite testar o mesmo formato de mensagem no app.</div></section></div><section class="card section"><div class="section-heading"><div><h2>Últimos lançamentos via Telegram</h2><p>Mensagens convertidas nesta instalação</p></div><button class="button small ghost" data-view="transactions">Ver transações →</button></div><div class="transaction-list">' + (telegramTransactions.length ? telegramTransactions.map(function (item) { return transactionMarkup(item, true); }).join('') : '<div class="empty">Nenhum lançamento criado pelo Telegram ainda. Use um dos exemplos acima.</div>') + '</div></section></div>';
  }

  function renderCategoryModal() {
    var roots = state.categories.filter(function (category) { return !category.parentId; });
    return modalShell('Nova categoria', 'Organize categorias e subcategorias do seu jeito', '<form id="category-form"><div class="form-grid"><div class="field wide"><label for="category-name">Nome</label><input id="category-name" name="name" placeholder="Ex.: Educação, Moradia ou Assinaturas" required /></div><div class="field"><label for="category-parent">Categoria pai</label><select id="category-parent" name="parentId"><option value="">Categoria principal</option>' + roots.map(function (category) { return '<option value="' + esc(category.id) + '">' + esc(category.name) + '</option>'; }).join('') + '</select></div><div class="field"><label for="category-color">Cor</label><input id="category-color" name="color" type="color" value="#35c7b4" /></div></div><div class="callout" style="margin-top:14px">Use uma categoria principal para criar uma subcategoria. Os relatórios agrupam as subcategorias automaticamente.</div></form>', '<button class="button ghost" data-action="close-modal">Cancelar</button><button class="button primary" form="category-form">Criar categoria</button>');
  }

  function renderTransactionModal() {
    var existing = modal.id ? state.transactions.find(function (item) { return item.id === modal.id; }) : null;
    var item = existing || { type: modal.defaultType || 'expense', amount: '', description: '', date: todayISO(), accountId: state.accounts[0] && state.accounts[0].id, cardId: state.cards[0] && state.cards[0].id, categoryId: state.categories[0] && state.categories[0].id, status: 'paid', installments: 1, recurring: false, tags: [], note: '', billingMonth: state.selectedMonth };
    var type = modal.typeValue || item.type;
    var cardExpense = type === 'card-expense' || Boolean(item.cardId);
    if (cardExpense && type === 'expense') type = 'card-expense';
    var transfer = type === 'transfer';
    var billingMonth = item.billingMonth || String(item.date || todayISO()).slice(0, 7);
    return modalShell(existing ? 'Editar lançamento' : 'Novo lançamento', 'Preencha os detalhes e confirme antes de salvar', '<form id="transaction-form" data-id="' + esc(existing ? existing.id : '') + '"><div class="form-grid"><div class="field"><label for="tx-type">Tipo</label><select id="tx-type" name="type"><option value="expense"' + selected(type === 'expense') + '>Despesa</option><option value="income"' + selected(type === 'income') + '>Receita</option><option value="transfer"' + selected(transfer) + '>Transferência</option><option value="card-expense"' + selected(type === 'card-expense') + '>Despesa no cartão</option></select></div><div class="field"><label for="tx-amount">Valor</label><input id="tx-amount" name="amount" inputmode="decimal" placeholder="0,00" value="' + esc(item.amount || '') + '" required /></div><div class="field wide"><label for="tx-description">Descrição</label><input id="tx-description" name="description" placeholder="Ex.: Mercado, salário ou aluguel" value="' + esc(item.description || '') + '" required /></div><div class="field"><label for="tx-date">Data da compra</label><input id="tx-date" name="date" type="date" value="' + esc(item.date || todayISO()) + '" required /></div>' + (transfer ? '<div class="field"><label for="tx-from">Sai de</label><select id="tx-from" name="fromAccountId">' + optionAccounts(item.fromAccountId || item.accountId) + '</select></div><div class="field"><label for="tx-to">Vai para</label><select id="tx-to" name="toAccountId">' + optionAccounts(item.toAccountId) + '</select></div>' : cardExpense ? '<div class="field"><label for="tx-card">Cartão</label><select id="tx-card" name="cardId">' + optionCards(item.cardId) + '</select></div><div class="field"><label for="tx-category">Categoria</label><select id="tx-category" name="categoryId">' + optionCategories(item.categoryId) + '</select></div><div class="field"><label for="tx-billing-month">Mês da fatura</label><select id="tx-billing-month" name="billingMonth">' + billingMonthOptions(billingMonth) + '</select><small>É o mês em que a cobrança aparecerá na fatura.</small></div>' : '<div class="field"><label for="tx-account">Conta</label><select id="tx-account" name="accountId">' + optionAccounts(item.accountId) + '</select></div><div class="field"><label for="tx-category">Categoria</label><select id="tx-category" name="categoryId">' + optionCategories(item.categoryId) + '</select></div>') + (!transfer ? '<div class="field"><label for="tx-status">Status</label><select id="tx-status" name="status"><option value="paid"' + selected(item.status !== 'pending') + '>Confirmado</option><option value="pending"' + selected(item.status === 'pending') + '>Pendente</option></select></div><div class="field"><label for="tx-installments">Parcelas</label><input id="tx-installments" name="installments" type="number" min="1" max="60" value="' + esc(item.installments || 1) + '" /><small>Para cartão, cada parcela segue para o mês da fatura seguinte.</small></div><div class="field wide"><label for="tx-tags">Tags</label><input id="tx-tags" name="tags" placeholder="ex.: fixa, trabalho, família" value="' + esc((item.tags || []).join(', ')) + '" /></div><div class="field wide"><label for="tx-note">Observação</label><textarea id="tx-note" name="note" placeholder="Anote algo importante sobre este lançamento">' + esc(item.note || '') + '</textarea></div><label class="check-row wide"><input type="checkbox" name="recurring"' + checked(item.recurring) + ' /> Marcar como recorrente</label>' : '') + '</div></form>', '<button class="button ghost" data-action="close-modal">Cancelar</button><button class="button primary" form="transaction-form">Salvar lançamento</button>');
  }

  function renderImportModal() {
    var hasRows = importRows.length > 0;
    return modalShell('Importar fatura ou extrato', 'OFX, QFX e CSV são processados localmente no seu navegador', '<form id="import-form"><div class="field"><label for="import-file">Arquivo</label><input id="import-file" name="file" type="file" accept=".ofx,.qfx,.csv,text/csv,application/x-ofx"' + (hasRows ? '' : ' required') + ' /><small>Também reconhecemos transações de faturas de cartão em OFX/QFX com o bloco CCSTMTTRN.</small></div><div class="form-grid" style="margin-top:14px"><div class="field"><label for="import-destination-type">Destino</label><select id="import-destination-type" name="destinationType"><option value="account">Extrato de conta</option><option value="card">Fatura de cartão</option></select></div><div class="field"><label for="import-account">Conta de destino</label><select id="import-account" name="accountId">' + optionAccounts(state.accounts[0] && state.accounts[0].id) + '</select></div><div class="field"><label for="import-card">Cartão de destino</label><select id="import-card" name="cardId">' + optionCards(state.cards[0] && state.cards[0].id) + '</select></div><div class="field"><label for="import-billing-month">Mês da fatura</label><select id="import-billing-month" name="importBillingMonth">' + billingMonthOptions(state.selectedMonth) + '</select></div></div>' + (hasRows ? '<div class="import-preview"><div class="callout">' + importRows.length + ' lançamentos identificados. Revise o destino e o mês da fatura antes de confirmar.</div><table class="data-table"><thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>Fatura</th></tr></thead><tbody>' + importRows.slice(0, 12).map(function (row) { return '<tr><td>' + dateBR(row.date) + '</td><td>' + esc(row.description) + '</td><td class="' + (row.type === 'income' ? 'positive' : 'negative') + '">' + money(row.amount) + '</td><td>' + esc(row.billingMonth ? monthLabel(row.billingMonth) : 'definido acima') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '') + '</form>', '<button class="button ghost" data-action="close-modal">Cancelar</button><button class="button primary" form="import-form">' + (hasRows ? 'Importar ' + importRows.length + ' lançamentos' : 'Ler arquivo') + '</button>');
  }

  function renderModal() {
    if (!modal) return '';
    if (modal.type === 'transaction') return renderTransactionModal();
    if (modal.type === 'category') return renderCategoryModal();
    if (modal.type === 'telegram-config') return '';
    if (modal.type === 'account') return renderAccountModal();
    if (modal.type === 'card') return renderCardModal();
    if (modal.type === 'budget') return renderBudgetModal();
    if (modal.type === 'goal') return renderGoalModal();
    if (modal.type === 'bill') return renderBillModal();
    if (modal.type === 'import') return renderImportModal();
    if (modal.type === 'connection') return renderConnectionModal();
    if (modal.type === 'card-payment') return renderCardPaymentModal();
    return '';
  }

  function renderMore() {
    var roots = state.categories.filter(function (category) { return !category.parentId; });
    return renderTopbar('Mais', 'Configurações, dados e ferramentas para manter o controle') + '<div class="content"><div class="grid two-column"><section class="card section"><div class="section-heading"><div><h2>Dados e backup</h2><p>Seus dados pertencem a você</p></div></div><div class="grid"><button class="button secondary full" data-action="export-json">↓ Exportar backup JSON</button><button class="button full" data-action="open-import">Importar fatura ou extrato</button><button class="button ghost full" data-action="reset-data">Restaurar dados de exemplo</button></div><div class="callout" style="margin-top:16px">O app salva os dados neste dispositivo usando armazenamento local. Exporte um backup antes de trocar de navegador ou computador.</div></section><section class="card section"><div class="section-heading"><div><h2>Preferências</h2><p>Recursos e integrações</p></div></div><div class="budget-list"><div class="budget-row"><div class="budget-row-top"><strong>Telegram</strong><span class="positive">interface pronta</span></div><div class="budget-meta"><span>Crie lançamentos por mensagens simples</span><button class="button small ghost" data-view="telegram">Abrir →</button></div></div><div class="budget-row"><div class="budget-row-top"><strong>Notificações de vencimento</strong><span class="status">em preparação</span></div><div class="budget-meta"><span>Alertas de contas e cartões</span></div></div><div class="budget-row"><div class="budget-row-top"><strong>Privacidade</strong><span class="positive">local-first</span></div><div class="budget-meta"><span>Nenhuma senha bancária é solicitada</span></div></div></div></section></div><section class="card section"><div class="section-heading"><div><h2>Categorias e subcategorias</h2><p>Personalize sua organização financeira e os filtros dos relatórios.</p></div><button class="button primary small" data-action="open-category">＋ Nova categoria</button></div><div class="category-tree">' + (roots.length ? roots.map(function (root) { var children = state.categories.filter(function (category) { return category.parentId === root.id; }); return '<div class="category-tree-item"><div class="category-row"><span class="legend-dot" style="background:' + esc(root.color || '#9a5cf2') + '"></span><strong>' + esc(root.name) + '</strong><span class="category-count">' + children.length + ' subcategorias</span></div>' + children.map(function (child) { return '<div class="category-row category-child"><span class="legend-dot" style="background:' + esc(child.color || root.color || '#9a5cf2') + '"></span><span>' + esc(child.name) + '</span><span class="category-count">subcategoria</span></div>'; }).join('') + '</div>'; }).join('') : '<div class="empty">Nenhuma categoria cadastrada.</div>') + '</div></section><section class="card section"><div class="section-heading"><div><h2>Sobre o Todo Controle</h2><p>Uma ferramenta independente inspirada em boas práticas de organização financeira.</p></div><a class="button small ghost" href="https://github.com/actualbudget/actual" target="_blank" rel="noreferrer">Ver Actual Budget →</a></div><div class="callout">Esta aplicação não é uma cópia do Mobills, do Fina ou do Actual Budget. Ela combina ideias de organização financeira em uma experiência própria.</div></section></div>';
  }

  function renderView() {
    if (activeView === 'transactions') return renderTransactions();
    if (activeView === 'planning') return renderPlanning();
    if (activeView === 'accounts') return renderAccounts();
    if (activeView === 'reports') return renderReports();
    if (activeView === 'telegram') return renderTelegram();
    if (activeView === 'openfinance') return renderOpenFinance();
    if (activeView === 'more') return renderMore();
    return renderDashboard();
  }

  function parseOFX(text) {
    var rows = [];
    text.split(/<(?:CC)?STMTTRN>/i).slice(1).forEach(function (block) {
      var amount = parseMoney((block.match(/<TRNAMT>([^<\r\n]+)/i) || [])[1] || '0');
      var date = ((block.match(/<DTPOSTED>(\d{4})(\d{2})(\d{2})/i) || []).slice(1)).join('-');
      var description = (block.match(/<(?:NAME|MEMO)>([^<\r\n]+)/i) || [])[1] || 'Lançamento OFX';
      var fitId = (block.match(/<FITID>([^<\r\n]+)/i) || [])[1] || '';
      if (date && amount) rows.push({ date: date, description: description.trim(), amount: Math.abs(amount), type: amount >= 0 ? 'income' : 'expense', billingMonth: state.selectedMonth, sourceId: fitId });
    });
    return rows;
  }

  function parseCSV(text) {
    var lines = text.split(/\r?\n/).filter(function (line) { return line.trim(); });
    if (!lines.length) return [];
    var delimiter = lines[0].indexOf(';') >= 0 ? ';' : ',';
    var header = parseDelimitedLine(lines[0], delimiter).map(function (value) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); });
    var dateIndex = header.findIndex(function (value) { return /data|date|posted/.test(value); });
    var descriptionIndex = header.findIndex(function (value) { return /descri|histor|memo|name|estabelecimento/.test(value); });
    var amountIndex = header.findIndex(function (value) { return /valor|amount|value|preco/.test(value); });
    var monthIndex = header.findIndex(function (value) { return /fatura|competencia|billing|mes/.test(value); });
    if (dateIndex < 0 || amountIndex < 0) { dateIndex = 0; descriptionIndex = 1; amountIndex = 2; }
    return lines.slice(1).map(function (line) {
      var values = parseDelimitedLine(line, delimiter);
      var rawAmount = values[amountIndex] || '0';
      var amount = parseMoney(rawAmount);
      var date = csvDate(values[dateIndex] || '');
      return { date: date, description: values[descriptionIndex] || 'Lançamento CSV', amount: Math.abs(amount), type: String(rawAmount).indexOf('-') >= 0 ? 'expense' : 'income', billingMonth: monthIndex >= 0 ? csvMonth(values[monthIndex]) : state.selectedMonth };
    }).filter(function (row) { return row.date && row.amount; });
  }

  function parseTelegramMessage(message) {
    var text = String(message || '').trim();
    var normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var amountMatch = text.match(/r\$\s*([\d.]+(?:,\d{1,2})?)/i) || text.match(/(?:^|\s)(\d+(?:[.,]\d{1,2})?)(?:\s|$)/);
    var amount = parseMoney(amountMatch ? amountMatch[1] : '0');
    var type = /\b(recebi|receita|salario|entrada|ganhei|venda|deposito)\b/i.test(normalized) ? 'income' : 'expense';
    var date = todayISO();
    var dateMatch = normalized.match(/\b(?:dia|em)\s+(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?/);
    if (dateMatch) { var year = dateMatch[3] ? Number(dateMatch[3].length === 2 ? '20' + dateMatch[3] : dateMatch[3]) : Number(todayISO().slice(0, 4)); date = year + '-' + pad(Number(dateMatch[2])) + '-' + pad(Number(dateMatch[1])); }
    var monthIndex = -1;
    monthNames.forEach(function (name, index) { if (normalized.indexOf(name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) >= 0) monthIndex = index; });
    var yearMatch = normalized.match(/\b(20\d{2})\b/);
    var billingMonth = monthIndex >= 0 ? (yearMatch ? yearMatch[1] : String(todayISO().slice(0, 4))) + '-' + pad(monthIndex + 1) : date.slice(0, 7);
    var card = state.cards.slice().sort(function (a, b) { return b.name.length - a.name.length; }).find(function (item) { return normalized.indexOf(item.name.toLowerCase()) >= 0; });
    var cardId = card ? card.id : (/\bcartao\b|\bfatura\b/i.test(normalized) && state.cards[0] ? state.cards[0].id : '');
    var account = state.accounts.slice().sort(function (a, b) { return b.name.length - a.name.length; }).find(function (item) { return normalized.indexOf(item.name.toLowerCase()) >= 0; });
    var category = state.categories.slice().sort(function (a, b) { return b.name.length - a.name.length; }).find(function (item) { return normalized.indexOf(item.name.toLowerCase()) >= 0; });
    var description = text.replace(/r\$\s*[\d.]+(?:,\d{1,2})?/ig, '').replace(/(?:^|\s)(?:gastei|paguei|compra|despesa|recebi|receita|ganhei|entrada|venda|deposito)(?=\s|$)/ig, '').replace(/\b(?:dia|em)\s+\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?/ig, '').replace(/\b(?:fatura|vencimento|mes|mês)\s+(?:de\s+)?[a-zç]+(?:\s+20\d{2})?/ig, '').replace(/\bcart[aã]o\b/ig, '').replace(/\s+/g, ' ').replace(/^\s*(?:no|na|em|de)\s+/i, '').replace(/[,-]+$/, '').trim();
    return { amount: amount, type: cardId ? 'expense' : type, date: date, description: description || 'Lançamento via Telegram', accountId: cardId ? '' : account ? account.id : (state.accounts[0] && state.accounts[0].id), cardId: cardId, categoryId: category ? category.id : '', billingMonth: billingMonth };
  }

  function exportFilteredCSV() {
    var rows = [['data', 'descricao', 'tipo', 'categoria', 'conta_cartao', 'valor', 'mes_fatura']];
    reportTransactions().forEach(function (item) { var owner = item.cardId ? cardById(item.cardId) : accountById(item.accountId); rows.push([item.date, item.description, item.type, displayCategory(item), owner ? owner.name : '', String(item.amount).replace('.', ','), item.billingMonth || '']); });
    download('todo-controle-relatorio.csv', rows.map(function (row) { return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(';'); }).join('\n'), 'text/csv;charset=utf-8');
    showToast('Relatório filtrado exportado.');
  }

  function handleClick(event) {
    var target = event.target.closest('button, a, .modal-backdrop');
    if (!target) return;
    var example = target.getAttribute('data-telegram-example');
    if (example) { var messageInput = document.getElementById('telegram-message'); if (messageInput) { messageInput.value = example; messageInput.focus(); } return; }
    var action = target.getAttribute('data-action');
    if (action === 'open-category') { modal = { type: 'category' }; render(); return; }
    if (action === 'reset-report-filters') { reportStartDate = ''; reportEndDate = ''; reportCardFilter = 'all'; reportCategoryFilter = 'all'; render(); return; }
    if (action === 'export-filtered-csv') { exportFilteredCSV(); return; }
    var view = target.getAttribute('data-view');
    if (view) { activeCardFilter = 'all'; activeCategoryFilter = 'all'; activeAccountFilter = 'all'; reportStartDate = ''; reportEndDate = ''; reportCardFilter = 'all'; reportCategoryFilter = 'all'; }
    legacyHandleClick(event);
  }

  function handleChange(event) {
    var target = event.target;
    if (target.id === 'transaction-card-filter') { activeCardFilter = target.value; render(); return; }
    if (target.id === 'transaction-category-filter') { activeCategoryFilter = target.value; render(); return; }
    if (target.id === 'transaction-account-filter') { activeAccountFilter = target.value; render(); return; }
    if (target.id === 'report-start') { reportStartDate = target.value; render(); return; }
    if (target.id === 'report-end') { reportEndDate = target.value; render(); return; }
    if (target.id === 'report-card-filter') { reportCardFilter = target.value; render(); return; }
    if (target.id === 'report-category-filter') { reportCategoryFilter = target.value; render(); return; }
    legacyHandleChange(event);
  }

  function handleSubmit(event) {
    var form = event.target;
    if (form.id === 'category-form') {
      event.preventDefault();
      var categoryData = formData(form);
      var categoryName = String(categoryData.name || '').trim();
      if (!categoryName) { showToast('Informe o nome da categoria.'); return; }
      if (state.categories.some(function (category) { return category.name.toLowerCase() === categoryName.toLowerCase() && String(category.parentId || '') === String(categoryData.parentId || ''); })) { showToast('Essa categoria já existe nesse nível.'); return; }
      state.categories.push({ id: uid('cat'), name: categoryName, parentId: categoryData.parentId || '', color: categoryData.color || '#35c7b4' });
      save(); closeAll(); showToast('Categoria criada.'); return;
    }
    if (form.id === 'telegram-config-form') {
      event.preventDefault();
      var telegramConfig = formData(form);
      state.telegram = { status: telegramConfig.botUsername || telegramConfig.chatId ? 'configured' : 'not-configured', botUsername: telegramConfig.botUsername || '', chatId: telegramConfig.chatId || '' };
      save(); render(); showToast('Configuração local do Telegram salva.'); return;
    }
    if (form.id === 'telegram-message-form') {
      event.preventDefault();
      var telegramData = formData(form);
      var parsed = parseTelegramMessage(telegramData.message);
      if (!parsed.amount) { showToast('Informe um valor, por exemplo: R$ 35,90.'); return; }
      state.transactions.push({ id: uid('tx'), date: parsed.date, description: parsed.description, type: parsed.type, amount: parsed.amount, accountId: parsed.accountId || '', cardId: parsed.cardId || '', billingMonth: parsed.cardId ? parsed.billingMonth : '', categoryId: parsed.categoryId || '', status: 'paid', tags: ['telegram'], note: 'Criado a partir de uma mensagem do Telegram' });
      save(); render(); showToast('Lançamento criado a partir do Telegram.'); return;
    }
    if (form.id === 'transaction-form') {
      event.preventDefault();
      var data = formData(form);
      var inputType = data.type;
      var type = inputType;
      var amount = parseMoney(data.amount);
      if (!amount || !data.description) { showToast('Informe descrição e valor.'); return; }
      if (type === 'card-expense') type = 'expense';
      if (type === 'transfer' && data.fromAccountId === data.toAccountId) { showToast('Escolha contas diferentes para a transferência.'); return; }
      var installments = Math.max(1, Number(data.installments || 1));
      var purchaseDate = data.date || todayISO();
      var invoiceMonth = inputType === 'card-expense' ? (data.billingMonth || purchaseDate.slice(0, 7)) : '';
      var base = { description: data.description, amount: amount, date: purchaseDate, status: data.status || 'paid', tags: data.tags ? data.tags.split(',').map(function (tag) { return tag.trim(); }).filter(Boolean) : [], note: data.note || '', recurring: Boolean(data.recurring), billingMonth: invoiceMonth };
      var id = form.getAttribute('data-id');
      if (id) {
        var existing = state.transactions.find(function (item) { return item.id === id; });
        if (existing) Object.assign(existing, base, type === 'transfer' ? { type: 'transfer', fromAccountId: data.fromAccountId, toAccountId: data.toAccountId, accountId: '', cardId: '', categoryId: '', billingMonth: '' } : { type: type, accountId: inputType === 'card-expense' ? '' : data.accountId || '', cardId: inputType === 'card-expense' ? data.cardId || '' : '', categoryId: data.categoryId || '', fromAccountId: '', toAccountId: '' });
        showToast('Lançamento atualizado.');
      } else {
        for (var index = 0; index < installments; index += 1) state.transactions.push(Object.assign({}, base, { id: uid('tx'), type: type, date: addMonths(base.date, index), billingMonth: inputType === 'card-expense' ? addMonths(invoiceMonth + '-01', index).slice(0, 7) : '', installmentNumber: installments > 1 ? index + 1 : 0, installments: installments > 1 ? installments : 0, accountId: inputType === 'card-expense' ? '' : data.accountId || '', cardId: inputType === 'card-expense' ? data.cardId || '' : '', categoryId: data.categoryId || '', fromAccountId: data.fromAccountId || '', toAccountId: data.toAccountId || '' }));
        showToast('Lançamento adicionado.');
      }
      save(); closeAll(); return;
    }
    if (form.id === 'import-form') {
      event.preventDefault();
      var file = form.querySelector('input[type="file"]').files[0];
      if (!importRows.length && file) { readImportFile(file); return; }
      if (!importRows.length) { showToast('Selecione um arquivo primeiro.'); return; }
      var destinationType = formData(form).destinationType || 'account';
      var importData = formData(form);
      var importedAccountId = destinationType === 'card' ? '' : importData.accountId || (state.accounts[0] && state.accounts[0].id);
      var importedCardId = destinationType === 'card' ? importData.cardId || (state.cards[0] && state.cards[0].id) : '';
      importRows.forEach(function (row) { state.transactions.push({ id: uid('tx'), date: row.date, description: row.description, type: row.type, amount: row.amount, accountId: importedAccountId, cardId: importedCardId, billingMonth: destinationType === 'card' ? (row.billingMonth || importData.importBillingMonth || state.selectedMonth) : '', categoryId: '', status: 'paid', tags: ['importado', destinationType === 'card' ? 'fatura-cartao' : 'extrato'], note: 'Importado localmente' }); });
      var importedCount = importRows.length;
      save(); closeAll(); showToast(importedCount + ' lançamentos importados.'); return;
    }
    legacyHandleSubmit(event);
  }

  function legacyHandleClick(event) {
    var target = event.target.closest('button, a, .modal-backdrop');
    if (!target) return;
    var view = target.getAttribute('data-view');
    if (view) { activeView = view; searchTerm = ''; activeFilter = 'all'; closeAll(); return; }
    var filter = target.getAttribute('data-filter');
    if (filter) { activeFilter = filter; render(); return; }
    var action = target.getAttribute('data-action');
    if (!action) return;
    if (action === 'toggle-theme') { toggleTheme(); return; }
    if (action === 'toggle-sidebar') { var sidebar = document.getElementById('sidebar'); if (sidebar) sidebar.classList.toggle('open'); return; }
    if (action === 'quick-add') { quickMenu = true; render(); return; }
    if (action === 'close-quick') { quickMenu = false; render(); return; }
    if (action === 'close-modal') { if (target.classList.contains('modal-backdrop') && event.target !== target) return; closeAll(); return; }
    if (action === 'open-transaction') { quickMenu = false; openTransaction(target.getAttribute('data-type')); return; }
    if (action === 'edit-transaction') { openTransaction('expense', target.getAttribute('data-id')); return; }
    if (action === 'delete-transaction') {
      var transactionId = target.getAttribute('data-id');
      if (window.confirm('Excluir este lançamento?')) { state.transactions = state.transactions.filter(function (item) { return item.id !== transactionId; }); save(); render(); showToast('Lançamento excluído.'); }
      return;
    }
    if (action === 'open-account') { modal = { type: 'account' }; render(); return; }
    if (action === 'open-card') { modal = { type: 'card' }; render(); return; }
    if (action === 'open-budget') { modal = { type: 'budget' }; render(); return; }
    if (action === 'open-goal') { modal = { type: 'goal' }; render(); return; }
    if (action === 'open-bill') { modal = { type: 'bill' }; render(); return; }
    if (action === 'open-import') { modal = { type: 'import' }; render(); return; }
    if (action === 'open-connection') { modal = { type: 'connection', provider: target.getAttribute('data-provider') }; render(); return; }
    if (action === 'pay-card') { modal = { type: 'card-payment', cardId: target.getAttribute('data-id') }; render(); return; }
    if (action === 'toggle-bill') {
      var bill = state.bills.find(function (item) { return item.id === target.getAttribute('data-id'); });
      if (bill) { bill.status = bill.status === 'paid' ? 'open' : 'paid'; save(); render(); showToast(bill.status === 'paid' ? 'Conta marcada como paga.' : 'Conta reaberta.'); }
      return;
    }
    if (action === 'delete-budget') { state.budgets = state.budgets.filter(function (item) { return item.id !== target.getAttribute('data-id'); }); save(); render(); showToast('Orçamento removido.'); return; }
    if (action === 'export-json') { exportJSON(); return; }
    if (action === 'export-csv') { exportCSV(); return; }
    if (action === 'reset-data' && window.confirm('Restaurar dados de exemplo? Seus dados locais atuais serão substituídos.')) { state = defaultState(); save(); render(); showToast('Dados de exemplo restaurados.'); }
  }
  function formData(form) { var result = {}; new FormData(form).forEach(function (value, key) { result[key] = value; }); return result; }
  function legacyHandleSubmit(event) {
    var form = event.target;
    event.preventDefault();
    var data = formData(form);
    if (form.id === 'transaction-form') {
      var type = data.type;
      var amount = parseMoney(data.amount);
      if (!amount || !data.description) { showToast('Informe descrição e valor.'); return; }
      if (type === 'card-expense') type = 'expense';
      if (type === 'transfer' && data.fromAccountId === data.toAccountId) { showToast('Escolha contas diferentes para a transferência.'); return; }
      var installments = Math.max(1, Number(data.installments || 1));
      var base = { description: data.description, amount: amount, date: data.date || todayISO(), status: data.status || 'paid', tags: data.tags ? data.tags.split(',').map(function (tag) { return tag.trim(); }).filter(Boolean) : [], note: data.note || '', recurring: Boolean(data.recurring) };
      var id = form.getAttribute('data-id');
      if (id) {
        var existing = state.transactions.find(function (item) { return item.id === id; });
        if (existing) Object.assign(existing, base, type === 'transfer' ? { type: 'transfer', fromAccountId: data.fromAccountId, toAccountId: data.toAccountId, accountId: '' } : { type: type, accountId: data.accountId || '', cardId: data.cardId || '', categoryId: data.categoryId || '', fromAccountId: '', toAccountId: '' });
        showToast('Lançamento atualizado.');
      } else {
        for (var index = 0; index < installments; index += 1) state.transactions.push(Object.assign({}, base, { id: uid('tx'), type: type, date: addMonths(base.date, index), installmentNumber: installments > 1 ? index + 1 : 0, installments: installments > 1 ? installments : 0, accountId: data.accountId || '', cardId: data.cardId || '', categoryId: data.categoryId || '', fromAccountId: data.fromAccountId || '', toAccountId: data.toAccountId || '' }));
        showToast('Lançamento adicionado.');
      }
      save(); closeAll(); return;
    }
    if (form.id === 'account-form') { state.accounts.push({ id: uid('account'), name: data.name, institution: data.institution, type: data.type, openingBalance: parseMoney(data.openingBalance), color: data.color || '#7c3aed' }); save(); closeAll(); showToast('Conta criada.'); return; }
    if (form.id === 'card-form') { state.cards.push({ id: uid('card'), name: data.name, brand: data.brand, limit: parseMoney(data.limit), closingDay: data.closingDay, dueDay: data.dueDay, color: data.color || '#9a5cf2' }); save(); closeAll(); showToast('Cartão criado.'); return; }
    if (form.id === 'budget-form') { var duplicate = state.budgets.find(function (item) { return item.month === state.selectedMonth && item.categoryId === data.categoryId; }); if (duplicate) duplicate.amount = parseMoney(data.amount); else state.budgets.push({ id: uid('budget'), month: state.selectedMonth, categoryId: data.categoryId, amount: parseMoney(data.amount) }); save(); closeAll(); showToast('Orçamento salvo.'); return; }
    if (form.id === 'goal-form') { state.goals.push({ id: uid('goal'), name: data.name, target: parseMoney(data.target), saved: parseMoney(data.saved), dueDate: data.dueDate, color: data.color || '#35c7b4' }); save(); closeAll(); showToast('Meta criada.'); return; }
    if (form.id === 'bill-form') { state.bills.push({ id: uid('bill'), description: data.description, amount: parseMoney(data.amount), dueDate: data.dueDate, categoryId: data.categoryId, status: 'open', recurring: Boolean(data.recurring) }); save(); closeAll(); showToast('Conta adicionada ao planejamento.'); return; }
    if (form.id === 'connection-form') { state.connections.push({ id: uid('connection'), provider: data.provider, institution: data.institution, status: 'pending', createdAt: new Date().toISOString() }); save(); closeAll(); showToast('Preparação de conexão salva.'); return; }
    if (form.id === 'card-payment-form') { var payment = parseMoney(data.amount); if (!payment) { showToast('Informe o valor do pagamento.'); return; } state.transactions.push({ id: uid('tx'), date: todayISO(), description: 'Pagamento de fatura', type: 'card-payment', amount: payment, accountId: data.accountId, cardId: modal.cardId, status: 'paid', categoryId: '', tags: [], note: '' }); save(); closeAll(); showToast('Pagamento de fatura registrado.'); return; }
    if (form.id === 'import-form') {
      var file = form.querySelector('input[type="file"]').files[0];
      if (!importRows.length && file) { readImportFile(file); return; }
      if (!importRows.length) { showToast('Selecione um arquivo primeiro.'); return; }
      var accountId = data.accountId || (state.accounts[0] && state.accounts[0].id);
      importRows.forEach(function (row) { state.transactions.push({ id: uid('tx'), date: row.date, description: row.description, type: row.type, amount: row.amount, accountId: accountId, categoryId: '', status: 'paid', tags: ['importado'], note: 'Importado localmente' }); });
      var importedCount = importRows.length;
      save(); closeAll(); showToast(importedCount + ' lançamentos importados.'); return;
    }
  }
  function legacyHandleChange(event) {
    var target = event.target;
    if (target.id === 'month-picker') { state.selectedMonth = target.value; save(); render(); return; }
    if (target.id === 'tx-type' && modal && modal.type === 'transaction') { modal.typeValue = target.value; render(); return; }
    if (target.id === 'import-file' && target.files[0]) { readImportFile(target.files[0]); return; }
  }
  function handleInput(event) {
    if (event.target.id === 'transaction-search') { searchTerm = event.target.value; render(); var input = document.getElementById('transaction-search'); if (input) { input.focus(); input.setSelectionRange(searchTerm.length, searchTerm.length); } }
  }

  document.addEventListener('click', handleClick);
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('change', handleChange);
  document.addEventListener('input', handleInput);
  window.addEventListener('hashchange', function () { var hash = window.location.hash.replace('#', ''); if (navItems().some(function (item) { return item[0] === hash; })) { activeView = hash; render(); } });
  applyTheme();
  render();
  ensureThemeControl();
})();
