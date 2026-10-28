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
        const categories = [...new Set(allData.map(item => item.category))];
        
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
        };
        homeLi.appendChild(homeA);
        categoryList.appendChild(homeLi);

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

        document.querySelectorAll('.sidebar a').forEach(el => el.classList.remove('active'));
        homeA.classList.add('active');
        codeContainer.innerHTML = welcomeHTML;

        // 页面初始化时，读取用户上次设置的字体大小
        initFontSize();

    } catch (error) {
        codeContainer.innerHTML = `<p style="color:red; text-align:center; margin-top:20vh;">加载失败：${error.message}</p>`;
    }
}

// ---- 新增：字体大小控制逻辑 ----
let currentFontSize = 100; // 默认百分比

function initFontSize() {
    // 从本地存储读取
    const savedSize = localStorage.getItem('fontSize');
    if (savedSize) {
        currentFontSize = parseInt(savedSize);
        document.documentElement.style.fontSize = currentFontSize + '%';
    }
}

function changeFontSize(delta) {
    currentFontSize += delta * 10; // 每次增减 10%
    
    // 限制在 70% 到 150% 之间
    if (currentFontSize < 70) currentFontSize = 70;
    if (currentFontSize > 150) currentFontSize = 150;

    // 应用到整个网页的根元素 (rem 会随之缩放)
    document.documentElement.style.fontSize = currentFontSize + '%';
    
    // 保存到本地存储
    localStorage.setItem('fontSize', currentFontSize);
}
// ------------------------------

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
                <pre><code>${escapeHTML(item.code)}</code></pre>
            </div>
        `;
    });
    
    codeContainer.innerHTML = html;
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

init();
