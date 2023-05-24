<template>
  <div v-if="isLoggedIn" class="user-info">
      <p>Logged in as <b>{{ user.name }} {{ user.surname }}.</b></p>
      <button class="button" @click="logout">Log Out</button>
  </div>
  <div v-else class = "user-info">
      <p>Please register to access the quizzes.</p>
  </div>
    <div class="container">
      <audio ref="audio" loop>
      <source src="./assets/lofi.mp3" type="audio/mpeg">
    </audio>
    <header class="head">
      <h1>Welcome to the Quiz App!</h1>
      <button class="button" id="music" @click="startAudio">{{ isPlaying ? 'Turn Music Off' : 'Turn Music On' }}</button>
    </header>
    <nav class ="nav-bar">
      <router-link to="/">Home</router-link>
      <router-link v-if="isLoggedIn" to="/quizzes">Quizzes</router-link>
      <router-link v-else to="/users">Register</router-link>
    </nav>
    <router-view @user-registered="updateUser"></router-view>
  </div>
</template>

<script>
import { deleteUser } from './router/index';
const userId = localStorage.getItem('userId')
export default {
  name: 'App',
  data() {
    return {
      isLoggedIn: false,
      user: {},
      isPlaying: false,
      audioContext: null
    }
  },
  created(){
    const userName = localStorage.getItem('userName');
    const userSurname = localStorage.getItem('userSurname');
    if (userId) {
      this.isLoggedIn = true;
      this.user.name = userName;
      this.user.surname = userSurname;
    }
  },
  methods: {
    updateUser(userInfo) {
      this.isLoggedIn = true
      this.user = {
        id: userInfo.id,
        name: userInfo.name,
        surname: userInfo.surname
      }      
    },    
    logout() {
    deleteUser(userId)
      .then(() => {
        localStorage.clear(); // Remove all data from local storage
        this.isLoggedIn = false;
        this.$router.push('/');
      })
      .catch(error => {
        console.error(error);
      });
  },
  
    startAudio() {
    if (!this.isPlaying) {
      // Create an AudioContext and play the audio
      this.audioContext = new AudioContext();
      this.$refs.audio.play().then(() => {
        const track = this.audioContext.createMediaElementSource(this.$refs.audio);
        track.connect(this.audioContext.destination);
        this.isPlaying = true;
      });
    } else {
      // Pause the audio and close the AudioContext
      this.$refs.audio.pause();
      this.audioContext.close();
      this.isPlaying = false;
    }
}}}
</script>
