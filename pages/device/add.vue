<template>
  <view class="add-device-container">
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">添加设备</text>
    </view>

    <view class="content">
      <view class="brand-section">
        <text class="section-title">选择设备品牌</text>
        <view class="brand-grid">
          <view
            class="brand-card"
            v-for="brand in brands"
            :key="brand.id"
            :class="{ active: selectedBrand === brand.id }"
            @tap="onSelectBrand(brand)"
          >
            <text class="brand-icon">{{ brand.icon }}</text>
            <text class="brand-name">{{ brand.name }}</text>
          </view>
        </view>
      </view>

      <view class="type-section">
        <text class="section-title">选择设备类型</text>
        <view class="type-grid">
          <view
            class="type-card"
            v-for="type in deviceTypes"
            :key="type.id"
            :class="{ active: selectedType === type.id }"
            @tap="onSelectType(type)"
          >
            <text class="type-icon">{{ type.icon }}</text>
            <text class="type-name">{{ type.name }}</text>
          </view>
        </view>
      </view>

      <view class="info-section">
        <text class="section-title">设备信息</text>
        <view class="form-card">
          <view class="input-group">
            <text class="input-label">设备名称</text>
            <input
              class="input-field"
              v-model="deviceName"
              placeholder="为设备取个雅致的名字"
              placeholder-style="color: #D2B48C"
            />
          </view>

          <view class="input-group">
            <text class="input-label">设备位置</text>
            <picker :range="locations" @change="onLocationChange">
              <view class="picker-field">
                <text class="picker-text">{{ selectedLocation || '请选择设备位置' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>

          <view class="input-group">
            <text class="input-label">设备描述</text>
            <textarea
              class="textarea-field"
              v-model="deviceDesc"
              placeholder="描述一下这个设备的用途..."
              placeholder-style="color: #D2B48C"
              maxlength="50"
            />
          </view>
        </view>
      </view>

      <view class="scan-section">
        <view class="scan-btn" @tap="scanDevice">
          <text class="scan-icon">📷</text>
          <text class="scan-text">扫码添加设备</text>
        </view>
        <text class="scan-hint" v-if="scanResult">扫描结果: {{ scanResult }}</text>
      </view>

      <view class="add-btn" @tap="addDevice">
        <text class="btn-text">添加设备</text>
      </view>

      <view class="poem-section">
        <text class="poem-text">「 器物有灵，科技为用 」</text>
      </view>
    </view>
  </view>
</template>

<script>
import { addDevice } from '@/store/index.js'

const BRAND_KEYWORDS = {
  huawei: ['华为', 'huawei', 'HUAWEI', 'hiLink', 'hilink'],
  haier: ['海尔', 'haier', 'HAIER', '卡萨帝', 'Casarte'],
  gree: ['格力', 'gree', 'GREE', '大松', 'TOSOT'],
  xiaomi: ['小米', 'xiaomi', 'XIAOMI', '米家', 'MIJIA', 'redmi']
}

const TYPE_KEYWORDS = {
  light: ['灯', '灯具', '灯泡', '灯带', '吸顶灯', '台灯', 'light', 'bulb'],
  ac: ['空调', '冷暖', '中央空调', 'ac', 'air conditioner'],
  curtain: ['窗帘', '电动窗帘', 'curtain', '百叶窗'],
  tv: ['电视', 'TV', '电视盒子', 'tv', 'television'],
  speaker: ['音箱', '音响', '小爱', '小度', '天猫精灵', 'speaker'],
  air: ['空气净化器', '新风', '净化器', 'air purifier'],
  sensor: ['传感器', '温度', '湿度', '烟雾', 'sensor'],
  washer: ['洗衣机', '洗烘', 'washer'],
  fridge: ['冰箱', 'fridge'],
  oven: ['烤箱', '微波炉', 'oven']
}

export default {
  data() {
    return {
      selectedBrand: '',
      selectedType: '',
      deviceName: '',
      deviceDesc: '',
      selectedLocation: '',
      scanResult: '',
      scannedBrand: '',
      scannedType: '',
      brands: [
        { id: 'huawei', name: '华为', icon: '📱' },
        { id: 'haier', name: '海尔', icon: '🧊' },
        { id: 'gree', name: '格力', icon: '❄️' },
        { id: 'xiaomi', name: '小米', icon: '🏠' }
      ],
      deviceTypes: [
        { id: 'light', name: '灯具', icon: '💡' },
        { id: 'ac', name: '空调', icon: '❄️' },
        { id: 'curtain', name: '窗帘', icon: '🪟' },
        { id: 'tv', name: '电视', icon: '📺' },
        { id: 'speaker', name: '音箱', icon: '🔊' },
        { id: 'sensor', name: '传感器', icon: '📡' },
        { id: 'air', name: '净化器', icon: '🌬️' },
        { id: 'washer', name: '洗衣机', icon: '🧺' }
      ],
      locations: ['客厅', '卧室', '厨房', '书房', '阳台', '卫生间']
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    onSelectBrand(brand) {
      this.selectedBrand = brand.id
      if (this.scannedBrand && this.scannedBrand !== brand.id) {
        uni.showToast({ title: `此设备为${brand.name}品牌`, icon: 'none' })
      }
    },
    onSelectType(type) {
      this.selectedType = type.id
      if (this.scannedType && this.scannedType !== type.id) {
        uni.showToast({ title: `此设备类型为${type.name}`, icon: 'none' })
      }
    },
    onLocationChange(e) {
      this.selectedLocation = this.locations[e.detail.value]
    },
    parseScanCode(code) {
      let brand = ''
      let type = ''
      const lowerCode = code.toLowerCase()

      for (const [key, keywords] of Object.entries(BRAND_KEYWORDS)) {
        if (keywords.some(kw => lowerCode.includes(kw.toLowerCase()))) {
          brand = key
          break
        }
      }

      for (const [key, keywords] of Object.entries(TYPE_KEYWORDS)) {
        if (keywords.some(kw => lowerCode.includes(kw.toLowerCase()))) {
          type = key
          break
        }
      }

      return { brand, type }
    },
    scanDevice() {
      uni.scanCode({
        scanType: ['qrCode', 'barCode'],
        success: (res) => {
          const code = res.result
          this.scanResult = code
          const parsed = this.parseScanCode(code)

          if (parsed.brand) {
            this.scannedBrand = parsed.brand
            this.selectedBrand = parsed.brand
            const brandName = this.brands.find(b => b.id === parsed.brand)?.name || ''
            uni.showToast({ title: `识别到品牌: ${brandName}`, icon: 'none' })
          } else {
            this.scannedBrand = ''
            uni.showToast({ title: '未识别到品牌，请手动选择', icon: 'none' })
          }

          if (parsed.type) {
            this.scannedType = parsed.type
            this.selectedType = parsed.type
            const typeName = this.deviceTypes.find(t => t.id === parsed.type)?.name || ''
            setTimeout(() => {
              uni.showToast({ title: `识别到类型: ${typeName}`, icon: 'none' })
            }, 1500)
          } else {
            this.scannedType = ''
            setTimeout(() => {
              uni.showToast({ title: '未识别到类型，请手动选择', icon: 'none' })
            }, 1500)
          }
        },
        fail: () => {
          uni.showToast({ title: '扫描已取消', icon: 'none' })
        }
      })
    },
    addDevice() {
      if (!this.selectedBrand) {
        uni.showToast({ title: '请选择设备品牌', icon: 'none' })
        return
      }
      if (!this.selectedType) {
        uni.showToast({ title: '请选择设备类型', icon: 'none' })
        return
      }
      if (!this.deviceName.trim()) {
        uni.showToast({ title: '请输入设备名称', icon: 'none' })
        return
      }
      if (!this.selectedLocation) {
        uni.showToast({ title: '请选择设备位置', icon: 'none' })
        return
      }

      if (this.scannedBrand && this.scannedBrand !== this.selectedBrand) {
        uni.showModal({
          title: '品牌不匹配',
          content: `扫描识别的品牌与选择的品牌不一致，是否继续添加？`,
          confirmColor: '#8B4513',
          success: (res) => {
            if (res.confirm) {
              this.doAddDevice()
            }
          }
        })
        return
      }

      if (this.scannedType && this.scannedType !== this.selectedType) {
        uni.showModal({
          title: '类型不匹配',
          content: `扫描识别的类型与选择的类型不一致，是否继续添加？`,
          confirmColor: '#8B4513',
          success: (res) => {
            if (res.confirm) {
              this.doAddDevice()
            }
          }
        })
        return
      }

      this.doAddDevice()
    },
    doAddDevice() {
      const brandName = this.brands.find(b => b.id === this.selectedBrand)?.name || ''
      const typeName = this.deviceTypes.find(t => t.id === this.selectedType)?.name || ''

      addDevice({
        name: this.deviceName.trim(),
        type: this.selectedType,
        brand: this.selectedBrand,
        brandName: brandName,
        typeName: typeName,
        location: this.selectedLocation,
        description: this.deviceDesc,
        scanCode: this.scanResult
      })

      uni.showToast({ title: '添加成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }
}
</script>

<style scoped>
.add-device-container {
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

.back-icon {
  font-size: 40rpx;
  color: #FFFAF0;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  color: #FFFAF0;
  font-weight: bold;
  margin-right: 60rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.content {
  padding: 30rpx;
}

.section-title {
  font-size: 28rpx;
  color: #2F1810;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.brand-section, .type-section, .info-section {
  margin-bottom: 40rpx;
}

.brand-grid, .type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.brand-card {
  width: calc(25% - 15rpx);
  background: #FFF8DC;
  border: 2rpx solid #D2B48C;
  border-radius: 16rpx;
  padding: 24rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-card.active {
  border-color: #8B4513;
  background: linear-gradient(135deg, #FFF8DC 0%, #FFFAF0 100%);
}

.brand-icon {
  font-size: 48rpx;
}

.brand-name {
  font-size: 22rpx;
  color: #2F1810;
  margin-top: 10rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.type-card {
  width: calc(25% - 15rpx);
  background: #FFF8DC;
  border: 2rpx solid #D2B48C;
  border-radius: 16rpx;
  padding: 24rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.type-card.active {
  border-color: #8B4513;
  background: linear-gradient(135deg, #FFF8DC 0%, #FFFAF0 100%);
}

.type-icon {
  font-size: 48rpx;
}

.type-name {
  font-size: 22rpx;
  color: #2F1810;
  margin-top: 10rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.form-card {
  background: #FFF8DC;
  border-radius: 20rpx;
  padding: 30rpx;
  border: 2rpx solid #D2B48C;
}

.input-group {
  margin-bottom: 24rpx;
}

.input-group:last-child {
  margin-bottom: 0;
}

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

.picker-field {
  width: 100%;
  height: 80rpx;
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 12rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker-text {
  font-size: 28rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.picker-arrow {
  font-size: 24rpx;
  color: #8B7355;
}

.textarea-field {
  width: 100%;
  height: 150rpx;
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.scan-section {
  margin-bottom: 40rpx;
}

.scan-btn {
  width: 100%;
  height: 100rpx;
  background: #FFF8DC;
  border: 2rpx dashed #8B4513;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.scan-icon {
  font-size: 40rpx;
}

.scan-text {
  font-size: 28rpx;
  color: #8B4513;
  font-family: "STKaiti", "KaiTi", serif;
}

.scan-hint {
  font-size: 24rpx;
  color: #8B7355;
  margin-top: 12rpx;
  display: block;
  text-align: center;
  font-family: "STKaiti", "KaiTi", serif;
}

.add-btn {
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

.poem-section {
  text-align: center;
  margin-top: 40rpx;
}

.poem-text {
  font-size: 24rpx;
  color: #8B7355;
  font-style: italic;
  font-family: "STKaiti", "KaiTi", serif;
}
</style>
