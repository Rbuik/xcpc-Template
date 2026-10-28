<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的算法模板库</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <h1>💻 ACM / OI 算法模板库</h1>
        <p>专为个人复习与比赛准备 | C++ 代码风格</p>
    </header>

    <!-- 字体大小调节面板 -->
    <div class="font-controls">
        <button onclick="changeFontSize(-1)">A-</button>
        <button onclick="changeFontSize(1)">A+</button>
    </div>

    <div class="container">
        <!-- 左侧导航 -->
        <aside class="sidebar">
            <h2>📚 目录分类</h2>
            <div class="search-box">
                <input type="text" id="search-input" placeholder="🔍 全局搜索..." oninput="filterCards()">
            </div>
            <ul id="category-list"></ul>
        </aside>

        <!-- 右侧代码区 -->
        <main class="content" id="code-container"></main>
    </div>

    <!-- 这里就是你需要改的地方 -->
    <script src="javascript/main.js"></script>
</body>
</html>
