<template>
  <view class="member-container">
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">家庭成员</text>
      <view class="add-btn" @tap="showAddModal = true">
        <text class="add-icon">+</text>
      </view>
    </view>

    <view class="content">
      <view v-if="members.length === 0" class="empty-state">
        <text class="empty-icon">👥</text>
        <text class="empty-text">暂无家庭成员</text>
      </view>

      <view class="member-list" v-else>
        <view class="member-card" v-for="member in members" :key="member.id">
          <view class="member-avatar">
            <text class="avatar-text">{{ member.name[0] }}</text>
          </view>
          <view class="member-info">
            <text class="member-name">{{ member.name }}</text>
            <text class="member-role">{{ member.role }}</text>
            <text class="member-join-time">加入时间: {{ member.joinTime }}</text>
          </view>
          <view class="member-actions">
            <view class="action-btn delete" @tap="removeMember(member)">
              <text class="action-icon">移除</text>
            </view>
          </view>
        </view>
      </view>

      <view class="invite-section">
        <view class="invite-card">
          <text class="invite-title">邀请家人</text>
          <text class="invite-desc">点击添加按钮，输入家人手机号邀请加入</text>
        </view>
      </view>
    </view>

    <view class="modal-mask" v-if="showAddModal" @tap="showAddModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加家庭成员</text>
          <view class="close-btn" @tap="showAddModal = false">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="input-group">
            <text class="input-label">成员昵称</text>
            <input
              class="input-field"
              v-model="newMember.name"
              placeholder="请输入成员昵称"
              placeholder-style="color: #D2B48C"
            />
          </view>
          <view class="input-group">
            <text class="input-label">手机号</text>
            <input
              class="input-field"
              v-model="newMember.phone"
              type="number"
              maxlength="11"
              placeholder="请输入手机号"
              placeholder-style="color: #D2B48C"
            />
          </view>
          <view class="input-group">
            <text class="input-label">角色</text>
            <view class="role-options">
              <view
                class="role-option"
                :class="{ active: newMember.role === '家长' }"
                @tap="newMember.role = '家长'"
              >
                <text class="role-text">家长</text>
              </view>
              <view
                class="role-option"
                :class="{ active: newMember.role === '成员' }"
                @tap="newMember.role = '成员'"
              >
                <text class="role-text">成员</text>
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="cancel-btn" @tap="showAddModal = false">
            <text class="cancel-text">取消</text>
          </view>
          <view class="confirm-btn" @tap="addMember">
            <text class="confirm-text">确认添加</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { setCurrentFamily, getFamilyMembers, removeMember, addMember } from '@/store/index.js'

export default {
  data() {
    return {
      familyId: '',
      members: [],
      showAddModal: false,
      newMember: { name: '', phone: '', role: '成员' }
    }
  },
  onLoad(options) {
    if (options && options.familyId) {
      this.familyId = options.familyId
      setCurrentFamily(options.familyId)
    }
  },
  onShow() {
    this.refreshData()
  },
  methods: {
    refreshData() {
      this.members = getFamilyMembers()
    },
    goBack() {
      uni.navigateBack()
    },
    removeMember(member) {
      uni.showModal({
        title: '确认移除',
        content: `确定要移除成员 ${member.name} 吗？`,
        confirmColor: '#8B4513',
        success: (res) => {
          if (res.confirm) {
            removeMember(member.id)
            this.refreshData()
            uni.showToast({ title: '已移除', icon: 'success' })
          }
        }
      })
    },
    addMember() {
      if (!this.newMember.name.trim()) {
        uni.showToast({ title: '请输入成员昵称', icon: 'none' })
        return
      }
      if (!this.newMember.phone || this.newMember.phone.length !== 11) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }

      addMember({
        name: this.newMember.name.trim(),
        phone: this.newMember.phone,
        role: this.newMember.role
      })

      this.showAddModal = false
      this.newMember = { name: '', phone: '', role: '成员' }
      this.refreshData()
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
  }
}
</script>

<style scoped>
.member-container {
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
  font-family: "STKaiti", "KaiTi", serif;
}

.add-btn {
  width: 60rpx;
  height: 60rpx;
  background: #FFFAF0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon { font-size: 36rpx; color: #8B4513; }

.content { padding: 30rpx; }

.empty-state {
  background: #FFF8DC;
  border: 2rpx dashed #D2B48C;
  border-radius: 20rpx;
  padding: 80rpx 0;
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

.member-list { margin-bottom: 30rpx; }

.member-card {
  display: flex;
  align-items: center;
  background: #FFF8DC;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid #D2B48C;
}

.member-avatar {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.avatar-text {
  font-size: 40rpx;
  color: #FFFAF0;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.member-info { flex: 1; }

.member-name {
  font-size: 30rpx;
  color: #2F1810;
  font-weight: bold;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.member-role {
  font-size: 24rpx;
  color: #8B4513;
  margin-top: 6rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.member-join-time {
  font-size: 22rpx;
  color: #8B7355;
  margin-top: 6rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
}

.action-btn.delete {
  background: #FFF0F0;
  border: 1rpx solid #B22222;
}

.action-icon {
  font-size: 24rpx;
  color: #B22222;
  font-family: "STKaiti", "KaiTi", serif;
}

.invite-section { margin-top: 30rpx; }

.invite-card {
  background: #FFF8DC;
  border-radius: 20rpx;
  padding: 40rpx;
  border: 2rpx solid #D2B48C;
  text-align: center;
}

.invite-title {
  font-size: 32rpx;
  color: #2F1810;
  font-weight: bold;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.invite-desc {
  font-size: 24rpx;
  color: #8B7355;
  margin-top: 12rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 80%;
  background: #FFFAF0;
  border-radius: 30rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #D2B48C;
}

.modal-title {
  font-size: 32rpx;
  color: #2F1810;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.close-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon { font-size: 40rpx; color: #8B7355; }

.modal-body { padding: 30rpx; }

.input-group { margin-bottom: 24rpx; }

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
  background: #FFF8DC;
  border: 2rpx solid #D2B48C;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.role-options { display: flex; gap: 20rpx; }

.role-option {
  flex: 1;
  height: 72rpx;
  background: #FFF8DC;
  border: 2rpx solid #D2B48C;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-option.active {
  background: #8B4513;
  border-color: #8B4513;
}

.role-text {
  font-size: 26rpx;
  color: #2F1810;
  font-family: "STKaiti", "KaiTi", serif;
}

.role-option.active .role-text { color: #FFFAF0; }

.modal-footer {
  display: flex;
  border-top: 1rpx solid #D2B48C;
}

.cancel-btn {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1rpx solid #D2B48C;
}

.cancel-text {
  font-size: 30rpx;
  color: #8B7355;
  font-family: "STKaiti", "KaiTi", serif;
}

.confirm-btn {
  flex: 1;
  height: 96rpx;
  background: #8B4513;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-text {
  font-size: 30rpx;
  color: #FFFAF0;
  font-family: "STKaiti", "KaiTi", serif;
}
</style>
