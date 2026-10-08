/**
 * ns-smart-control 全局状态管理
 * 采用 发布/订阅 + localStorage 持久化 的轻量实现
 * 支持 uniapp-x 多端（H5 / mp-weixin / app-plus）一致运行
 */

const store = {
  isLoggedIn: false,
  userInfo: { id: '', nickname: '未登录', phone: '', avatar: '' },
  families: [],
  currentFamilyId: null,
  devices: [],
  scenes: [],
  members: []
}

const _listeners = []
const notify = () => { _listeners.forEach(fn => fn(store)) }

// ---------- 订阅机制 ----------
/**
 * 订阅 store 数据变化
 * @param {(store)=>void} fn 回调
 * @returns {()=>void} 取消订阅
 */
export const subscribe = (fn) => {
  if (typeof fn !== 'function') return () => {}
  _listeners.push(fn)
  // 首次订阅立即执行一次，方便组件拿到初始数据
  try { fn(store) } catch (e) { console.warn('subscribe callback error', e) }
  return () => {
    const i = _listeners.indexOf(fn)
    if (i > -1) _listeners.splice(i, 1)
  }
}

// ---------- 持久化 ----------
const saveLocal = () => {
  try {
    uni.setStorageSync('appData', {
      families: store.families,
      devices: store.devices,
      scenes: store.scenes,
      members: store.members,
      currentFamilyId: store.currentFamilyId
    })
  } catch (e) {
    console.error('saveLocal error', e)
  }
}

export const loadAppData = () => {
  try {
    const data = uni.getStorageSync('appData')
    if (data) {
      store.families = data.families || []
      store.devices = data.devices || []
      store.scenes = data.scenes || []
      store.members = data.members || []
      store.currentFamilyId = data.currentFamilyId || null
    }
  } catch (e) {
    console.error('loadAppData error', e)
  }
}

// ---------- 登录 / 用户 ----------
export const login = (userInfo) => {
  store.isLoggedIn = true
  store.userInfo = { ...store.userInfo, ...userInfo }
  uni.setStorageSync('userInfo', store.userInfo)
  // 首次登录注入示例数据，便于体验
  if (!store.families || store.families.length === 0) seedDemoData()
  notify()
  return store.userInfo
}

export const logout = () => {
  store.isLoggedIn = false
  store.userInfo = { id: '', nickname: '未登录', phone: '', avatar: '' }
  store.families = []
  store.currentFamilyId = null
  store.devices = []
  store.scenes = []
  store.members = []
  uni.removeStorageSync('userInfo')
  uni.removeStorageSync('appData')
  notify()
}

export const loadLocal = () => {
  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo && userInfo.id) {
    store.isLoggedIn = true
    store.userInfo = userInfo
  } else {
    store.isLoggedIn = false
  }
  loadAppData()
}

export const updateUserInfo = (patch) => {
  store.userInfo = { ...store.userInfo, ...patch }
  uni.setStorageSync('userInfo', store.userInfo)
  notify()
}

export const getStore = () => store

/**
 * 登录守卫，未登录跳转到登录页
 * @returns {boolean} 是否已登录
 */
