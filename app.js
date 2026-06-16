// ===== Supabase設定 =====
const SUPABASE_URL = 'https://alwivconpehsnwkfqjez.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c1r0_R5I8hUcbpca04duqA_EWrR3Fw0';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== 年代カラー =====
const AGE_COLORS = {
  '0-9':   '#ff6b9d',
  '10-19': '#ff9f43',
  '20-29': '#a8e063',
  '30-39': '#26d0ce',
  '40-49': '#74b9ff',
  '50-59': '#a29bfe',
  '60-69': '#636e72',
  '70+':   '#2d3436'
};

// ===== 別名マップ（通称→正式町名） =====
const ALIAS_MAP = {
  '下北沢':   '北沢',
  '下北':     '北沢',
  '三茶':     '三軒茶屋',
  '二子玉川': '玉川',
  '二子玉':   '玉川',
  '自由が丘': '奥沢',
  '自由ヶ丘': '奥沢',
  '九品仏':   '奥沢',
  '等々力渓谷': '等々力',
  '瀬田':     '瀬田',
  '成城学園': '成城',
  '成城学園前': '成城',
  '豪徳寺':   '豪徳寺',
  '山下':     '豪徳寺',
  '宮の坂':   '宮坂',
  '桜上水':   '松原',
  '東松原':   '松原',
  '明大前':   '松原',
  '梅ヶ丘':   '梅丘',
  '梅が丘':   '梅丘',
  '経堂':     '経堂',
  '千歳烏山': '南烏山',
  '烏山':     '南烏山',
  '芦花公園': '芦花公園',
  '用賀':     '用賀',
  '砧公園':   '砧公園',
  '岡本':     '岡本',
  '喜多見':   '喜多見',
  '上野毛':   '上野毛',
  '尾山台':   '尾山台',
  '奥沢':     '奥沢',
  '野毛':     '野毛',
  '深沢':     '深沢',
  '駒沢':     '駒沢',
  '駒沢公園': '駒沢',
  '桜新町':   '桜新町',
  '弦巻':     '弦巻',
  '世田谷':   '世田谷',
  '太子堂':   '太子堂',
  '池尻':     '池尻',
  '三宿':     '三宿',
  '代田':     '代田',
  '代沢':     '代沢',
  '北沢':     '北沢',
  '上馬':     '上馬',
  '下馬':     '下馬',
  '野沢':     '野沢',
  '松原':     '松原',
  '赤堤':     '赤堤',
  '羽根木':   '羽根木',
  '大原':     '大原',
  '宮坂':     '宮坂',
  '梅丘':     '梅丘',
  '松沢':     '松沢',
  '成城':     '成城',
  '祖師谷':   '祖師谷',
  '千歳台':   '千歳台',
  '砧':       '砧',
  '大蔵':     '大蔵',
  '鎌田':     '鎌田',
  '宇奈根':   '宇奈根',
  '給田':     '給田',
  '南烏山':   '南烏山',
  '北烏山':   '北烏山',
  '粕谷':     '粕谷',
  '八幡山':   '八幡山',
  '上北沢':   '上北沢',
  '上祖師谷': '上祖師谷',
  '玉川':     '玉川',
  '玉川台':   '玉川台',
  '玉川田園調布': '玉川田園調布',
  '玉堤':     '玉堤',
  '中町':     '中町',
  '上用賀':   '上用賀',
  '桜':       '桜',
  '新町':     '新町'
};

