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
        
        // 这里加一个容错打印，看看能不能正常拿到 JSON
        try {
            allData = await response.json();
        } catch (e) {
            console.error("JSON 格式解析失败，请检查 all.json 是否少了逗号、引号等！", e);
            throw new Error("JSON 解析失败");
        }
        
        // 确保读取到的是数组
        if (!Array.isArray(allData)) {
            throw new Error('JSON 数据格式不正确，最外层必须是数组 []');
        }

        const categories = [...new Set(allData.map(item => item.category).filter(Boolean))];
        
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
        console.error(error);
        codeContainer.innerHTML = `<p style="color:red; text-align:center; margin-top:20vh; font-weight:bold;">加载失败：${error.message}<br><br>请按 F12 打开控制台查看详细错误信息，通常是因为 all.json 里多了/少了逗号或引号。</p>`;
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
    if (currentFontSize < 50) currentFontSize = 50;
    if (currentFontSize > 250) currentFontSize = 250;

    applyFontSize();
    localStorage.setItem('fontSize', currentFontSize);
}

function applyFontSize() {
    const scale = currentFontSize / 100;
    
    const codeElements = document.querySelectorAll('pre code, .desc, .welcome p, .welcome h2');
    codeElements.forEach(el => {
        el.style.fontSize = `${scale}em`; 
    });
    
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
        let codeText = Array.isArray(item.code) ? item.code.join('\n') : item.code;
        return item.title.toLowerCase().includes(keyword) || 
               item.description.toLowerCase().includes(keyword) ||
               codeText.toLowerCase().includes(keyword) ||
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
    let rawCode = Array.isArray(code) ? code.join('\n') : code;
    let escaped = escapeHTML(rawCode);
    let lines = escaped.split('\n');
    
    for(let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line === '') continue;

        // 只要以 < 开头，就变蓝，并去掉 <
        if (line.startsWith('<')) {
            let titleText = line.substring(1).trim();
            lines[i] = '<span style="color: #569cd6; font-weight: bold;">' + titleText + '</span>';
        }
    }
    
    return lines.join('\n');
}

init();
