// 配置所有分类及对应的 JSON 文件
const dataSources = [
    { id: 'basic', name: '📘 基础与高精度', file: 'data/basic.json' },
    { id: 'ds', name: '🌲 数据结构', file: 'data/ds.json' },
    { id: 'graph', name: '🕸️ 图论与树', file: 'data/graph.json' },
    { id: 'dp', name: '🧩 动态规划', file: 'data/dp.json' }
];

const categoryList = document.getElementById('category-list');
const codeContainer = document.getElementById('code-container');
const searchInput = document.getElementById('search-input');

// 保存当前分类的所有数据，用于搜索过滤
let currentData = [];

// 初始化侧边栏
function initSidebar() {
    dataSources.forEach(source => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = source.name;
        a.dataset.id = source.id;
        a.onclick = (e) => {
            e.preventDefault();
            // 切换高亮
            document.querySelectorAll('.sidebar a').forEach(el => el.classList.remove('active'));
            a.classList.add('active');
            // 切换分类时，清空搜索框
            searchInput.value = ''; 
            // 加载内容
            loadContent(source.file);
        };
        li.appendChild(a);
        categoryList.appendChild(li);
    });
}

// 加载并渲染代码内容
async function loadContent(file) {
    try {
        codeContainer.innerHTML = '<p style="text-align:center; color:#888;">加载中...</p>';
        
        const response = await fetch(file);
        if (!response.ok) throw new Error('网络错误或文件不存在');
        
        currentData = await response.json();
        
        if (currentData.length === 0) {
            codeContainer.innerHTML = '<p>该分类下暂无代码。</p>';
            return;
        }

        // 初次渲染全部数据
        renderData(currentData);
        
    } catch (error) {
        codeContainer.innerHTML = `<p style="color:red;">加载失败：${error.message}。请检查你的文件是否存在或路径是否正确。</p>`;
    }
}

// 将数据渲染成 HTML
function renderData(dataArray) {
    if (dataArray.length === 0) {
        codeContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top: 2rem;">未找到匹配的算法模板 🔍</p>';
        return;
    }

    let html = '';
    dataArray.forEach(item => {
        html += `
            <div class="code-section">
                <h3>${item.title}</h3>
                <div class="desc">${item.description}</div>
                <pre><code>${escapeHTML(item.code)}</code></pre>
            </div>
        `;
    });
    
    codeContainer.innerHTML = html;
    // 每次渲染完，滚动回最顶部
    codeContainer.scrollTop = 0;
}

// 搜索过滤逻辑
function filterCards() {
    const keyword = searchInput.value.toLowerCase().trim();
    
    // 如果搜索框为空，显示当前分类的所有内容
    if (keyword === '') {
        renderData(currentData);
        return;
    }

    // 过滤标题或描述包含关键词的内容
    const filteredData = currentData.filter(item => {
        return item.title.toLowerCase().includes(keyword) || 
               item.description.toLowerCase().includes(keyword) ||
               item.code.toLowerCase().includes(keyword); // 支持在代码内容中搜索
    });

    renderData(filteredData);
}

// 防止 XSS 并保留代码格式
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// 启动
initSidebar();
