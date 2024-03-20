<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
// 导入业务方法
import { getHomeBannerAPI, getHomeCategoryAPI, getHomeHotAPI } from '../../services/home'
// 导入类型
import type { BannerItem, CategoryItem, HotItem } from '../../types/home'
import type { ShopGuessInstance } from '@/types/component'
// 导入组件
import CustomNavbar from './components/CustomNavbar.vue'
import CategoryPanel from './components/CategoryPanel.vue'
import HotPanel from './components/HotPanel.vue'

// 获取首页轮播图数据
const bannerList = ref<BannerItem[]>([])
const getHomeBannerData = async () => {
  const res = await getHomeBannerAPI()
  // console.log(res)
  bannerList.value = res.result
}
// 获取首页分类数据
const categoryList = ref<CategoryItem[]>([])
const getHomeCategoryData = async () => {
  const res = await getHomeCategoryAPI()
  // console.log(res)
  categoryList.value = res.result
}
// 获取热门推荐的数据
const hotList = ref<HotItem[]>([])
const getHomeHotData = async () => {
  const res = await getHomeHotAPI()
  // console.log(res)
  hotList.value = res.result
}

// 是否加载中标记
const isLoading = ref(false)

// 页面加载
onLoad(async () => {
  isLoading.value = true
  await Promise.all([getHomeBannerData(), getHomeCategoryData(), getHomeHotData()])
  isLoading.value = false
})

// 获取猜你喜欢的组件实例
const shopGuessRef = ref<ShopGuessInstance>()
// 下拉刷新状态
const isTriggered = ref(false)
// 自定义下拉刷新被触发
const onRefresherrefresh = async () => {
  // 开启动画
  isTriggered.value = true
  // 重置猜你喜欢组件数据
  shopGuessRef.value?.resetData()
  // 加载数据
  await Promise.all([getHomeBannerData(), getHomeCategoryData(), getHomeHotData()])
  // 关闭动画
  isTriggered.value = false
}

// 滚动触底事件
const onScrolltolower = () => {
  shopGuessRef.value?.getMore()
}
</script>

<template>
  <view class="viewport">
    <!-- 自定义标题组件 -->
    <CustomNavbar />
    <scroll-view
      enable-back-to-top
      refresher-enabled
      class="scroll-view"
      @refresherrefresh="onRefresherrefresh"
      :refresher-triggered="isTriggered"
      @scrolltolower="onScrolltolower"
      scroll-y
    >
      <PageSkeleton v-if="isLoading" />
      <template v-else>
        <!-- 自定义轮播图 -->
        <ShopSwiper :list="bannerList" />
        <!-- 首页分类 -->
        <CategoryPanel :list="categoryList" />
        <!-- 热门推荐 -->
        <HotPanel :list="hotList" />
        <!-- 猜你喜欢 -->
        <ShopGuess ref="shopGuessRef" />
      </template>
    </scroll-view>
  </view>
</template>

<style lang="scss">
//
page {
  background-color: #f7f7f7;
  height: 100%;
  overflow: hidden;
}

.viewport {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scroll-view {
  flex: 1;
  overflow: hidden;
}
</style>
