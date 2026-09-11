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
  var colors = ['#6366f1', '#10b981', '#06b6d4', '#f59e0b', '#f43f5e', '#8b5cf6'];

  /* ==========================================================================
     SVG ICON SYSTEM (LUCIDE / ONLOOK MODERN FINTECH ICONS)
     ========================================================================== */
  function svgIcon(name, size) {
    var s = size || 18;
    var icons = {
      'dashboard': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1.5"/><rect width="7" height="5" x="14" y="3" rx="1.5"/><rect width="7" height="9" x="14" y="12" rx="1.5"/><rect width="7" height="5" x="3" y="16" rx="1.5"/></svg>',
      'transactions': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>',
      'planning': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
      'accounts': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2.5"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
      'reports': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
      'openfinance': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
      'more': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
      'plus': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
      'income': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10"/><path d="M17 7v10H7"/></svg>',
      'expense': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>',
      'transfer': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>',
      'wallet': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-8 5H6a2 2 0 0 1-2-2V7"/></svg>',
      'sun': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
      'moon': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
      'trash': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
      'edit': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
      'close': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
      'check': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      'arrow-right': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
      'menu': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
      'credit-card': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
      'trending-up': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
      'trending-down': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
      'bell': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>'
    };
    return icons[name] || icons['dashboard'];
  }

  /* ==========================================================================
     HELPERS & UTILS
     ========================================================================== */
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

  /* ==========================================================================
     STATE MANAGEMENT & MIGRATIONS
     ========================================================================== */
  function defaultState() {
    var date = todayISO();
    var month = currentMonth();
    return {
      version: 3,
      selectedMonth: month,
      accounts: [
        { id: 'account-main', name: 'Conta principal', institution: 'Nubank', type: 'Conta corrente', openingBalance: 4250.80, color: '#10b981' },
        { id: 'account-wallet', name: 'Reserva de Emergência', institution: 'Tesouro Selic', type: 'Investimento', openingBalance: 12500.00, color: '#6366f1' }
      ],
      cards: [
        { id: 'card-nubank', name: 'Nubank Ultravioleta', brand: 'Mastercard', limit: 8000, closingDay: 25, dueDay: 7, color: '#6366f1' },
        { id: 'card-ouro', name: 'XP Infinite', brand: 'Visa', limit: 15000, closingDay: 12, dueDay: 18, color: '#06b6d4' }
      ],
      categories: [
        { id: 'cat-home', name: 'Moradia & Contas', parentId: '', color: '#06b6d4' },
        { id: 'cat-food', name: 'Alimentação & Mercado', parentId: '', color: '#10b981' },
        { id: 'cat-transport', name: 'Transporte & Mobilidade', parentId: '', color: '#f59e0b' },
        { id: 'cat-leisure', name: 'Lazer & Entretenimento', parentId: '', color: '#f43f5e' },
        { id: 'cat-health', name: 'Saúde & Bem-estar', parentId: '', color: '#8b5cf6' },
        { id: 'cat-salary', name: 'Rendimentos & Salário', parentId: '', color: '#10b981' }
      ],
      budgets: [
        { id: 'b-1', month: month, categoryId: 'cat-food', amount: 1400 },
        { id: 'b-2', month: month, categoryId: 'cat-home', amount: 1800 },
        { id: 'b-3', month: month, categoryId: 'cat-transport', amount: 600 }
      ],
      goals: [
        { id: 'g-1', name: 'Reserva de Emergência', target: 20000, saved: 12500, dueDate: addMonths(date, 6), color: '#10b981' },
        { id: 'g-2', name: 'Viagem de Férias', target: 6000, saved: 3200, dueDate: addMonths(date, 9), color: '#06b6d4' }
      ],
      bills: [
        { id: 'bill-1', description: 'Condomínio e Energia', amount: 680, dueDate: month + '-10', categoryId: 'cat-home', status: 'open', recurring: true },
        { id: 'bill-2', description: 'Internet Fibra 600MB', amount: 149.90, dueDate: month + '-15', categoryId: 'cat-home', status: 'open', recurring: true }
      ],
      connections: [],
      transactions: [
        { id: 't-1', date: month + '-01', description: 'Salário Mensal', type: 'income', amount: 8500.00, accountId: 'account-main', categoryId: 'cat-salary', status: 'paid', recurring: true, tags: ['fixo'] },
        { id: 't-2', date: month + '-03', description: 'Supermercado Pão de Açúcar', type: 'expense', amount: 489.30, cardId: 'card-nubank', categoryId: 'cat-food', status: 'paid', tags: ['essencial'] },
        { id: 't-3', date: month + '-05', description: 'Posto Shell Combustível', type: 'expense', amount: 180.00, cardId: 'card-nubank', categoryId: 'cat-transport', status: 'paid', tags: [] },
        { id: 't-4', date: month + '-08', description: 'Restaurante & Almoço', type: 'expense', amount: 145.50, accountId: 'account-main', categoryId: 'cat-food', status: 'paid', tags: ['lazer'] },
        { id: 't-5', date: month + '-09', description: 'Farmácia Droga Raia', type: 'expense', amount: 89.90, accountId: 'account-main', categoryId: 'cat-health', status: 'paid', tags: [] }
      ]
    };
  }

  function migrateLegacy() {
    var raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    try {
      var old = JSON.parse(raw);
      var current = defaultState();
      current.accounts[0].openingBalance = old.balance || current.accounts[0].openingBalance;
      if (Array.isArray(old.transactions)) {
        current.transactions = old.transactions.map(function (item) {
          return {
            id: item.id || uid('tx'),
            date: item.date || todayISO(),
            description: item.title || item.description || 'Lançamento importado',
            type: item.type === 'entrada' ? 'income' : 'expense',
            amount: Number(item.amount || 0),
            accountId: 'account-main',
            categoryId: '',
            status: 'paid',
            tags: ['legado']
          };
        });
      }
      return current;
    } catch (e) {
      return null;
    }
  }

  function normalize(value) {
    var base = defaultState();
    if (!value || typeof value !== 'object') return base;
    base.accounts = Array.isArray(value.accounts) && value.accounts.length ? value.accounts : base.accounts;
    base.cards = Array.isArray(value.cards) ? value.cards : base.cards;
    base.categories = Array.isArray(value.categories) && value.categories.length ? value.categories : base.categories;
    base.budgets = Array.isArray(value.budgets) ? value.budgets : base.budgets;
    base.goals = Array.isArray(value.goals) ? value.goals : base.goals;
    base.bills = Array.isArray(value.bills) ? value.bills : base.bills;
    base.connections = Array.isArray(value.connections) ? value.connections : [];
    base.transactions = Array.isArray(value.transactions) ? value.transactions : base.transactions;
    base.selectedMonth = typeof value.selectedMonth === 'string' && value.selectedMonth ? value.selectedMonth : currentMonth();
    return base;
  }

  function loadState() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      var migrated = migrateLegacy();
      if (migrated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
      var created = defaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(created));
      return created;
    }
    try {
      return normalize(JSON.parse(raw));
    } catch (e) {
      return defaultState();
    }
  }

  var state = loadState();
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  /* ==========================================================================
     THEME CONTROL (LIGHT & DARK WITH SMOOTH TRANSITION & ZERO FLASH)
     ========================================================================== */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.getElementById('theme-color-meta') || document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F8FAFC' : '#090D16');
  }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, theme);
    applyTheme();
    render();
    showToast(theme === 'light' ? 'Modo Claro ativado' : 'Modo Escuro ativado');
  }

  /* ==========================================================================
     FINANCIAL DOMAIN CALCULATIONS
     ========================================================================== */
  function categoryById(id) { return state.categories.find(function (item) { return item.id === id; }); }
  function accountById(id) { return state.accounts.find(function (item) { return item.id === id; }); }
  function cardById(id) { return state.cards.find(function (item) { return item.id === id; }); }
  function monthTransactions(month) { return state.transactions.filter(function (item) { return String(item.date || '').slice(0, 7) === month; }); }

  function displayCategory(transaction) {
    if (transaction.categoryId) {
      var cat = categoryById(transaction.categoryId);
      if (cat) return cat.name;
    }
    return transaction.type === 'transfer' ? 'Transferência' : 'Geral';
  }

  function categoryExpense(month, categoryId) {
    return monthTransactions(month).reduce(function (total, item) {
      if (item.type === 'expense' && item.categoryId === categoryId) {
        return total + Number(item.amount || 0);
      }
      return total;
    }, 0);
  }

  function accountBalance(accountId) {
    var account = accountById(accountId);
    var total = account ? Number(account.openingBalance || 0) : 0;
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
    return monthTransactions(month).reduce(function (total, item) {
      if (item.cardId !== cardId) return total;
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

  function navItems() {
    return [
      ['dashboard', 'dashboard', 'Visão Geral'],
      ['transactions', 'transactions', 'Transações'],
      ['planning', 'planning', 'Planejamento'],
      ['accounts', 'accounts', 'Contas e Cartões'],
      ['reports', 'reports', 'Relatórios'],
      ['openfinance', 'openfinance', 'Open Finance'],
      ['more', 'more', 'Configurações']
    ];
  }

  /* ==========================================================================
     MODERN RENDERERS (COMPONENTS & SECTIONS)
     ========================================================================== */
  function renderSidebar() {
    return '<aside class="sidebar" id="sidebar">' +
      '<div class="brand">' +
        '<div class="brand-mark">' + svgIcon('plus', 20) + '</div>' +
        '<div class="brand-info">' +
          '<div class="brand-name">Todo Controle</div>' +
          '<div class="brand-badge">Fintech Pro</div>' +
        '</div>' +
      '</div>' +
      '<div class="side-nav-group">' +
        '<p class="side-label">Navegação</p>' +
        navItems().map(function (item) {
          var active = activeView === item[0] ? ' active' : '';
          return '<button class="nav-item' + active + '" data-view="' + item[0] + '">' +
            '<span class="nav-icon">' + svgIcon(item[1], 18) + '</span>' +
            '<span>' + item[2] + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<div class="sidebar-footer">' +
        '<div class="privacy-badge">' +
          '<span class="privacy-dot"></span>' +
          '<span>Armazenamento local seguro</span>' +
        '</div>' +
        '<div class="user-snippet">' +
          '<div class="user-avatar">TC</div>' +
          '<div class="user-meta">' +
            '<strong>Minha Carteira</strong>' +
            '<span style="color:var(--text-muted)">v3.2 · Local-first</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</aside>';
  }

  function renderMobileNav() {
    var items = navItems().slice(0, 5);
    return '<nav class="mobile-nav">' + items.map(function (item) {
      var active = activeView === item[0] ? ' active' : '';
      return '<button class="' + active + '" data-view="' + item[0] + '">' +
        '<span class="nav-icon">' + svgIcon(item[1], 20) + '</span>' +
        '<span>' + item[2].split(' ')[0] + '</span>' +
      '</button>';
    }).join('') + '</nav>';
  }

  function monthOptions() {
    var values = [];
    for (var i = -2; i <= 3; i += 1) values.push(addMonths(state.selectedMonth + '-01', i).slice(0, 7));
    return values.map(function (month) {
      return '<option value="' + month + '"' + selected(month === state.selectedMonth) + '>' + monthLabel(month) + '</option>';
    }).join('');
  }

  function renderTopbar(title, subtitle) {
    var isDark = theme === 'dark';
    return '<header class="topbar">' +
      '<div class="topbar-header">' +
        '<h1>' + esc(title) + '</h1>' +
        '<p>' + esc(subtitle || monthLabel(state.selectedMonth)) + '</p>' +
      '</div>' +
      '<div class="topbar-actions">' +
        '<button class="theme-toggle-button" data-action="toggle-theme" title="Alternar tema claro/escuro" aria-label="Alternar tema">' +
          svgIcon(isDark ? 'sun' : 'moon', 16) +
          '<span>' + (isDark ? 'Claro' : 'Escuro') + '</span>' +
        '</button>' +
        '<select class="month-select" id="month-picker" aria-label="Mês de referência">' +
          monthOptions() +
        '</select>' +
        '<button class="button primary" data-action="quick-add">' +
          svgIcon('plus', 16) +
          '<span>Novo Lançamento</span>' +
        '</button>' +
      '</div>' +
    '</header>';
  }

  function accountMarkup(account) {
    return '<div class="account-row">' +
      '<div class="account-main">' +
        '<span class="account-badge" style="background:' + esc(account.color || '#10b981') + '">' +
          esc(account.name.slice(0, 1).toUpperCase()) +
        '</span>' +
        '<div>' +
          '<strong>' + esc(account.name) + '</strong>' +
          '<span>' + esc(account.institution || account.type || 'Conta') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="row-value">' +
        '<strong>' + money(accountBalance(account.id)) + '</strong>' +
        '<span>saldo disponível</span>' +
      '</div>' +
    '</div>';
  }

  function cardMarkup(card) {
    var bill = cardBill(card.id, state.selectedMonth);
    var percentage = card.limit ? clamp(bill / card.limit * 100, 0, 100) : 0;
    return '<div class="card-row" style="display:flex; flex-direction:column; align-items:stretch">' +
      '<div style="display:flex; align-items:center; justify-content:space-between; width:100%">' +
        '<div class="card-main">' +
          '<span class="card-badge" style="background:' + esc(card.color || '#6366f1') + '">' +
            svgIcon('credit-card', 18) +
          '</span>' +
          '<div>' +
            '<strong>' + esc(card.name) + '</strong>' +
            '<span>' + esc(card.brand || 'Cartão') + ' · vence dia ' + esc(card.dueDay || '-') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="row-value">' +
          '<strong class="' + (bill > card.limit ? 'negative' : '') + '">' + money(bill) + '</strong>' +
          '<span>fatura atual</span>' +
        '</div>' +
      '</div>' +
      '<div class="progress ' + (percentage > 85 ? 'red' : 'indigo') + '" style="margin-top:12px">' +
        '<span style="width:' + percentage + '%"></span>' +
      '</div>' +
      '<div class="budget-meta" style="margin-top:6px">' +
        '<span>Limite: ' + money(card.limit) + '</span>' +
        '<span>' + Math.round(percentage) + '% utilizado</span>' +
      '</div>' +
    '</div>';
  }

  function transactionMarkup(transaction, withActions) {
    var isIncome = transaction.type === 'income';
    var isTransfer = transaction.type === 'transfer';
    var owner = transaction.cardId ? cardById(transaction.cardId) : accountById(transaction.accountId);
    var iconName = isIncome ? 'income' : isTransfer ? 'transfer' : 'expense';
    var iconClass = isIncome ? 'income' : isTransfer ? 'transfer' : 'expense';
    var amountClass = isIncome ? 'positive' : isTransfer ? 'accent' : 'negative';
    var amountPrefix = isIncome ? '+ ' : isTransfer ? '' : '- ';

    return '<div class="transaction-row">' +
      '<div class="transaction-description">' +
        '<span class="transaction-icon ' + iconClass + '">' + svgIcon(iconName, 18) + '</span>' +
        '<div class="transaction-text">' +
          '<strong>' + esc(transaction.description) + '</strong>' +
          '<div class="transaction-meta">' +
            '<span class="transaction-tag">' + esc(displayCategory(transaction)) + '</span>' +
            (owner ? '<span>· ' + esc(owner.name) + '</span>' : '') +
            (transaction.recurring ? '<span>· Recorrente</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<span class="transaction-secondary" style="font-weight:500; font-size:12.5px">' + dateBR(transaction.date) + '</span>' +
      '<div>' +
        (transaction.status === 'pending'
          ? '<span class="status">Pendente</span>'
          : (transaction.installments ? '<span class="transaction-tag">' + transaction.installmentNumber + '/' + transaction.installments + 'x</span>' : '<span style="color:var(--text-muted); font-size:12px">Confirmado</span>')) +
      '</div>' +
      '<div class="transaction-amount ' + amountClass + '">' +
        amountPrefix + money(transaction.amount) +
      '</div>' +
      (withActions
        ? '<div class="transaction-actions">' +
            '<button class="icon-button" title="Editar lançamento" aria-label="Editar lançamento" data-action="edit-transaction" data-id="' + transaction.id + '">' +
              svgIcon('edit', 15) +
            '</button>' +
            '<button class="icon-button danger" title="Excluir lançamento" aria-label="Excluir lançamento" data-action="delete-transaction" data-id="' + transaction.id + '">' +
              svgIcon('trash', 15) +
            '</button>' +
          '</div>'
        : '') +
    '</div>';
  }

  function categorySummary(month) {
    return state.categories.filter(function (category) { return !category.parentId; }).map(function (category) {
      return { category: category, amount: categoryExpense(month, category.id) };
    }).filter(function (row) { return row.amount > 0; }).sort(function (a, b) { return b.amount - a.amount; });
  }

  /* ==========================================================================
     VIEWS
     ========================================================================== */
  function renderDashboard() {
    var data = summary(state.selectedMonth);
    var categories = categorySummary(state.selectedMonth);
    var totalCategory = categories.reduce(function (sum, row) { return sum + row.amount; }, 0) || 1;
    var angle = 0;
    var stops = categories.map(function (row, index) {
      var start = angle;
      angle += row.amount / totalCategory * 360;
      return (row.category.color || colors[index % colors.length]) + ' ' + start + 'deg ' + angle + 'deg';
    });
    if (!stops.length) stops = ['var(--panel-3) 0deg 360deg'];

    var recent = data.transactions.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 6);

    return renderTopbar('Visão Geral', 'Resumo consolidado do seu mês financeiro') +
      '<div class="content">' +
        '<div class="grid summary-grid">' +
          '<div class="card summary-card net-balance">' +
            '<div class="summary-card-header">' +
              '<span class="label">Saldo Consolidado</span>' +
              '<span class="summary-card-badge">' + svgIcon('wallet', 16) + '</span>' +
            '</div>' +
            '<div class="value ' + (data.balance < 0 ? 'negative' : 'positive') + '">' + money(data.balance) + '</div>' +
            '<div class="helper">' + svgIcon('check', 13) + ' Total em contas e reservas</div>' +
          '</div>' +
          '<div class="card summary-card income">' +
            '<div class="summary-card-header">' +
              '<span class="label">Receitas do Mês</span>' +
              '<span class="summary-card-badge" style="color:var(--green)">' + svgIcon('trending-up', 16) + '</span>' +
            '</div>' +
            '<div class="value positive">' + money(data.income) + '</div>' +
            '<div class="helper">' + svgIcon('income', 13) + ' Total de entradas</div>' +
          '</div>' +
          '<div class="card summary-card expense">' +
            '<div class="summary-card-header">' +
              '<span class="label">Despesas do Mês</span>' +
              '<span class="summary-card-badge" style="color:var(--red)">' + svgIcon('trending-down', 16) + '</span>' +
            '</div>' +
            '<div class="value negative">' + money(data.expense) + '</div>' +
            '<div class="helper">' + svgIcon('expense', 13) + ' Total de saídas</div>' +
          '</div>' +
          '<div class="card summary-card limit">' +
            '<div class="summary-card-header">' +
              '<span class="label">Balanço do Mês</span>' +
              '<span class="summary-card-badge" style="color:var(--teal)">' + svgIcon('planning', 16) + '</span>' +
            '</div>' +
            '<div class="value ' + (data.monthly < 0 ? 'negative' : 'positive') + '">' + money(data.monthly) + '</div>' +
            '<div class="helper">' + data.transactions.length + ' lançamentos registrados</div>' +
          '</div>' +
        '</div>' +

        '<div class="grid alert-grid" style="margin-bottom:24px">' +
          '<div class="alert-card">' +
            '<span class="alert-icon">' + svgIcon('expense', 18) + '</span>' +
            '<div>' +
              '<strong>' + money(data.pending) + '</strong>' +
              '<span>Lançamentos pendentes de confirmação</span>' +
            '</div>' +
          '</div>' +
          '<div class="alert-card">' +
            '<span class="alert-icon teal">' + svgIcon('bell', 18) + '</span>' +
            '<div>' +
              '<strong>' + money(data.openBills) + '</strong>' +
              '<span>Contas a pagar neste mês</span>' +
            '</div>' +
          '</div>' +
          '<div class="alert-card">' +
            '<span class="alert-icon yellow">' + svgIcon('credit-card', 18) + '</span>' +
            '<div>' +
              '<strong>' + state.cards.filter(function (card) { return cardBill(card.id, state.selectedMonth) > 0; }).length + ' cartões ativos</strong>' +
              '<span>Faturas com lançamentos no período</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="grid two-column" style="margin-bottom:24px">' +
          '<section class="card section">' +
            '<div class="section-heading">' +
              '<div>' +
                '<h2>Contas e Saldos</h2>' +
                '<p>Patrimônio distribuído por instituição</p>' +
              '</div>' +
              '<button class="button small outline" data-view="accounts">Ver todas ' + svgIcon('arrow-right', 13) + '</button>' +
            '</div>' +
            '<div class="account-list">' +
              state.accounts.slice(0, 4).map(accountMarkup).join('') +
            '</div>' +
          '</section>' +

          '<section class="card section">' +
            '<div class="section-heading">' +
              '<div>' +
                '<h2>Cartões de Crédito</h2>' +
                '<p>Faturas e utilização do limite</p>' +
              '</div>' +
              '<button class="button small outline" data-view="accounts">Gerenciar ' + svgIcon('arrow-right', 13) + '</button>' +
            '</div>' +
            '<div class="card-list">' +
              state.cards.slice(0, 4).map(cardMarkup).join('') +
            '</div>' +
          '</section>' +
        '</div>' +

        '<div class="grid two-column" style="margin-bottom:24px">' +
          '<section class="card section">' +
            '<div class="section-heading">' +
              '<div>' +
                '<h2>Despesas por Categoria</h2>' +
                '<p>Distribuição percentual dos gastos</p>' +
              '</div>' +
              '<button class="button small outline" data-view="reports">Relatório ' + svgIcon('arrow-right', 13) + '</button>' +
            '</div>' +
            '<div class="category-layout">' +
              '<div class="donut" style="background:conic-gradient(' + stops.join(',') + ')"></div>' +
              '<div class="legend">' +
                (categories.length ? categories.slice(0, 6).map(function (row) {
                  return '<div class="legend-row">' +
                    '<span class="legend-label">' +
                      '<i class="legend-dot" style="background:' + esc(row.category.color) + '"></i>' +
                      esc(row.category.name) +
                    '</span>' +
                    '<strong style="font-weight:600">' + money(row.amount) + '</strong>' +
                  '</div>';
                }).join('') : '<div class="empty">Sem despesas registradas neste mês.</div>') +
              '</div>' +
            '</div>' +
          '</section>' +

          '<section class="card section">' +
            '<div class="section-heading">' +
              '<div>' +
                '<h2>Orçamento Mensal</h2>' +
                '<p>Controle de teto de gastos</p>' +
              '</div>' +
              '<button class="button small secondary" data-action="open-budget">' + svgIcon('plus', 14) + ' Orçamento</button>' +
            '</div>' +
            '<div class="budget-list">' +
              (state.budgets.filter(function (budget) { return budget.month === state.selectedMonth; }).length
                ? state.budgets.filter(function (budget) { return budget.month === state.selectedMonth; }).slice(0, 5).map(function (budget) {
                    var category = categoryById(budget.categoryId);
                    var used = categoryExpense(state.selectedMonth, budget.categoryId);
                    var pct = budget.amount ? clamp(used / budget.amount * 100, 0, 100) : 0;
                    return '<div class="budget-row">' +
                      '<div class="budget-row-top">' +
                        '<strong>' + esc(category ? category.name : 'Sem categoria') + '</strong>' +
                        '<span>' + money(used) + ' / ' + money(budget.amount) + '</span>' +
                      '</div>' +
                      '<div class="progress ' + (pct >= 100 ? 'red' : 'indigo') + '">' +
                        '<span style="width:' + pct + '%"></span>' +
                      '</div>' +
                      '<div class="budget-meta">' +
                        '<span>' + Math.round(pct) + '% consumido</span>' +
                        '<span>' + money(Math.max(0, budget.amount - used)) + ' restante</span>' +
                      '</div>' +
                    '</div>';
                  }).join('')
                : '<div class="empty">Defina seu primeiro orçamento do mês.</div>') +
            '</div>' +
          '</section>' +
        '</div>' +

        '<section class="card section">' +
          '<div class="section-heading">' +
            '<div>' +
              '<h2>Movimentações Recentes</h2>' +
              '<p>Últimos registros de ' + esc(monthLabel(state.selectedMonth)) + '</p>' +
            '</div>' +
            '<div class="actions">' +
              '<button class="button small secondary" data-action="quick-add">' + svgIcon('plus', 14) + ' Lançamento</button>' +
              '<button class="button small outline" data-view="transactions">Ver todas ' + svgIcon('arrow-right', 13) + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="transaction-list">' +
            (recent.length
              ? recent.map(function (item) { return transactionMarkup(item, false); }).join('')
              : '<div class="empty">Nenhum lançamento cadastrado neste mês.</div>') +
          '</div>' +
        '</section>' +
      '</div>';
  }

  function renderTransactions() {
    var transactions = monthTransactions(state.selectedMonth).filter(function (item) {
      var text = (item.description + ' ' + displayCategory(item)).toLowerCase();
      var filterMatch = activeFilter === 'all' || activeFilter === item.type || (activeFilter === 'pending' && item.status === 'pending');
      return filterMatch && text.indexOf(searchTerm.toLowerCase()) >= 0;
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });

    return renderTopbar('Transações', 'Controle analítico de cada movimentação financeira') +
      '<div class="content">' +
        '<section class="card section">' +
          '<div class="section-heading">' +
            '<div>' +
              '<h2>Extrato de Lançamentos</h2>' +
              '<p>' + transactions.length + ' resultados encontrados em ' + esc(monthLabel(state.selectedMonth)) + '</p>' +
            '</div>' +
            '<button class="button primary" data-action="quick-add">' + svgIcon('plus', 16) + ' Novo Lançamento</button>' +
          '</div>' +
          '<div class="filter-bar">' +
            '<input class="search" id="transaction-search" value="' + esc(searchTerm) + '" placeholder="Buscar por descrição ou categoria..." aria-label="Buscar lançamentos" />' +
            '<button class="filter-chip' + (activeFilter === 'all' ? ' active' : '') + '" data-filter="all">Todos</button>' +
            '<button class="filter-chip' + (activeFilter === 'expense' ? ' active' : '') + '" data-filter="expense">Despesas</button>' +
            '<button class="filter-chip' + (activeFilter === 'income' ? ' active' : '') + '" data-filter="income">Receitas</button>' +
            '<button class="filter-chip' + (activeFilter === 'pending' ? ' active' : '') + '" data-filter="pending">Pendentes</button>' +
          '</div>' +
          '<div class="transaction-list">' +
            (transactions.length
              ? transactions.map(function (item) { return transactionMarkup(item, true); }).join('')
              : '<div class="empty">Nenhum lançamento encontrado para os filtros selecionados.</div>') +
          '</div>' +
        '</section>' +
      '</div>';
  }

  function renderPlanning() {
    var budgets = state.budgets.filter(function (item) { return item.month === state.selectedMonth; });
    var bills = state.bills.filter(function (item) { return String(item.dueDate || '').slice(0, 7) === state.selectedMonth; }).sort(function (a, b) { return a.dueDate.localeCompare(b.dueDate); });
    var recurring = state.transactions.filter(function (item) { return item.recurring; }).slice(0, 6);

    return renderTopbar('Planejamento', 'Defina metas e orçamentos para manter a disciplina financeira') +
      '<div class="content">' +
        '<div class="grid two-column" style="margin-bottom:24px">' +
          '<section class="card section">' +
            '<div class="section-heading">' +
              '<div>' +
                '<h2>Orçamento por Categoria</h2>' +
                '<p>Teto planejado para ' + esc(monthLabel(state.selectedMonth)) + '</p>' +
              '</div>' +
              '<button class="button primary small" data-action="open-budget">' + svgIcon('plus', 14) + ' Novo Limite</button>' +
            '</div>' +
            '<div class="budget-list">' +
              (budgets.length ? budgets.map(function (budget) {
                var cat = categoryById(budget.categoryId);
                var spent = categoryExpense(state.selectedMonth, budget.categoryId);
                var pct = budget.amount ? spent / budget.amount * 100 : 0;
                return '<div class="budget-row">' +
                  '<div class="budget-row-top">' +
                    '<strong>' + esc(cat ? cat.name : 'Sem categoria') + '</strong>' +
                    '<span>' + money(spent) + ' / ' + money(budget.amount) + '</span>' +
                  '</div>' +
                  '<div class="progress ' + (pct > 100 ? 'red' : 'indigo') + '">' +
                    '<span style="width:' + clamp(pct, 0, 100) + '%"></span>' +
                  '</div>' +
                  '<div class="budget-meta">' +
                    '<span>' + (pct > 100 ? 'Acima do limite previsto' : Math.round(pct) + '% utilizado') + '</span>' +
                    '<button class="icon-button danger" data-action="delete-budget" data-id="' + budget.id + '" aria-label="Excluir orçamento">' +
                      svgIcon('trash', 14) +
                    '</button>' +
                  '</div>' +
                '</div>';
              }).join('') : '<div class="empty">Nenhum limite estipulado para este mês.</div>') +
            '</div>' +
          '</section>' +

          '<section class="card section">' +
            '<div class="section-heading">' +
              '<div>' +
                '<h2>Metas e Sonhos</h2>' +
                '<p>Acompanhamento de objetivos patrimoniais</p>' +
              '</div>' +
              '<button class="button secondary small" data-action="open-goal">' + svgIcon('plus', 14) + ' Nova Meta</button>' +
            '</div>' +
            '<div class="goal-list">' +
              (state.goals.length ? state.goals.map(function (goal) {
                var pct = goal.target ? clamp(goal.saved / goal.target * 100, 0, 100) : 0;
                return '<div class="goal-row" style="display:flex; flex-direction:column; align-items:stretch">' +
                  '<div class="budget-row-top">' +
                    '<strong>' + esc(goal.name) + '</strong>' +
                    '<span>' + money(goal.saved) + ' / ' + money(goal.target) + '</span>' +
                  '</div>' +
                  '<div class="progress teal">' +
                    '<span style="width:' + pct + '%"></span>' +
                  '</div>' +
                  '<div class="budget-meta">' +
                    '<span>' + Math.round(pct) + '% acumulado</span>' +
                    '<span>Prazo: ' + dateBR(goal.dueDate) + '</span>' +
                  '</div>' +
                '</div>';
              }).join('') : '<div class="empty">Cadastre sua primeira meta financeira.</div>') +
            '</div>' +
          '</section>' +
        '</div>' +

        '<section class="card section" style="margin-bottom:24px">' +
          '<div class="section-heading">' +
            '<div>' +
              '<h2>Contas a Pagar e Receber</h2>' +
              '<p>Agenda financeira com vencimentos no mês</p>' +
            '</div>' +
            '<button class="button small outline" data-action="open-bill">' + svgIcon('plus', 14) + ' Agendar Conta</button>' +
          '</div>' +
          '<div class="table-wrap">' +
            '<table class="data-table">' +
              '<thead><tr><th>Descrição</th><th>Vencimento</th><th>Categoria</th><th>Valor</th><th>Status</th><th>Ação</th></tr></thead>' +
              '<tbody>' +
                (bills.length ? bills.map(function (bill) {
                  var cat = categoryById(bill.categoryId);
                  return '<tr>' +
                    '<td><strong>' + esc(bill.description) + '</strong></td>' +
                    '<td>' + dateBR(bill.dueDate) + '</td>' +
                    '<td><span class="transaction-tag">' + esc(cat ? cat.name : 'Geral') + '</span></td>' +
                    '<td class="' + (bill.status === 'paid' ? 'positive' : 'negative') + '"><strong>' + money(bill.amount) + '</strong></td>' +
                    '<td>' + (bill.status === 'paid' ? '<span class="status" style="color:var(--green)">Pago</span>' : '<span class="status">Aberto</span>') + '</td>' +
                    '<td><button class="button small outline" data-action="toggle-bill" data-id="' + bill.id + '">' + (bill.status === 'paid' ? 'Reabrir' : 'Marcar Pago') + '</button></td>' +
                  '</tr>';
                }).join('') : '<tr><td colspan="6" class="empty">Nenhuma conta agendada para este mês.</td></tr>') +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</section>' +

        '<section class="card section">' +
          '<div class="section-heading">' +
            '<div>' +
              '<h2>Despesas Recorrentes</h2>' +
              '<p>Assinaturas e custos fixos contínuos</p>' +
            '</div>' +
            '<button class="button small outline" data-view="transactions">Gerenciar ' + svgIcon('arrow-right', 13) + '</button>' +
          '</div>' +
          '<div class="transaction-list">' +
            (recurring.length ? recurring.map(function (item) { return transactionMarkup(item, false); }).join('') : '<div class="empty">Nenhuma recorrência ativa.</div>') +
          '</div>' +
        '</section>' +
      '</div>';
  }

  function renderAccounts() {
    return renderTopbar('Contas e Cartões', 'Separe e controle seus saldos, investimentos e faturas') +
      '<div class="content">' +
        '<div class="grid two-column" style="margin-bottom:24px">' +
          '<section class="card section">' +
            '<div class="section-heading">' +
              '<div>' +
                '<h2>Instituições e Carteiras</h2>' +
                '<p>' + state.accounts.length + ' contas monitoradas</p>' +
              '</div>' +
              '<button class="button primary small" data-action="open-account">' + svgIcon('plus', 14) + ' Nova Conta</button>' +
            '</div>' +
            '<div class="account-list">' +
              state.accounts.map(accountMarkup).join('') +
            '</div>' +
          '</section>' +

          '<section class="card section">' +
            '<div class="section-heading">' +
              '<div>' +
                '<h2>Cartões de Crédito</h2>' +
                '<p>Faturas e datas de corte</p>' +
              '</div>' +
              '<button class="button primary small" data-action="open-card">' + svgIcon('plus', 14) + ' Novo Cartão</button>' +
            '</div>' +
            '<div class="card-list">' +
              state.cards.map(function (card) {
                var bill = cardBill(card.id, state.selectedMonth);
                var pct = card.limit ? clamp(bill / card.limit * 100, 0, 100) : 0;
                return '<div class="card-row" style="display:flex; flex-direction:column; align-items:stretch">' +
                  '<div style="display:flex; align-items:center; justify-content:space-between; width:100%">' +
                    '<div class="card-main">' +
                      '<span class="card-badge" style="background:' + esc(card.color || '#6366f1') + '">' + svgIcon('credit-card', 18) + '</span>' +
                      '<div>' +
                        '<strong>' + esc(card.name) + '</strong>' +
                        '<span>' + esc(card.brand || 'Cartão') + ' · Fecha dia ' + esc(card.closingDay || '-') + ' · Vence dia ' + esc(card.dueDay || '-') + '</span>' +
                      '</div>' +
                    '</div>' +
                    '<div class="row-value">' +
                      '<strong class="' + (bill > card.limit ? 'negative' : '') + '">' + money(bill) + '</strong>' +
                      '<span>fatura atual</span>' +
                    '</div>' +
                  '</div>' +
                  '<div class="progress ' + (pct > 80 ? 'red' : 'indigo') + '" style="margin-top:12px">' +
                    '<span style="width:' + pct + '%"></span>' +
                  '</div>' +
                  '<div class="budget-meta" style="margin-top:8px">' +
                    '<span>Limite: ' + money(card.limit) + ' (' + Math.round(pct) + '% usado)</span>' +
                    '<button class="button small secondary" data-action="pay-card" data-id="' + card.id + '">Pagar Fatura</button>' +
                  '</div>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</section>' +
        '</div>' +

        '<section class="card section">' +
          '<div class="section-heading">' +
            '<div>' +
              '<h2>Quadro Consolidado de Faturas</h2>' +
              '<p>Posição em ' + esc(monthLabel(state.selectedMonth)) + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="table-wrap">' +
            '<table class="data-table">' +
              '<thead><tr><th>Cartão</th><th>Fechamento</th><th>Vencimento</th><th>Fatura Atual</th><th>Limite Disponível</th></tr></thead>' +
              '<tbody>' +
                state.cards.map(function (card) {
                  var bill = cardBill(card.id, state.selectedMonth);
                  return '<tr>' +
                    '<td><strong>' + esc(card.name) + '</strong></td>' +
                    '<td>Dia ' + esc(card.closingDay) + '</td>' +
                    '<td>Dia ' + esc(card.dueDay) + '</td>' +
                    '<td class="negative"><strong>' + money(bill) + '</strong></td>' +
                    '<td class="positive"><strong>' + money(Math.max(0, card.limit - bill)) + '</strong></td>' +
                  '</tr>';
                }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</section>' +
      '</div>';
  }

  function renderReports() {
    var data = summary(state.selectedMonth);
    var categories = categorySummary(state.selectedMonth);
    var max = categories.length ? categories[0].amount : 1;
    var previousMonth = addMonths(state.selectedMonth + '-01', -1).slice(0, 7);
    var previous = summary(previousMonth);

    return renderTopbar('Relatórios & Analytics', 'Métricas detalhadas para guiar suas decisões') +
      '<div class="content">' +
        '<div class="grid summary-grid">' +
          '<div class="card summary-card expense">' +
            '<div class="summary-card-header">' +
              '<span class="label">Média Diária de Gastos</span>' +
              '<span class="summary-card-badge" style="color:var(--red)">' + svgIcon('trending-down', 16) + '</span>' +
            '</div>' +
            '<div class="value negative">' + money(data.expense / Math.max(new Date().getDate(), 1)) + '</div>' +
            '<div class="helper">Ritmo médio diário no mês</div>' +
          '</div>' +
          '<div class="card summary-card income">' +
            '<div class="summary-card-header">' +
              '<span class="label">Comparativo com Anterior</span>' +
              '<span class="summary-card-badge" style="color:var(--green)">' + svgIcon('reports', 16) + '</span>' +
            '</div>' +
            '<div class="value ' + (data.expense <= previous.expense ? 'positive' : 'negative') + '">' +
              (previous.expense ? Math.round((data.expense / previous.expense - 1) * 100) + '%' : '—') +
            '</div>' +
            '<div class="helper">vs. ' + monthLabel(previousMonth) + '</div>' +
          '</div>' +
          '<div class="card summary-card limit">' +
            '<div class="summary-card-header">' +
              '<span class="label">Maior Centro de Custo</span>' +
              '<span class="summary-card-badge" style="color:var(--indigo)">' + svgIcon('planning', 16) + '</span>' +
            '</div>' +
            '<div class="value" style="font-size:20px">' + esc(categories[0] ? categories[0].category.name : '—') + '</div>' +
            '<div class="helper">' + (categories[0] ? money(categories[0].amount) : 'Sem registros') + '</div>' +
          '</div>' +
          '<div class="card summary-card net-balance">' +
            '<div class="summary-card-header">' +
              '<span class="label">Taxa de Poupança</span>' +
              '<span class="summary-card-badge" style="color:var(--teal)">' + svgIcon('wallet', 16) + '</span>' +
            '</div>' +
            '<div class="value ' + (data.income && data.monthly >= 0 ? 'positive' : 'negative') + '">' +
              (data.income ? Math.round(data.monthly / data.income * 100) + '%' : '—') +
            '</div>' +
            '<div class="helper">Proporção retida da receita</div>' +
          '</div>' +
        '</div>' +

        '<div class="grid two-column" style="margin-bottom:24px">' +
          '<section class="card section">' +
            '<div class="section-heading">' +
              '<div>' +
                '<h2>Ranking de Despesas por Categoria</h2>' +
                '<p>Detalhamento em ' + esc(monthLabel(state.selectedMonth)) + '</p>' +
              '</div>' +
              '<button class="button small secondary" data-action="export-csv">Exportar CSV</button>' +
            '</div>' +
            '<div class="report-bars">' +
              (categories.length ? categories.map(function (row) {
                return '<div class="report-bar-row">' +
                  '<label>' + esc(row.category.name) + '</label>' +
                  '<div class="report-bar"><span style="width:' + clamp(row.amount / max * 100, 0, 100) + '%"></span></div>' +
                  '<strong>' + money(row.amount) + '</strong>' +
                '</div>';
              }).join('') : '<div class="empty">Sem dados suficientes para o ranking.</div>') +
            '</div>' +
          '</section>' +

          '<section class="card section">' +
            '<div class="section-heading">' +
              '<div>' +
                '<h2>Fluxo Consolidado</h2>' +
                '<p>Receitas vs. Despesas vs. Orçamento</p>' +
              '</div>' +
            '</div>' +
            '<div class="budget-list">' +
              '<div class="budget-row">' +
                '<div class="budget-row-top"><strong>Receitas Realizadas</strong><span class="positive">' + money(data.income) + '</span></div>' +
                '<div class="progress teal"><span style="width:100%"></span></div>' +
              '</div>' +
              '<div class="budget-row">' +
                '<div class="budget-row-top"><strong>Despesas Realizadas</strong><span class="negative">' + money(data.expense) + '</span></div>' +
                '<div class="progress red"><span style="width:' + (data.income ? clamp(data.expense / data.income * 100, 0, 100) : 0) + '%"></span></div>' +
              '</div>' +
              '<div class="budget-row">' +
                '<div class="budget-row-top"><strong>Teto Orçado</strong><span style="color:var(--indigo)">' + money(data.planned) + '</span></div>' +
                '<div class="progress indigo"><span style="width:' + (data.income ? clamp(data.planned / data.income * 100, 0, 100) : 0) + '%"></span></div>' +
              '</div>' +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>';
  }

  function renderOpenFinance() {
    var providers = [
      { name: 'Pluggy', text: 'Conector homologado para sincronização com bancos brasileiros, cartões e investimentos.' },
      { name: 'Belvo', text: 'Infraestrutura segura para consentimento e leitura de dados financeiros via API regulada.' },
      { name: 'Celcoin', text: 'Conectividade e automação financeira com suporte às diretrizes do Banco Central.' }
    ];

    return renderTopbar('Open Finance', 'Conexões automatizadas e leitura de extratos regulados') +
      '<div class="content">' +
        '<section class="card hero" style="margin-bottom:24px">' +
          '<div>' +
            '<h2>Central Open Finance</h2>' +
            '<p>Estrutura pronta para conectar suas contas via consentimento seguro regulado pelo Banco Central. O Todo Controle nunca solicita ou armazena suas senhas de acesso bancário.</p>' +
          '</div>' +
          '<span class="hero-icon">' + svgIcon('openfinance', 32) + '</span>' +
        '</section>' +

        '<div class="callout warning" style="margin-bottom:24px">' +
          '<strong>Segurança em primeiro lugar:</strong> As conexões diretas exigem autorização ponta a ponta. Atualmente você pode importar extratos OFX ou CSV gerados pelo seu internet banking de forma 100% privada e local.' +
        '</div>' +

        '<div class="grid provider-grid" style="margin-bottom:24px">' +
          providers.map(function (provider) {
            var connection = state.connections.find(function (item) { return item.provider === provider.name; });
            return '<section class="card provider-card">' +
              '<h3>' + provider.name + '</h3>' +
              '<p>' + provider.text + '</p>' +
              '<span class="status">' + (connection ? 'Configuração salva' : 'Não conectado') + '</span>' +
              '<div style="margin-top:16px">' +
                '<button class="button small secondary" data-action="open-connection" data-provider="' + provider.name + '">Preparar Conexão</button>' +
              '</div>' +
            '</section>';
          }).join('') +
        '</div>' +

        '<section class="card section">' +
          '<div class="section-heading">' +
            '<div>' +
              '<h2>Importação de Arquivos OFX / CSV</h2>' +
              '<p>Processamento rápido sem intermediação de servidores</p>' +
            '</div>' +
            '<button class="button primary" data-action="open-import">' + svgIcon('plus', 16) + ' Importar Arquivo</button>' +
          '</div>' +
          '<div class="callout">' +
            'Os arquivos OFX/CSV são lidos diretamente na memória deste navegador e convertidos em transações para sua conferência.' +
          '</div>' +
        '</section>' +
      '</div>';
  }

  function renderMore() {
    return renderTopbar('Configurações & Dados', 'Gerencie seus dados locais, backups e preferências') +
      '<div class="content">' +
        '<div class="grid two-column" style="margin-bottom:24px">' +
          '<section class="card section">' +
            '<div class="section-heading">' +
              '<div>' +
                '<h2>Backup e Portabilidade</h2>' +
                '<p>Seus dados permanecem sob o seu total controle</p>' +
              '</div>' +
            '</div>' +
            '<div class="grid" style="gap:12px">' +
              '<button class="button secondary full" data-action="export-json">Exportar Backup Completo (JSON)</button>' +
              '<button class="button outline full" data-action="open-import">Importar Extrato Bancário (OFX/CSV)</button>' +
              '<button class="button danger full" data-action="reset-data">Restaurar Dados Padrão de Exemplo</button>' +
            '</div>' +
            '<div class="callout" style="margin-top:18px">' +
              'O Todo Controle salva todas as transações, orçamentos e contas no armazenamento local deste navegador (localStorage). Exporte um backup antes de limpar seu histórico ou trocar de máquina.' +
            '</div>' +
          '</section>' +

          '<section class="card section">' +
            '<div class="section-heading">' +
              '<div>' +
                '<h2>Arquitetura & Privacidade</h2>' +
                '<p>Compromisso de engenharia e produto</p>' +
              '</div>' +
            '</div>' +
            '<div class="budget-list">' +
              '<div class="budget-row">' +
                '<div class="budget-row-top"><strong>Armazenamento Local-First</strong><span class="positive">Ativo</span></div>' +
                '<div class="budget-meta"><span>Zero rastreamento ou venda de dados</span></div>' +
              '</div>' +
              '<div class="budget-row">' +
                '<div class="budget-row-top"><strong>Design System Unificado</strong><span style="color:var(--indigo)">v3.2 Modern</span></div>' +
                '<div class="budget-meta"><span>Tokens inspirados em Linear, Mercury e Onlook</span></div>' +
              '</div>' +
              '<div class="budget-row">' +
                '<div class="budget-row-top"><strong>Alinhamento & Acessibilidade</strong><span class="positive">Auditado</span></div>' +
                '<div class="budget-meta"><span>Tipografia com números tabulares e contraste WCAG AA</span></div>' +
              '</div>' +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>';
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

  /* ==========================================================================
     MODALS
     ========================================================================== */
  function optionCategories(value) {
    return state.categories.map(function (category) {
      return '<option value="' + category.id + '"' + selected(category.id === value) + '>' + (category.parentId ? '↳ ' : '') + esc(category.name) + '</option>';
    }).join('');
  }

  function optionAccounts(value) {
    return state.accounts.map(function (account) {
      return '<option value="' + account.id + '"' + selected(account.id === value) + '>' + esc(account.name) + '</option>';
    }).join('');
  }

  function optionCards(value) {
    return state.cards.map(function (card) {
      return '<option value="' + card.id + '"' + selected(card.id === value) + '>' + esc(card.name) + '</option>';
    }).join('');
  }

  function modalShell(title, subtitle, content, footer) {
    return '<div class="modal-backdrop" data-action="close-modal">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal-content>' +
        '<div class="modal-header">' +
          '<div>' +
            '<h2 id="modal-title">' + esc(title) + '</h2>' +
            '<p>' + esc(subtitle || '') + '</p>' +
          '</div>' +
          '<button class="icon-button" data-action="close-modal" aria-label="Fechar">' + svgIcon('close', 18) + '</button>' +
        '</div>' +
        content +
        (footer ? '<div class="modal-footer">' + footer + '</div>' : '') +
      '</div>' +
    '</div>';
  }

  function renderTransactionModal() {
    var existing = modal.id ? state.transactions.find(function (item) { return item.id === modal.id; }) : null;
    var item = existing || {
      type: modal.defaultType || 'expense',
      amount: '',
      description: '',
      date: todayISO(),
      accountId: state.accounts[0] && state.accounts[0].id,
      cardId: state.cards[0] && state.cards[0].id,
      categoryId: state.categories[0] && state.categories[0].id,
      status: 'paid',
      installments: 1,
      recurring: false,
      tags: [],
      note: ''
    };
    var type = modal.typeValue || item.type;
    var transfer = type === 'transfer';
    var cardExpense = type === 'card-expense' || Boolean(item.cardId);

    return modalShell(
      existing ? 'Editar Lançamento' : 'Novo Lançamento',
      'Informe os dados para registrar o movimento',
      '<form id="transaction-form" data-id="' + esc(existing ? existing.id : '') + '">' +
        '<div class="form-grid">' +
          '<div class="field">' +
            '<label for="tx-type">Tipo de Operação</label>' +
            '<select id="tx-type" name="type">' +
              '<option value="expense"' + selected(type === 'expense') + '>Despesa (Conta)</option>' +
              '<option value="income"' + selected(type === 'income') + '>Receita / Entrada</option>' +
              '<option value="card-expense"' + selected(cardExpense) + '>Despesa no Cartão de Crédito</option>' +
              '<option value="transfer"' + selected(transfer) + '>Transferência entre Contas</option>' +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label for="tx-amount">Valor (R$)</label>' +
            '<input id="tx-amount" name="amount" inputmode="decimal" placeholder="0,00" value="' + esc(item.amount || '') + '" required />' +
          '</div>' +
          '<div class="field wide">' +
            '<label for="tx-description">Descrição do Lançamento</label>' +
            '<input id="tx-description" name="description" placeholder="Ex.: Supermercado, Aluguel, Salário..." value="' + esc(item.description || '') + '" required />' +
          '</div>' +
          '<div class="field">' +
            '<label for="tx-date">Data</label>' +
            '<input id="tx-date" name="date" type="date" value="' + esc(item.date || todayISO()) + '" required />' +
          '</div>' +
          (transfer
            ? '<div class="field"><label for="tx-from">Conta Origem</label><select id="tx-from" name="fromAccountId">' + optionAccounts(item.fromAccountId || item.accountId) + '</select></div>' +
              '<div class="field"><label for="tx-to">Conta Destino</label><select id="tx-to" name="toAccountId">' + optionAccounts(item.toAccountId) + '</select></div>'
            : cardExpense
              ? '<div class="field"><label for="tx-card">Cartão</label><select id="tx-card" name="cardId">' + optionCards(item.cardId) + '</select></div>' +
                '<div class="field"><label for="tx-category">Categoria</label><select id="tx-category" name="categoryId">' + optionCategories(item.categoryId) + '</select></div>'
              : '<div class="field"><label for="tx-account">Conta</label><select id="tx-account" name="accountId">' + optionAccounts(item.accountId) + '</select></div>' +
                '<div class="field"><label for="tx-category">Categoria</label><select id="tx-category" name="categoryId">' + optionCategories(item.categoryId) + '</select></div>'
          ) +
          (!transfer
            ? '<div class="field">' +
                '<label for="tx-status">Status</label>' +
                '<select id="tx-status" name="status">' +
                  '<option value="paid"' + selected(item.status !== 'pending') + '>Confirmado / Pago</option>' +
                  '<option value="pending"' + selected(item.status === 'pending') + '>Pendente</option>' +
                '</select>' +
              '</div>' +
              '<div class="field">' +
                '<label for="tx-installments">Parcelas</label>' +
                '<input id="tx-installments" name="installments" type="number" min="1" max="60" value="' + esc(item.installments || 1) + '" />' +
              '</div>' +
              '<div class="field wide">' +
                '<label for="tx-tags">Tags (separadas por vírgula)</label>' +
                '<input id="tx-tags" name="tags" placeholder="Ex.: alimentação, fixo, trabalho" value="' + esc((item.tags || []).join(', ')) + '" />' +
              '</div>' +
              '<div class="field wide">' +
                '<label for="tx-note">Observações</label>' +
                '<textarea id="tx-note" name="note" placeholder="Anotações opcionais...">' + esc(item.note || '') + '</textarea>' +
              '</div>' +
              '<label class="check-row wide">' +
                '<input type="checkbox" name="recurring"' + checked(item.recurring) + ' />' +
                '<span>Marcar como despesa/receita recorrente mensal</span>' +
              '</label>'
            : ''
          ) +
        '</div>' +
      '</form>',
      '<button class="button outline" data-action="close-modal">Cancelar</button>' +
      '<button class="button primary" form="transaction-form">' + (existing ? 'Salvar Alterações' : 'Adicionar Lançamento') + '</button>'
    );
  }

  function renderAccountModal() {
    return modalShell(
      'Nova Conta Bancária',
      'Cadastre uma conta corrente, investimento ou carteira',
      '<form id="account-form">' +
        '<div class="form-grid">' +
          '<div class="field">' +
            '<label for="account-name">Nome da Conta</label>' +
            '<input id="account-name" name="name" placeholder="Ex.: Conta Corrente" required />' +
          '</div>' +
          '<div class="field">' +
            '<label for="account-institution">Instituição Financeira</label>' +
            '<input id="account-institution" name="institution" placeholder="Ex.: Nubank, Itaú, Inter" />' +
          '</div>' +
          '<div class="field">' +
            '<label for="account-type">Tipo de Conta</label>' +
            '<select id="account-type" name="type">' +
              '<option>Conta corrente</option>' +
              '<option>Investimento</option>' +
              '<option>Conta poupança</option>' +
              '<option>Carteira física</option>' +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label for="account-balance">Saldo Inicial (R$)</label>' +
            '<input id="account-balance" name="openingBalance" inputmode="decimal" placeholder="0,00" />' +
          '</div>' +
          '<div class="field">' +
            '<label for="account-color">Cor Identificadora</label>' +
            '<input id="account-color" name="color" type="color" value="#10b981" />' +
          '</div>' +
        '</div>' +
      '</form>',
      '<button class="button outline" data-action="close-modal">Cancelar</button>' +
      '<button class="button primary" form="account-form">Criar Conta</button>'
    );
  }

  function renderCardModal() {
    return modalShell(
      'Novo Cartão de Crédito',
      'Defina limite e datas de fechamento e vencimento',
      '<form id="card-form">' +
        '<div class="form-grid">' +
          '<div class="field">' +
            '<label for="card-name">Nome do Cartão</label>' +
            '<input id="card-name" name="name" placeholder="Ex.: Ultravioleta" required />' +
          '</div>' +
          '<div class="field">' +
            '<label for="card-brand">Bandeira</label>' +
            '<input id="card-brand" name="brand" placeholder="Ex.: Mastercard, Visa" />' +
          '</div>' +
          '<div class="field">' +
            '<label for="card-limit">Limite Total (R$)</label>' +
            '<input id="card-limit" name="limit" inputmode="decimal" placeholder="0,00" required />' +
          '</div>' +
          '<div class="field">' +
            '<label for="card-closing">Dia do Fechamento</label>' +
            '<input id="card-closing" name="closingDay" type="number" min="1" max="31" value="25" />' +
          '</div>' +
          '<div class="field">' +
            '<label for="card-due">Dia do Vencimento</label>' +
            '<input id="card-due" name="dueDay" type="number" min="1" max="31" value="7" />' +
          '</div>' +
          '<div class="field">' +
            '<label for="card-color">Cor do Cartão</label>' +
            '<input id="card-color" name="color" type="color" value="#6366f1" />' +
          '</div>' +
        '</div>' +
      '</form>',
      '<button class="button outline" data-action="close-modal">Cancelar</button>' +
      '<button class="button primary" form="card-form">Criar Cartão</button>'
    );
  }

  function renderBudgetModal() {
    return modalShell(
      'Novo Orçamento de Gastos',
      'Defina um teto mensal para uma categoria',
      '<form id="budget-form">' +
        '<div class="form-grid">' +
          '<div class="field">' +
            '<label for="budget-category">Categoria</label>' +
            '<select id="budget-category" name="categoryId">' + optionCategories('') + '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label for="budget-amount">Teto Orçado (R$)</label>' +
            '<input id="budget-amount" name="amount" inputmode="decimal" placeholder="0,00" required />' +
          '</div>' +
          '<div class="field wide">' +
            '<small>Este orçamento será monitorado para o mês de ' + esc(monthLabel(state.selectedMonth)) + '.</small>' +
          '</div>' +
        '</div>' +
      '</form>',
      '<button class="button outline" data-action="close-modal">Cancelar</button>' +
      '<button class="button primary" form="budget-form">Salvar Orçamento</button>'
    );
  }

  function renderGoalModal() {
    return modalShell(
      'Nova Meta Financeira',
      'Acompanhe o acúmulo de reservas e patrimônio',
      '<form id="goal-form">' +
        '<div class="form-grid">' +
          '<div class="field wide">' +
            '<label for="goal-name">Nome do Objetivo</label>' +
            '<input id="goal-name" name="name" placeholder="Ex.: Reserva de Emergência, Carro Novo..." required />' +
          '</div>' +
          '<div class="field">' +
            '<label for="goal-target">Valor Alvo (R$)</label>' +
            '<input id="goal-target" name="target" inputmode="decimal" placeholder="0,00" required />' +
          '</div>' +
          '<div class="field">' +
            '<label for="goal-saved">Valor Já Guardado (R$)</label>' +
            '<input id="goal-saved" name="saved" inputmode="decimal" value="0" />' +
          '</div>' +
          '<div class="field">' +
            '<label for="goal-date">Data Alvo</label>' +
            '<input id="goal-date" name="dueDate" type="date" value="' + addMonths(todayISO(), 6) + '" />' +
          '</div>' +
          '<div class="field">' +
            '<label for="goal-color">Cor da Meta</label>' +
            '<input id="goal-color" name="color" type="color" value="#10b981" />' +
          '</div>' +
        '</div>' +
      '</form>',
      '<button class="button outline" data-action="close-modal">Cancelar</button>' +
      '<button class="button primary" form="goal-form">Criar Meta</button>'
    );
  }

  function renderBillModal() {
    return modalShell(
      'Nova Conta a Pagar / Receber',
      'Agende um compromisso financeiro com data de vencimento',
      '<form id="bill-form">' +
        '<div class="form-grid">' +
          '<div class="field wide">' +
            '<label for="bill-description">Descrição da Conta</label>' +
            '<input id="bill-description" name="description" placeholder="Ex.: Condomínio, Energia, Mensalidade..." required />' +
          '</div>' +
          '<div class="field">' +
            '<label for="bill-amount">Valor (R$)</label>' +
            '<input id="bill-amount" name="amount" inputmode="decimal" placeholder="0,00" required />' +
          '</div>' +
          '<div class="field">' +
            '<label for="bill-date">Data de Vencimento</label>' +
            '<input id="bill-date" name="dueDate" type="date" value="' + todayISO() + '" required />' +
          '</div>' +
          '<div class="field">' +
            '<label for="bill-category">Categoria</label>' +
            '<select id="bill-category" name="categoryId">' + optionCategories('') + '</select>' +
          '</div>' +
          '<label class="check-row wide">' +
            '<input type="checkbox" name="recurring" />' +
            '<span>Repetir mensalmente (recorrente)</span>' +
          '</label>' +
        '</div>' +
      '</form>',
      '<button class="button outline" data-action="close-modal">Cancelar</button>' +
      '<button class="button primary" form="bill-form">Adicionar à Agenda</button>'
    );
  }

  function renderImportModal() {
    return modalShell(
      'Importar Extrato OFX ou CSV',
      'Processamento 100% local e seguro no seu dispositivo',
      '<form id="import-form">' +
        '<div class="field">' +
          '<label for="import-file">Selecione o arquivo OFX ou CSV</label>' +
          '<input id="import-file" name="file" type="file" accept=".ofx,.qfx,.csv,text/csv,application/x-ofx" required />' +
          '<small>Suporta extratos de Nubank, Inter, Itaú, Bradesco, BB, XP e C6.</small>' +
        '</div>' +
        (importRows.length
          ? '<div class="import-preview">' +
              '<table class="data-table">' +
                '<thead><tr><th>Data</th><th>Descrição</th><th>Valor</th></tr></thead>' +
                '<tbody>' +
                  importRows.slice(0, 12).map(function (row) {
                    return '<tr>' +
                      '<td>' + dateBR(row.date) + '</td>' +
                      '<td>' + esc(row.description) + '</td>' +
                      '<td class="' + (row.type === 'income' ? 'positive' : 'negative') + '"><strong>' + money(row.amount) + '</strong></td>' +
                    '</tr>';
                  }).join('') +
                '</tbody>' +
              '</table>' +
            '</div>' +
            '<div class="field" style="margin-top:16px">' +
              '<label for="import-account">Vincular à Conta de Destino</label>' +
              '<select id="import-account" name="accountId">' + optionAccounts(state.accounts[0] && state.accounts[0].id) + '</select>' +
            '</div>'
          : '') +
      '</form>',
      '<button class="button outline" data-action="close-modal">Cancelar</button>' +
      '<button class="button primary" form="import-form">' +
        (importRows.length ? 'Importar ' + importRows.length + ' Lançamentos' : 'Processar Arquivo') +
      '</button>'
    );
  }

  function renderConnectionModal() {
    return modalShell(
      'Preparar Conexão Open Finance',
      'Configuração regulada de sincronização bancária',
      '<form id="connection-form">' +
        '<div class="callout">' +
          'A sincronização automática necessitará de aprovação e consentimento no ambiente seguro do banco. Nenhuma credencial pessoal é mantida no app.' +
        '</div>' +
        '<div class="form-grid" style="margin-top:16px">' +
          '<div class="field">' +
            '<label for="connection-provider">Provedor Homologado</label>' +
            '<input id="connection-provider" name="provider" value="' + esc(modal.provider || '') + '" readonly />' +
          '</div>' +
          '<div class="field">' +
            '<label for="connection-institution">Instituição Bancária</label>' +
            '<input id="connection-institution" name="institution" placeholder="Ex.: Nubank, Itaú, Banco do Brasil" required />' +
          '</div>' +
        '</div>' +
      '</form>',
      '<button class="button outline" data-action="close-modal">Cancelar</button>' +
      '<button class="button primary" form="connection-form">Salvar Conexão</button>'
    );
  }

  function renderCardPaymentModal() {
    var card = cardById(modal.cardId);
    return modalShell(
      'Pagar Fatura de Cartão',
      card ? card.name + ' · ' + monthLabel(state.selectedMonth) : '',
      '<form id="card-payment-form">' +
        '<div class="form-grid">' +
          '<div class="field">' +
            '<label for="payment-amount">Valor a Liquidar (R$)</label>' +
            '<input id="payment-amount" name="amount" inputmode="decimal" value="' + esc(card ? cardBill(card.id, state.selectedMonth).toFixed(2).replace('.', ',') : '') + '" required />' +
          '</div>' +
          '<div class="field">' +
            '<label for="payment-account">Debitar da Conta</label>' +
            '<select id="payment-account" name="accountId">' + optionAccounts(state.accounts[0] && state.accounts[0].id) + '</select>' +
          '</div>' +
        '</div>' +
        '<div class="callout" style="margin-top:16px">' +
          'O pagamento reduz o saldo da conta e zera o valor em aberto da fatura do cartão.' +
        '</div>' +
      '</form>',
      '<button class="button outline" data-action="close-modal">Cancelar</button>' +
      '<button class="button primary" form="card-payment-form">Confirmar Pagamento</button>'
    );
  }

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

  /* ==========================================================================
     RENDER ROOT & APPLICATION SHELL
     ========================================================================== */
  function render() {
    var mobileMenu = '<button class="icon-button menu-button" data-action="toggle-sidebar" aria-label="Abrir menu lateral">' + svgIcon('menu', 20) + '</button>';
    var quickActionsModal = quickMenu
      ? modalShell(
          'Adicionar Movimentação',
          'Selecione a categoria de lançamento que deseja registrar',
          '<div class="quick-actions">' +
            '<button class="quick-action" data-action="open-transaction" data-type="expense">' +
              '<span class="qa-icon" style="background:var(--red-light); color:var(--red)">' + svgIcon('expense', 20) + '</span>' +
              '<div><b>Despesa</b><span>Pagamento à vista ou débito</span></div>' +
            '</button>' +
            '<button class="quick-action" data-action="open-transaction" data-type="income">' +
              '<span class="qa-icon" style="background:var(--green-light); color:var(--green)">' + svgIcon('income', 20) + '</span>' +
              '<div><b>Receita</b><span>Salário, rendimento ou entrada</span></div>' +
            '</button>' +
            '<button class="quick-action" data-action="open-transaction" data-type="card-expense">' +
              '<span class="qa-icon" style="background:var(--indigo-light); color:var(--indigo)">' + svgIcon('credit-card', 20) + '</span>' +
              '<div><b>Despesa no Cartão</b><span>Fatura e compras parceladas</span></div>' +
            '</button>' +
            '<button class="quick-action" data-action="open-transaction" data-type="transfer">' +
              '<span class="qa-icon" style="background:var(--teal-light); color:var(--teal)">' + svgIcon('transfer', 20) + '</span>' +
              '<div><b>Transferência</b><span>Movimentação entre contas</span></div>' +
            '</button>' +
          '</div>',
          '<button class="button outline" data-action="close-quick">Cancelar</button>'
        )
      : '';

    document.getElementById('app').innerHTML =
      mobileMenu +
      '<div class="app-shell">' +
        renderSidebar() +
        '<main class="main">' +
          renderView() +
        '</main>' +
      '</div>' +
      (activeView === 'dashboard' || activeView === 'transactions'
        ? '<button class="fab" data-action="quick-add" aria-label="Adicionar lançamento">' + svgIcon('plus', 24) + '</button>'
        : '') +
      renderMobileNav() +
      renderModal() +
      quickActionsModal;
  }

  function showToast(message) {
    var element = document.getElementById('toast');
    if (!element) return;
    element.innerHTML = svgIcon('check', 16) + '<span>' + esc(message) + '</span>';
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { element.classList.remove('show'); }, 2800);
  }

  function closeAll() {
    modal = null;
    quickMenu = false;
    importRows = [];
    render();
  }

  function openTransaction(type, id) {
    modal = {
      type: 'transaction',
      defaultType: type || 'expense',
      typeValue: type || 'expense',
      id: id || null,
      cardMode: type === 'card-expense'
    };
    render();
  }

  function download(name, content, mime) {
    var link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type: mime || 'application/octet-stream' }));
    link.download = name;
    link.click();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 800);
  }

  function exportJSON() {
    download('todo-controle-backup.json', JSON.stringify(state, null, 2), 'application/json');
    showToast('Backup JSON exportado com sucesso.');
  }

  function exportCSV() {
    var rows = [['data', 'descricao', 'tipo', 'categoria', 'conta_cartao', 'valor', 'status']];
    monthTransactions(state.selectedMonth).forEach(function (item) {
      var owner = item.cardId ? cardById(item.cardId) : accountById(item.accountId);
      rows.push([
        item.date,
        item.description,
        item.type,
        displayCategory(item),
        owner ? owner.name : '',
        String(item.amount).replace('.', ','),
        item.status
      ]);
    });
    download(
      'todo-controle-' + state.selectedMonth + '.csv',
      rows.map(function (row) {
        return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(';');
      }).join('\n'),
      'text/csv;charset=utf-8'
    );
    showToast('Relatório CSV exportado com sucesso.');
  }

  /* ==========================================================================
     PARSERS (OFX & CSV)
     ========================================================================== */
  function parseOFX(text) {
    var rows = [];
    text.split(/<STMTTRN>/i).slice(1).forEach(function (block) {
      var amount = parseMoney((block.match(/<TRNAMT>([^<\r\n]+)/i) || [])[1] || '0');
      var date = ((block.match(/<DTPOSTED>(\d{4})(\d{2})(\d{2})/i) || []).slice(1)).join('-');
      var description = (block.match(/<(?:NAME|MEMO)>([^<\r\n]+)/i) || [])[1] || 'Lançamento OFX';
      if (date && amount) {
        rows.push({
          date: date,
          description: description.trim(),
          amount: Math.abs(amount),
          type: amount >= 0 ? 'income' : 'expense'
        });
      }
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
      return {
        date: date,
        description: values[descriptionIndex] || 'Lançamento CSV',
        amount: Math.abs(amount),
        type: negative ? 'expense' : 'income'
      };
    }).filter(function (row) { return row.date && row.amount; });
  }

  function readImportFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var text = String(reader.result || '');
      importRows = /\.ofx$|\.qfx$/i.test(file.name) || text.indexOf('<OFX>') >= 0 ? parseOFX(text) : parseCSV(text);
      render();
      if (!importRows.length) showToast('Nenhum lançamento identificado neste arquivo.');
    };
    reader.readAsText(file);
  }

  /* ==========================================================================
     EVENT LISTENERS & DISPATCHERS
     ========================================================================== */
  function handleClick(event) {
    var target = event.target.closest('button, a, .modal-backdrop');
    if (!target) return;

    var view = target.getAttribute('data-view');
    if (view) {
      activeView = view;
      searchTerm = '';
      activeFilter = 'all';
      closeAll();
      return;
    }

    var filter = target.getAttribute('data-filter');
    if (filter) {
      activeFilter = filter;
      render();
      return;
    }

    var action = target.getAttribute('data-action');
    if (!action) return;

    if (action === 'toggle-theme') { toggleTheme(); return; }
    if (action === 'toggle-sidebar') {
      var sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.toggle('open');
      return;
    }
    if (action === 'quick-add') { quickMenu = true; render(); return; }
    if (action === 'close-quick') { quickMenu = false; render(); return; }
    if (action === 'close-modal') {
      if (target.classList.contains('modal-backdrop') && event.target !== target) return;
      closeAll();
      return;
    }
    if (action === 'open-transaction') { quickMenu = false; openTransaction(target.getAttribute('data-type')); return; }
    if (action === 'edit-transaction') { openTransaction('expense', target.getAttribute('data-id')); return; }
    if (action === 'delete-transaction') {
      var transactionId = target.getAttribute('data-id');
      if (window.confirm('Deseja excluir este lançamento definitivamente?')) {
        state.transactions = state.transactions.filter(function (item) { return item.id !== transactionId; });
        save();
        render();
        showToast('Lançamento excluído com sucesso.');
      }
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
      if (bill) {
        bill.status = bill.status === 'paid' ? 'open' : 'paid';
        save();
        render();
        showToast(bill.status === 'paid' ? 'Conta marcada como paga.' : 'Conta reaberta.');
      }
      return;
    }
    if (action === 'delete-budget') {
      state.budgets = state.budgets.filter(function (item) { return item.id !== target.getAttribute('data-id'); });
      save();
      render();
      showToast('Limite orçamentário removido.');
      return;
    }
    if (action === 'export-json') { exportJSON(); return; }
    if (action === 'export-csv') { exportCSV(); return; }
    if (action === 'reset-data' && window.confirm('Deseja restaurar os dados de exemplo? Os lançamentos locais atuais serão substituídos.')) {
      state = defaultState();
      save();
      render();
      showToast('Dados de exemplo restaurados.');
    }
  }

  function formData(form) {
    var result = {};
    new FormData(form).forEach(function (value, key) { result[key] = value; });
    return result;
  }

  function handleSubmit(event) {
    var form = event.target;
    event.preventDefault();
    var data = formData(form);

    if (form.id === 'transaction-form') {
      var type = data.type;
      var amount = parseMoney(data.amount);
      if (!amount || !data.description) {
        showToast('Informe a descrição e o valor da operação.');
        return;
      }
      if (type === 'card-expense') type = 'expense';
      if (type === 'transfer' && data.fromAccountId === data.toAccountId) {
        showToast('Escolha contas de origem e destino diferentes.');
        return;
      }
      var installments = Math.max(1, Number(data.installments || 1));
      var base = {
        description: data.description,
        amount: amount,
        date: data.date || todayISO(),
        status: data.status || 'paid',
        tags: data.tags ? data.tags.split(',').map(function (tag) { return tag.trim(); }).filter(Boolean) : [],
        note: data.note || '',
        recurring: Boolean(data.recurring)
      };

      var id = form.getAttribute('data-id');
      if (id) {
        var existing = state.transactions.find(function (item) { return item.id === id; });
        if (existing) {
          Object.assign(
            existing,
            base,
            type === 'transfer'
              ? { type: 'transfer', fromAccountId: data.fromAccountId, toAccountId: data.toAccountId, accountId: '' }
              : { type: type, accountId: data.accountId || '', cardId: data.cardId || '', categoryId: data.categoryId || '', fromAccountId: '', toAccountId: '' }
          );
        }
        showToast('Lançamento atualizado com sucesso.');
      } else {
        for (var index = 0; index < installments; index += 1) {
          state.transactions.push(
            Object.assign({}, base, {
              id: uid('tx'),
              type: type,
              date: addMonths(base.date, index),
              installmentNumber: installments > 1 ? index + 1 : 0,
              installments: installments > 1 ? installments : 0,
              accountId: data.accountId || '',
              cardId: data.cardId || '',
              categoryId: data.categoryId || '',
              fromAccountId: data.fromAccountId || '',
              toAccountId: data.toAccountId || ''
            })
          );
        }
        showToast('Lançamento registrado com sucesso.');
      }
      save();
      closeAll();
      return;
    }

    if (form.id === 'account-form') {
      state.accounts.push({
        id: uid('account'),
        name: data.name,
        institution: data.institution,
        type: data.type,
        openingBalance: parseMoney(data.openingBalance),
        color: data.color || '#10b981'
      });
      save();
      closeAll();
      showToast('Conta cadastrada com sucesso.');
      return;
    }

    if (form.id === 'card-form') {
      state.cards.push({
        id: uid('card'),
        name: data.name,
        brand: data.brand,
        limit: parseMoney(data.limit),
        closingDay: data.closingDay,
        dueDay: data.dueDay,
        color: data.color || '#6366f1'
      });
      save();
      closeAll();
      showToast('Cartão cadastrado com sucesso.');
      return;
    }

    if (form.id === 'budget-form') {
      var duplicate = state.budgets.find(function (item) {
        return item.month === state.selectedMonth && item.categoryId === data.categoryId;
      });
      if (duplicate) {
        duplicate.amount = parseMoney(data.amount);
      } else {
        state.budgets.push({
          id: uid('budget'),
          month: state.selectedMonth,
          categoryId: data.categoryId,
          amount: parseMoney(data.amount)
        });
      }
      save();
      closeAll();
      showToast('Orçamento salvo com sucesso.');
      return;
    }

    if (form.id === 'goal-form') {
      state.goals.push({
        id: uid('goal'),
        name: data.name,
        target: parseMoney(data.target),
        saved: parseMoney(data.saved),
        dueDate: data.dueDate,
        color: data.color || '#10b981'
      });
      save();
      closeAll();
      showToast('Meta criada com sucesso.');
      return;
    }

    if (form.id === 'bill-form') {
      state.bills.push({
        id: uid('bill'),
        description: data.description,
        amount: parseMoney(data.amount),
        dueDate: data.dueDate,
        categoryId: data.categoryId,
        status: 'open',
        recurring: Boolean(data.recurring)
      });
      save();
      closeAll();
      showToast('Conta agendada com sucesso.');
      return;
    }

    if (form.id === 'connection-form') {
      state.connections.push({
        id: uid('connection'),
        provider: data.provider,
        institution: data.institution,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      save();
      closeAll();
      showToast('Conexão configurada com sucesso.');
      return;
    }

    if (form.id === 'card-payment-form') {
      var payment = parseMoney(data.amount);
      if (!payment) {
        showToast('Informe o valor para pagamento da fatura.');
        return;
      }
      state.transactions.push({
        id: uid('tx'),
        date: todayISO(),
        description: 'Pagamento de Fatura',
        type: 'card-payment',
        amount: payment,
        accountId: data.accountId,
        cardId: modal.cardId,
        status: 'paid',
        categoryId: '',
        tags: [],
        note: ''
      });
      save();
      closeAll();
      showToast('Pagamento de fatura registrado.');
      return;
    }

    if (form.id === 'import-form') {
      var fileInput = form.querySelector('input[type="file"]');
      var file = fileInput && fileInput.files[0];
      if (!importRows.length && file) {
        readImportFile(file);
        return;
      }
      if (!importRows.length) {
        showToast('Selecione um arquivo de extrato primeiro.');
        return;
      }
      var accountId = data.accountId || (state.accounts[0] && state.accounts[0].id);
      importRows.forEach(function (row) {
        state.transactions.push({
          id: uid('tx'),
          date: row.date,
          description: row.description,
          type: row.type,
          amount: row.amount,
          accountId: accountId,
          categoryId: '',
          status: 'paid',
          tags: ['importado'],
          note: 'Importado localmente via extrato'
        });
      });
      var count = importRows.length;
      save();
      closeAll();
      showToast(count + ' lançamentos importados com sucesso.');
      return;
    }
  }

  function handleChange(event) {
    var target = event.target;
    if (target.id === 'month-picker') {
      state.selectedMonth = target.value;
      save();
      render();
      return;
    }
    if (target.id === 'tx-type' && modal && modal.type === 'transaction') {
      modal.typeValue = target.value;
      render();
      return;
    }
    if (target.id === 'import-file' && target.files[0]) {
      readImportFile(target.files[0]);
      return;
    }
  }

  function handleInput(event) {
    if (event.target.id === 'transaction-search') {
      searchTerm = event.target.value;
      render();
      var input = document.getElementById('transaction-search');
      if (input) {
        input.focus();
        input.setSelectionRange(searchTerm.length, searchTerm.length);
      }
    }
  }

  /* ==========================================================================
     INIT
     ========================================================================== */
  document.addEventListener('click', handleClick);
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('change', handleChange);
  document.addEventListener('input', handleInput);

  window.addEventListener('hashchange', function () {
    var hash = window.location.hash.replace('#', '');
    if (navItems().some(function (item) { return item[0] === hash; })) {
      activeView = hash;
      render();
    }
  });

  applyTheme();
  render();
})();