// ===== 世田谷区 近隣商業施設データ =====
const FACILITIES_DB = [
  // ショッピングモール・SC
  { name: '二子玉川ライズ S.C.', type: 'ショッピングセンター', grade: 'premium', icon: '🏬', lat: 35.6097, lng: 139.6270, anchor: '玉川' },
  { name: 'キャロットタワー（三軒茶屋）', type: '複合商業施設', grade: 'standard', icon: '🏢', lat: 35.6440, lng: 139.6700, anchor: '三軒茶屋' },
  { name: 'シモキタエキマエ商店街', type: '商店街・複合施設', grade: 'standard', icon: '🏘️', lat: 35.6580, lng: 139.6620, anchor: '北沢' },
  { name: '成城コルティ', type: 'ショッピングセンター', grade: 'premium', icon: '🏬', lat: 35.6310, lng: 139.5990, anchor: '成城' },
  { name: 'イトーヨーカドー祖師谷大蔵店', type: 'スーパー・SC', grade: 'daily', icon: '🛒', lat: 35.6350, lng: 139.6090, anchor: '祖師谷' },
  { name: '東急ストア 経堂店', type: 'スーパー', grade: 'daily', icon: '🛒', lat: 35.6450, lng: 139.6480, anchor: '経堂' },
  { name: '東急ストア 桜新町店', type: 'スーパー', grade: 'daily', icon: '🛒', lat: 35.6340, lng: 139.6650, anchor: '桜新町' },
  { name: 'マルエツ 用賀店', type: 'スーパー', grade: 'daily', icon: '🛒', lat: 35.6190, lng: 139.6310, anchor: '用賀' },
  { name: 'ライフ 等々力店', type: 'スーパー', grade: 'daily', icon: '🛒', lat: 35.6060, lng: 139.6440, anchor: '等々力' },
  { name: '小田急マルシェ 千歳烏山', type: '駅ビル商業施設', grade: 'standard', icon: '🏪', lat: 35.6510, lng: 139.5990, anchor: '南烏山' },
  { name: 'ボーノ相模大野（参考）', type: 'ショッピングモール', grade: 'standard', icon: '🏬', lat: 35.6400, lng: 139.6150, anchor: '千歳台' },
  // 百貨店
  { name: '東急百貨店 二子玉川店', type: '百貨店', grade: 'premium', icon: '🏛️', lat: 35.6097, lng: 139.6260, anchor: '玉川' },
  { name: '小田急百貨店 新宿（近隣）', type: '百貨店（近隣）', grade: 'premium', icon: '🏛️', lat: 35.6900, lng: 139.7000, anchor: '北沢' },
  { name: '渋谷ヒカリエ（近隣）', type: '複合百貨店（近隣）', grade: 'premium', icon: '🏛️', lat: 35.6590, lng: 139.7030, anchor: '三軒茶屋' },
  // アウトレット・大型専門店
  { name: 'コーナン 世田谷店', type: 'ホームセンター', grade: 'daily', icon: '🔨', lat: 35.6430, lng: 139.6560, anchor: '世田谷' },
  { name: 'ユニクロ 三軒茶屋店', type: 'アパレル専門店', grade: 'standard', icon: '👔', lat: 35.6440, lng: 139.6700, anchor: '三軒茶屋' },
  { name: 'ニトリ 経堂店', type: 'インテリア専門店', grade: 'standard', icon: '🛋️', lat: 35.6450, lng: 139.6480, anchor: '経堂' },
  { name: 'TSUTAYA 下北沢店', type: 'エンタメ複合店', grade: 'standard', icon: '🎵', lat: 35.6580, lng: 139.6620, anchor: '北沢' },
  { name: 'ビックカメラ 二子玉川店', type: '家電量販店', grade: 'standard', icon: '📱', lat: 35.6097, lng: 139.6270, anchor: '玉川' },
];

// ===== 世田谷区 町代表座標 =====
const TOWN_COORDS = {
  '池尻':       [35.6520, 139.6810],
  '三宿':       [35.6490, 139.6780],
  '太子堂':     [35.6450, 139.6700],
  '三軒茶屋':   [35.6440, 139.6690],
  '下馬':       [35.6480, 139.6860],
  '野沢':       [35.6410, 139.6840],
  '弦巻':       [35.6380, 139.6750],
  '世田谷':     [35.6430, 139.6560],
  '桜':         [35.6380, 139.6620],
  '新町':       [35.6330, 139.6600],
  '桜新町':     [35.6340, 139.6650],
  '深沢':       [35.6280, 139.6700],
  '駒沢':       [35.6390, 139.6900],
  '上馬':       [35.6450, 139.6820],
  '代田':       [35.6540, 139.6640],
  '代沢':       [35.6510, 139.6600],
  '北沢':       [35.6580, 139.6620],
  '松原':       [35.6540, 139.6540],
  '赤堤':       [35.6510, 139.6480],
  '羽根木':     [35.6490, 139.6540],
  '大原':       [35.6570, 139.6540],
  '経堂':       [35.6450, 139.6480],
  '宮坂':       [35.6400, 139.6440],
  '豪徳寺':     [35.6420, 139.6490],
  '梅丘':       [35.6380, 139.6540],
  '松沢':       [35.6580, 139.6490],
  '成城':       [35.6310, 139.5990],
  '祖師谷':     [35.6350, 139.6090],
  '千歳台':     [35.6400, 139.6150],
  '砧':         [35.6280, 139.6150],
  '砧公園':     [35.6260, 139.6050],
  '大蔵':       [35.6230, 139.6100],
  '岡本':       [35.6200, 139.6020],
  '鎌田':       [35.6170, 139.6140],
  '喜多見':     [35.6230, 139.5980],
  '宇奈根':     [35.6140, 139.5970],
  '給田':       [35.6380, 139.5990],
  '南烏山':     [35.6510, 139.5990],
  '北烏山':     [35.6570, 139.5980],
  '粕谷':       [35.6480, 139.6060],
  '八幡山':     [35.6520, 139.6100],
  '上北沢':     [35.6560, 139.6150],
  '芦花公園':   [35.6510, 139.6020],
  '上祖師谷':   [35.6390, 139.6010],
  '玉川':       [35.6100, 139.6360],
  '瀬田':       [35.6130, 139.6280],
  '野毛':       [35.6080, 139.6300],
  '上野毛':     [35.6060, 139.6340],
  '等々力':     [35.6060, 139.6440],
  '中町':       [35.6130, 139.6440],
  '上用賀':     [35.6220, 139.6340],
  '用賀':       [35.6190, 139.6310],
  '玉川台':     [35.6140, 139.6200],
  '玉川田園調布': [35.5970, 139.6360],
  '尾山台':     [35.6050, 139.6520],
  '奥沢':       [35.6030, 139.6620],
  '玉堤':       [35.5990, 139.6450],
  '若林':       [35.6480, 139.6640],
  '桜丘':       [35.6350, 139.6560]
};

