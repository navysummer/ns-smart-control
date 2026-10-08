<template>
  <view class="create-scene-container">
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">{{ isEdit ? '编辑场景' : '创建场景' }}</text>
    </view>

    <view class="content">
      <view class="form-card">
        <view class="preset-section" v-if="!isEdit">
          <text class="input-label">诗意预设</text>
          <view class="preset-grid">
            <view
              class="preset-card"
              v-for="preset in presets"
              :key="preset.name"
              @tap="applyPreset(preset)"
            >
              <text class="preset-icon">{{ preset.icon }}</text>
              <text class="preset-name">{{ preset.name }}</text>
            </view>
          </view>
        </view>

        <view class="input-group">
          <text class="input-label">场景名称</text>
          <input
            class="input-field"
            v-model="sceneName"
            placeholder="为场景取个诗意的名字"
            placeholder-style="color: #D2B48C"
          />
        </view>

        <view class="input-group">
          <text class="input-label">场景描述</text>
          <input
            class="input-field"
            v-model="sceneDesc"
            placeholder="描述一下这个场景的氛围"
            placeholder-style="color: #D2B48C"
          />
        </view>

        <view class="input-group">
          <text class="input-label">选择图标</text>
          <view class="icon-grid">
            <view
              class="icon-option"
              v-for="icon in iconOptions"
              :key="icon"
              :class="{ active: selectedIcon === icon }"
              @tap="selectedIcon = icon"
            >
              <text class="icon-text">{{ icon }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="device-section" v-if="availableDevices.length > 0">
        <text class="section-title">关联设备与配置</text>
        <text class="section-hint">勾选启用后，可展开设置每台设备的专属参数</text>
        <view class="device-list">
          <view
            v-for="device in availableDevices"
            :key="device.id"
            class="device-wrap"
            :class="{ selected: isDeviceSelected(device.id) }"
          >
            <view class="device-item" @tap="toggleDevice(device.id)">
              <text class="device-icon">{{ getDeviceIcon(device.type) }}</text>
              <text class="device-name ellipsis">{{ device.name }}</text>
              <text class="device-type">{{ getDeviceTypeName(device.type) }}</text>
              <view class="checkbox" :class="{ on: isDeviceSelected(device.id) }">
                <text v-if="isDeviceSelected(device.id)" class="checkbox-ok">✓</text>
              </view>
            </view>

            <!-- 已选设备可展开配置 -->
            <view class="device-config" v-if="isDeviceSelected(device.id)">
              <view class="config-row">
                <text class="config-label">场景中状态</text>
                <view class="power-switch">
                  <switch
                    :checked="isDevicePowerOn(device.id)"
                    @change="setDevicePower(device.id, $event)"
                    color="#8B4513"
                  />
                  <text class="power-text">{{ isDevicePowerOn(device.id) ? '开启' : '关闭' }}</text>
                </view>
              </view>

              <!-- 灯具 -->
              <block v-if="device.type === 'light' && isDevicePowerOn(device.id)">
                <view class="config-row">
                  <text class="config-label">亮度</text>
                  <slider
                    class="config-slider"
                    :value="deviceConfig(device.id).brightness ?? 80"
                    :min="1" :max="100" :step="1"
                    activeColor="#8B4513" backgroundColor="#D2B48C" block-size="20"
                    :data-id="device.id"
                    @change="setDeviceConfigProp($event, 'brightness')"
                  />
                  <text class="config-value">{{ deviceConfig(device.id).brightness ?? 80 }}%</text>
                </view>
                <view class="config-row">
                  <text class="config-label">色温</text>
                  <view class="color-tabs">
                    <view
                      class="color-tab"
                      v-for="c in [{v:'warm',t:'暖光'},{v:'natural',t:'自然'},{v:'cool',t:'冷光'}]"
                      :key="c.v"
                      :class="{active: (deviceConfig(device.id).color||'warm') === c.v}"
                      :data-id="device.id" :data-value="c.v"
                      @tap="setDeviceConfigEnum($event, 'color')"
                    >
                      <text>{{ c.t }}</text>
                    </view>
                  </view>
                </view>
              </block>

              <!-- 空调 -->
              <block v-if="device.type === 'ac' && isDevicePowerOn(device.id)">
                <view class="config-row">
                  <text class="config-label">温度</text>
                  <view class="num-stepper">
                    <view class="num-btn" :data-id="device.id" data-step="-1" @tap="stepDeviceTemp">-</view>
                    <text class="num-value">{{ deviceConfig(device.id).temperature ?? 26 }}℃</text>
                    <view class="num-btn" :data-id="device.id" data-step="1" @tap="stepDeviceTemp">+</view>
                  </view>
                </view>
                <view class="config-row">
                  <text class="config-label">模式</text>
                  <view class="color-tabs">
                    <view
                      class="color-tab"
                      v-for="m in [{v:'cool',t:'制冷'},{v:'heat',t:'制热'},{v:'auto',t:'自动'},{v:'dry',t:'除湿'}]"
                      :key="m.v"
                      :class="{active: (deviceConfig(device.id).mode||'cool') === m.v}"
                      :data-id="device.id" :data-value="m.v"
                      @tap="setDeviceConfigEnum($event, 'mode')"
                    >
                      <text>{{ m.t }}</text>
                    </view>
                  </view>
                </view>
              </block>

              <!-- 窗帘 -->
              <block v-if="device.type === 'curtain' && isDevicePowerOn(device.id)">
                <view class="config-row">
                  <text class="config-label">开合度</text>
                  <slider
                    class="config-slider"
                    :value="deviceConfig(device.id).openPercent ?? 80"
                    :min="0" :max="100" :step="5"
                    activeColor="#8B4513" backgroundColor="#D2B48C" block-size="20"
                    :data-id="device.id"
                    @change="setDeviceConfigProp($event, 'openPercent')"
                  />
                  <text class="config-value">{{ deviceConfig(device.id).openPercent ?? 80 }}%</text>
                </view>
              </block>

              <!-- 音箱 -->
              <block v-if="device.type === 'speaker' && isDevicePowerOn(device.id)">
                <view class="config-row">
                  <text class="config-label">音量</text>
                  <slider
                    class="config-slider"
                    :value="deviceConfig(device.id).volume ?? 40"
                    :min="0" :max="100" :step="1"
                    activeColor="#8B4513" backgroundColor="#D2B48C" block-size="20"
                    :data-id="device.id"
                    @change="setDeviceConfigProp($event, 'volume')"
                  />
                  <text class="config-value">{{ deviceConfig(device.id).volume ?? 40 }}%</text>
                </view>
              </block>

              <!-- 净化器 -->
              <block v-if="device.type === 'air' && isDevicePowerOn(device.id)">
                <view class="config-row">
                  <text class="config-label">档位</text>
                  <slider
                    class="config-slider"
                    :value="deviceConfig(device.id).fanLevel ?? 2"
                    :min="1" :max="5" :step="1"
                    activeColor="#8B4513" backgroundColor="#D2B48C" block-size="20"
                    :data-id="device.id"
                    @change="setDeviceConfigProp($event, 'fanLevel')"
                  />
                  <text class="config-value">{{ deviceConfig(device.id).fanLevel ?? 2 }}档</text>
                </view>
              </block>

              <view class="config-tip" v-if="!isDevicePowerOn(device.id)">
                <text class="config-tip-text">此设备在该场景中为关闭状态</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="device-section" v-else>
        <text class="section-title">关联设备</text>
        <text class="empty-hint">暂无可用设备，请先添加设备</text>
      </view>

      <view class="create-btn" @tap="createScene">
        <text class="btn-text">{{ isEdit ? '保存修改' : '创建场景' }}</text>
      </view>

      <view class="poem-section">
        <text class="poem-text">「 一键之间，诗意盎然 」</text>
      </view>
    </view>
  </view>
</template>

<script>
import {
  getStore,
  getFamilyDevices,
  addScene,
  updateScene,
  getCurrentUserRole,
  getDeviceDefaultConfig,
  getDeviceIcon as storeDeviceIcon,
  getDeviceTypeName as storeDeviceTypeName
} from '@/store/index.js'

/**
 * 预设 → 默认设备配置映射（根据预设名称给出合理的默认参数）
 */
const PRESET_DEFAULT_CONFIG = {
  '晨曦初露': {
    light: { isPowerOn: true, brightness: 60, color: 'natural' },
    curtain: { isPowerOn: true, openPercent: 100 },
    ac: { isPowerOn: false },
    speaker: { isPowerOn: true, volume: 35 },
    air: { isPowerOn: true, fanLevel: 2 }
  },
  '月明风清': {
    light: { isPowerOn: true, brightness: 40, color: 'warm' },
    curtain: { isPowerOn: true, openPercent: 30 },
    ac: { isPowerOn: true, temperature: 27, mode: 'auto' },
    speaker: { isPowerOn: false },
    air: { isPowerOn: true, fanLevel: 1 }
  },
  '温馨归家': {
    light: { isPowerOn: true, brightness: 80, color: 'warm' },
    curtain: { isPowerOn: true, openPercent: 80 },
    ac: { isPowerOn: true, temperature: 26, mode: 'cool' },
    speaker: { isPowerOn: true, volume: 40 },
    air: { isPowerOn: true, fanLevel: 2 }
  },
  '静夜书斋': {
    light: { isPowerOn: true, brightness: 70, color: 'natural' },
    curtain: { isPowerOn: true, openPercent: 0 },
    ac: { isPowerOn: true, temperature: 26, mode: 'auto' },
    speaker: { isPowerOn: false },
    air: { isPowerOn: true, fanLevel: 1 }
  },
  '观影时光': {
    light: { isPowerOn: true, brightness: 20, color: 'warm' },
    curtain: { isPowerOn: true, openPercent: 0 },
    ac: { isPowerOn: true, temperature: 26, mode: 'cool' },
    speaker: { isPowerOn: true, volume: 60 },
    air: { isPowerOn: true, fanLevel: 2 }
  },
  '安眠之夜': {
    light: { isPowerOn: false },
    curtain: { isPowerOn: true, openPercent: 0 },
    ac: { isPowerOn: true, temperature: 27, mode: 'auto', fanLevel: 1 },
    speaker: { isPowerOn: false },
    air: { isPowerOn: true, fanLevel: 1 }
  }
}

export default {
  data() {
    return {
      sceneId: '',
      isEdit: false,
      sceneName: '',
      sceneDesc: '',
      selectedIcon: '🌅',
      // 切换为对象结构：{ [deviceId]: { isPowerOn, ...config } }
      deviceConfigs: {},
      iconOptions: ['🌅', '🌙', '🏠', '🎵', '📖', '🎬', '💤', '🎉', '☀️', '🌧️', '🌸', '❄️'],
      presets: [
        { name: '晨曦初露', desc: '晨光熹微，万物初醒', icon: '🌅' },
        { name: '月明风清', desc: '月色清辉，晚风徐来', icon: '🌙' },
        { name: '温馨归家', desc: '华灯初上，静候归人', icon: '🏠' },
        { name: '静夜书斋', desc: '灯下读书，心静如水', icon: '📖' },
        { name: '观影时光', desc: '光影流转，惬意时光', icon: '🎬' },
        { name: '安眠之夜', desc: '好梦相随，安枕入眠', icon: '💤' }
      ]
    }
  },
  onLoad(options) {
    if (getCurrentUserRole() !== '家长') {
      uni.showToast({ title: '仅家长可管理场景', icon: 'none' })
      setTimeout(() => {
        uni.navigateBack()
      }, 800)
      return
    }
    if (options && options.id) {
      this.sceneId = options.id
      this.isEdit = true
      const scene = getStore().scenes.find(s => s.id === this.sceneId)
      if (scene) {
        this.sceneName = scene.name || ''
        this.sceneDesc = scene.description || ''
        this.selectedIcon = scene.icon || '🌅'
        const cfg = {}
        ;(scene.devices || []).forEach(item => {
          cfg[item.deviceId] = { isPowerOn: true, ...(item.config || {}) }
        })
        this.deviceConfigs = cfg
      }
    }
  },
  computed: {
    availableDevices() {
      return getFamilyDevices()
    },
    selectedDevices() {
      return Object.keys(this.deviceConfigs)
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    applyPreset(preset) {
      this.sceneName = preset.name
      this.sceneDesc = preset.desc
      this.selectedIcon = preset.icon
      // 根据预设给所有已选设备（或当前全部设备）设置默认参数
      const devices = this.availableDevices
      const template = PRESET_DEFAULT_CONFIG[preset.name] || {}
      const cfg = { ...this.deviceConfigs }
      devices.forEach(d => {
        const base = (template[d.type] && typeof template[d.type] === 'object')
          ? { ...template[d.type] }
          : { isPowerOn: true }
        cfg[d.id] = { ...getDeviceDefaultConfig(d.type), ...base }
      })
      this.deviceConfigs = cfg
      uni.showToast({ title: `已选用「${preset.name}」`, icon: 'none' })
    },
    isDeviceSelected(deviceId) {
      return Object.prototype.hasOwnProperty.call(this.deviceConfigs, deviceId)
    },
    toggleDevice(deviceId) {
      const next = { ...this.deviceConfigs }
      if (this.isDeviceSelected(deviceId)) {
        delete next[deviceId]
      } else {
        const device = this.availableDevices.find(d => d.id === deviceId)
        next[deviceId] = {
          ...getDeviceDefaultConfig(device ? device.type : 'light'),
          isPowerOn: true
        }
      }
      this.deviceConfigs = next
    },
    isDevicePowerOn(deviceId) {
      const cfg = this.deviceConfigs[deviceId]
      return !!(cfg && cfg.isPowerOn)
    },
    deviceConfig(deviceId) {
      return this.deviceConfigs[deviceId] || {}
    },
    setDevicePower(deviceId, e) {
      const on = !!(e && e.detail && e.detail.value)
      const device = this.availableDevices.find(d => d.id === deviceId)
      const current = this.deviceConfigs[deviceId] || {}
      const next = { ...this.deviceConfigs }
      if (on) {
        next[deviceId] = {
          ...getDeviceDefaultConfig(device ? device.type : 'light'),
          ...current,
          isPowerOn: true
        }
      } else {
        next[deviceId] = { ...current, isPowerOn: false }
      }
      this.deviceConfigs = next
    },
    setDeviceConfigProp(e, prop) {
      const id = e.currentTarget.dataset.id
      const value = e.detail.value
      const cfg = { ...this.deviceConfigs }
      cfg[id] = { ...(cfg[id] || {}), [prop]: value }
      this.deviceConfigs = cfg
    },
    setDeviceConfigEnum(e, prop) {
      const id = e.currentTarget.dataset.id
      const value = e.currentTarget.dataset.value
      const cfg = { ...this.deviceConfigs }
      cfg[id] = { ...(cfg[id] || {}), [prop]: value }
      this.deviceConfigs = cfg
    },
    stepDeviceTemp(e) {
      const id = e.currentTarget.dataset.id
      const step = parseInt(e.currentTarget.dataset.step, 10) || 0
      const current = ((this.deviceConfigs[id] || {}).temperature) ?? 26
      let next = current + step
      next = Math.max(16, Math.min(30, next))
      const cfg = { ...this.deviceConfigs }
      cfg[id] = { ...(cfg[id] || {}), temperature: next }
      this.deviceConfigs = cfg
    },
    createScene() {
      if (!this.sceneName.trim()) {
        uni.showToast({ title: '请输入场景名称', icon: 'none' })
        return
      }
      const ids = Object.keys(this.deviceConfigs)
      if (ids.length === 0) {
        uni.showToast({ title: '至少关联一台设备', icon: 'none' })
        return
      }
      const devices = ids.map(deviceId => ({
        deviceId,
        config: { ...this.deviceConfigs[deviceId] }
      }))
      const payload = {
        name: this.sceneName.trim(),
        description: this.sceneDesc.trim() || '诗意场景',
        icon: this.selectedIcon,
        devices
      }
      if (this.isEdit) {
        updateScene(this.sceneId, payload)
        uni.showToast({ title: '保存成功', icon: 'success' })
      } else {
        addScene(payload)
        uni.showToast({ title: '创建成功', icon: 'success' })
      }
      setTimeout(() => {
        uni.navigateBack()
      }, 1200)
    },
    getDeviceIcon(type) {
      return storeDeviceIcon(type)
    },
    getDeviceTypeName(type) {
      return storeDeviceTypeName(type)
    }
  }
}
</script>

<style scoped>
.create-scene-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFAF0 0%, #FFF8DC 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 80rpx 40rpx 30rpx;
  background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon { font-size: 40rpx; color: #FFFAF0; }

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  color: #FFFAF0;
  font-weight: bold;
  margin-right: 60rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.content { padding: 30rpx; }

.form-card {
  background: #FFF8DC;
  border-radius: 24rpx;
  padding: 30rpx;
  border: 2rpx solid #D2B48C;
  margin-bottom: 30rpx;
}

.preset-section {
  margin-bottom: 24rpx;
}

.preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.preset-card {
  width: calc(33.33% - 11rpx);
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 16rpx;
  padding: 20rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preset-icon {
  font-size: 40rpx;
}

.preset-name {
  font-size: 22rpx;
  color: #2F1810;
  margin-top: 8rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.input-group { margin-bottom: 24rpx; }
.input-group:last-child { margin-bottom: 0; }

.input-label {
  font-size: 26rpx;
  color: #2F1810;
  margin-bottom: 12rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.input-field {
  width: 100%;
  height: 80rpx;
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.icon-option {
  width: 80rpx;
  height: 80rpx;
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-option.active {
  border-color: #8B4513;
  background: linear-gradient(135deg, #FFF8DC 0%, #FFFAF0 100%);
}

.icon-text { font-size: 40rpx; }

.device-section { margin-bottom: 30rpx; }

.section-title {
  font-size: 28rpx;
  color: #2F1810;
  font-weight: bold;
  margin-bottom: 8rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.section-hint {
  font-size: 24rpx;
  color: #8B7355;
  margin-bottom: 16rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.empty-hint {
  font-size: 24rpx;
  color: #8B7355;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.device-list {
  background: #FFF8DC;
  border-radius: 16rpx;
  border: 2rpx solid #D2B48C;
  overflow: hidden;
}

.device-wrap {
  border-bottom: 1rpx solid #D2B48C;
}

.device-wrap:last-child { border-bottom: none; }

.device-wrap.selected {
  background: linear-gradient(180deg, #FFFAF0 0%, #FFF8DC 100%);
}

.device-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
}

.device-icon { font-size: 32rpx; margin-right: 16rpx; }

.device-name {
  flex: 1;
  font-size: 28rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
  margin-right: 16rpx;
  max-width: 260rpx;
}

.device-type {
  font-size: 22rpx;
  color: #8B7355;
  padding: 4rpx 14rpx;
  background: #FFFAF0;
  border: 2rpx solid #F5E6C8;
  border-radius: 999rpx;
  margin-right: 20rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid #D2B48C;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFFAF0;
}

.checkbox.on {
  border-color: #8B4513;
  background: #8B4513;
}

.checkbox-ok {
  color: #FFFAF0;
  font-size: 22rpx;
  font-weight: bold;
  line-height: 1;
}

/* 设备专属配置区 */
.device-config {
  padding: 0 24rpx 24rpx;
  background: #FFFAF0;
  border-top: 2rpx dashed #D2B48C;
  margin: 0 20rpx 16rpx;
  border-radius: 16rpx;
}

.config-row {
  display: flex;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 2rpx solid #F5E6C8;
  gap: 20rpx;
}

.config-row:last-of-type { border-bottom: none; }

.config-label {
  width: 140rpx;
  flex-shrink: 0;
  font-size: 26rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.config-slider {
  flex: 1;
}

.config-value {
  width: 80rpx;
  text-align: right;
  font-size: 26rpx;
  color: #8B4513;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.power-switch {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.power-text {
  font-size: 26rpx;
  color: #8B4513;
  font-family: "STKaiti", "KaiTi", serif;
}

.color-tabs {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.color-tab {
  padding: 10rpx 20rpx;
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #8B7355;
  font-family: "STKaiti", "KaiTi", serif;
}

.color-tab.active {
  background: #8B4513;
  border-color: #8B4513;
  color: #FFFAF0;
}

.num-stepper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.num-btn {
  width: 60rpx;
  height: 60rpx;
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8B4513;
  font-size: 36rpx;
  line-height: 1;
}

.num-value {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #8B4513;
  font-family: "STKaiti", "KaiTi", serif;
}

.config-tip {
  margin-top: 16rpx;
  text-align: center;
}

.config-tip-text {
  font-size: 22rpx;
  color: #A5937A;
  font-family: "STKaiti", "KaiTi", serif;
}

.create-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  font-size: 32rpx;
  color: #FFFAF0;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.poem-section { text-align: center; margin-top: 40rpx; }

.poem-text {
  font-size: 24rpx;
  color: #8B7355;
  font-style: italic;
  font-family: "STKaiti", "KaiTi", serif;
}
</style>
