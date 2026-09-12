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
  var colors = ['#6366f1', '#10b981', '#06b6d4', '#f59e0b', '#f43f5e', '#8b5cf6'];  /* ==========================================================================
     CUSTOM HIGH-CRAFT SVG ICON SYSTEM (DUOTONE & MULTI-LAYER FINTECH ICONS)
     ========================================================================== */
  function svgIcon(name, size) {
    var s = size || 18;
    var icons = {
      // Sidebar Navigation (Duotone with filled layers)
      'dashboard': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7.5" height="9.5" rx="2" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="11.5" width="7.5" height="9.5" rx="2" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="15.5" width="7.5" height="5.5" rx="2" stroke="currentColor" stroke-width="1.8"/></svg>',
      'transactions': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="18" r="3.5" fill="currentColor" fill-opacity="0.2"/><path d="M7 5v13m0 0-3-3m3 3 3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="17" cy="6" r="3.5" fill="currentColor" fill-opacity="0.2"/><path d="M17 19V6m0 0 3 3m-3-3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'planning': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="5" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      'accounts': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8"/><path d="M2 10h20" stroke="currentColor" stroke-width="1.8"/><rect x="5" y="13" width="4" height="3" rx="1" fill="currentColor" stroke="none"/><circle cx="17" cy="14.5" r="1.5" fill="currentColor"/></svg>',
      'reports': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><rect x="3" y="13" width="4" height="8" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8"/><rect x="10" y="8" width="4" height="13" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8"/><rect x="17" y="4" width="4" height="17" rx="1.5" fill="currentColor" stroke="currentColor" stroke-width="1.8"/><path d="m3 11 7-5 4 3 7-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'openfinance': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><path d="M13 2 4 14h7l-1 8 10-12h-7l1-8z" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4.5" cy="4.5" r="1.8" fill="currentColor"/><circle cx="19.5" cy="19.5" r="1.8" fill="currentColor"/></svg>',
      'more': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',

      // Alert & Status Custom Icons
      'pending-alert': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="6" r="3" fill="#F59E0B" stroke="#131927" stroke-width="2"/></svg>',
      'bill-alert': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18.5" cy="5.5" r="3" fill="#06B6D4" stroke="#131927" stroke-width="2"/><path d="M3 5.5a4 4 0 0 1 2-2M21 5.5a4 4 0 0 0-2-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
      'card-alert': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8"/><path d="M2 10h20" stroke="currentColor" stroke-width="1.8"/><rect x="5" y="13" width="4.5" height="3" rx="1" fill="#F59E0B"/><path d="M16 13h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18.5" cy="5.5" r="3" fill="#6366F1" stroke="#131927" stroke-width="2"/></svg>',

      // Metric Card Icons
      'wallet-vault': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M12 6v1.5M12 16.5V18M6 12h1.5M16.5 12H18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      'income-surge': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.8"/><path d="m15.5 8.5-7 7M8.5 8.5h7v7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'expense-burn': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.8"/><path d="m8.5 8.5 7 7M15.5 8.5v7h-7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'balance-scale': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M4 8l8-4 8 4M6 15l-3-6h6l-3 6a3 3 0 0 1-6 0M18 15l-3-6h6l-3 6a3 3 0 0 1-6 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="20" r="1.8" fill="currentColor"/></svg>',

      // Actions & Controls
      'plus': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
      'sun': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
      'moon': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
      'trash': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
      'edit': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
      'close': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      'check': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      'arrow-right': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
      'menu': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
      'credit-card': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
      'income': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="m15 9-6 6M9 9h6v6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'expense': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="m9 9 6 6m0-6v6H9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'transfer': '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none"><path d="M8 4 4 8l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 8h12a4 4 0 0 1 4 4v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="m16 20 4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 16H8a4 4 0 0 1-4-4v-1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    };
    return icons[name] || icons['dashboard'];
  }

  /* ==========================================================================
     CUSTOM BRANDED BADGES FOR INSTITUTIONS & CREDIT CARDS
     ========================================================================== */
  function renderAccountBadge(account) {
    var name = (account.name || '').toLowerCase();
    var inst = (account.institution || '').toLowerCase();
    var type = (account.type || '').toLowerCase();

    // Nubank
    if (name.indexOf('nubank') >= 0 || inst.indexOf('nubank') >= 0) {
      return '<div class="account-badge badge-nubank" title="Nubank">' +
        '<svg width="24" height="24" viewBox="0 0 28 28" fill="none">' +
          '<path d="M7 19V9l7 10V9" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M21 9v10c0 1.1-.9 2-2 2h-1c-1.1 0-2-.9-2-2V9" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>' +
        '</svg>' +
      '</div>';
    }

    // XP Investimentos
    if (name.indexOf('xp') >= 0 || inst.indexOf('xp') >= 0) {
      return '<div class="account-badge badge-xp" title="XP">' +
        '<svg width="24" height="24" viewBox="0 0 28 28" fill="none">' +
          '<path d="M6 6l16 16M22 6L6 22" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>' +
          '<circle cx="14" cy="14" r="3" fill="#00E5FF"/>' +
        '</svg>' +
      '</div>';
    }

    // Reserva / Selic / Tesouro / Investimento
    if (name.indexOf('reserva') >= 0 || inst.indexOf('selic') >= 0 || inst.indexOf('tesouro') >= 0 || type.indexOf('investimento') >= 0) {
      return '<div class="account-badge badge-vault" title="Reserva / Investimento">' +
        '<svg width="24" height="24" viewBox="0 0 28 28" fill="none">' +
          '<rect x="3.5" y="4.5" width="21" height="19" rx="3.5" fill="rgba(255,255,255,0.18)" stroke="#A7F3D0" stroke-width="2"/>' +
          '<circle cx="14" cy="14" r="5" stroke="#34D399" stroke-width="2"/>' +
          '<circle cx="14" cy="14" r="2" fill="#34D399"/>' +
          '<path d="M14 7v2M14 19v2M7 14h2M19 14h2" stroke="#A7F3D0" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>' +
      '</div>';
    }

    // Inter
    if (name.indexOf('inter') >= 0 || inst.indexOf('inter') >= 0) {
      return '<div class="account-badge badge-inter" title="Banco Inter">' +
        '<svg width="24" height="24" viewBox="0 0 28 28" fill="none">' +
          '<path d="M6 7h4v14H6zM13 11h4v10h-4zM20 14h2v7h-2z" fill="#FFFFFF"/>' +
        '</svg>' +
      '</div>';
    }

    // Carteira / Dinheiro físico
    if (name.indexOf('carteira') >= 0 || inst.indexOf('dinheiro') >= 0 || type.indexOf('carteira') >= 0) {
      return '<div class="account-badge badge-wallet" title="Carteira">' +
        '<svg width="24" height="24" viewBox="0 0 28 28" fill="none">' +
          '<path d="M23 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" stroke="#FFFFFF" stroke-width="2"/>' +
          '<rect x="14" y="10" width="10" height="8" rx="2" fill="#FDE68A" stroke="#FFFFFF" stroke-width="1.8"/>' +
          '<circle cx="19" cy="14" r="1.5" fill="#92400E"/>' +
        '</svg>' +
      '</div>';
    }

    // Default Bank Crest
    return '<div class="account-badge badge-bank" style="background:' + esc(account.color || 'linear-gradient(135deg, #0284C7, #0369A1)') + '" title="' + esc(account.name) + '">' +
      '<svg width="24" height="24" viewBox="0 0 28 28" fill="none">' +
        '<path d="M4 23h20M4 11h20M6 11v9M10 11v9M18 11v9M22 11v9M14 4 3 9h22L14 4z" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>' +
    '</div>';
  }

  function renderCardBadge(card) {
    var name = (card.name || '').toLowerCase();
    var brand = (card.brand || '').toLowerCase();

    var badgeClass = 'badge-card-default';
    var chipColor = '#FBBF24';
    var waveColor = 'rgba(255,255,255,0.75)';

    if (name.indexOf('nubank') >= 0 || name.indexOf('ultravioleta') >= 0) {
      badgeClass = 'badge-card-nubank';
      chipColor = '#E9D5FF';
    } else if (name.indexOf('xp') >= 0 || name.indexOf('infinite') >= 0) {
      badgeClass = 'badge-card-xp';
      chipColor = '#38BDF8';
    } else if (name.indexOf('inter') >= 0 || name.indexOf('black') >= 0) {
      badgeClass = 'badge-card-inter';
      chipColor = '#FDE68A';
    } else if (name.indexOf('c6') >= 0) {
      badgeClass = 'badge-card-c6';
      chipColor = '#E2E8F0';
    }

    return '<div class="card-badge ' + badgeClass + '" title="' + esc(card.name) + '">' +
      '<svg width="26" height="26" viewBox="0 0 32 32" fill="none">' +
        '<rect x="2" y="5" width="28" height="22" rx="3.5" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>' +
        '<rect x="5.5" y="8.5" width="6.5" height="5.5" rx="1.5" fill="' + chipColor + '" stroke="rgba(0,0,0,0.2)" stroke-width="0.8"/>' +
        '<path d="M8.75 8.5v5.5M5.5 11.25h6.5" stroke="rgba(0,0,0,0.35)" stroke-width="0.7"/>' +
        '<path d="M23 8c1.6 1.6 1.6 4.4 0 6M25 6c2.7 2.7 2.7 7.3 0 10" stroke="' + waveColor + '" stroke-width="1.6" stroke-linecap="round"/>' +
        '<rect x="5.5" y="18" width="14" height="2" rx="1" fill="rgba(255,255,255,0.85)"/>' +
        '<rect x="5.5" y="22" width="9" height="1.6" rx="0.8" fill="rgba(255,255,255,0.5)"/>' +
        '<circle cx="22.5" cy="21.5" r="3.2" fill="rgba(255,255,255,0.45)"/>' +
        '<circle cx="26" cy="21.5" r="3.2" fill="rgba(255,255,255,0.7)"/>' +
      '</svg>' +
    '</div>';
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
  state.telegram = state.telegram || { status: 'not-configured', botUsername: '', chatId: '' };
  var activeCardFilter = 'all';
  var activeCategoryFilter = 'all';
  var activeAccountFilter = 'all';
  var reportStartDate = '';
  var reportEndDate = '';
  var reportCardFilter = 'all';
  var reportCategoryFilter = 'all';
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

  function navItems() {
    return [
      ['dashboard', 'dashboard', 'Visão Geral'],
      ['transactions', 'transactions', 'Transações'],
      ['planning', 'planning', 'Planejamento'],
      ['accounts', 'accounts', 'Contas e Cartões'],
      ['reports', 'reports', 'Relatórios'],
      ['telegram', 'reports', 'Telegram'],
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
        renderAccountBadge(account) +
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
          renderCardBadge(card) +
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
      '<div class="progress ' + (percentage > 85 ? 'red' : 'indigo') + '" style="margin-top:14px">' +
        '<span style="width:' + percentage + '%"></span>' +
      '</div>' +
      '<div class="budget-meta" style="margin-top:8px">' +
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
              '<span class="summary-card-badge">' + svgIcon('wallet-vault', 18) + '</span>' +
            '</div>' +
            '<div class="value ' + (data.balance < 0 ? 'negative' : 'positive') + '">' + money(data.balance) + '</div>' +
            '<div class="helper">' + svgIcon('check', 13) + ' Total em contas e reservas</div>' +
          '</div>' +
          '<div class="card summary-card income">' +
            '<div class="summary-card-header">' +
              '<span class="label">Receitas do Mês</span>' +
              '<span class="summary-card-badge" style="color:var(--green)">' + svgIcon('income-surge', 18) + '</span>' +
            '</div>' +
            '<div class="value positive">' + money(data.income) + '</div>' +
            '<div class="helper">' + svgIcon('income', 13) + ' Total de entradas</div>' +
          '</div>' +
          '<div class="card summary-card expense">' +
            '<div class="summary-card-header">' +
              '<span class="label">Despesas do Mês</span>' +
              '<span class="summary-card-badge" style="color:var(--red)">' + svgIcon('expense-burn', 18) + '</span>' +
            '</div>' +
            '<div class="value negative">' + money(data.expense) + '</div>' +
            '<div class="helper">' + svgIcon('expense', 13) + ' Total de saídas</div>' +
          '</div>' +
          '<div class="card summary-card limit">' +
            '<div class="summary-card-header">' +
              '<span class="label">Balanço do Mês</span>' +
              '<span class="summary-card-badge" style="color:var(--teal)">' + svgIcon('balance-scale', 18) + '</span>' +
            '</div>' +
            '<div class="value ' + (data.monthly < 0 ? 'negative' : 'positive') + '">' + money(data.monthly) + '</div>' +
            '<div class="helper">' + data.transactions.length + ' lançamentos registrados</div>' +
          '</div>' +
        '</div>' +

        '<div class="grid alert-grid" style="margin-bottom:24px">' +
          '<div class="alert-card">' +
            '<span class="alert-icon red">' + svgIcon('pending-alert', 24) + '</span>' +
            '<div>' +
              '<strong>' + money(data.pending) + '</strong>' +
              '<span>Lançamentos pendentes de confirmação</span>' +
            '</div>' +
          '</div>' +
          '<div class="alert-card">' +
            '<span class="alert-icon teal">' + svgIcon('bill-alert', 24) + '</span>' +
            '<div>' +
              '<strong>' + money(data.openBills) + '</strong>' +
              '<span>Contas a pagar neste mês</span>' +
            '</div>' +
          '</div>' +
          '<div class="alert-card">' +
            '<span class="alert-icon yellow">' + svgIcon('card-alert', 24) + '</span>' +
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
      var owner = item.cardId ? cardById(item.cardId) : accountById(item.accountId);
      var text = (item.description + ' ' + displayCategory(item) + ' ' + (owner ? owner.name : '')).toLowerCase();
      var filterMatch = activeFilter === 'all' || activeFilter === item.type || (activeFilter === 'pending' && item.status === 'pending');
      var cardMatch = activeCardFilter === 'all' || item.cardId === activeCardFilter;
      var category = categoryById(item.categoryId);
      var categoryMatch = activeCategoryFilter === 'all' || item.categoryId === activeCategoryFilter || category && category.parentId === activeCategoryFilter;
      var accountMatch = activeAccountFilter === 'all' || item.accountId === activeAccountFilter;
      return filterMatch && cardMatch && categoryMatch && accountMatch && text.indexOf(searchTerm.toLowerCase()) >= 0;
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
    var totals = summaryFromTransactions(transactions);

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
          '<div class="filter-grid">' +
            '<div class="field filter-field"><label for="transaction-search">Buscar</label><input class="search" id="transaction-search" value="' + esc(searchTerm) + '" placeholder="Descrição ou categoria..." aria-label="Buscar lançamentos" /></div>' +
            '<div class="field filter-field"><label for="transaction-card-filter">Cartão</label><select id="transaction-card-filter">' + filterOptions(state.cards, activeCardFilter, 'Todos os cartões') + '</select></div>' +
            '<div class="field filter-field"><label for="transaction-category-filter">Categoria</label><select id="transaction-category-filter">' + filterOptions(state.categories, activeCategoryFilter, 'Todas as categorias') + '</select></div>' +
            '<div class="field filter-field"><label for="transaction-account-filter">Conta</label><select id="transaction-account-filter">' + filterOptions(state.accounts, activeAccountFilter, 'Todas as contas') + '</select></div>' +
          '</div>' +
          '<div class="filter-bar">' +
            '<button class="filter-chip' + (activeFilter === 'all' ? ' active' : '') + '" data-filter="all">Todos</button>' +
            '<button class="filter-chip' + (activeFilter === 'expense' ? ' active' : '') + '" data-filter="expense">Despesas</button>' +
            '<button class="filter-chip' + (activeFilter === 'income' ? ' active' : '') + '" data-filter="income">Receitas</button>' +
            '<button class="filter-chip' + (activeFilter === 'pending' ? ' active' : '') + '" data-filter="pending">Pendentes</button>' +
          '</div>' +
          '<div class="selection-summary"><div class="selection-total"><span>Receitas selecionadas</span><strong class="positive">' + money(totals.income) + '</strong></div><div class="selection-total"><span>Despesas selecionadas</span><strong class="negative">' + money(totals.expense) + '</strong></div></div>' +
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
                      '' + renderCardBadge(card) + '' +
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
    text.split(/<(?:CC)?STMTTRN>/i).slice(1).forEach(function (block) {
      var amount = parseMoney((block.match(/<TRNAMT>([^<\r\n]+)/i) || [])[1] || '0');
      var date = ((block.match(/<DTPOSTED>(\d{4})(\d{2})(\d{2})/i) || []).slice(1)).join('-');
      var description = (block.match(/<(?:NAME|MEMO)>([^<\r\n]+)/i) || [])[1] || 'Lançamento OFX';
      var fitId = (block.match(/<FITID>([^<\r\n]+)/i) || [])[1] || '';
      if (date && amount) {
        rows.push({
          date: date,
          description: description.trim(),
          amount: Math.abs(amount),
          type: amount >= 0 ? 'income' : 'expense',
          billingMonth: state.selectedMonth,
          sourceId: fitId
        });
      }
    });
    return rows;
  }

  function parseCSV(text) {
    var lines = text.split(/\r?\n/).filter(function (line) { return line.trim(); });
    if (!lines.length) return [];
    var delimiter = lines[0].indexOf(';') >= 0 ? ';' : ',';
    var header = parseDelimitedLine(lines[0], delimiter).map(function (value) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); });
    var dateIndex = header.findIndex(function (value) { return /data|date/.test(value); });
    var descriptionIndex = header.findIndex(function (value) { return /descri|histor|memo|name/.test(value); });
    var amountIndex = header.findIndex(function (value) { return /valor|amount|value/.test(value); });
    var monthIndex = header.findIndex(function (value) { return /fatura|competencia|billing|mes/.test(value); });
    if (dateIndex < 0 || amountIndex < 0) { dateIndex = 0; descriptionIndex = 1; amountIndex = 2; }
    return lines.slice(1).map(function (line) {
      var values = parseDelimitedLine(line, delimiter);
      var rawDate = values[dateIndex] || '';
      var date = csvDate(rawDate);
      var amount = parseMoney(values[amountIndex] || '0');
      var negative = String(values[amountIndex] || '').indexOf('-') >= 0;
      return {
        date: date,
        description: values[descriptionIndex] || 'Lançamento CSV',
        amount: Math.abs(amount),
        type: negative ? 'expense' : 'income',
        billingMonth: monthIndex >= 0 ? csvMonth(values[monthIndex]) : state.selectedMonth
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
  function legacyHandleClick(event) {
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

  function legacyHandleSubmit(event) {
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

  function legacyHandleChange(event) {
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

  function filterOptions(items, value, emptyLabel) {
    return '<option value="all">' + esc(emptyLabel) + '</option>' + items.map(function (item) { return '<option value="' + esc(item.id) + '"' + selected(item.id === value) + '>' + esc(item.name) + '</option>'; }).join('');
  }
  function billingMonthOptions(value) {
    var target = value || state.selectedMonth;
    var months = [];
    for (var index = -3; index <= 6; index += 1) months.push(addMonths(target + '-01', index).slice(0, 7));
    return months.map(function (month) { return '<option value="' + month + '"' + selected(month === target) + '>' + monthLabel(month) + '</option>'; }).join('');
  }
  function dateAfter(iso) {
    var date = new Date(iso + 'T12:00:00');
    date.setDate(date.getDate() + 1);
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }
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
      var category = categoryById(item.categoryId);
      return date >= start && date < end && (reportCardFilter === 'all' || item.cardId === reportCardFilter) && (reportCategoryFilter === 'all' || item.categoryId === reportCategoryFilter || category && category.parentId === reportCategoryFilter);
    });
  }
  function categorySummaryFromTransactions(transactions) {
    return state.categories.filter(function (category) { return !category.parentId; }).map(function (category) {
      var amount = transactions.filter(function (item) { var child = categoryById(item.categoryId); return item.type === 'expense' && (item.categoryId === category.id || child && child.parentId === category.id); }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);
      return { category: category, amount: amount };
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

  function renderReports() {
    var transactions = reportTransactions();
    var data = summaryFromTransactions(transactions);
    var categories = categorySummaryFromTransactions(transactions);
    var max = categories.length ? categories[0].amount : 1;
    var previousMonth = addMonths(state.selectedMonth + '-01', -1).slice(0, 7);
    var previous = summary(previousMonth);
    var period = reportStartDate || reportEndDate ? dateBR(reportStartDate || state.selectedMonth + '-01') + ' até ' + dateBR(reportEndDate || todayISO()) : monthLabel(state.selectedMonth);
    return renderTopbar('Relatórios & Analytics', 'Métricas detalhadas para guiar suas decisões') + '<div class="content"><section class="card section"><div class="section-heading"><div><h2>Filtros do relatório</h2><p>Combine período, cartão e categoria para uma análise precisa.</p></div><button class="button small outline" data-action="reset-report-filters">Limpar filtros</button></div><div class="filter-grid report-filter-grid"><div class="field filter-field"><label for="report-start">Data inicial</label><input id="report-start" type="date" value="' + esc(reportStartDate) + '" /></div><div class="field filter-field"><label for="report-end">Data final</label><input id="report-end" type="date" value="' + esc(reportEndDate) + '" /></div><div class="field filter-field"><label for="report-card-filter">Cartão</label><select id="report-card-filter">' + filterOptions(state.cards, reportCardFilter, 'Todos os cartões') + '</select></div><div class="field filter-field"><label for="report-category-filter">Categoria</label><select id="report-category-filter">' + filterOptions(state.categories, reportCategoryFilter, 'Todas as categorias') + '</select></div></div></section><div class="grid summary-grid"><div class="card summary-card expense"><span class="label">Despesas no período</span><div class="value negative">' + money(data.expense) + '</div><div class="helper">' + transactions.length + ' movimentos selecionados</div></div><div class="card summary-card income"><span class="label">Receitas no período</span><div class="value positive">' + money(data.income) + '</div><div class="helper">saldo: ' + money(data.income - data.expense) + '</div></div><div class="card summary-card limit"><span class="label">Maior categoria</span><div class="value accent">' + esc(categories[0] ? categories[0].category.name : '—') + '</div><div class="helper">' + (categories[0] ? money(categories[0].amount) : 'sem dados') + '</div></div><div class="card summary-card net-balance"><span class="label">Período analisado</span><div class="value accent report-period-value">' + esc(period) + '</div><div class="helper">filtros aplicados</div></div></div><div class="grid two-column"><section class="card section"><div class="section-heading"><div><h2>Ranking de Despesas por Categoria</h2><p>Detalhamento do recorte selecionado</p></div><button class="button small secondary" data-action="export-filtered-csv">Exportar CSV</button></div><div class="report-bars">' + (categories.length ? categories.map(function (row) { return '<div class="report-bar-row"><label>' + esc(row.category.name) + '</label><div class="report-bar"><span style="width:' + clamp(row.amount / max * 100, 0, 100) + '%"></span></div><strong>' + money(row.amount) + '</strong></div>'; }).join('') : '<div class="empty">Ajuste os filtros ou registre despesas para gerar o relatório.</div>') + '</div></section><section class="card section"><div class="section-heading"><div><h2>Fluxo Consolidado</h2><p>Entradas e saídas selecionadas</p></div></div><div class="budget-list"><div class="budget-row"><div class="budget-row-top"><strong>Receitas</strong><span class="positive">' + money(data.income) + '</span></div><div class="progress teal"><span style="width:100%"></span></div></div><div class="budget-row"><div class="budget-row-top"><strong>Despesas</strong><span class="negative">' + money(data.expense) + '</span></div><div class="progress red"><span style="width:' + (data.income ? clamp(data.expense / data.income * 100, 0, 100) : 0) + '%"></span></div></div><div class="budget-row"><div class="budget-row-top"><strong>Comparação mensal</strong><span class="accent">' + (previous.expense ? Math.round((data.expense / previous.expense - 1) * 100) + '%' : '—') + '</span></div><div class="budget-meta"><span>versus ' + esc(monthLabel(previousMonth)) + '</span><span>pendentes: ' + money(data.pending) + '</span></div></div></div></section></div></div>';
  }

  function renderTelegram() {
    var telegramState = state.telegram || { status: 'not-configured', botUsername: '', chatId: '' };
    var telegramTransactions = state.transactions.filter(function (item) { return (item.tags || []).indexOf('telegram') >= 0; }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }).slice(0, 6);
    var configured = telegramState.status === 'configured';
    return renderTopbar('Telegram', 'Transforme mensagens simples em lançamentos organizados') + '<div class="content"><div class="telegram-layout"><section class="card telegram-card telegram-intake"><div class="eyebrow">Entrada rápida</div><h2>Escreva como você fala</h2><p>O Todo Controle identifica valor, tipo, data, conta, cartão, categoria e mês da fatura.</p><form id="telegram-message-form"><div class="field"><label for="telegram-message">Mensagem financeira</label><textarea id="telegram-message" name="message" rows="4" placeholder="Ex.: gastei R$ 35,90 no mercado"></textarea></div><div class="telegram-examples"><button type="button" class="example-chip" data-telegram-example="gastei R$ 35,90 no mercado">gastei R$ 35,90 no mercado</button><button type="button" class="example-chip" data-telegram-example="recebi R$ 2.500,00 de salário">recebi R$ 2.500,00 de salário</button><button type="button" class="example-chip" data-telegram-example="compra R$ 89,90 no cartão Nubank, fatura outubro">compra no cartão + fatura</button></div><button class="button primary full" type="submit">' + svgIcon('plus', 16) + ' Registrar lançamento</button></form></section><section class="card telegram-card"><div class="section-heading"><div><div class="eyebrow">Ponte do bot</div><h2>Ponte segura do Telegram</h2><p>Esta configuração não pede nem armazena o token do bot no navegador.</p></div><span class="status ' + (configured ? 'positive' : '') + '">' + (configured ? 'configurado localmente' : 'interface pronta') + '</span></div><form id="telegram-config-form"><div class="field"><label for="telegram-bot-username">Usuário do bot</label><input id="telegram-bot-username" name="botUsername" value="' + esc(telegramState.botUsername) + '" placeholder="@todo_controle_bot" /></div><div class="field"><label for="telegram-chat-id">Chat ID vinculado</label><input id="telegram-chat-id" name="chatId" value="' + esc(telegramState.chatId) + '" placeholder="Será preenchido pelo pareamento" /></div><button class="button secondary full" type="submit">Salvar configuração local</button></form><div class="callout warning" style="margin-top:16px">O site publicado no GitHub Pages é estático. Para receber mensagens automaticamente no bot, ainda é necessário ligar um endpoint HTTPS seguro ao Telegram. Enquanto isso, esta tela já permite testar o mesmo formato de mensagem no app.</div></section></div><section class="card section"><div class="section-heading"><div><h2>Últimos lançamentos via Telegram</h2><p>Mensagens convertidas nesta instalação</p></div><button class="button small outline" data-view="transactions">Ver transações →</button></div><div class="transaction-list">' + (telegramTransactions.length ? telegramTransactions.map(function (item) { return transactionMarkup(item, true); }).join('') : '<div class="empty">Nenhum lançamento criado pelo Telegram ainda. Use um dos exemplos acima.</div>') + '</div></section></div>';
  }

  function renderMore() {
    var roots = state.categories.filter(function (category) { return !category.parentId; });
    return renderTopbar('Configurações & Dados', 'Gerencie seus dados locais, backups e preferências') + '<div class="content"><div class="grid two-column"><section class="card section"><div class="section-heading"><div><h2>Backup e Portabilidade</h2><p>Seus dados permanecem sob o seu total controle</p></div></div><div class="grid" style="gap:12px"><button class="button secondary full" data-action="export-json">Exportar Backup Completo (JSON)</button><button class="button outline full" data-action="open-import">Importar Fatura ou Extrato</button><button class="button danger full" data-action="reset-data">Restaurar Dados Padrão</button></div><div class="callout" style="margin-top:18px">O app salva dados neste dispositivo usando armazenamento local. Exporte um backup antes de trocar de navegador ou computador.</div></section><section class="card section"><div class="section-heading"><div><h2>Integrações</h2><p>Recursos conectados ao seu fluxo</p></div></div><div class="budget-list"><div class="budget-row"><div class="budget-row-top"><strong>Telegram</strong><span class="positive">interface pronta</span></div><div class="budget-meta"><span>Crie lançamentos por mensagens simples</span><button class="button small outline" data-view="telegram">Abrir →</button></div></div><div class="budget-row"><div class="budget-row-top"><strong>Open Finance</strong><span class="status">em preparação</span></div><div class="budget-meta"><span>Importe arquivos sem compartilhar senhas</span></div></div><div class="budget-row"><div class="budget-row-top"><strong>Privacidade</strong><span class="positive">local-first</span></div><div class="budget-meta"><span>Nenhuma senha bancária é solicitada</span></div></div></div></section></div><section class="card section"><div class="section-heading"><div><h2>Categorias e subcategorias</h2><p>Personalize sua organização financeira e os filtros dos relatórios.</p></div><button class="button primary small" data-action="open-category">' + svgIcon('plus', 14) + ' Nova Categoria</button></div><div class="category-tree">' + roots.map(function (root) { var children = state.categories.filter(function (category) { return category.parentId === root.id; }); return '<div class="category-tree-item"><div class="category-row"><span class="legend-dot" style="background:' + esc(root.color || '#6366f1') + '"></span><strong>' + esc(root.name) + '</strong><span class="category-count">' + children.length + ' subcategorias</span></div>' + children.map(function (child) { return '<div class="category-row category-child"><span class="legend-dot" style="background:' + esc(child.color || root.color || '#6366f1') + '"></span><span>' + esc(child.name) + '</span><span class="category-count">subcategoria</span></div>'; }).join('') + '</div>'; }).join('') + '</div></section><section class="card section"><div class="section-heading"><div><h2>Sobre o Todo Controle</h2><p>Uma ferramenta independente inspirada em boas práticas de organização financeira.</p></div><a class="button small outline" href="https://github.com/actualbudget/actual" target="_blank" rel="noreferrer">Ver Actual Budget →</a></div><div class="callout">Esta aplicação não é uma cópia do Mobills, do Fina ou do Actual Budget. Ela combina ideias de organização financeira em uma experiência própria.</div></section></div>';
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

  function renderCategoryModal() {
    var roots = state.categories.filter(function (category) { return !category.parentId; });
    return modalShell('Nova Categoria', 'Organize categorias e subcategorias do seu jeito', '<form id="category-form"><div class="form-grid"><div class="field wide"><label for="category-name">Nome</label><input id="category-name" name="name" placeholder="Ex.: Educação ou Moradia" required /></div><div class="field"><label for="category-parent">Categoria pai</label><select id="category-parent" name="parentId"><option value="">Categoria principal</option>' + roots.map(function (category) { return '<option value="' + esc(category.id) + '">' + esc(category.name) + '</option>'; }).join('') + '</select></div><div class="field"><label for="category-color">Cor</label><input id="category-color" name="color" type="color" value="#10b981" /></div></div><div class="callout" style="margin-top:14px">Uma categoria pai transforma o novo item em subcategoria. Os relatórios agrupam os dois níveis.</div></form>', '<button class="button outline" data-action="close-modal">Cancelar</button><button class="button primary" form="category-form">Criar Categoria</button>');
  }

  function renderTransactionModal() {
    var existing = modal.id ? state.transactions.find(function (item) { return item.id === modal.id; }) : null;
    var item = existing || { type: modal.defaultType || 'expense', amount: '', description: '', date: todayISO(), accountId: state.accounts[0] && state.accounts[0].id, cardId: state.cards[0] && state.cards[0].id, categoryId: state.categories[0] && state.categories[0].id, status: 'paid', installments: 1, recurring: false, tags: [], note: '', billingMonth: state.selectedMonth };
    var type = modal.typeValue || item.type;
    var cardExpense = type === 'card-expense' || Boolean(item.cardId);
    if (cardExpense && type === 'expense') type = 'card-expense';
    var transfer = type === 'transfer';
    var billingMonth = item.billingMonth || String(item.date || todayISO()).slice(0, 7);
    return modalShell(existing ? 'Editar Lançamento' : 'Novo Lançamento', 'Informe os dados para registrar o movimento', '<form id="transaction-form" data-id="' + esc(existing ? existing.id : '') + '"><div class="form-grid"><div class="field"><label for="tx-type">Tipo de Operação</label><select id="tx-type" name="type"><option value="expense"' + selected(type === 'expense') + '>Despesa (Conta)</option><option value="income"' + selected(type === 'income') + '>Receita / Entrada</option><option value="card-expense"' + selected(type === 'card-expense') + '>Despesa no Cartão</option><option value="transfer"' + selected(transfer) + '>Transferência entre Contas</option></select></div><div class="field"><label for="tx-amount">Valor (R$)</label><input id="tx-amount" name="amount" inputmode="decimal" placeholder="0,00" value="' + esc(item.amount || '') + '" required /></div><div class="field wide"><label for="tx-description">Descrição do Lançamento</label><input id="tx-description" name="description" placeholder="Ex.: Supermercado, aluguel ou salário" value="' + esc(item.description || '') + '" required /></div><div class="field"><label for="tx-date">Data da compra</label><input id="tx-date" name="date" type="date" value="' + esc(item.date || todayISO()) + '" required /></div>' + (transfer ? '<div class="field"><label for="tx-from">Conta Origem</label><select id="tx-from" name="fromAccountId">' + optionAccounts(item.fromAccountId || item.accountId) + '</select></div><div class="field"><label for="tx-to">Conta Destino</label><select id="tx-to" name="toAccountId">' + optionAccounts(item.toAccountId) + '</select></div>' : cardExpense ? '<div class="field"><label for="tx-card">Cartão</label><select id="tx-card" name="cardId">' + optionCards(item.cardId) + '</select></div><div class="field"><label for="tx-category">Categoria</label><select id="tx-category" name="categoryId">' + optionCategories(item.categoryId) + '</select></div><div class="field"><label for="tx-billing-month">Mês da fatura</label><select id="tx-billing-month" name="billingMonth">' + billingMonthOptions(billingMonth) + '</select><small>Mês em que a cobrança aparecerá na fatura.</small></div>' : '<div class="field"><label for="tx-account">Conta</label><select id="tx-account" name="accountId">' + optionAccounts(item.accountId) + '</select></div><div class="field"><label for="tx-category">Categoria</label><select id="tx-category" name="categoryId">' + optionCategories(item.categoryId) + '</select></div>') + (!transfer ? '<div class="field"><label for="tx-status">Status</label><select id="tx-status" name="status"><option value="paid"' + selected(item.status !== 'pending') + '>Confirmado</option><option value="pending"' + selected(item.status === 'pending') + '>Pendente</option></select></div><div class="field"><label for="tx-installments">Parcelas</label><input id="tx-installments" name="installments" type="number" min="1" max="60" value="' + esc(item.installments || 1) + '" /><small>As parcelas avançam pelo mês da fatura.</small></div><div class="field wide"><label for="tx-tags">Tags</label><input id="tx-tags" name="tags" placeholder="fixa, trabalho, família" value="' + esc((item.tags || []).join(', ')) + '" /></div><div class="field wide"><label for="tx-note">Observação</label><textarea id="tx-note" name="note" placeholder="Anote algo importante">' + esc(item.note || '') + '</textarea></div><label class="check-row wide"><input type="checkbox" name="recurring"' + checked(item.recurring) + ' /> Marcar como recorrente</label>' : '') + '</div></form>', '<button class="button outline" data-action="close-modal">Cancelar</button><button class="button primary" form="transaction-form">Salvar Lançamento</button>');
  }

  function renderImportModal() {
    var hasRows = importRows.length > 0;
    return modalShell('Importar Fatura ou Extrato', 'OFX, QFX e CSV são processados localmente', '<form id="import-form"><div class="field"><label for="import-file">Arquivo</label><input id="import-file" name="file" type="file" accept=".ofx,.qfx,.csv,text/csv,application/x-ofx"' + (hasRows ? '' : ' required') + ' /><small>Faturas OFX/QFX com CCSTMTTRN também são reconhecidas.</small></div><div class="form-grid" style="margin-top:14px"><div class="field"><label for="import-destination-type">Destino</label><select id="import-destination-type" name="destinationType"><option value="account">Extrato de conta</option><option value="card">Fatura de cartão</option></select></div><div class="field"><label for="import-account">Conta de destino</label><select id="import-account" name="accountId">' + optionAccounts(state.accounts[0] && state.accounts[0].id) + '</select></div><div class="field"><label for="import-card">Cartão de destino</label><select id="import-card" name="cardId">' + optionCards(state.cards[0] && state.cards[0].id) + '</select></div><div class="field"><label for="import-billing-month">Mês da fatura</label><select id="import-billing-month" name="importBillingMonth">' + billingMonthOptions(state.selectedMonth) + '</select></div></div>' + (hasRows ? '<div class="import-preview"><div class="callout">' + importRows.length + ' lançamentos identificados. Revise o destino antes de confirmar.</div><table class="data-table"><thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>Fatura</th></tr></thead><tbody>' + importRows.slice(0, 12).map(function (row) { return '<tr><td>' + dateBR(row.date) + '</td><td>' + esc(row.description) + '</td><td class="' + (row.type === 'income' ? 'positive' : 'negative') + '">' + money(row.amount) + '</td><td>' + esc(row.billingMonth ? monthLabel(row.billingMonth) : 'definido acima') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '') + '</form>', '<button class="button outline" data-action="close-modal">Cancelar</button><button class="button primary" form="import-form">' + (hasRows ? 'Importar ' + importRows.length : 'Ler Arquivo') + '</button>');
  }

  function renderModal() {
    if (!modal) return '';
    if (modal.type === 'transaction') return renderTransactionModal();
    if (modal.type === 'category') return renderCategoryModal();
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

  function handleClick(event) {
    var target = event.target.closest('button, a, .modal-backdrop');
    if (!target) return;
    var example = target.getAttribute('data-telegram-example');
    if (example) { var input = document.getElementById('telegram-message'); if (input) { input.value = example; input.focus(); } return; }
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
      state.categories.push({ id: uid('cat'), name: categoryName, parentId: categoryData.parentId || '', color: categoryData.color || '#10b981' });
      save(); closeAll(); showToast('Categoria criada.'); return;
    }
    if (form.id === 'telegram-config-form') {
      event.preventDefault();
      var telegramData = formData(form);
      state.telegram = { status: telegramData.botUsername || telegramData.chatId ? 'configured' : 'not-configured', botUsername: telegramData.botUsername || '', chatId: telegramData.chatId || '' };
      save(); render(); showToast('Configuração local do Telegram salva.'); return;
    }
    if (form.id === 'telegram-message-form') {
      event.preventDefault();
      var messageData = formData(form);
      var parsed = parseTelegramMessage(messageData.message);
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
      if (!amount || !data.description) { showToast('Informe a descrição e o valor da operação.'); return; }
      if (type === 'card-expense') type = 'expense';
      if (type === 'transfer' && data.fromAccountId === data.toAccountId) { showToast('Escolha contas de origem e destino diferentes.'); return; }
      var installments = Math.max(1, Number(data.installments || 1));
      var purchaseDate = data.date || todayISO();
      var invoiceMonth = inputType === 'card-expense' ? (data.billingMonth || purchaseDate.slice(0, 7)) : '';
      var base = { description: data.description, amount: amount, date: purchaseDate, status: data.status || 'paid', tags: data.tags ? data.tags.split(',').map(function (tag) { return tag.trim(); }).filter(Boolean) : [], note: data.note || '', recurring: Boolean(data.recurring), billingMonth: invoiceMonth };
      var id = form.getAttribute('data-id');
      if (id) {
        var existing = state.transactions.find(function (item) { return item.id === id; });
        if (existing) Object.assign(existing, base, type === 'transfer' ? { type: 'transfer', fromAccountId: data.fromAccountId, toAccountId: data.toAccountId, accountId: '', cardId: '', categoryId: '', billingMonth: '' } : { type: type, accountId: inputType === 'card-expense' ? '' : data.accountId || '', cardId: inputType === 'card-expense' ? data.cardId || '' : '', categoryId: data.categoryId || '', fromAccountId: '', toAccountId: '' });
        showToast('Lançamento atualizado com sucesso.');
      } else {
        for (var index = 0; index < installments; index += 1) state.transactions.push(Object.assign({}, base, { id: uid('tx'), type: type, date: addMonths(base.date, index), billingMonth: inputType === 'card-expense' ? addMonths(invoiceMonth + '-01', index).slice(0, 7) : '', installmentNumber: installments > 1 ? index + 1 : 0, installments: installments > 1 ? installments : 0, accountId: inputType === 'card-expense' ? '' : data.accountId || '', cardId: inputType === 'card-expense' ? data.cardId || '' : '', categoryId: data.categoryId || '', fromAccountId: data.fromAccountId || '', toAccountId: data.toAccountId || '' }));
        showToast('Lançamento registrado com sucesso.');
      }
      save(); closeAll(); return;
    }
    if (form.id === 'import-form') {
      event.preventDefault();
      var fileInput = form.querySelector('input[type="file"]');
      var file = fileInput && fileInput.files[0];
      if (!importRows.length && file) { readImportFile(file); return; }
      if (!importRows.length) { showToast('Selecione um arquivo de extrato primeiro.'); return; }
      var importData = formData(form);
      var destinationType = importData.destinationType || 'account';
      var importedAccountId = destinationType === 'card' ? '' : importData.accountId || (state.accounts[0] && state.accounts[0].id);
      var importedCardId = destinationType === 'card' ? importData.cardId || (state.cards[0] && state.cards[0].id) : '';
      importRows.forEach(function (row) { state.transactions.push({ id: uid('tx'), date: row.date, description: row.description, type: row.type, amount: row.amount, accountId: importedAccountId, cardId: importedCardId, billingMonth: destinationType === 'card' ? (row.billingMonth || importData.importBillingMonth || state.selectedMonth) : '', categoryId: '', status: 'paid', tags: ['importado', destinationType === 'card' ? 'fatura-cartao' : 'extrato'], note: 'Importado localmente' }); });
      var count = importRows.length;
      save(); closeAll(); showToast(count + ' lançamentos importados com sucesso.'); return;
    }
    legacyHandleSubmit(event);
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
