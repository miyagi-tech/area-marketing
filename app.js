// ===== Supabase 設定 =====
const SUPABASE_URL = 'https://alwivconpehsnwkfqjez.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c1r0_R5I8hUcbpca04duqA_EWrR3Fw0';
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== 状態管理 =====
let allAreas = [];
let currentMarker = null;
let map = null;

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  await loadAllAreas();
  initSearch();
  initTabs();
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

// ===== 地図クリック処理 =====
async function onMapClick(e) {
  const { lat, lng } = e.latlng;
  
  // ヒントを非表示
  document.getElementById('map-hint').classList.add('hidden');
  
  showLoading(true);
  try {
    // Nominatim APIで逆ジオコーディング
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ja`,
      { headers: { 'Accept-Language': 'ja' } }
    );
    const geo = await res.json();
    
    // 町名を抽出
    const townName = extractTownName(geo);
    
    if (!townName) {
      showError('世田谷区内をクリックしてください');
      showLoading(false);
      return;
    }
    
    // マーカーを更新
    updateMarker(lat, lng, townName);
    
    // データを検索・表示
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

// ===== 町名抽出 =====
function extractTownName(geo) {
  const addr = geo.address || {};
  
  // 世田谷区かチェック
  const city = addr.city || addr.town || addr.county || '';
  const suburb = addr.suburb || '';
  const neighbourhood = addr.neighbourhood || '';
  const quarter = addr.quarter || '';
  
  if (!city.includes('世田谷') && !suburb.includes('世田谷') && !neighbourhood.includes('世田谷')) {
    // 世田谷区外でも試みる
  }
  
  // 候補を優先順位順に確認
  const candidates = [neighbourhood, quarter, suburb];
  
  for (const candidate of candidates) {
    if (!candidate) continue;
    // 丁目を除去して町名のみ取得
    const cleaned = candidate
      .replace(/[一二三四五六七八九十百千万]+丁目$/, '')
      .replace(/\d+丁目$/, '')
      .replace(/丁目$/, '')
      .trim();
    
    if (cleaned && cleaned.length >= 2) {
      // DBのデータと照合
      const match = findArea(cleaned);
      if (match) return match.town_name;
    }
  }
  
  // 住所文字列全体から探す
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
  
  // 完全一致
  let found = allAreas.find(a => a.town_name === name);
  if (found) return found;
  
  // 部分一致
  found = allAreas.find(a => 
    a.town_name.includes(name) || name.includes(a.town_name)
  );
  return found || null;
}

// ===== マーカー更新 =====
function updateMarker(lat, lng, name) {
  if (currentMarker) {
    map.removeLayer(currentMarker);
  }
  
  const icon = L.divIcon({
    className: '',
    html: `<div style="
      background: #2563eb;
      color: white;
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-family: -apple-system, sans-serif;
    ">${name}</div>`,
    iconAnchor: [0, 0],
  });
  
  currentMarker = L.marker([lat, lng], { icon }).addTo(map);
}

// ===== 結果表示 =====
function showAreaResult(area) {
  const panel = document.getElementById('result-panel');
  panel.classList.remove('hidden');
  
  // エリア名
  document.getElementById('area-name').textContent = area.town_name;
  
  // 年収バッジ
  const badge = document.getElementById('income-badge');
  badge.textContent = area.income_label;
  if (area.estimated_income >= 800) {
    badge.className = 'income-high';
  } else if (area.estimated_income >= 600) {
    badge.className = 'income-mid';
  } else {
    badge.className = 'income-low';
  }
  
  // エリアタグ
  const tagsEl = document.getElementById('area-tags');
  const tags = area.area_tags || [];
  tagsEl.innerHTML = tags.map(t => `<span class="area-tag">${t}</span>`).join('');
  
  // メタ情報
  document.getElementById('area-pop').textContent = `人口 ${area.pop_total.toLocaleString()}人`;
  document.getElementById('area-age').textContent = `平均年齢 ${area.avg_age}歳`;
  
  // 年収カード
  document.getElementById('income-display').innerHTML = `
    <div class="income-amount">${area.estimated_income.toLocaleString()}<span style="font-size:16px">万円</span></div>
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
  
  // 年齢構成比バー
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
  
  // パネルにスクロール
  panel.scrollTop = 0;
  
  // 最初のタブをアクティブに
  switchTab('profile');
}

// ===== タブ切り替え =====
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('hidden', content.id !== `tab-${tabName}`);
    content.classList.toggle('active', content.id === `tab-${tabName}`);
  });
}

// ===== 検索機能 =====
function initSearch() {
  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-btn');
  const suggestions = document.getElementById('search-suggestions');
  
  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (q.length < 1) {
      suggestions.innerHTML = '';
      return;
    }
    
    const matches = allAreas.filter(a => a.town_name.includes(q)).slice(0, 8);
    suggestions.innerHTML = matches.map(a => `
      <div class="suggestion-item" data-name="${a.town_name}">
        📍 ${a.town_name}
        <span style="color:#64748b;font-size:11px;margin-left:6px">${a.income_label}</span>
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
  
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') btn.click();
  });
  
  // 外クリックで候補を閉じる
  document.addEventListener('click', e => {
    if (!e.target.closest('#search-bar')) {
      suggestions.innerHTML = '';
    }
  });
}

// ===== エリア選択（検索から） =====
async function selectArea(name) {
  const area = findArea(name);
  if (!area) return;
  
  document.getElementById('map-hint').classList.add('hidden');
  
  // Nominatimで座標を取得
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
