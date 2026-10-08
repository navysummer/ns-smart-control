<template>
  <view class="member-container">
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">家庭成员</text>
      <view class="add-btn" v-if="isOwner" @tap="showAddModal = true">
        <text class="add-icon">+</text>
      </view>
    </view>

    <view class="content">
      <view class="member-stats-card" v-if="members.length">
        <view class="stat-item">
          <text class="stat-value">{{ members.length }}</text>
          <text class="stat-label">总成员</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ ownerCount }}</text>
          <text class="stat-label">家长</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ members.length - ownerCount }}</text>
          <text class="stat-label">普通成员</text>
        </view>
      </view>

      <view v-if="members.length === 0" class="empty-state">
        <text class="empty-icon">👥</text>
        <text class="empty-text">暂无家庭成员</text>
        <view class="add-empty-btn" v-if="isOwner" @tap="showAddModal = true">
          <text class="add-empty-text">添加第一位家人</text>
        </view>
      </view>

      <view class="member-list" v-else>
        <view class="member-card" v-for="member in members" :key="member.id" @tap="openEdit(member)">
          <view class="member-avatar">
            <text class="avatar-text">{{ member.name ? member.name[0] : '?' }}</text>
          </view>
          <view class="member-info">
            <text class="member-name">{{ member.name }}</text>
            <view class="role-tag" :class="{ owner: member.role === '家长' }">
              <text class="role-tag-text">{{ member.role }}</text>
            </view>
            <text class="member-phone" v-if="member.phone">{{ member.phone }}</text>
            <text class="member-join-time">加入: {{ member.joinTime }}</text>
          </view>
          <view class="member-actions" v-if="isOwner" @tap.stop>
            <view class="action-btn edit" @tap="openEdit(member)">
              <text class="action-icon">编辑</text>
            </view>
            <view class="action-btn delete" v-if="member.id !== currentUserId" @tap="removeMember(member)">
              <text class="action-icon">移除</text>
            </view>
          </view>
          <view class="arrow" v-if="!isOwner"><text class="arrow-text">→</text></view>
        </view>
      </view>

      <view class="invite-section" v-if="isOwner">
        <view class="invite-card">
          <text class="invite-title">邀请家人</text>
          <text class="invite-desc">点击右上角 + 号，输入家人信息邀请加入；也可分享家庭二维码（后续支持）。</text>
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

    <view class="modal-mask" v-if="showEditModal" @tap="showEditModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">编辑成员</text>
          <view class="close-btn" @tap="showEditModal = false">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="input-group">
            <text class="input-label">成员昵称</text>
            <input
              class="input-field"
              v-model="editMember.name"
              placeholder="请输入成员昵称"
              placeholder-style="color: #D2B48C"
            />
          </view>
          <view class="input-group">
            <text class="input-label">手机号</text>
            <input
              class="input-field"
              v-model="editMember.phone"
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
                :class="{ active: editMember.role === '家长' }"
                @tap="editMember.role = '家长'"
              >
                <text class="role-text">家长</text>
              </view>
              <view
                class="role-option"
                :class="{ active: editMember.role === '成员' }"
                @tap="editMember.role = '成员'"
              >
                <text class="role-text">成员</text>
              </view>
            </view>
          </view>
          <view class="warn-tip" v-if="isSelf">
            <text class="warn-tip-text">注意：当前为您自己的账号，若降级为「成员」将失去家长权限。</text>
          </view>
        </view>
        <view class="modal-footer">
          <view class="cancel-btn" @tap="showEditModal = false">
            <text class="cancel-text">取消</text>
          </view>
          <view class="confirm-btn" @tap="confirmEdit">
            <text class="confirm-text">保存修改</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { setCurrentFamily, getFamilyMembers, removeMember, addMember, updateMember, getCurrentUserRole, requireLogin, loadLocal, getStore } from '@/store/index.js'

