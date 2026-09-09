<template>
  <view class="login-container">
    <view class="login-bg">
      <view class="decoration-circle circle-1"></view>
      <view class="decoration-circle circle-2"></view>
      <view class="decoration-circle circle-3"></view>
    </view>
    <view class="login-content">
      <view class="logo-section">
        <text class="logo-icon">🏠</text>
        <text class="app-name">智能家居</text>
        <text class="app-slogan">古韵智慧，诗意生活</text>
      </view>
      <view class="form-section">
        <view class="wechat-login-btn" @tap="wxLogin">
          <text class="wx-icon">💚</text>
          <text class="wx-text">微信一键登录</text>
        </view>
      </view>
      <view class="poem-section">
        <text class="poem-text">「 春风十里，不如家中有你 」</text>
      </view>
    </view>
  </view>
</template>

<script>
import { loadLocal, login as storeLogin, getStore } from '@/store/index.js'

export default {
  onShow() {
    loadLocal()
    const s = getStore()
    if (s.isLoggedIn) {
      uni.switchTab({ url: '/pages/index/index' })
    }
  },
  methods: {
    wxLogin() {
      uni.showLoading({ title: '登录中...' })
      uni.login({
        provider: 'weixin',
        success: (loginRes) => {
          if (!loginRes.code) {
            uni.hideLoading()
            uni.showToast({ title: '登录失败', icon: 'none' })
            return
          }
          const code = loginRes.code

          uni.getUserProfile({
            desc: '用于完善用户资料',
            success: (userRes) => {
              const info = userRes.userInfo
              this.doLogin(code, info.nickName, info.avatarUrl)
            },
            fail: () => {
              this.doLogin(code, '微信用户', '')
            }
          })
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({ title: '登录已取消', icon: 'none' })
        }
      })
    },
    doLogin(code, nickname, avatar) {
      console.log('===== 微信登录信息 =====')
      console.log('code:', code)
      console.log('nickname:', nickname)
      console.log('avatar:', avatar)
      storeLogin({
        id: 'wx_' + Date.now(),
        nickname: nickname,
        avatar: avatar,
        wxCode: code
      })
      uni.hideLoading()
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 1500)
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #8B4513 0%, #CD853F 50%, #FFFAF0 100%);
  position: relative;
  overflow: hidden;
}

.login-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }

.decoration-circle { position: absolute; border-radius: 50%; background: rgba(255, 250, 240, 0.1); }
.circle-1 { width: 400rpx; height: 400rpx; top: -100rpx; right: -100rpx; }
.circle-2 { width: 300rpx; height: 300rpx; top: 200rpx; left: -80rpx; }
.circle-3 { width: 200rpx; height: 200rpx; bottom: 200rpx; right: 50rpx; }

.login-content { position: relative; z-index: 1; padding: 120rpx 60rpx; }

.logo-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 120rpx; }
.logo-icon { font-size: 120rpx; }
.app-name { font-size: 52rpx; color: #FFFAF0; font-weight: bold; margin-top: 20rpx; font-family: "STKaiti", "KaiTi", serif; }
.app-slogan { font-size: 26rpx; color: #DEB887; margin-top: 10rpx; font-family: "STKaiti", "KaiTi", serif; }

.form-section { background: rgba(255, 250, 240, 0.95); border-radius: 30rpx; padding: 60rpx 40rpx; }

.wechat-login-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #07C160 0%, #06AD56 100%);
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.wx-icon { font-size: 40rpx; }
.wx-text { font-size: 32rpx; color: #FFFFFF; font-weight: bold; font-family: "STKaiti", "KaiTi", serif; }

.poem-section { text-align: center; margin-top: 80rpx; }
.poem-text { font-size: 24rpx; color: #DEB887; font-style: italic; font-family: "STKaiti", "KaiTi", serif; }
</style>
