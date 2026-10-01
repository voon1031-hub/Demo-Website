# NEON.STUDIO — AI 视频作品集网站

暗黑科技风格的个人 / 视频作品展示网站，用于展示 Higgsfield 等 AI 工具生成的视频。
纯 HTML + CSS + JavaScript，无需任何构建工具或依赖。

## 功能

- **炫酷首页**：粒子网络动画（鼠标互动）、透视网格、故障风标题、打字机效果、数字滚动统计
- **视频作品专区**：按分类自动生成筛选按钮、悬停静音预览、全屏弹窗播放（支持 ← → 切换、Esc 关闭）
- **关于 / 联系**：3D 全息名片、技能列表、联系方式
- 响应式布局（手机 / 平板 / 桌面），支持「减少动态效果」系统设置

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

也可以直接双击 `index.html` 打开。

## 添加 Higgsfield 视频

1. 把视频（推荐 `.mp4`，H.264 编码）放进 `assets/videos/`
2. （可选）把封面图放进 `assets/posters/`
3. 编辑 `js/videos.js`，在 `VIDEOS` 数组中修改或新增一项：

```js
{
  title: "霓虹都市 · Neon City",
  description: "赛博朋克夜景中的雨夜追逐。",
  src: "assets/videos/neon-city.mp4",
  poster: "assets/posters/neon-city.jpg", // 可选
  category: "赛博朋克",                     // 自动生成筛选标签
  duration: "0:15",
  date: "2026.09",
  tool: "Higgsfield",
  featured: true,                           // 可选：大卡片突出展示
},
```

`src` 留空时会显示「COMING SOON」占位卡片。

> 提示：GitHub 单文件上限 100MB。视频较多或较大时，建议把视频放到 CDN / 对象存储，
> 然后在 `src` 中填写完整网址。

## 个性化

- 名字、简介、技能：`index.html` 中的「关于」区块
- 邮箱与社交链接：`index.html` 中的「联系」区块
- 首页打字机文字：`js/main.js` 中的 `phrases`
- 主题色：`css/style.css` 顶部的 `--cyan` / `--violet` / `--magenta`

## 部署

推荐 GitHub Pages：仓库 Settings → Pages → 选择分支和根目录即可。
Vercel / Netlify 也可直接导入，无需构建命令。

## 目录结构

```
index.html          页面结构
css/style.css       样式
js/videos.js        视频作品数据（主要修改这里）
js/main.js          交互逻辑
assets/videos/      视频文件
assets/posters/     封面图
```
