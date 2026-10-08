<template>
  <view class="profile-container">
    <view class="nav-bar">
      <text class="nav-title">我的</text>
    </view>

    <view class="content">
      <view class="user-card" @tap="editProfile">
        <view class="user-avatar">
          <image
            v-if="avatar"
            class="avatar-img"
            :src="avatar"
            mode="aspectFill"
          ></image>
          <text v-else class="avatar-text">{{ nickname ? nickname[0] : '?' }}</text>
        </view>
        <view class="user-info">
          <text class="user-name">{{ nickname }}</text>
          <text class="user-desc">微信号: {{ wxId }}</text>
          <text class="user-role">当前家庭身份：{{ currentRole }}</text>
        </view>
        <text class="edit-arrow">→</text>
      </view>

      <view class="stats-card">
        <view class="stat-item">
          <text class="stat-value">{{ familyCount }}</text>
          <text class="stat-label">家庭</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ deviceCount }}</text>
          <text class="stat-label">设备</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ sceneCount }}</text>
          <text class="stat-label">场景</text>
        </view>
      </view>

      <view class="menu-section">
        <view class="menu-card">
          <view class="menu-item" @tap="goToMyFamily">
            <view class="menu-icon">🏠</view>
            <text class="menu-text">我的家庭</text>
            <text class="menu-arrow">→</text>
          </view>
          <view class="menu-item" @tap="goToHelp">
            <view class="menu-icon">📖</view>
            <text class="menu-text">帮助中心</text>
            <text class="menu-arrow">→</text>
          </view>
          <view class="menu-item" @tap="goToAbout">
            <view class="menu-icon">ℹ️</view>
            <text class="menu-text">关于我们</text>
            <text class="menu-arrow">→</text>
          </view>
        </view>

        <view class="menu-card">
          <view class="menu-item" @tap="showStatistics">
            <view class="menu-icon">📊</view>
            <text class="menu-text">数据统计</text>
            <text class="menu-arrow">→</text>
          </view>
          <view class="menu-item" @tap="handleReSeedDemo">
            <view class="menu-icon">🪴</view>
            <text class="menu-text">{{ hasDemo ? '重置示例数据' : '生成示例数据' }}</text>
            <text class="menu-arrow">→</text>
          </view>
          <view class="menu-item danger" @tap="handleClearData">
            <view class="menu-icon">🧹</view>
            <text class="menu-text">清空所有数据</text>
            <text class="menu-arrow">→</text>
          </view>
        </view>
      </view>

      <view class="logout-btn" @tap="handleLogout">
        <text class="logout-text">退出登录</text>
      </view>

      <view class="version-text">
        <text>版本 1.0.0</text>
      </view>
    </view>
  </view>
</template>

<script>
import { loadLocal, getStore, login as storeLogin, logout as storeLogout, requireLogin, getCurrentUserRole, resetDemoData, reSeedDemoData, hasDemoData } from '@/store/index.js'

