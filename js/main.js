const categoryList = document.getElementById('category-list');
const codeContainer = document.getElementById('code-container');
const searchInput = document.getElementById('search-input');

let allData = []; // 存所有数据

// 初始化页面
async function init() {
    try {
        codeContainer.innerHTML = '<p style="text-align:center; color:#888;">加载数据中...</p>';
        
        // 加载唯一的 all.json
        const response = await fetch('data/all.json');
        if (!response.ok) throw new Error('网络错误或 all.json 文件不存在');
        
        allData = await response.json();
        
        // 提取所有不重复的目录名
        const categories = [...new Set(allData.map(item => item.category))];
        
        // 初始化左侧菜单
        categories.forEach((catName, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = catName;
            
            // 默认选中第一个
            if (index === 0) a.classList.add('active');
            
            a.onclick = (e) => {
                e.preventDefault();
                document.querySelectorAll('.sidebar a').forEach(el => el.classList.remove('active'));
                a.classList.add('active');
                searchInput.value = ''; // 清空搜索框
                renderCategory(catName);
            };
            li.appendChild(a);
            categoryList.appendChild(li);
        });

        // 渲染第一个分类
        if (categories.length > 0) {
            renderCategory(categories[0]);
        }

    } catch (error) {
        codeContainer.innerHTML = `<p style="color:red;">加载失败：${error.message}</p>`;
    }
}

// 渲染某个分类下的所有代码
function renderCategory(catName) {
    const filtered = allData.filter(item => item.category === catName);
    renderData(filtered);
}

// 全局搜索（跨所有分类）
function filterCards() {
    const keyword = searchInput.value.toLowerCase().trim();
    
    if (keyword === '') {
        // 如果清空搜索，回到当前选中的分类
        const activeA = document.querySelector('.sidebar a.active');
        if (activeA) renderCategory(activeA.textContent);
        return;
    }

    // 搜索匹配项
    const matched = allData.filter(item => {
        return item.title.toLowerCase().includes(keyword) || 
               item.description.toLowerCase().includes(keyword) ||
               item.code.toLowerCase().includes(keyword) ||
               item.category.toLowerCase().includes(keyword);
    });

    // 给搜出来的结果加上分类前缀
    matched.forEach(item => {
        item.displayTitle = `[${item.category}] ${item.title}`;
    });

    renderData(matched);
}

// 把数组渲染成 HTML
function renderData(dataArray) {
    if (dataArray.length === 0) {
        codeContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top: 2rem;">未找到匹配的算法模板 🔍</p>';
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
    
    // 回到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 防止 XSS 攻击的转义
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            "'": '&#39;', '"': '&quot;'
        }[tag] || tag)
    );
}

// 启动
init();
