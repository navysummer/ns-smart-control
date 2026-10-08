<template>
  <view class="container">
    <!-- 顶部导航 + 用户问候 + 天气 -->
    <view class="nav-bar">
      <view class="nav-top">
        <view class="user-area">
          <text class="greeting-text">{{ greetingText }}</text>
          <text class="user-text">{{ nickname }} · {{ currentFamilyName || '还未创建家庭' }}</text>
        </view>
        <view class="weather-area" @tap="refreshWeather">
          <text class="weather-icon">{{ weather.icon }}</text>
          <text class="weather-text">{{ weather.temp }} · {{ weather.desc }}</text>
        </view>
      </view>

      <!-- 快捷操作：一键全开 / 全关 / 到家 -->
      <view class="quick-actions">
        <view class="quick-item" @tap="quickAllOn">
          <text class="quick-icon">☀️</text>
          <text class="quick-label">一键全开</text>
        </view>
        <view class="quick-item" @tap="quickAllOff">
          <text class="quick-icon">🌙</text>
          <text class="quick-label">一键全关</text>
        </view>
        <view class="quick-item" @tap="quickHome">
          <text class="quick-icon">🏡</text>
          <text class="quick-label">归家模式</text>
        </view>
        <view class="quick-item" @tap="goToSceneHome">
          <text class="quick-icon">🌿</text>
          <text class="quick-label">离家模式</text>
        </view>
      </view>
    </view>

    <!-- 家庭选择 -->
    <view class="family-section">
      <view class="section-header">
        <text class="section-title">我的家庭</text>
        <view class="add-btn" @tap="goToCreateFamily">
          <text class="add-icon">+</text>
        </view>
      </view>
      <view v-if="families.length === 0" class="empty-state" @tap="goToCreateFamily">
        <text class="empty-icon">🏠</text>
        <text class="empty-text">暂无家庭，点击创建</text>
      </view>
      <scroll-view scroll-x class="family-scroll" v-else enhanced :show-scrollbar="false">
        <view
          class="family-card"
          v-for="family in families"
          :key="family.id"
          :class="{ active: currentFamilyId === family.id }"
          @tap="selectFamily(family)"
        >
          <text class="family-name">{{ family.name }}</text>
          <text class="family-desc">{{ family.memberCount }}人 · {{ family.deviceCount || 0 }}台设备</text>
        </view>
      </scroll-view>
    </view>

    <!-- 设备列表 -->
    <view class="device-section" v-if="currentFamilyId">
      <view class="section-header">
        <text class="section-title">我的设备</text>
        <view class="header-right">
          <text class="online-count" v-if="familyDevices.length > 0">在线 {{ onlineCount }}/{{ familyDevices.length }}</text>
          <view class="add-btn" v-if="isOwner" @tap="goToAddDevice">
            <text class="add-icon">+</text>
          </view>
        </view>
      </view>
      <view v-if="familyDevices.length === 0" class="empty-state" @tap="goToAddDevice">
        <text class="empty-icon">📱</text>
        <text class="empty-text">{{ isOwner ? '暂无设备，点击添加' : '暂无设备' }}</text>
      </view>
      <view class="device-group-list" v-else>
        <view class="device-group" v-for="group in deviceGroups" :key="group.location">
          <text class="group-title">
          {{ group.location }} <text class="group-count">· {{ group.devices.length }}</text>
          </text>
          <view class="device-grid">
            <view
              class="device-card"
              v-for="device in group.devices"
              :key="device.id"
              :class="{ offline: !device.isOnline, on: device.isPowerOn }"
              @tap="controlDevice(device)"
            >
              <view class="device-icon-wrap">
                <view class="device-icon" :class="{ active: device.isPowerOn }">
                  <text class="icon-text">{{ getDeviceIcon(device.type) }}</text>
                </view>
                <view class="online-dot" :class="{ on: device.isOnline }"></view>
              </view>
              <text class="device-name ellipsis">{{ device.name }}</text>
              <text class="device-status">{{ device.isOnline ? (device.isPowerOn ? '运行中' : '待机') : '离线' }}</text>
              <view class="device-switch" @tap.stop>
                <switch :checked="device.isPowerOn" @change="toggleDevice(device)" color="#8B4513" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="device-section" v-else>
      <view class="empty-state">
        <text class="empty-icon">🏠</text>
        <text class="empty-text">请先创建或选择一个家庭</text>
      </view>
    </view>

    <!-- 诗意场景 -->
    <view class="scene-section" v-if="currentFamilyId">
      <view class="section-header">
        <text class="section-title">诗意场景</text>
        <view class="add-btn" v-if="isOwner" @tap="goToCreateScene">
          <text class="add-icon">+</text>
        </view>
      </view>
      <view v-if="familyScenes.length === 0" class="empty-state">
        <text class="empty-icon">✨</text>
        <text class="empty-text">暂无场景，可在家庭详情中创建</text>
      </view>
      <view class="scene-list" v-else>
        <view class="scene-card" v-for="scene in familyScenes" :key="scene.id" @tap="activateScene(scene)">
          <text class="scene-icon">{{ scene.icon }}</text>
          <text class="scene-name">{{ scene.name }}</text>
          <text class="scene-desc ellipsis-2">{{ scene.description }}</text>
        </view>
      </view>
    </view>

    <view class="poem-footer">
      <text class="poem-text">「 一灯一砚，一卷一禅 」</text>
    </view>
  </view>
