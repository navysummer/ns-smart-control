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

        <view class="stats-overview" v-if="familyDevices.length">
          <view class="overview-row">
            <view class="overview-item">
              <text class="overview-dot online"></text>
              <text class="overview-label">在线</text>
              <text class="overview-num">{{ onlineDeviceCount }}/{{ familyDevices.length }}</text>
            </view>
            <view class="overview-divider"></view>
            <view class="overview-item">
              <text class="overview-dot powered"></text>
              <text class="overview-label">运行中</text>
              <text class="overview-num">{{ poweredDeviceCount }}</text>
            </view>
            <view class="overview-divider"></view>
            <view class="overview-item">
              <text class="overview-dot scene"></text>
              <text class="overview-label">场景</text>
              <text class="overview-num">{{ familyScenes.length }}</text>
            </view>
          </view>
          <view class="overview-bar">
            <view class="bar-filled" :style="{ width: onlinePercent + '%', background: '#6A9955' }"></view>
            <view class="bar-filled" :style="{ width: poweredPercent + '%', marginLeft: '2rpx', background: '#CD853F' }"></view>
          </view>
          <view class="overview-tip">
            <text class="overview-tip-text">{{ overviewTip }}</text>
          </view>
        </view>
      </view>

      <view class="quick-actions">
        <view class="action-card" @tap="goToMember">
          <text class="action-icon">👥</text>
          <text class="action-text">家庭成员</text>
        </view>
        <view class="action-card" v-if="isOwner" @tap="goToAddDevice">
          <text class="action-icon">📱</text>
          <text class="action-text">添加设备</text>
        </view>
        <view class="action-card" v-if="isOwner" @tap="goToCreateScene">
          <text class="action-icon">✨</text>
          <text class="action-text">添加场景</text>
        </view>
        <view class="action-card" v-if="isOwner" @tap="showFamilySettings">
          <text class="action-icon">⚙️</text>
          <text class="action-text">家庭设置</text>
        </view>
        <view class="action-card secondary" @tap="powerAll(true)">
          <text class="action-icon">☀️</text>
          <text class="action-text">一键全开</text>
        </view>
        <view class="action-card secondary" @tap="powerAll(false)">
          <text class="action-icon">🌙</text>
          <text class="action-text">一键全关</text>
        </view>
        <view class="action-card secondary" @tap="goHome">
          <text class="action-icon">🏡</text>
          <text class="action-text">返回首页</text>
        </view>
        <view class="action-card secondary" @tap="showAbout">
          <text class="action-icon">🏷️</text>
          <text class="action-text">家庭信息</text>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">我的设备</text>
        </view>
        <view v-if="familyDevices.length === 0" class="empty-state" @tap="goToAddDevice">
          <text class="empty-icon">📱</text>
          <text class="empty-text">{{ isOwner ? '暂无设备，点击添加' : '暂无设备' }}</text>
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
            @tap="onSceneTap(scene)"
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
import { getStore, loadLocal, setCurrentFamily, removeFamily, toggleDevicePower, updateFamily, activateScene, removeScene, requireLogin, getCurrentUserRole, powerOffAllDevices, batchUpdateDevices, getDeviceIcon } from '@/store/index.js'

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
    },
    isOwner() {
      return getCurrentUserRole() === '家长'
    },
    onlineDeviceCount() { return this.familyDevices.filter(d => d.isOnline).length },
    poweredDeviceCount() { return this.familyDevices.filter(d => d.isPowerOn).length },
    onlinePercent() {
      const total = this.familyDevices.length
      return total ? Math.round((this.onlineDeviceCount / total) * 100) : 0
    },
    poweredPercent() {
      const total = this.familyDevices.length
      return total ? Math.min(98, Math.round((this.poweredDeviceCount / total) * 100)) : 0
    },
    overviewTip() {
      const total = this.familyDevices.length
      if (!total) return '家中暂无设备'
      const onl = this.onlineDeviceCount
      const pwr = this.poweredDeviceCount
      if (onl === 0) return '设备当前均离线，可检查家中网络'
      if (pwr === 0) return '家中设备均已待机，节能有道'
      if (pwr === total) return '家中设备全数运行，可用一键全关'
      return `目前 ${pwr}/${total} 台设备运行中，一切安好`
    }
  },
  onShow() {
    loadLocal()
    if (!requireLogin()) return
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
      if (!this.isOwner) {
        uni.showToast({ title: '仅家长可添加设备', icon: 'none' })
        return
      }
      setCurrentFamily(this.family.id)
      uni.navigateTo({ url: '/pages/device/add' })
    },
    goToCreateScene() {
      if (!this.family) return
      if (!this.isOwner) {
        uni.showToast({ title: '仅家长可创建场景', icon: 'none' })
        return
      }
      setCurrentFamily(this.family.id)
      uni.navigateTo({ url: '/pages/scene/create' })
    },
    goToCreateFamily() {
      uni.navigateTo({ url: '/pages/family/create' })
    },
    powerAll(on) {
      if (!this.family) return
      const ids = this.familyDevices.map(d => d.id)
      if (!ids.length) {
        uni.showToast({ title: '家中暂无设备', icon: 'none' })
        return
      }
      if (on) {
        batchUpdateDevices(ids, { isPowerOn: true, isOnline: true })
      } else {
        // 优先用已有的全关接口
        powerOffAllDevices()
      }
      this.refreshData()
      uni.showToast({ title: on ? '已一键开启' : '已一键关闭', icon: 'success' })
    },
    goHome() {
      uni.switchTab({ url: '/pages/index/index' })
    },
    showAbout() {
      if (!this.family) return
      const id = this.family.id || '-'
      const createdAt = this.family.createdAt ? new Date(this.family.createdAt).toLocaleString('zh-CN') : '-'
      uni.showModal({
        title: '家庭信息',
        content: `名称：${this.family.name}\n描述：${this.family.description || '无'}\n成员数：${this.family.memberCount || 1}\n家庭ID：${id}\n创建时间：${createdAt}`,
        showCancel: false,
        confirmColor: '#8B4513'
      })
    },
    showFamilySettings() {
      if (!this.family) return
      if (!this.isOwner) {
        uni.showToast({ title: '仅家长可管理家庭', icon: 'none' })
        return
      }
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
                  updateFamily(this.family.id, { name: r.content.trim() })
                  this.refreshData()
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
      const wasOn = device.isPowerOn
      toggleDevicePower(device.id)
      this.refreshData()
      uni.showToast({
        title: wasOn ? '设备已关闭' : '设备已开启',
        icon: 'success'
      })
    },
    onSceneTap(scene) {
      uni.showActionSheet({
        itemList: ['激活场景', '编辑场景', '删除场景'],
        success: (res) => {
          if (res.tapIndex === 0) {
            activateScene(scene)
            this.refreshData()
            uni.showToast({ title: `「${scene.name}」已激活`, icon: 'success' })
          } else if (res.tapIndex === 1) {
            uni.navigateTo({ url: `/pages/scene/create?id=${scene.id}` })
          } else if (res.tapIndex === 2) {
            uni.showModal({
              title: '确认删除',
              content: `确定要删除场景「${scene.name}」吗？`,
              confirmColor: '#B22222',
              success: (r) => {
                if (r.confirm) {
                  removeScene(scene.id)
                  this.refreshData()
                  uni.showToast({ title: '已删除', icon: 'success' })
                }
              }
            })
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

.stats-overview {
  margin-top: 28rpx;
  padding: 24rpx 28rpx;
  background: linear-gradient(135deg, rgba(139,69,19,0.05) 0%, rgba(205,133,63,0.08) 100%);
  border-radius: 20rpx;
  border: 1rpx solid rgba(139,69,19,0.15);
}

.overview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.overview-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.overview-divider {
  width: 1rpx;
  height: 40rpx;
  background: #D2B48C;
}

.overview-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}
.overview-dot.online { background: #6A9955; box-shadow: 0 0 0 4rpx rgba(106,153,85,0.18); }
.overview-dot.powered { background: #CD853F; box-shadow: 0 0 0 4rpx rgba(205,133,63,0.18); }
.overview-dot.scene { background: #8B4513; box-shadow: 0 0 0 4rpx rgba(139,69,19,0.18); }

.overview-label { font-size: 24rpx; color: #6B4226; font-family: "STKaiti", "KaiTi", serif; }
.overview-num { font-size: 26rpx; color: #2F1810; font-weight: bold; font-family: "STKaiti", "KaiTi", serif; }

.overview-bar {
  display: flex;
  align-items: center;
  height: 10rpx;
  background: #F5DEB3;
  border-radius: 10rpx;
  overflow: hidden;
  padding: 0 2rpx;
}

.bar-filled {
  height: 100%;
  border-radius: 10rpx;
}

.overview-tip { margin-top: 14rpx; text-align: center; }
.overview-tip-text {
  font-size: 22rpx;
  color: #8B7355;
  font-family: "STKaiti", "KaiTi", serif;
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
  flex-wrap: wrap;
  gap: 16rpx 0;
}

.action-card {
  width: calc(25% - 12rpx);
  background: #FFF8DC;
  border-radius: 20rpx;
  padding: 24rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2rpx solid #D2B48C;
}

.action-card.secondary {
  background: linear-gradient(135deg, rgba(255,250,240,0.9) 0%, rgba(255,248,220,0.95) 100%);
  border: 2rpx dashed #DEB887;
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
