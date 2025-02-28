
<template lang="pug">
.map-image(ref="image")
  slot
</template>
  
<script lang="ts" setup>
import { defineComponent , onMounted, ref, watch, computed } from 'vue'
import { getMapImageUrl, genericImageUrl } from '../helpers/map';

const props = defineProps<{map: string}>()

const image = ref<HTMLImageElement|null>(null)
const map = computed(() => getMapImageUrl(props.map))

onMounted(() => {
  if (image.value) {
    image.value.style.backgroundImage = `url(${map.value}), url(${genericImageUrl})`
  }
})

watch(map, () => {
  if (image.value) {
    image.value.style.backgroundImage = `url(${map.value}), url(${genericImageUrl})`
  }
})
</script>

<style lang="scss" scoped>
.map-image {
  background-repeat: no-repeat;
  background-size: cover;
}
</style>