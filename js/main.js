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

let currentData = [];
// 用于缓存所有加载过的数据，方便全局搜索
let allDataCache = {}; 

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
            document.querySelectorAll('.sidebar a').forEach(el => el.classList.remove('active'));
            a.classList.add('active');
            searchInput.value = ''; // 切换分类时清空搜索框
            loadContent(source.file);
        };
        li.appendChild(a);
        categoryList.appendChild(li);
    });
}

// 加载并渲染单个分类的内容
async function loadContent(file) {
    try {
        // 如果缓存里有，直接用缓存
        if (allDataCache[file]) {
            currentData = allDataCache[file];
            renderData(currentData);
            return;
        }

        codeContainer.innerHTML = '<p style="text-align:center; color:#888;">加载中...</p>';
        const response = await fetch(file);
        if (!response.ok) throw new Error('网络错误或文件不存在');
        
        currentData = await response.json();
        allDataCache[file] = currentData; // 存入缓存
        
        renderData(currentData);
        
    } catch (error) {
        codeContainer.innerHTML = `<p style="color:red;">加载失败：${error.message}。请检查文件路径是否正确。</p>`;
    }
}

// 全局搜索逻辑
async function filterCards() {
    const keyword = searchInput.value.toLowerCase().trim();
    
    // 如果搜索框为空，显示当前分类的数据
    if (keyword === '') {
        renderData(currentData);
        return;
    }

    codeContainer.innerHTML = '<p style="text-align:center; color:#888;">全局搜索中...</p>';

    let searchResults = [];

    // 遍历所有的分类文件
    for (let source of dataSources) {
        try {
            let fileData = allDataCache[source.file];
            
            // 如果还没下载过这个文件，先下载
            if (!fileData) {
                const response = await fetch(source.file);
                if (response.ok) {
                    fileData = await response.json();
                    allDataCache[source.file] = fileData;
                }
            }

            // 在数据中匹配标题、描述或代码内容
            if (fileData) {
                const matched = fileData.filter(item => {
                    return item.title.toLowerCase().includes(keyword) || 
                           item.description.toLowerCase().includes(keyword) ||
                           item.code.toLowerCase().includes(keyword);
                });
                
                // 给匹配的结果加上分类前缀，例如 [数据结构] 树状数组
                matched.forEach(item => {
                    item.title = `[${source.name.split(' ')[1]}] ${item.title}`;
                });

                searchResults = searchResults.concat(matched);
            }
        } catch (e) {
            console.error("搜索出错:", e);
        }
    }

    renderData(searchResults);
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
    
    // 平滑回到网页顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
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