export default {
  data() {
    return {
      nickname: '未登录',
      avatar: '',
      wxId: '',
      familyCount: 0,
      deviceCount: 0,
      sceneCount: 0,
      currentRole: '家长'
    }
  },
  computed: {
    hasDemo() { return hasDemoData() }
  },
  onShow() {
    if (!requireLogin()) return
    this.refreshData()
  },
  methods: {
    refreshData() {
      loadLocal()
      const s = getStore()
      const userInfo = uni.getStorageSync('userInfo') || {}
      this.nickname = userInfo.nickname || s.userInfo.nickname || '未登录'
      this.avatar = userInfo.avatar || s.userInfo.avatar || ''
      this.wxId = (userInfo.id || s.userInfo.id || '').substring(0, 12)
      this.familyCount = s.families.length
      const familyId = s.currentFamilyId
      this.deviceCount = familyId ? s.devices.filter(d => d.familyId === familyId).length : s.devices.length
      this.sceneCount = familyId ? s.scenes.filter(sc => sc.familyId === familyId).length : s.scenes.length
      this.currentRole = getCurrentUserRole()
    },
    editProfile() {
      uni.showModal({
        title: '编辑昵称',
        editable: true,
        placeholderText: this.nickname,
        confirmColor: '#8B4513',
        success: (res) => {
          if (res.confirm && res.content) {
            const s = getStore()
            storeLogin({ ...s.userInfo, nickname: res.content.trim() })
            this.refreshData()
            uni.showToast({ title: '修改成功', icon: 'success' })
          }
        }
      })
    },
    goToMyFamily() {
      uni.switchTab({ url: '/pages/family/detail' })
    },
    goToHelp() {
      uni.showModal({
        title: '帮助中心',
        content: '如需帮助请联系客服：navysummer@yeah.net',
        showCancel: false,
        confirmColor: '#8B4513'
      })
    },
    goToAbout() {
      uni.showModal({
        title: '关于我们',
        content: '智能家居控制系统 v1.0.0\n古韵智慧，诗意生活',
        showCancel: false,
        confirmColor: '#8B4513'
      })
    },
    handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        confirmColor: '#8B4513',
        success: (res) => {
          if (res.confirm) {
            storeLogout()
            uni.showToast({ title: '已退出', icon: 'success' })
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/login/index' })
            }, 1500)
          }
        }
      })
    },
    showStatistics() {
      const s = getStore()
      const total = s.devices.length
      const online = s.devices.filter(d => d.isOnline).length
      const powered = s.devices.filter(d => d.isPowerOn).length
      const types = {}
      s.devices.forEach(d => { types[d.type] = (types[d.type] || 0) + 1 })
      const typeStr = Object.keys(types).length
        ? Object.entries(types).map(([k, v]) => {
            const name = ({light:'灯具',ac:'空调',curtain:'窗帘',air:'净化器',tv:'电视',speaker:'音箱',camera:'摄像头',washer:'洗衣机',fridge:'冰箱',oven:'烤箱',sensor:'传感器'})[k] || k
            return `${name} ${v}`
          }).join(' / ')
        : '暂无设备'
      const memCount = s.members.length || (s.families.length ? 1 : 0)
      const content =
        `家庭数：${s.families.length}\n` +
        `设备总数：${total}（在线 ${online}，运行 ${powered}）\n` +
        `设备类型：${typeStr}\n` +
        `场景总数：${s.scenes.length}\n` +
        `成员记录：${memCount}\n` +
        `当前角色：${this.currentRole}`
      uni.showModal({
        title: '数据统计',
        content,
        showCancel: false,
        confirmColor: '#8B4513'
      })
    },
    handleReSeedDemo() {
      const tip = hasDemoData()
        ? '将清空当前家庭/设备/场景，并恢复一套示例数据，是否继续？'
        : '将为您生成一套示例家庭/设备/场景数据，是否继续？'
      uni.showModal({
        title: hasDemoData() ? '重置示例数据' : '生成示例数据',
        content: tip,
        confirmColor: '#8B4513',
        success: (res) => {
          if (res.confirm) {
            reSeedDemoData()
            this.refreshData()
            uni.showToast({ title: '已恢复示例', icon: 'success' })
          }
        }
      })
    },
    handleClearData() {
      uni.showModal({
        title: '清空所有数据',
        content: '将删除所有家庭、设备、场景、成员数据（保留登录态），此操作不可撤销，是否继续？',
        confirmColor: '#B22222',
        success: (res) => {
          if (res.confirm) {
            resetDemoData()
            this.refreshData()
            uni.showToast({ title: '已清空', icon: 'success' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #8B4513 0%, #CD853F 30%, #FFFAF0 30%);
  padding-bottom: 120rpx;
}

.nav-bar { padding: 80rpx 40rpx 30rpx; }

.nav-title {
  font-size: 40rpx;
  color: #FFFAF0;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.content { padding: 0 30rpx; }

.user-card {
  background: rgba(255, 250, 240, 0.95);
  border-radius: 30rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  overflow: hidden;
}

.avatar-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
}

.avatar-text {
  font-size: 48rpx;
  color: #FFFAF0;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.user-info { flex: 1; }

.user-name {
  font-size: 36rpx;
  color: #2F1810;
  font-weight: bold;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.user-desc {
  font-size: 24rpx;
  color: #8B7355;
  margin-top: 8rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.user-role {
  font-size: 22rpx;
  color: #8B4513;
  margin-top: 6rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.edit-arrow {
  font-size: 28rpx;
  color: #8B7355;
}

.stats-card {
  background: rgba(255, 250, 240, 0.95);
  border-radius: 30rpx;
  padding: 40rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 30rpx;
}

.stat-item { display: flex; flex-direction: column; align-items: center; }

.stat-value {
  font-size: 44rpx;
  color: #8B4513;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.stat-label {
  font-size: 24rpx;
  color: #8B7355;
  margin-top: 8rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #D2B48C;
}

.menu-section { margin-bottom: 30rpx; }

.menu-card {
  background: rgba(255, 250, 240, 0.95);
  border-radius: 24rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #D2B48C;
}

.menu-item:last-child { border-bottom: none; }

.menu-item.danger .menu-text { color: #B22222; }

.menu-icon { font-size: 36rpx; margin-right: 20rpx; }

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.menu-arrow { font-size: 28rpx; color: #8B7355; }

.logout-btn {
  width: 100%;
  height: 96rpx;
  background: rgba(255, 250, 240, 0.95);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  border: 2rpx solid #D2B48C;
}

.logout-text {
  font-size: 30rpx;
  color: #B22222;
  font-family: "STKaiti", "KaiTi", serif;
}

.version-text {
  text-align: center;
  font-size: 22rpx;
  color: #8B7355;
  font-family: "STKaiti", "KaiTi", serif;
}
</style>
