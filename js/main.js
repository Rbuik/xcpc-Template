const categoryList = document.getElementById('category-list');
const codeContainer = document.getElementById('code-container');
const searchInput = document.getElementById('search-input');

let allData = [];

// 欢迎首页的 HTML
const welcomeHTML = `
    <div class="welcome">
        <h2>👋 欢迎使用算法模板库</h2>
        <p>请在左侧选择分类，或在顶部搜索框中搜索算法关键字。</p>
        <p>代码风格：C++17 | 使用 <code>#define int long long</code> | 空格排版对齐</p>
    </div>
`;

async function init() {
    try {
        codeContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top: 20vh;">数据加载中...</p>';
        
        const response = await fetch('data/all.json');
        if (!response.ok) throw new Error('网络错误或 all.json 文件不存在');
        
        allData = await response.json();
        
        // 提取所有不重复的目录名
        const categories = [...new Set(allData.map(item => item.category))];
        
        // 1. 在左侧最上方生成一个“首页”按钮
        const homeLi = document.createElement('li');
        const homeA = document.createElement('a');
        homeA.href = '#';
        homeA.textContent = '🏠 首页';
        homeA.classList.add('active'); // 默认选中首页
        
        homeA.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar a').forEach(el => el.classList.remove('active'));
            homeA.classList.add('active');
            searchInput.value = ''; 
            // 显示欢迎界面
            codeContainer.innerHTML = welcomeHTML;
        };
        homeLi.appendChild(homeA);
        categoryList.appendChild(homeLi);

        // 2. 生成其他分类按钮
        categories.forEach((catName, index) => {
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

        // 3. 默认显示欢迎首页（而不是直接显示第一个分类）
        codeContainer.innerHTML = welcomeHTML;

    } catch (error) {
        codeContainer.innerHTML = `<p style="color:red; text-align:center; margin-top:20vh;">加载失败：${error.message}</p>`;
    }
}

// 渲染某个分类下的所有代码
function renderCategory(catName) {
    const filtered = allData.filter(item => item.category === catName);
    renderData(filtered);
}

// 全局搜索
function filterCards() {
    const keyword = searchInput.value.toLowerCase().trim();
    
    if (keyword === '') {
        // 如果清空搜索，回到当前选中的分类或首页
        const activeA = document.querySelector('.sidebar a.active');
        if (activeA) {
            if (activeA.textContent === '🏠 首页') {
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
