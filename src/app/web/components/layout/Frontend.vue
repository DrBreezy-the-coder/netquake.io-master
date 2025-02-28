<template lang="pug">
.main
  .container.grid-lg
    .columns
      .col-12
        header.navbar
          section.navbar-section
            router-link.navbar-brand.mr-2(to='/') WebQuake
            router-link.btn.btn-link(:to="{name: 'singleplayer'}") Singleplayer
            router-link.btn.btn-link(:to="{name: 'multiplayer'}") Multiplayer
            router-link.btn.btn-link(:to="{name: 'assets'}") Setup
    .columns
      .col-12.app-content
        router-view
    Footer 
</template>
<script lang="ts" setup>
import Footer from './Footer.vue'
</script>