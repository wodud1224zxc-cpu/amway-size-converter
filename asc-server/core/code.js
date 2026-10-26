// ===== Amway Size Converter v3.44 =====
// 원칙
//  1) 모드 전환 전 모든 크기 값을 기록 → 모드 전환 → 바뀐 값은 토큰이 처리한 것, 그대로인 값만 직접 변환
//  2) 직접 변환한 값은 같은 값의 토큰(Spacing·Radius 변수, Publishing 텍스트 스타일)에 다시 연결 (기본값)
//  3) 750 = Photoshop, 375 = Mobile, PC = 1376 프레임 (콘텐츠 영역 그대로)
const SIZES = {
  '375': { label: '375', mode: 'Mobile', root: 375, content: 345, margin: 15, dens: 1 },
  '750': { label: '750', mode: 'Photoshop', root: 750, content: 690, margin: 30, dens: 2 },
  'PC': { label: 'PC', mode: 'PC', root: 1376, content: 1376, margin: 0, dens: 1 },
};
// 컬렉션 모드 이름 → 사이즈 (Typography-Page 의 mobile(pub)/desktop(pub) 포함)
const MODE_ALIASES = {
  '375': ['mobile', 'mobile(pub)', 'mo', '375'],
  '750': ['photoshop', '750', 'mo@2x'],
  'PC': ['pc', 'desktop', 'desktop(pub)'],
};
const modeFor = (c, size) => c.modes.find(m => MODE_ALIASES[size].includes(m.name.trim().toLowerCase()));
const IDX = { '750': 0, 'PC': 1, '375': 2 }; // 표 열 순서 [Photoshop, PC, Mobile]

// Spacing 토큰 (padTop/padBtm 제외)
const SPACING = [
  [20, 10, 10], [30, 15, 15], [40, 20, 20], [50, 30, 25], [60, 40, 30],
  [70, 50, 35], [100, 70, 50], [120, 80, 60], [140, 100, 70], [160, 160, 80],
];
// Typography-Publishing: [스타일 그룹, Photoshop, PC, Mobile]
const TYPO_ROWS = [
  ['fntE', 24, 12, 12], ['기본사이즈', 28, 14, 14], ['fntP', 30, 16, 15], ['fntH6', 32, 18, 16],
  ['fntH6.fntL', 34, 22, 17], ['fntH5', 36, 24, 18], ['fntH5.fntL', 38, 28, 19], ['fntH4', 40, 30, 20],
  ['fntH4.fntL', 44, 34, 22], ['fntH4.fntM', 46, 36, 23], ['fntH3', 48, 42, 24], ['fntH3.fntM', 50, 44, 25],
  ['fntH3.fntL', 52, 46, 26], ['fntH2', 56, 48, 28], ['fntH2.fntM', 62, 50, 30], ['fntH2.fntL', 64, 52, 32],
  ['fntH1.fntM', 72, 60, 34], ['fntH1', 76, 64, 38], ['fntH1.fntL', 84, 68, 42],
];
const TYPO = TYPO_ROWS.map(r => r.slice(1));
const WEIGHTS = { bold: 0, medium: 1, regular: 2, light: 3 };
// 스타일 가이드(Design Style Guide 0.1) Publishing 텍스트 스타일 키 [bold, medium, regular, light] — 라이브러리 가져오기용
const STYLE_KEYS = {
  'fntH1.fntL': ['ed48b9ee3c6f01687b07643d8e336d3d72cd5c01', '04e77e649a90947cca08a07a2a7095f9e40ad217', 'f437b04499628304f539e3f426932f6aa2fc0ad0', 'e8ad8fe06d116f0f7d0e5793e8478305e6452133'],
  'fntH1': ['79940b144fe33c140cefe5a271eaab225d11fb3c', '8187dfb229b12fe00c57ed250f71b588e8d5f2c1', '63fc5af160f4325ceba4941c5745dcb59d785855', '11e773c8d4375f828490f528f89dc58e336d92fa'],
  'fntH1.fntM': ['d661fe409679cce42664d2335c13cc6b5006e47e', '4fcfd1abdb68824a6c9f9e7d86f72f96a1023aa0', '5d15467907a64a102dfe2a5f5313e81fe3400d4c', 'e3558b49a3c51fdc7f96f9db624cd7f9a9469276'],
  'fntH2.fntL': ['58b2c27936775d11cef6107e5540973f03bfcf84', '9e4390938da486c96b4cc89242408ef7a207e0f2', '31b4cf8801e0a4d838a6ec31f10f8c4de6624243', '6fdba6e3c6e107f30bc6086a2bf76e96e2f68cbc'],
  'fntH2': ['ec435617b8e5880cf451add22e61eead46587ac3', '258089577f298649bcc45354fbdc6e02274922e5', '39377cbe728de806b19cd25154b704b8f850b7ca', '9a7af5bd12e5fd9ffa992329e454e274a66ccd44'],
  'fntH2.fntM': ['8b8b37315a9cc7f01211a57f85eba2c417da2502', 'a1504dbf60e24eacb9dfe90afba270fe7b3f7c97', '1dc8e9380bdad74307aa4e1a4768b41d8ae3944a', 'b3f2a7219b302a28daaadbb929f651b4ec25e633'],
  'fntH3.fntL': ['1935bb13d72b338ad7d31648273e6ce65e4cfdb4', '8575532ca4b0b0f6666c1c9aa08c1527d19a62d7', '70f69308910194562a923e4de21b54e1c830d9d4', 'c46fe49b402d852df196cf56a1e89186441d9b13'],
  'fntH3': ['6795bfc1cec561c74e9911327f88a7f7f7b0e370', 'a6b01876e6b74dbe7faf07436a32623c449be2d3', '0240d70e0fa7c7da4a10dac690b433795a601405', '8f408c5a9e928f11f1692952c1a893fb0fe0b932'],
  'fntH3.fntM': ['a9460469ab0532289538f7a0384e8d8c9588b57a', '9ae923504cff34bbccaffe8f9cd48673e28c4f81', 'c5e67301a73215d4a445377cfca0084e3536b258', 'c50ba29c475d80cd73d614bdcc7e4292e8fc44a7'],
  'fntH4.fntL': ['de19825aeb20ace2f0a9a53c2121415cb80777cd', 'c74f7973c5deeb5584c0bdea9a450a7f98f6e0f5', '04558ca850866a58d0b6112a87a9504be1636316', '5f81101995eb6cded87e77f26640200a8cf1c382'],
  'fntH4': ['9c272a6c757ea3d3147e9b813a21b0cea5c71a49', 'da5aafab44c5b0cada23bbf8f558d9d2d62fb5eb', '24f19256d1aeda2a93e39a70fea9259005c0940c', 'adda91aa3f0c4172bce52c7807873f9c480296ef'],
  'fntH4.fntM': ['ccb5ad6dcc9cbcaf95664df08a1a2d6e24cbceaa', '54b0f122ed75c22b975eb20c57925c3da41c75cd', '7fa3dcd195a43efe3db871cc6a0ba82db421c41e', 'e352f73ac6768d752bf4fa8cfcc135f38c885e9a'],
  'fntH5.fntL': ['f323676ab3eeaffb97e361e08bc825cfd31927a1', '7b70fe1a002f007d9e4ce372fe9b452d499d90d4', '60dd23e7f951dfc224494d9b78e42870eb6385a8', '2ef2fd191ebda210e1a42e73daa24b89d15e44c0'],
  'fntH5': ['7eaa0af4ef4aa961abfb873ed42ad46d80a536f2', '1814c9419b9ff7fc01efb8eed73e3fde74de2f8e', '2cec9738e89156bd696be8f8ccf56cdace0c9162', '2ea7861cffd0c406d54b3c434de4281292228790'],
  'fntH6.fntL': ['0f39a09eb29f813940e320daaace8681f2467410', '41999152d3caa1a90aaa090dea4e779a3557815c', 'f5d404c09bd133f8ade9e459b3623e4f0f8ad9a1', 'eed70103e504cc73cdef4d5b9fd37b8b05f1ae04'],
  'fntH6': ['805b1a7d715a62146db2c770b59c5aa502e7299c', '5f5c059c0661ef4974dbe3174b91858a28918174', 'cfa7041f2b0ce4565e8fe3faabf50886eb98e968', '551d0e559ba54d0ca1186ca032dce32bff21ba47'],
  'fntP': ['4ce2dbddf7a61319567b0edf6d6a2e10f6db3b0e', '8b0019aa9ffc9da76bb3b95f4283c7c3cbb991d1', '65e0163a44762dcac14a08ce5d59e028ad72fa3e', '18da541cfe8ae1137e34fc23daddccaef1dfb29f'],
  '기본사이즈': ['c4bc70b1e814c885c5ea319f70e661c61aa25d8b', '94f35a0693595b79ed271d9bfaade2779f2da8e3', '73caeeb4b30ff1a4af1d76e4519eddd1eaf13a8a', 'a6ccae6cc5fbd31cd76042da49a2e75edd3a0b1e'],
  'fntE': ['9dd73447c700d3a0935a4204ed42a155486e9ab7', '08d351e7aaeaa937b0d2dfb5b8abae2c6970cc83', '853d05fffd78a260106e21807e99c0c182cd83e2', 'a037649ba9c95b4b2495269b6842defb733bcaa4'],
};
// Spacing / Radius 변수 키 (라이브러리 가져오기용)
const VAR_KEYS = [
  'd977cc7568c44aab8a84bf52ff411fb20ec33319', '949a362339afa376ef563b66f8af0a77a71f00d8', '5b7b08141dc7f6ca389440d8c81ebb37ce5fc2f0', '529e353133b2371152e1417064b77192b34a6adf',
  '49065efaac6775a00877856f74ac948e110bc159', 'f35d1a22f050b535f40267da5163831049bf9802', 'f72ab0d34e147d9da43bba58d35556121fc4ef0b', 'a479c2332c774257c26fb175abbe054e198e882b',
  'c412bc9a67f7d3f1ad9a657c3726859663a5bc7d', 'ce378e95228bc584a42ec48e8e0f2dfd673f8880',
  '4dd584477a0afa3d0b0213d923a00e444fa58454', '56f63505af949b1482bb5c9c0058d0a79f046fe8', '9972c4415229a6f5aeebfd9323559338ec2aa1ca', 'f0e2e61ae7cfc4e42ea640ae062226ee01c28c5f',
  'bdfd4ecedb243a12750ae58f4eedb1360fac555c', 'a9ed1da422874b2cd3b7ba1a184a85a1a56de93a', '6e27cd81aa53cadb94aa38fef0ed6cf9d8f31fe1', 'c16c66fbf8ed9d256e548956b8835c8f3e3f71b9',
  'b0d7dac36418622543c0a626eddcc88a0d3107e4', 'bc0cad115b2a064b7f640b81b14b2e67f9e235ac', '6c96532a6d3e0f09bd7a231a1e9249ad231e7fe2',
];

// ===== PC 규격 (스타일 가이드 '2.1 Layout' 기준 — 팀 합의 시 이 값만 수정) =====
const GRID = { content: 1376, columns: 12, gutter: 24 };
GRID.col = (GRID.content - GRID.gutter * (GRID.columns - 1)) / GRID.columns;    // 컬럼 1개 폭
const span = n => Math.round(n * GRID.col + (n - 1) * GRID.gutter);             // n컬럼 폭
// 섹션별 폭: KV(직접 배치 이미지 영역)는 1376 전체, 나머지 콘텐츠는 960 칼럼(가운데)
// 프레임 이름에 [넓게] (또는 [wide])를 붙인 섹션만 1376 전체 사용
const PC_RULES = {
  narrow: 960,         // 기본 콘텐츠 영역 폭
  btnBase: 690,        // 버튼 폭 비율 기준 (모바일 칼럼 대비 비율 유지)
  wide: 1376,          // 넓게: 섹션 폭 (콘텐츠 영역 전체)
  bg: 1097,            // 배경 이미지 섹션: 배경만 1097 (KV 제외, 안의 내용은 960)
  wideText: span(8),   // 넓게 섹션 안의 글 묶음 최대 폭 (909)
  imageScale: 2,       // 이미지·컴포넌트·직접 배치 영역 배율 (375 기준 ×2 = 750 원본 크기)
  button: span(4),     // PC 버튼 폭 (꽉 찬 모바일 버튼 → 4컬럼 443, 가운데)
  columnGap: GRID.gutter,
  maxColumns: 4,       // 반복 카드 최대 열 수 (2열=6컬럼, 3열=4컬럼, 4열=3컬럼)
};
const IMG_DENS = { '375': 1, '750': 2, 'PC': PC_RULES.imageScale };
const NUM_KEYS = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing', 'counterAxisSpacing',
  'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius',
  'strokeWeight', 'strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight',
  'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'paragraphSpacing', 'paragraphIndent', 'listSpacing'];
const TEXT_FIELDS = ['fontSize', 'lineHeight', 'letterSpacing', 'textStyleId', 'fontName'];
const RADIUS_KEYS = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];

function buildPairs(rows, s, t) {
  const a = rows.map(r => [r[IDX[s]], r[IDX[t]]]).sort((x, y) => x[0] - y[0]);
  const out = [];
  for (const p of a) if (!out.length || out[out.length - 1][0] !== p[0]) out.push(p);
  return out;
}
const half = v => Math.round(v * 2) / 2; // 0.5px 단위 — 왕복 변환해도 원래 값으로 돌아오게
// 토큰 값은 정확히 대응, 사이 값은 선형 보간, 범위 밖은 끝 비율 유지
function interp(pairs, v) {
  if (!v) return v;
  const sign = v < 0 ? -1 : 1; const x = Math.abs(v);
  const f = pairs[0], l = pairs[pairs.length - 1];
  let out;
  if (x <= f[0]) out = x * f[1] / f[0];
  else if (x >= l[0]) out = x * l[1] / l[0];
  else {
    for (let i = 1; i < pairs.length; i++) {
      const [a0, b0] = pairs[i - 1], [a1, b1] = pairs[i];
      if (x <= a1) { out = b0 + (x - a0) * (b1 - b0) / (a1 - a0); break; }
    }
  }
  return sign * half(out);
}

// PC 글자 크기: 표의 가장 가까운 칸 값으로 (표 사이 값·반 픽셀·스타일 가이드보다 작은 글자 방지, 최소 12)
function pcFontSize(from, fs) {
  const last = TYPO_ROWS[TYPO_ROWS.length - 1];
  if (fs > last[1 + IDX[from]] + 4) return Math.round(fs * last[1 + IDX.PC] / last[1 + IDX[from]]); // 표보다 큰 글자는 마지막 칸 비율로
  let best = TYPO_ROWS[0];
  for (const row of TYPO_ROWS) if (Math.abs(row[1 + IDX[from]] - fs) < Math.abs(best[1 + IDX[from]] - fs)) best = row;
  return Math.max(12, best[1 + IDX.PC]);
}

// 이미지 중심 영역(1097) 안 글자: PC 표 값 × 영역 배율(약 1.46)에 가장 가까운 PC 스타일 크기로 (최대 68) → 스타일 연결 유지
const PC_SIZES = [...new Set(TYPO_ROWS.map(r => r[1 + IDX.PC]))].sort((a, b) => a - b);
// 내용 폭 사진·도식 영역(경우 A) 안 글자: 그림과 같은 배율 → 가장 가까운 PC 스타일 크기 (도식 라벨이 그림 대비 작아지지 않게)
const snapPC = want => PC_SIZES.reduce((b, v) => Math.abs(v - want) < Math.abs(b - want) || (Math.abs(v - want) === Math.abs(b - want) && v > b) ? v : b, PC_SIZES[0]);
function pcAreaFontSize(from, fs, m) {
  const want = pcFontSize(from, fs) * m;
  return PC_SIZES.reduce((b, v) => Math.abs(v - want) < Math.abs(b - want) || (Math.abs(v - want) === Math.abs(b - want) && v > b) ? v : b, PC_SIZES[0]);
}
function detectSize(node) {
  if (!node || !('width' in node)) return null;
  const w = Math.round(node.width);
  if (Math.abs(w - 375) <= 2) return '375';
  if (Math.abs(w - 750) <= 2) return '750';
  if (w >= 1374) return 'PC';
  return null;
}

