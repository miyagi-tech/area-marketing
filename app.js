// ===== Supabase 設定 =====
const SUPABASE_URL = 'https://alwivconpehsnwkfqjez.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c1r0_R5I8hUcbpca04duqA_EWrR3Fw0';
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== 状態管理 =====
let allAreas = [];
let currentMarker = null;
let currentRectangle = null;
let map = null;
let currentMode = 'point'; // 'point' | 'area'
let isDragging = false;
let dragStart = null;
let dragRect = null;

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  await loadAllAreas();
  initSearch();
  initTabs();
  initPanelClose();
});

// ===== 地図初期化 =====
function initMap() {
  map = L.map('map', {
    center: [35.6464, 139.6532],
    zoom: 13,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  map.on('click', onMapClick);

  // 範囲選択用イベント（地図コンテナ上でのマウス/タッチ）
  const mapContainer = document.getElementById('map');
  mapContainer.addEventListener('mousedown', onDragStart);
  mapContainer.addEventListener('mousemove', onDragMove);
  mapContainer.addEventListener('mouseup', onDragEnd);
  mapContainer.addEventListener('touchstart', onTouchStart, { passive: false });
  mapContainer.addEventListener('touchmove', onTouchMove, { passive: false });
  mapContainer.addEventListener('touchend', onTouchEnd);
}

// ===== モード切替 =====
function setMode(mode) {
  currentMode = mode;
  document.getElementById('btn-point').classList.toggle('active', mode === 'point');
  document.getElementById('btn-area').classList.toggle('active', mode === 'area');

  const hintText = document.getElementById('hint-text');
  if (mode === 'area') {
    hintText.textContent = '⬜ ドラッグして範囲を選択してください';
    document.getElementById('map-hint').classList.remove('hidden');
    map.dragging.disable();
    map.scrollWheelZoom.enable();
  } else {
    hintText.textContent = '📍 地図をクリックまたは町名を検索してください';
    map.dragging.enable();
    clearSelection();
  }
}

// ===== 全エリアデータ読み込み =====
async function loadAllAreas() {
  showLoading(true);
  try {
    const { data, error } = await db
      .from('setagaya_areas')
      .select('*')
      .order('town_name');

    if (error) throw error;
    allAreas = data || [];
    console.log(`${allAreas.length} 件のエリアデータを読み込みました`);
  } catch (err) {
    console.error('データ読み込みエラー:', err);
    showError('データの読み込みに失敗しました。しばらくしてから再試行してください。');
  } finally {
    showLoading(false);
  }
}

// ===== 地図クリック処理（1点モード） =====
async function onMapClick(e) {
  if (currentMode !== 'point') return;

  const { lat, lng } = e.latlng;
  document.getElementById('map-hint').classList.add('hidden');

  showLoading(true);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ja`,
      { headers: { 'Accept-Language': 'ja' } }
    );
    const geo = await res.json();
    const townName = extractTownName(geo);

    if (!townName) {
      showError('世田谷区内をクリックしてください');
      showLoading(false);
      return;
    }

    updateMarker(lat, lng, townName);
    const area = findArea(townName);
    if (area) {
      showAreaResult(area);
    } else {
      showError(`「${townName}」のデータが見つかりません`);
    }
  } catch (err) {
    console.error('ジオコーディングエラー:', err);
    showError('位置情報の取得に失敗しました');
  } finally {
    showLoading(false);
  }
}

// ===== 範囲選択（マウス） =====
function onDragStart(e) {
  if (currentMode !== 'area') return;
  if (e.button !== 0) return;
  isDragging = true;
  const rect = e.currentTarget.getBoundingClientRect();
  dragStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  dragRect = null;
  showSelectionBox(dragStart.x, dragStart.y, 0, 0);
  e.preventDefault();
}

function onDragMove(e) {
  if (!isDragging || currentMode !== 'area') return;
  const rect = e.currentTarget.getBoundingClientRect();
  const cur = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  const x = Math.min(dragStart.x, cur.x);
  const y = Math.min(dragStart.y, cur.y);
  const w = Math.abs(cur.x - dragStart.x);
  const h = Math.abs(cur.y - dragStart.y);
  showSelectionBox(x, y, w, h);
  dragRect = { x, y, w, h, endX: cur.x, endY: cur.y };
}

function onDragEnd(e) {
  if (!isDragging || currentMode !== 'area') return;
  isDragging = false;
  if (dragRect && dragRect.w > 20 && dragRect.h > 20) {
    processAreaSelection(dragStart, { x: dragRect.endX, y: dragRect.endY });
  }
  hideSelectionBox();
}

// ===== 範囲選択（タッチ） =====
function onTouchStart(e) {
  if (currentMode !== 'area') return;
  const touch = e.touches[0];
  const rect = e.currentTarget.getBoundingClientRect();
  isDragging = true;
  dragStart = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  showSelectionBox(dragStart.x, dragStart.y, 0, 0);
  e.preventDefault();
}

function onTouchMove(e) {
  if (!isDragging || currentMode !== 'area') return;
  const touch = e.touches[0];
  const rect = e.currentTarget.getBoundingClientRect();
  const cur = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  const x = Math.min(dragStart.x, cur.x);
  const y = Math.min(dragStart.y, cur.y);
  const w = Math.abs(cur.x - dragStart.x);
  const h = Math.abs(cur.y - dragStart.y);
  showSelectionBox(x, y, w, h);
  dragRect = { x, y, w, h, endX: cur.x, endY: cur.y };
  e.preventDefault();
}

function onTouchEnd(e) {
  if (!isDragging || currentMode !== 'area') return;
  isDragging = false;
  if (dragRect && dragRect.w > 20 && dragRect.h > 20) {
    processAreaSelection(dragStart, { x: dragRect.endX, y: dragRect.endY });
  }
  hideSelectionBox();
}

// ===== 選択ボックス表示 =====
function showSelectionBox(x, y, w, h) {
  const overlay = document.getElementById('selection-overlay');
  overlay.style.display = 'block';
  overlay.style.left = x + 'px';
  overlay.style.top = y + 'px';
  overlay.style.width = w + 'px';
  overlay.style.height = h + 'px';
}

function hideSelectionBox() {
  document.getElementById('selection-overlay').style.display = 'none';
}

function clearSelection() {
  hideSelectionBox();
  if (currentRectangle) {
    map.removeLayer(currentRectangle);
    currentRectangle = null;
  }
}

// ===== 範囲選択処理 =====
function processAreaSelection(startPx, endPx) {
  // ピクセル座標 → 地理座標
  const mapEl = document.getElementById('map');
  const mapRect = mapEl.getBoundingClientRect();

  const startLatLng = map.containerPointToLatLng(L.point(startPx.x, startPx.y));
  const endLatLng = map.containerPointToLatLng(L.point(endPx.x, endPx.y));

  const bounds = L.latLngBounds(startLatLng, endLatLng);

  // 既存の矩形を削除
  if (currentRectangle) map.removeLayer(currentRectangle);
  currentRectangle = L.rectangle(bounds, {
    color: '#6366f1',
    weight: 2,
    dashArray: '6,4',
    fillColor: '#6366f1',
    fillOpacity: 0.08,
  }).addTo(map);

  // 範囲内の町を特定（Nominatimで複数ポイントを検索）
  findAreasInBounds(bounds);
}

// ===== 範囲内エリア検索 =====
async function findAreasInBounds(bounds) {
  showLoading(true);
  document.getElementById('map-hint').classList.add('hidden');

  try {
    // 範囲内の複数ポイントを逆ジオコーディング（グリッド状に5点）
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const points = [
      { lat: (sw.lat + ne.lat) / 2, lng: (sw.lng + ne.lng) / 2 }, // 中心
      { lat: sw.lat + (ne.lat - sw.lat) * 0.25, lng: sw.lng + (ne.lng - sw.lng) * 0.25 },
      { lat: sw.lat + (ne.lat - sw.lat) * 0.75, lng: sw.lng + (ne.lng - sw.lng) * 0.25 },
      { lat: sw.lat + (ne.lat - sw.lat) * 0.25, lng: sw.lng + (ne.lng - sw.lng) * 0.75 },
      { lat: sw.lat + (ne.lat - sw.lat) * 0.75, lng: sw.lng + (ne.lng - sw.lng) * 0.75 },
    ];

    const townNames = new Set();

    for (const pt of points) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pt.lat}&lon=${pt.lng}&format=json&accept-language=ja`
        );
        const geo = await res.json();
        const name = extractTownName(geo);
        if (name) townNames.add(name);
        await new Promise(r => setTimeout(r, 200)); // レート制限対策
      } catch (e) { /* skip */ }
    }

    const matchedAreas = [...townNames]
      .map(name => findArea(name))
      .filter(Boolean)
      .filter((a, i, arr) => arr.findIndex(b => b.id === a.id) === i); // 重複除去

    if (matchedAreas.length === 0) {
      showError('範囲内に世田谷区のデータが見つかりません');
      return;
    }

    if (matchedAreas.length === 1) {
      showAreaResult(matchedAreas[0]);
    } else {
      showMultiAreaResult(matchedAreas);
    }
  } catch (err) {
    console.error('範囲検索エラー:', err);
    showError('範囲内のデータ取得に失敗しました');
  } finally {
    showLoading(false);
  }
}

