<script>
import { loadLocal, getStore, subscribe } from '@/store/index.js'

/**
 * 应用入口：启动时加载本地持久化数据并恢复登录状态、主题等。
 * 兼容 uniapp-x 的 app-plus / mp-weixin / h5 端。
 */
export default {
  onLaunch(options = {}) {
    console.log('[App] onLaunch', options)
    // 1. 恢复本地登录态与业务数据
    try {
      loadLocal()
    } catch (e) {
      console.error('[App] 本地数据加载失败', e)
    }

    // 2. 主题设置：古风浅色主题
    this.applyTheme()

    // 3. app-plus / h5 状态栏颜色（uniapp-x 使用 css 变量更稳）
    if (typeof uni.setNavigationBarColor === 'function') {
      try {
        uni.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#8B4513',
          animation: { duration: 300, timingFunc: 'easeIn' }
        })
      } catch (e) { /* ignore */ }
    }

    // 4. 首次启动提示
    const s = getStore()
    console.log('[App] 当前用户', s.isLoggedIn ? '已登录' : '未登录', '家庭数:', s.families.length)

    // 5. 订阅：用于调试（上线前可去掉）
    if (process.env.NODE_ENV !== 'production') {
      this._unsub = subscribe((store) => {
        console.log('[Store] update', {
          families: store.families.length,
          devices: store.devices.length,
          scenes: store.scenes.length
        })
      })
    }
  },
  onShow(options = {}) {
    console.log('[App] onShow')
    // 回到前台时再加载一次，解决小程序/APP 切后台缓存问题
    try { loadLocal() } catch (e) {}
  },
  onHide() {
    console.log('[App] onHide')
  },
  onError(err) {
    console.error('[App] onError', err)
  },
  onPageNotFound({ path }) {
    console.warn('[App] 页面不存在:', path)
    uni.showToast({ title: '页面不存在', icon: 'none' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 800)
  },
  methods: {
    applyTheme() {
      // 保存主题到本地，方便多主题扩展（未来可支持夜间古风主题）
      const theme = uni.getStorageSync('theme') || 'classic'
      uni.setStorageSync('theme', theme)
    }
  }
}
</script>

<style>
/* ===== 全局样式：古风诗意主题 ===== */
page {
  background-color: #FFFAF0;
  background-image: linear-gradient(180deg, #FFFAF0 0%, #FFF8DC 100%);
  font-family: "STKaiti", "KaiTi", "SimSun", "Songti SC", "Noto Serif SC", serif;
  color: #2F1810;
  min-height: 100%;
}

view, text, input, textarea, button, picker, switch, slider {
  box-sizing: border-box;
}

/* 全局古风主题色变量（H5 和支持 CSS 变量的端生效） */
:root {
  --primary-color: #8B4513;
  --primary-light: #DEB887;
  --primary-dark: #654321;
  --accent-color: #CD853F;
  --bg-color: #FFFAF0;
  --bg-card: #FFF8DC;
  --bg-card-alt: #FFFAF0;
  --text-color: #2F1810;
  --text-secondary: #8B7355;
  --text-muted: #A5937A;
  --border-color: #D2B48C;
  --border-light: #F5E6C8;
  --success-color: #228B22;
  --warning-color: #DAA520;
  --danger-color: #B22222;
  --shadow-card: 0 6rpx 24rpx rgba(139, 69, 19, 0.10);
  --shadow-soft: 0 2rpx 12rpx rgba(139, 69, 19, 0.08);
}

/* 通用文字截断 */
.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 通用按钮样式（所有页面可复用） */
.btn-primary {
  background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
  color: #FFFAF0;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-ghost {
  background: #FFFAF0;
  color: #8B4513;
  border: 2rpx solid #D2B48C;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 卡片公共样式 */
.card {
  background: #FFF8DC;
  border: 2rpx solid #D2B48C;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: var(--shadow-card);
}

/* 空状态公共样式 */
.empty-state {
  background: #FFF8DC;
  border: 2rpx dashed #D2B48C;
  border-radius: 20rpx;
  padding: 60rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 通用分割线 */
.divider {
  height: 1rpx;
  background: #D2B48C;
  margin: 20rpx 0;
  opacity: 0.6;
}

/* 避免 scroll-view 默认行为在小程序端滚动条影响视觉 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}
</style>
