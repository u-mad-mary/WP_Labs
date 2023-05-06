   <template>
    <div id="register-view">
      <h1>Register</h1>
      <form @submit.prevent="registerUser" id="registration">
        <div>
          <label for="name" id="reg-name">Name:</label>
          <input type="text" id="name" v-model="name" required>
        </div>
        <div>
          <label for="surname" id="reg-surname">Surname:</label>
          <input type="text" id="surname" v-model="surname" required>
        </div>
        <button class="button" type="submit" id="reg-button">Register</button>
      </form>
    </div>
  </template>
  
  <script>
  import { createUser } from '../router/index'
  
  export default {
    name: 'UserView',
    data() {
      return {
        name: '',
        surname: '',
        isLoggedIn: false,
        user: {}
      }
    },
    created() {
      const userId = localStorage.getItem('userId')
      if (userId) {
        this.isLoggedIn = true
        this.user = {
          name: localStorage.getItem('userName'),
          surname: localStorage.getItem('userSurname')
        }
      }
    },
    methods: {

      async registerUser() {
  try {
    const response = await createUser({
      data: {
        name: this.name,
        surname: this.surname
      }
    })
    localStorage.setItem('userId', response.id) // Save user ID in local storage
    localStorage.setItem('userName', this.name) // Save user name in local storage
    localStorage.setItem('userSurname', this.surname) // Save user surname in local storage
    alert(`User registered with ID: ${response.id}`)
    this.isLoggedIn = true
    this.user = {
      name: this.name,
      surname: this.surname
    }
    this.$emit('user-registered', { // emit 'user-registered' event with user's name and surname
      name: this.name,
      surname: this.surname
    })
    this.$router.push({ name: 'quizzes' }) // redirect to quizzes view
  } catch (error) {
    alert(`Error registering user: ${error.message}`)
  }
}
    }
  }
  </script>
  