// ===== 状態管理 =====
let map = null;
let currentMode = 'point';
let currentMarker = null;
let freehandPolygon = null;
let allAreas = [];
let searchHistory = [];
let panelState = 'closed';
let isFreehandDrawing = false;
let freehandPoints = [];
let currentAreaData = null; // 現在表示中のエリアデータ

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
  searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  initMap();
  initUI();
  await loadAllAreas();
  renderHistory();
});

// ===== 地図初期化 =====
function initMap() {
  map = L.map('map', {
    center: [35.6464, 139.6533],
    zoom: 13,
    zoomControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  map.on('click', onMapClick);
}

// ===== UI初期化 =====
function initUI() {
  // 検索
  document.getElementById('search-btn').addEventListener('click', doSearch);
  document.getElementById('search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
  document.getElementById('search-input').addEventListener('input', onSearchInput);
  document.addEventListener('click', e => {
    if (!e.target.closest('#search-bar')) {
      document.getElementById('search-suggestions').innerHTML = '';
      document.getElementById('history-drawer').classList.add('hidden');
    }
  });

  // 履歴ボタン
  document.getElementById('history-btn').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('history-drawer').classList.toggle('hidden');
  });

  // タブ切替（イベント委譲）
  document.getElementById('result-panel').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (btn && btn.dataset.tab) switchTab(btn.dataset.tab);
  });

  // タブスワイプ（左右）
  const tabOrder = ['profile', 'spending', 'age', 'channel'];
  let tabTouchStartX = 0;
  const tabWrapper = document.getElementById('tab-wrapper');
  if (tabWrapper) {
    tabWrapper.addEventListener('touchstart', e => {
      tabTouchStartX = e.touches[0].clientX;
    }, { passive: true });
    tabWrapper.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tabTouchStartX;
      if (Math.abs(dx) < 50) return;
      const activeBtn = document.querySelector('.tab-btn.active');
      if (!activeBtn) return;
      const idx = tabOrder.indexOf(activeBtn.dataset.tab);
      if (dx < -50 && idx < tabOrder.length - 1) switchTab(tabOrder[idx + 1]);
      else if (dx > 50 && idx > 0) switchTab(tabOrder[idx - 1]);
    }, { passive: true });
  }

  // パネルコントロールボタン
  document.getElementById('panel-minimize-btn').addEventListener('click', () => setPanelState('peek'));
  document.getElementById('panel-expand-btn').addEventListener('click', () => setPanelState('open'));
  document.getElementById('panel-new-search-btn').addEventListener('click', () => {
    resetToHome();
    setTimeout(() => document.getElementById('search-input').focus(), 350);
  });

  // スマホ: パネル全体でスワイプ操作
  const panel = document.getElementById('result-panel');
  let panelTouchStartY = 0;
  let panelTouchStartX = 0;
  panel.addEventListener('touchstart', e => {
    panelTouchStartY = e.touches[0].clientY;
    panelTouchStartX = e.touches[0].clientX;
  }, { passive: true });
  panel.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - panelTouchStartY;
    const dx = Math.abs(e.changedTouches[0].clientX - panelTouchStartX);
    if (dx > 50) return; // 横スワイプはタブ切替に使う
    if (dy > 60) {
      if (panelState === 'open') setPanelState('peek');
      else if (panelState === 'peek') resetToHome();
    } else if (dy < -60) {
      if (panelState === 'peek' || panelState === 'closed') setPanelState('open');
    }
  }, { passive: true });

  // フリーハンド描画イベント
  const mapEl = document.getElementById('map');
  mapEl.addEventListener('mousedown', onFreehandStart);
  mapEl.addEventListener('mousemove', onFreehandMove);
  mapEl.addEventListener('mouseup', onFreehandEnd);
  mapEl.addEventListener('touchstart', onFreehandTouchStart, { passive: false });
  mapEl.addEventListener('touchmove', onFreehandTouchMove, { passive: false });
  mapEl.addEventListener('touchend', onFreehandTouchEnd, { passive: false });
}

// ===== パネル状態制御 =====
function setPanelState(state) {
  const panel = document.getElementById('result-panel');
  panel.classList.remove('open', 'peek');
  if (state === 'open') panel.classList.add('open');
  else if (state === 'peek') panel.classList.add('peek');
  panelState = state;
}

// ===== 完全リセット（再検索ボタン・スワイプで完全に閉じた時） =====
function resetToHome() {
  setPanelState('closed');
  document.getElementById('panel-empty').classList.remove('hidden');
  document.getElementById('area-header').classList.add('hidden');
  document.getElementById('multi-area-info').classList.add('hidden');
  document.getElementById('tabs').classList.add('hidden');
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById('map-hint').classList.remove('hidden');
  document.getElementById('search-input').value = '';
  if (currentMarker) { map.removeLayer(currentMarker); currentMarker = null; }
  if (freehandPolygon) { map.removeLayer(freehandPolygon); freehandPolygon = null; }
  setMode('point');
  currentAreaData = null;
}

