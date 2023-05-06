  <template>
    <div>
      <h1>Quizzes</h1>
      <div v-if="loading">Loading quizzes...</div>
      <div v-else>
        <ul>
          <li v-for="quiz in quizzes" :key="quiz.id">
            <router-link :to="'/quizzes/' + quiz.id">{{ quiz.title }}</router-link>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue'
  import { getAllQuizzes } from '../router'
  
  export default {
    name: 'QuizzesView',
    setup() {
      const quizzes = ref([])
      const loading = ref(true)
  
      onMounted(async () => {
        try {
          quizzes.value = await getAllQuizzes()
        } catch (error) {
          console.error(error)
        } finally {
          loading.value = false
        }
      })
  
      return {
        quizzes,
        loading,
      }
    },
  }
  </script>
  