const near = (a, b, tol = 4) => Math.abs(a - b) <= tol;
const isAL = n => n && 'layoutMode' in n && n.layoutMode !== 'NONE';
// 버튼: 이름에 CTA/BTN/Button/버튼이 있고, 안에 또 다른 버튼이 없는 프레임 (BTN+txt 같은 묶음은 제외)
const BTN_RE = /(^|[^a-z])(cta|btn|button)([^a-z]|$)|버튼/i;
const isButton = n => ['FRAME', 'INSTANCE', 'COMPONENT'].includes(n.type) && BTN_RE.test(n.name)
  && !(n.type !== 'INSTANCE' && 'findOne' in n && n.findOne(d => d !== n && BTN_RE.test(d.name) && ['FRAME', 'INSTANCE', 'COMPONENT'].includes(d.type)));
const ICON_RE = /icon|glyph|arrow|아이콘|화살표/i;
const isIconAsset = (n, density = 1) => ['INSTANCE', 'FRAME', 'GROUP', 'BOOLEAN_OPERATION', 'VECTOR', 'COMPONENT'].includes(n.type)
  && ICON_RE.test(n.name) && n.width > 0 && n.height > 0
  && Math.max(n.width, n.height) <= 128 * density;
const GRAPHIC_RE = /img|image|photo|thumb|kv|banner|screenshot|graphic|illustration|이미지|사진|썸네일|배너|일러스트/i;
const iconInGraphic = n => {
  for (let a = n.parent; a; a = a.parent) if (a.type === 'FRAME' && a.layoutMode === 'NONE')
    return GRAPHIC_RE.test(a.name) || hasImage(a);
  return false;
};
// 글자 옆에 붙은 벡터 로고 (예: 버튼 안 구글플레이·애플 로고) — 가로 줄 안에서 글자와 나란히 있는 작은 벡터 프레임
// 옆 글자와 같은 배율(화면 밀도)로 줄여야 버튼 안 비율이 유지됨. 사진이 없으니 해상도 문제 없음
const isVectorLogo = (n, density = 1) => {
  if (n.type !== 'FRAME' || n.layoutMode !== 'NONE' || Math.max(n.width, n.height) > 128 * density) return false;
  const p = n.parent;
  if (!p || p.layoutMode !== 'HORIZONTAL' || !p.children.some(c => c !== n && c.type === 'TEXT')) return false;
  let vec = false, ok = true;
  const go = q => {
    if (!ok || q.visible === false) return;
    if (q.type === 'TEXT' || q.type === 'INSTANCE' || hasImage(q)) { ok = false; return; }
    if (['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON'].includes(q.type)) vec = true;
    if ('children' in q) q.children.forEach(go);
  };
  go(n);
  return ok && vec;
};
const hasImage = n => 'fills' in n && Array.isArray(n.fills) && n.fills.some(f => f.type === 'IMAGE' && f.visible !== false);
// PC 배경 이미지 섹션 찾기 — 화면 폭 섹션 중 배경이 이미지인 것 (자체 이미지 채우기, 또는 뒤에 깔린 꽉 찬 이미지 레이어)
// 가장 위의 하나는 KV로 보고 제외 (1376 전체). 이름 [배경]/[bg]는 무조건 포함, [넓게]/[KV]는 제외
const MARK_BG = /\[(배경|bg)\]/i, MARK_KV = /\[(넓게|wide|KV)\]/i;
function findBgSections(root, minW) {
  const imgOnly = c => hasImage(c) || ('findOne' in c && c.type !== 'TEXT' && !c.findOne(d => d.type === 'TEXT') && !!c.findOne(hasImage));
  const bgLayer = (n, c) => c.visible !== false && c.x <= 2 && c.x + c.width >= n.width - 2 && c.height >= n.height * 0.5 && imgOnly(c)
    && (n.layoutMode === 'NONE' || c.layoutPositioning === 'ABSOLUTE');
  const hasText = n => 'findOne' in n && !!n.findOne(d => d.type === 'TEXT' && d.visible !== false);
  const cands = [], forced = [];
  const go = n => {
    if (n.visible === false || n.type === 'INSTANCE' || !('children' in n)) return;
    if (n !== root && n.type === 'FRAME' && !MARK_KV.test(n.name)) {
      if (MARK_BG.test(n.name)) { forced.push(n); return; }
      if (n.width >= minW - 2 && hasText(n) && (hasImage(n) || n.children.some(c => bgLayer(n, c)))) { cands.push(n); return; }
    }
    if (MARK_KV.test(n.name)) return;
    n.children.forEach(go);
  };
  go(root);
  const y = n => n.absoluteTransform[1][2];
  cands.sort((a, b) => y(a) - y(b));
  const top = root.findOne(d => d !== root && d.type === 'FRAME' && MARK_KV.test(d.name) && /KV/i.test(d.name));
  return { kv: top || cands[0] || null, list: [...forced, ...(top ? cands : cands.slice(1))] };
}
const sameLH = (a, b) => a && b && a !== figma.mixed && b !== figma.mixed && a.unit === b.unit && (a.unit === 'AUTO' || a.value === b.value);
const sameLS = (a, b) => a && b && a !== figma.mixed && b !== figma.mixed && a.unit === b.unit && a.value === b.value;

// 자유 배치 프레임 크기만 바꾸기 — 안쪽 요소는 그대로
// resizeWithoutConstraints도 오토레이아웃 안에서는 자식 제약(SCALE 등)을 적용해 안쪽이 한 번 더 늘거나 줄어듦
// → 잠깐 자식 제약을 '왼쪽·위 고정'으로 바꾸고 크기를 바꾼 뒤 원래대로
function resizeFree(n, w, h) {
  const saved = [];
  for (const c of n.children) if ('constraints' in c) { try { saved.push([c, c.constraints]); c.constraints = { horizontal: 'MIN', vertical: 'MIN' }; } catch (e) { } }
  n.resizeWithoutConstraints(w, h);
  for (const [c, k] of saved) { try { c.constraints = k; } catch (e) { } }
}
function setW(n, w) {
  w = Math.max(0.5, half(w));
  if (Math.abs(n.width - w) < 0.01) return;
  const hv = n.layoutSizingVertical, tar = n.textAutoResize;
  const pa = n.primaryAxisSizingMode, ca = n.counterAxisSizingMode;
  const h = n.type === 'LINE' ? 0 : n.height;
  if (n.type === 'FRAME' && n.layoutMode === 'NONE') resizeFree(n, w, h);
  else n.resize(w, h);
  if (tar && n.textAutoResize !== tar) n.textAutoResize = tar;
  if (isAL(n)) {
    if (n.layoutMode === 'VERTICAL' && pa === 'AUTO') n.primaryAxisSizingMode = 'AUTO';
    if (n.layoutMode === 'HORIZONTAL' && ca === 'AUTO') n.counterAxisSizingMode = 'AUTO';
  }
  try { if ((hv === 'HUG' || hv === 'FILL') && n.layoutSizingVertical !== hv) n.layoutSizingVertical = hv; } catch (e) { }
}
function setH(n, h) {
  if (n.type === 'LINE' || n.height === 0) return; // 선(높이 0)은 건드리지 않음
  h = Math.max(0.5, half(h));
  if (Math.abs(n.height - h) < 0.01) return;
  const tar = n.textAutoResize, hz = n.layoutSizingHorizontal; // resize()가 폭 설정(HUG/FILL)을 FIXED로 바꾸므로 복원
  if (n.type === 'FRAME' && n.layoutMode === 'NONE') resizeFree(n, n.width, h);
  else n.resize(n.width, h);
  if (tar && n.textAutoResize !== tar) n.textAutoResize = tar;
  try { if ((hz === 'HUG' || hz === 'FILL') && n.layoutSizingHorizontal !== hz) n.layoutSizingHorizontal = hz; } catch (e) { }
}

// 노드·스타일에 연결된 모든 변수 컬렉션
async function collectCollections(nodes) {
  const ids = new Set(); const seen = new Set();
  const addVar = async id => {
    if (seen.has(id)) return; seen.add(id);
    const v = await figma.variables.getVariableByIdAsync(id);
    if (v) ids.add(v.variableCollectionId);
  };
  const styleSeen = new Set();
  for (const n of nodes) {
    if (n.explicitVariableModes) for (const k of Object.keys(n.explicitVariableModes)) ids.add(k);
    const bv = n.boundVariables;
    if (bv) for (const val of Object.values(bv)) {
      for (const a of (Array.isArray(val) ? val : [val])) if (a && a.id) await addVar(a.id);
    }
    if (n.type === 'TEXT' && n.characters.length) {
      for (const seg of n.getStyledTextSegments(['textStyleId'])) {
        const sid = seg.textStyleId;
        if (sid && !styleSeen.has(sid)) {
          styleSeen.add(sid);
          const st = await figma.getStyleByIdAsync(sid);
          if (st && st.boundVariables) for (const a of Object.values(st.boundVariables)) if (a && a.id) await addVar(a.id);
        }
      }
    }
  }
  for (const c of await figma.variables.getLocalVariableCollectionsAsync()) ids.add(c.id);
  const cols = [];
  for (const id of ids) { const c = await figma.variables.getVariableCollectionByIdAsync(id); if (c) cols.push(c); }
  return cols;
}

async function loadFonts(nodes) {
  const fonts = new Map();
  for (const n of nodes) if (n.type === 'TEXT' && !n.hasMissingFont && n.characters.length) {
    for (const f of n.getRangeAllFontNames(0, n.characters.length)) fonts.set(f.family + '|' + f.style, f);
  }
  for (const f of fonts.values()) { try { await figma.loadFontAsync(f); } catch (e) { } }
}

function unbindRange(n, a, b, field) {
  if (typeof n.getRangeBoundVariable !== 'function') return;
  try { if (n.getRangeBoundVariable(a, b, field)) n.setRangeBoundVariable(a, b, field, null); } catch (e) { }
}

// ===== 토큰 연결기: 변환된 값 → 같은 값의 Spacing/Radius 변수, Publishing 텍스트 스타일 =====
async function createLinker(clone, all, S, T, setMode, rep) {
  // 텍스트 스타일 후보: 프레임 안에서 쓰는 Publishing 스타일(파일 라이브러리) → 로컬 → 키로 가져오기
  const styles = new Map(), seenStyle = new Set(); // 같은 스타일은 한 번만 조회
  const addStyle = s => { if (s && /^Publishing\//.test(s.name)) { const k = s.name.split('/').pop(); if (!styles.has(k)) styles.set(k, s); } };
  for (const n of all) if (n.type === 'TEXT' && n.characters.length) {
    for (const seg of n.getStyledTextSegments(['textStyleId'])) if (seg.textStyleId && !seenStyle.has(seg.textStyleId)) { seenStyle.add(seg.textStyleId); addStyle(await figma.getStyleByIdAsync(seg.textStyleId)); }
  }
  for (const s of await figma.getLocalTextStylesAsync()) addStyle(s);
  const tried = new Set();
  const getStyle = async key => {
    if (styles.has(key)) return styles.get(key);
    if (tried.has(key)) return null; tried.add(key);
    const [grp, w] = key.split(/-(?=[a-z]+$)/);
    const k = STYLE_KEYS[grp] && STYLE_KEYS[grp][WEIGHTS[w]];
    if (!k) return null;
    try { const s = await figma.importStyleByKeyAsync(k); addStyle(s); return s; } catch (e) { return null; }
  };

  // 변수 후보: Spacing(모드별 값) / Radius(단일 모드)
  const spacing = [], radius = [];
  const colCache = new Map();
  const addVar = async v => {
    if (!v || v.resolvedType !== 'FLOAT') return;
    let c = colCache.get(v.variableCollectionId);
    if (!c) { c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId); colCache.set(v.variableCollectionId, c); }
    if (!c) return;
    if (/^Spacing/i.test(c.name)) {
      const ms = modeFor(c, S.label), mt = modeFor(c, T.label);
      if (!mt) return;
      const sv = ms ? v.valuesByMode[ms.modeId] : null, tv = v.valuesByMode[mt.modeId];
      if (typeof tv === 'number' && !spacing.some(x => x.v.id === v.id)) spacing.push({ v, c, src: typeof sv === 'number' ? sv : null, tgt: tv, special: /pad(Top|Btm)/i.test(v.name) });
    } else if (/^Radius/i.test(c.name) && c.modes.length === 1) {
      const val = v.valuesByMode[c.modes[0].modeId];
      if (typeof val === 'number' && val > 0 && !radius.some(x => x.v.id === v.id)) radius.push({ v, val });
    }
  };
  const cols = await collectCollections([clone, ...all]);
  for (const c of cols) if (/^(Spacing|Radius)/i.test(c.name)) for (const id of c.variableIds) await addVar(await figma.variables.getVariableByIdAsync(id));
  if (!spacing.length || !radius.length) for (const k of VAR_KEYS) { try { await addVar(await figma.variables.importVariableByKeyAsync(k)); } catch (e) { } }

  const bindVar = (n, k, item) => {
    if (item.c) setMode(item.c); // 연결한 변수 컬렉션도 대상 모드로
    try { n.setBoundVariable(k, item.v); rep.linked++; return true; } catch (e) { return false; }
  };
  return {
    // 여백·간격: (원래 값, 바뀐 값) 쌍이 모두 맞는 토큰 우선, 없으면 바뀐 값만 맞는 토큰
    spacing(n, k, was, now) {
      // 출발 값·도착 값이 둘 다 맞는 토큰에만 연결 (값만 같은 엉뚱한 토큰에 붙지 않게)
      const pick = spacing.find(x => !x.special && x.src === was && x.tgt === now) || spacing.find(x => x.src === was && x.tgt === now);
      return pick ? bindVar(n, k, pick) : false;
    },
    radius(n, k, now) {
      const pick = radius.find(x => x.val === now);
      return pick ? bindVar(n, k, pick) : false;
    },
    // 텍스트: 대상 크기·굵기에 맞는 Publishing 스타일 (Noto Sans KR 만)
    async text(n, a, b, size, fontName) {
      if (!fontName || fontName === figma.mixed || !/Noto Sans KR/i.test(fontName.family)) return false;
      const row = TYPO_ROWS.find(r => r[1 + IDX[T.label]] === size);
      const w = String(fontName.style).toLowerCase().replace(/\s/g, '');
      if (!row || !(w in WEIGHTS)) return false;
      const st = await getStyle(row[0] + '-' + w);
      if (!st) return false;
      try {
        await figma.loadFontAsync(st.fontName);
        await n.setRangeTextStyleIdAsync(a, b, st.id);
        if (st.boundVariables) for (const al of Object.values(st.boundVariables)) {
          if (!al || !al.id) continue;
          const v = await figma.variables.getVariableByIdAsync(al.id);
          if (v) { const c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId); if (c) setMode(c); }
        }
        if (n.getRangeFontSize(a, b) !== size) { await n.setRangeTextStyleIdAsync(a, b, ''); n.setRangeFontSize(a, b, size); return false; } // 값이 다르면 되돌림
        rep.linkedText++;
        return true;
      } catch (e) { return false; }
    },
  };
}

