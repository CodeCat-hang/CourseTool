<template>
  <q-layout view="hHh LpR lFf">
    <!-- 顶部工具栏：开始 -->
    <q-header elevated class="top-banner text-white">
      <q-toolbar>
        <q-btn flat round dense icon="mdi-menu" @click="toggleLeftDrawer">
          <q-tooltip>收起/展开侧边栏</q-tooltip>
        </q-btn>
        <q-badge outline align="middle" color="cyan-3" class="q-ml-md">AHPU 课程小工具</q-badge>
        <q-space />
        <q-badge outline align="middle" color="cyan-3">v0.9.0</q-badge>
        <q-separator dark vertical inset class="q-mx-md" />
        <q-btn flat round dense @click="toggleFullScreen" :icon="$q.fullscreen.isActive ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'">
          <q-tooltip>全屏/窗口切换</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>
    <!-- 顶部工具栏：结束 -->

    <!-- 左侧抽屉：开始 -->
    <q-drawer show-if-above bordered v-model="showLeftDrawer" content-class="left-drawer" :mini="miniLeftDrawer" :width="220" :breakpoint="500">
      <q-scroll-area class="fit">
        <q-list>
          <q-item
            clickable
            v-ripple
            v-for="(e, i) in menus"
            :key="i"
            :to="e.to"
            :active="activeMenu === i"
            class="menu-item"
            active-class="active-menu-item"
            @click="activeMenu = i"
          >
            <q-item-section avatar>
              <q-icon :name="e.icon" />
            </q-item-section>
            <q-item-section>{{ e.label }}</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    <!-- 左侧抽屉：结束 -->

    <q-page-container>
      <router-view></router-view>
      <q-page-scroller position="bottom-right" :scroll-offset="100" :offset="[20, 20]">
        <q-btn fab-mini icon="mdi-arrow-up-bold" color="accent" class="glossy" />
      </q-page-scroller>
    </q-page-container>

    <q-footer class="bg-blue-grey-1">
      <q-toolbar>
        <q-space />
        <q-btn flat label="Powered By Huping, SE dep. of AHPU" color="blue-grey-3" />
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import notify from '../util/notify'
import BUS from '../util/bus'
import EVENT from '../util/event'

export default {
  data() {
    return {
      showLeftDrawer: true,
      miniLeftDrawer: false,
      activeMenu: -1,
      menus: []
    }
  },
  methods: {
    toggleFullScreen() {
      this.miniLeftDrawer = !this.$q.fullscreen.isActive
      this.$q.fullscreen.toggle()
    },
    toggleLeftDrawer() {
      this.miniLeftDrawer = !this.miniLeftDrawer
    }
  },
  mounted() {
    window.onresize = () => {
      BUS.$emit(EVENT.RESIZE)
    }
    this.menus = Object.freeze(this.$store.getters['menu/myMenus']())
    this.$router.push(this.$store.getters['menu/activeMenu']())
  },
  components: {}
}
</script>
