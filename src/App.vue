<template>
  <router-view/>
</template>

<script>

export default {

}
</script>


<style>

*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

h1,h2,h3,h4,h5,h6{
  margin: 0;
  padding: 0;
}

header{
  height: 80px;
  background: #d0f0c0;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding-top: 15px;
}

.header__content{
  display: flex;
  align-content: center;
  flex-direction: column;
  padding-bottom: 10px;
}

.heading{
  display: flex;
  align-content: center;
  font-weight: bold;
  border-bottom: #42b983 3px solid;
}

.links{
  width: 500px;
  display: flex;
  justify-content: right;
  align-items: center;
}

.links a{
  color: #2c3e50;
  font-size: 18px;
  font-weight: bold;
  padding-left: 15px;
}

.links a:hover{
  text-decoration: none;
  color: #42b983;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* #nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
} */
</style>
