const categoryList = document.getElementById('category-list');
const codeContainer = document.getElementById('code-container');
const searchInput = document.getElementById('search-input');

let allData = [];

const welcomeHTML = `
    <div class="welcome">
        <h2>👋 欢迎使用算法模板库</h2>
        <p>请在左侧选择分类，或在搜索框中搜索算法关键字。</p>
        <p>代码风格：C++17 | 使用 <code>#define int long long</code></p>
    </div>
`;

async function init() {
    try {
        codeContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top: 20vh;">数据加载中...</p>';
        
        const response = await fetch('data/all.json');
        if (!response.ok) throw new Error('网络错误或 all.json 文件不存在');
        
        allData = await response.json();
        
        // 提取所有不重复的分类
        const categories = [...new Set(allData.map(item => item.category))];
        
        // 1. 生成“首页”按钮
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
            applyFontSize();
        };
        homeLi.appendChild(homeA);
        categoryList.appendChild(homeLi);

        // 2. 生成其他分类按钮
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

        // 3. 强制初始化：默认高亮首页，并展示欢迎页面
        document.querySelectorAll('.sidebar a').forEach(el => el.classList.remove('active'));
        homeA.classList.add('active');
        codeContainer.innerHTML = welcomeHTML;

        initFontSize();

    } catch (error) {
        codeContainer.innerHTML = `<p style="color:red; text-align:center; margin-top:20vh;">加载失败：${error.message}</p>`;
    }
}

// ================= 核心：字体缩放逻辑 =================
let currentFontSize = 100; 

function initFontSize() {
    const savedSize = localStorage.getItem('fontSize');
    if (savedSize) {
        currentFontSize = parseInt(savedSize);
    }
    applyFontSize();
}

function changeFontSize(delta) {
    currentFontSize += delta * 10; 
    // 字体范围扩大到 50% 到 250%
    if (currentFontSize < 50) currentFontSize = 50;
    if (currentFontSize > 250) currentFontSize = 250;

    applyFontSize();
    localStorage.setItem('fontSize', currentFontSize);
}

function applyFontSize() {
    const scale = currentFontSize / 100;
    
    // 缩放右侧的代码文字和说明文字
    const codeElements = document.querySelectorAll('pre code, .desc, .welcome p, .welcome h2');
    codeElements.forEach(el => {
        el.style.fontSize = `${scale}em`; 
    });
    
    // 缩放左侧菜单文字
    const menuElements = document.querySelectorAll('.sidebar a');
    menuElements.forEach(el => {
        el.style.fontSize = `${scale}em`;
    });
}
// ======================================================

function renderCategory(catName) {
    const filtered = allData.filter(item => item.category === catName);
    renderData(filtered);
}

function filterCards() {
    const keyword = searchInput.value.toLowerCase().trim();
    
    if (keyword === '') {
        const activeA = document.querySelector('.sidebar a.active');
        if (activeA) {
            if (activeA.textContent.includes('首页')) {
                codeContainer.innerHTML = welcomeHTML;
            } else {
                renderCategory(activeA.textContent);
            }
        }
        return;
    }

    const matched = allData.filter(item => {
        return item.title.toLowerCase().includes(keyword) || 
               item.description.toLowerCase().includes(keyword) ||
               item.code.toLowerCase().includes(keyword) ||
               item.category.toLowerCase().includes(keyword);
    });

    matched.forEach(item => {
        item.displayTitle = `[${item.category}] ${item.title}`;
    });

    renderData(matched);
}

function renderData(dataArray) {
    if (dataArray.length === 0) {
        codeContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top: 20vh;">未找到匹配的算法模板 🔍</p>';
        return;
    }

    let html = '';
    dataArray.forEach(item => {
        const titleToShow = item.displayTitle || item.title;
        html += `
            <div class="code-section">
                <h3>${titleToShow}</h3>
                <div class="desc">${item.description}</div>
                <pre><code>${highlightCode(item.code, item.title)}</code></pre>
            </div>
        `;
    });
    
    codeContainer.innerHTML = html;
    applyFontSize();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            "'": '&#39;', '"': '&quot;'
        }[tag] || tag)
    );
}

// 精准高亮代码块里的二级标题
function highlightCode(code, title) {
    let escaped = escapeHTML(code);
    
    // 把标题拆解，比如 "Sort 与 Math" 拆成 "Sort" 和 "Math"
    let titles = title.split(/与|和/).map(t => t.trim().replace(/[\(（].*?[\)）]/g, '').trim());
    
    let lines = escaped.split('\n');
    for(let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // 如果这行是空的，跳过
        if (line === '') continue;

        // 检查这一行是不是我们要的标题
        let isTitle = false;
        for(let t of titles) {
            if (line === t || line === '// ' + t || line === '//' + t) {
                isTitle = true;
                break;
            }
            // 针对纯中文短句（比如 "最大公约数"）兜底
            if (/^[\u4e00-\u9fa5]+$/.test(line) && line.length <= 10) {
                isTitle = true;
                break;
            }
        }

        // 如果这一行是以“问”开头，或者包含代码符号（;{}），绝对不标蓝
        if (line.startsWith('问') || /[;{}]/.test(line)) {
            isTitle = false;
        }

        if (isTitle) {
            // 删除了 display: block; 让标题和后面的代码紧紧挨着
            lines[i] = '<span style="color: #569cd6; font-weight: bold;">' + lines[i] + '</span>';
        }
    }
    
    return lines.join('\n');
}

init();
