<template>
  <view class="create-family-container">
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">创建家庭</text>
    </view>

    <view class="content">
      <view class="form-card">
        <view class="input-group">
          <text class="input-label">家庭名称</text>
          <input 
            class="input-field" 
            v-model="familyName" 
            placeholder="为您的家取个雅致的名字"
            placeholder-style="color: #D2B48C"
          />
          <text class="input-hint">例：温馨小居、雅致书房、清风明月居</text>
        </view>

        <view class="input-group">
          <text class="input-label">家庭地址</text>
          <input 
            class="input-field" 
            v-model="familyAddress" 
            placeholder="请输入家庭地址"
            placeholder-style="color: #D2B48C"
          />
        </view>

        <view class="input-group">
          <text class="input-label">家庭简介</text>
          <textarea 
            class="textarea-field" 
            v-model="familyDesc" 
            placeholder="用诗意的语言描述您的家..."
            placeholder-style="color: #D2B48C"
            maxlength="100"
          />
          <text class="char-count">{{ familyDesc.length }}/100</text>
        </view>

        <view class="template-section">
          <text class="section-title">选择家庭模板</text>
          <view class="template-grid">
            <view 
              class="template-card" 
              v-for="template in templates" 
              :key="template.id"
              :class="{ active: selectedTemplate === template.id }"
              @tap="selectedTemplate = template.id"
            >
              <text class="template-icon">{{ template.icon }}</text>
              <text class="template-name">{{ template.name }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="create-btn" @tap="createFamily">
        <text class="btn-text">创建家庭</text>
      </view>

      <view class="poem-section">
        <text class="poem-text">「 家是心灵的港湾，是温暖的归宿 」</text>
      </view>
    </view>
  </view>
</template>

<script>
import { addFamily, setCurrentFamily, getStore, requireLogin } from '@/store/index.js'

const TEMPLATE_PRESETS = {
  1: {
    name: '温馨之家',
    desc: '家和万事兴，岁月静好',
    suffix: '雅居'
  },
  2: {
    name: '雅致书房',
    desc: '半榻清风，一帘明月，墨香绕梁',
    suffix: '书斋'
  },
  3: {
    name: '现代简约',
    desc: '素雅明窗净几，心远地自偏',
    suffix: '小筑'
  },
  4: {
    name: '田园风光',
    desc: '采菊东篱下，悠然见南山',
    suffix: '田园'
  },
  5: {
    name: '清风明月',
    desc: '明月几时有，把酒问青天',
    suffix: '月居'
  },
  6: {
    name: '山林隐逸',
    desc: '空山新雨后，天气晚来秋',
    suffix: '山居'
  }
}

// 古风家庭名前缀（用于生成默认名字）
const POETIC_PREFIXES = ['清风', '明月', '竹影', '墨香', '听雨', '栖鹤', '望云', '抚琴']

export default {
  data() {
    return {
      familyName: '',
      familyAddress: '',
      familyDesc: '',
      selectedTemplate: 1,
      templates: [
        { id: 1, name: '温馨之家', icon: '🏠' },
        { id: 2, name: '雅致书房', icon: '📚' },
        { id: 3, name: '现代简约', icon: '🏢' },
        { id: 4, name: '田园风光', icon: '🌿' },
        { id: 5, name: '清风明月', icon: '🌙' },
        { id: 6, name: '山林隐逸', icon: '⛰️' }
      ]
    }
  },
  watch: {
    selectedTemplate(newId) {
      const preset = TEMPLATE_PRESETS[newId]
      if (!preset) return
      if (!this.familyDesc.trim()) {
        this.familyDesc = preset.desc
      }
    }
  },
  onLoad() {
    requireLogin()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    pickRandomPoeticName() {
      const pick = POETIC_PREFIXES[Math.floor(Math.random() * POETIC_PREFIXES.length)]
      const preset = TEMPLATE_PRESETS[this.selectedTemplate]
      const suffix = preset?.suffix || '雅居'
      return `${pick}${suffix}`
    },
    createFamily() {
      if (!this.familyName.trim()) {
        // 没填名字就按模板随机起一个
        this.familyName = this.pickRandomPoeticName()
        uni.showToast({ title: `已自动命名：${this.familyName}`, icon: 'none' })
      }
      const template = this.templates.find(t => t.id === this.selectedTemplate)
      const family = addFamily({
        name: this.familyName.trim(),
        address: this.familyAddress.trim(),
        description: this.familyDesc.trim() || (template?.name ? `${template.name}，家和万事兴` : '家和万事兴'),
        template: template ? template.name : '温馨之家'
      })

      // 如果当前没选家庭就设为当前
      const s = getStore()
      if (!s.currentFamilyId && family && family.id) {
        setCurrentFamily(family.id)
      }

      uni.showToast({
        title: '创建成功',
        icon: 'success'
      })

      setTimeout(() => {
        if (!s.families || s.families.length <= 1) {
          uni.switchTab({ url: '/pages/index/index' })
        } else {
          uni.navigateBack()
        }
      }, 1500)
    }
  }
}
</script>

<style scoped>
.create-family-container {
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
  padding: 40rpx;
}

.form-card {
  background: #FFF8DC;
  border-radius: 30rpx;
  padding: 40rpx;
  border: 2rpx solid #D2B48C;
}

.input-group {
  margin-bottom: 30rpx;
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
  height: 88rpx;
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 16rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.textarea-field {
  width: 100%;
  height: 200rpx;
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
  font-size: 28rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.input-hint {
  font-size: 22rpx;
  color: #8B7355;
  margin-top: 8rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.char-count {
  font-size: 22rpx;
  color: #8B7355;
  text-align: right;
  margin-top: 8rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.template-section {
  margin-top: 30rpx;
}

.section-title {
  font-size: 26rpx;
  color: #2F1810;
  margin-bottom: 20rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.template-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.template-card {
  width: calc(50% - 10rpx);
  background: #FFFAF0;
  border: 2rpx solid #D2B48C;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.template-card.active {
  border-color: #8B4513;
  background: linear-gradient(135deg, #FFF8DC 0%, #FFFAF0 100%);
}

.template-icon {
  font-size: 48rpx;
}

.template-name {
  font-size: 24rpx;
  color: #2F1810;
  margin-top: 12rpx;
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
  margin-top: 40rpx;
}

.btn-text {
  font-size: 32rpx;
  color: #FFFAF0;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.poem-section {
  text-align: center;
  margin-top: 60rpx;
}

.poem-text {
  font-size: 24rpx;
  color: #8B7355;
  font-style: italic;
  font-family: "STKaiti", "KaiTi", serif;
}
</style>
