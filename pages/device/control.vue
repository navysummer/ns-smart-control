<template>
  <view class="control-container">
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">{{ device ? device.name : '设备控制' }}</text>
      <view class="more-btn" @tap="showDeviceInfo">
        <text class="more-icon">ℹ️</text>
      </view>
    </view>

    <view class="content" v-if="device">
      <view class="status-card">
        <view class="status-header">
          <view class="device-icon">
            <text class="icon-text">{{ getDeviceIcon(device.type) }}</text>
          </view>
          <view class="status-info">
            <text class="status-text">{{ device.isOnline ? '在线' : '离线' }}</text>
            <text class="status-desc">{{ device.brandName }} · {{ device.location }}</text>
          </view>
          <view class="power-btn" :class="{ active: device.isPowerOn }" @tap="togglePower">
            <text class="power-icon">⏻</text>
          </view>
        </view>
      </view>

      <view class="control-section" v-if="device.type === 'light'">
        <text class="section-title">灯光控制</text>
        <view class="brightness-card">
          <text class="label">亮度</text>
          <slider
            class="slider"
            :value="lightState.brightness"
            :min="0" :max="100" :step="1"
            activeColor="#8B4513" backgroundColor="#D2B48C" block-size="24"
            @change="onBrightnessChange"
          />
          <text class="value">{{ lightState.brightness }}%</text>
        </view>
        <view class="color-card">
          <text class="label">色温</text>
          <view class="color-options">
            <view
              class="color-option"
              v-for="color in lightColors"
              :key="color.value"
              :class="{ active: lightState.color === color.value }"
              :style="{ background: color.color }"
              @tap="lightState.color = color.value"
            ></view>
          </view>
        </view>
      </view>

      <view class="control-section" v-if="device.type === 'ac'">
        <text class="section-title">空调控制</text>
        <view class="temperature-card">
          <text class="label">温度</text>
          <view class="temp-control">
            <view class="temp-btn" @tap="decreaseTemp">
              <text class="btn-icon">−</text>
            </view>
            <text class="temp-value">{{ acState.temperature }}℃</text>
            <view class="temp-btn" @tap="increaseTemp">
              <text class="btn-icon">+</text>
            </view>
          </view>
        </view>
        <view class="mode-card">
          <text class="label">模式</text>
          <view class="mode-options">
            <view
              class="mode-option"
              v-for="mode in acModes"
              :key="mode.value"
              :class="{ active: acState.mode === mode.value }"
              @tap="acState.mode = mode.value"
            >
              <text class="mode-icon">{{ mode.icon }}</text>
              <text class="mode-text">{{ mode.name }}</text>
            </view>
          </view>
        </view>
        <view class="wind-card">
          <text class="label">风速</text>
          <slider
            class="slider"
            :value="acState.windSpeed"
            :min="1" :max="5" :step="1"
            activeColor="#8B4513" backgroundColor="#D2B48C" block-size="24"
            @change="onWindSpeedChange"
          />
          <text class="value">{{ acState.windSpeed }}档</text>
        </view>
      </view>

      <view class="control-section" v-if="device.type === 'curtain'">
        <text class="section-title">窗帘控制</text>
        <view class="curtain-card">
          <text class="label">开合度</text>
          <slider
            class="slider"
            :value="curtainState.openPercent"
            :min="0" :max="100" :step="1"
            activeColor="#8B4513" backgroundColor="#D2B48C" block-size="24"
            @change="onCurtainChange"
          />
          <text class="value">{{ curtainState.openPercent }}%</text>
        </view>
        <view class="quick-btns">
          <view class="quick-btn" @tap="curtainState.openPercent = 0"><text class="quick-text">全关</text></view>
          <view class="quick-btn" @tap="curtainState.openPercent = 50"><text class="quick-text">半开</text></view>
          <view class="quick-btn" @tap="curtainState.openPercent = 100"><text class="quick-text">全开</text></view>
        </view>
      </view>

      <view class="control-section" v-if="device.type === 'tv'">
        <text class="section-title">电视控制</text>
        <view class="remote-grid">
          <view class="remote-btn" @tap="tvAction('power')"><text class="remote-icon">⏻</text></view>
          <view class="remote-btn" @tap="tvAction('volumeUp')"><text class="remote-icon">🔊+</text></view>
          <view class="remote-btn" @tap="tvAction('volumeDown')"><text class="remote-icon">🔊−</text></view>
          <view class="remote-btn" @tap="tvAction('channelUp')"><text class="remote-icon">CH+</text></view>
          <view class="remote-btn" @tap="tvAction('channelDown')"><text class="remote-icon">CH−</text></view>
          <view class="remote-btn" @tap="tvAction('mute')"><text class="remote-icon">🔇</text></view>
        </view>
      </view>

      <view class="control-section" v-if="device.type === 'speaker'">
        <text class="section-title">音箱控制</text>
        <view class="brightness-card">
          <text class="label">音量</text>
          <slider
            class="slider"
            :value="speakerState.volume"
            :min="0" :max="100" :step="1"
            activeColor="#8B4513" backgroundColor="#D2B48C" block-size="24"
            @change="onVolumeChange"
          />
          <text class="value">{{ speakerState.volume }}%</text>
        </view>
        <view class="quick-btns">
          <view class="quick-btn" @tap="speakerAction('play')"><text class="quick-text">播放</text></view>
          <view class="quick-btn" @tap="speakerAction('pause')"><text class="quick-text">暂停</text></view>
          <view class="quick-btn" @tap="speakerAction('next')"><text class="quick-text">下一首</text></view>
        </view>
      </view>

      <view class="control-section" v-if="!isSpecialType">
        <text class="section-title">设备控制</text>
        <view class="generic-control">
          <view class="quick-btns">
            <view class="quick-btn" @tap="genericAction('on')"><text class="quick-text">开启</text></view>
            <view class="quick-btn" @tap="genericAction('off')"><text class="quick-text">关闭</text></view>
            <view class="quick-btn" @tap="genericAction('reset')"><text class="quick-text">重置</text></view>
          </view>
        </view>
      </view>

      <view class="timer-section">
        <text class="section-title">定时设置</text>
        <view class="timer-card">
          <view class="timer-row">
            <text class="timer-label">开启定时</text>
            <switch :checked="timerEnabled" @change="timerEnabled = !timerEnabled" color="#8B4513" />
          </view>
          <view class="timer-row" v-if="timerEnabled">
            <text class="timer-label">定时时间</text>
            <picker mode="time" @change="onTimeChange">
              <view class="time-picker">
                <text class="time-text">{{ timerTime }}</text>
                <text class="time-arrow">▼</text>
              </view>
            </picker>
          </view>
        </view>
      </view>

      <view class="action-btns">
        <view class="action-btn danger" @tap="deleteDevice">
          <text class="action-icon">🗑️</text>
          <text class="action-text">删除设备</text>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-icon">📱</text>
      <text class="empty-text">设备不存在</text>
    </view>
  </view>