export const requireLogin = () => {
  loadLocal()
  if (!store.isLoggedIn) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

// ---------- 家庭 ----------
export const addFamily = (family) => {
  const id = 'f_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
  const newFamily = { memberCount: 1, deviceCount: 0, sceneCount: 0, ...family, id }
  store.families.push(newFamily)
  if (!store.currentFamilyId) {
    store.currentFamilyId = id
  }
  // 创建者自动成为该家庭的"家长"成员
  const owner = {
    id: store.userInfo.id || ('m_' + Date.now()),
    name: store.userInfo.nickname || '家长',
    phone: store.userInfo.phone || '',
    role: '家长',
    familyId: id,
    joinTime: new Date().toISOString().split('T')[0]
  }
  store.members.push(owner)
  saveLocal()
  notify()
  return newFamily
}

export const removeFamily = (familyId) => {
  store.families = store.families.filter(f => f.id !== familyId)
  store.devices = store.devices.filter(d => d.familyId !== familyId)
  store.scenes = store.scenes.filter(s => s.familyId !== familyId)
  store.members = store.members.filter(m => m.familyId !== familyId)
  if (store.currentFamilyId === familyId) {
    store.currentFamilyId = store.families.length > 0 ? store.families[0].id : null
  }
  saveLocal()
  notify()
}

export const setCurrentFamily = (familyId) => {
  store.currentFamilyId = familyId
  saveLocal()
  notify()
}

export const updateFamily = (familyId, data) => {
  const family = store.families.find(f => f.id === familyId)
  if (family) {
    Object.assign(family, data)
    saveLocal()
    notify()
  }
}

export const getCurrentFamily = () => {
  return store.families.find(f => f.id === store.currentFamilyId) || store.families[0] || null
}

/**
 * 当前用户在当前家庭中的角色：'家长'（可管理）或 '成员'（仅可控制）
 */
export const getCurrentUserRole = () => {
  const familyId = store.currentFamilyId
  if (!familyId) return '家长'
  const uid = store.userInfo.id
  const phone = store.userInfo.phone
  const member = store.members.find(m =>
    m.familyId === familyId &&
    ((uid && m.id === uid) || (phone && m.phone === phone))
  )
  return member ? member.role : '家长'
}

export const getFamilyDevices = (familyId = store.currentFamilyId) => {
  return store.devices.filter(d => d.familyId === familyId)
}

export const getFamilyScenes = (familyId = store.currentFamilyId) => {
  return store.scenes.filter(s => s.familyId === familyId)
}

export const getFamilyMembers = (familyId = store.currentFamilyId) => {
  return store.members.filter(m => m.familyId === familyId)
}

// ---------- 设备 ----------
/**
 * 获取设备类型默认状态（用于新建/激活场景时回填默认配置）
 */
export const getDeviceDefaultConfig = (type) => {
  const map = {
    light: { isPowerOn: true, brightness: 80, color: 'warm' },
    ac: { isPowerOn: true, temperature: 26, mode: 'cool', windSpeed: 3 },
    curtain: { isPowerOn: true, openPercent: 60 },
    tv: { isPowerOn: true, volume: 30, channel: 1 },
    speaker: { isPowerOn: true, volume: 50, playing: false },
    air: { isPowerOn: true, mode: 'auto', fanLevel: 2 },
    washer: { isPowerOn: false, mode: 'standard', remaining: 0 },
    fridge: { isPowerOn: true, tempCold: 5, tempFreeze: -18 },
    oven: { isPowerOn: false, temp: 180, time: 15 },
    camera: { isPowerOn: true, nightVision: true, motionDetect: false, recording: false },
    sensor: { isPowerOn: true, alarm: false, temperature: 24, humidity: 55, pm25: 20, battery: 85 }
  }
  return map[type] || { isPowerOn: true }
}

export const addDevice = (device) => {
  const id = 'd_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
  const defaultState = getDeviceDefaultConfig(device.type)
  const newDevice = {
    ...defaultState,
    ...device,
    id,
    familyId: store.currentFamilyId,
    isOnline: false,
    isPowerOn: false,
    createTime: new Date().toISOString(),
    logs: []
  }
  store.devices.push(newDevice)
  const family = store.families.find(f => f.id === store.currentFamilyId)
  if (family) {
    family.deviceCount = store.devices.filter(d => d.familyId === store.currentFamilyId).length
  }
  saveLocal()
  notify()
  return newDevice
}

export const removeDevice = (deviceId) => {
  store.devices = store.devices.filter(d => d.id !== deviceId)
  const family = store.families.find(f => f.id === store.currentFamilyId)
  if (family) {
    family.deviceCount = store.devices.filter(d => d.familyId === store.currentFamilyId).length
  }
  saveLocal()
  notify()
}

export const updateDevice = (deviceId, data) => {
  const device = store.devices.find(d => d.id === deviceId)
  if (device) {
    Object.assign(device, data)
    saveLocal()
    notify()
  }
}

/**
 * 批量更新设备（用于场景激活/一键全开等一次性操作）
 * 支持两种调用方式：
 *   1) batchUpdateDevices([{deviceId, data, action}, ...])  —— 每台设备独立字段
 *   2) batchUpdateDevices(ids[], patch[, action])           —— 多台设备统一应用同一个 patch
 */
export const batchUpdateDevices = (arg1, arg2, arg3) => {
  let list = []
  if (Array.isArray(arg1) && (typeof arg1[0] === 'object' && arg1[0] !== null && !Array.isArray(arg1[0]))) {
    // 形式 1：元素是 {deviceId, data, action} 对象数组
    list = arg1
  } else if (Array.isArray(arg1) && arg2 && typeof arg2 === 'object') {
    // 形式 2：ids 数组 + 统一 patch
    list = arg1.map(id => ({ deviceId: id, data: arg2, action: arg3 || '批量更新' }))
  } else if (Array.isArray(arg1)) {
    // 只给了 ids，没 patch，忽略
    return
  }
  list.forEach(({ deviceId, data, action }) => {
    const device = store.devices.find(d => d.id === deviceId)
    if (device) {
      Object.assign(device, data || {})
      if (action) pushDeviceLog(device, action)
    }
  })
  saveLocal()
  notify()
}

const pushDeviceLog = (device, action) => {
  const now = new Date()
  const pad = n => (n < 10 ? '0' + n : '' + n)
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  device.logs = device.logs || []
  device.logs.unshift({ date, time, action })
  if (device.logs.length > 50) device.logs.length = 50
}

export const toggleDevicePower = (deviceId) => {
  const device = store.devices.find(d => d.id === deviceId)
  if (device) {
    device.isPowerOn = !device.isPowerOn
    device.isOnline = device.isPowerOn
    pushDeviceLog(device, device.isPowerOn ? '开启' : '关闭')
    saveLocal()
    notify()
    return device
  }
  return null
}

export const setDevicePower = (deviceId, on) => {
  const device = store.devices.find(d => d.id === deviceId)
  if (device) {
    if (device.isPowerOn !== on) {
      device.isPowerOn = on
      device.isOnline = on
      pushDeviceLog(device, on ? '开启' : '关闭')
      saveLocal()
      notify()
    }
  }
}

/**
 * 一键关闭当前家庭所有设备
 */
export const powerOffAllDevices = () => {
  const list = getFamilyDevices().filter(d => d.isPowerOn)
  list.forEach(d => {
    d.isPowerOn = false
    d.isOnline = false
    pushDeviceLog(d, '一键关闭')
  })
  saveLocal()
  notify()
  return list.length
}

// ---------- 场景 ----------
export const addScene = (scene) => {
  const id = 's_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
  const newScene = { ...scene, id, familyId: store.currentFamilyId, createTime: new Date().toISOString() }
  store.scenes.push(newScene)
  const family = store.families.find(f => f.id === store.currentFamilyId)
  if (family) {
    family.sceneCount = store.scenes.filter(s => s.familyId === store.currentFamilyId).length
  }
  saveLocal()
  notify()
  return newScene
}

export const removeScene = (sceneId) => {
  store.scenes = store.scenes.filter(s => s.id !== sceneId)
  const family = store.families.find(f => f.id === store.currentFamilyId)
  if (family) {
    family.sceneCount = store.scenes.filter(s => s.familyId === store.currentFamilyId).length
  }
  saveLocal()
  notify()
}

export const updateScene = (sceneId, data) => {
  const scene = store.scenes.find(s => s.id === sceneId)
  if (scene) {
    Object.assign(scene, data)
    saveLocal()
    notify()
  }
}

export const activateScene = (scene) => {
  const devices = scene.devices || []
  const updates = []
  devices.forEach(item => {
    const device = store.devices.find(d => d.id === item.deviceId)
    if (device) {
      const cfg = item.config || {}
      const data = { ...cfg }
      if (typeof cfg.isPowerOn === 'boolean') {
        data.isPowerOn = cfg.isPowerOn
        data.isOnline = cfg.isPowerOn
      }
      updates.push({ deviceId: device.id, data, action: `场景「${scene.name}」` })
    }
  })
  if (updates.length > 0) batchUpdateDevices(updates)
  else { notify() }
}

// ---------- 成员 ----------
export const addMember = (member) => {
  const id = 'm_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
  const newMember = { ...member, id, familyId: store.currentFamilyId, joinTime: new Date().toISOString().split('T')[0] }
  store.members.push(newMember)
  const family = store.families.find(f => f.id === store.currentFamilyId)
  if (family) {
    family.memberCount = store.members.filter(m => m.familyId === store.currentFamilyId).length
  }
  saveLocal()
  notify()
  return newMember
}

export const removeMember = (memberId) => {
  store.members = store.members.filter(m => m.id !== memberId)
  const family = store.families.find(f => f.id === store.currentFamilyId)
  if (family) {
    family.memberCount = store.members.filter(m => m.familyId === store.currentFamilyId).length
  }
  saveLocal()
  notify()
}

export const updateMember = (memberId, data) => {
  const member = store.members.find(m => m.id === memberId)
  if (member) {
    Object.assign(member, data)
    saveLocal()
    notify()
  }
}

// ---------- 示例数据 ----------
/**
 * 首次登录注入示例数据，提升空数据体验
 */
export const seedDemoData = () => {
  if (!store.userInfo || !store.userInfo.id) return
  if (store.families.length > 0) return

  // 家庭
  const demoFamilyId = 'f_demo_' + Date.now()
  const demoFamily = {
    id: demoFamilyId,
    name: '清风明月居',
    address: '江南路 88 号',
    description: '明月几时有，把酒问青天',
    template: '温馨之家',
    memberCount: 1,
    deviceCount: 4,
    sceneCount: 2
  }
  store.families.push(demoFamily)
  store.currentFamilyId = demoFamilyId

  // 成员（当前用户为家长）
  store.members.push({
    id: store.userInfo.id,
    name: store.userInfo.nickname || '主人',
    phone: store.userInfo.phone || '',
    role: '家长',
    familyId: demoFamilyId,
    joinTime: new Date().toISOString().split('T')[0]
  })

  // 示例设备
  const now = new Date().toISOString()
  const demoDevices = [
    {
      id: 'd_demo_1',
      name: '书房明月灯',
      type: 'light',
      brand: 'xiaomi',
      brandName: '小米',
      typeName: '灯具',
      location: '书房',
      description: '伏案夜读伴清影',
      brightness: 80,
      color: 'warm',
      isOnline: false,
      isPowerOn: false,
      createTime: now,
      logs: []
    },
    {
      id: 'd_demo_2',
      name: '客厅清风空调',
      type: 'ac',
      brand: 'gree',
      brandName: '格力',
      typeName: '空调',
      location: '客厅',
      description: '清风徐来，无暑无寒',
      temperature: 26,
      mode: 'cool',
      windSpeed: 3,
      isOnline: false,
      isPowerOn: false,
      createTime: now,
      logs: []
    },
    {
      id: 'd_demo_3',
      name: '卧室卷帘',
      type: 'curtain',
      brand: 'huawei',
      brandName: '华为',
      typeName: '窗帘',
      location: '卧室',
      description: '一卷晨光，半帘幽梦',
      openPercent: 60,
      isOnline: false,
      isPowerOn: false,
      createTime: now,
      logs: []
    },
    {
      id: 'd_demo_4',
      name: '客厅山水音箱',
      type: 'speaker',
      brand: 'xiaomi',
      brandName: '小米',
      typeName: '音箱',
      location: '客厅',
      description: '高山流水觅知音',
      volume: 50,
      playing: false,
      isOnline: false,
      isPowerOn: false,
      createTime: now,
      logs: []
    }
  ]
  demoDevices.forEach(d => store.devices.push({ ...d, familyId: demoFamilyId }))

  // 示例场景
  store.scenes.push({
    id: 's_demo_1',
    name: '晨曦初露',
    description: '晨光熹微，万物初醒',
    icon: '🌅',
    familyId: demoFamilyId,
    createTime: now,
    devices: [
      { deviceId: 'd_demo_3', config: { isPowerOn: true, openPercent: 100 } },
      { deviceId: 'd_demo_1', config: { isPowerOn: true, brightness: 60, color: 'natural' } }
    ]
  }, {
    id: 's_demo_2',
    name: '静夜安眠',
    description: '好梦相随，安枕入眠',
    icon: '💤',
    familyId: demoFamilyId,
    createTime: now,
    devices: [
      { deviceId: 'd_demo_1', config: { isPowerOn: false } },
      { deviceId: 'd_demo_2', config: { isPowerOn: true, temperature: 27, mode: 'auto', windSpeed: 1 } },
      { deviceId: 'd_demo_3', config: { isPowerOn: true, openPercent: 0 } },
      { deviceId: 'd_demo_4', config: { isPowerOn: false } }
    ]
  })

  saveLocal()
}

/**
 * 清空所有业务数据（家庭/设备/场景/成员），保留登录态
 */
export const resetDemoData = () => {
  store.families = []
  store.devices = []
  store.scenes = []
  store.members = []
  store.currentFamilyId = null
  uni.removeStorageSync('appData')
  notify()
}

/**
 * 先清空再重新注入示例数据（用于我的页「恢复示例」按钮）
 */
export const reSeedDemoData = () => {
  resetDemoData()
  // seedDemoData 里要求 families 为空才会执行；而且会 saveLocal
  seedDemoData()
  if (!store.currentFamilyId && store.families[0]) {
    setCurrentFamily(store.families[0].id)
  }
}

/**
 * 是否为示例数据（id 带 demo_ 前缀），供 UI 判断
 */
export const hasDemoData = () => {
  return store.devices.some(d => String(d.id).includes('demo_')) ||
    store.scenes.some(s => String(s.id).includes('demo_')) ||
    store.families.some(f => String(f.id).includes('demo_'))
}

// ---------- 辅助：设备图标字典 ----------
export const DEVICE_ICONS = {
  light: '💡',
  ac: '❄️',
  curtain: '🪟',
  air: '🌬️',
  tv: '📺',
  speaker: '🔊',
  camera: '📷',
  washer: '🧺',
  fridge: '🧊',
  oven: '🍳',
  sensor: '📡'
}

export const getDeviceIcon = (type) => DEVICE_ICONS[type] || '📱'

export const DEVICE_TYPE_NAMES = {
  light: '灯具',
  ac: '空调',
  curtain: '窗帘',
  air: '净化器',
  tv: '电视',
  speaker: '音箱',
  camera: '摄像头',
  washer: '洗衣机',
  fridge: '冰箱',
  oven: '烤箱',
  sensor: '传感器'
}

export const getDeviceTypeName = (type) => DEVICE_TYPE_NAMES[type] || '智能设备'
