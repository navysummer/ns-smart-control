<template>
  <view class="family-detail-container">
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">家庭详情</text>
      <view class="more-btn" @tap="showFamilySettings">
        <text class="more-icon">⋯</text>
      </view>
    </view>

    <view class="content" v-if="family">
      <view class="family-info-card">
        <view class="family-header">
          <view class="family-icon">
            <text class="icon-text">🏠</text>
          </view>
          <view class="family-info">
            <text class="family-name">{{ family.name }}</text>
            <text class="family-desc">{{ family.description || '家和万事兴' }}</text>
          </view>
        </view>
        <view class="family-stats">
          <view class="stat-item">
            <text class="stat-value">{{ family.memberCount || 1 }}</text>
            <text class="stat-label">成员</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ familyDevices.length }}</text>
            <text class="stat-label">设备</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ familyScenes.length }}</text>
            <text class="stat-label">场景</text>
          </view>
        </view>
      </view>

      <view class="quick-actions">
        <view class="action-card" @tap="goToMember">
          <text class="action-icon">👥</text>
          <text class="action-text">家庭成员</text>
        </view>
        <view class="action-card" @tap="goToAddDevice">
          <text class="action-icon">📱</text>
          <text class="action-text">添加设备</text>
        </view>
        <view class="action-card" @tap="goToCreateScene">
          <text class="action-icon">✨</text>
          <text class="action-text">添加场景</text>
        </view>
        <view class="action-card" @tap="showFamilySettings">
          <text class="action-icon">⚙️</text>
          <text class="action-text">家庭设置</text>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">我的设备</text>
        </view>
        <view v-if="familyDevices.length === 0" class="empty-state" @tap="goToAddDevice">
          <text class="empty-icon">📱</text>
          <text class="empty-text">暂无设备，点击添加</text>
        </view>
        <view class="device-list" v-else>
          <view
            class="device-item"
            v-for="device in familyDevices"
            :key="device.id"
            @tap="controlDevice(device)"
          >
            <view class="device-icon">
              <text class="icon-text">{{ getDeviceIcon(device.type) }}</text>
            </view>
            <view class="device-info">
              <text class="device-name">{{ device.name }}</text>
              <text class="device-status">{{ device.isOnline ? '在线' : '离线' }}</text>
            </view>
            <view class="device-switch">
              <switch :checked="device.isPowerOn" @change="toggleDevice(device)" color="#8B4513" />
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">诗意场景</text>
        </view>
        <view v-if="familyScenes.length === 0" class="empty-state">
          <text class="empty-icon">✨</text>
          <text class="empty-text">暂无场景</text>
        </view>
        <view class="scene-list" v-else>
          <view
            class="scene-card"
            v-for="scene in familyScenes"
            :key="scene.id"
            @tap="activateScene(scene)"
          >
            <text class="scene-icon">{{ scene.icon }}</text>
            <view class="scene-info">
              <text class="scene-name">{{ scene.name }}</text>
              <text class="scene-desc">{{ scene.description }}</text>
            </view>
            <view class="scene-arrow">
              <text class="arrow-icon">→</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state-full" v-else>
      <text class="empty-icon">🏠</text>
      <text class="empty-text">请先创建一个家庭</text>
      <view class="create-btn" @tap="goToCreateFamily">
        <text class="btn-text">创建家庭</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getStore, loadLocal, setCurrentFamily, removeFamily, toggleDevicePower } from '@/store/index.js'