// ===== 複数エリア平均表示 =====
function showMultiAreaResult(areas) {
  openPanel();

  document.getElementById('panel-empty').classList.add('hidden');
  document.getElementById('area-header').classList.remove('hidden');
  document.getElementById('multi-area-info').classList.remove('hidden');
  document.getElementById('tabs').classList.remove('hidden');

  // ヘッダー
  document.getElementById('area-name').textContent = `${areas.length}エリア平均`;
  const badge = document.getElementById('income-badge');
  const avgIncome = Math.round(areas.reduce((s, a) => s + a.estimated_income, 0) / areas.length);
  badge.textContent = `平均 ${avgIncome}万円`;
  badge.className = avgIncome >= 800 ? 'income-high' : avgIncome >= 600 ? 'income-mid' : 'income-low';

  document.getElementById('area-tags').innerHTML = '';
  const totalPop = areas.reduce((s, a) => s + (a.pop_total || 0), 0);
  const avgAge = (areas.reduce((s, a) => s + a.avg_age, 0) / areas.length).toFixed(1);
  document.getElementById('area-pop').textContent = `合計人口 ${totalPop.toLocaleString()}人`;
  document.getElementById('area-age').textContent = `平均年齢 ${avgAge}歳`;

  // 含まれる町名リスト
  document.getElementById('multi-area-info').innerHTML =
    `<strong>含まれるエリア：</strong>${areas.map(a => a.town_name).join('、')}`;

  // 平均値を計算
  const avg = (key) => Math.round(areas.reduce((s, a) => s + (a[key] || 0), 0) / areas.length);
  const avgArea = {
    estimated_income: avgIncome,
    income_label: `${avgIncome}万円帯`,
    child_ratio: (areas.reduce((s, a) => s + a.child_ratio, 0) / areas.length).toFixed(1),
    working_ratio: (areas.reduce((s, a) => s + a.working_ratio, 0) / areas.length).toFixed(1),
    elderly_ratio: (areas.reduce((s, a) => s + a.elderly_ratio, 0) / areas.length).toFixed(1),
    monthly_food: avg('monthly_food'),
    monthly_eating_out: avg('monthly_eating_out'),
    monthly_clothes: avg('monthly_clothes'),
    monthly_goods: avg('monthly_goods'),
    monthly_edu: avg('monthly_edu'),
    monthly_leisure: avg('monthly_leisure'),
    dominant_age_groups: areas[0].dominant_age_groups,
    family_types: areas[0].family_types,
    age_dist: mergeAgeDist(areas),
  };

  renderPanelContent(avgArea);
}

