# ns-smart-control · 古韵智慧，诗意生活

> 一个以 **uni-app x（Vue 3 + Vite）** 为技术栈的智能家居控制小程序 / H5 / App 项目。
> 界面采用 **古风诗意** 风格，以「檀木色 / 琥珀色 / 宣纸色」为主色调，将现代智能家居控制与东方雅致融合为一体。

![技术栈](https://img.shields.io/badge/uni--app%20x-vue3%20%2B%20vite-8B4513?style=flat-square)
![平台](https://img.shields.io/badge/跨端-H5%20%7C%20%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F%20%7C%20App%20Plus-DEB887?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3D%2016.0.0-green?style=flat-square)
![License](https://img.shields.io/badge/license-Apache%202.0-yellowgreen?style=flat-square)

---

## ✨ 项目特色

- 🏮 **古风 UI**：檀木棕、米白宣纸、楷体（STKaiti / KaiTi）字体，装饰圆圈渐变、诗意 footer、诗句文案。
- 🏡 **家庭管理**：多家庭切换、成员家长/成员双角色、8 种随机古风家庭名 + 6 种主题模板（温馨 / 书斋 / 简约 / 田园 / 明月 / 山居）。
- 📱 **11 类智能设备**：灯具 / 空调 / 窗帘 / 电视 / 音箱 / 净化器 / 洗衣机 / 冰箱 / 烤箱 / 摄像头 / 传感器，每类都有专属细粒度控制 UI。
- 🌅 **诗意场景**：晨曦初露、静夜安眠、归家模式、离家模式、观影、书斋…… 独立设备级参数预设，一键生效。
- 👨‍👩‍👧 **权限控制**：家长可添加 / 编辑 / 移除成员与设备，成员仅可控制。
- 💾 **本地持久化**：所有家庭 / 设备 / 场景 / 成员使用 uni.storage 持久化，登录态恢复。
- 🎉 **示例数据注入**：首次登录自动注入「清风明月居」示例家庭 + 4 台演示设备 + 2 个场景，可一键清空或重建。
- 📊 **数据统计**：我的页 / 家庭详情页展示在线 / 运行 / 类型分布等指标。
- 🧪 **H5 游客体验模式**：无需微信授权即可在浏览器内完整体验。

---

## 🧱 技术栈

| 类别 | 选型 |
| :-- | :-- |
| 框架 | **uni-app x**（Vue 3 + Vite） |
| 语言 | JavaScript (ES2020) |
| 状态 | 自研 `subscribe / notify` 轻量 store + localStorage 持久化 |
| 样式 | Scoped CSS + SCSS 变量（`uni.scss`） + 全局类 (App.vue) |
| 跨端 | H5 · 微信小程序 · 支付宝/百度/字节/QQ 小程序 · App-Plus（Android/iOS） |
| 编译器版本 | `@dcloudio/*: 3.0.0-5020620260917001`（编译器 5.26 vue3） |

---

## 📁 项目结构

```
ns-smart-control/
├── index.html                  # H5 入口（Vite 模式）
├── vite.config.js              # Vite + uni-app x 插件配置
├── package.json                # 依赖与构建脚本
├── manifest.json               # uni-app 应用配置（端权限、SDK、appid...）
├── pages.json                  # 页面路由 / tabBar / easycom / 调试条件
├── uni.scss                    # 全局 SCSS 变量（古风配色）
├── App.vue                     # 应用入口（全局样式、启动钩子、onPageNotFound）
├── main.js                     # JS 入口
├── src/                        # ⭐ 业务源码（uni-app x vite 模式默认读此目录）
│   ├── App.vue
│   ├── main.js
│   ├── manifest.json
│   ├── pages.json
│   ├── uni.scss
│   ├── store/
│   │   └── index.js            # 轻量发布/订阅 store + 所有业务方法
│   ├── pages/
│   │   ├── login/index.vue     # 登录（微信一键登录 / H5 游客体验）
│   │   ├── index/index.vue     # 首页（问候语 / 天气 / 一键全开全关 / 设备 / 场景）
│   │   ├── device/
│   │   │   ├── add.vue         # 添加设备（11 种默认参数预填+预览）
│   │   │   └── control.vue     # 设备控制（11 类专属控件）
│   │   ├── family/
│   │   │   ├── create.vue      # 创建家庭（6 模板 + 随机古风命名）
│   │   │   ├── detail.vue      # 家庭详情（统计条 + 8 快捷入口）
│   │   │   └── member.vue      # 家庭成员（增删改、角色、统计）
│   │   ├── scene/create.vue    # 场景创建 / 编辑（逐设备独立参数）
│   │   └── profile/index.vue   # 我的（统计、重置示例、清空数据）
│   └── static/                 # 静态资源（图片、字体等，可自行补充）
└── unpackage/                  # uni-app 构建产物（git 已忽略）
```

> 💡 注：项目根与 `src/` 下均存在 `App.vue / main.js / manifest.json / pages.json / uni.scss` 副本，
> 供旧 `vue-cli-plugin-uni` 模式与新 vite 模式兼容使用。
> 使用 `uni build` / `uni` 命令时，读取的是 **`src/` 内** 的源码与配置。

---

## 🚀 快速开始

### 环境要求

- **Node.js** `>= 16.0.0`
- **npm** `>= 8.0.0` （或 pnpm/yarn 同等能力）

### 1. 安装依赖

```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` 用于避免部分 dcloudio 包的 peer 差异（可选，但更稳）。

### 2. 本地开发

```bash
# H5 浏览器预览（默认 http://localhost:8080/）
npm run dev:h5

# 微信小程序（产物 -> unpackage/dist/dev/mp-weixin，用微信开发者工具打开）
npm run dev:mp-weixin

# App（离线打包，通常配合 HBuilderX 使用 uni-app x 的真机基座）
npm run dev:app
```

### 3. 生产构建

```bash
npm run build:h5         # H5      -> dist/build/h5
npm run build:mp-weixin  # 微信    -> unpackage/dist/build/mp-weixin
npm run build:app        # App     -> unpackage/dist/build/app
```

构建完成后终端会打印 `DONE  Build complete.`。

### 4. 浏览器体验（H5 模式）

启动 `npm run dev:h5` 后打开 http://localhost:8080/ ，选择 **🌿 游客体验模式** 即可直接进入示例家庭数据体验。

> 如 8080 被占用，Vite 会自动尝试下一个端口，以终端实际打印为准。

---

## 🎛️ 功能一览

### 🧾 11 类设备支持与专属控制

| 类型 | icon | 专属控件 |
| :-- | :-: | :-- |
| 灯具 light | 💡 | 亮度滑杆 / 冷-暖-自然 色温 |
| 空调 ac | ❄️ | 温度 ±（16–32℃）/ 制冷·制热·自动·除湿·送风 / 1–5 档风速 |
| 窗帘 curtain | 🪟 | 开合度滑杆 / 全关·半开·全开 快捷按钮 |
| 电视 tv | 📺 | 音量滑杆 / 频道切换 |
| 音箱 speaker | 🔊 | 音量 / 播放·暂停 |
| 空气净化器 air | 🌬️ | 自动·睡眠·强劲·节能 模式 / 1–5 档 |
| 洗衣机 washer | 🧺 | 标准·快洗·大件·轻柔 程序 / 剩余分钟倒计时 |
| 冰箱 fridge | 🧊 | 冷藏 1–10℃ / 冷冻 -2~-28℃ / 节能·速冷速冻 预设 |
| 烤箱 oven | 🍳 | 80–250℃ 温度 / 5–180 分钟 时间 |
| 摄像头 camera | 📷 | 模拟预览区 / 夜视·移动侦测·录制 三项开关 |
| 传感器 sensor | 📡 | 温度·湿度·PM2.5·电量 四宫格 / 数据刷新·警报切换 |

所有设备控件变更后会实时写回 store 并落盘 uni.storage。

### 🌅 诗意场景预设（创建页一键生成）

| 预设 | 图标 | 说明 |
| :-- | :-: | :-- |
| 晨曦初露 | 🌅 | 窗帘全开（卷帘 100%）、书房灯暖光、空调静音送风 |
| 静夜安眠 | 💤 | 灯关·空调 27℃ 自动·弱风、窗帘关闭、音箱关闭 |
| 归家模式 | 🏡 | 客厅灯全开、空调制冷 26℃、音箱播放轻音乐 |
| 离家模式 | 🌿 | 全设备关断、摄像头开启侦测、传感器布防 |
| 观影时光 | 🎬 | 灯光低亮度·暖色、窗帘关闭、音箱中高音量 |
| 书斋静坐 | 📚 | 书房灯高亮度自然白、空调静音、窗帘 50% 柔光 |

每个场景中每台设备都可独立精细化配置（亮度/温度/模式/开合度/音量/档位），
激活时通过 `activateScene(scene)` 一次性批量写入，并记录操作日志至每台设备（上限 50 条）。

### 👪 角色与权限

| 动作 | 家长 | 成员 |
| :-- | :-: | :-: |
| 控制设备（开/关/调节参数） | ✅ | ✅ |
| 激活场景 | ✅ | ✅ |
| 添加 / 编辑 / 移除设备 | ✅ | ❌ |
| 创建 / 编辑 / 删除场景 | ✅ | ❌ |
| 邀请 / 移除家庭成员、改角色 | ✅ | ❌ |
| 删除家庭、编辑家庭信息 | ✅ | ❌ |

---

## 🎨 设计规范

### 配色

| 用途 | 颜色 | 色值 |
| :-- | :-- | :-- |
| 主色 / 按钮 / 标题 | 檀木色 | `#8B4513` |
| 主色渐变亮部 / hover | 琥珀棕 | `#CD853F` |
| 背景渐变顶部（登录/我的） | 深檀 | `#6B4226` → `#8B4513` |
| 页面主背景 / 宣纸色 | 米白 | `#FFFAF0` |
| 卡片背景 | 淡黄卷 | `#FFF8DC` |
| 分隔线 / 描边 | 沙色 | `#D2B48C` |
| 高亮次文字 | 深褐 | `#2F1810` |
| 次文字 / 提示语 | 古铜 | `#8B7355` / `#A0826D` |
| 危险按钮（移除/清空） | 红棕 | `#B22222` |
| 成功/在线指示 | 青绿 | `#6A9955` |

> 全局变量统一在 `App.vue` `<style>` 中声明 `--color-primary`、`--shadow-card` 等 CSS 变量，
> 同时在 `uni.scss` 以 SCSS 形式备份，方便编译端各取所需。

### 字体与字号

- 字体族：`"STKaiti", "KaiTi", "SimSun", serif`
- 页面标题：`36–48rpx` / bold
- 区块标题：`28–32rpx` / bold
- 正文内容：`26–28rpx` / regular
- 辅助说明：`22–24rpx` / regular

### 圆角 / 阴影

- 卡片圆角：`20–30rpx`
- 按钮圆角：`48–50rpx`（胶囊）
- 全局卡片阴影：`0 4rpx 20rpx rgba(139, 69, 19, 0.08)`（`.card` 公共类）

---

## 🧠 Store 核心方法

状态管理实现于 `src/store/index.js`，采用「**单例对象 + 发布/订阅 + storage 持久化**」轻量模式，
无需额外 Pinia/Vuex 依赖，兼容所有端。

常用方法一览（均已命名导出）：

| 方法 | 说明 |
| :-- | :-- |
| `login({ id, nickname, avatar, wxCode })` | 登录并按需注入示例数据 |
| `logout()` | 登出并清空所有业务数据 |
| `loadLocal()` / `loadAppData()` | 从 storage 恢复登录态与业务数据 |
| `subscribe(fn)` | 订阅 store 变更，返回 **取消订阅函数**（首次订阅立即回调） |
| `addFamily / updateFamily / removeFamily` | 家庭增删改 |
| `setCurrentFamily(id)` / `getCurrentFamily()` | 当前家庭切换与查询 |
| `addDevice / updateDevice / removeDevice` | 设备增删改 |
| `toggleDevicePower(id)` / `powerOffAllDevices()` | 单机开关 / 一键全关 |
| `batchUpdateDevices(ids[], patch)` 或 `list[{deviceId,data,action}]` | 批量更新（两种重载） |
| `getDeviceIcon(type)` / `getDeviceTypeName(type)` | 类型 → 图标 / 中文名 |
| `getDeviceDefaultConfig(type)` | 获取某类型设备全套默认参数 |
| `addScene / updateScene / removeScene` | 场景增删改 |
| `activateScene(scene)` | 激活场景，批量应用设备配置并记日志 |
| `addMember / updateMember / removeMember` | 家庭成员增删改 |
| `getCurrentUserRole()` | 当前用户在当前家庭的角色（家长/成员） |
| `requireLogin()` | 登录守卫，未登录自动跳到登录页并返回 false |
| `seedDemoData()` / `reSeedDemoData()` / `resetDemoData()` / `hasDemoData()` | 示例数据管理（我的页使用） |

---

## 🛠️ 多端注意事项

### H5
- 由于浏览器环境无法执行 `uni.login({provider:'weixin'})`，请使用登录页「🌿 游客体验模式」进入系统。
- H5 路由使用 hash 模式，路径形如 `#/pages/index/index`。

### 微信小程序
- `manifest.json` 中 `mp-weixin.lazyCodeLoading = 'requiredComponents'`，提升首屏性能。
- 编译产物位于 `unpackage/dist/dev/mp-weixin`，用微信开发者工具打开该目录即可预览。
- 真机可按微信规则配置蓝牙/后台定位/摄像头等权限（已在 manifest 中声明模板字段，按需替换 appid）。

### App（uni-app x / App-Plus）
- `manifest.json -> app-plus` 已声明常见模块与权限（蓝牙、定位、相机、存储、网络状态…），
  打包时请使用 **HBuilderX 正式版 4.0+** 并配合 uni-app x 专用基座。
- ABI 已配置为 `armeabi-v7a, arm64-v8a, x86`，可按需要裁剪以缩小包体积。

---

## 🧹 .gitignore 已忽略内容

`node_modules/`、`unpackage/`、`dist/`、`.uni*/`、`.hbuilderx/`、`.vscode/`（保留推荐配置）、
`.env*`、各平台独立编译目录、`.DS_Store`、日志与临时文件等均已忽略。
详情见根目录 `.gitignore`。

---

## 🗺️ 后续可以扩展

- [ ] 定时触发：场景 + cron（早晨 7 点「晨曦初露」自动生效）
- [ ] 设备日志可视化：控制页底部时间轴/日历筛选
- [ ] 多用户云同步：接入 uniCloud 或后端服务，本地 → 云端双向同步
- [ ] 语音控制：对接 uni-voice / 第三方 TTS&ASR SDK
- [ ] tabBar 图标：补充 `static/tab/*.png` 并在 `pages.json` 恢复 iconPath
- [ ] 深色模式：在 App.vue 增加 `prefers-color-scheme` 古风水墨黑主题

---

## 📜 License

Apache License 2.0 © ns-smart-control contributors