async function convertFrame(src, target, opts = {}) {
  const from = detectSize(src);
  if (!from) throw new Error(`폭이 375, 750, PC(1376)인 프레임만 바꿀 수 있어요. 지금 폭: ${Math.round(src.width)}px`);
  if (from === 'PC') throw new Error('PC 프레임은 결과물 전용이라 다른 사이즈로 바꾸지 않아요. 375나 750 원본을 선택해 주세요.');
  if (from === target) throw new Error('이미 ' + SIZES[target].label + ' 사이즈예요.');
  const LINK = opts.link !== false;
  const S = SIZES[from];
  const T = SIZES[target];
  const r = T.dens / S.dens;
  const rImg = IMG_DENS[target] / IMG_DENS[from]; // 이미지·그래픽 배율 (MO↔MO는 r과 같음)
  const spPairs = buildPairs(SPACING, from, target);
  const typoPairs = buildPairs(TYPO, from, target);
  const toPC = target === 'PC';
  const rep = { from, to: target, modes: [], spacing: 0, textValues: 0, sized: 0, rescaled: 0, linked: 0, linkedText: 0, unlinked: 0, errors: 0, check: [] };
  const FAILURE = '이 레이어는 변환하지 못해 원래 크기 그대로예요. 직접 맞춰 주세요';
  const flag = (n, reason, failed = false) => {
    if (/guide/i.test(n.name) && !failed) return;
    const item = { id: n.id, name: n.name, reason, failed };
    if (rep.check.length < 80) { rep.check.push(item); return; }
    // 긴 문서에서도 실패한 레이어는 확인 목록에 남긴다.
    if (failed) {
      const replace = rep.check.findIndex(c => !c.failed);
      if (replace !== -1) { rep.check.splice(replace, 1); rep.check.push(item); }
    }
    rep.more = (rep.more || 0) + 1;
  };
  const fail = (n, reason) => { rep.errors++; flag(n, reason, true); };

  // 1. 복제 (원본 보존)
  const clone = src.clone();
  if (opts.onClone) opts.onClone(clone);
  if (opts.parent) opts.parent.appendChild(clone);
  clone.x = opts.x != null ? opts.x : src.x + src.width + 120;
  clone.y = opts.y != null ? opts.y : src.y;
  clone.name = src.name.replace(/_(375|750|PC)$/, '') + '_' + T.label;

  // findAll은 복제 직후 슬롯(SLOT) 내부를 빠뜨리므로 직접 순회
  const all = [];
  const collect = n => { if ('children' in n) for (const c of n.children) { all.push(c); collect(c); } };
  collect(clone);
  await loadFonts(all);

  // 2. 변환 전 상태 기록

  // 구조 정리 (복사본에서만): 화면 폭 HUG 섹션 → FILL, PC는 한 줄로 쌓인 자유 배치 → 오토레이아웃
  for (const n of all) if (hugSection(n, S.root)) { try { n.layoutSizingHorizontal = 'FILL'; flag(n, '화면 폭 섹션이 내용 맞춤이라 채우기로 바꿨어요'); } catch (e) { } }
  if (target === 'PC') {
    const frees = all.filter(n => n.type === 'FRAME' && n.layoutMode === 'NONE').reverse(); // 안쪽부터
    for (const f of frees) {
      let inInst = false; for (let a = f.parent; a && a !== clone; a = a.parent) if (a.type === 'INSTANCE') { inInst = true; break; }
      if (!inInst && applyAutoLayout(f)) flag(f, '자유 배치를 오토레이아웃으로 바꿨어요. 요소 위치가 원본과 같은지 봐 주세요');
    }
  }

  const snap = new Map();
  for (const n of [clone, ...all]) {
    const p = n.parent;
    let pInner = null, pW = null;
    if (p && 'width' in p && n !== clone) { pW = p.width; pInner = isAL(p) ? p.width - p.paddingLeft - p.paddingRight : p.width; }
    const s = { w: n.width, h: n.height, x: n.x, y: n.y, pW, pIn: pInner, fillLike: pInner != null && n.width > 40 && near(n.width, pInner, Math.max(1, pInner * 0.01)) && !(isAL(p) && p !== clone && p.layoutSizingHorizontal === 'HUG'), num: {} }; // 부모가 내용 맞춤(HUG)이면 '부모 폭 채움'이 아님 (부모 폭을 자기가 정하는 순환)
    if (rImg !== r) for (let a = n.parent; a && a !== clone.parent; a = a.parent) if (a.type === 'FRAME' && a.layoutMode === 'NONE') { s.inPicture = true; break; }
    for (let a = n.parent; a && a !== clone.parent; a = a.parent) { if (a.type === 'INSTANCE') s.inInst = true; if (a.visible === false) s.hidden = true; }
    if (n.visible === false) s.hidden = true;
    for (const k of NUM_KEYS) if (k in n && typeof n[k] === 'number') s.num[k] = n[k];
    if (n.type === 'TEXT' && !n.hasMissingFont && n.characters.length) s.segs = n.getStyledTextSegments(TEXT_FIELDS);
    // 높이 고정 프레임이 사실상 내용에 딱 맞는 높이였는지 (HUG로 바꿔도 되는지) 미리 기록
    if (isAL(n) && !s.inInst && !s.hidden && n.layoutSizingVertical === 'FIXED' && !hasImage(n) && !n.children.some(c => c.layoutSizingVertical === 'FILL')) {
      s.hugH = hugOf(n); // 계산만 함 — HUG↔FIXED를 오가면 Figma가 가운데 정렬을 다시 계산하지 않아 내용이 위로 붙음
    }
    if (n.type === 'FRAME' && n.layoutMode === 'NONE' && 'children' in n && n.children.length) {
      const bottom = Math.max(...n.children.filter(c => c.visible !== false).map(c => c.y + c.height), 0);
      s.bottomGap = Math.max(0, s.h - bottom);
      s.bottomSrc = bottom; // 원본에서 가장 아래 요소 끝 (원래부터 프레임 밖으로 나간 장식 포함)
    }
    snap.set(n.id, s);
  }

  // 아이콘은 PC의 넓어진 오토레이아웃 칼럼을 채우는 요소가 아니다.
  if (target === 'PC') for (const n of all) if (isIconAsset(n, S.dens) && isAL(n.parent) && n.layoutPositioning !== 'ABSOLUTE') {
    try {
      if (n.layoutSizingHorizontal === 'FILL') n.layoutSizingHorizontal = 'FIXED';
      if (n.layoutSizingVertical === 'FILL') n.layoutSizingVertical = 'FIXED';
    } catch (e) { fail(n, '아이콘 크기 고정을 적용하지 못했어요'); }
  }

  // PC 섹션 폭 판단 (원본 크기 기준, 변환 전에 계산)
  const modeOf = new Map(); // node id → 'wide' | 'narrow'
  if (target === 'PC') {
    const MARK_W = /\[(넓게|wide)\]/i;
    const why = new Map();
    const assign = (n, inherited) => {
      let m = inherited;
      if (MARK_W.test(n.name)) { m = 'wide'; why.set(n.id, '이름 [넓게]'); }
      if (m) modeOf.set(n.id, m);
      if ('children' in n && n.type !== 'INSTANCE') for (const c of n.children) assign(c, m);
    };
    assign(clone, null);
    for (const [id, reason] of why) { const n = all.find(x => x.id === id); if (n && modeOf.get(id) === 'wide') flag(n, `넓게 적용 (${reason})`); }
  }
  const bgSecs = new Set();
  // PC 이미지 중심 영역: KV 아래 화면 폭 자유 배치 영역(사진·제품 이미지 구성) → 영역 전체를 1097 기준으로
  //   이미지·위치·간격은 1097/원래 폭 배율로 키우고, 글자는 PC 글자 크기표대로 (KV만 1376)
  const areas = new Set();
  if (target === 'PC') {
    const f = findBgSections(clone, S.root);
    let kvId = f.kv && f.kv.id;
    if (!kvId) { // 배경 이미지 판정이 안 되면: 맨 위의 화면 폭 자유 배치 영역(글 있음)을 KV로
      const top = all.filter(n => n.type === 'FRAME' && n.layoutMode === 'NONE' && !snap.get(n.id).inPicture && near(snap.get(n.id).w, S.root, 2) && n.findOne(d => d.type === 'TEXT'))
        .sort((a, b) => a.absoluteTransform[1][2] - b.absoluteTransform[1][2])[0];
      kvId = top && top.id;
    }
    // KV: 그림처럼 750 모드로 고정하지 않고 PC 모드 사용 — 글자·간격은 PC 기준으로 작아지고, 글 묶음 위치는 위/아래 가장자리 기준으로 다시 잡음
    const kvNode = kvId && all.find(n => n.id === kvId);
    if (kvNode) {
      const ks = snap.get(kvId); ks.kv = true; ks.kvRoot = true;
      for (const d of kvNode.findAll(() => true)) { const ds = snap.get(d.id); if (ds) ds.kv = true; }
      for (const c of kvNode.children) { const cs = snap.get(c.id); if (cs && (c.type === 'TEXT' || (isAL(c) && c.findOne(d => d.type === 'TEXT')))) cs.kvFlow = true; }
    }
    for (const n of all) {
      const s = snap.get(n.id);
      if (n.type !== 'FRAME' || n.layoutMode !== 'NONE' || !isAL(n.parent) || s.inInst || s.inPicture || n.id === kvId || modeOf.get(n.id) === 'wide') continue;
      const bleed = near(s.w, S.root, 2) || near(s.pW, S.root, 2) && near(s.w, s.pW, 2);
      // 경우 A: 내용 폭 사진 영역(화면 폭 아님, 칼럼의 80% 이상을 채우는 사진 묶음) → 960 기준 (옆 묶음과 폭 맞춤)
      const colPic = !bleed && s.fillLike && s.w >= S.content * 0.8 && (hasImage(n) || !!n.findOne(hasImage));
      if (!bleed && !colPic) continue;
      const k = (bleed ? PC_RULES.bg : PC_RULES.narrow) / s.w;
      s.selfK = k; areas.add(n.id); if (!bleed) s.picArea = true; n.clipsContent = true; // 750 화면 밖으로 나가던 장식(워터마크 등)은 영역 안에서 잘리게
      for (const d of n.findAll(() => true)) { const ds = snap.get(d.id); if (ds) { ds.areaK = k; if (!bleed) ds.picArea = true; } }
      flag(n, `이미지 중심 영역 — ${bleed ? PC_RULES.bg : PC_RULES.narrow} 기준으로 키웠어요 (글자는 PC 크기표 × 영역 배율)`);
    }
    for (const n of f.list) if (modeOf.get(n.id) !== 'wide' && !areas.has(n.id)) { bgSecs.add(n.id); flag(n, `배경 이미지 섹션 — 배경만 ${PC_RULES.bg}로 (안의 내용은 ${PC_RULES.narrow})`); }
  }
  const gOf = s => s.areaK || rImg; // 이미지 중심 영역 안은 그 영역 배율
  const isWide = n => modeOf.get(n.id) === 'wide';
  const colW = n => isWide(n) ? PC_RULES.wide : PC_RULES.narrow;   // 내용 칼럼 폭
  const textW = n => isWide(n) ? PC_RULES.wideText : PC_RULES.narrow; // 글 최대 폭

  // 직접 배치 프레임이 FILL이면 부모 폭 변경 시 자식 constraints가 같이 늘어나 이중 변환됨 → 잠시 FIXED
  const freeFill = [];
  for (const n of all) if (n.type === 'FRAME' && n.layoutMode === 'NONE' && isAL(n.parent)) {
    const h = n.layoutSizingHorizontal, v = n.layoutSizingVertical;
    if (h === 'FILL' || v === 'FILL') { freeFill.push({ n, h, v }); if (h === 'FILL') n.layoutSizingHorizontal = 'FIXED'; if (v === 'FILL') n.layoutSizingVertical = 'FIXED'; }
  }

  // 3. 변수 모드 전환 — 원래·대상 사이즈 모드가 모두 있는 컬렉션 전부 (Publishing, Spacing, Page 등)
  const switched = new Map(), pinned = new Set();
  const setMode = c => {
    if (switched.has(c.id)) return;
    const mt = modeFor(c, target);
    if (!mt) return;
    try { clone.setExplicitVariableModeForCollection(c, mt.modeId); } catch (e) { return; }
    for (const n of all) if (n.explicitVariableModes && n.explicitVariableModes[c.id] && !pinned.has(n.id)) { try { n.setExplicitVariableModeForCollection(c, mt.modeId); } catch (e) { } }
    switched.set(c.id, c);
    rep.modes.push(c.name + ' → ' + mt.name);
  };
  for (const c of await collectCollections([clone, ...all])) if (modeFor(c, from) && modeFor(c, target)) setMode(c);
  await loadFonts(all); // 모드 전환으로 폰트가 바뀌었을 수 있음

  const linker = LINK ? await createLinker(clone, all, S, T, setMode, rep) : null;

  // 그림처럼 다루는 직접 배치 영역(PC 변환)은 그림 배율에 맞는 모드로 고정 → 내부 토큰·스타일 연결 유지
  const picSize = rImg !== r ? (PC_RULES.imageScale === 2 ? '750' : '375') : null;
  if (picSize) for (const n of all) {
    const s = snap.get(n.id);
    if (s.selfK || s.areaK || s.kv) continue; // 이미지 중심 영역은 글자를 PC 크기표(PC 스타일)로 바꾸므로 750 모드로 고정하지 않음 — 고정하면 PC 스타일이 750 값으로 풀려 스타일이 떨어짐
    const root = n.type === 'FRAME' && n.layoutMode === 'NONE' && !s.inPicture;
    const inner = s.inPicture && n.explicitVariableModes && Object.keys(n.explicitVariableModes).length;
    if (!root && !inner) continue;
    pinned.add(n.id);
    for (const c of switched.values()) { const m = modeFor(c, picSize); if (m) try { n.setExplicitVariableModeForCollection(c, m.modeId); } catch (e) { } }
  }
  if (picSize) await loadFonts(all);

  // 통째로 배율 조정할 노드는 원래 모드로 고정 → 토큰 값이 두 번 줄어드는 것 방지
  const pinSource = n => {
    if (!('setExplicitVariableModeForCollection' in n)) return;
    for (const c of switched.values()) {
      const ms = modeFor(c, from);
      if (ms) try { n.setExplicitVariableModeForCollection(c, ms.modeId); } catch (e) { }
    }
  };
  const rescaleNode = (n, f = r) => { if (f !== 1) { pinSource(n); n.rescale(f); rep.rescaled++; } };
  const positions = []; // 직접 배치 요소 위치 — 하위 레이아웃이 끝난 뒤 다시 고정

  // 모드 전환 후에도 그대로인 값만 직접 변환, 그 뒤 같은 값 토큰에 다시 연결
  const conv = (n, s, k, fn, kind) => {
    const was = s.num[k];
    if (was == null || was === 0 || !(k in n)) return false;
    if (n[k] !== was && (!s.inPicture || s.kv)) return false; // 토큰이 이미 처리
    const v = fn(was);
    if (n[k] === v) return false; // 이미 목표 값이면 토큰 연결 그대로 유지
    const wasBound = !!(n.boundVariables && n.boundVariables[k]);
    try { if (wasBound) n.setBoundVariable(k, null); } catch (e) { }
    n[k] = v;
    if (linker && (!s.inPicture || s.kv)) {
      const ok = kind === 'spacing' ? linker.spacing(n, k, was, v) : kind === 'radius' ? linker.radius(n, k, v) : false;
      if (!ok && wasBound) rep.unlinked++;
    } else if (wasBound) rep.unlinked++;
    return v !== was;
  };

  const convertText = async (n, s) => {
    if (n.hasMissingFont) { fail(n, '이 글자의 폰트가 없어 크기를 바꾸지 못했어요. 폰트를 설치한 뒤 다시 변환해 주세요'); return; }
    if (!s.segs) return;
    let changed = false, detached = false;
    for (const seg of s.segs) {
      const a = seg.start, b = seg.end;
      const curFS = n.getRangeFontSize(a, b);
      if (s.inPicture && !s.areaK && !s.kv) { // 그림 안 텍스트: 그림 배율로 (이미지 중심 영역 안 글자는 PC 크기표)
        const nfs = half(seg.fontSize * rImg);
        if (curFS === nfs) continue; // 고정한 모드로 이미 맞음 → 스타일 유지
        unbindRange(n, a, b, 'fontSize'); n.setRangeFontSize(a, b, nfs); changed = true;
        if (seg.lineHeight.unit === 'PIXELS') { unbindRange(n, a, b, 'lineHeight'); n.setRangeLineHeight(a, b, { unit: 'PIXELS', value: Math.round(seg.lineHeight.value * rImg * 10) / 10 }); }
        if (seg.letterSpacing.unit === 'PIXELS' && seg.letterSpacing.value) { unbindRange(n, a, b, 'letterSpacing'); n.setRangeLetterSpacing(a, b, { unit: 'PIXELS', value: Math.round(seg.letterSpacing.value * rImg * 100) / 100 }); }
        continue;
      }
      if (curFS !== seg.fontSize && !s.areaK) continue; // 토큰(스타일·변수)이 이미 처리 → 행간·자간도 손대지 않음 (이미지 중심 영역 글자는 영역 크기로 다시 계산)
      const nfs = target === 'PC' ? (s.areaK ? (s.picArea ? snapPC(seg.fontSize * s.areaK) : pcAreaFontSize(from, seg.fontSize, s.areaK / rImg)) : pcFontSize(from, seg.fontSize)) : interp(typoPairs, seg.fontSize);
      if (!nfs || nfs === seg.fontSize) continue;
      // 1순위: 같은 크기의 Publishing 스타일로 연결
      if (linker && await linker.text(n, a, b, nfs, seg.fontName)) {
        changed = true;
        const os = seg.textStyleId && await figma.getStyleByIdAsync(seg.textStyleId);
        if (os && !/^Publishing\//.test(os.name)) flag(n, '글자 스타일이 바뀌었어요 — 줄 간격 확인');
        continue;
      }
      // 2순위: 값으로 변환
      unbindRange(n, a, b, 'fontSize');
      n.setRangeFontSize(a, b, nfs);
      changed = true;
      if (seg.textStyleId) detached = true;
      const k = nfs / seg.fontSize;
      const lh = n.getRangeLineHeight(a, b);
      if (seg.lineHeight.unit === 'PIXELS' && sameLH(lh, seg.lineHeight)) {
        unbindRange(n, a, b, 'lineHeight');
        n.setRangeLineHeight(a, b, { unit: 'PIXELS', value: Math.round(seg.lineHeight.value * k * 10) / 10 });
      }
      const ls = n.getRangeLetterSpacing(a, b);
      if (seg.letterSpacing.unit === 'PIXELS' && seg.letterSpacing.value && sameLS(ls, seg.letterSpacing)) {
        unbindRange(n, a, b, 'letterSpacing');
        n.setRangeLetterSpacing(a, b, { unit: 'PIXELS', value: Math.round(seg.letterSpacing.value * k * 100) / 100 });
      }
    }
    if (changed) rep.textValues++;
    if (detached) flag(n, '맞는 글자 스타일이 없어 크기만 바꿨어요');
  };

  const convertProps = async (n, s) => {
    // 화면 좌우 여백(MO 15/30 → 다른 MO 여백 또는 PC 0)은 레이아웃 규격 → 화면 폭 프레임에서 직접 변환
    if (isAL(n) && near(s.w, S.root, 2) && !s.inPicture) {
      for (const k of ['paddingLeft', 'paddingRight']) if (near(s.num[k] || 0, S.margin, 1)) {
        try { if (n.boundVariables && n.boundVariables[k]) n.setBoundVariable(k, null); } catch (e) { }
        n[k] = T.margin; s.num[k] = null;
        if (linker && T.margin) linker.spacing(n, k, S.margin, T.margin);
      }
    }
    const sp = s.inPicture && !s.kv ? (v => half(v * gOf(s))) : (v => interp(spPairs, v)); // KV 안 글 묶음 간격은 PC 표대로
    const rr = s.inPicture ? gOf(s) : r;
    if (isAL(n)) {
      for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing'])
        if (conv(n, s, k, sp, 'spacing')) rep.spacing++;
      if (n.layoutWrap === 'WRAP') conv(n, s, 'counterAxisSpacing', sp, 'spacing');
    }
    if (rr !== 1) {
      for (const k of RADIUS_KEYS) conv(n, s, k, v => v >= 500 ? v : half(v * rr), 'radius');
      const hasStroke = 'strokes' in n && Array.isArray(n.strokes) && n.strokes.length;
      if (hasStroke) {
        if (typeof n.strokeWeight === 'number') conv(n, s, 'strokeWeight', v => Math.max(1, Math.round(v * rr)));
        else for (const k of ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight']) conv(n, s, k, v => Math.max(1, Math.round(v * rr)));
      }
      for (const k of ['minWidth', 'maxWidth', 'minHeight', 'maxHeight']) conv(n, s, k, v => half(v * rr));
      if ('effects' in n && Array.isArray(n.effects) && n.effects.length && !n.effectStyleId) {
        n.effects = n.effects.map(e => {
          const o = Object.assign({}, e); delete o.boundVariables;
          if (o.radius != null) o.radius = o.radius * rr;
          if (o.spread != null) o.spread = o.spread * rr;
          if (o.offset) o.offset = { x: o.offset.x * rr, y: o.offset.y * rr };
          return o;
        });
      }
    }
    if (n.type === 'TEXT') {
      for (const k of ['paragraphSpacing', 'paragraphIndent', 'listSpacing']) conv(n, s, k, sp);
      await convertText(n, s);
      if ((n.textAutoResize === 'NONE' || n.textAutoResize === 'TRUNCATE') && rr !== 1) setH(n, s.h * rr);
    }
  };

  // 4. 루트 폭
  setW(clone, T.root);
  if (target !== 'PC' && clone.type === 'FRAME' && (!isAL(clone) || clone.layoutSizingVertical === 'FIXED')) setH(clone, snap.get(clone.id).h * r); // 고정 높이 루트도 배율 (모바일 간)
  await convertProps(clone, snap.get(clone.id));

  // 5. 하위 노드 (부모 먼저)
  // 위치는 나중에(폭 정리가 끝난 뒤) 최종 부모 폭으로 다시 계산할 수 있게 계산식으로 기억
  const place = (n, x, y, recalc) => { n.x = x; n.y = y; positions.push([n, recalc || (() => [x, y])]); };
  // PC: 이 요소 근처 글자가 표에서 몇 배로 바뀌는지 (아이콘·글자 담은 상자를 글자와 같은 비율로) — 없으면 null
  const textRatioNear = n => {
    const ratioOf = t => { const ts = snap.get(t.id); const rs = ((ts && ts.segs) || []).filter(g => typeof g.fontSize === 'number' && g.fontSize > 0).map(g => pcFontSize(from, g.fontSize) / g.fontSize); return rs.length ? Math.max(...rs) : null; }; // 크기가 섞인 글(POINT 05)은 가장 크게 남는 비율
    if (n.type === 'TEXT') return ratioOf(n);
    if ('findOne' in n) { const t = n.findOne(d => d.type === 'TEXT' && d.visible !== false); if (t) return ratioOf(t); }
    for (let a = n.parent, d = 0; a && a !== clone && d < 2; a = a.parent, d++) {
      const t = a.findOne(x => x.type === 'TEXT' && x.visible !== false && x !== n);
      if (t) return ratioOf(t);
    }
    return null;
  };
  // PC: 글자·사진 없는 작은 그래픽 (아이콘·점·화살표·+ 등)
  const GRAPHIC_TYPES = ['VECTOR', 'BOOLEAN_OPERATION', 'GROUP', 'ELLIPSE', 'RECTANGLE', 'STAR', 'POLYGON', 'FRAME', 'INSTANCE', 'LINE'];
  const smallGraphic = (n, s) => target === 'PC' && !s.inPicture && GRAPHIC_TYPES.includes(n.type) && n.type !== 'LINE'
    && Math.max(s.w, s.h) <= 80 * S.dens && !hasImage(n) && !('findOne' in n && n.findOne(d => d.type === 'TEXT' || hasImage(d)))
    && !(n.type === 'FRAME' && n.layoutMode === 'NONE' && s.fillLike) && !isButton(n);
  // FILL로 바꾼 직후엔 Figma가 폭을 바로 다시 계산하지 않음 → 예상 폭을 기억해 두고 자식 계산에 사용
  const expW = new Map();
  const innerW = p => (expW.has(p.id) ? expW.get(p.id) : p.width) - (isAL(p) ? p.paddingLeft + p.paddingRight : 0);
  // 부모(내용 맞춤 HUG면 그 위로)의 안쪽 폭이 원본 대비 몇 배 커졌는지 — 1 이하면 null
  const growOf = (p, cw) => {
    let q = p; while (q && q !== clone && isAL(q) && q.layoutSizingHorizontal === 'HUG') q = q.parent;
    const qs = q && snap.get(q.id); if (!qs || !isAL(q)) return null;
    const was = qs.w - (qs.num.paddingLeft || 0) - (qs.num.paddingRight || 0);
    const g = was > 0 ? Math.min(innerW(q), cw) / Math.min(was, S.content) : 0; // 화면 폭 띠는 내용 칼럼(690→960) 기준
    return g > 1 ? g : null;
  };
  const dotRow = f => f.children.length > 0 && f.children.every(c => ['ELLIPSE', 'RECTANGLE', 'VECTOR', 'STAR', 'POLYGON'].includes(c.type) && !hasImage(c) && c.height <= 12 * S.dens)
    && f.parent.children.some(c => c.type === 'TEXT');
  // 원본에서 자식들이 줄 안쪽 폭을 거의 다(90% 이상) 채우던 가로 줄인지
  const rowFull = p => {
    const ps = snap.get(p.id); if (!ps) return false;
    const kids = p.children.filter(c => c.visible !== false && c.layoutPositioning !== 'ABSOLUTE').map(c => snap.get(c.id)).filter(Boolean);
    const inner = ps.w - (ps.num.paddingLeft || 0) - (ps.num.paddingRight || 0);
    const used = kids.reduce((t, k) => t + k.w, 0) + (p.primaryAxisAlignItems === 'SPACE_BETWEEN' ? 0 : (ps.num.itemSpacing || 0) * (kids.length - 1));
    return kids.length >= 2 && inner > 0 && used >= inner * 0.9;
  };
  const processNode = async n => {
    const s = snap.get(n.id); if (!s) return false;
    const p = n.parent;
    const inAL = isAL(p) && n.layoutPositioning !== 'ABSOLUTE';
    const mapPos = f => { const calc = () => [half(s.x * f + (p.width - s.pW * f) / 2), half(s.y * f)]; const [x, y] = calc(); place(n, x, y, calc); };
    // 부모 폭을 꽉 채우던 레이어인지 (부모가 PC 섹션 폭으로 넓어졌으면 배경 레이어만 해당 — 내용 묶음은 그림 크기 그대로 가운데)
    const isFullW = () => {
      const widened = p.width > s.pW * gOf(s) + 1;
      const bgLike = ['RECTANGLE', 'ELLIPSE', 'VECTOR'].includes(n.type) || /bg|background|배경/i.test(n.name) || !('children' in n) || n.children.length === 0;
      return near(s.w, s.pW) && near(s.x, 0) && (!widened || bgLike);
    };

    // PC 작은 그래픽: 이름·종류와 상관없이 옆 글자와 같은 비율로 (글자 없으면: 옆에 사진이 있으면 사진 배율, 아니면 화면 밀도)
    if (smallGraphic(n, s) && !s.inInst && (inAL || !isFullW())) { // 컴포넌트 안 레이어·배경 레이어는 제외
      let f = textRatioNear(n);
      if (f == null) f = p && 'children' in p && p.children.some(c => c !== n && hasImage(c)) ? rImg : r;
      const minSide = Math.min(s.w, s.h);
      if (minSide >= 6 && minSide * f < 4) f = 4 / minSide; // 점·선 같은 아주 작은 그래픽도 보이게
      pinned.add(n.id);
      rescaleNode(n, f);
      if (!inAL && s.pW != null) mapPos(f);
      return false;
    }
    // 크기 조정(K)된 컴포넌트 인스턴스 → 인스턴스 배율만 조정
    const scaledInst = n.type === 'INSTANCE' && typeof n.scaleFactor === 'number' && Math.abs(n.scaleFactor - 1) > 0.01;
    const iconAsset = target === 'PC' && (isIconAsset(n, S.dens) || (!s.inPicture && isVectorLogo(n, S.dens)));
    if (iconAsset || (n.type === 'INSTANCE' && (scaledInst || !toPC))) { // PC 아이콘과 크기 조정된 인스턴스는 통째로 처리
      pinned.add(n.id);
      // 사진·그림 안의 아이콘은 그림 비율을, UI 아이콘은 화면 밀도를 따른다.
      // Photoshop 750의 UI 아이콘 48px은 PC에서 24px, 375의 24px은 PC에서 24px.
      const f = iconAsset && !iconInGraphic(n) && !s.areaK ? r : gOf(s);
      rescaleNode(n, f);
      if (!inAL && s.pW != null) mapPos(iconAsset ? gOf(s) : f);
      return false;
    }
    // 그룹·불리언·벡터 묶음은 비율 유지한 채 통째로
    // 경우 F: 카드를 덮는 절대 위치 장식(테두리 띠 등) → 카드 최종 크기에 맞춰 늘림
    const ps = p && snap.get(p.id);
    if (target === 'PC' && !inAL && isAL(p) && ps && ['GROUP', 'VECTOR', 'BOOLEAN_OPERATION'].includes(n.type) && !s.inInst && s.w >= ps.w * 0.8 && s.h >= ps.h * 0.8) {
      const calc = () => {
        const w = Math.max(1, p.width * s.w / ps.w), h = Math.max(1, p.height * s.h / ps.h);
        if (Math.abs(n.width - w) > 0.5 || Math.abs(n.height - h) > 0.5) n.resize(w, h);
        return [half(s.x / ps.w * p.width), half(s.y / ps.h * p.height)];
      };
      const [x, y] = calc(); place(n, x, y, calc); return false;
    }
    if (n.type === 'GROUP' || n.type === 'BOOLEAN_OPERATION') {
      const f = s.inPicture || Math.max(s.w, s.h) > 80 * S.dens ? gOf(s) : r;
      rescaleNode(n, f);
      if (!inAL && s.pW != null && p.type !== 'GROUP' && p.type !== 'BOOLEAN_OPERATION') mapPos(f);
      if (toPC && !inAL && !s.inPicture) flag(n, '자유 배치 요소라 위치를 비율로만 옮겼어요. 위치를 봐 주세요');
      if (target === 'PC' && inAL && !s.inPicture && s.w >= S.content * 0.8) flag(n, '그룹이라 콘텐츠 폭(960)으로 못 넓혔어요 — 프레임으로 바꾸면 자동으로 맞춰져요');
      return false;
    }

    // 오토레이아웃 밖에서 통째로 배율 조정할 레이어는 rescale이 모서리·선·그림자까지 키우므로 convertProps를 건너뜀 (이중 배율 방지)
    // PC: 글 위에 깔린 형광펜·밑줄 같은 장식 (오토레이아웃 안 절대 위치) → 그 글과 같은 비율로, 글 기준 위치로
    if (target === 'PC' && !inAL && isAL(p) && n.type !== 'TEXT' && !s.inPicture && !s.inInst) {
      const t = p.children.find(c => {
        if (c === n || c.type !== 'TEXT' || c.visible === false) return false;
        const ts = snap.get(c.id);
        return ts && s.x >= ts.x - 2 && s.x + s.w <= ts.x + ts.w + 2 && s.y < ts.y + ts.h && s.y + s.h > ts.y;
      });
      const f = t && textRatioNear(t);
      if (f) {
        const ts = snap.get(t.id);
        pinned.add(n.id); rescaleNode(n, f);
        const calc = () => {
          const al = t.textAlignHorizontal;
          const x = al === 'CENTER' ? t.x + t.width / 2 + (s.x + s.w / 2 - ts.x - ts.w / 2) * f - n.width / 2
            : al === 'RIGHT' ? t.x + t.width - (ts.x + ts.w - s.x) * f : t.x + (s.x - ts.x) * f;
          return [half(x), half(t.y + (s.y - ts.y) * f)];
        };
        const [x, y] = calc(); place(n, x, y, calc);
        return false;
      }
    }
    // PC: 글자 위 강조 점 줄 (작은 도형만 든 자유 배치 프레임, 옆에 글) → 점을 글자 비율로, 가운데 기준 위치
    if (target === 'PC' && !inAL && p.type === 'FRAME' && p.layoutMode === 'NONE' && isAL(p.parent) && dotRow(p)) {
      const sib = p.parent.children, t = sib.slice(sib.indexOf(p) + 1).find(c => c.type === 'TEXT') || sib.find(c => c.type === 'TEXT');
      const f = textRatioNear(t) || r; rescaleNode(n, f);
      const ts = snap.get(t.id), ps = snap.get(p.id);
      const calc = () => { // 글 상자 정렬 기준점(가운데·왼쪽·오른쪽)에서의 거리 × 글자 비율
        const al = t.textAlignHorizontal, k = al === 'CENTER' ? 0.5 : al === 'RIGHT' ? 1 : 0; // 글 정렬 기준점
        const c0 = ts.x - ps.x + ts.w * k, c1 = t.x - p.x + t.width * k;
        return [half(c1 + (s.x + s.w / 2 - c0) * f - n.width / 2), half(s.y * f)];
      };
      const [x, y] = calc(); place(n, x, y, calc); return false;
    }
    if (!inAL && p && s.pW != null && n.type !== 'TEXT' && !isAL(n)) {
      let inInstAnc = false;
      for (let a = p; a && a !== clone; a = a.parent) if (a.type === 'INSTANCE') { inInstAnc = true; break; }
      if (!inInstAnc && !isFullW()) { rescaleNode(n, gOf(s)); mapPos(gOf(s)); return false; }
    }

    // 오토레이아웃 안의 작은 그림 프레임(로고·아이콘 등, 글자 없음)은 통째로 배율 조정
    // 프레임만 줄이면 Figma가 안쪽 벡터의 높이를 한 번 더 줄여서 찌그러짐 (resizeWithoutConstraints도 오토레이아웃 안에선 제약을 적용)
    if (inAL && gOf(s) !== 1 && n.type === 'FRAME' && n.layoutMode === 'NONE' && !s.fillLike && !n.findOne(d => d.type === 'TEXT')) {
      rescaleNode(n, gOf(s));
      return false;
    }

    await convertProps(n, s);

    if (inAL) {
      const h = n.layoutSizingHorizontal, v = n.layoutSizingVertical;
      const k = s.inPicture ? gOf(s) : r;
      // PC: 글자를 담은 고정 상자는 글자 비율보다 작게 줄이지 않음 (라벨 알약에서 글자가 삐져나오는 문제)
      const tk = target === 'PC' && !s.inPicture && n.type !== 'TEXT' ? textRatioNear(n) : null;
      const kBox = tk && 'findAll' in n && n.findOne(d => d.type === 'TEXT') ? Math.max(k, tk, ...(s.w < S.content * 0.55 ? n.findAll(d => d.type === 'TEXT' && d.visible !== false).map(d => textRatioNear(d) || 0) : [])) : k; // 글 상자: 안의 글 중 가장 많이 커지는 비율로 (POINT 동그라미 안 숫자 등)
      const btn = !s.inPicture && isButton(n);
      if (btn && target === 'PC') {
        // PC 버튼: 화면 폭만큼 늘리지 않고 정해진 폭으로 (넓은 모바일 버튼만), 가운데
        const wide = h === 'FILL' || s.fillLike || (s.pIn && s.w >= s.pIn * 0.8);
        const colK = PC_RULES.btnBase / S.content; // 모바일 칼럼 대비 버튼 비율 그대로
        if (wide) {
          if (h === 'FILL') n.layoutSizingHorizontal = 'FIXED';
          setW(n, PC_RULES.button);
          if (p.layoutMode === 'VERTICAL' && p.counterAxisAlignItems !== 'CENTER') p.counterAxisAlignItems = 'CENTER';
          flag(n, '꽉 찬 버튼을 PC 버튼 폭(443)으로 줄였어요');
        } else if (h === 'FIXED') setW(n, Math.min(s.w * colK, textW(n))); // 칼럼 대비 비율 유지
        if (v === 'FIXED' && k !== 1) setH(n, s.h * k);
        return true;
      }
      // 경우 D: 750에서 부모 폭을 꽉 채우던 내용 맞춤(HUG) 가로 줄(버튼 2개 등) → PC에서 가운데
      if (target === 'PC' && h === 'HUG' && n.layoutMode === 'HORIZONTAL' && s.fillLike && !s.inPicture && p.layoutMode === 'VERTICAL' && p.counterAxisAlignItems !== 'CENTER') { p.counterAxisAlignItems = 'CENTER'; flag(p, '꽉 차던 줄을 가운데로 맞췄어요 — 확인'); }
      if (h === 'FIXED') {
        const freeFrame = n.type === 'FRAME' && n.layoutMode === 'NONE';
        if (freeFrame && s.fillLike) { // 직접 배치 영역(KV 등)은 부모 폭으로 — PC는 배경만 넓히고 안의 그림·글은 비율 그대로 가운데
          // 모바일 간: 부모도 같은 비율로 줄어드므로 원래 폭 × 배율 (부모 폭을 읽으면 FILL 직후 옛 값이 나올 수 있음)
          const bleed = near(s.w, S.root, 2) || near(s.pW, S.root, 2) && near(s.w, s.pW, 2); // 화면 끝까지 닿는 KV
          if (target !== 'PC') setW(n, s.w * rImg);
          else if (s.selfK) { // 이미지 중심 영역: 1097, 가운데
            setW(n, s.w * s.selfK);
            if (p.layoutMode === 'VERTICAL' && p.counterAxisAlignItems !== 'CENTER') p.counterAxisAlignItems = 'CENTER';
          }
          else if (bleed) { setW(n, innerW(p)); flag(n, 'KV 배경만 1376으로 넓혔어요. 안의 구성은 750 그대로예요'); }
          else setW(n, Math.min(s.w * rImg, colW(n))); // 내용 칸 안의 그림 영역: 그림 크기 그대로 (넓히지 않음)
        }
        else if (freeFrame) { if (gOf(s) !== 1) setW(n, s.w * gOf(s)); } // 로고·썸네일 같은 그림 프레임: 높이와 같은 그림 배율로 (가로세로 비율 유지)
        else if (s.fillLike && !btn && p.layoutMode === 'VERTICAL' && p.layoutSizingHorizontal !== 'HUG') { n.layoutSizingHorizontal = 'FILL'; expW.set(n.id, innerW(p)); } // 버튼은 FILL로 바꾸지 않음
        else if (near(s.w, S.content) && s.pW && near(s.pW, S.root)) {
          if (target === 'PC') { // 모바일 내용 칼럼 → PC 내용 칼럼 폭으로, 1376 안 가운데
            setW(n, colW(n));
            if (p.layoutMode === 'VERTICAL' && p.counterAxisAlignItems !== 'CENTER') { p.counterAxisAlignItems = 'CENTER'; flag(p, 'PC에 맞게 가운데 정렬로 바꿨어요. 원래 왼쪽 정렬이었다면 되돌려 주세요'); }
          } else setW(n, T.content);
        }
        else if (near(s.w, S.root)) setW(n, T.root);
        else if (hasImage(n) && s.areaK) setW(n, s.w * s.areaK); // 이미지 중심 영역 안 이미지: 영역 배율
        else if (hasImage(n) && target === 'PC' && near(s.w, S.content)) setW(n, Math.min(s.w * rImg, colW(n))); // 내용 폭 이미지: 원본 해상도 이상 키우지 않음 (750 기준 690 유지)
        else if (hasImage(n) && rImg !== 1) setW(n, Math.min(s.w * rImg, target === 'PC' ? colW(n) : Infinity));
        else if (target === 'PC' && !s.inPicture && s.w >= S.content * 0.9) setW(n, colW(n)); // 경우 G: 주 칼럼(690·650 등 내용 폭 90% 이상) → 무조건 960으로 통일
        else if (target === 'PC' && !s.inPicture && s.w >= S.content * 0.55) { /* 경우 E: 그림(KV 등) 안 글 상자는 넓히지 않음 */ const g = growOf(p, colW(n)); setW(n, Math.min(g ? s.w * g : s.w * colW(n) / S.content, colW(n))); } // 폭이 정해진 가장 가까운 부모의 안쪽 폭 대비 비율 유지 (카드가 상자보다 좁아지지 않게) // 넓은 묶음·글 상자(내용 폭의 55% 이상 — 뱃지 같은 작은 요소는 제외)는 칼럼 비율대로 (750의 650 → 904). 화면 밀도(×0.5)로 줄이면 PC에서 너무 좁아짐
        else if (n.type === 'TEXT' && s.segs && !s.inPicture && typeof n.getRangeFontSize(0, 1) === 'number') { // 텍스트 박스는 글자 크기 비율로
          const kt = n.getRangeFontSize(0, 1) / s.segs[0].fontSize;
          if (kt !== 1) setW(n, Math.min(s.w * kt, target === 'PC' ? textW(n) : Infinity));
        }
        else if (target === 'PC' && p.layoutMode === 'HORIZONTAL' && p.layoutWrap !== 'WRAP' && p.layoutSizingHorizontal !== 'HUG' && !btn && rowFull(p) && growOf(p, colW(n))) setW(n, s.w * growOf(p, colW(n))); // 줄을 꽉 채우던 칸(표 칸 등): 줄이 커진 비율대로 → 칸 비율 유지
        else if (kBox !== 1) setW(n, s.w * kBox);
        // 모바일로 갈 때 부모 안쪽 폭보다 넓어지면 맞춤 (화면 밖으로 넘침 방지)
        if (target !== 'PC' && !freeFrame && n.layoutSizingHorizontal === 'FIXED' && isAL(p)) {
          const inner = innerW(p);
          if (p.layoutMode === 'VERTICAL' && n.width > inner + 1 && !(s.pIn != null && s.w > s.pIn + 1)) setW(n, inner); // 원본에서 일부러 칸보다 넓게 둔 요소(꽉 차는 이미지 등)는 그대로
        }
        rep.sized++;
        if (s.inInst && n.layoutSizingHorizontal === 'FIXED' && near(n.width, s.w, 1) && k !== 1 && !freeFrame) flag(n, '컴포넌트 안이라 폭을 못 바꿨어요'); // 인스턴스 안에서만
      }
      if (v === 'FIXED' && n.type !== 'TEXT') {
        if (hasImage(n) && (n.layoutSizingHorizontal === 'FILL' || rImg !== r)) { // 이미지 비율 유지 (FILL 폭은 부모 기준으로 계산 — 레이아웃 반영 전 값 방지)
          const w = n.layoutSizingHorizontal === 'FILL' && p.layoutMode === 'VERTICAL' ? innerW(p) : n.width;
          setH(n, w * s.h / s.w);
        }
        else if (n.type === 'FRAME' && n.layoutMode === 'NONE') { const g = s.selfK || gOf(s); if (g !== 1) setH(n, s.h * g); } // 직접 배치 영역은 그림 배율
        else if (kBox !== 1) setH(n, s.h * kBox);
      }
      if (kBox > k) for (const key of RADIUS_KEYS) if (s.num[key] && s.num[key] < 500 && key in n) { try { if (n.boundVariables && n.boundVariables[key]) n.setBoundVariable(key, null); n[key] = half(s.num[key] * kBox); } catch (e) { } } // 글 비율로 키운 상자는 모서리도 같이 (동그라미 유지)
      return ['FRAME', 'INSTANCE', 'COMPONENT', 'COMPONENT_SET', 'SECTION', 'SLOT'].includes(n.type);
    }

    // 오토레이아웃 밖 (직접 배치 영역) — 그림 배율로, 위치는 부모 가운데 기준
    if (!p || s.pW == null) return true;
    for (let a = p; a && a !== clone; a = a.parent) if (a.type === 'INSTANCE') return true; // 컴포넌트 안 레이어는 위치를 바꿀 수 없음 (인스턴스가 관리)
    const pWn = p.width;
    const g = gOf(s);
    // 부모(이미지 영역)가 PC 섹션 폭으로 넓어졌으면: 배경 레이어만 늘리고, 내용 묶음은 그림 크기 그대로 가운데
    const fullW = isFullW();
    const container = ['FRAME', 'INSTANCE', 'COMPONENT', 'SLOT'].includes(n.type);
    if (s.kvFlow) { // KV 안 글 묶음: 위쪽 절반은 위 기준, 아래쪽 절반은 아래 기준으로 (글이 작아져도 사진과의 거리 유지)
      if (n.type === 'TEXT' && n.textAutoResize !== 'WIDTH_AND_HEIGHT' && g !== 1) setW(n, s.w * g);
      const ps = snap.get(p.id), top = s.y + s.h / 2 < ps.h / 2;
      const calc = () => {
        const x = half((s.x + s.w / 2) * g + (p.width - s.pW * g) / 2 - n.width / 2);
        const y = top ? half(s.y * g) : half(p.height - (ps.h - s.y - s.h) * g - n.height);
        return [x, y];
      };
      const [x, y] = calc(); place(n, x, y, calc);
      return n.type !== 'TEXT';
    }
    if (n.type === 'TEXT' || isAL(n) || (container && fullW)) {
      if (fullW) setW(n, pWn - (s.pW - s.w) * g); // 부모보다 살짝 넓거나 좁은 차이도 유지
      else if (n.type !== 'TEXT' || n.textAutoResize !== 'WIDTH_AND_HEIGHT') {
        if (g !== 1 && (n.type === 'TEXT' || n.layoutSizingHorizontal === 'FIXED')) setW(n, s.w * g);
      }
      if (g !== 1 && n.type !== 'TEXT' && (!isAL(n) || n.layoutSizingVertical === 'FIXED')) setH(n, s.h * g); // 고정 높이 오토레이아웃도 배율 적용
      if (fullW) place(n, half(s.x * g), half(s.y * g), () => { const w = half(p.width - (s.pW - s.w) * g); if (Math.abs(n.width - w) > 0.5) setW(n, w); return [half(s.x * g), half(s.y * g)]; }); else mapPos(g);
      return n.type !== 'TEXT';
    }
    if (fullW && n.type === 'LINE') { setW(n, pWn - (s.pW - s.w) * g); place(n, half(s.x * g), half(s.y * g)); return false; }
    if (fullW) { // 배경 레이어
      n.resize(Math.max(0.5, half(pWn - (s.pW - s.w) * g)), Math.max(0.5, half(s.h * g)));
      place(n, half(s.x * g), half(s.y * g), () => { const w = Math.max(0.5, half(p.width - (s.pW - s.w) * g)); if (Math.abs(n.width - w) > 0.5) n.resize(w, n.height); return [half(s.x * g), half(s.y * g)]; });
      return false;
    }
    rescaleNode(n, g);
    mapPos(g);
    return false;
  };

  // 숨김 레이어는 레이아웃이 계산되지 않으므로 잠시 켰다가 복원
  const walk = async n => {
    const hidden = n.visible === false;
    if (hidden) { try { n.visible = true; } catch (e) { } }
    let descend = true;
    try { descend = await processNode(n); } catch (e) { fail(n, FAILURE); console.warn('[size-converter]', n.name, e); }
    if (descend && 'children' in n) for (const c of [...n.children]) await walk(c);
    if (hidden) { try { n.visible = false; } catch (e) { } }
  };
  for (const c of [...clone.children]) await walk(c);

  // 채우기(FILL)였던 직접 배치 영역 되돌리기 — PC에선 안쪽이 늘어나지 않게 자식 고정을 '가운데'로 (위치는 아래에서 다시 계산)
  for (const { n, h, v } of freeFill) {
    try {
      if (target === 'PC' && h === 'FILL' && !areas.has(n.id)) for (const c of n.children) if ('constraints' in c) { try { c.constraints = { horizontal: 'CENTER', vertical: c.constraints.vertical }; } catch (e) { } }
      if (h === 'FILL' && !areas.has(n.id)) n.layoutSizingHorizontal = 'FILL'; if (v === 'FILL') n.layoutSizingVertical = 'FILL'; // 이미지 중심 영역은 1097 고정
    } catch (e) { fail(n, '채우기 설정을 되돌리지 못했어요. 이 레이어의 폭 설정을 확인해 주세요'); }
  }
  if (target === 'PC') flagLineBreaks(all, snap, flag);
  if (target === 'PC') applyPcRules(clone, flag, fail, modeOf, new Set(all.filter(n => near(snap.get(n.id).w, S.root, 2)).map(n => n.id)), snap, bgSecs, areas);
  if (target === 'PC') fillRows(all, snap, flag);
  // 폭 정리가 모두 끝난 뒤, 직접 배치 요소 위치를 최종 부모 폭 기준으로 다시 계산 (가운데였던 것은 가운데로)
  await new Promise(res => setTimeout(res, 0));
  for (const [n, calc] of positions) { try { if (n.removed) continue; const [x, y] = calc(); if (Math.abs(n.x - x) > 0.01 || Math.abs(n.y - y) > 0.01) { n.x = x; n.y = y; } } catch (e) { } }
  if (target === 'PC') for (const id of bgSecs) { const n = clone.findOne(d => d.id === id); if (n) try { fitBgLayers(n, snap); } catch (e) { fail(n, '배경 이미지를 섹션 폭에 못 맞췄어요'); } }
  // 마지막 안전장치: 세로 묶음 안에서 부모 안쪽 폭보다 넓은 고정 폭 요소는 부모 폭으로 (칸 밖으로 넘침 방지)
  await new Promise(res => setTimeout(res, 0)); // Figma가 바뀐 폭(FILL 등)을 다시 계산할 틈
  for (const n of all) {
    if (n.removed || n.visible === false || n.layoutPositioning === 'ABSOLUTE' || n.layoutSizingHorizontal !== 'FIXED') continue;
    const p = n.parent; if (!isAL(p) || p.layoutMode !== 'VERTICAL') continue;
    const s = snap.get(n.id); if (!s || s.inInst || (s.pIn != null && s.w > s.pIn + 1)) continue; // 원본에서 일부러 칸보다 넓게 둔 요소는 그대로
    const inner = p.width - p.paddingLeft - p.paddingRight;
    if (inner > 0 && n.width > inner + 1) {
      try { const ar = n.height / n.width; setW(n, inner); if (hasImage(n) || (n.type === 'FRAME' && n.layoutMode === 'NONE')) setH(n, inner * ar); flag(n, '감싸는 프레임보다 넓어서 폭을 줄였어요. 잘린 내용이 없는지 봐 주세요'); } catch (e) { }
    }
  }
  fitHeights([clone, ...all], snap, rImg, flag, fail);
  if (Math.abs(clone.width - T.root) > 0.5) setW(clone, T.root); // 프레임 폭은 항상 규격대로 (375/750/1376)
  if (rep.unlinked) flag(clone, '일부 간격은 맞는 디자인 값이 없어 숫자로 남았어요');
  return { clone, rep };
}

// PC: 750에서 가로 줄을 거의 꽉 채우던 줄(아이콘+글, 점+글, 표의 이름·값)은 PC에서도 꽉 차게
// 줄은 넓어졌는데 안의 글이 글자 비율로만 바뀌면 한쪽으로 몰리거나 양 끝으로 벌어짐 → 가장 넓은 글(또는 글 묶음)을 채우기(FILL)로
function fillRows(all, snap, flag) {
  for (const n of all) {
    if (n.removed || !isAL(n) || n.layoutMode !== 'HORIZONTAL' || n.layoutWrap === 'WRAP' || n.layoutSizingHorizontal === 'HUG') continue;
    const s = snap.get(n.id); if (!s || s.inPicture || s.inInst) continue;
    const kids = n.children.filter(c => c.visible !== false && c.layoutPositioning !== 'ABSOLUTE');
    if (kids.length < 2 || kids.some(c => c.layoutSizingHorizontal === 'FILL')) continue;
    const ks = kids.map(c => snap.get(c.id)); if (ks.some(k => !k)) continue;
    const inner = s.w - (s.num.paddingLeft || 0) - (s.num.paddingRight || 0);
    const sb = n.primaryAxisAlignItems === 'SPACE_BETWEEN';
    const used = ks.reduce((t, k) => t + k.w, 0) + (sb ? 0 : (s.num.itemSpacing || 0) * (kids.length - 1));
    if (inner <= 0 || used < inner * 0.9) continue;
    // 같은 크기 칸이 나란히 (아이콘+글 3칸 등) → 칸을 똑같이 나눠 채움 (작아진 칸이 양 끝으로 흩어지지 않게)
    if (kids.every(c => ['FRAME', 'INSTANCE', 'COMPONENT'].includes(c.type) && !isButton(c) && !hasImage(c)) && ks.every(k => Math.abs(k.w - ks[0].w) <= 2)) {
      for (const c of kids) { try { c.layoutSizingHorizontal = 'FILL'; } catch (e) { } }
      continue;
    }
    if (sb) continue; // 양 끝 정렬 줄(표의 이름·값)은 원래대로
    const cand = kids.filter(c => (c.type === 'TEXT' || ('findOne' in c && c.findOne(d => d.type === 'TEXT'))) && !isButton(c) && !hasImage(c))
      .sort((a, b) => snap.get(b.id).w - snap.get(a.id).w)[0];
    if (!cand) continue;
    try { cand.layoutSizingHorizontal = 'FILL'; } catch (e) { }
  }
}

// PC 변환 시 Enter로 끊은 줄이 있는 글은 표시만 (문구는 건드리지 않음)
function flagLineBreaks(all, snap, flag) {
  for (const n of all) {
    if (n.type !== 'TEXT' || n.removed) continue;
    const s = snap.get(n.id);
    if (!s || s.inPicture) continue;
    const txt = n.characters;
    if (txt.replace(/\s/g, '').length < 20) continue;
    if (/[^\n\u2028]\n(?=[^\n\u2028])/.test(txt) || txt.includes('\u2028')) flag(n, '모바일용 줄바꿈이 있어요 — PC에서 확인');
  }
}

// 높이가 고정이라 커진 내용이 붙거나 넘치는 프레임 → 높이를 내용에 맞춤
//  - 오토레이아웃: 원래 내용에 딱 맞던 높이였거나, 지금 내용이 넘치면 HUG로
//  - 직접 배치 프레임: 아래쪽 요소가 프레임 밖으로 나가면 원래 아래 여백만큼 두고 높이를 늘림
// 오토레이아웃 프레임을 HUG로 했을 때의 높이 (프레임을 건드리지 않고 계산, 줄바꿈 배치는 제외)
function hugOf(n) {
  if (n.layoutWrap === 'WRAP') return null;
  const kids = n.children.filter(c => c.visible !== false && c.layoutPositioning !== 'ABSOLUTE');
  const pad = n.paddingTop + n.paddingBottom;
  if (!kids.length) return pad;
  if (n.layoutMode === 'VERTICAL') return pad + kids.reduce((t, c) => t + c.height, 0) + (n.primaryAxisAlignItems === 'SPACE_BETWEEN' ? 0 : n.itemSpacing * (kids.length - 1));
  return pad + Math.max(...kids.map(c => c.height));
}
function fitHeights(all, snap, rImg, flag, fail) {
  for (const n of [...all].reverse()) { // 안쪽부터
    if (n.removed) continue;
    const s = snap.get(n.id); if (!s || s.inPicture || s.inInst) continue;
    try {
      if (isAL(n) && n.layoutSizingVertical === 'FIXED' && s.hugH != null) {
        if (n.children.some(c => c.layoutSizingVertical === 'FILL' && c.layoutPositioning !== 'ABSOLUTE')) continue; // 채우기 자식이 있으면 HUG 불가
        const need = hugOf(n); if (need == null) continue;
        if (need > n.height + 1) { // 내용이 넘칠 때만 HUG (표 셀처럼 같은 줄 높이를 맞춘 프레임은 그대로 둠)
          const hz = n.layoutSizingHorizontal;
          n.layoutSizingVertical = 'HUG';
          if (n.layoutSizingHorizontal !== hz) try { n.layoutSizingHorizontal = hz; } catch (e) { } // 높이만 바꾸고 폭 설정(FILL 등)은 유지
          flag(n, '내용이 넘쳐서 높이를 내용 맞춤으로 바꿨어요');
        }
      } else if (n.type === 'FRAME' && n.layoutMode === 'NONE' && s.bottomSrc != null && n.children.length) {
        // 원본보다 '더' 아래로 내려간 만큼만 늘림 — 원래부터 프레임 밖으로 나간 장식(배경 원·줄자 등) 때문에 늘리지 않음
        const bottom = Math.max(...n.children.filter(c => c.visible !== false).map(c => c.y + c.height), 0);
        const g = s.selfK || s.areaK || rImg;
        const extra = bottom - s.bottomSrc * g;
        if (extra > 2 && n.height < half(s.h * g + extra) - 1) { setH(n, s.h * g + extra); flag(n, '아래 요소가 넘쳐서 높이를 늘렸어요'); }
      }
    } catch (e) { fail(n, '높이를 내용에 맞추지 못했어요. 글이 잘리지 않았는지 확인해 주세요'); }
  }
}

function applyPcRules(root, flag, fail, modeOf, bands, snap, bgSecs, areas) {
  const R = PC_RULES;
  // 0) 배경 이미지 섹션: 1376 → 1097, 가운데 (안쪽 꽉 찬 배경 레이어는 위치 재계산 때 새 폭에 맞춰짐)
  for (const id of bgSecs || []) {
    const n = root.findOne(d => d.id === id); if (!n) continue;
    try {
      if (n.layoutSizingHorizontal === 'FILL') n.layoutSizingHorizontal = 'FIXED';
      setW(n, R.bg);
      const p = n.parent;
      if (isAL(p) && n.layoutPositioning !== 'ABSOLUTE') { if (p.layoutMode === 'VERTICAL' && p.counterAxisAlignItems !== 'CENTER') { p.counterAxisAlignItems = 'CENTER'; flag(p, 'PC에 맞게 가운데 정렬로 바꿨어요. 원래 왼쪽 정렬이었다면 되돌려 주세요'); } }
      else n.x = Math.round((p.width - n.width) / 2);
    } catch (e) { fail(n, '배경 이미지 섹션 폭을 못 바꿨어요'); }
  }
  const wideOf = n => modeOf.get(n.id) === 'wide';
  const maxOf = n => wideOf(n) ? R.wideText : R.narrow; // 이 레이어가 속한 섹션의 글 최대 폭
  // 1) 폭 정리 (루트부터)
  //    - 원본에서 화면 폭(375/750)이던 섹션·배경 띠: 1376 그대로 두고 안으로
  //    - 그 밖의 내용(글·이미지·표·카드 묶음): 콘텐츠 폭 960 이하, 가운데 ([넓게] 섹션은 글만 909 이하)
  //    - 직접 배치 영역(KV): 그대로
  const cap = (c, w, parent) => {
    const ar = c.height / c.width;
    if (c.layoutSizingHorizontal === 'FILL') c.maxWidth = w; else setW(c, w);
    if (hasImage(c)) setH(c, c.width * ar);
    if (parent.layoutMode === 'VERTICAL' && parent.counterAxisAlignItems !== 'CENTER') { parent.counterAxisAlignItems = 'CENTER'; flag(parent, 'PC에 맞게 가운데 정렬로 바꿨어요. 원래 왼쪽 정렬이었다면 되돌려 주세요'); }
  };
  const limit = n => {
    if (!isAL(n)) return;
    for (const c of [...n.children]) {
      if (c.visible === false || c.layoutPositioning === 'ABSOLUTE') continue;
      if (c.type === 'FRAME' && c.layoutMode === 'NONE') continue;
      try {
        if (bands.has(c.id)) { limit(c); continue; }
        if (c.width <= maxOf(c) + 1) continue;
        if (wideOf(c)) { if (c.type === 'TEXT') cap(c, R.wideText, n); else limit(c); continue; }
        cap(c, R.narrow, n);
      } catch (e) { fail(c, 'PC 폭으로 맞추지 못했어요. 이 레이어 폭을 직접 확인해 주세요'); }
    }
  };
  limit(root);

  // 2) 반복 카드 가로 배치: 같은 모양의 카드(이미지 포함)가 세로로 2개 이상 → 2~4열 (퍼블리싱 PC 배치 기준)
  // 사진 카드만 (작은 썸네일+글 목록은 세로 유지), 960 칼럼 또는 [넓게] 섹션 폭 안에서
  // 본품·증정 뱃지 묶음 자체는 세로 유지, 그 안의 제품 목록은 최대 2열
  const stacks = [], capOf = new Map();
  const find = (n, inBadge) => {
    if (!('children' in n) || n.type === 'INSTANCE' || isButton(n)) return;
    if (n.layoutMode === 'VERTICAL') {
      const kids = n.children.filter(c => c.visible !== false && c.layoutPositioning !== 'ABSOLUTE');
      if (hasBadgeCards(n)) { n.children.forEach(c => find(c, 3)); return; } // 뱃지 묶음: 세로 유지, 안쪽 3단계까지만 제품 목록 찾기
      if (kids.some(c => areas.has(c.id) || ('findOne' in c && c.findOne(d => areas.has(d.id))))) { n.children.forEach(c => { if (!areas.has(c.id)) find(c, inBadge); }); return; } // 이미지 중심 영역 묶음만 세로 유지, 나머지는 계속 찾기
      const prodList = inBadge > 0 && kids.every(hasPic); // 뱃지 안 제품 목록 (사진·제품 이미지가 든 칸)
      if (kids.length >= 2 && kids.every(c => sameShape(c, kids[0]) && !isButton(c)) && (prodList || kids.every(c => photoCard(c)))) { stacks.push(n); if (prodList) capOf.set(n.id, 2); return; }
    }
    n.children.forEach(c => find(c, inBadge > 0 ? inBadge - 1 : 0));
  };
  find(root, 0);
  for (const n of stacks) {
    try {
      const kids = n.children.filter(c => c.visible !== false && c.layoutPositioning !== 'ABSOLUTE');
      const cols = Math.min(kids.length === 5 ? 3 : kids.length, capOf.get(n.id) || R.maxColumns); // 뱃지 안 제품 목록은 최대 2열
      const avail = Math.min(n.width - n.paddingLeft - n.paddingRight, wideOf(n) ? R.wide : R.narrow); // 카드 묶음도 콘텐츠 폭(960) 안에서 — [넓게] 섹션만 1376
      const w = Math.min(span(GRID.columns / cols), Math.floor((avail - R.columnGap * (cols - 1)) / cols)); // 12컬럼 그리드에 맞춤
      if (w < 160) continue;
      n.layoutMode = 'HORIZONTAL';
      n.layoutWrap = 'WRAP';
      const sourceGap = snap.get(n.id).num.itemSpacing;
      const gap = sourceGap === 0 ? 0 : R.columnGap;
      n.itemSpacing = gap; n.counterAxisSpacing = gap;
      n.primaryAxisAlignItems = 'CENTER'; n.counterAxisAlignItems = 'MIN';
      if (n.layoutSizingHorizontal === 'HUG') n.layoutSizingHorizontal = isAL(n.parent) ? 'FILL' : 'FIXED';
      n.layoutSizingVertical = 'HUG';
      for (const c of kids) {
        const k = w / c.width;
        if (c.type === 'INSTANCE' && typeof c.scaleFactor === 'number' && Math.abs(c.scaleFactor - 1) > 0.01) c.rescale(k);
        else { c.layoutSizingHorizontal = 'FIXED'; setW(c, w); fitInside(c); }
      }
      flag(n, '반복 카드를 가로로 놓았어요. 카드 순서가 맞는지 봐 주세요');
    } catch (e) { fail(n, '카드를 가로로 놓지 못해 세로 그대로예요'); }
  }
}

// 뱃지(본품·증정·증정품·사은품·혜택·GIFT 또는 이름 badge/뱃지)가 든 카드 묶음은 가로로 펼치지 않음 — 750과 같은 세로 순서 유지
const BADGE_TXT = /^(본품|증정|증정품|사은품|추가\s*증정|구매\s*혜택|혜택|gift|free\s*gift)$/i;
const isBadge = d => ['FRAME', 'INSTANCE', 'COMPONENT'].includes(d.type) && d.visible !== false && d.height <= 120 && d.width <= 400
  && (() => { const ts = d.findAll(t => t.type === 'TEXT' && t.visible !== false); return ts.length === 1 && BADGE_TXT.test(ts[0].characters.trim()); })(); // 글이 본품·증정 등일 때만 (섹션 제목 알약 'badge'는 제외)
// 바로 아래 칸(또는 그 한 단계 안)에 뱃지가 있는 묶음만 — 페이지 전체가 걸리지 않게
const badgeNear = c => 'children' in c && c.children.some(d => isBadge(d) || ('children' in d && d.children.some(isBadge)));
const hasBadgeCards = n => n.children.filter(c => c.visible !== false).length >= 2 && n.children.some(c => c.visible !== false && badgeNear(c));

// 배경 이미지 섹션의 배경 레이어(섹션을 덮던 이미지)를 새 섹션 폭에 꽉 채움 — 가운데 기준, 모자라면 비율대로 키움 (프레임이 잘라냄)
function fitBgLayers(n, snap) {
  const W = n.width;
  const cover = c => { // 이미지 한 장: 폭을 덮도록 키우고 가운데
    if (c.width < W - 1) { const ox = c.x + c.width / 2; c.rescale(W / c.width); c.x = ox - c.width / 2; }
    if (c.x > 0) c.x = 0; if (c.x + c.width < W) c.x = W - c.width;
  };
  for (const c of n.children) {
    const s = snap.get(c.id); if (!s || c.visible === false || s.pW == null) continue;
    if (!(s.x <= 2 && s.x + s.w >= s.pW - 2 && s.h >= snap.get(n.id).h * 0.5)) continue; // 섹션을 덮던 레이어만
    if (isAL(n) && c.layoutPositioning !== 'ABSOLUTE') continue;
    const img = hasImage(c) || ('findOne' in c && !c.findOne(d => d.type === 'TEXT') && !!c.findOne(hasImage));
    if (!img) continue;
    if (c.type === 'FRAME' && c.layoutMode === 'NONE') {
      const dx = (W - c.width) / 2; resizeFree(c, W, c.height); c.x = 0;
      for (const k of c.children) { k.x += dx; const ks = snap.get(k.id); if ((hasImage(k) || k.type === 'GROUP') && ks && ks.x <= 2 && ks.x + ks.w >= s.w - 2) cover(k); } // 배경 레이어를 덮던 사진만 (제품 사진 등은 그대로)
    } else if (hasImage(c)) { c.x = 0; c.resize(W, c.height); }
  }
}

// 같은 모양 판정: 종류·폭(±2px)·자식 수·자식 종류가 같으면 같은 카드로 봄 (레이어 이름은 안 봄)
const sameShape = (a, b) => a.type === b.type && Math.abs(a.width - b.width) <= 2 && 'children' in a && 'children' in b
  && a.children.length === b.children.length && a.children.every((c, i) => c.type === b.children[i].type);
const IMG_NAME = /img|image|이미지|사진|thumb|photo|prod/i;
// 사진 카드: 카드 안 가장 큰 이미지가 카드 폭의 절반 이상
const photoCard = (c, snap) => { const W = q => (snap && snap.get(q.id) ? snap.get(q.id).w : q.width); /* snap 없이 부르면 지금 폭 기준 (v3.38 동작) */ let m = 0; const go = q => { if (q.visible === false) return; if (hasImage(q) || (q.type === 'INSTANCE' && IMG_NAME.test(q.name))) m = Math.max(m, W(q)); if ('children' in q && q.type !== 'INSTANCE') q.children.forEach(go); }; go(c); return m >= W(c) * 0.5; }; // 원본(변환 전) 폭 기준
const hasPic = c => hasImage(c) || ('findOne' in c && !!c.findOne(d => hasImage(d) || (d.type === 'INSTANCE' && IMG_NAME.test(d.name))));

// 칸 안에 들어가지 않는 이미지·컴포넌트를 칸 폭에 맞춤 (비율 유지)
function fitInside(box) {
  const go = n => {
    for (const d of ('children' in n ? n.children : [])) {
      if (d.visible === false) continue;
      let q = n; while (q !== box && isAL(q) && q.layoutSizingHorizontal === 'HUG') q = q.parent; // 내용 맞춤(HUG) 부모는 건너뛰고 폭이 정해진 부모 기준
      const limit = q.width - (isAL(q) ? q.paddingLeft + q.paddingRight : 0);
      const scaledInst = d.type === 'INSTANCE' && typeof d.scaleFactor === 'number' && Math.abs(d.scaleFactor - 1) > 0.01;
      if ((scaledInst || hasImage(d) || d.type === 'GROUP') && d.width > limit + 1) {
        const k = limit / d.width;
        if (scaledInst || d.type === 'GROUP') d.rescale(k);
        else { const ar = d.height / d.width; if (d.layoutSizingHorizontal !== 'FILL') setW(d, limit); setH(d, d.width * ar); }
        continue;
      }
      if (d.type === 'FRAME' && d.layoutMode === 'NONE' && d.width > limit + 1) { d.rescale(limit / d.width); continue; } // 자유 배치 그림(잘린 사진 등)은 통째로 줄임 — 안쪽만 줄이면 구도가 깨짐
      if (isAL(d) && d.layoutSizingHorizontal === 'FIXED' && d.width > limit + 1) setW(d, limit); // 칸보다 넓은 묶음 (960 고정 등)
      if (d.type !== 'INSTANCE') go(d);
    }
  };
  go(box);
}

// ===== 변환 전 검사: 원본이 규격대로 만들어졌는지 확인 (아무것도 바꾸지 않음) =====
// ===== 자유 배치 → 오토레이아웃 자동 전환 =====
// 자유 배치 프레임 중 "한 줄로 쌓인 것"(요소 1개짜리 감싸는 프레임 포함)만 오토레이아웃으로 바꿈 — 지금 모습 그대로 (위치·간격·정렬 유지)
// 바꾸지 않는 것 (그림으로 그대로 둠): 요소끼리 겹침(KV처럼 배경 위에 글·그림), 프레임 밖으로 삐져나감,
//   간격이 제각각, 정렬이 섞임, 배경 이미지가 깔린 프레임
// 계획만 세움 (아무것도 바꾸지 않음) — 바꿀 수 없으면 null
function autoLayoutPlan(f) {
  if (f.type !== 'FRAME' || f.layoutMode !== 'NONE' || hasImage(f)) return null;
  const kids = f.children.filter(c => c.visible !== false);
  if (!kids.length) return null;
  // 그림 조각(벡터·도형·그룹)만 있는 프레임은 로고·일러스트 → 그림으로 둠. 글·프레임·컴포넌트가 하나는 있어야 함
  if (!kids.some(c => ['TEXT', 'FRAME', 'INSTANCE', 'COMPONENT'].includes(c.type))) return null;
  const W = f.width, H = f.height, tol = 1;
  if (kids.some(c => c.x < -tol || c.y < -tol || c.x + c.width > W + tol || c.y + c.height > H + tol)) return null;
  for (const dir of ['VERTICAL', 'HORIZONTAL']) {
    const v = dir === 'VERTICAL';
    const pos = c => v ? c.y : c.x, len = c => v ? c.height : c.width;
    const cpos = c => v ? c.x : c.y, clen = c => v ? c.width : c.height, CL = v ? W : H;
    const order = [...kids].sort((a, b) => pos(a) - pos(b));
    const gaps = [];
    for (let i = 1; i < order.length; i++) gaps.push(pos(order[i]) - pos(order[i - 1]) - len(order[i - 1]));
    if (gaps.some(g => g < -tol) || gaps.some(g => Math.abs(g - gaps[0]) > tol)) continue; // 겹침 또는 간격 제각각
    const before = order.map(c => cpos(c)), after = order.map(c => CL - cpos(c) - clen(c));
    let align, padA, padB;
    if (before.every(x => Math.abs(x - before[0]) <= tol)) { align = 'MIN'; padA = before[0]; padB = 0; }
    else if (after.every(x => Math.abs(x - after[0]) <= tol)) { align = 'MAX'; padA = 0; padB = after[0]; }
    else if (order.every((c, i) => Math.abs(before[i] - after[i]) <= tol)) { align = 'CENTER'; padA = padB = 0; }
    else continue;
    const first = order[0], last = order[order.length - 1];
    return { dir, order, gap: gaps.length ? Math.max(0, gaps[0]) : 0, align, padA, padB, start: pos(first), end: (v ? H : W) - pos(last) - len(last) };
  }
  return null;
}

// 계획대로 바꾸고, 위치가 하나라도 달라지면 원래대로 되돌림
function applyAutoLayout(f) {
  const plan = autoLayoutPlan(f); if (!plan) return false;
  const v = plan.dir === 'VERTICAL', W = f.width, H = f.height;
  const was = f.children.map(c => [c, c.x, c.y]);
  const order = plan.order.map(c => [c, c.x, c.y]);
  try {
    plan.order.forEach((c, i) => f.insertChild(i, c)); // 레이어 순서 = 쌓인 순서
    f.layoutMode = plan.dir;
    f.itemSpacing = plan.gap;
    f.primaryAxisAlignItems = 'MIN'; f.counterAxisAlignItems = plan.align;
    if (v) { f.paddingTop = plan.start; f.paddingBottom = plan.end; f.paddingLeft = plan.padA; f.paddingRight = plan.padB; }
    else { f.paddingLeft = plan.start; f.paddingRight = plan.end; f.paddingTop = plan.padA; f.paddingBottom = plan.padB; }
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.resize(W, H);
    if (order.every(([c, x, y]) => Math.abs(c.x - x) <= 1 && Math.abs(c.y - y) <= 1)) return true;
  } catch (e) { }
  // 되돌리기
  f.layoutMode = 'NONE';
  was.forEach(([c, x, y], i) => { f.insertChild(i, c); c.x = x; c.y = y; });
  f.resize(W, H);
  return false;
}

// 화면 폭인데 "내용에 맞춤(HUG)"인 섹션 — 안쪽 요소 하나 때문에 섹션 폭이 흔들림
const hugSection = (n, rootW) => isAL(n) && isAL(n.parent) && n.layoutPositioning !== 'ABSOLUTE'
  && n.layoutSizingHorizontal === 'HUG' && near(n.width, rootW, 2);

// 보기엔 가운데인데 오토레이아웃 정렬이 가운데가 아닌 곳 찾기 (가로 방향만 — PC에서 폭이 넓어지는 방향)
// 지금은 여백(padding)이나 꽉 찬 폭 덕분에 가운데처럼 보이지만, PC에서 폭이 넓어지면 왼쪽(오른쪽)으로 쏠림
// 정렬을 가운데로 바꿔도 지금 모습이 그대로인 경우만 잡음 (= 안쪽 폭을 정확히 채우는 고정 폭 요소)
// 모바일 내용 폭(690/345)·화면 폭 요소는 변환 때 플러그인이 알아서 가운데로 맞추므로 제외
function misAligned(n, S) {
  if (!isAL(n) || n.layoutWrap === 'WRAP' || n.layoutSizingHorizontal === 'HUG') return null;
  const kids = n.children.filter(c => c.visible !== false && c.layoutPositioning !== 'ABSOLUTE');
  if (!kids.length) return null;
  const inner = n.width - n.paddingLeft - n.paddingRight;
  const handled = w => near(w, S.content) || near(w, S.root);
  if (n.layoutMode === 'VERTICAL') {
    if (n.counterAxisAlignItems === 'CENTER') return null;
    const fixedKids = kids.filter(c => c.layoutSizingHorizontal !== 'FILL');
    // 고정 폭 자식이 모두 안쪽 폭을 꽉 채울 때만 (하나라도 좁으면 가운데로 바꾸는 순간 그 요소가 움직임)
    if (!fixedKids.length || !fixedKids.every(c => near(c.width, inner, 1))) return null;
    const hit = fixedKids.filter(c => !handled(c.width));
    return hit.length ? hit : null;
  }
  if (n.primaryAxisAlignItems !== 'MIN' && n.primaryAxisAlignItems !== 'MAX') return null;
  if (kids.some(c => c.layoutSizingHorizontal === 'FILL')) return null;
  const total = kids.reduce((t, c) => t + c.width, 0) + n.itemSpacing * (kids.length - 1);
  return near(total, inner, 1) && !handled(total) ? [n] : null;
}

async function lintFrame(root) {
  const size = detectSize(root);
  if (!size) throw new Error(`폭이 375, 750, PC(1376)인 프레임만 검사할 수 있어요. 지금 폭: ${Math.round(root.width)}px`);
  const S = size === 'PC' ? Object.assign({}, SIZES.PC, { root: root.width }) : SIZES[size];
  const bgPC = new Set(size === 'PC' ? findBgSections(root, PC_RULES.bg).list.map(n => n.id) : []);
  const rep = { from: size, check: [] };
  const seen = new Set();
  rep.fixable = 0;
  const flag = (n, reason, fixable = false) => {
    const key = n.id + reason; if (seen.has(key) || /guide/i.test(n.name)) return; seen.add(key);
    if (fixable) rep.fixable++;
    if (rep.check.length < 150) rep.check.push({ id: n.id, name: n.name, reason }); else rep.more = (rep.more || 0) + 1;
  };
  const styleCache = new Map();
  const styleName = async id => { if (!styleCache.has(id)) { let s = null; try { s = await figma.getStyleByIdAsync(id); } catch (e) { } styleCache.set(id, s ? s.name : ''); } return styleCache.get(id); };
  const marginOK = v => near(v, S.margin, 0.5) || v === 0;
  const tokenVals = new Set(SPACING.map(r => r[IDX[size]])); // 이 사이즈의 간격 토큰 값 (가이드에 없는 작은 값은 제외)
  const walk = async (n, inFree, depth) => {
    if (n.visible === false) return;
    if (n.type === 'TEXT' && !inFree) {
      if (n.hasMissingFont) flag(n, '이 글자의 폰트가 없어 변환 때 크기를 바꿀 수 없어요. 폰트를 설치한 뒤 변환해 주세요');
      else if (n.characters.length) {
        for (const seg of n.getStyledTextSegments(['textStyleId', 'fontSize', 'fontName'])) {
          if (!seg.textStyleId) { flag(n, '글자 스타일이 없어 변환 때 크기만 바뀌어요. Publishing 스타일을 연결해 주세요', !!pubStyleKey(seg, size)); break; }
          if (!/^Publishing\//.test(await styleName(seg.textStyleId))) { flag(n, 'Publishing 스타일이 아니라 변환 때 스타일 연결이 끊겨요. Publishing 스타일로 바꿔 주세요', !!pubStyleKey(seg, size)); break; }
        }
      }
      return;
    }
    if (n.type === 'INSTANCE') return; // 컴포넌트 내부는 라이브러리 관리 영역
    if (!('children' in n)) return;
    const isFree = n.type === 'FRAME' && n.layoutMode === 'NONE' && n !== root;
    if (isFree && !inFree) {
      if (autoLayoutPlan(n)) flag(n, '자유 배치인데 한 줄로 쌓여 있어요 — 오토레이아웃으로 바꿀 수 있어요', true);
      else flag(n, '자유 배치 프레임 — 요소가 겹치거나 간격이 제각각이라 PC에선 그림처럼 커져요');
    }
    if (size === 'PC' && bgPC.has(n.id) && !near(n.width, PC_RULES.bg, 2)) flag(n, `배경 이미지 섹션인데 폭이 ${Math.round(n.width)}이에요 — 배경은 ${PC_RULES.bg} (KV만 1376, 예외는 이름에 [넓게])`);
    if (hugSection(n, S.root)) flag(n, '화면 폭 섹션이 내용 맞춤이에요. 채우기로 바꿔야 사이즈 변환 때 안 깨져요', true);
    if (isAL(n) && !inFree) {
      const bv = n.boundVariables || {};
      const keys = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing'];
      if (keys.some(k => n[k] > 0 && !bv[k] && tokenVals.has(n[k]))) flag(n, '토큰과 같은 간격인데 연결이 안 돼 있어요', true);
      // 모바일 좌우 여백: 화면 폭 섹션(바깥쪽)만 확인
      if (size !== 'PC' && depth <= 1 && near(n.width, S.root, 2)) {
        const pl = n.paddingLeft, pr = n.paddingRight;
        const textAtEdge = pl === 0 && n.children.some(c => c.type === 'TEXT' && c.visible !== false);
        if (!marginOK(pl) || !marginOK(pr) || textAtEdge) flag(n, `좌우 여백이 ${S.margin}이 아니에요. 규격(750: 30, 375: 15)에 맞추면 변환 때 여백이 정확해요`);
      }
    }
    if (size !== 'PC' && !inFree && !isFree) {
      const hit = misAligned(n, S);
      if (hit) for (const c of hit) flag(c, '보기엔 가운데지만 정렬 설정은 가운데가 아니에요. PC에서 한쪽으로 쏠리니 가운데 정렬로 바꿔 주세요(모양은 그대로예요)', true);
    }
    for (const c of n.children) await walk(c, inFree || isFree, depth + 1);
  };
  await walk(root, false, 0);
  return rep;
}

// ===== 전부 고치기: 검사 결과 중 모양이 바뀌지 않는 것만 고침 =====
// 1) 정렬: 보기엔 가운데인데 정렬이 아닌 곳 → 가운데 정렬
// 2) 간격: 토큰과 같은 값인데 연결 안 된 간격 → 지금 값과 똑같은 토큰에 연결
// 3) 글자: 스타일이 없거나 Publishing이 아닌 글자 → 크기·굵기가 같은 Publishing 스타일 (복사본에 시험 적용해서 모양이 같을 때만)
// 폰트 없음·자유 배치 프레임·좌우 여백은 디자이너 판단이 필요해서 고치지 않음

// 이 글자 구간에 맞는 Publishing 스타일 이름 (예: fntH3-bold) — 없으면 null
function pubStyleKey(seg, size) {
  const f = seg.fontName;
  if (!f || f === figma.mixed || !/Noto Sans KR/i.test(f.family)) return null;
  const row = TYPO_ROWS.find(r => r[1 + IDX[size]] === seg.fontSize);
  const w = String(f.style).toLowerCase().replace(/\s/g, '');
  return row && w in WEIGHTS ? row[0] + '-' + w : null;
}

async function fixFrame(root) {
  const size = detectSize(root);
  if (!size) throw new Error('폭이 375, 750, PC(1376)인 프레임만 고칠 수 있어요.');
  const S = size === 'PC' ? Object.assign({}, SIZES.PC, { root: root.width }) : SIZES[size];
  const done = { align: 0, spacing: 0, text: 0, layout: 0 };
  // 0) 구조: 화면 폭 HUG 섹션 → FILL, 한 줄로 쌓인 자유 배치 → 오토레이아웃 (안쪽부터)
  const tree = [root, ...root.findAll(() => true)];
  for (const n of tree) if (hugSection(n, root.width)) { try { n.layoutSizingHorizontal = 'FILL'; done.layout++; } catch (e) { } }
  for (const f of tree.filter(n => n.type === 'FRAME' && n.layoutMode === 'NONE' && n !== root).reverse()) {
    let inInst = false; for (let a = f.parent; a && a !== root; a = a.parent) if (a.type === 'INSTANCE') { inInst = true; break; }
    if (!inInst && applyAutoLayout(f)) done.layout++;
  }

  // 검사와 같은 범위: 인스턴스 안·자유 배치 영역 안은 제외
  const nodes = [];
  const collect = (n, inFree) => {
    if (n.visible === false || n.type === 'INSTANCE') return;
    if (!inFree) nodes.push(n);
    if (!('children' in n)) return;
    const free = n.type === 'FRAME' && n.layoutMode === 'NONE' && n !== root;
    for (const c of n.children) collect(c, inFree || free);
  };
  collect(root, false);
  await loadFonts(nodes);

  // 간격 토큰 목록 (파일에 있는 Spacing 컬렉션, 없으면 라이브러리에서)
  const spacing = [], seen = new Set();
  const addVar = async v => {
    if (!v || v.resolvedType !== 'FLOAT' || seen.has(v.id)) return;
    const c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
    if (c && /^Spacing/i.test(c.name)) { seen.add(v.id); spacing.push(v); }
  };
  for (const c of await collectCollections(nodes)) if (/^Spacing/i.test(c.name)) for (const id of c.variableIds) await addVar(await figma.variables.getVariableByIdAsync(id));
  if (!spacing.length) for (const k of VAR_KEYS) { try { await addVar(await figma.variables.importVariableByKeyAsync(k)); } catch (e) { } }
  spacing.sort((a, b) => /pad(Top|Btm)/i.test(a.name) - /pad(Top|Btm)/i.test(b.name)); // 일반 간격 토큰 먼저

  // Publishing 글자 스타일 (파일 → 라이브러리)
  const styles = new Map();
  for (const st of await figma.getLocalTextStylesAsync()) if (/^Publishing\//.test(st.name)) styles.set(st.name.split('/').pop(), st);
  const getStyle = async key => {
    if (styles.has(key)) return styles.get(key);
    const [grp, w] = key.split(/-(?=[a-z]+$)/);
    const k = STYLE_KEYS[grp] && STYLE_KEYS[grp][WEIGHTS[w]];
    let st = null; if (k) { try { st = await figma.importStyleByKeyAsync(k); } catch (e) { } }
    styles.set(key, st); return st;
  };
  const sameText = (a, b, x, y) => ['getRangeFontSize', 'getRangeLineHeight', 'getRangeLetterSpacing', 'getRangeFontName']
    .every(f => JSON.stringify(a[f](x, y)) === JSON.stringify(b[f](x, y)));

  for (const n of nodes) {
    try {
      // 1) 정렬
      if (size !== 'PC' && misAligned(n, S)) {
        if (n.layoutMode === 'VERTICAL') n.counterAxisAlignItems = 'CENTER'; else n.primaryAxisAlignItems = 'CENTER';
        done.align++;
      }
      // 2) 간격 토큰 — 지금 이 자리에서 같은 값으로 계산되는 토큰만
      if (isAL(n)) for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing']) {
        const val = n[k];
        if (!(val > 0) || (n.boundVariables && n.boundVariables[k])) continue;
        const v = spacing.find(v => { try { return v.resolveForConsumer(n).value === val; } catch (e) { return false; } });
        if (!v) continue;
        n.setBoundVariable(k, v);
        if (n[k] === val) done.spacing++; else { n.setBoundVariable(k, null); n[k] = val; } // 값이 바뀌면 되돌림
      }
      // 3) 글자 스타일
      if (n.type === 'TEXT' && !n.hasMissingFont && n.characters.length) {
        for (const seg of n.getStyledTextSegments(['textStyleId', 'fontSize', 'fontName'])) {
          if (seg.textStyleId) { const cur = await figma.getStyleByIdAsync(seg.textStyleId); if (cur && /^Publishing\//.test(cur.name)) continue; }
          const key = pubStyleKey(seg, size); if (!key) continue;
          const st = await getStyle(key); if (!st) continue;
          await figma.loadFontAsync(st.fontName);
          const test = n.clone(); test.visible = false;
          try {
            await test.setRangeTextStyleIdAsync(seg.start, seg.end, st.id);
            if (sameText(test, n, seg.start, seg.end)) { await n.setRangeTextStyleIdAsync(seg.start, seg.end, st.id); done.text++; }
          } finally { test.remove(); }
        }
      }
    } catch (e) { console.warn('[size-converter] fix', n.name, e); }
  }
  figma.commitUndo(); // Ctrl/Cmd+Z 한 번으로 되돌릴 수 있게
  return done;
}

// ===== Plugin glue =====
if (typeof __html__ !== 'undefined') {
  figma.showUI(__html__, { width: 320, height: 600, themeColors: true });

  const DEFAULT_OPTS = { link: true };
  const sendSelection = () => {
    const sel = figma.currentPage.selection;
    const n = sel.length === 1 ? sel[0] : null;
    figma.ui.postMessage({
      type: 'selection', count: sel.length, id: n ? n.id : null,
      name: n ? n.name : null,
      width: n && 'width' in n ? Math.round(n.width) : null,
      height: n && 'height' in n ? Math.round(n.height) : null,
      isFrame: !!n && ['FRAME', 'COMPONENT', 'INSTANCE'].includes(n.type),
      size: n ? detectSize(n) : null,
    });
  };

  (async () => {
    let opts = DEFAULT_OPTS;
    try { opts = Object.assign({}, DEFAULT_OPTS, await figma.clientStorage.getAsync('opts')); } catch (e) { }
    figma.ui.postMessage({ type: 'init', opts });
    sendSelection();
  })();
  figma.on('selectionchange', sendSelection);

  let running = false; // 변환 중복 실행 방지
  figma.ui.onmessage = async msg => {
    if (msg.type === 'opts') {
      try { await figma.clientStorage.setAsync('opts', msg.opts); } catch (e) { }
    }
    if (msg.type === 'convert') {
      if (running) return;
      const sel = figma.currentPage.selection;
      if (sel.length !== 1) { figma.ui.postMessage({ type: 'error', text: '프레임 하나만 선택해 주세요.' }); return; }
      figma.ui.postMessage({ type: 'busy', target: msg.target });
      running = true;
      await new Promise(r => setTimeout(r, 30)); // 진행 표시가 그려질 시간
      let made = null;
      try {
        const t0 = Date.now();
        const { clone, rep } = await convertFrame(sel[0], msg.target, { link: (msg.opts || DEFAULT_OPTS).link !== false, onClone: c => { made = c; } });
        figma.currentPage.selection = [clone];
        figma.viewport.scrollAndZoomIntoView([clone]);
        figma.ui.postMessage({ type: 'done', rep, name: clone.name, id: clone.id, ms: Date.now() - t0 });
      } catch (e) {
        console.warn('[size-converter]', e);
        try { if (made && !made.removed) made.remove(); } catch (er) { } // 만들다 만 복사본 정리
        const msg = String(e && e.message || e);
        figma.ui.postMessage({ type: 'error', text: /[가-힣]/.test(msg) ? msg : '변환하지 못했어요. 프레임 구조를 확인해 주세요.' });
      } finally { running = false; }
    }
    if (msg.type === 'lint') {
      const sel = figma.currentPage.selection;
      if (sel.length !== 1) { figma.ui.postMessage({ type: 'error', text: '프레임 하나만 선택해 주세요.' }); return; }
      figma.ui.postMessage({ type: 'busy', lint: true });
      await new Promise(r => setTimeout(r, 30));
      try {
        const rep = await lintFrame(sel[0]);
        figma.ui.postMessage({ type: 'lintDone', rep, name: sel[0].name, id: sel[0].id });
      } catch (e) {
        console.warn('[size-converter]', e);
        const m = String(e && e.message || e);
        figma.ui.postMessage({ type: 'error', text: /[가-힣]/.test(m) ? m : '검사하지 못했어요.' });
      }
    }
    if (msg.type === 'fixAll') {
      const root = await figma.getNodeByIdAsync(msg.id);
      if (!root || root.removed) { figma.ui.postMessage({ type: 'error', text: '검사한 프레임을 찾을 수 없어요.' }); return; }
      figma.ui.postMessage({ type: 'busy', lint: true });
      await new Promise(r => setTimeout(r, 30));
      try {
        const fixed = await fixFrame(root);
        const rep = await lintFrame(root); // 고친 뒤 다시 검사해서 남은 것만 보여줌
        rep.fixed = fixed;
        figma.ui.postMessage({ type: 'lintDone', rep, name: root.name, id: root.id });
      } catch (e) {
        console.warn('[size-converter]', e);
        const m = String(e && e.message || e);
        figma.ui.postMessage({ type: 'error', text: /[가-힣]/.test(m) ? m : '고치지 못했어요.' });
      }
    }
    if (msg.type === 'focus') {
      const nodes = [];
      for (const id of msg.ids) { const n = await figma.getNodeByIdAsync(id); if (n) nodes.push(n); }
      if (nodes.length) { figma.currentPage.selection = nodes; figma.viewport.scrollAndZoomIntoView(nodes); }
    }
  };
}