// ===== 年齢分布マージ =====
function mergeAgeDist(areas) {
  const keys = ['0-9','10-19','20-29','30-39','40-49','50-59','60-69','70+'];
  const merged = {};
  keys.forEach(k => {
    merged[k] = areas.reduce((s, a) => s + ((a.age_dist && a.age_dist[k]) || 0), 0);
  });
  return merged;
}

// ===== 町名抽出 =====
function extractTownName(geo) {
  const addr = geo.address || {};
  const neighbourhood = addr.neighbourhood || '';
  const quarter = addr.quarter || '';
  const suburb = addr.suburb || '';

  const candidates = [neighbourhood, quarter, suburb];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const cleaned = candidate
      .replace(/[一二三四五六七八九十百千万]+丁目$/, '')
      .replace(/\d+丁目$/, '')
      .replace(/丁目$/, '')
      .trim();

    if (cleaned && cleaned.length >= 2) {
      const match = findArea(cleaned);
      if (match) return match.town_name;
    }
  }

  const displayName = geo.display_name || '';
  for (const area of allAreas) {
    if (displayName.includes(area.town_name)) {
      return area.town_name;
    }
  }

  return null;
}

// ===== エリア検索 =====
function findArea(name) {
  if (!name) return null;
  let found = allAreas.find(a => a.town_name === name);
  if (found) return found;
  found = allAreas.find(a =>
    a.town_name.includes(name) || name.includes(a.town_name)
  );
  return found || null;
}