// ===== モード切替 =====
function setMode(mode) {
  currentMode = mode;
  document.getElementById('btn-point').classList.toggle('active', mode === 'point');
  document.getElementById('btn-area').classList.toggle('active', mode === 'area');
  const hint = document.getElementById('hint-text');
  if (mode === 'point') {
    hint.textContent = '📍 地図をクリックまたは町名を検索してください';
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    clearFreehand();
  } else {
    hint.textContent = '✏️ 指またはマウスでドラッグして範囲を囲んでください';
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
  }
}

// ===== 全データ読み込み =====
async function loadAllAreas() {
  showLoading(true);
  try {
    const { data, error } = await db
      .from('setagaya_areas')
      .select('*')
      .order('town_name');
    if (error) throw error;
    allAreas = data || [];
    console.log(`${allAreas.length}件のエリアデータを読み込みました`);
  } catch (e) {
    console.error('データ読み込みエラー:', e);
    showError('データの読み込みに失敗しました');
  } finally {
    showLoading(false);
  }
}

// ===== 地図クリック =====
async function onMapClick(e) {
  if (currentMode !== 'point') return;
  const { lat, lng } = e.latlng;
  document.getElementById('map-hint').classList.add('hidden');
  showLoading(true);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ja`,
      { headers: { 'User-Agent': 'setagaya-market-tool/1.0' } }
    );
    const geo = await res.json();
    const townName = extractTownName(geo);

    if (currentMarker) map.removeLayer(currentMarker);
    currentMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: '',
        html: `<div style="background:#00d4de;color:#0d0f14;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 12px rgba(0,212,222,0.5);font-family:Outfit,sans-serif">${townName || '?'}</div>`,
        iconAnchor: [0, 0]
      })
    }).addTo(map);

    const area = findArea(townName);
    if (area) {
      showAreaResult(area);
    } else {
      showError(`「${townName || '選択地点'}」のデータが見つかりません`);
    }
  } catch (e) {
    console.error('逆ジオコーディングエラー:', e);
    showError('地点情報の取得に失敗しました');
  } finally {
    showLoading(false);
  }
}

// ===== 町名抽出 =====
function extractTownName(geo) {
  const addr = geo.address || {};
  const candidates = [
    addr.neighbourhood,
    addr.quarter,
    addr.suburb,
    addr.city_district
  ].filter(Boolean);

  for (const c of candidates) {
    const cleaned = c
      .replace(/[一二三四五六七八九十百千万]+丁目$/, '')
      .replace(/\d+丁目$/, '')
      .replace(/丁目$/, '')
      .trim();
    if (cleaned.length >= 2) {
      const match = findArea(cleaned);
      if (match) return match.town_name;
    }
  }

  const displayName = geo.display_name || '';
  for (const area of allAreas) {
    if (displayName.includes(area.town_name)) return area.town_name;
  }
  return null;
}

// ===== エリア検索（エイリアス対応） =====
function findArea(name) {
  if (!name) return null;
  // エイリアスで正式名に変換
  const resolved = ALIAS_MAP[name] || name;
  return allAreas.find(a => a.town_name === resolved)
    || allAreas.find(a => a.town_name === name)
    || allAreas.find(a => a.town_name.includes(resolved) || resolved.includes(a.town_name))
    || allAreas.find(a => a.town_name.includes(name) || name.includes(a.town_name))
    || null;
}

// ===== 検索 =====
async function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  document.getElementById('search-suggestions').innerHTML = '';
  document.getElementById('history-drawer').classList.add('hidden');
  document.getElementById('map-hint').classList.add('hidden');

  const area = findArea(q);
  if (!area) { showError(`「${q}」は見つかりませんでした`); return; }

  showLoading(true);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(area.town_name + ' 世田谷区 東京')}&format=json&limit=1&accept-language=ja`
    );
    const results = await res.json();
    if (results.length > 0) {
      const lat = parseFloat(results[0].lat);
      const lng = parseFloat(results[0].lon);
      map.setView([lat, lng], 15);
      if (currentMarker) map.removeLayer(currentMarker);
      currentMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="background:#00d4de;color:#0d0f14;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 12px rgba(0,212,222,0.5);font-family:Outfit,sans-serif">${area.town_name}</div>`,
          iconAnchor: [0, 0]
        })
      }).addTo(map);
    } else {
      // 座標が取れなくてもTOWN_COORDSから表示
      const coord = TOWN_COORDS[area.town_name];
      if (coord) map.setView(coord, 15);
    }
  } catch (e) {
    console.warn('座標取得失敗:', e);
    const coord = TOWN_COORDS[area.town_name];
    if (coord) map.setView(coord, 15);
  } finally {
    showLoading(false);
  }

  showAreaResult(area);
}

function onSearchInput(e) {
  const q = e.target.value.trim();
  const box = document.getElementById('search-suggestions');
  if (!q) { box.innerHTML = ''; return; }
  // エイリアス含めて検索
  const resolved = ALIAS_MAP[q] || q;
  const matches = allAreas.filter(a =>
    a.town_name.includes(q) ||
    a.town_name.includes(resolved) ||
    q.includes(a.town_name)
  ).slice(0, 8);
  // エイリアスからも候補を追加
  const aliasMatches = Object.entries(ALIAS_MAP)
    .filter(([alias, real]) => alias.includes(q) && !matches.find(m => m.town_name === real))
    .map(([alias, real]) => {
      const area = allAreas.find(a => a.town_name === real);
      return area ? { ...area, displayName: `${alias}（${real}）` } : null;
    })
    .filter(Boolean)
    .slice(0, 3);

  const allMatches = [...matches, ...aliasMatches].slice(0, 8);
  box.innerHTML = allMatches.map(a =>
    `<div class="suggestion-item" onclick="quickSelect('${a.displayName ? a.town_name : a.town_name}')">📍 ${a.displayName || a.town_name} <span style="color:#6b7a99;font-size:11px">${a.income_label || ''}</span></div>`
  ).join('');
}

function quickSelect(name) {
  document.getElementById('search-input').value = name;
  document.getElementById('search-suggestions').innerHTML = '';
  document.getElementById('history-drawer').classList.add('hidden');
  const area = findArea(name);
  if (area) showAreaResult(area);
}

// ===== エリア結果表示（1エリア） =====
function showAreaResult(area) {
  currentAreaData = area;
  addHistory(area.town_name);
  renderAreaHeader(area);
  document.getElementById('multi-area-info').classList.add('hidden');
  renderProfileTab(area);
  renderSpendingTab(area);
  renderAgeTab(area);
  renderChannelTab(area);
  document.getElementById('panel-empty').classList.add('hidden');
  document.getElementById('area-header').classList.remove('hidden');
  document.getElementById('tabs').classList.remove('hidden');
  switchTab('profile');
  setPanelState('open');
}

// ===== エリアヘッダー描画 =====
function renderAreaHeader(area) {
  document.getElementById('area-name').textContent = area.town_name;

  const badge = document.getElementById('income-badge');
  badge.textContent = area.income_label || '';
  badge.className = 'income-badge';
  const inc = area.estimated_income || 0;
  if (inc >= 700) badge.classList.add('income-high');
  else if (inc >= 500) badge.classList.add('income-mid');
  else badge.classList.add('income-low');

  const tags = area.area_tags || [];
  document.getElementById('area-tags').innerHTML = tags.map(t => `<span class="area-tag">${t}</span>`).join('');
  document.getElementById('area-pop').textContent = `人口 ${(area.pop_total || 0).toLocaleString()}人`;
  document.getElementById('area-age').textContent = `平均年齢 ${area.avg_age}歳`;
}

// ===== 購買層タブ =====
function renderProfileTab(area) {
  document.getElementById('income-display').innerHTML = `
    <div class="income-amount">${(area.estimated_income || 0).toLocaleString()}<span>万円</span></div>
    <div class="income-sub">
      <div class="income-unit">推定世帯年収（年間）</div>
      <div class="income-note">※ 国勢調査データから統計的に推計</div>
    </div>
  `;

  const ageGroups = area.dominant_age_groups || [];
  document.getElementById('age-groups').innerHTML = ageGroups.map((g, i) =>
    `<div class="age-group-badge ${i === 0 ? 'rank1' : ''}">${i === 0 ? '🥇' : '🥈'} ${g}</div>`
  ).join('');

  const families = area.family_types || [];
  document.getElementById('family-types').innerHTML = families.map(f => `
    <div class="family-item">
      <div class="family-label">${f.type}</div>
      <div class="family-bar-wrap"><div class="family-bar" style="width:${f.ratio}%"></div></div>
      <div class="family-ratio">${f.ratio}%</div>
    </div>
  `).join('');

  document.getElementById('age-ratio-bars').innerHTML = `
    <div class="ratio-row">
      <div class="ratio-label">子ども（0-14歳）</div>
      <div class="ratio-bar-wrap"><div class="ratio-bar children" style="width:${area.child_ratio || 0}%"></div></div>
      <div class="ratio-val">${area.child_ratio || 0}%</div>
    </div>
    <div class="ratio-row">
      <div class="ratio-label">生産年齢（15-64歳）</div>
      <div class="ratio-bar-wrap"><div class="ratio-bar working" style="width:${area.working_ratio || 0}%"></div></div>
      <div class="ratio-val">${area.working_ratio || 0}%</div>
    </div>
    <div class="ratio-row">
      <div class="ratio-label">高齢者（65歳以上）</div>
      <div class="ratio-bar-wrap"><div class="ratio-bar elderly" style="width:${area.elderly_ratio || 0}%"></div></div>
      <div class="ratio-val">${area.elderly_ratio || 0}%</div>
    </div>
  `;
}

// ===== 支出傾向タブ =====
function renderSpendingTab(area) {
  const items = [
    { icon: '🛒', label: '食費（自炊）', key: 'monthly_food' },
    { icon: '🍽️', label: '外食費', key: 'monthly_eating_out' },
    { icon: '👗', label: '服・履物', key: 'monthly_clothes' },
    { icon: '🛍️', label: '雑貨・日用品', key: 'monthly_goods' },
    { icon: '📚', label: '教育費', key: 'monthly_edu' },
    { icon: '🎭', label: '娯楽・趣味', key: 'monthly_leisure' }
  ];
  document.getElementById('spending-cards').innerHTML = items.map(item => `
    <div class="spending-card">
      <div class="spending-icon">${item.icon}</div>
      <div class="spending-label">${item.label}</div>
      <div class="spending-amount">${(area[item.key] || 0).toLocaleString()}</div>
      <div class="spending-unit">円/月</div>
    </div>
  `).join('');
}

// ===== 年齢分布タブ =====
function renderAgeTab(area) {
  const dist = area.age_dist || {};
  const keys = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70+'];
  const labels = {
    '0-9': '0〜9歳', '10-19': '10〜19歳', '20-29': '20〜29歳',
    '30-39': '30〜39歳', '40-49': '40〜49歳', '50-59': '50〜59歳',
    '60-69': '60〜69歳', '70+': '70歳〜'
  };
  const maxVal = Math.max(...keys.map(k => dist[k] || 0), 1);

  document.getElementById('age-chart').innerHTML = keys.map(k => {
    const val = dist[k] || 0;
    const pct = Math.round(val / maxVal * 100);
    const color = AGE_COLORS[k] || '#636e72';
    return `
      <div class="age-bar-row">
        <div class="age-bar-label">${labels[k]}</div>
        <div class="age-bar-wrap">
          <div class="age-bar-fill" style="width:${pct}%;background:${color}">
            ${val > 0 ? `<span class="age-bar-count">${val.toLocaleString()}人</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== チャネル分析タブ =====
function renderChannelTab(area) {
  const container = document.getElementById('channel-content');
  if (!container) return;

  const income = area.estimated_income || 500;
  const avgAge = parseFloat(area.avg_age) || 40;
  const elderly = area.elderly_ratio || 20;
  const child = area.child_ratio || 12;
  const working = area.working_ratio || 68;
  const coord = TOWN_COORDS[area.town_name];

  // 近隣施設を距離でソート
  let nearbyFacilities = [];
  if (coord) {
    nearbyFacilities = FACILITIES_DB.map(f => ({
      ...f,
      dist: calcDistKm(coord[0], coord[1], f.lat, f.lng)
    }))
    .filter(f => f.dist < 5.0)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 8);
  }

  // チャネルマッチスコア計算
  const channels = calcChannelScores(area, nearbyFacilities);

  let html = '';

  // チャネルマッチ確率
  html += `<div class="channel-section-title">チャネルマッチ確率</div>`;
  html += `<div class="channel-match-summary">
    <div class="match-title">この立地に合うチャネル（推定マッチ率）</div>`;
  channels.forEach(ch => {
    const barClass = ch.score >= 70 ? 'high' : ch.score >= 45 ? 'mid' : 'low';
    html += `
      <div class="channel-match-row">
        <div class="channel-match-label">${ch.name}</div>
        <div class="channel-match-bar-wrap">
          <div class="channel-match-bar ${barClass}" style="width:${ch.score}%"></div>
        </div>
        <div class="channel-match-pct">${ch.score}%</div>
      </div>`;
  });
  html += `</div>`;

  // 推奨チャネル
  html += `<div class="channel-section-title">推奨チャネル</div>`;
  channels.slice(0, 3).forEach((ch, i) => {
    html += `
      <div class="recommend-card ${i === 0 ? 'top-pick' : ''}">
        <div class="recommend-header">
          <div class="recommend-name">${i === 0 ? '⭐ ' : ''}${ch.name}</div>
          <div class="recommend-score">${ch.score}%</div>
        </div>
        <div class="recommend-desc">${ch.reason}</div>
      </div>`;
  });

  // 近隣商業施設
  html += `<div class="channel-section-title">近隣商業施設（半径5km）</div>`;
  if (nearbyFacilities.length === 0) {
    html += `<div style="color:var(--text-dim);font-size:13px;padding:8px 0">施設データが見つかりませんでした</div>`;
  } else {
    nearbyFacilities.forEach(f => {
      const distStr = f.dist < 1 ? `${Math.round(f.dist * 1000)}m` : `${f.dist.toFixed(1)}km`;
      html += `
        <div class="facility-card">
          <div class="facility-icon">${f.icon}</div>
          <div class="facility-info">
            <div class="facility-name">${f.name}</div>
            <div class="facility-type">${f.type}</div>
            <div class="facility-meta">
              <div class="facility-dist">📍 ${distStr}</div>
              <div class="facility-grade ${f.grade}">${f.grade === 'premium' ? 'プレミアム' : f.grade === 'standard' ? 'スタンダード' : 'デイリー'}</div>
            </div>
          </div>
        </div>`;
    });
  }

  html += `<div class="data-note">※ 施設データは代表的な施設を掲載。距離は直線距離。チャネルマッチ率は人口統計・年収・支出傾向から算出した推計値です。</div>`;

  container.innerHTML = html;
}

// ===== 距離計算（ハバーサイン） =====
function calcDistKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ===== チャネルスコア計算 =====
function calcChannelScores(area, facilities) {
  const income = area.estimated_income || 500;
  const avgAge = parseFloat(area.avg_age) || 40;
  const elderly = area.elderly_ratio || 20;
  const child = area.child_ratio || 12;
  const working = area.working_ratio || 68;
  const families = area.family_types || [];
  const familyRatio = families.find(f => f.type === 'ファミリー世帯')?.ratio || 40;
  const singleRatio = families.find(f => f.type === '単身・DINKS')?.ratio || 35;
  const hasPremiumNearby = facilities.some(f => f.grade === 'premium' && f.dist < 3);

  const channels = [
    {
      name: 'ハイエンド専門店',
      score: Math.min(95, Math.round(
        (income >= 800 ? 40 : income >= 600 ? 25 : 10) +
        (hasPremiumNearby ? 20 : 5) +
        (avgAge >= 40 && avgAge <= 60 ? 20 : 10) +
        (singleRatio > 40 ? 15 : 10)
      )),
      reason: `推定年収${income}万円帯の高所得層が多く、プレミアム施設への近接性も${hasPremiumNearby ? '高い' : '中程度'}。高単価商品・ブランド品の需要が見込める。`
    },
    {
      name: 'ライフスタイルSC',
      score: Math.min(95, Math.round(
        (income >= 600 && income <= 900 ? 35 : 20) +
        (familyRatio > 45 ? 25 : 15) +
        (working > 60 ? 20 : 10) +
        (hasPremiumNearby ? 10 : 15)
      )),
      reason: `ファミリー世帯比率${familyRatio}%、生産年齢層${working}%と、週末利用型のSCに適した人口構成。食品・日用品・ファッションの複合需要が高い。`
    },
    {
      name: 'コンビニ・ドラッグストア',
      score: Math.min(95, Math.round(
        (singleRatio > 40 ? 30 : 20) +
        (working > 65 ? 25 : 15) +
        (avgAge < 45 ? 20 : 10) +
        15
      )),
      reason: `単身・DINKS比率${singleRatio}%と働き世代が多く、日常的な近距離購買ニーズが高い。時間効率重視の消費行動が特徴。`
    },
    {
      name: 'EC・D2C',
      score: Math.min(95, Math.round(
        (income >= 600 ? 25 : 15) +
        (avgAge < 45 ? 30 : avgAge < 55 ? 20 : 10) +
        (singleRatio > 40 ? 20 : 10) +
        10
      )),
      reason: `平均年齢${avgAge}歳とデジタルリテラシーが高い層が多い。EC利用率が高く、定期購入・サブスクリプション型サービスとの相性が良い。`
    },
    {
      name: 'シニア向け専門店',
      score: Math.min(95, Math.round(
        (elderly > 30 ? 40 : elderly > 20 ? 25 : 10) +
        (income >= 500 ? 20 : 10) +
        (avgAge > 50 ? 25 : 10)
      )),
      reason: `高齢者比率${elderly}%、平均年齢${avgAge}歳。健康食品・介護用品・趣味関連など、シニア向け商材の需要が${elderly > 25 ? '高い' : '中程度'}。`
    },
    {
      name: '子育て・教育関連',
      score: Math.min(95, Math.round(
        (child > 15 ? 40 : child > 10 ? 25 : 10) +
        (familyRatio > 45 ? 30 : 15) +
        (income >= 500 ? 15 : 5)
      )),
      reason: `子ども比率${child}%、ファミリー世帯${familyRatio}%。学習塾・習い事・ベビー用品・知育玩具など教育関連チャネルの需要が${child > 12 ? '見込める' : '限定的'}。`
    }
  ];

  return channels.sort((a, b) => b.score - a.score);
}

// ===== 複数エリア平均表示 =====
function showMultiAreaResult(areas) {
  if (!areas.length) { showError('範囲内にデータが見つかりません'); return; }
  if (areas.length === 1) { showAreaResult(areas[0]); return; }

  const avg = key => Math.round(areas.reduce((s, a) => s + (a[key] || 0), 0) / areas.length);
  const avgF = key => parseFloat((areas.reduce((s, a) => s + (parseFloat(a[key]) || 0), 0) / areas.length).toFixed(1));

  const merged = {
    town_name: `${areas.length}エリア平均`,
    income_label: `${avg('estimated_income')}万円帯`,
    estimated_income: avg('estimated_income'),
    pop_total: areas.reduce((s, a) => s + (a.pop_total || 0), 0),
    avg_age: avgF('avg_age'),
    child_ratio: avgF('child_ratio'),
    working_ratio: avgF('working_ratio'),
    elderly_ratio: avgF('elderly_ratio'),
    dominant_age_groups: areas[0].dominant_age_groups,
    family_types: areas[0].family_types,
    area_tags: [...new Set(areas.flatMap(a => a.area_tags || []))].slice(0, 4),
    monthly_food: avg('monthly_food'),
    monthly_eating_out: avg('monthly_eating_out'),
    monthly_clothes: avg('monthly_clothes'),
    monthly_goods: avg('monthly_goods'),
    monthly_edu: avg('monthly_edu'),
    monthly_leisure: avg('monthly_leisure'),
    age_dist: mergeAgeDist(areas)
  };

  currentAreaData = merged;
  renderAreaHeader(merged);

  const multiInfo = document.getElementById('multi-area-info');
  multiInfo.classList.remove('hidden');
  multiInfo.innerHTML = `<strong>${areas.length}エリア</strong>の平均値: ${areas.map(a => a.town_name).join('・')}`;

  renderProfileTab(merged);
  renderSpendingTab(merged);
  renderAgeTab(merged);
  renderChannelTab(merged);

  document.getElementById('panel-empty').classList.add('hidden');
  document.getElementById('area-header').classList.remove('hidden');
  document.getElementById('tabs').classList.remove('hidden');
  switchTab('profile');
  setPanelState('open');
}

function mergeAgeDist(areas) {
  const keys = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70+'];
  const result = {};
  keys.forEach(k => {
    result[k] = areas.reduce((s, a) => s + ((a.age_dist || {})[k] || 0), 0);
  });
  return result;
}

// ===== フリーハンド描画 =====
function onFreehandStart(e) {
  if (currentMode !== 'area' || e.button !== 0) return;
  e.stopPropagation();
  e.preventDefault();
  isFreehandDrawing = true;
  freehandPoints = [[e.clientX, e.clientY]];
  document.getElementById('freehand-svg').classList.add('active');
  updateSvgPath();
}

function onFreehandMove(e) {
  if (!isFreehandDrawing || currentMode !== 'area') return;
  e.stopPropagation();
  e.preventDefault();
  freehandPoints.push([e.clientX, e.clientY]);
  updateSvgPath();
}

function onFreehandEnd(e) {
  if (!isFreehandDrawing || currentMode !== 'area') return;
  e.stopPropagation();
  isFreehandDrawing = false;
  if (freehandPoints.length >= 5) finishFreehand();
  else clearFreehand();
}

function onFreehandTouchStart(e) {
  if (currentMode !== 'area') return;
  e.preventDefault();
  const t = e.touches[0];
  isFreehandDrawing = true;
  freehandPoints = [[t.clientX, t.clientY]];
  document.getElementById('freehand-svg').classList.add('active');
  updateSvgPath();
}

function onFreehandTouchMove(e) {
  if (!isFreehandDrawing || currentMode !== 'area') return;
  e.preventDefault();
  const t = e.touches[0];
  freehandPoints.push([t.clientX, t.clientY]);
  updateSvgPath();
}

function onFreehandTouchEnd(e) {
  if (!isFreehandDrawing || currentMode !== 'area') return;
  e.preventDefault();
  isFreehandDrawing = false;
  if (freehandPoints.length >= 5) finishFreehand();
  else clearFreehand();
}

function updateSvgPath() {
  if (!freehandPoints.length) return;
  const mapRect = document.getElementById('map').getBoundingClientRect();
  const pts = freehandPoints.map(([x, y]) => `${x - mapRect.left},${y - mapRect.top}`);
  const d = `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`;
  document.getElementById('freehand-path').setAttribute('d', d);
}

function finishFreehand() {
  const mapRect = document.getElementById('map').getBoundingClientRect();
  const latLngs = freehandPoints.map(([x, y]) =>
    map.containerPointToLatLng(L.point(x - mapRect.left, y - mapRect.top))
  );

  if (freehandPolygon) map.removeLayer(freehandPolygon);
  freehandPolygon = L.polygon(latLngs, {
    color: '#00d4de',
    fillColor: '#00d4de',
    fillOpacity: 0.08,
    weight: 2,
    dashArray: '6,4'
  }).addTo(map);

  const bounds = freehandPolygon.getBounds();
  const matched = allAreas.filter(area => {
    const coord = TOWN_COORDS[area.town_name];
    if (!coord) return false;
    const pt = L.latLng(coord[0], coord[1]);
    return bounds.contains(pt) && isPointInPolygon(pt, latLngs);
  });

  clearFreehand();
  showMultiAreaResult(matched);
}

function clearFreehand() {
  isFreehandDrawing = false;
  freehandPoints = [];
  document.getElementById('freehand-svg').classList.remove('active');
  document.getElementById('freehand-path').setAttribute('d', '');
}

// ===== ポリゴン内判定（Ray casting） =====
function isPointInPolygon(pt, polygon) {
  let inside = false;
  const x = pt.lng, y = pt.lat;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// ===== タブ切替 =====
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('hidden', c.id !== `tab-${tab}`));
}

// ===== 検索履歴 =====
function addHistory(name) {
  searchHistory = [name, ...searchHistory.filter(h => h !== name)].slice(0, 5);
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (!list) return;
  if (!searchHistory.length) {
    list.innerHTML = '<div style="color:var(--text-dim);font-size:12px;padding:4px 0">履歴はありません</div>';
    return;
  }
  list.innerHTML = searchHistory.map(h =>
    `<div class="history-chip" onclick="quickSelect('${h}');document.getElementById('history-drawer').classList.add('hidden')">${h}</div>`
  ).join('');
}

// ===== ローディング =====
function showLoading(show) {
  document.getElementById('loading').classList.toggle('hidden', !show);
}

// ===== エラートースト =====
function showError(msg) {
  const el = document.getElementById('error-toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}
