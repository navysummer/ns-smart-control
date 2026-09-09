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
const notify = () => { _listeners.forEach(fn => fn()) }

export const subscribe = (fn) => {
  _listeners.push(fn)
  return () => {
    const i = _listeners.indexOf(fn)
    if (i > -1) _listeners.splice(i, 1)
  }
}

export const login = (userInfo) => {
  store.isLoggedIn = true
  store.userInfo = userInfo
  uni.setStorageSync('userInfo', userInfo)
  notify()
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
  if (userInfo) {
    store.isLoggedIn = true
    store.userInfo = userInfo
  }
  loadAppData()
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

export const getStore = () => store

export const addFamily = (family) => {
  const id = 'f_' + Date.now()
  const newFamily = { ...family, id, memberCount: 1, deviceCount: 0, sceneCount: 0 }
  store.families.push(newFamily)
  if (!store.currentFamilyId) {
    store.currentFamilyId = id
  }
  saveLocal()
  notify()
  return newFamily
}

export const removeFamily = (familyId) => {
  store.families = store.families.filter(f => f.id !== familyId)
  store.devices = store.devices.filter(d => d.familyId !== familyId)
  store.scenes = store.scenes.filter(s => s.familyId !== familyId)
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

export const getCurrentFamily = () => {
  return store.families.find(f => f.id === store.currentFamilyId) || null
}

export const getFamilyDevices = () => {
  return store.devices.filter(d => d.familyId === store.currentFamilyId)
}

export const getFamilyScenes = () => {
  return store.scenes.filter(s => s.familyId === store.currentFamilyId)
}

export const getFamilyMembers = () => {
  return store.members.filter(m => m.familyId === store.currentFamilyId)
}

export const addDevice = (device) => {
  const id = 'd_' + Date.now()
  const newDevice = {
    ...device,
    id,
    familyId: store.currentFamilyId,
    isOnline: false,
    isPowerOn: false,
    createTime: new Date().toISOString()
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

export const toggleDevicePower = (deviceId) => {
  const device = store.devices.find(d => d.id === deviceId)
  if (device) {
    device.isPowerOn = !device.isPowerOn
    device.isOnline = device.isPowerOn
    saveLocal()
    notify()
  }
}

export const addScene = (scene) => {
  const id = 's_' + Date.now()
  const newScene = { ...scene, id, familyId: store.currentFamilyId }
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

export const addMember = (member) => {
  const id = 'm_' + Date.now()
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