// ===== マーカー更新 =====
function updateMarker(lat, lng, name) {
  if (currentMarker) map.removeLayer(currentMarker);

  const icon = L.divIcon({
    className: '',
    html: `<div style="
      background: #6366f1;
      color: white;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 2px 12px rgba(99,102,241,0.5);
      font-family: -apple-system, sans-serif;
      border: 1px solid rgba(255,255,255,0.2);
    ">${name}</div>`,
    iconAnchor: [0, 0],
  });

  currentMarker = L.marker([lat, lng], { icon }).addTo(map);
}

// ===== パネルを開く =====
function openPanel() {
  document.getElementById('result-panel').classList.add('open');
}

// ===== パネルを閉じる =====
function closePanel() {
  document.getElementById('result-panel').classList.remove('open');
  // 空状態に戻す
  document.getElementById('panel-empty').classList.remove('hidden');
  document.getElementById('area-header').classList.add('hidden');
  document.getElementById('multi-area-info').classList.add('hidden');
  document.getElementById('tabs').classList.add('hidden');
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  // マーカー・矩形をクリア
  if (currentMarker) { map.removeLayer(currentMarker); currentMarker = null; }
  clearSelection();
  // ヒントを再表示
  document.getElementById('map-hint').classList.remove('hidden');
}

// ===== パネル閉じるボタン初期化 =====
function initPanelClose() {
  document.getElementById('panel-close-btn').addEventListener('click', closePanel);
}

// ===== 結果表示（1エリア） =====
function showAreaResult(area) {
  openPanel();

  document.getElementById('panel-empty').classList.add('hidden');
  document.getElementById('area-header').classList.remove('hidden');
  document.getElementById('multi-area-info').classList.add('hidden');
  document.getElementById('tabs').classList.remove('hidden');

  document.getElementById('area-name').textContent = area.town_name;

  const badge = document.getElementById('income-badge');
  badge.textContent = area.income_label;
  badge.className = area.estimated_income >= 800 ? 'income-high'
    : area.estimated_income >= 600 ? 'income-mid' : 'income-low';

  const tags = area.area_tags || [];
  document.getElementById('area-tags').innerHTML =
    tags.map(t => `<span class="area-tag">${t}</span>`).join('');

  document.getElementById('area-pop').textContent = `人口 ${area.pop_total.toLocaleString()}人`;
  document.getElementById('area-age').textContent = `平均年齢 ${area.avg_age}歳`;

  renderPanelContent(area);
}

