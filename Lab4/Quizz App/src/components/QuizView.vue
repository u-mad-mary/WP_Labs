
   <template>
    <div class="quiz">
      <h1>{{ quiz.title }}</h1>
      <div v-for="(question, index) in quiz.questions" :key="question.id">
        <h3>Question {{ index + 1 }}: {{ question.question }} </h3>
        <p>{{ question.text }}</p>
        <div v-for="(answer, i) in question.answers" :key="i">
          <label :for="`${question.id}_${i}`">
            <input type="radio" :name="`question_${question.id}`" :id="`${question.id}_${i}`" :value="answer" v-model="selectedAnswers[question.id]">
            {{ answer }}
          </label>
        </div>
        <button class="button" v-if="!submitted[question.id]" type="button" @click="submitAnswer(question.id)">Submit Answer</button>
        <p v-if="submitted[question.id]">{{ message[question.id]}}</p>
        <input type="hidden" :name="`question_id_${question.id}`" :value="question.id">
      </div>
      <button class="button" type="button" v-if="!quizSubmitted" @click="calculatePercentage">Submit Quiz</button>
      <p v-if="quizSubmitted">You answered {{ correctAnswers }} out of {{ quiz.questions.length }} questions correctly ({{ percentageCorrect }}%).</p>
    </div>
  </template>
  
  <script>
  import { getQuizById, submitQuiz } from '../router'
  
  export default {
    data() {
      return {
        quiz: {},
        selectedAnswers: {},
        submitted: {},
        message: {},
        quizSubmitted: false,
        quizMessage: '',
        correctAnswers: 0,
        percentageCorrect: 0
      }
    },
    async created() {
      const quizId = this.$route.params.quizId
      this.quiz = await getQuizById(quizId)
      this.quiz.questions.forEach(question => {
        this.selectedAnswers[question.id] = null
        this.submitted[question.id] = false
        this.message[question.id] = ''
      })
    },
    methods: {
      async submitAnswer(questionId) {
        const userId = localStorage.getItem('userId')
        const quizId = this.$route.params.quizId
        const data = {
          data: {
            question_id: questionId,
            answer: this.selectedAnswers[questionId],
            user_id: userId
          }
        }
        const response = await submitQuiz(quizId, data)
        if (response.correct) {
          this.submitted[questionId] = true
          this.message[questionId] = 'Correct!'
          this.correctAnswers++
        } else {
          this.submitted[questionId] = true
          this.message[questionId] = 'Wrong!'
        }
      },

      calculatePercentage() {
      const numCorrect = this.correctAnswers
      const numQuestions = this.quiz.questions.length
      const percentage = (numCorrect / numQuestions) * 100
      this.percentageCorrect = percentage.toFixed(2)
      this.quizSubmitted = true
    }
    }}
  </script>
  