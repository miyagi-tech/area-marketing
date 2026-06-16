// ===== Supabase設定 =====
const SUPABASE_URL = 'https://alwivconpehsnwkfqjez.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c1r0_R5I8hUcbpca04duqA_EWrR3Fw0';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== 年代カラー（若い=明るい） =====
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
let touchStartY = 0;

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

  // ズームコントロールを右下に配置
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // 地図クリック（ポイントモード）
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
    }
  });

  // パネルコントロールボタン
  document.getElementById('panel-minimize-btn').addEventListener('click', () => setPanelState('peek'));
  document.getElementById('panel-expand-btn').addEventListener('click', () => setPanelState('open'));
  document.getElementById('panel-new-search-btn').addEventListener('click', () => {
    setPanelState('closed');
    setTimeout(() => document.getElementById('search-input').focus(), 300);
  });

  // スマホ: スワイプでパネル操作
  const handle = document.getElementById('panel-handle');
  if (handle) {
    handle.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    handle.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (dy > 50) {
        if (panelState === 'open') setPanelState('peek');
        else if (panelState === 'peek') setPanelState('closed');
      } else if (dy < -50) {
        if (panelState === 'peek') setPanelState('open');
        else if (panelState === 'closed') setPanelState('open');
      }
    }, { passive: true });
  }

  // フリーハンド描画イベント（地図コンテナ）
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
        html: `<div style="background:#00c2cb;color:#0d0f14;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 10px rgba(0,194,203,0.5);font-family:Outfit,sans-serif">${townName || '?'}</div>`,
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

// ===== エリア検索 =====
function findArea(name) {
  if (!name) return null;
  return allAreas.find(a => a.town_name === name)
    || allAreas.find(a => a.town_name.includes(name) || name.includes(a.town_name))
    || null;
}

// ===== 検索 =====
async function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  document.getElementById('search-suggestions').innerHTML = '';
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
          html: `<div style="background:#00c2cb;color:#0d0f14;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 10px rgba(0,194,203,0.5);font-family:Outfit,sans-serif">${area.town_name}</div>`,
          iconAnchor: [0, 0]
        })
      }).addTo(map);
    }
  } catch (e) {
    console.warn('座標取得失敗:', e);
  } finally {
    showLoading(false);
  }

  showAreaResult(area);
}

function onSearchInput(e) {
  const q = e.target.value.trim();
  const box = document.getElementById('search-suggestions');
  if (!q) { box.innerHTML = ''; return; }
  const matches = allAreas.filter(a => a.town_name.includes(q)).slice(0, 8);
  box.innerHTML = matches.map(a =>
    `<div class="suggestion-item" onclick="quickSelect('${a.town_name}')">📍 ${a.town_name} <span style="color:#4a5568;font-size:11px">${a.income_label}</span></div>`
  ).join('');
}

function quickSelect(name) {
  document.getElementById('search-input').value = name;
  document.getElementById('search-suggestions').innerHTML = '';
  const area = findArea(name);
  if (area) showAreaResult(area);
}

// ===== エリア結果表示（1エリア） =====
function showAreaResult(area) {
  addHistory(area.town_name);
  renderAreaHeader(area);
  document.getElementById('multi-area-info').classList.add('hidden');
  renderProfileTab(area);
  renderSpendingTab(area);
  renderAgeTab(area);
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
  // 年収カード
  document.getElementById('income-display').innerHTML = `
    <div class="income-amount">${(area.estimated_income || 0).toLocaleString()}<span>万円</span></div>
    <div class="income-sub">
      <div class="income-unit">推定世帯年収（年間）</div>
      <div class="income-note">※ 国勢調査データから統計的に推計</div>
    </div>
  `;

  // 主要年齢層
  const ageGroups = area.dominant_age_groups || [];
  document.getElementById('age-groups').innerHTML = ageGroups.map((g, i) =>
    `<div class="age-group-badge ${i === 0 ? 'rank1' : ''}">${i === 0 ? '🥇' : '🥈'} ${g}</div>`
  ).join('');

  // 家族構成
  const families = area.family_types || [];
  document.getElementById('family-types').innerHTML = families.map(f => `
    <div class="family-item">
      <div class="family-label">${f.type}</div>
      <div class="family-bar-wrap"><div class="family-bar" style="width:${f.ratio}%"></div></div>
      <div class="family-ratio">${f.ratio}%</div>
    </div>
  `).join('');

  // 年齢構成比
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

// ===== 年齢分布タブ（年代別カラー） =====
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

  renderAreaHeader(merged);

  const multiInfo = document.getElementById('multi-area-info');
  multiInfo.classList.remove('hidden');
  multiInfo.innerHTML = `<strong>${areas.length}エリア</strong>の平均値: ${areas.map(a => a.town_name).join('・')}`;

  renderProfileTab(merged);
  renderSpendingTab(merged);
  renderAgeTab(merged);

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
  const svg = document.getElementById('freehand-svg');
  svg.classList.add('active');
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
    color: '#00c2cb',
    fillColor: '#00c2cb',
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
  '玉堤':       [35.5990, 139.6450]
};

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
  const box = document.getElementById('search-history');
  const list = document.getElementById('history-list');
  if (!searchHistory.length) { box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  list.innerHTML = searchHistory.map(h =>
    `<div class="history-chip" onclick="quickSelect('${h}')">${h}</div>`
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
