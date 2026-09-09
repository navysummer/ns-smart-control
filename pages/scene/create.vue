<template>
  <view class="create-scene-container">
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">创建场景</text>
    </view>

    <view class="content">
      <view class="form-card">
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
        <text class="section-title">关联设备</text>
        <text class="section-hint">选择此场景要控制的设备</text>
        <view class="device-list">
          <view
            class="device-item"
            v-for="device in availableDevices"
            :key="device.id"
            :class="{ selected: selectedDevices.includes(device.id) }"
            @tap="toggleDevice(device.id)"
          >
            <text class="device-icon">{{ getDeviceIcon(device.type) }}</text>
            <text class="device-name">{{ device.name }}</text>
            <text class="device-check" v-if="selectedDevices.includes(device.id)">✓</text>
          </view>
        </view>
      </view>

      <view class="device-section" v-else>
        <text class="section-title">关联设备</text>
        <text class="empty-hint">暂无可用设备，请先添加设备</text>
      </view>

      <view class="create-btn" @tap="createScene">
        <text class="btn-text">创建场景</text>
      </view>

      <view class="poem-section">
        <text class="poem-text">「 一键之间，诗意盎然 」</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getFamilyDevices, addScene } from '@/store/index.js'

export default {
  data() {
    return {
      sceneName: '',
      sceneDesc: '',
      selectedIcon: '🌅',
      selectedDevices: [],
      iconOptions: ['🌅', '🌙', '🏠', '🎵', '📖', '🎬', '💤', '🎉', '☀️', '🌧️', '🌸', '❄️']
    }
  },
  computed: {
    availableDevices() {
      return getFamilyDevices()
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    toggleDevice(deviceId) {
      const index = this.selectedDevices.indexOf(deviceId)
      if (index > -1) {
        this.selectedDevices.splice(index, 1)
      } else {
        this.selectedDevices.push(deviceId)
      }
    },
    createScene() {
      if (!this.sceneName.trim()) {
        uni.showToast({ title: '请输入场景名称', icon: 'none' })
        return
      }

      const devices = this.selectedDevices.map(deviceId => ({
        deviceId,
        config: { isPowerOn: true }
      }))

      addScene({
        name: this.sceneName.trim(),
        description: this.sceneDesc.trim() || '诗意场景',
        icon: this.selectedIcon,
        devices
      })

      uni.showToast({ title: '创建成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
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

.device-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #D2B48C;
}

.device-item:last-child { border-bottom: none; }

.device-item.selected {
  background: linear-gradient(135deg, #FFF8DC 0%, #FFFAF0 100%);
}

.device-icon { font-size: 32rpx; margin-right: 16rpx; }

.device-name {
  flex: 1;
  font-size: 28rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.device-check {
  font-size: 28rpx;
  color: #8B4513;
  font-weight: bold;
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
