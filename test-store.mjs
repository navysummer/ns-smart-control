/**
 * ns-smart-control 单元测试（Node 端直接跑，不依赖 uni runtime）
 * 验证: 登录/登出/家庭 CRUD/成员 CRUD/设备 CRUD/场景 CRUD/activateScene/
 *       batchUpdateDevices 双重载/powerOffAllDevices/示例数据/重置/清空/清空再恢复
 * 运行: node test-store.mjs
 */

import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import { createRequire } from 'module'

// ---------- 1. 给全局注入一个假的 uni storage ----------
const memoryStorage = new Map()
globalThis.uni = {
  setStorageSync(key, value) { memoryStorage.set(key, JSON.parse(JSON.stringify(value))) },
  getStorageSync(key) {
    const v = memoryStorage.get(key)
    return v === undefined ? '' : JSON.parse(JSON.stringify(v))
  },
  removeStorageSync(key) { memoryStorage.delete(key) },
  clearStorageSync() { memoryStorage.clear() },
  showToast(opts) { /* silent */ },
  switchTab() { /* silent */ },
  navigateTo() { /* silent */ },
  navigateBack() { /* silent */ },
  reLaunch() { /* silent */ },
  setStorage() { return Promise.resolve() },
  getStorage() { return Promise.resolve({ data: '' }) }
}
globalThis.localStorage = { // store.login 会查 localStorage
  getItem(key) { return memoryStorage.has(key) ? JSON.stringify(memoryStorage.get(key)) : null },
  setItem(key, v) { try { memoryStorage.set(key, JSON.parse(v)) } catch { memoryStorage.set(key, v) } },
  removeItem(key) { memoryStorage.delete(key) },
  clear() { memoryStorage.clear() }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 因为 store 是 .js 用 export，动态 import
const storePath = path.resolve(__dirname, 'src/store/index.js')
const Store = await import(storePath + '?t=' + Date.now())

// ---------- 2. 测试助手 ----------
let _ref = null
Store.subscribe((s) => { _ref = s })
const snap = () => JSON.parse(JSON.stringify({
  families: _ref.families,
  devices: _ref.devices,
  scenes: _ref.scenes,
  members: _ref.members,
  currentFamilyId: _ref.currentFamilyId,
  isLoggedIn: _ref.isLoggedIn,
  userInfo: _ref.userInfo
}))
const store = () => _ref

let passed = 0, failed = 0
function check(name, cond, info = '') {
  if (cond) {
    passed++
    console.log('  ✅', name)
  } else {
    failed++
    console.log('  ❌', name, info ? '  → ' + info : '')
  }
}

// ---------- 3. 开始跑 ----------
console.log('\n======== 1. 初始化与清空 =========')
Store.logout()
const { families, devices, scenes, members, isLoggedIn } = snap()
check('登出后 families=[]', families.length === 0)
check('登出后 devices=[]', devices.length === 0)
check('登出后 scenes=[]', scenes.length === 0)
check('登出后 members=[]', members.length === 0)
check('登出后 isLoggedIn=false', isLoggedIn === false)
check('hasDemoData()=false', Store.hasDemoData() === false)

console.log('\n======== 2. 登录+示例注入 =========')
const user = Store.login({ nickname: '山中客', id: 'u1' })
check('login 返回用户对象，含 id', !!user && user.id === 'u1')
const a = snap()
check('有示例家庭', a.families.length >= 1)
check('有示例设备', a.devices.length >= 3)
check('有示例场景', a.scenes.length >= 1)
check('有示例成员', a.members.length >= 1)
check('currentFamilyId 被设', !!a.currentFamilyId)
check('isLoggedIn=true', a.isLoggedIn === true)
check('hasDemoData()=true', Store.hasDemoData() === true)

const curFamily = Store.getCurrentFamily()
check('getCurrentFamily 返回非空', !!curFamily && curFamily.id === a.currentFamilyId)
const role = Store.getCurrentUserRole()
check('当前用户角色=家长(家长)', role === '家长')
const allMembers = Store.getFamilyMembers(curFamily.id)
check('getFamilyMembers 数量>=1', allMembers.length >= 1)

console.log('\n======== 3. 订阅机制 =========')
let pushCount = 0
const unsub = Store.subscribe((s) => { pushCount++ })
// 首次订阅立即触发一次，但由于外层已有一次订阅，我们这个新的 subscribe 会再立即触发（第二次）
check('首次订阅立即触发（本次累计>=2）', pushCount >= 1)
Store.addDevice({
  type: 'light', name: '走廊夜灯', room: '走廊', isPowerOn: false
})
check('addDevice 后 notify 触发订阅回调（pushCount 增长）', pushCount >= 2)
unsub()
const beforeGrowth = pushCount
Store.addDevice({ type: 'ac', name: '餐厅空调', room: '餐厅' })
check('取消订阅后不再触发（pushCount 不变）', pushCount === beforeGrowth)

console.log('\n======== 4. 家庭 CRUD =========')
const fam1 = Store.addFamily({ name: '竹影书斋', desc: '翰墨飘香之地' })
check('addFamily 返回非空且含 id', !!fam1 && !!fam1.id)
const preId = store().currentFamilyId
Store.setCurrentFamily(fam1.id)
check('setCurrentFamily 生效', store().currentFamilyId === fam1.id)
Store.updateFamily(fam1.id, { name: '竹影书斋·小雅' })
check('updateFamily 改了名', store().families.find(f => f.id === fam1.id).name === '竹影书斋·小雅')
Store.setCurrentFamily(preId)
Store.removeFamily(fam1.id)
check('removeFamily 后 families 少一个', !store().families.find(f => f.id === fam1.id))

console.log('\n======== 5. 家庭成员 CRUD =========')
const fid = store().currentFamilyId
const initCount = Store.getFamilyMembers(fid).length
const m1 = Store.addMember({ familyId: fid, nickname: '清风', phone: '13800000001', role: '成员' })
check('addMember 返回非空', !!m1 && !!m1.id)
check('addMember 后成员数 +1', Store.getFamilyMembers(fid).length === initCount + 1)
Store.updateMember(m1.id, { role: '家长', nickname: '清风·改' })
const upM = store().members.find(x => x.id === m1.id)
check('updateMember 角色=家长', upM.role === '家长')
check('updateMember 昵称=清风·改', upM.nickname === '清风·改')
Store.removeMember(m1.id)
check('removeMember 成功', Store.getFamilyMembers(fid).length === initCount)

console.log('\n======== 6. 设备 CRUD =========')
const lights = store().devices.filter(d => d.familyId === fid && d.type === 'light')
check('当前家庭至少有 1 个灯', lights.length >= 1)
const light1 = lights[0]
const originOn = light1.isPowerOn
const newD = Store.toggleDevicePower(light1.id)
check('toggleDevicePower 反转了 isPowerOn', newD.isPowerOn === !originOn)
Store.updateDevice(light1.id, { brightness: 33, color: '#FF0000' })
const lA = store().devices.find(d => d.id === light1.id)
check('updateDevice brightness=33', lA.brightness === 33)
check('updateDevice color=#FF0000', lA.color === '#FF0000')
check('每类设备 getDeviceIcon 非空', ['light','ac','curtain','tv','speaker','air','washer','fridge','oven','camera','sensor'].every(t => !!Store.getDeviceIcon(t)))
check('每类设备 getDeviceTypeName 非空', ['light','ac','curtain','tv','speaker','air','washer','fridge','oven','camera','sensor'].every(t => !!Store.getDeviceTypeName(t)))

console.log('\n======== 7. batchUpdateDevices 双重载 =========')
const ids = store().devices.filter(d => d.familyId === fid).slice(0, 3).map(d => d.id)
check('当前家庭至少有 3 台设备用于测试', ids.length >= 3)
Store.batchUpdateDevices(ids, { isPowerOn: true }, '测试全开')
const allOn = store().devices.filter(d => ids.includes(d.id)).every(d => d.isPowerOn === true)
check('重载 2 (ids, patch) → 3 台均已开', allOn)
// 重载 1：数组对象
Store.batchUpdateDevices([
  { deviceId: ids[0], data: { brightness: 11 }, action: '调亮度' },
  { deviceId: ids[1], data: { temperature: 28 }, action: '调温度' },
  { deviceId: ids[2], data: { volume: 55 }, action: '调音量' }
])
const d1 = store().devices.find(d => d.id === ids[0])
const d2 = store().devices.find(d => d.id === ids[1])
const d3 = store().devices.find(d => d.id === ids[2])
check('重载 1 [0] brightness=11', d1.brightness === 11)
check('重载 1 [1] temperature=28', d2.temperature === 28)
check('重载 1 [2] volume=55', d3.volume === 55)

console.log('\n======== 8. powerOffAllDevices =========')
Store.powerOffAllDevices()
const nowAll = store().devices.filter(d => d.familyId === fid).every(d => d.isPowerOn === false && d.isOnline === false)
check('powerOffAllDevices 全关（含 isOnline 同步 false）', nowAll)

console.log('\n======== 9. 场景 CRUD + activateScene =========')
const dIds = store().devices.filter(d => d.familyId === fid).map(d => d.id)
const s1 = Store.addScene({
  familyId: fid, name: '测试场景', icon: '🌞', desc: '测一下',
  devices: [
    { deviceId: dIds[0], config: { isPowerOn: true, brightness: 88 } },
    { deviceId: dIds[1], config: { isPowerOn: true, temperature: 22, mode: 'cool', windSpeed: 3 } },
    { deviceId: dIds[2], config: { isPowerOn: false } }
  ]
})
check('addScene 返回含 id', !!s1 && !!s1.id)
const oldLogsCount = (store().devices.find(d => d.id === dIds[0]).logs || []).length
Store.activateScene(s1)
const dd1 = store().devices.find(d => d.id === dIds[0])
const dd2 = store().devices.find(d => d.id === dIds[1])
const dd3 = store().devices.find(d => d.id === dIds[2])
check('activateScene [0] 开', dd1.isPowerOn === true)
check('activateScene [0] isOnline 同步开', dd1.isOnline === true)
check('activateScene [0] brightness=88', dd1.brightness === 88)
check('activateScene [1] 温度=22', dd2.temperature === 22)
check('activateScene [1] mode=cool', dd2.mode === 'cool')
check('activateScene [1] windSpeed=3', dd2.windSpeed === 3)
check('activateScene [2] 关', dd3.isPowerOn === false)
check('activateScene 写日志', (dd1.logs || []).length > oldLogsCount)

Store.updateScene(s1.id, { name: '测试场景·改' })
check('updateScene 改名', store().scenes.find(x => x.id === s1.id).name === '测试场景·改')
Store.removeScene(s1.id)
check('removeScene', !store().scenes.find(x => x.id === s1.id))

console.log('\n======== 10. 默认参数 getDeviceDefaultConfig =========')
check('light 默认有 brightness', Store.getDeviceDefaultConfig('light').brightness === 80)
check('ac 默认温度=26', Store.getDeviceDefaultConfig('ac').temperature === 26)
check('curtain 默认 openPercent=60', Store.getDeviceDefaultConfig('curtain').openPercent === 60)
check('washer 默认 mode=standard', Store.getDeviceDefaultConfig('washer').mode === 'standard')
check('fridge 冷藏=5', Store.getDeviceDefaultConfig('fridge').tempCold === 5)
check('fridge 冷冻=-18', Store.getDeviceDefaultConfig('fridge').tempFreeze === -18)
check('sensor 默认报警关', Store.getDeviceDefaultConfig('sensor').alarm === false)
check('camera 默认录制关', Store.getDeviceDefaultConfig('camera').recording === false)
check('camera 默认移动侦测关', Store.getDeviceDefaultConfig('camera').motionDetect === false)
check('sensor 默认 battery=85', Store.getDeviceDefaultConfig('sensor').battery === 85)

console.log('\n======== 11. resetDemoData / reSeedDemoData =========')
Store.resetDemoData()
const afterReset = snap()
check('resetDemoData 清掉所有业务数据', afterReset.families.length === 0 && afterReset.devices.length === 0 && afterReset.scenes.length === 0 && afterReset.members.length === 0)
Store.reSeedDemoData()
const afterSeed = snap()
check('reSeedDemoData 重新注入 1 个家庭', afterSeed.families.length === 1)
check('reSeedDemoData 设备 >= 4', afterSeed.devices.length >= 4)
check('reSeedDemoData 场景 >= 2', afterSeed.scenes.length >= 2)
check('reSeedDemoData 成员 >= 1（当前用户自己）', afterSeed.members.length >= 1)

console.log('\n======== 12. requireLogin（已登录态） =========')
check('requireLogin 登录态返回 true', Store.requireLogin() === true)
Store.logout()
// 登出后 requireLogin 会尝试 switchTab，node 端 mock 为空
const b = Store.requireLogin()
check('requireLogin 未登录返回 false', b === false)

console.log('\n======== 汇总 =========')
console.log(`通过 ${passed}  失败 ${failed}`)
if (failed > 0) {
  process.exit(1)
} else {
  console.log('🎉 全部通过！')
}
