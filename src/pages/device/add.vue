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

      <view class="default-section" v-if="selectedType">
        <text class="section-title">默认预设参数</text>
        <view class="default-card">
          <view class="default-row" v-for="item in defaultPreview" :key="item.label">
            <text class="default-label">{{ item.label }}</text>
            <text class="default-value">{{ item.value }}</text>
          </view>
          <view class="default-tip" v-if="!defaultPreview.length">
            <text class="default-tip-text">此设备暂无需预填参数，将默认关机。</text>
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
import { addDevice, getCurrentUserRole, getDeviceDefaultConfig, getDeviceTypeName, getDeviceIcon } from '@/store/index.js'

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
  oven: ['烤箱', '微波炉', 'oven'],
  camera: ['摄像头', '摄像机', '监控', 'camera', 'cam']
}

// 古风默认名（位置会作为前缀填到设备名建议里）
const TYPE_DEFAULT_NAME_SUFFIX = {
  light: '雅致明灯',
  ac: '清风雅调',
  curtain: '疏帘半卷',
  tv: '闲观影音',
  speaker: '山水清音',
  air: '净室香风',
  sensor: '四时感应',
  washer: '浣衣清尘',
  fridge: '玉壶冰心',
  oven: '文火匠心',
  camera: '观瞻在侧'
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
        { id: 'washer', name: '洗衣机', icon: '🧺' },
        { id: 'fridge', name: '冰箱', icon: '🧊' },
        { id: 'oven', name: '烤箱', icon: '🍳' },
        { id: 'camera', name: '摄像头', icon: '📷' }
      ],
      locations: ['客厅', '卧室', '厨房', '书房', '阳台', '卫生间', '玄关', '餐厅']
    }
  },
  onLoad() {
    if (getCurrentUserRole() !== '家长') {
      uni.showToast({ title: '仅家长可添加设备', icon: 'none' })
      setTimeout(() => {
        uni.navigateBack()
      }, 800)
    }
  },
  computed: {
    defaultPreview() {
      if (!this.selectedType) return []
      const cfg = getDeviceDefaultConfig(this.selectedType) || {}
      const rows = []
      if (cfg.isPowerOn != null) rows.push({ label: '初始状态', value: cfg.isPowerOn ? '开启' : '关闭' })
      if (cfg.isOnline != null) rows.push({ label: '联网状态', value: cfg.isOnline ? '在线' : '离线' })
      switch (this.selectedType) {
        case 'light':
          rows.push({ label: '默认亮度', value: (cfg.brightness ?? 80) + '%' })
          rows.push({ label: '默认色温', value: (cfg.color === 'warm' ? '暖光' : cfg.color === 'cool' ? '冷光' : '自然光') })
          break
        case 'ac':
          rows.push({ label: '默认温度', value: (cfg.temperature ?? 26) + '℃' })
          rows.push({ label: '默认模式', value: ({cool:'制冷',heat:'制热',auto:'自动',dry:'除湿',fan:'送风'})[cfg.mode] || '自动' })
          rows.push({ label: '默认风速', value: (cfg.windSpeed ?? 3) + '档' })
          break
        case 'curtain':
          rows.push({ label: '默认开合度', value: (cfg.openPercent ?? 70) + '%' })
          break
        case 'speaker':
          rows.push({ label: '默认音量', value: (cfg.volume ?? 50) + '%' })
          break
        case 'tv':
          rows.push({ label: '默认音量', value: (cfg.volume ?? 40) + '%' })
          break
        case 'air':
          rows.push({ label: '默认模式', value: ({auto:'自动',sleep:'睡眠',strong:'强劲',eco:'节能'})[cfg.mode] || '自动' })
          rows.push({ label: '默认档位', value: (cfg.fanLevel ?? 2) + '档' })
          break
        case 'washer':
          rows.push({ label: '默认程序', value: ({standard:'标准',quick:'快洗',heavy:'大件',gentle:'轻柔'})[cfg.mode] || '标准' })
          break
        case 'fridge':
          rows.push({ label: '冷藏温度', value: (cfg.tempCold ?? 5) + '℃' })
          rows.push({ label: '冷冻温度', value: (cfg.tempFreeze ?? -18) + '℃' })
          break
        case 'oven':
          rows.push({ label: '默认温度', value: (cfg.temp ?? 180) + '℃' })
          rows.push({ label: '默认时间', value: (cfg.time ?? 15) + '分钟' })
          break
        case 'camera':
          rows.push({ label: '夜视', value: cfg.nightVision ? '开启' : '关闭' })
          rows.push({ label: '移动侦测', value: cfg.motionDetect ? '开启' : '关闭' })
          rows.push({ label: '录制', value: cfg.recording ? '开启' : '关闭' })
          break
        case 'sensor':
          rows.push({ label: '警报', value: cfg.alarm ? '开启' : '关闭' })
          break
      }
      return rows
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
      // 自动建议设备名：位置 + 古风后缀
      const suffix = TYPE_DEFAULT_NAME_SUFFIX[type.id] || type.name
      const loc = this.selectedLocation ? this.selectedLocation : ''
      if (!this.deviceName.trim()) {
        this.deviceName = loc ? `${loc}${suffix}` : suffix
      }
      // 默认描述
      if (!this.deviceDesc.trim()) {
        const descMap = {
          light: '可调亮度与色温，营造诗意氛围',
          ac: '冷暖自如，四季相宜',
          curtain: '开合随心，光影有致',
          tv: '高清画质，闲时雅赏',
          speaker: '音韵流转，一室生香',
          air: '净风拂面，如沐山林',
          sensor: '知寒暑，辨燥湿',
          washer: '浣洗如新，衣袂生香',
          fridge: '冷藏冷冻，物得其所',
          oven: '火候相宜，烹饪得趣',
          camera: '看家护院，昼夜不怠'
        }
        this.deviceDesc = descMap[type.id] || ''
      }
    },
    onLocationChange(e) {
      const prev = this.selectedLocation
      this.selectedLocation = this.locations[e.detail.value]
      // 首次选位置时自动补全建议名前缀
      if (!this.deviceName.trim() && this.selectedType) {
        const suffix = TYPE_DEFAULT_NAME_SUFFIX[this.selectedType] || ''
        this.deviceName = `${this.selectedLocation}${suffix}`
      } else if (prev && this.deviceName.startsWith(prev)) {
        // 如果之前的名字是以旧位置为前缀的，替换一下
        const suffix = TYPE_DEFAULT_NAME_SUFFIX[this.selectedType] || ''
        if (this.deviceName === `${prev}${suffix}`) {
          this.deviceName = `${this.selectedLocation}${suffix}`
        }
      }
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
      const typeName = getDeviceTypeName(this.selectedType) || this.deviceTypes.find(t => t.id === this.selectedType)?.name || ''
      const defaultCfg = getDeviceDefaultConfig(this.selectedType) || {}

      addDevice({
        name: this.deviceName.trim(),
        type: this.selectedType,
        brand: this.selectedBrand,
        brandName: brandName,
        typeName: typeName,
        location: this.selectedLocation,
        description: this.deviceDesc,
        scanCode: this.scanResult,
        ...defaultCfg
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

.default-section { margin-bottom: 40rpx; }

.default-card {
  background: #FFF8DC;
  border: 2rpx solid #D2B48C;
  border-radius: 20rpx;
  padding: 24rpx 30rpx;
}

.default-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx dashed #DEB887;
}

.default-row:last-child { border-bottom: none; }

.default-label {
  font-size: 26rpx;
  color: #6B4226;
  font-family: "STKaiti", "KaiTi", serif;
}

.default-value {
  font-size: 26rpx;
  color: #2F1810;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.default-tip { padding: 20rpx 0; text-align: center; }
.default-tip-text { font-size: 24rpx; color: #8B7355; font-family: "STKaiti", "KaiTi", serif; }

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
