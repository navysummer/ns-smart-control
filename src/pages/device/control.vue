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
              @tap="onColorChange(color.value)"
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
              @tap="onModeChange(mode.value)"
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
          <view class="quick-btn" @tap="onCurtainQuick(0)"><text class="quick-text">全关</text></view>
          <view class="quick-btn" @tap="onCurtainQuick(50)"><text class="quick-text">半开</text></view>
          <view class="quick-btn" @tap="onCurtainQuick(100)"><text class="quick-text">全开</text></view>
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

      <!-- 空气净化器 -->
      <view class="control-section" v-if="device.type === 'air'">
        <text class="section-title">净化器控制</text>
        <view class="mode-card">
          <text class="label">运行模式</text>
          <view class="mode-options">
            <view
              v-for="m in airModes"
              :key="m.value"
              class="mode-option"
              :class="{ active: airState.mode === m.value }"
              @tap="onAirModeChange(m.value)"
            >
              <text class="mode-icon">{{ m.icon }}</text>
              <text class="mode-text">{{ m.name }}</text>
            </view>
          </view>
        </view>
        <view class="wind-card">
          <text class="label">风量</text>
          <slider
            class="slider"
            :value="airState.fanLevel"
            :min="1" :max="5" :step="1"
            activeColor="#8B4513" backgroundColor="#D2B48C" block-size="24"
            @change="onAirFanChange"
          />
          <text class="value">{{ airState.fanLevel }}档</text>
        </view>
      </view>

      <!-- 洗衣机 -->
      <view class="control-section" v-if="device.type === 'washer'">
        <text class="section-title">洗衣机控制</text>
        <view class="mode-card">
          <text class="label">洗衣程序</text>
          <view class="mode-options">
            <view
              v-for="m in washerModes"
              :key="m.value"
              class="mode-option"
              :class="{ active: washerState.mode === m.value }"
              @tap="onWasherModeChange(m.value)"
            >
              <text class="mode-icon">{{ m.icon }}</text>
              <text class="mode-text">{{ m.name }}</text>
            </view>
          </view>
        </view>
        <view class="quick-btns">
          <view class="quick-btn" :class="{primary: washerState.remaining > 0}" @tap="washerAction('start')">
            <text class="quick-text">启动洗涤</text>
          </view>
          <view class="quick-btn" @tap="washerAction('pause')"><text class="quick-text">暂停</text></view>
          <view class="quick-btn" @tap="washerAction('stop')"><text class="quick-text">取消</text></view>
        </view>
        <view class="remaining" v-if="washerState.remaining > 0">
          <text class="remaining-text">剩余时间：{{ washerState.remaining }} 分钟</text>
        </view>
      </view>

      <!-- 冰箱 -->
      <view class="control-section" v-if="device.type === 'fridge'">
        <text class="section-title">冰箱控制</text>
        <view class="temperature-card">
          <text class="label">冷藏室</text>
          <view class="temp-control">
            <view class="temp-btn" @tap="decreaseFridgeCold">
              <text class="btn-icon">−</text>
            </view>
            <text class="temp-value">{{ fridgeState.tempCold }}℃</text>
            <view class="temp-btn" @tap="increaseFridgeCold">
              <text class="btn-icon">+</text>
            </view>
          </view>
        </view>
        <view class="temperature-card">
          <text class="label">冷冻室</text>
          <view class="temp-control">
            <view class="temp-btn" @tap="decreaseFridgeFreeze">
              <text class="btn-icon">−</text>
            </view>
            <text class="temp-value">{{ fridgeState.tempFreeze }}℃</text>
            <view class="temp-btn" @tap="increaseFridgeFreeze">
              <text class="btn-icon">+</text>
            </view>
          </view>
        </view>
        <view class="quick-btns">
          <view class="quick-btn" @tap="onFridgeSmart('eco')"><text class="quick-text">节能模式</text></view>
          <view class="quick-btn" @tap="onFridgeSmart('quick')"><text class="quick-text">速冷速冻</text></view>
        </view>
      </view>

      <!-- 烤箱 -->
      <view class="control-section" v-if="device.type === 'oven'">
        <text class="section-title">烤箱控制</text>
        <view class="temperature-card">
          <text class="label">温度（80 - 250℃）</text>
          <slider
            class="slider"
            :value="ovenState.temp"
            :min="80" :max="250" :step="5"
            activeColor="#8B4513" backgroundColor="#D2B48C" block-size="24"
            @change="onOvenTempChange"
          />
          <text class="value">{{ ovenState.temp }}℃</text>
        </view>
        <view class="temperature-card">
          <text class="label">时间（分钟）</text>
          <slider
            class="slider"
            :value="ovenState.time"
            :min="5" :max="180" :step="5"
            activeColor="#8B4513" backgroundColor="#D2B48C" block-size="24"
            @change="onOvenTimeChange"
          />
          <text class="value">{{ ovenState.time }}分</text>
        </view>
      </view>

      <!-- 摄像头 -->
      <view class="control-section" v-if="device.type === 'camera'">
        <text class="section-title">摄像头控制</text>
        <view class="preview-box">
          <text class="preview-emoji">📹</text>
          <text class="preview-text">实时画面（模拟）</text>
        </view>
        <view class="switch-list">
          <view class="switch-row">
            <text class="switch-label">夜视功能</text>
            <switch :checked="cameraState.nightVision" @change="onCameraNight" color="#8B4513" />
          </view>
          <view class="switch-row">
            <text class="switch-label">移动侦测</text>
            <switch :checked="cameraState.motionDetect" @change="onCameraMotion" color="#8B4513" />
          </view>
          <view class="switch-row">
            <text class="switch-label">录制中</text>
            <switch :checked="cameraState.recording" @change="onCameraRecord" color="#8B4513" />
          </view>
        </view>
      </view>

      <!-- 传感器 -->
      <view class="control-section" v-if="device.type === 'sensor'">
        <text class="section-title">环境传感器</text>
        <view class="sensor-grid">
          <view class="sensor-item">
            <text class="sensor-icon">🌡️</text>
            <text class="sensor-value">{{ sensorState.temperature }}℃</text>
            <text class="sensor-label">温度</text>
          </view>
          <view class="sensor-item">
            <text class="sensor-icon">💧</text>
            <text class="sensor-value">{{ sensorState.humidity }}%</text>
            <text class="sensor-label">湿度</text>
          </view>
          <view class="sensor-item">
            <text class="sensor-icon">🌫️</text>
            <text class="sensor-value">{{ sensorState.pm25 }}</text>
            <text class="sensor-label">PM2.5</text>
          </view>
          <view class="sensor-item">
            <text class="sensor-icon">🔋</text>
            <text class="sensor-value">{{ sensorState.battery }}%</text>
            <text class="sensor-label">电量</text>
          </view>
        </view>
        <view class="quick-btns">
          <view class="quick-btn" @tap="refreshSensor"><text class="quick-text">刷新数据</text></view>
          <view class="quick-btn" @tap="toggleAlarm"><text class="quick-text">{{ sensorState.alarm ? '关闭警报' : '开启警报' }}</text></view>
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
            <switch :checked="timerEnabled" @change="onTimerToggle" color="#8B4513" />
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

      <view class="logs-section" v-if="logs.length > 0">
        <text class="section-title">运行日志</text>
        <view class="logs-card">
          <view class="log-item" v-for="(log, index) in logs.slice(0, 5)" :key="index">
            <text class="log-time">{{ log.time }}</text>
            <text class="log-action">{{ log.action }}</text>
          </view>
        </view>
      </view>

      <view class="action-btns" v-if="isOwner">
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
import {
  getStore,
  toggleDevicePower,
  setDevicePower,
  removeDevice,
  updateDevice,
  requireLogin,
  getCurrentUserRole,
  getDeviceIcon as storeDeviceIcon
} from '@/store/index.js'