</template>

<script>
import { getStore, toggleDevicePower, removeDevice, updateDevice } from '@/store/index.js'

export default {
  data() {
    return {
      deviceId: '',
      device: null,
      lightState: { brightness: 80, color: 'warm' },
      acState: { temperature: 26, mode: 'cool', windSpeed: 3 },
      curtainState: { openPercent: 70 },
      speakerState: { volume: 50 },
      timerEnabled: false,
      timerTime: '07:00',
      lightColors: [
        { value: 'warm', color: '#FFD700' },
        { value: 'cool', color: '#87CEEB' },
        { value: 'natural', color: '#98FB98' }
      ],
      acModes: [
        { value: 'cool', name: '制冷', icon: '❄️' },
        { value: 'heat', name: '制热', icon: '🔥' },
        { value: 'auto', name: '自动', icon: '🔄' },
        { value: 'dry', name: '除湿', icon: '💧' }
      ]
    }
  },
  computed: {
    isSpecialType() {
      return ['light', 'ac', 'curtain', 'tv', 'speaker'].includes(this.device?.type)
    }
  },
  onLoad(options) {
    if (options && options.id) {
      this.deviceId = options.id
      this.loadDevice()
    }
  },
  onShow() {
    this.loadDevice()
  },
  methods: {
    loadDevice() {
      const s = getStore()
      this.device = s.devices.find(d => d.id === this.deviceId) || null
      if (this.device && this.device.lightState) {
        this.lightState = { ...this.device.lightState }
      }
      if (this.device && this.device.acState) {
        this.acState = { ...this.device.acState }
      }
      if (this.device && this.device.curtainState) {
        this.curtainState = { ...this.device.curtainState }
      }
    },
    goBack() {
      uni.navigateBack()
    },
    togglePower() {
      toggleDevicePower(this.device.id)
      this.loadDevice()
      uni.showToast({
        title: this.device.isPowerOn ? '设备已开启' : '设备已关闭',
        icon: 'success'
      })
    },
    onBrightnessChange(e) {
      this.lightState.brightness = e.detail.value
      this.saveDeviceState()
    },
    decreaseTemp() {
      if (this.acState.temperature > 16) {
        this.acState.temperature--
        this.saveDeviceState()
      }
    },
    increaseTemp() {
      if (this.acState.temperature < 30) {
        this.acState.temperature++
        this.saveDeviceState()
      }
    },
    onWindSpeedChange(e) {
      this.acState.windSpeed = e.detail.value
      this.saveDeviceState()
    },
    onCurtainChange(e) {
      this.curtainState.openPercent = e.detail.value
      this.saveDeviceState()
    },
    onVolumeChange(e) {
      this.speakerState.volume = e.detail.value
      this.saveDeviceState()
    },
    onTimeChange(e) {
      this.timerTime = e.detail.value
    },
    tvAction(action) {
      uni.showToast({ title: `电视: ${action}`, icon: 'none' })
    },
    speakerAction(action) {
      uni.showToast({ title: `音箱: ${action}`, icon: 'none' })
    },
    genericAction(action) {
      uni.showToast({ title: `设备: ${action}`, icon: 'none' })
    },
    saveDeviceState() {
      if (!this.device) return
      const data = {}
      if (this.device.type === 'light') data.lightState = { ...this.lightState }
      if (this.device.type === 'ac') data.acState = { ...this.acState }
      if (this.device.type === 'curtain') data.curtainState = { ...this.curtainState }
      if (this.device.type === 'speaker') data.speakerState = { ...this.speakerState }
      updateDevice(this.device.id, data)
    },
    showDeviceInfo() {
      if (!this.device) return
      uni.showModal({
        title: '设备信息',
        content: `品牌: ${this.device.brandName}\n类型: ${this.device.typeName}\n位置: ${this.device.location}\n添加时间: ${this.device.createTime?.split('T')[0] || '未知'}`,
        showCancel: false,
        confirmColor: '#8B4513'
      })
    },
    deleteDevice() {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除「${this.device.name}」吗？删除后无法恢复。`,
        confirmColor: '#B22222',
        success: (res) => {
          if (res.confirm) {
            removeDevice(this.device.id)
            uni.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        }
      })
    },
    getDeviceIcon(type) {
      const icons = {
        light: '💡', ac: '❄️', curtain: '🪟', air: '🌬️',
        tv: '📺', speaker: '🔊', camera: '📷', washer: '🧺',
        fridge: '🧊', oven: '🍳', sensor: '📡'
      }
      return icons[type] || '📱'
    }
  }
}
</script>

<style scoped>
.control-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFAF0 0%, #FFF8DC 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 80rpx 40rpx 30rpx;
  background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
}

.back-btn, .more-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon { font-size: 40rpx; color: #FFFAF0; }
.more-icon { font-size: 36rpx; }

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  color: #FFFAF0;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.content { padding: 30rpx; }

.status-card {
  background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
  border-radius: 30rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
}

.status-header { display: flex; align-items: center; }

.device-icon {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 250, 240, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.icon-text { font-size: 60rpx; }
.status-info { flex: 1; }

.status-text {
  font-size: 32rpx;
  color: #FFFAF0;
  font-weight: bold;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.status-desc {
  font-size: 24rpx;
  color: #DEB887;
  margin-top: 8rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.power-btn {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 250, 240, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.power-btn.active { background: #FFFAF0; }
.power-icon { font-size: 48rpx; color: #FFFAF0; }
.power-btn.active .power-icon { color: #8B4513; }

.control-section {
  background: #FFF8DC;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  border: 2rpx solid #D2B48C;
}

.section-title {
  font-size: 28rpx;
  color: #2F1810;
  font-weight: bold;
  margin-bottom: 24rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.label {
  font-size: 26rpx;
  color: #8B7355;
  margin-bottom: 16rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.slider { margin: 0 16rpx; }

.value {
  font-size: 28rpx;
  color: #8B4513;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.brightness-card, .temperature-card, .curtain-card {
  margin-bottom: 24rpx;
}

.color-options { display: flex; gap: 20rpx; }

.color-option {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
}

.color-option.active {
  border-color: #8B4513;
  transform: scale(1.1);
}

.temp-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60rpx;
}

.temp-btn {
  width: 80rpx;
  height: 80rpx;
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon { font-size: 40rpx; color: #8B4513; }

.temp-value {
  font-size: 72rpx;
  color: #8B4513;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.mode-card { margin-bottom: 24rpx; }
.mode-options { display: flex; gap: 16rpx; }

.mode-option {
  flex: 1;
  height: 100rpx;
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mode-option.active {
  background: #8B4513;
  border-color: #8B4513;
}

.mode-icon { font-size: 32rpx; }

.mode-text {
  font-size: 22rpx;
  color: #2F1810;
  margin-top: 6rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.mode-option.active .mode-text { color: #FFFAF0; }

.quick-btns { display: flex; gap: 20rpx; margin-top: 24rpx; }

.quick-btn {
  flex: 1;
  height: 80rpx;
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-text {
  font-size: 26rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.remote-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.remote-btn {
  width: calc(33.33% - 14rpx);
  height: 100rpx;
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remote-icon {
  font-size: 28rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.timer-section {
  background: #FFF8DC;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  border: 2rpx solid #D2B48C;
}

.timer-card {
  background: #FFFAF0;
  border-radius: 16rpx;
  padding: 24rpx;
}

.timer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #D2B48C;
}

.timer-row:last-child { border-bottom: none; }

.timer-label {
  font-size: 26rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.time-picker {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.time-text {
  font-size: 26rpx;
  color: #8B4513;
  font-family: "STKaiti", "KaiTi", serif;
}

.time-arrow { font-size: 20rpx; color: #8B7355; }

.action-btns { display: flex; gap: 20rpx; }

.action-btn {
  flex: 1;
  height: 96rpx;
  background: #FFF8DC;
  border: 2rpx solid #D2B48C;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.action-btn.danger {
  border-color: #B22222;
}

.action-btn.danger .action-text {
  color: #B22222;
}

.action-icon { font-size: 32rpx; }

.action-text {
  font-size: 26rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }

.empty-text {
  font-size: 28rpx;
  color: #8B7355;
  font-family: "STKaiti", "KaiTi", serif;
}
</style>
