<template>
  <div class="content">
    <div>
    <h1>404 - Page does not exist</h1>
  </div>

  <button class="btn btn-lg btn-success mt-5" >
    <router-link to="/">Go Back</router-link>
  </button>
  </div>
</template>

<style scoped>
  .content{
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  a{
    color: white;
  }

  a:hover{
    text-decoration: none;
    color: white;
  }
</style>
