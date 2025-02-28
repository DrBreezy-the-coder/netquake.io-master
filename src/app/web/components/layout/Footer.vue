<template lang="pug">
.footer
  .divider
  p.text-small
    a(href="mailto:efessel@gmail.com") Contact 
    |  | 
    a(href="https://gitlab.com/joe.lukacovic/netquake.io") Source
    |  |  
    a(href="https://discord.gg/5c28SZNtff") Discord
    |  |  
    a(href="/privacy") Privacy 
    |  | Buy me a 
    a(href="https://www.buymeacoffee.com/joelukacovic") ☕  
    |  | 
    router-link(:to="{name: 'faq'}") FAQ
</template>