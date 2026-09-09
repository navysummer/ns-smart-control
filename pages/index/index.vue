<template>
  <view class="container">
    <view class="nav-bar">
      <view class="nav-title">
        <text class="title-text">智能家居</text>
        <text class="subtitle-text">古韵智慧，诗意生活</text>
      </view>
    </view>

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
      <scroll-view scroll-x class="family-scroll" v-else>
        <view
          class="family-card"
          v-for="family in families"
          :key="family.id"
          :class="{ active: currentFamilyId === family.id }"
          @tap="selectFamily(family)"
        >
          <text class="family-name">{{ family.name }}</text>
          <text class="family-desc">{{ family.memberCount }}人</text>
        </view>
      </scroll-view>
    </view>

    <view class="device-section" v-if="currentFamilyId">
      <view class="section-header">
        <text class="section-title">我的设备</text>
        <view class="add-btn" @tap="goToAddDevice">
          <text class="add-icon">+</text>
        </view>
      </view>
      <view v-if="familyDevices.length === 0" class="empty-state" @tap="goToAddDevice">
        <text class="empty-icon">📱</text>
        <text class="empty-text">暂无设备，点击添加</text>
      </view>
      <view class="device-grid" v-else>
        <view
          class="device-card"
          v-for="device in familyDevices"
          :key="device.id"
          @tap="controlDevice(device)"
        >
          <view class="device-icon">
            <text class="icon-text">{{ getDeviceIcon(device.type) }}</text>
          </view>
          <text class="device-name">{{ device.name }}</text>
          <text class="device-status">{{ device.isOnline ? '在线' : '离线' }}</text>
          <view class="device-switch">
            <switch :checked="device.isPowerOn" @change="toggleDevice(device)" color="#8B4513" />
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

    <view class="scene-section" v-if="currentFamilyId">
      <view class="section-header">
        <text class="section-title">诗意场景</text>
        <view class="add-btn" @tap="goToCreateScene">
          <text class="add-icon">+</text>
        </view>
      </view>
      <view v-if="familyScenes.length === 0" class="empty-state">
        <text class="empty-icon">✨</text>
        <text class="empty-text">暂无场景</text>
      </view>
      <view class="scene-list" v-else>
        <view class="scene-card" v-for="scene in familyScenes" :key="scene.id" @tap="activateScene(scene)">
          <text class="scene-icon">{{ scene.icon }}</text>
          <text class="scene-name">{{ scene.name }}</text>
          <text class="scene-desc">{{ scene.description }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getStore, loadLocal, setCurrentFamily, toggleDevicePower } from '@/store/index.js'

export default {
  data() {
    return {
      families: [],
      currentFamilyId: null,
      devices: [],
      scenes: []
    }
  },
  computed: {
    familyDevices() {
      return this.devices.filter(d => d.familyId === this.currentFamilyId)
    },
    familyScenes() {
      return this.scenes.filter(s => s.familyId === this.currentFamilyId)
    }
  },
  onShow() {
    loadLocal()
    this.refreshData()
  },
  methods: {
    refreshData() {
      const s = getStore()
      this.families = s.families
      this.currentFamilyId = s.currentFamilyId
      this.devices = s.devices
      this.scenes = s.scenes
    },
    goToCreateFamily() {
      uni.navigateTo({ url: '/pages/family/create' })
    },
    goToAddDevice() {
      if (!this.currentFamilyId) {
        uni.showToast({ title: '请先创建家庭', icon: 'none' })
        return
      }
      uni.navigateTo({ url: '/pages/device/add' })
    },
    goToCreateScene() {
      uni.navigateTo({ url: '/pages/scene/create' })
    },
    selectFamily(family) {
      setCurrentFamily(family.id)
      this.currentFamilyId = family.id
    },
    controlDevice(device) {
      uni.navigateTo({ url: `/pages/device/control?id=${device.id}` })
    },
    toggleDevice(device) {
      toggleDevicePower(device.id)
      this.refreshData()
      uni.showToast({
        title: device.isPowerOn ? '设备已关闭' : '设备已开启',
        icon: 'success'
      })
    },
    activateScene(scene) {
      uni.showToast({ title: `${scene.name} 已激活`, icon: 'success' })
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
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFAF0 0%, #FFF8DC 100%);
  padding-bottom: 120rpx;
}

.nav-bar {
  background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
  padding: 80rpx 40rpx 40rpx;
  border-radius: 0 0 40rpx 40rpx;
}

.nav-title {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-text {
  font-size: 48rpx;
  color: #FFFAF0;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.subtitle-text {
  font-size: 24rpx;
  color: #DEB887;
  margin-top: 8rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.family-section, .device-section, .scene-section {
  margin: 30rpx 30rpx;
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

.add-btn {
  width: 48rpx;
  height: 48rpx;
  background: #8B4513;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  color: #FFFAF0;
  font-size: 32rpx;
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
}

.family-scroll {
  white-space: nowrap;
}

.family-card {
  display: inline-block;
  width: 280rpx;
  padding: 30rpx;
  background: #FFF8DC;
  border-radius: 20rpx;
  margin-right: 20rpx;
  border: 2rpx solid #D2B48C;
}

.family-card.active {
  border-color: #8B4513;
  background: linear-gradient(135deg, #FFF8DC 0%, #FFFAF0 100%);
}

.family-name {
  font-size: 30rpx;
  color: #2F1810;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.family-desc {
  font-size: 24rpx;
  color: #8B7355;
  margin-top: 10rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.device-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.device-card {
  width: calc(50% - 10rpx);
  background: #FFF8DC;
  border-radius: 20rpx;
  padding: 30rpx;
  border: 2rpx solid #D2B48C;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.device-icon {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #DEB887 0%, #D2B48C 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 48rpx;
}

.device-name {
  font-size: 28rpx;
  color: #2F1810;
  margin-top: 16rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.device-status {
  font-size: 22rpx;
  color: #8B7355;
  margin-top: 8rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.device-switch {
  margin-top: 16rpx;
}

.scene-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.scene-card {
  width: calc(33.33% - 14rpx);
  background: linear-gradient(135deg, #FFF8DC 0%, #FFFAF0 100%);
  border-radius: 20rpx;
  padding: 24rpx;
  border: 2rpx solid #D2B48C;
  display: flex;
  flex-direction: column;
  align-items: center;
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
}

.scene-desc {
  font-size: 20rpx;
  color: #8B7355;
  margin-top: 8rpx;
  text-align: center;
  font-family: "STKaiti", "KaiTi", serif;
}
</style>