export default {
  data() {
    return {
      family: null,
      devices: [],
      scenes: []
    }
  },
  computed: {
    familyDevices() {
      if (!this.family) return []
      return this.devices.filter(d => d.familyId === this.family.id)
    },
    familyScenes() {
      if (!this.family) return []
      return this.scenes.filter(s => s.familyId === this.family.id)
    }
  },
  onShow() {
    loadLocal()
    this.refreshData()
  },
  methods: {
    refreshData() {
      const s = getStore()
      this.family = s.families.find(f => f.id === s.currentFamilyId) || s.families[0] || null
      if (this.family && !s.currentFamilyId) {
        setCurrentFamily(this.family.id)
      }
      this.devices = s.devices
      this.scenes = s.scenes
    },
    goBack() {
      uni.navigateBack()
    },
    goToMember() {
      if (!this.family) return
      uni.navigateTo({ url: `/pages/family/member?familyId=${this.family.id}` })
    },
    goToAddDevice() {
      if (!this.family) return
      setCurrentFamily(this.family.id)
      uni.navigateTo({ url: '/pages/device/add' })
    },
    goToCreateScene() {
      if (!this.family) return
      setCurrentFamily(this.family.id)
      uni.navigateTo({ url: '/pages/scene/create' })
    },
    goToCreateFamily() {
      uni.navigateTo({ url: '/pages/family/create' })
    },
    showFamilySettings() {
      if (!this.family) return
      uni.showActionSheet({
        itemList: ['编辑家庭名称', '删除家庭'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.showModal({
              title: '编辑家庭名称',
              editable: true,
              placeholderText: this.family.name,
              confirmColor: '#8B4513',
              success: (r) => {
                if (r.confirm && r.content) {
                  this.family.name = r.content.trim()
                  uni.showToast({ title: '修改成功', icon: 'success' })
                }
              }
            })
          } else if (res.tapIndex === 1) {
            uni.showModal({
              title: '确认删除',
              content: `确定要删除家庭「${this.family.name}」吗？`,
              confirmColor: '#B22222',
              success: (r) => {
                if (r.confirm) {
                  removeFamily(this.family.id)
                  uni.showToast({ title: '已删除', icon: 'success' })
                  this.refreshData()
                }
              }
            })
          }
        }
      })
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
.family-detail-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFAF0 0%, #FFF8DC 100%);
  padding-bottom: 120rpx;
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
.more-icon { font-size: 40rpx; color: #FFFAF0; }

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  color: #FFFAF0;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.content { padding: 30rpx; }

.family-info-card {
  background: #FFF8DC;
  border-radius: 30rpx;
  padding: 40rpx;
  border: 2rpx solid #D2B48C;
  margin-bottom: 30rpx;
}

.family-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.family-icon {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #DEB887 0%, #D2B48C 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.icon-text { font-size: 60rpx; }
.family-info { flex: 1; }

.family-name {
  font-size: 36rpx;
  color: #2F1810;
  font-weight: bold;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.family-desc {
  font-size: 24rpx;
  color: #8B7355;
  margin-top: 8rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.family-stats {
  display: flex;
  justify-content: space-around;
  border-top: 2rpx solid #D2B48C;
  padding-top: 30rpx;
}

.stat-item { display: flex; flex-direction: column; align-items: center; }

.stat-value {
  font-size: 40rpx;
  color: #8B4513;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.stat-label {
  font-size: 22rpx;
  color: #8B7355;
  margin-top: 8rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.action-card {
  width: calc(25% - 15rpx);
  background: #FFF8DC;
  border-radius: 20rpx;
  padding: 24rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2rpx solid #D2B48C;
}

.action-icon { font-size: 48rpx; }

.action-text {
  font-size: 22rpx;
  color: #2F1810;
  margin-top: 12rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.section { margin-bottom: 30rpx; }

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

.empty-state {
  background: #FFF8DC;
  border: 2rpx dashed #D2B48C;
  border-radius: 20rpx;
  padding: 60rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon { font-size: 64rpx; margin-bottom: 16rpx; }

.empty-text {
  font-size: 26rpx;
  color: #8B7355;
  font-family: "STKaiti", "KaiTi", serif;
}

.device-list {
  background: #FFF8DC;
  border-radius: 20rpx;
  border: 2rpx solid #D2B48C;
}

.device-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #D2B48C;
}

.device-item:last-child { border-bottom: none; }

.device-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #DEB887 0%, #D2B48C 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.device-info { flex: 1; }

.device-name {
  font-size: 28rpx;
  color: #2F1810;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.device-status {
  font-size: 22rpx;
  color: #8B7355;
  margin-top: 6rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.scene-list {
  background: #FFF8DC;
  border-radius: 20rpx;
  border: 2rpx solid #D2B48C;
}

.scene-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #D2B48C;
}

.scene-card:last-child { border-bottom: none; }
.scene-icon { font-size: 48rpx; margin-right: 24rpx; }
.scene-info { flex: 1; }

.scene-name {
  font-size: 28rpx;
  color: #2F1810;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.scene-desc {
  font-size: 22rpx;
  color: #8B7355;
  margin-top: 6rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.scene-arrow {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon { font-size: 28rpx; color: #8B7355; }

.empty-state-full {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.create-btn {
  margin-top: 40rpx;
  width: 300rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  font-size: 28rpx;
  color: #FFFAF0;
  font-family: "STKaiti", "KaiTi", serif;
}
</style>
