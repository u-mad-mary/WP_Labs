   <template>
    <div>
      <div v-if="loading">Loading quizzes...</div>
      <div v-else>
        <div class="quiz-box" v-for="quiz in quizzes" :key="quiz.id">
          <router-link :to="'/quizzes/' + quiz.id" class="quiz-title-link">
            <div class="quiz-title">{{ quiz.title }}</div>
          </router-link>
          <div v-if="quizResult(quiz.id)">
            <p>You scored {{ quizResult(quiz.id).percentageCorrect }}% on this quiz.</p>
          </div>
          <div v-else>
          <div>Play the quiz to score.</div>
        </div>
        </div>
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
  
      const quizResult = (quizId) => {
        const result = JSON.parse(localStorage.getItem(`quizResult_${quizId}`))
        if (result) {
          return {
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions,
            percentageCorrect: result.percentageCorrect
          }
        }
        return null
      }
  
      return {
        quizzes,
        loading,
        quizResult
      }
    },
  }
  </script>
  