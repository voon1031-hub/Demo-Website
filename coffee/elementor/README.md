# 叻山咖啡 Lat Hill：导入 WordPress + Elementor

这个文件夹是网站的 Elementor 模板，中文、英文各一套。导入以后，页面上的文字、图片、视频、按钮都可以在 Elementor 里直接拖拽修改。模板只用了 **Elementor 免费版**的组件，装 Elementor Pro 也一样能用。

| 文件 | 内容 |
| --- | --- |
| `lathill-elementor-zh.zip` | 中文 6 个模板（页首、页尾、首页、关于我们、咖啡豆与服务、联系我们），一次导入 |
| `lathill-elementor-en.zip` | 英文 6 个模板 |
| `zh/`、`en/` | 同样的模板，单个 JSON 文件 |
| `additional.css` | 补充样式（可选，建议加） |

模板由 `coffee/tools/build_elementor.py` 根据 `coffee/tools/content.py` 生成。以后改文案，可以直接在 Elementor 里改；如果想中英文和静态网站一起改，就改 `content.py` 再重新生成（见最后一节）。

> 这些模板没办法在我这边的环境里实际导入测试，结构已经逐项检查过。导入后如果个别间距、字号和静态网站不完全一样，直接在 Elementor 里微调即可。

---

## 1. 安装主题和插件

| 插件 / 主题 | 用途 | 费用 |
| --- | --- | --- |
| **Hello Elementor**（主题） | 最干净的 Elementor 主题，不会和模板样式冲突 | 免费 |
| **Elementor** | 页面编辑器 | 免费 |
| **Ultimate Addons for Elementor**（原名 Elementor Header & Footer Builder） | 用 Elementor 做全站页首、页尾（没有 Pro 时需要） | 免费 |
| **Polylang** | 中英双语，页首放语言切换 | 免费 |
| **WPForms Lite** | 联系表单 | 免费 |

装好后检查：**Elementor → Settings → Features → Flexbox Container** 设为 **Active**（新网站默认就是开启的）。模板是用 Container 搭的，没开启会导入失败。

## 2. 上传视频和图片

模板里的视频和图片都指向 `/wp-content/uploads/lathill/` 这个文件夹。用主机的 **File Manager** 或 FTP 建好这个文件夹，把下面两个文件夹里的**所有文件**上传进去：

- `coffee/assets/media/`：首屏视频、4 段区块短片和它们的封面图（`.mp4`、`.jpg`）
- `coffee/assets/img/`：Logo 和 10 款咖啡袋图片（`.png`）

想用别的位置（比如直接传到媒体库），可以用新地址重新生成模板：

```bash
python3 coffee/tools/build_elementor.py --media-base https://你的网址/wp-content/uploads/2026/10/
```

## 3. 导入模板

**Elementor → Templates（模板）→ Saved Templates → Import Templates**，先选 `lathill-elementor-zh.zip`，再导入 `lathill-elementor-en.zip`。导入后会看到 12 个模板，名字都以“叻山”或“Lat Hill”开头。

## 4. 设置双语（Polylang）

1. **Languages** 里先加 **中文（简体）**，设为默认语言，再加 **English**。
2. **Languages → Settings → URL modifications** 选 *The language is set from the directory name in pretty permalinks*，并勾选 *Hide URL language information for default language*。设好后，中文页面在 `/about/`，英文页面在 `/en/about-us/`。

## 5. 建页面并插入模板

先建 4 个中文页面，地址（slug）要和模板里的链接一致：

| 页面 | 中文 slug | 插入模板 | 英文 slug | 插入模板 |
| --- | --- | --- | --- | --- |
| 首页 | `home`（在 Settings → Reading 设为首页） | 叻山 首页 | `home-en` | Lat Hill Home |
| 关于我们 | `about` | 叻山 关于我们 | `about-us` | Lat Hill About |
| 咖啡豆与服务 | `coffee` | 叻山 咖啡豆与服务 | `our-coffee` | Lat Hill Coffee & Services |
| 联系我们 | `contact` | 叻山 联系我们 | `contact-us` | Lat Hill Contact |

每个页面的做法：

