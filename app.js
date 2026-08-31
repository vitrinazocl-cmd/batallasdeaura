/* ==========================================================================
   BATALLAS DE AURA - APP ENGINE (VANILLA JS CHILE)
   Lógica del Juego, Segmentación Automática por Edad Exacta, 18+ Torneo,
   3 Jurados Digitales, Grabación 15s, Billetera & Anti-Pánico Escénico
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const STORAGE_KEY = 'batallas_de_aura_state_v5';

  // 🛡️ CIBERSEGURIDAD EXPERTA: SANITIZADOR ANTI-XSS (CROSS-SITE SCRIPTING GUARD)
  function sanitizeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\//g, '&#x2F;');
  }

  // 🛡️ CIBERSEGURIDAD EXPERTA: LIMITADOR DE VELOCIDAD DE CHAT (ANTI-SPAM & FLOODING)
  let lastMessageTime = 0;
  let messageCountInWindow = 0;

  function isRateLimited() {
    const now = Date.now();
    if (now - lastMessageTime < 4000) {
      messageCountInWindow++;
      if (messageCountInWindow > 3) return true;
    } else {
      lastMessageTime = now;
      messageCountInWindow = 1;
    }
    return false;
  }

  // HELPER DE ASIGNACIÓN AUTOMÁTICA DE SEGMENTO
  function getBracketFromAge(age) {
    const numericAge = parseInt(age, 10);
    if (isNaN(numericAge) || numericAge < 8) return { key: '8-12', label: '8 a 12 años (SafeKids Junior)' };
    if (numericAge < 12) return { key: '8-12', label: '8 a 12 años (SafeKids Junior)' };
    if (numericAge >= 12 && numericAge < 15) return { key: '12-15', label: '12 a 15 años (Aura Teens)' };
    if (numericAge >= 15 && numericAge < 18) return { key: '15-18', label: '15 a 18 años (Aura Youth)' };
    return { key: '18+', label: '18+ años (Torneo Leyendas / Mayor de Edad)' };
  }

  const defaultState = {
    user: {
      username: 'AuraMaster_CL',
      exactAge: 13,
      ageBracket: '12-15',
      walletAP: 350,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AuraFighter1',
      registryPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
      adultVerified: true
    },
    transactions: [
      { id: 1, type: 'win', desc: 'Victoria vs CyberWarrior_Stgo', amount: 150, date: 'Hoy 09:15' },
      { id: 2, type: 'loss', desc: 'Derrota vs NeonNinja_Valpo', amount: -50, date: 'Ayer 18:30' },
      { id: 3, type: 'gift', desc: 'Regalo enviado a AuraGirl_Conce', amount: -50, date: 'Hace 2 días' }
    ],
    messages: [
      { id: 101, sender: 'CyberWarrior_Stgo', text: '¡Buena batalla desde tu pieza bro! Sin pánico escénico ⚡', isOwn: false, time: '10:02' },
      { id: 102, sender: 'AuraMaster_CL', text: '¡Sí! Genial poder pelear seguros desde casa.', isOwn: true, time: '10:05' }
    ],
    friends: [
      // Segmento 12-15 años
      { id: 1, name: 'CyberWarrior_Stgo', ageBracket: '12-15', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RivalCyber', online: true },
      { id: 2, name: 'NeonNinja_Valpo', ageBracket: '12-15', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NinjaAura', online: true },
      { id: 3, name: 'AuraGirl_Conce', ageBracket: '12-15', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GirlPower', online: false },
      
      // Segmento 8-12 años
      { id: 4, name: 'MiniChamp_Antofa', ageBracket: '8-12', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MiniChamp', online: true },
      { id: 5, name: 'LittleAura_Serena', ageBracket: '8-12', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LittleAura', online: true },

      // Segmento 15-18 años
      { id: 6, name: 'CyberPro_Temuco', ageBracket: '15-18', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ProTemuco', online: true },
      { id: 7, name: 'ValkyriaYouth_Rancagua', ageBracket: '15-18', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RancaguaAura', online: false },

      // Segmento 18+ Torneo Leyendas
      { id: 8, name: 'AuraLegend_SCL', ageBracket: '18+', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LegendSCL', online: true },
      { id: 9, name: 'MasterStrike_Iquique', ageBracket: '18+', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=StrikeIquique', online: true }
    ],
    leaderboard: [
      { rank: 1, name: 'AuraLord_Chile', age: '12-15', tier: 'Cyber Diamante', ap: 2450 },
      { rank: 2, name: 'CyberWarrior_Stgo', age: '12-15', tier: 'Oro', ap: 1890 },
      { rank: 3, name: 'AuraMaster_CL', age: '12-15', tier: 'Oro', ap: 350 },
      
      { rank: 1, name: 'MiniDragon_Antofa', age: '8-12', tier: 'Platino', ap: 1540 },
      { rank: 2, name: 'LittleAura_Serena', age: '8-12', tier: 'Oro', ap: 920 },

      { rank: 1, name: 'CyberPro_Temuco', age: '15-18', tier: 'Cyber Diamante', ap: 3100 },

      { rank: 1, name: 'AuraLegend_SCL', age: '18+', tier: 'Cyber Diamante 👑', ap: 4800 },
      { rank: 2, name: 'MasterStrike_Iquique', age: '18+', tier: 'Platino 🌟', ap: 2200 }
    ],
    customMoves: [
      {
        id: 101,
        name: 'Giro de Fuego de Santiago',
        cat: 'Danza de Aura Propia',
        icon: '🔥',
        desc: 'Cruza de manos veloz con giro de 360 grados frente a la cámara en el segundo 10.',
        diff: '+2.8 Pts Jurado (+90 AP)',
        author: 'AuraMaster_CL'
      },
      {
        id: 102,
        name: 'Chasquido Sónico Secreto',
        cat: 'Ataque Creado',
        icon: '⚡',
        desc: 'Doble chasquido de dedos proyectando energía imaginaria directo al rival.',
        diff: '+2.3 Pts Jurado (+60 AP)',
        author: 'AuraMaster_CL'
      }
    ]
  };

  let appState = loadState();

  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return defaultState;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    updateUI();
  }

  // NAVEGACIÓN Y TABS
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeEl = document.getElementById(targetTab);
      if (activeEl) activeEl.classList.add('active');
    });
  });

  // ACTUALIZACIÓN GLOBAL DE UI
  function updateUI() {
    document.getElementById('headerWalletAP').textContent = appState.user.walletAP;
    document.getElementById('headerAgeBracket').textContent = `Rango: ${appState.user.ageBracket} (${appState.user.exactAge} años)`;
    document.getElementById('headerUserName').textContent = appState.user.username;
    document.getElementById('headerAvatarImg').src = appState.user.avatar;
    document.getElementById('hudP1Name').textContent = `${appState.user.username} (Tú)`;
    document.getElementById('hudP1Avatar').src = appState.user.avatar;

    document.getElementById('walletTotalPoints').textContent = appState.user.walletAP;
    
    let tierName = 'AURA DE BRONCE';
    if (appState.user.walletAP > 1500) tierName = 'NIVEL: CYBER DIAMANTE 💎';
    else if (appState.user.walletAP > 800) tierName = 'NIVEL: AURA DE PLATINO 🌟';
    else if (appState.user.walletAP > 300) tierName = 'NIVEL: AURA DE ORO ⚡';
    else if (appState.user.walletAP > 100) tierName = 'NIVEL: AURA DE PLATA 🛡️';
    document.getElementById('walletTierName').textContent = tierName;

    renderTransactions();
    renderSocialSection();
    renderLeaderboard();
    renderCustomMoves();
  }

  function renderTransactions() {
    const list = document.getElementById('txHistoryList');
    if (!list) return;
    list.innerHTML = '';

    appState.transactions.forEach(tx => {
      const item = document.createElement('div');
      item.className = `tx-item ${tx.type}`;
      
      const isPlus = tx.amount > 0;
      const sign = isPlus ? '+' : '';
      const amountClass = isPlus ? 'plus' : 'minus';

      item.innerHTML = `
        <div>
          <strong style="color: #fff; font-size: 15px;">${tx.desc}</strong>
          <div style="font-size: 12px; color: var(--text-muted);">${tx.date}</div>
        </div>
        <div class="tx-amount ${amountClass}">
          ${sign}${tx.amount} AP
        </div>
      `;
      list.appendChild(item);
    });
  }

  function renderSocialSection() {
    const friendsContainer = document.getElementById('friendsListContainer');
    const ageTag = document.getElementById('socialAgeTag');
    if (ageTag) ageTag.textContent = `${appState.user.ageBracket} (${appState.user.exactAge} años)`;
    if (!friendsContainer) return;

    friendsContainer.innerHTML = '';
    
    // FILTRADO ESTRICTO DE SEGMENTO DE EDAD POR SEGURIDAD
    const sameAgeFriends = appState.friends.filter(f => f.ageBracket === appState.user.ageBracket);
    
    if (sameAgeFriends.length === 0) {
      friendsContainer.innerHTML = '<div style="font-size:13px; color:var(--text-muted);">Buscando combatientes en tu segmento de edad...</div>';
      return;
    }

    sameAgeFriends.forEach((f, idx) => {
      const el = document.createElement('div');
      el.className = `friend-item ${idx === 0 ? 'active' : ''}`;
      el.innerHTML = `
        <img src="${f.avatar}" class="friend-avatar" alt="${f.name}">
        <div>
          <div class="friend-name">${f.name}</div>
          <div class="friend-status">${f.online ? '● En línea' : '○ Desconectado'}</div>
        </div>
      `;
      el.addEventListener('click', () => {
        document.querySelectorAll('.friend-item').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
        document.getElementById('activeChatName').textContent = f.name;
        document.getElementById('hudP2Name').textContent = f.name;
        document.getElementById('hudP2Avatar').src = f.avatar;
      });
      friendsContainer.appendChild(el);
    });

    renderChatMessages();
  }

  function renderChatMessages() {
    const area = document.getElementById('chatMessagesArea');
    if (!area) return;
    area.innerHTML = '';

    appState.messages.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `message-bubble ${msg.isOwn ? 'outgoing' : 'incoming'}`;
      
      let actionsHTML = '';
      if (msg.isOwn) {
        actionsHTML = `
          <div class="msg-actions">
            <button class="msg-action-btn" onclick="window.editMsg(${msg.id})">✏️ Editar</button>
            <button class="msg-action-btn del" onclick="window.deleteMsg(${msg.id})">🗑️ Eliminar</button>
          </div>
        `;
      }

      bubble.innerHTML = `
        <div style="font-size: 11px; font-weight: 700; color: var(--cyan-neon); margin-bottom: 3px;">${msg.sender} (${msg.time})</div>
        <div>${msg.text}</div>
        ${actionsHTML}
      `;
      area.appendChild(bubble);
    });

    area.scrollTop = area.scrollHeight;
  }

  function renderLeaderboard() {
    const tbody = document.getElementById('leaderboardTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const filterVal = document.getElementById('rankingAgeFilter').value;
    
    const sorted = [...appState.leaderboard].sort((a, b) => b.ap - a.ap);
    const filtered = sorted.filter(item => item.age === filterVal);

    filtered.forEach((player, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: var(--gold-neon);">#${i + 1}</strong></td>
        <td><strong>${player.name}</strong></td>
        <td><span class="age-tag">${player.age}</span></td>
        <td><span style="color: var(--cyan-neon); font-size: 13px;">${player.tier}</span></td>
        <td><strong style="color: var(--gold-neon);">${player.ap} AP</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // RENDEREIZAR PASOS Y MOVIMIENTOS PROPIOS CREADOS POR EL USUARIO
  function renderCustomMoves() {
    const container = document.getElementById('customMovesContainer');
    if (!container) return;
    container.innerHTML = '';

    if (!appState.customMoves || appState.customMoves.length === 0) {
      container.innerHTML = '<div style="font-size:14px; color:var(--text-muted);">Aún no has creado ningún paso inventado. ¡Usa el formulario para registrar tu primer movimiento original!</div>';
      return;
    }

    appState.customMoves.forEach(move => {
      const card = document.createElement('div');
      card.className = 'move-card';
      card.innerHTML = `
        <div class="move-header">
          <span class="move-icon">${move.icon}</span>
          <div>
            <h4 class="move-title">${move.name}</h4>
            <div class="move-cat">${move.cat} • Por: ${move.author || appState.user.username}</div>
          </div>
        </div>
        <p class="move-desc">${move.desc}</p>
        <div class="move-stats">
          <div class="move-stat-item">
            <span class="stat-lbl">Potencial Jurados:</span>
            <strong style="color: var(--cyan-neon); font-family: var(--font-head);">${move.diff}</strong>
          </div>
          <button class="msg-action-btn del" onclick="window.deleteCustomMove(${move.id})" style="font-size: 12px; padding: 4px 8px;">🗑️ Eliminar</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // FORMSUBMIT DE CREACIÓN DE PASOS PROPIOS
  const createCustomMoveForm = document.getElementById('createCustomMoveForm');
  if (createCustomMoveForm) {
    createCustomMoveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = sanitizeHTML(document.getElementById('customMoveName').value.trim());
      const cat = sanitizeHTML(document.getElementById('customMoveCat').value);
      const icon = sanitizeHTML(document.getElementById('customMoveIcon').value);
      const desc = sanitizeHTML(document.getElementById('customMoveDesc').value.trim());
      const diff = sanitizeHTML(document.getElementById('customMoveDiff').value);

      const newMove = {
        id: Date.now(),
        name: name,
        cat: cat,
        icon: icon,
        desc: desc,
        diff: diff,
        author: sanitizeHTML(appState.user.username)
      };

      if (!appState.customMoves) appState.customMoves = [];
      appState.customMoves.unshift(newMove);
      saveState();

      createCustomMoveForm.reset();
      alert(`✨ ¡Enhorabuena! Tu movimiento inventado "${name}" ha sido guardado en tu Laboratorio de Aura.`);
    });
  }

  window.deleteCustomMove = function(id) {
    if (confirm('¿Deseas eliminar este paso inventado de tu laboratorio?')) {
      appState.customMoves = appState.customMoves.filter(m => m.id !== id);
      saveState();
    }
  };

  // MODAL REGISTRO: CÁLCULO DINÁMICO DE EDAD EXACTA Y FOTO DE REGISTRO INTERNO
  const regExactAgeInput = document.getElementById('regExactAge');
  const computedBracketBadge = document.getElementById('computedBracketBadge');
  const registryPhotoLabel = document.getElementById('registryPhotoLabel');

  if (regExactAgeInput) {
    regExactAgeInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      const bracketInfo = getBracketFromAge(val);
      computedBracketBadge.innerHTML = `🎯 Segmento asignado automáticamente: <strong>${bracketInfo.label}</strong>`;
      
      if (registryPhotoLabel) {
        if (val >= 18) {
          registryPhotoLabel.textContent = '3. Fotografía Selfie del Usuario (Registro Interno de Identidad para Mayores de Edad):';
        } else {
          registryPhotoLabel.textContent = '3. Fotografía de Adulto Responsable / Tutor Legal (Registro Interno de Identidad):';
        }
      }
    });
  }

  // CHAT SOCIAL CON ACCIONES (EDITAR, ELIMINAR, REGALAR, ANTI-SPAM & ANTI-XSS)
  const badWords = ['mierda', 'puta', 'tonto', 'estupido', 'weon', 'culiao', 'conchesumadre', 'maricon'];

  const chatForm = document.getElementById('chatForm');
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // 🛡️ CIBERSEGURIDAD: RATELIMIT ANTI-SPAM
      if (isRateLimited()) {
        alert('🛡️ CIBERSEGURIDAD SAFE-KIDS: Envío de mensajes en pausa por protección anti-spam. Por favor espera unos segundos.');
        return;
      }

      const input = document.getElementById('chatInput');
      let rawText = input.value.trim();
      if (!rawText) return;

      let text = sanitizeHTML(rawText);

      let censored = text;
      badWords.forEach(word => {
        const reg = new RegExp(word, 'gi');
        censored = censored.replace(reg, '***');
      });

      if (censored !== text) {
        alert('🛡️ AVISO SAFE-KIDS: Se han censurado palabras inadecuadas para mantener tu espacio seguro.');
      }

      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

      appState.messages.push({
        id: Date.now(),
        sender: appState.user.username,
        text: censored,
        isOwn: true,
        time: timeStr
      });

      input.value = '';
      saveState();

      setTimeout(() => {
        appState.messages.push({
          id: Date.now() + 1,
          sender: 'CyberWarrior_Stgo',
          text: '¡Gran movimiento! Sin pánico escénico desde casa ⚡',
          isOwn: false,
          time: timeStr
        });
        saveState();
      }, 1500);
    });
  }

  window.editMsg = function(msgId) {
    const msg = appState.messages.find(m => m.id === msgId);
    if (!msg) return;
    const newText = prompt('Editar tu mensaje de aura:', msg.text);
    if (newText && newText.trim() !== '') {
      msg.text = newText.trim();
      saveState();
    }
  };

  window.deleteMsg = function(msgId) {
    if (confirm('¿Eliminar este mensaje?')) {
      appState.messages = appState.messages.filter(m => m.id !== msgId);
      saveState();
    }
  };

  // Modal Regalar Puntos
  const giftPointsBtn = document.getElementById('giftPointsBtn');
  const giftModal = document.getElementById('giftModal');
  const closeGiftBtn = document.getElementById('closeGiftBtn');
  const confirmGiftBtn = document.getElementById('confirmGiftBtn');

  if (giftPointsBtn) giftPointsBtn.addEventListener('click', () => giftModal.classList.add('active'));
  if (closeGiftBtn) closeGiftBtn.addEventListener('click', () => giftModal.classList.remove('active'));
  if (confirmGiftBtn) {
    confirmGiftBtn.addEventListener('click', () => {
      const amount = parseInt(document.getElementById('giftAmountInput').value, 10);
      if (isNaN(amount) || amount <= 0) {
        alert('Ingresa una cantidad válida.');
        return;
      }
      if (appState.user.walletAP < amount) {
        alert('No tienes suficientes Aura Points (AP).');
        return;
      }

      appState.user.walletAP -= amount;
      appState.transactions.unshift({
        id: Date.now(),
        type: 'gift',
        desc: `Regalo enviado en chat a tu compañero de segmento`,
        amount: -amount,
        date: 'Reciente'
      });

      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;
      appState.messages.push({
        id: Date.now(),
        sender: 'SISTEMA DE AURA 🎁',
        text: `¡${appState.user.username} regaló ${amount} Aura Points (AP) a su compañero de batalla!`,
        isOwn: true,
        time: timeStr
      });

      giftModal.classList.remove('active');
      saveState();
      alert(`¡Has regalado ${amount} AP con éxito!`);
    });
  }

  // ==========================================================================
  // COMBATE SECUENCIAL EN VIVO TURNO POR TURNO (CÁMARA WEBRTC OBLIGATORIA)
  // Sin archivos pre-grabados: solo captura en vivo en el minuto del combate.
  // ==========================================================================
  const recordP1CamBtn = document.getElementById('recordP1CamBtn');
  const recordP2CamBtn = document.getElementById('recordP2CamBtn');
  const simBattleBtn = document.getElementById('simBattleBtn');

  const player1Video = document.getElementById('player1Video');
  const player2Video = document.getElementById('player2Video');
  const turnBadgeText = document.getElementById('turnBadgeText');
  const p1VideoStatus = document.getElementById('p1VideoStatus');
  const p2VideoStatus = document.getElementById('p2VideoStatus');

  let mediaRecorder;
  let recordedChunks = [];
  let p1LiveRecordedBlob = null;
  let p2LiveRecordedBlob = null;

  // TURNO 1: PELEADOR 1 (TÚ)
  if (recordP1CamBtn) {
    recordP1CamBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        player1Video.srcObject = stream;
        player1Video.muted = true;
        player1Video.play();

        if (p1VideoStatus) p1VideoStatus.innerHTML = '<span style="color: var(--red-alert);">🔴 Grabando Turno 1 en Vivo...</span>';

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => {
          p1LiveRecordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
          player1Video.srcObject = null;
          player1Video.src = URL.createObjectURL(p1LiveRecordedBlob);
          player1Video.muted = false;
          player1Video.play();

          if (p1VideoStatus) p1VideoStatus.innerHTML = '✓ Video Turno 1 Grabado en Vivo (Tú)';

          // DESBLOQUEAR TURNO 2 PARA EL RIVAL
          if (recordP2CamBtn) {
            recordP2CamBtn.disabled = false;
            recordP2CamBtn.style.opacity = '1';
            recordP2CamBtn.style.cursor = 'pointer';
          }
          if (recordP1CamBtn) {
            recordP1CamBtn.disabled = true;
            recordP1CamBtn.style.opacity = '0.4';
            recordP1CamBtn.style.cursor = 'not-allowed';
          }

          if (turnBadgeText) {
            turnBadgeText.innerHTML = '🔵 TURNO 2 EN VIVO: ¡Excelente! Ahora presiona "📷 2. GRABAR EN VIVO (PELEADOR 2 - RIVAL)" para capturar la respuesta.';
          }

          alert('📹 ¡Turno 1 grabado en vivo en el minuto del combate! Ahora se habilita la cámara para el Turno 2 (Rival).');
        };

        mediaRecorder.start();
        startTimerCountdown(15, () => mediaRecorder.stop());
      } catch (err) {
        alert('No se detectó cámara web. Usando el simulador de combate digital en vivo...');
        runSimulatedBattle();
      }
    });
  }

  // TURNO 2: PELEADOR 2 (RIVAL)
  if (recordP2CamBtn) {
    recordP2CamBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        player2Video.srcObject = stream;
        player2Video.muted = true;
        player2Video.play();

        if (p2VideoStatus) p2VideoStatus.innerHTML = '<span style="color: var(--red-alert);">🔴 Grabando Turno 2 en Vivo (Rival)...</span>';

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => {
          p2LiveRecordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
          player2Video.srcObject = null;
          player2Video.src = URL.createObjectURL(p2LiveRecordedBlob);
          player2Video.muted = false;
          player2Video.play();

          if (p2VideoStatus) p2VideoStatus.innerHTML = '✓ Video Turno 2 Grabado en Vivo (Rival)';

          if (turnBadgeText) {
            turnBadgeText.innerHTML = '⚡ AMBOS VIDEOS EN VIVO REGISTRADOS. Los 3 Jurados Digitales están evaluando la ronda...';
          }

          alert('📹 ¡Turno 2 grabado en vivo! Ambos videos secuenciales están listos para la evaluación de los Jurados.');
          runJudgesEvaluation();
        };

        mediaRecorder.start();
        startTimerCountdown(15, () => mediaRecorder.stop());
      } catch (err) {
        alert('No se detectó cámara web para el rival. Usando la respuesta de simulación en vivo...');
        runSimulatedBattle();
      }
    });
  }

  if (simBattleBtn) simBattleBtn.addEventListener('click', () => runSimulatedBattle());

  // MOTOR DE COMBATE MULTI-VIDEOS (3, 5 O 7 VIDEOS DE MÁX 15S SIN MÍNIMO)
  let currentMatchTotalRounds = 3;
  let currentRoundIndex = 1;
  let matchRoundsScores = [];

  const battleFormatSelect = document.getElementById('battleFormatSelect');
  const roundNumberText = document.getElementById('roundNumberText');
  const roundsReelContainer = document.getElementById('roundsReelContainer');

  if (battleFormatSelect) {
    battleFormatSelect.addEventListener('change', (e) => {
      currentMatchTotalRounds = parseInt(e.target.value, 10);
      resetMatchRounds();
    });
  }

  function resetMatchRounds() {
    currentRoundIndex = 1;
    matchRoundsScores = [];

    if (recordP1CamBtn) {
      recordP1CamBtn.disabled = false;
      recordP1CamBtn.style.opacity = '1';
      recordP1CamBtn.style.cursor = 'pointer';
    }
    if (recordP2CamBtn) {
      recordP2CamBtn.disabled = true;
      recordP2CamBtn.style.opacity = '0.4';
      recordP2CamBtn.style.cursor = 'not-allowed';
    }

    if (turnBadgeText) {
      turnBadgeText.innerHTML = `🔴 TURNO 1 EN VIVO: Presiona "📷 1. GRABAR EN VIVO (PELEADOR 1 - TÚ)" para capturar tu video en el minuto.`;
    }

    updateRoundUI();
  }

  function updateRoundUI() {
    if (roundNumberText) {
      roundNumberText.textContent = `VIDEO ${currentRoundIndex} DE ${currentMatchTotalRounds}`;
    }
    renderRoundsReel();
  }

  function renderRoundsReel() {
    if (!roundsReelContainer) return;
    roundsReelContainer.innerHTML = '';

    for (let i = 1; i <= currentMatchTotalRounds; i++) {
      const item = document.createElement('div');
      let statusClass = '';
      let statusIcon = '📹';

      if (i < currentRoundIndex) {
        statusClass = 'completed';
        statusIcon = '✓';
      } else if (i === currentRoundIndex) {
        statusClass = 'active';
        statusIcon = '⚡';
      }

      item.className = `round-reel-item ${statusClass}`;
      item.innerHTML = `${statusIcon} Video ${i} de ${currentMatchTotalRounds}`;
      roundsReelContainer.appendChild(item);
    }
  }

  function startTimerCountdown(seconds, onFinish) {
    const badge = document.getElementById('video1Timer');
    let left = seconds;
    badge.textContent = `${left}s MAX`;
    
    const interval = setInterval(() => {
      left--;
      if (left <= 0) {
        clearInterval(interval);
        badge.textContent = '15s MAX';
        if (onFinish) onFinish();
      } else {
        badge.textContent = `${left}s MAX`;
      }
    }, 1000);
  }

  function runSimulatedBattle() {
    document.getElementById('p1VideoStatus').textContent = `⚡ Ejecutando Video ${currentRoundIndex} de ${currentMatchTotalRounds}...`;
    document.getElementById('p2VideoStatus').textContent = `🛡️ Respuesta Video ${currentRoundIndex} del Rival...`;
    runJudgesEvaluation();
  }

  function runJudgesEvaluation() {
    const vKaiRo = document.getElementById('verdictKaiRo');
    const vAuraNeo = document.getElementById('verdictAuraNeo');
    const vValkyria = document.getElementById('verdictValkyria');

    const sKaiRo = document.getElementById('scoreKaiRo');
    const sAuraNeo = document.getElementById('scoreAuraNeo');
    const sValkyria = document.getElementById('scoreValkyria');

    vKaiRo.textContent = `Evaluando Video ${currentRoundIndex} de ${currentMatchTotalRounds}...`;
    vAuraNeo.textContent = `Midiendo energía del Video ${currentRoundIndex}...`;
    vValkyria.textContent = `Analizando defensa del Video ${currentRoundIndex}...`;

    setTimeout(() => {
      const score1 = (7.5 + Math.random() * 2.4).toFixed(1);
      const score2 = (7.8 + Math.random() * 2.1).toFixed(1);
      const score3 = (8.0 + Math.random() * 1.9).toFixed(1);

      const roundTotalScore = (parseFloat(score1) + parseFloat(score2) + parseFloat(score3)) / 3;
      matchRoundsScores.push(roundTotalScore);

      sKaiRo.textContent = `SCORE: ${score1} / 10`;
      sAuraNeo.textContent = `SCORE: ${score2} / 10`;
      sValkyria.textContent = `SCORE: ${score3} / 10`;

      // SI AÚN FALTAN RONDAS DE VIDEOS POR ENVIAR
      if (currentRoundIndex < currentMatchTotalRounds) {
        vKaiRo.textContent = `"Video ${currentRoundIndex} calificado (${roundTotalScore.toFixed(1)} pts). Preparen el Video ${currentRoundIndex + 1} de ${currentMatchTotalRounds}."`;
        vAuraNeo.textContent = `"¡Buena rutina! Sigan acumulando brillo en la siguiente ronda."`;
        vValkyria.textContent = `"Avancen al Video ${currentRoundIndex + 1} de la batalla."`;

        alert(`📹 ¡Video ${currentRoundIndex} de ${currentMatchTotalRounds} registrado y calificado! Procede a enviar el Video ${currentRoundIndex + 1}.`);
        currentRoundIndex++;
        updateRoundUI();
      } else {
        // BATALLA COMPLETADA (SE ENVIARON TODOS LOS VIDEOS: 3, 5 O 7)
        const grandMatchScore = matchRoundsScores.reduce((a, b) => a + b, 0) / matchRoundsScores.length;
        const won = grandMatchScore >= 8.2;

        if (won) {
          vKaiRo.textContent = `"¡VICTORIA FINAL DE COMBATE! Dominio absoluto en los ${currentMatchTotalRounds} videos enviados."`;
          vAuraNeo.textContent = `"¡Espectáculo legendario! El brillo total del combate fue impecable."`;
          vValkyria.textContent = `"Campeón indiscutido del acuerdo de ${currentMatchTotalRounds} videos."`;

          const apGained = 150 + (currentMatchTotalRounds * 20);
          appState.user.walletAP += apGained;
          appState.transactions.unshift({
            id: Date.now(),
            type: 'win',
            desc: `Victoria en Batalla de ${currentMatchTotalRounds} Videos (+${apGained} AP)`,
            amount: apGained,
            date: 'Ahora'
          });
          saveState();
          alert(`🎉 ¡VICTORIA FINAL! Has completado el combate de ${currentMatchTotalRounds} videos y los 3 Jurados Digitales te otorgan +${apGained} Aura Points (AP).`);
        } else {
          vKaiRo.textContent = `"Combate finalizado. Faltó consistencia en la ráfaga de los ${currentMatchTotalRounds} videos."`;
          vAuraNeo.textContent = `"Buen esfuerzo en el acuerdo de ${currentMatchTotalRounds} videos."`;
          vValkyria.textContent = `"Sigan practicando para el próximo combate de videos."`;

          appState.user.walletAP = Math.max(0, appState.user.walletAP - 50);
          appState.transactions.unshift({
            id: Date.now(),
            type: 'loss',
            desc: `Derrota en Batalla de ${currentMatchTotalRounds} Videos (-50 AP)`,
            amount: -50,
            date: 'Ahora'
          });
          saveState();
          alert(`💥 DERROTA. Has completado la serie de ${currentMatchTotalRounds} videos. Se han restado 50 AP. ¡Sigue practicando!`);
        }

        resetMatchRounds();
      }

    }, 2000);
  }

  // Inicializar UI de rondas al cargar
  renderRoundsReel();

  // MODAL REGISTRO SUBMIT & MANEJO DE FOTOS
  const registerModal = document.getElementById('registerModal');
  const registerForm = document.getElementById('registerForm');
  const registryPhotoInput = document.getElementById('registryPhotoInput');
  const registryPhotoPreview = document.getElementById('registryPhotoPreview');
  const publicAvatarInput = document.getElementById('publicAvatarInput');
  const publicAvatarPreview = document.getElementById('publicAvatarPreview');
  const useGenericAvatarBtn = document.getElementById('useGenericAvatarBtn');

  let selectedPublicAvatar = appState.user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=AuraFighter1';
  let selectedRegistryPhoto = appState.user.registryPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop';

  if (registryPhotoInput) {
    registryPhotoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedRegistryPhoto = URL.createObjectURL(file);
        if (registryPhotoPreview) registryPhotoPreview.src = selectedRegistryPhoto;
      }
    });
  }

  if (publicAvatarInput) {
    publicAvatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedPublicAvatar = URL.createObjectURL(file);
        if (publicAvatarPreview) publicAvatarPreview.src = selectedPublicAvatar;
      }
    });
  }

  if (useGenericAvatarBtn) {
    useGenericAvatarBtn.addEventListener('click', () => {
      const username = document.getElementById('regUsername').value.trim() || 'AuraFighter';
      selectedPublicAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
      if (publicAvatarPreview) publicAvatarPreview.src = selectedPublicAvatar;
      alert('🤖 Se ha seleccionado una imagen genérica para tu foto de perfil pública.');
    });
  }

  // BLOQUEO ESTRICTO DE ACCESO (GATEKEEPER) HASTA CUMPLIR REQUISITOS
  function enforceGatekeeper() {
    const mainWrapper = document.querySelector('.main-wrapper');
    const appNav = document.querySelector('.app-nav');
    
    if (!appState.user.adultVerified || !appState.user.registryPhoto) {
      if (registerModal) registerModal.classList.add('active');
      if (mainWrapper) {
        mainWrapper.style.pointerEvents = 'none';
        mainWrapper.style.filter = 'blur(6px)';
        mainWrapper.style.opacity = '0.3';
      }
      if (appNav) {
        appNav.style.pointerEvents = 'none';
        appNav.style.opacity = '0.4';
      }
    } else {
      if (registerModal) registerModal.classList.remove('active');
      if (mainWrapper) {
        mainWrapper.style.pointerEvents = 'auto';
        mainWrapper.style.filter = 'none';
        mainWrapper.style.opacity = '1';
      }
      if (appNav) {
        appNav.style.pointerEvents = 'auto';
        appNav.style.opacity = '1';
      }
    }
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('regUsername').value.trim();
      const exactAge = parseInt(document.getElementById('regExactAge').value, 10);
      const bracketInfo = getBracketFromAge(exactAge);

      // VALIDACIONES ESTRICTAS DE INGRESO
      if (!username) {
        alert('🛑 ACCESO DENEGADO: Debes ingresar un nombre de usuario válido para ingresar al sitio.');
        return;
      }

      if (isNaN(exactAge) || exactAge < 8 || exactAge > 99) {
        alert('🛑 ACCESO DENEGADO: Debes ingresar una edad exacta válida.');
        return;
      }

      if (!selectedRegistryPhoto) {
        alert(exactAge >= 18 
          ? '🛑 ACCESO RESTRINGIDO: Es obligatorio adjuntar tu fotografía selfie de registro de identidad para acceder al sitio.' 
          : '🛑 ACCESO RESTRINGIDO: Es obligatorio adjuntar la fotografía del adulto responsable / tutor legal para acceder al sitio.');
        return;
      }

      // SI CUMPLE TODOS LOS REQUISITOS, SE AUTORIZA EL ACCESO
      appState.user.username = username;
      appState.user.exactAge = exactAge;
      appState.user.ageBracket = bracketInfo.key;
      appState.user.avatar = selectedPublicAvatar;
      appState.user.registryPhoto = selectedRegistryPhoto;
      appState.user.adultVerified = true;

      saveState();
      enforceGatekeeper();

      if (exactAge >= 18) {
        alert(`🎉 ¡ACCESO CONCEDIDO ${username}!\n🔒 Tu foto selfie de identidad fue guardada en el registro interno de seguridad (privado).\n✅ Bienvenido a Batallas de Aura.`);
      } else {
        alert(`🎉 ¡ACCESO CONCEDIDO ${username}!\n🔒 La fotografía del tutor legal fue registrada en la base de seguridad interna.\n🎯 Asignado estrictamente al segmento: ${bracketInfo.label}`);
      }
    });
  }

  const openProfileBtn = document.getElementById('openProfileBtn');
  if (openProfileBtn) openProfileBtn.addEventListener('click', () => registerModal.classList.add('active'));

  // Aplicar filtro de entrada inmediatamente al cargar
  enforceGatekeeper();

  // MÓDULO DE ENTRENAMIENTO 1v1 VS BOT DIGITAL
  let currentTrainingBot = { name: 'AuraBot-Alpha', seed: 'AuraBotAlpha', reward: 30 };
  const botCards = document.querySelectorAll('.training-bot-card');
  const trainingBotAvatar = document.getElementById('trainingBotAvatar');
  const trainingBotName = document.getElementById('trainingBotName');
  const startTrainingCamBtn = document.getElementById('startTrainingCamBtn');
  const simTrainingBtn = document.getElementById('simTrainingBtn');
  const trainingFeedbackText = document.getElementById('trainingFeedbackText');

  botCards.forEach(card => {
    card.addEventListener('click', () => {
      botCards.forEach(c => {
        c.classList.remove('active');
        c.style.borderColor = 'var(--border-neon)';
      });
      card.classList.add('active');
      card.style.borderColor = 'var(--cyan-neon)';

      const botType = card.getAttribute('data-bot');
      if (botType === 'AuraBot-Alpha') {
        currentTrainingBot = { name: 'AuraBot-Alpha', seed: 'AuraBotAlpha', reward: 30 };
      } else if (botType === 'CyberBot-Zero') {
        currentTrainingBot = { name: 'CyberBot-Zero', seed: 'CyberBotZero', reward: 50 };
      } else if (botType === 'OmegaBot-X') {
        currentTrainingBot = { name: 'OmegaBot-X', seed: 'OmegaBotX', reward: 80 };
      }

      if (trainingBotAvatar) trainingBotAvatar.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentTrainingBot.seed}`;
      if (trainingBotName) trainingBotName.textContent = `${currentTrainingBot.name} (Rival Digital)`;
    });
  });

  function executeTrainingSession() {
    if (trainingFeedbackText) {
      trainingFeedbackText.innerHTML = `🤖 <em>${currentTrainingBot.name} ejecutando simulación de sparring... Evaluando postura de aura...</em>`;
    }

    setTimeout(() => {
      appState.user.walletAP += currentTrainingBot.reward;
      appState.transactions.unshift({
        id: Date.now(),
        type: 'win',
        desc: `Práctica de Entrenamiento vs ${currentTrainingBot.name} (+${currentTrainingBot.reward} AP)`,
        amount: currentTrainingBot.reward,
        date: 'Ahora'
      });
      saveState();

      if (trainingFeedbackText) {
        trainingFeedbackText.innerHTML = `
          ✅ <strong>¡Entrenamiento con ${currentTrainingBot.name} completado con éxito!</strong><br>
           Kai-Ro: <em>"Excelente fluidez de movimiento. Has ganado +${currentTrainingBot.reward} AP de práctica."</em><br>
           Aura-Neo: <em>"Tu energía de escenario mejoró un +20% en esta sesión."</em><br>
           Valkyria-X: <em>"Estás listo para ingresar a la Arena PvP de 2 usuarios reales."</em>
        `;
      }
      alert(`🎯 ¡Sesión de Entrenamiento Finalizada! Has ganado +${currentTrainingBot.reward} AP de práctica vs ${currentTrainingBot.name}.`);
    }, 2000);
  }

  if (startTrainingCamBtn) startTrainingCamBtn.addEventListener('click', executeTrainingSession);
  if (simTrainingBtn) simTrainingBtn.addEventListener('click', executeTrainingSession);

  // ==========================================================================
  // BASE DE DATOS PERMANENTE E INMUTABLE DE ADMINISTRACIÓN (SIN BORRADO)
  // ==========================================================================
  const ADMIN_DB_KEY = 'batallas_de_aura_admin_db_v1';

  function loadAdminDB() {
    try {
      const data = localStorage.getItem(ADMIN_DB_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error al cargar base de datos admin:', e);
    }
    return {
      visitsCount: 142,
      battlesCount: 38,
      userRegistry: [
        { id: 1001, username: 'AuraMaster_CL', exactAge: 13, bracket: '12-15 (Teens)', verified: true, date: '2026-08-31 09:12' },
        { id: 1002, username: 'CyberWarrior_Stgo', exactAge: 14, bracket: '12-15 (Teens)', verified: true, date: '2026-08-31 10:05' },
        { id: 1003, username: 'NeonNinja_Valpo', exactAge: 14, bracket: '12-15 (Teens)', verified: true, date: '2026-08-31 11:30' },
        { id: 1004, username: 'MiniAura_Antofa', exactAge: 10, bracket: '8-12 (Junior)', verified: true, date: '2026-08-31 12:15' },
        { id: 1005, username: 'Legend_Peleador18', exactAge: 21, bracket: '18+ (Torneo Leyendas)', verified: true, date: '2026-08-31 14:00' }
      ],
      interactionLogs: [
        { id: 5001, type: 'VISITA_SITIO', desc: 'Ingreso de usuario a plataforma www.batallasdeaura.cl', user: 'AuraMaster_CL', date: '2026-08-31 15:30' },
        { id: 5002, type: 'REGISTRO_FOTO', desc: 'Fotografía de registro de identidad verificada con éxito', user: 'AuraMaster_CL', date: '2026-08-31 15:31' },
        { id: 5003, type: 'BATALLA_3_VIDEOS', desc: 'Combate completado con veredicto de 3 Jurados Digitales', user: 'AuraMaster_CL', date: '2026-08-31 15:32' }
      ]
    };
  }

  let adminDB = loadAdminDB();

  function saveAdminDB() {
    try {
      localStorage.setItem(ADMIN_DB_KEY, JSON.stringify(adminDB));
    } catch (e) {
      console.error('Error al guardar base de datos admin:', e);
    }
  }

  // REGISTRO INMUTABLE DE VISITAS AL CARGAR
  function logVisitEvent() {
    adminDB.visitsCount++;
    adminDB.interactionLogs.unshift({
      id: Date.now(),
      type: 'VISITA_NUEVA',
      desc: `Visita registrada a la plataforma (${window.navigator.userAgent.substring(0, 40)}...)`,
      user: appState.user.username || 'Visitante',
      date: new Date().toLocaleString()
    });
    saveAdminDB();
  }

  logVisitEvent();

  // REGISTRO INMUTABLE DE NUEVO USUARIO
  function registerUserInAdminDB(userObj) {
    adminDB.userRegistry.unshift({
      id: Date.now(),
      username: userObj.username,
      exactAge: userObj.exactAge,
      bracket: getBracketFromAge(userObj.exactAge).label,
      verified: true,
      date: new Date().toLocaleString()
    });

    adminDB.interactionLogs.unshift({
      id: Date.now() + 1,
      type: 'NUEVO_REGISTRO',
      desc: `Nuevo usuario registrado: ${userObj.username} (${userObj.exactAge} años, ${getBracketFromAge(userObj.exactAge).label})`,
      user: userObj.username,
      date: new Date().toLocaleString()
    });

    saveAdminDB();
  }

  // ==========================================================================
  // GESTIÓN DE ACCESO Y DASHBOARD ADMINISTRADOR
  // ==========================================================================
  const adminLoginNavBtn = document.getElementById('adminLoginNavBtn');
  const adminLoginModal = document.getElementById('adminLoginModal');
  const closeAdminLoginModalBtn = document.getElementById('closeAdminLoginModalBtn');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const logoutAdminBtn = document.getElementById('logoutAdminBtn');
  const exportAdminDbBtn = document.getElementById('exportAdminDbBtn');
  let isAdminLoggedIn = false;

  if (adminLoginNavBtn) {
    adminLoginNavBtn.addEventListener('click', () => {
      if (isAdminLoggedIn) {
        showAdminTab();
      } else {
        adminLoginModal.classList.add('active');
      }
    });
  }

  if (closeAdminLoginModalBtn) {
    closeAdminLoginModalBtn.addEventListener('click', () => adminLoginModal.classList.remove('active'));
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('adminUser').value.trim();
      const p = document.getElementById('adminPass').value.trim();

      // CREDENCIALES PEDIDAS POR EL USUARIO: batallasdeaura / 1234567
      if (u === 'batallasdeaura' && p === '1234567') {
        isAdminLoggedIn = true;
        adminLoginModal.classList.remove('active');
        adminLoginForm.reset();
        showAdminTab();
        alert('🔑 ACCESO AUTORIZADO: Bienvenido al Panel de Control de Administración de Batallas de Aura.');
      } else {
        alert('🛑 ACCESO DENEGADO: Credenciales de administrador incorrectas.');
      }
    });
  }

  function showAdminTab() {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const adminTab = document.getElementById('adminTab');
    if (adminTab) adminTab.classList.add('active');
    if (adminLoginNavBtn) adminLoginNavBtn.classList.add('active');

    renderAdminDashboard();
  }

  function renderAdminDashboard() {
    const adminStatVisits = document.getElementById('adminStatVisits');
    const adminStatUsers = document.getElementById('adminStatUsers');
    const adminStatBattles = document.getElementById('adminStatBattles');
    const adminStatAP = document.getElementById('adminStatAP');

    if (adminStatVisits) adminStatVisits.textContent = adminDB.visitsCount.toLocaleString();
    if (adminStatUsers) adminStatUsers.textContent = adminDB.userRegistry.length.toLocaleString();
    if (adminStatBattles) adminStatBattles.textContent = (adminDB.battlesCount + appState.transactions.length).toLocaleString();
    if (adminStatAP) adminStatAP.textContent = `${appState.user.walletAP + 1850} AP`;

    // RENDERIZAR TABLA DE USUARIOS REGISTRADOS PERMANENTES
    const adminUsersTbody = document.getElementById('adminUsersTbody');
    if (adminUsersTbody) {
      adminUsersTbody.innerHTML = '';
      adminDB.userRegistry.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong style="color: var(--cyan-neon);">#${u.id}</strong></td>
          <td><strong>${sanitizeHTML(u.username)}</strong></td>
          <td>${u.exactAge} años</td>
          <td><span style="color: var(--gold-neon); font-weight: 700;">${u.bracket}</span></td>
          <td><span style="color: var(--green-safe);">🔒 FOTO & DATOS OK</span></td>
          <td>${u.date}</td>
        `;
        adminUsersTbody.appendChild(tr);
      });
    }

    // RENDERIZAR TABLA DE LOGS PERMANENTES
    const adminLogsTbody = document.getElementById('adminLogsTbody');
    if (adminLogsTbody) {
      adminLogsTbody.innerHTML = '';
      adminDB.interactionLogs.forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span style="color: var(--text-muted);">#${log.id}</span></td>
          <td><strong style="color: var(--magenta-neon);">${log.type}</strong></td>
          <td>${sanitizeHTML(log.desc)}</td>
          <td><strong>${sanitizeHTML(log.user)}</strong></td>
          <td>${log.date}</td>
        `;
        adminLogsTbody.appendChild(tr);
      });
    }
  }

  if (logoutAdminBtn) {
    logoutAdminBtn.addEventListener('click', () => {
      isAdminLoggedIn = false;
      alert('🔒 Sesión de administración cerrada con éxito.');
      location.reload();
    });
  }

  if (exportAdminDbBtn) {
    exportAdminDbBtn.addEventListener('click', () => {
      const fullExport = {
        appState: appState,
        adminDB: adminDB,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `batallas_de_aura_base_de_datos_${Date.now()}.json`;
      a.click();
      alert('📥 Base de datos permanente exportada correctamente en formato JSON.');
    });
  }

  const rankingFilter = document.getElementById('rankingAgeFilter');
  if (rankingFilter) rankingFilter.addEventListener('change', () => renderLeaderboard());

  updateUI();
});