export default {
  data() {
    return {
      familyId: '',
      members: [],
      currentUserId: '',
      showAddModal: false,
      showEditModal: false,
      editMember: { id: '', name: '', phone: '', role: '成员' },
      newMember: { name: '', phone: '', role: '成员' }
    }
  },
  computed: {
    isOwner() {
      return getCurrentUserRole() === '家长'
    },
    ownerCount() {
      return this.members.filter(m => m.role === '家长').length
    },
    isSelf() {
      return this.editMember.id === this.currentUserId
    }
  },
  onLoad(options) {
    if (!requireLogin()) return
    if (options && options.familyId) {
      this.familyId = options.familyId
      setCurrentFamily(options.familyId)
    }
  },
  onShow() {
    loadLocal()
    this.refreshData()
  },
  methods: {
    refreshData() {
      this.members = getFamilyMembers()
      const s = getStore()
      this.currentUserId = s.userInfo?.id || ''
    },
    goBack() {
      uni.navigateBack()
    },
    openEdit(member) {
      if (!this.isOwner) return
      this.editMember = { id: member.id, name: member.name, phone: member.phone || '', role: member.role || '成员' }
      this.showEditModal = true
    },
    confirmEdit() {
      if (!this.editMember.name.trim()) {
        uni.showToast({ title: '请输入成员昵称', icon: 'none' })
        return
      }
      if (this.editMember.phone && this.editMember.phone.length !== 11) {
        uni.showToast({ title: '手机号为 11 位', icon: 'none' })
        return
      }
      updateMember(this.editMember.id, {
        name: this.editMember.name.trim(),
        phone: this.editMember.phone,
        role: this.editMember.role
      })
      this.showEditModal = false
      this.refreshData()
      uni.showToast({ title: '已保存', icon: 'success' })
    },
    removeMember(member) {
      if (member.id === this.currentUserId) {
        uni.showToast({ title: '不能移除自己', icon: 'none' })
        return
      }
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
        uni.showToast({ title: '请输入 11 位手机号', icon: 'none' })
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

.member-stats-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: linear-gradient(135deg, rgba(139,69,19,0.05) 0%, rgba(205,133,63,0.1) 100%);
  border: 1rpx solid rgba(139,69,19,0.15);
  border-radius: 24rpx;
  padding: 32rpx 20rpx;
  margin-bottom: 30rpx;
}

.member-stats-card .stat-item { display: flex; flex-direction: column; align-items: center; }
.member-stats-card .stat-value {
  font-size: 44rpx; color: #8B4513; font-weight: bold; font-family: "STKaiti", "KaiTi", serif;
}
.member-stats-card .stat-label {
  font-size: 22rpx; color: #8B7355; margin-top: 6rpx; font-family: "STKaiti", "KaiTi", serif;
}
.stat-divider { width: 1rpx; height: 56rpx; background: #D2B48C; }

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

.add-empty-btn {
  margin-top: 36rpx;
  padding: 20rpx 56rpx;
  border-radius: 50rpx;
  background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
}
.add-empty-text {
  font-size: 26rpx; color: #FFFAF0; font-family: "STKaiti", "KaiTi", serif;
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
  flex-shrink: 0;
}

.avatar-text {
  font-size: 40rpx;
  color: #FFFAF0;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.member-info { flex: 1; min-width: 0; }

.member-name {
  font-size: 30rpx;
  color: #2F1810;
  font-weight: bold;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.role-tag {
  display: inline-block;
  margin-top: 10rpx;
  padding: 4rpx 16rpx;
  background: rgba(139,115,85,0.12);
  border: 1rpx solid rgba(139,115,85,0.2);
  border-radius: 12rpx;
}
.role-tag.owner {
  background: rgba(139,69,19,0.12);
  border-color: rgba(139,69,19,0.3);
}
.role-tag-text {
  font-size: 20rpx; color: #6B4226; font-family: "STKaiti", "KaiTi", serif;
}
.role-tag.owner .role-tag-text { color: #8B4513; font-weight: bold; }

.member-phone {
  font-size: 22rpx; color: #6B4226; margin-top: 6rpx; display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.member-join-time {
  font-size: 22rpx;
  color: #8B7355;
  margin-top: 6rpx;
  display: block;
  font-family: "STKaiti", "KaiTi", serif;
}

.member-actions {
  display: flex; flex-direction: column; align-items: flex-end; gap: 14rpx;
  margin-left: 20rpx; flex-shrink: 0;
}

.arrow { margin-left: 16rpx; }
.arrow-text { font-size: 28rpx; color: #8B7355; }

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 10rpx;
}
.action-btn.edit {
  background: #FFFAF0;
  border: 1rpx solid #8B4513;
}
.action-btn.edit .action-icon { color: #8B4513; }

.action-btn.delete {
  background: #FFF0F0;
  border: 1rpx solid #B22222;
}

.action-icon {
  font-size: 22rpx;
  font-family: "STKaiti", "KaiTi", serif;
}

.action-btn.delete .action-icon {
  color: #B22222;
}

.invite-section { margin-top: 30rpx; }

.invite-card {
  background: #FFF8DC;
  border-radius: 20rpx;
  padding: 40rpx;
  border: 2rpx solid #D2B48C;
  text-align: left;
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
  margin-top: 14rpx;
  line-height: 1.6;
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
  width: 85%;
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

.modal-body { padding: 28rpx 30rpx 14rpx; }

.input-group { margin-bottom: 20rpx; }

.input-label {
  font-size: 26rpx;
  color: #2F1810;
  margin-bottom: 10rpx;
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
  box-sizing: border-box;
}

.warn-tip { margin-top: 6rpx; padding: 14rpx 16rpx; background: rgba(178,34,34,0.06); border-radius: 10rpx; }
.warn-tip-text {
  font-size: 22rpx; color: #B22222; line-height: 1.5; font-family: "STKaiti", "KaiTi", serif;
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