</template>

<script>
import {
  getStore,
  loadLocal,
  setCurrentFamily,
  toggleDevicePower,
  activateScene,
  requireLogin,
  getCurrentUserRole,
  subscribe,
  getDeviceIcon as storeDeviceIcon,
  setDevicePower,
  getFamilyDevices
} from '@/store/index.js'

const WEATHER_PRESETS = [
  { icon: '☀️', temp: '24°', desc: '晴' },
  { icon: '⛅', temp: '22°', desc: '多云' },
  { icon: '🌤️', temp: '20°', desc: '晴间多云' },
  { icon: '🌧️', temp: '18°', desc: '小雨' },
  { icon: '❄️', temp: '3°', desc: '小雪' },
  { icon: '🍃', temp: '19°', desc: '微风' }
]

function getGreetingByHour() {
  const h = new Date().getHours()
  if (h < 5) return { text: '夜深了', sub: '万籁俱寂，愿君好梦' }
  if (h < 9) return { text: '早上好', sub: '晨光熹微，万物初醒' }
  if (h < 12) return { text: '上午好', sub: '清风徐来，诸事皆宜' }
  if (h < 14) return { text: '中午好', sub: '浮生半日，茗香一缕' }
  if (h < 18) return { text: '下午好', sub: '暖阳当户，悠然自得' }
  if (h < 22) return { text: '晚上好', sub: '华灯初上，静候归人' }
  return { text: '夜安好', sub: '月上枝头，月色入户' }
}