1. 点 **Edit with Elementor**。
2. 左下角齿轮 **Page Settings → Page Layout** 选 **Elementor Full Width**，并打开 **Hide Title**。
3. 点画布中间的文件夹图标 **Add Template → My Templates**，插入对应的模板，然后 **Publish**。

英文页面：在 **Pages** 列表里，点中文页面旁边 English 一栏的 **+**，就会建好对应的翻译页面，再按同样的步骤插入英文模板。

> Polylang 免费版要求中英文页面的 slug 不能相同，所以英文用了 `about-us`、`our-coffee` 这类不同的地址。想改地址的话，先改 `build_elementor.py` 开头的 `URLS`，再重新生成模板。

## 6. 页首和页尾

**没有 Elementor Pro（用 Ultimate Addons 插件）：**

1. **Appearance → Elementor Header & Footer Builder → Add New**，Type 选 **Header**。
2. **Display On** 选 *Specific Pages / Posts / Taxonomies*，把 4 个中文页面都选上。
3. **Edit with Elementor**，插入模板 **叻山 页首**，发布。
4. 再建一个 Header，Display On 选 4 个英文页面，插入 **Lat Hill Header**。
5. 页尾同样建两个（Type 选 **Footer**），分别插入 **叻山 页尾** 和 **Lat Hill Footer**。

**有 Elementor Pro：** 在 **Templates → Theme Builder** 建 Header、Footer，插入上面的模板，显示条件同样按中文页面、英文页面分开设置。Pro 的 Nav Menu 组件还能在手机上显示汉堡菜单，可以替换掉页首里的文字导航。

页首的 **EN / 中文** 按钮会跳到另一种语言的首页。想切换到“同一页的另一种语言”，可以装免费插件 **Connect Polylang for Elementor**，用它的语言切换组件替换这个按钮。

## 7. 联系表单（WPForms）

在 **WPForms → Add New** 建一个表单，建议字段（和静态网站一致）：

1. 称呼 / Name（必填）
2. 手机或邮箱 / Phone or email（必填）
3. 想咨询什么 / Topic（单选：预约下一炉、订购咖啡豆、订阅方案、咖啡馆批发、企业礼盒、线上手冲课、其他）
4. 配送地区 / Delivery area（下拉：西马、东马）
5. 研磨方式 / Grind（下拉：整豆、手冲、意式、法压壶、摩卡壶、Phin 滴滤）
6. 留言 / Message（必填）

保存后记下表单 ID，打开“联系我们”页面，在 **预约与咨询** 卡片里点 Shortcode 组件，把 `[wpforms id="123" title="false"]` 里的 `123` 换成你的表单 ID。英文页面再建一个英文表单，同样替换。

## 8. 补充样式

把 `additional.css` 的内容贴到 **Appearance → Customize → Additional CSS**。作用：

- 中文标题在标点处换行
- 视频圆角
- 表格样式
- 表单配色

## 9. 上线前要换掉的内容

- **WhatsApp 号码**：模板里是示例号码 `60123456789`。可以用 **Elementor → Tools → Replace URL**，把 `https://wa.me/60123456789` 换成 `https://wa.me/你的号码`（马来西亚号码去掉开头的 0，加 60）。
- **邮箱、社交媒体链接**：页尾里的 Instagram、Facebook、TikTok、小红书链接目前都是 `#`。
- **评价、团队成员、数字**：都是示例内容，换成真实的。
- **视频**：是 AI 生成的示意视频，页尾有一行说明。换成真实拍摄的视频以后，可以把那行删掉。

## 10. 能改什么、怎么改

- **文字、图片、按钮、颜色、间距**：都在 Elementor 里点选修改。
- **视频**：选中视频组件或容器的 Background → Video，换成新的 `.mp4` 地址。手机上不想播放背景视频以省流量，就关掉 **Play On Mobile**。
- **烘焙曲线**（首页深色区块）：是一个 HTML 组件，所有代码都在里面。风味文字要改代码，或者改 `content.py` 后重新生成。

重新生成模板：

```bash
python3 coffee/tools/build_site.py        # 静态网站 + 咖啡袋图片页
node coffee/tools/render-images.js        # Logo 和咖啡袋 PNG（需要 Node 和 Playwright）
python3 coffee/tools/build_elementor.py   # Elementor 模板
```

重新生成后要再导入一次。已经插入页面的旧内容不会自动更新。