// ===== パネルコンテンツ描画（共通） =====
function renderPanelContent(area) {
  // 年収カード
  document.getElementById('income-display').innerHTML = `
    <div class="income-amount">${area.estimated_income.toLocaleString()}<span style="font-size:16px;font-weight:400">万円</span></div>
    <div class="income-unit">推定世帯年収（年間）</div>
    <div class="income-note">※ 国勢調査データから統計的に推計</div>
  `;

  // 主要年齢層
  const ageGroups = area.dominant_age_groups || [];
  document.getElementById('age-groups').innerHTML = ageGroups.map((g, i) => `
    <div class="age-group-badge ${i === 0 ? 'rank1' : ''}">
      ${i === 0 ? '🥇' : '🥈'} ${g}
    </div>
  `).join('');

  // 家族構成
  const families = area.family_types || [];
  document.getElementById('family-types').innerHTML = families.map(f => `
    <div class="family-item">
      <span class="family-label">${f.type}</span>
      <div class="family-bar-wrap">
        <div class="family-bar" style="width: ${f.ratio}%"></div>
      </div>
      <span class="family-ratio">${f.ratio}%</span>
    </div>
  `).join('');

  // 年齢構成比
  document.getElementById('age-ratio-bars').innerHTML = `
    <div class="ratio-row">
      <span class="ratio-label">年少（〜14歳）</span>
      <div class="ratio-bar-wrap"><div class="ratio-bar children" style="width:${area.child_ratio}%"></div></div>
      <span class="ratio-val">${area.child_ratio}%</span>
    </div>
    <div class="ratio-row">
      <span class="ratio-label">生産年齢（15〜64歳）</span>
      <div class="ratio-bar-wrap"><div class="ratio-bar working" style="width:${area.working_ratio}%"></div></div>
      <span class="ratio-val">${area.working_ratio}%</span>
    </div>
    <div class="ratio-row">
      <span class="ratio-label">高齢者（65歳〜）</span>
      <div class="ratio-bar-wrap"><div class="ratio-bar elderly" style="width:${area.elderly_ratio}%"></div></div>
      <span class="ratio-val">${area.elderly_ratio}%</span>
    </div>
  `;

  // 支出カード
  document.getElementById('spending-cards').innerHTML = `
    <div class="spending-card">
      <div class="spending-icon">🛒</div>
      <div class="spending-label">食費（自炊）</div>
      <div class="spending-amount">${Math.round(area.monthly_food / 1000)}千<span class="spending-unit">円/月</span></div>
    </div>
    <div class="spending-card">
      <div class="spending-icon">🍽️</div>
      <div class="spending-label">外食費</div>
      <div class="spending-amount">${Math.round(area.monthly_eating_out / 1000)}千<span class="spending-unit">円/月</span></div>
    </div>
    <div class="spending-card">
      <div class="spending-icon">👗</div>
      <div class="spending-label">服・履物</div>
      <div class="spending-amount">${Math.round(area.monthly_clothes / 1000)}千<span class="spending-unit">円/月</span></div>
    </div>
    <div class="spending-card">
      <div class="spending-icon">🏠</div>
      <div class="spending-label">雑貨・日用品</div>
      <div class="spending-amount">${Math.round(area.monthly_goods / 1000)}千<span class="spending-unit">円/月</span></div>
    </div>
    <div class="spending-card">
      <div class="spending-icon">📚</div>
      <div class="spending-label">教育費</div>
      <div class="spending-amount">${Math.round(area.monthly_edu / 1000)}千<span class="spending-unit">円/月</span></div>
    </div>
    <div class="spending-card">
      <div class="spending-icon">🎭</div>
      <div class="spending-label">娯楽・趣味</div>
      <div class="spending-amount">${Math.round(area.monthly_leisure / 1000)}千<span class="spending-unit">円/月</span></div>
    </div>
  `;

  // 年齢分布チャート
  const ageDist = area.age_dist || {};
  const maxVal = Math.max(...Object.values(ageDist));
  const ageLabels = {
    '0-9': '0〜9歳', '10-19': '10〜19歳', '20-29': '20〜29歳',
    '30-39': '30〜39歳', '40-49': '40〜49歳', '50-59': '50〜59歳',
    '60-69': '60〜69歳', '70+': '70歳〜'
  };

  document.getElementById('age-chart').innerHTML = Object.entries(ageDist).map(([key, val]) => {
    const pct = maxVal > 0 ? (val / maxVal * 100) : 0;
    return `
      <div class="age-bar-row">
        <span class="age-bar-label">${ageLabels[key] || key}</span>
        <div class="age-bar-wrap">
          <div class="age-bar-fill" style="width:${pct}%">
            <span class="age-bar-count">${val.toLocaleString()}人</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('result-panel').scrollTop = 0;
  switchTab('profile');
}

// ===== タブ切り替え =====
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('hidden', content.id !== `tab-${tabName}`);
  });
}

// ===== 検索機能 =====
function initSearch() {
  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-btn');
  const suggestions = document.getElementById('search-suggestions');

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (q.length < 1) { suggestions.innerHTML = ''; return; }

    const matches = allAreas.filter(a => a.town_name.includes(q)).slice(0, 8);
    suggestions.innerHTML = matches.map(a => `
      <div class="suggestion-item" data-name="${a.town_name}">
        📍 ${a.town_name}
        <span style="color:#5a607a;font-size:11px;margin-left:6px">${a.income_label}</span>
      </div>
    `).join('');

    suggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        selectArea(item.dataset.name);
        input.value = '';
        suggestions.innerHTML = '';
      });
    });
  });

  btn.addEventListener('click', () => {
    const q = input.value.trim();
    if (q) {
      const area = findArea(q);
      if (area) {
        selectArea(area.town_name);
        input.value = '';
        suggestions.innerHTML = '';
      } else {
        showError(`「${q}」は見つかりませんでした`);
      }
    }
  });

  input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

  document.addEventListener('click', e => {
    if (!e.target.closest('#search-bar')) suggestions.innerHTML = '';
  });
}

// ===== エリア選択（検索から） =====
async function selectArea(name) {
  const area = findArea(name);
  if (!area) return;

  document.getElementById('map-hint').classList.add('hidden');
  showLoading(true);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name + ' 世田谷区 東京')}&format=json&limit=1&accept-language=ja`
    );
    const results = await res.json();
    if (results.length > 0) {
      const lat = parseFloat(results[0].lat);
      const lng = parseFloat(results[0].lon);
      map.setView([lat, lng], 15);
      updateMarker(lat, lng, name);
    }
  } catch (err) {
    console.warn('座標取得失敗:', err);
  } finally {
    showLoading(false);
  }

  showAreaResult(area);
}

// ===== ローディング =====
function showLoading(show) {
  document.getElementById('loading').classList.toggle('hidden', !show);
}

// ===== エラー表示 =====
function showError(msg) {
  const toast = document.getElementById('error-toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}