export default {
  data() {
    return {
      families: [],
      currentFamilyId: null,
      devices: [],
      scenes: [],
      nickname: '未登录',
      weather: { icon: '⛅', temp: '24°', desc: '晴' },
      greeting: { text: '', sub: '' },
      _unsub: null
    }
  },
  computed: {
    greetingText() {
      return this.greeting.text || '您好'
    },
    currentFamilyName() {
      const f = this.families.find(f => f.id === this.currentFamilyId)
      return f ? f.name : ''
    },
    familyDevices() {
      return this.devices.filter(d => d.familyId === this.currentFamilyId)
    },
    familyScenes() {
      return this.scenes.filter(s => s.familyId === this.currentFamilyId)
    },
    isOwner() {
      return getCurrentUserRole() === '家长'
    },
    onlineCount() {
      return this.familyDevices.filter(d => d.isOnline).length
    },
    deviceGroups() {
      const groups = []
      const map = {}
      this.familyDevices.forEach(d => {
        const loc = d.location || '未指定'
        if (!map[loc]) {
          map[loc] = []
          groups.push({ location: loc, devices: map[loc] })
        }
        map[loc].push(d)
      })
      // 设备多的房间排前面
      return groups.sort((a, b) => b.devices.length - a.devices.length)
    }
  },
  onLoad() {
    this.weather = WEATHER_PRESETS[Math.floor(Math.random() * WEATHER_PRESETS.length)]
    this.greeting = getGreetingByHour()
  },
  onShow() {
    loadLocal()
    if (!requireLogin()) return
    this.refreshData()
    // 订阅 store 更新，保证其它页面修改后自动同步首页
    if (!this._unsub) {
      this._unsub = subscribe(() => this.refreshData())
    }
  },
  onUnload() {
    if (this._unsub) {
      this._unsub()
      this._unsub = null
    }
  },
  onHide() {
    if (this._unsub) {
      this._unsub()
      this._unsub = null
    }
  },
  onPullDownRefresh() {
    loadLocal()
    this.greeting = getGreetingByHour()
    this.weather = WEATHER_PRESETS[Math.floor(Math.random() * WEATHER_PRESETS.length)]
    this.refreshData()
    setTimeout(() => {
      uni.stopPullDownRefresh()
      uni.showToast({ title: '已刷新', icon: 'none' })
    }, 600)
  },
  methods: {
    refreshData() {
      const s = getStore()
      this.families = s.families.slice()
      this.currentFamilyId = s.currentFamilyId
      this.devices = s.devices.slice()
      this.scenes = s.scenes.slice()
      this.nickname = (s.userInfo && s.userInfo.nickname) ? s.userInfo.nickname : '主人'
    },
    refreshWeather() {
      this.weather = WEATHER_PRESETS[Math.floor(Math.random() * WEATHER_PRESETS.length)]
      uni.showToast({ title: '天气已更新', icon: 'none' })
    },
    goToCreateFamily() {
      uni.navigateTo({ url: '/pages/family/create' })
    },
    goToAddDevice() {
      if (!this.currentFamilyId) {
        uni.showToast({ title: '请先创建家庭', icon: 'none' })
        return
      }
      if (!this.isOwner) {
        uni.showToast({ title: '仅家长可添加设备', icon: 'none' })
        return
      }
      uni.navigateTo({ url: '/pages/device/add' })
    },
    goToCreateScene() {
      if (!this.isOwner) {
        uni.showToast({ title: '仅家长可创建场景', icon: 'none' })
        return
      }
      uni.navigateTo({ url: '/pages/scene/create' })
    },
    selectFamily(family) {
      setCurrentFamily(family.id)
      this.currentFamilyId = family.id
      uni.showToast({ title: `已切换到「${family.name}」`, icon: 'none' })
    },
    controlDevice(device) {
      uni.navigateTo({ url: `/pages/device/control?id=${device.id}` })
    },
    toggleDevice(device) {
      const wasOn = device.isPowerOn
      toggleDevicePower(device.id)
      this.refreshData()
      uni.showToast({
        title: wasOn ? `${device.name}已关闭` : `${device.name}已开启`,
        icon: 'success'
      })
    },
    activateScene(scene) {
      activateScene(scene)
      this.refreshData()
      uni.showToast({ title: `「${scene.name}」已激活`, icon: 'success' })
    },
    quickAllOn() {
      const list = getFamilyDevices().filter(d => !d.isPowerOn)
      list.forEach(d => setDevicePower(d.id, true))
      if (list.length === 0) {
        uni.showToast({ title: '设备已经全部开启啦', icon: 'none' })
        return
      }
      this.refreshData()
      uni.showToast({ title: `已开启 ${list.length} 台设备`, icon: 'success' })
    },
    quickAllOff() {
      const list = getFamilyDevices().filter(d => d.isPowerOn)
      list.forEach(d => setDevicePower(d.id, false))
      if (list.length === 0) {
        uni.showToast({ title: '设备已经全部关闭啦', icon: 'none' })
        return
      }
      this.refreshData()
      uni.showToast({ title: `已关闭 ${list.length} 台设备`, icon: 'success' })
    },
    quickHome() {
      const devices = getFamilyDevices()
      if (devices.length === 0) {
        uni.showToast({ title: '还没有设备哦', icon: 'none' })
        return
      }
      // 归家模式：灯光 窗帘开 空调26度 音箱音量轻
      devices.forEach(d => {
        const patch = { isPowerOn: true }
        if (d.type === 'light') Object.assign(patch, { brightness: 80, color: 'warm' })
        if (d.type === 'ac') Object.assign(patch, { temperature: 26, mode: 'cool', windSpeed: 2 })
        if (d.type === 'curtain') Object.assign(patch, { openPercent: 80 })
        if (d.type === 'speaker') Object.assign(patch, { volume: 40 })
        if (d.type === 'washer' || d.type === 'camera') Object.assign(patch, { isPowerOn: d.isPowerOn })
        setDevicePower(d.id, true)
      })
      this.refreshData()
      uni.showToast({ title: '欢迎回家，愿君安适', icon: 'success' })
    },
    goToSceneHome() {
      const devices = getFamilyDevices()
      if (devices.length === 0) {
        uni.showToast({ title: '还没有设备哦', icon: 'none' })
        return
      }
      devices.forEach(d => {
        if (d.type === 'camera' || d.type === 'sensor') {
          setDevicePower(d.id, true)
          return
        }
        setDevicePower(d.id, false)
      })
      this.refreshData()
      uni.showToast({ title: '离家模式已启动，一路平安', icon: 'success' })
    },
    getDeviceIcon(type) {
      return storeDeviceIcon(type)
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFAF0 0%, #FFF8DC 100%);
  padding-bottom: 140rpx;
}

/* 顶部导航 */
.nav-bar {
  background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
  padding: 80rpx 40rpx 40rpx;
  border-radius: 0 0 40rpx 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.18);
}

.nav-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 36rpx;
}

.user-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.greeting-text {
  font-size: 40rpx;
  color: #FFFAF0;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.user-text {
  font-size: 24rpx;
  color: #DEB887;
  margin-top: 8rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.weather-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 12rpx 20rpx;
  background: rgba(255, 250, 240, 0.12);
  border-radius: 20rpx;
}

.weather-icon { font-size: 40rpx; }