const SPECIAL_TYPES = ['light', 'ac', 'curtain', 'tv', 'speaker', 'air', 'washer', 'fridge', 'oven', 'camera', 'sensor']

export default {
  data() {
    return {
      deviceId: '',
      device: null,
      lightState: { brightness: 80, color: 'warm' },
      acState: { temperature: 26, mode: 'cool', windSpeed: 3 },
      curtainState: { openPercent: 70 },
      speakerState: { volume: 50, playing: false },
      airState: { mode: 'auto', fanLevel: 2 },
      washerState: { mode: 'standard', remaining: 0 },
      fridgeState: { tempCold: 5, tempFreeze: -18 },
      ovenState: { temp: 180, time: 15 },
      cameraState: { nightVision: true, motionDetect: false, recording: false },
      sensorState: { temperature: 22, humidity: 55, pm25: 18, battery: 86, alarm: false },
      logs: [],
      timerEnabled: false,
      timerTime: '07:00',
      lightColors: [
        { value: 'warm', name: '暖光', color: '#FFD700' },
        { value: 'cool', name: '冷光', color: '#87CEEB' },
        { value: 'natural', name: '自然光', color: '#98FB98' }
      ],
      acModes: [
        { value: 'cool', name: '制冷', icon: '❄️' },
        { value: 'heat', name: '制热', icon: '🔥' },
        { value: 'auto', name: '自动', icon: '🔄' },
        { value: 'dry', name: '除湿', icon: '💧' }
      ],
      airModes: [
        { value: 'auto', name: '自动', icon: '🔄' },
        { value: 'sleep', name: '睡眠', icon: '🌙' },
        { value: 'turbo', name: '强劲', icon: '💨' },
        { value: 'eco', name: '节能', icon: '🌿' }
      ],
      washerModes: [
        { value: 'standard', name: '标准', icon: '👕' },
        { value: 'quick', name: '快洗', icon: '⚡' },
        { value: 'heavy', name: '大件', icon: '🛏️' },
        { value: 'delicate', name: '轻柔', icon: '🌸' }
      ]
    }
  },
  computed: {
    isSpecialType() {
      return SPECIAL_TYPES.includes(this.device?.type)
    },
    isOwner() {
      return getCurrentUserRole() === '家长'
    }
  },
  onLoad(options) {
    if (!requireLogin()) return
    if (options && options.id) {
      this.deviceId = options.id
      this.loadDevice()
    } else {
      uni.showToast({ title: '缺少设备ID', icon: 'none' })
      setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 800)
    }
  },
  onShow() {
    if (this.deviceId) this.loadDevice()
  },
  onUnload() {
    if (this._washerTimer) {
      clearInterval(this._washerTimer)
      this._washerTimer = null
    }
  },
  methods: {
    loadDevice() {
      const s = getStore()
      this.device = s.devices.find(d => d.id === this.deviceId) || null
      if (!this.device) return
      const d = this.device
      if (d.type === 'light') this.lightState = { brightness: d.brightness ?? 80, color: d.color ?? 'warm' }
      if (d.type === 'ac') this.acState = { temperature: d.temperature ?? 26, mode: d.mode ?? 'cool', windSpeed: d.windSpeed ?? 3 }
      if (d.type === 'curtain') this.curtainState = { openPercent: d.openPercent ?? 70 }
      if (d.type === 'speaker') this.speakerState = { volume: d.volume ?? 50, playing: !!d.playing }
      if (d.type === 'air') this.airState = { mode: d.mode ?? 'auto', fanLevel: d.fanLevel ?? 2 }
      if (d.type === 'washer') this.washerState = { mode: d.mode ?? 'standard', remaining: d.remaining ?? 0 }
      if (d.type === 'fridge') this.fridgeState = { tempCold: d.tempCold ?? 5, tempFreeze: d.tempFreeze ?? -18 }
      if (d.type === 'oven') this.ovenState = { temp: d.temp ?? 180, time: d.time ?? 15 }
      if (d.type === 'camera') this.cameraState = { nightVision: d.nightVision ?? true, motionDetect: !!d.motionDetect, recording: !!d.recording }
      if (d.type === 'sensor') this.sensorState = {
        temperature: d.temperature ?? 22,
        humidity: d.humidity ?? 55,
        pm25: d.pm25 ?? 18,
        battery: d.battery ?? 86,
        alarm: !!d.alarm
      }
      if (d.timer) {
        this.timerEnabled = !!d.timer.enabled
        this.timerTime = d.timer.time || '07:00'
      }
      this.logs = d.logs || []
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
    onColorChange(color) {
      this.lightState.color = color
      this.saveDeviceState()
    },
    onModeChange(mode) {
      this.acState.mode = mode
      this.saveDeviceState()
    },
    onCurtainQuick(value) {
      this.curtainState.openPercent = value
      this.saveDeviceState()
    },
    onTimerToggle(e) {
      this.timerEnabled = e.detail.value
      this.saveTimer()
    },
    saveTimer() {
      if (!this.device) return
      updateDevice(this.device.id, { timer: { enabled: this.timerEnabled, time: this.timerTime } })
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
      this.saveTimer()
    },
    tvAction(action) {
      if (action === 'power') {
        const wasOn = this.device.isPowerOn
        toggleDevicePower(this.device.id)
        this.loadDevice()
        uni.showToast({ title: wasOn ? '电视已关闭' : '电视已开启', icon: 'success' })
        return
      }
      uni.showToast({ title: `电视: ${action}`, icon: 'none' })
    },
    speakerAction(action) {
      if (action === 'play') {
        this.speakerState.playing = true
        this.saveDeviceState()
        uni.showToast({ title: '正在播放', icon: 'success' })
      } else if (action === 'pause') {
        this.speakerState.playing = false
        this.saveDeviceState()
        uni.showToast({ title: '已暂停', icon: 'success' })
      } else {
        uni.showToast({ title: `音箱: ${action}`, icon: 'none' })
      }
    },
    // 空气净化器
    onAirModeChange(value) {
      this.airState.mode = value
      this.saveDeviceState()
    },
    onAirFanChange(e) {
      this.airState.fanLevel = e.detail.value
      this.saveDeviceState()
    },
    // 洗衣机
    onWasherModeChange(value) {
      if (this.washerState.remaining > 0) {
        uni.showToast({ title: '洗涤进行中，无法切换', icon: 'none' })
        return
      }
      this.washerState.mode = value
      this.saveDeviceState()
    },
    washerAction(action) {
      if (action === 'start') {
        if (this.washerState.remaining > 0) {
          uni.showToast({ title: '已经在洗涤中啦', icon: 'none' })
          return
        }
        if (!this.device.isPowerOn) {
          setDevicePower(this.device.id, true)
        }
        const total = { standard: 45, quick: 15, heavy: 60, delicate: 30 }
        this.washerState.remaining = total[this.washerState.mode] || 45
        this.saveDeviceState()
        this.startWasherTimer()
        uni.showToast({ title: '洗涤已启动', icon: 'success' })
      } else if (action === 'pause') {
        if (this._washerTimer) {
          clearInterval(this._washerTimer)
          this._washerTimer = null
          uni.showToast({ title: '已暂停', icon: 'none' })
        } else {
          uni.showToast({ title: '当前未运行', icon: 'none' })
        }
      } else if (action === 'stop') {
        if (this._washerTimer) {
          clearInterval(this._washerTimer)
          this._washerTimer = null
        }
        this.washerState.remaining = 0
        this.saveDeviceState()
        uni.showToast({ title: '已取消', icon: 'none' })
      }
    },
    startWasherTimer() {
      if (this._washerTimer) clearInterval(this._washerTimer)
      this._washerTimer = setInterval(() => {
        if (this.washerState.remaining > 0) {
          this.washerState.remaining -= 1
          this.saveDeviceState()
          if (this.washerState.remaining <= 0) {
            clearInterval(this._washerTimer)
            this._washerTimer = null
            uni.showToast({ title: '洗涤完成，衣袂留香', icon: 'success' })
          }
        }
      }, 1000 * 3) // 模拟：3秒=1分钟，用于演示
    },
    // 冰箱
    increaseFridgeCold() {
      if (this.fridgeState.tempCold < 10) {
        this.fridgeState.tempCold += 1
        this.saveDeviceState()
      }
    },
    decreaseFridgeCold() {
      if (this.fridgeState.tempCold > 1) {
        this.fridgeState.tempCold -= 1
        this.saveDeviceState()
      }
    },
    increaseFridgeFreeze() {
      if (this.fridgeState.tempFreeze < -2) {
        this.fridgeState.tempFreeze += 1
        this.saveDeviceState()
      }
    },
    decreaseFridgeFreeze() {
      if (this.fridgeState.tempFreeze > -28) {
        this.fridgeState.tempFreeze -= 1
        this.saveDeviceState()
      }
    },
    onFridgeSmart(mode) {
      if (mode === 'eco') {
        this.fridgeState.tempCold = 6
        this.fridgeState.tempFreeze = -16
        uni.showToast({ title: '已切换节能模式', icon: 'success' })
      } else {
        this.fridgeState.tempCold = 3
        this.fridgeState.tempFreeze = -24
        uni.showToast({ title: '速冷速冻已启动', icon: 'success' })
      }
      this.saveDeviceState()
    },
    // 烤箱
    onOvenTempChange(e) {
      this.ovenState.temp = e.detail.value
      this.saveDeviceState()
    },
    onOvenTimeChange(e) {
      this.ovenState.time = e.detail.value
      this.saveDeviceState()
    },
    // 摄像头
    onCameraNight(e) {
      this.cameraState.nightVision = e.detail.value
      this.saveDeviceState()
      uni.showToast({ title: `夜视已${e.detail.value ? '开启' : '关闭'}`, icon: 'none' })
    },
    onCameraMotion(e) {
      this.cameraState.motionDetect = e.detail.value
      this.saveDeviceState()
      uni.showToast({ title: `移动侦测已${e.detail.value ? '开启' : '关闭'}`, icon: 'none' })
    },
    onCameraRecord(e) {
      this.cameraState.recording = e.detail.value
      this.saveDeviceState()
      uni.showToast({ title: e.detail.value ? '开始录制' : '录制结束', icon: 'none' })
    },
    // 传感器
    refreshSensor() {
      this.sensorState = {
        temperature: Math.round(18 + Math.random() * 10),
        humidity: Math.round(40 + Math.random() * 30),
        pm25: Math.round(8 + Math.random() * 40),
        battery: Math.max(10, Math.round((this.sensorState?.battery || 86) - Math.random() * 2)),
        alarm: !!this.sensorState.alarm
      }
      this.saveDeviceState()
      uni.showToast({ title: '数据已刷新', icon: 'none' })
    },
    toggleAlarm() {
      this.sensorState.alarm = !this.sensorState.alarm
      this.saveDeviceState()
      uni.showToast({ title: this.sensorState.alarm ? '警报已开启' : '警报已关闭', icon: 'none' })
    },
    genericAction(action) {
      if (action === 'on') {
        setDevicePower(this.device.id, true)
        this.loadDevice()
        uni.showToast({ title: '设备已开启', icon: 'success' })
      } else if (action === 'off') {
        setDevicePower(this.device.id, false)
        this.loadDevice()
        uni.showToast({ title: '设备已关闭', icon: 'success' })
      } else {
        uni.showToast({ title: '设备已重置', icon: 'none' })
      }
    },
    saveDeviceState() {
      if (!this.device) return
      const type = this.device.type
      const data = {}
      if (type === 'light') Object.assign(data, this.lightState)
      if (type === 'ac') Object.assign(data, this.acState)
      if (type === 'curtain') Object.assign(data, this.curtainState)
      if (type === 'speaker') Object.assign(data, this.speakerState)
      if (type === 'air') Object.assign(data, this.airState)
      if (type === 'washer') Object.assign(data, this.washerState)
      if (type === 'fridge') Object.assign(data, this.fridgeState)
      if (type === 'oven') Object.assign(data, this.ovenState)
      if (type === 'camera') Object.assign(data, this.cameraState)
      if (type === 'sensor') Object.assign(data, this.sensorState)
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
      return storeDeviceIcon(type)
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

.logs-section {
  margin-top: 30rpx;
}

.logs-card {
  background: #FFF8DC;
  border-radius: 20rpx;
  padding: 20rpx 30rpx;
  border: 2rpx solid #D2B48C;
  margin-top: 16rpx;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 2rpx solid #F5E6C8;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  font-size: 24rpx;
  color: #8B7355;
}

.log-action {
  font-size: 26rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

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

/* 摄像头预览 */
.preview-box {
  background: #2F1810;
  border-radius: 20rpx;
  height: 320rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.preview-emoji { font-size: 96rpx; opacity: 0.7; }

.preview-text {
  font-size: 24rpx;
  color: #FFFAF0;
  margin-top: 16rpx;
  opacity: 0.6;
  font-family: "STKaiti", "KaiTi", serif;
}

.switch-list {
  background: #FFFAF0;
  border-radius: 16rpx;
  padding: 0 24rpx;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96rpx;
  border-bottom: 2rpx solid #F5E6C8;
}

.switch-row:last-child { border-bottom: none; }

.switch-label {
  font-size: 28rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

/* 传感器 */
.sensor-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 12rpx;
}

.sensor-item {
  width: calc(50% - 10rpx);
  background: #FFFAF0;
  border-radius: 20rpx;
  padding: 28rpx 20rpx;
  border: 2rpx solid #F5E6C8;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sensor-icon { font-size: 48rpx; }

.sensor-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #8B4513;
  margin-top: 10rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.sensor-label {
  font-size: 22rpx;
  color: #8B7355;
  margin-top: 6rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

/* 洗衣机剩余时间 */
.remaining {
  margin-top: 20rpx;
  background: #FFFAF0;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  display: flex;
  justify-content: center;
}

.remaining-text {
  font-size: 26rpx;
  color: #8B4513;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

/* 快捷按钮 primary 态（洗涤中） */
.quick-btn.primary {
  background: #8B4513;
  border-color: #8B4513;
}

.quick-btn.primary .quick-text { color: #FFFAF0; }

/* 传感器警报态 */
.alarm-tag {
  display: inline-block;
  padding: 4rpx 12rpx;
  background: #FFFAF0;
  color: #B22222;
  font-size: 22rpx;
  border-radius: 8rpx;
  margin-left: 10rpx;
  border: 2rpx solid #F5C4C4;
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
