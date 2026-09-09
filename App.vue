<script>
export default {
  onLaunch() {
    console.log('App Launch')
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style>
page {
  background-color: #FFFAF0;
  font-family: "STKaiti", "KaiTi", "SimSun", serif;
}

view {
  box-sizing: border-box;
}

/* 古风主题色变量 */
:root {
  --primary-color: #8B4513;
  --primary-light: #DEB887;
  --primary-dark: #654321;
  --accent-color: #CD853F;
  --bg-color: #FFFAF0;
  --bg-card: #FFF8DC;
  --text-color: #2F1810;
  --text-secondary: #8B7355;
  --border-color: #D2B48C;
  --success-color: #228B22;
  --warning-color: #DAA520;
  --danger-color: #B22222;
}
</style>
