<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" style="width:30vw;max-width:150px;" />
    </p>
    <p class="text-faded">
      网页走失...
      <strong>(404)</strong>
    </p>
    <q-btn color="accent" class="w120" @click="$router.push('/')">返回首页</q-btn>
  </div>
</template>
