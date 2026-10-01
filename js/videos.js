/**
 * ============================================================
 *  视频作品配置文件 —— 以后只需要修改这里即可添加 / 删除作品
 * ============================================================
 *
 *  添加 Higgsfield 视频的步骤：
 *    1. 把视频文件（推荐 .mp4，H.264 编码）放到  assets/videos/
 *    2. （可选）把封面图放到                      assets/posters/
 *       没有封面时，会自动显示视频第一帧或渐变占位图
 *    3. 在下面的 VIDEOS 数组中新增一项
 *
 *  字段说明：
 *    title       标题（必填）
 *    description 简介
 *    src         视频路径，例如 "assets/videos/neon-city.mp4"
 *                留空 "" 时显示「即将上线」占位卡片
 *    poster      封面图路径（可选）
 *    category    分类，会自动生成顶部筛选按钮
 *    duration    时长文字，例如 "0:12"
 *    date        日期文字
 *    tool        生成工具，默认 "Higgsfield"
 *    featured    true 时卡片在网格中占两列，突出展示
 */
window.VIDEOS = [
  {
    title: "霓虹都市 · Neon City",
    description: "赛博朋克夜景中的雨夜追逐，镜头穿梭于全息广告牌之间。",
    src: "",
    poster: "",
    category: "赛博朋克",
    duration: "0:15",
    date: "2026.09",
    tool: "Higgsfield",
    featured: true,
  },
  {
    title: "数字之海 · Digital Ocean",
    description: "由粒子构成的海浪，在虚拟日落下缓缓翻涌。",
    src: "",
    poster: "",
    category: "抽象艺术",
    duration: "0:10",
    date: "2026.09",
    tool: "Higgsfield",
  },
  {
    title: "机械之心 · Mecha Heart",
    description: "微距镜头下机械心脏的精密运转，金属与光的交响。",
    src: "",
    poster: "",
    category: "科幻",
    duration: "0:08",
    date: "2026.08",
    tool: "Higgsfield",
  },
  {
    title: "星际漫游 · Starwalker",
    description: "宇航员漂浮于星云之间，一镜到底的史诗感。",
    src: "",
    poster: "",
    category: "科幻",
    duration: "0:12",
    date: "2026.08",
    tool: "Higgsfield",
  },
  {
    title: "流光人像 · Prism Portrait",
    description: "光谱折射下的人物肖像，动态光影随呼吸流转。",
    src: "",
    poster: "",
    category: "人像",
    duration: "0:06",
    date: "2026.07",
    tool: "Higgsfield",
  },
  {
    title: "液态金属 · Liquid Chrome",
    description: "镀铬液体的变形与重组，适用于品牌开场动画。",
    src: "",
    poster: "",
    category: "抽象艺术",
    duration: "0:09",
    date: "2026.07",
    tool: "Higgsfield",
    featured: true,
  },
];