.weather-text {
  font-size: 22rpx;
  color: #FFFAF0;
  margin-top: 6rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  background: rgba(255, 250, 240, 0.12);
  border-radius: 24rpx;
  padding: 20rpx 12rpx;
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 0;
}

.quick-icon { font-size: 40rpx; }

.quick-label {
  font-size: 22rpx;
  color: #FFFAF0;
  margin-top: 8rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

/* 通用 section */
.family-section, .device-section, .scene-section {
  margin: 30rpx 30rpx 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  color: #2F1810;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.online-count {
  font-size: 22rpx;
  color: #8B7355;
  font-family: "STKaiti", "KaiTi", serif;
}

.add-btn {
  width: 52rpx;
  height: 52rpx;
  background: #8B4513;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  color: #FFFAF0;
  font-size: 32rpx;
  line-height: 1;
}

.empty-state {
  background: #FFF8DC;
  border: 2rpx dashed #D2B48C;
  border-radius: 20rpx;
  padding: 60rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #8B7355;
  font-family: "STKaiti", "KaiTi", serif;
  padding: 0 20rpx;
  text-align: center;
}

/* 家庭卡片 */
.family-scroll {
  white-space: nowrap;
}

.family-card {
  display: inline-block;
  width: 320rpx;
  padding: 28rpx 30rpx;
  background: #FFF8DC;
  border-radius: 24rpx;
  margin-right: 20rpx;
  border: 2rpx solid #D2B48C;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.06);
}

.family-card.active {
  border-color: #8B4513;
  background: linear-gradient(135deg, #FFF8DC 0%, #FFFAF0 100%);
  box-shadow: 0 6rpx 20rpx rgba(139, 69, 19, 0.14);
}

.family-name {
  font-size: 30rpx;
  color: #2F1810;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
  display: block;
}

.family-desc {
  font-size: 22rpx;
  color: #8B7355;
  margin-top: 10rpx;
  font-family: "STKaiti", "KaiTi", serif;
  display: block;
}

/* 设备分组 */
.device-group-list {
  margin-top: 4rpx;
}

.device-group {
  margin-bottom: 28rpx;
}

.group-title {
  font-size: 24rpx;
  color: #8B7355;
  margin-bottom: 14rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
  font-weight: bold;
}

.group-count {
  font-weight: normal;
  color: #A5937A;
  margin-left: 4rpx;
}

.device-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.device-card {
  width: calc(50% - 10rpx);
  background: #FFF8DC;
  border-radius: 24rpx;
  padding: 28rpx 20rpx;
  border: 2rpx solid #D2B48C;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 14rpx rgba(139, 69, 19, 0.06);
  transition: all 0.2s;
}

.device-card.offline {
  opacity: 0.6;
}

.device-card.on {
  border-color: #CD853F;
  background: linear-gradient(135deg, #FFF8DC 0%, #FFFAF0 100%);
}

.device-icon-wrap {
  position: relative;
  margin-bottom: 10rpx;
}

.device-icon {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #DEB887 0%, #D2B48C 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
}

.device-icon.active {
  background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.32);
}

.icon-text {
  font-size: 48rpx;
}

.online-dot {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #BDBDBD;
  border: 3rpx solid #FFFAF0;
}

.online-dot.on {
  background: #228B22;
  box-shadow: 0 0 8rpx rgba(34, 139, 34, 0.5);
}

.device-name {
  font-size: 28rpx;
  color: #2F1810;
  margin-top: 12rpx;
  font-family: "STKaiti", "KaiTi", serif;
  width: 100%;
  text-align: center;
}

.device-status {
  font-size: 22rpx;
  color: #8B7355;
  margin-top: 6rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.device-switch {
  margin-top: 14rpx;
}

/* 场景 */
.scene-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.scene-card {
  width: calc(33.33% - 14rpx);
  background: linear-gradient(135deg, #FFF8DC 0%, #FFFAF0 100%);
  border-radius: 20rpx;
  padding: 24rpx 16rpx;
  border: 2rpx solid #D2B48C;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 14rpx rgba(139, 69, 19, 0.06);
}

.scene-icon {
  font-size: 48rpx;
}

.scene-name {
  font-size: 26rpx;
  color: #2F1810;
  margin-top: 12rpx;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
  text-align: center;
}

.scene-desc {
  font-size: 20rpx;
  color: #8B7355;
  margin-top: 8rpx;
  text-align: center;
  font-family: "STKaiti", "KaiTi", serif;
  width: 100%;
  padding: 0 4rpx;
}

.poem-footer {
  margin: 60rpx 30rpx 20rpx;
  text-align: center;
}

.poem-text {
  font-size: 24rpx;
  color: #A5937A;
  font-style: italic;
  font-family: "STKaiti", "KaiTi", serif;
}
</style>
