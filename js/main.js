const categoryList = document.getElementById('category-list');
const codeContainer = document.getElementById('code-container');
const searchInput = document.getElementById('search-input');

let allData = [];

const welcomeHTML = `
    <div class="welcome">
        <h2>👋 欢迎使用算法模板库</h2>
        <p>请选择分类，或在搜索框中搜索算法关键字。</p>
        <p>代码风格：C++</p>
    </div>
`;

async function init() {
    try {
        codeContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top: 20vh;">数据加载中...</p>';
        const response = await fetch('data/all.json');
        if (!response.ok) throw new Error('找不到 data/all.json');
        allData = await response.json();

        const categories = [...new Set(allData.map(item => item.category).filter(Boolean))];
        
        // 首页按钮
        const homeLi = document.createElement('li');
        const homeA = document.createElement('a');
        homeA.href = '#';
        homeA.textContent = '🏠 首页';
                homeA.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar a').forEach(el => el.classList.remove('active'));
            homeA.classList.add('active');
            searchInput.value = ''; 
            codeContainer.innerHTML = welcomeHTML;
            
            // 核心修改：回到顶部
            codeContainer.scrollTop = 0; 
        };
        homeLi.appendChild(homeA);
        categoryList.appendChild(homeLi);

        // 分类按钮
        categories.forEach((catName) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = catName;
            a.onclick = (e) => {
                e.preventDefault();
                document.querySelectorAll('.sidebar a').forEach(el => el.classList.remove('active'));
                a.classList.add('active');
                searchInput.value = ''; 
                renderCategory(catName);
            };
            li.appendChild(a);
            categoryList.appendChild(li);
        });

        homeA.click();
        initFontSize();

    } catch (error) {
        codeContainer.innerHTML = `<div style="color:red; text-align:center; margin-top:20vh;">❌ 加载失败：${error.message}</div>`;
    }
}

function renderCategory(catName) {
    const filtered = allData.filter(item => item.category === catName);
    let html = '';
    filtered.forEach(item => {
        const codeStr = Array.isArray(item.code) ? item.code.join('\n') : item.code;
        html += `
            <div class="code-section">
                <h3>${item.title}</h3>
                <div class="desc">${item.description}</div>
                <pre><code>${highlightCode(codeStr)}</code></pre>
            </div>
        `;
    });
    codeContainer.innerHTML = html;
    
    // 核心修改：让右侧内容区立即回到顶部
    codeContainer.scrollTop = 0; 
    
    applyFontSize();
}

function filterCards() {
    const keyword = searchInput.value.toLowerCase().trim();
    if (keyword === '') {
        const activeA = document.querySelector('.sidebar a.active');
        if (activeA) activeA.click();
        return;
    }
    let html = '';
    const matched = allData.filter(item => {
        let codeText = Array.isArray(item.code) ? item.code.join('\n') : item.code;
        return item.title.toLowerCase().includes(keyword) || codeText.toLowerCase().includes(keyword);
    });
    matched.forEach(item => {
        const codeStr = Array.isArray(item.code) ? item.code.join('\n') : item.code;
        html += `
            <div class="code-section">
                <h3>${item.title}</h3>
                <div class="desc">${item.description}</div>
                <pre><code>${highlightCode(codeStr)}</code></pre>
            </div>
        `;
    });
    codeContainer.innerHTML = html || '<p style="text-align:center; margin-top:20vh;">未找到 🔍</p>';
    
    // 核心修改：让右侧内容区立即回到顶部
    codeContainer.scrollTop = 0; 
    
    applyFontSize();
}

// ================= 超级无敌高亮函数 =================
// 精准高亮代码块里的二级标题
function highlightCode(code) {
    let escaped = code.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
    
    let lines = escaped.split('\n');
    
    for(let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // 1. 识别 < 标题，变蓝、加粗，并放大字体 (1.25em 会比普通代码大一号)
        if (line.startsWith('&lt;')) {
            let text = lines[i].replace('&lt;', '').trim();
            lines[i] = '<span style="color: #569cd6; font-weight: bold; font-size: 1.25em; display: inline-block; margin-top: 5px;">' + text + '</span>';
        }
        
        // 2. 问：前面只加一个换行
        if (line.startsWith('问：')) {
            lines[i] = '\n' + lines[i];
        }
    }
    
    return lines.join('\n');
}
// ======================================================

// 字体缩放
let currentFontSize = 100; 
function initFontSize() {
    const savedSize = localStorage.getItem('fontSize');
    if (savedSize) currentFontSize = parseInt(savedSize);
    applyFontSize();
}
function changeFontSize(delta) {
    currentFontSize += delta * 10; 
    if (currentFontSize < 50) currentFontSize = 50;
    if (currentFontSize > 250) currentFontSize = 250;
    applyFontSize();
    localStorage.setItem('fontSize', currentFontSize);
}
function applyFontSize() {
    const scale = currentFontSize / 100;
    document.querySelectorAll('pre code').forEach(el => {
        el.style.fontSize = `${scale}em`; 
    });
}

init();
