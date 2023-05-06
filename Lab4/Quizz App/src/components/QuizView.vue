<template>
  <div class="quiz">
    <h1 v-if="!quizSubmitted">{{ quiz.title }}</h1>
    <div v-if="quizSubmitted">
      <div>You answered {{ correctAnswers }} out of {{ quiz.questions.length }} questions correctly ({{ percentageCorrect }}%).</div>
    </div>
    <div v-else>
      <div v-if="timerSeconds > 0" class="timer"> Timer: {{ timerDisplay }}</div>
      <p>You need to check your answers in order to record them, otherwise you will get 0 points for each unchecked answer. <br>
      Once checked, the answer will be registered. Even if you reenter the quiz, you will not be able to change the registered answer. <br>
      Answer before the timer is up, otherwise the quiz will be submitted automatically.</p>
      <div v-for="(question, index) in quiz.questions" :key="question.id">
        <h3>Question {{ index + 1 }}: {{ question.question }} </h3>
        <p>{{ question.text }}</p>
        <div v-for="(answer, i) in question.answers" :key="i">
          <label :for="`${question.id}_${i}`">
            <input type="radio" :name="`question_${question.id}`" :id="`${question.id}_${i}`" :value="answer" v-model="selectedAnswers[question.id]">
            {{ answer }}
          </label>
        </div>
        <button class="button" id="sub-ans" v-if="!submitted[question.id]" type="button" @click="submitAnswer(question.id)">Check</button>
        <p v-if="submitted[question.id]">{{ message[question.id]}}</p>
        <img v-if="submitted[question.id] && message[question.id] === 'Correct!'" src="../assets/happy-cat.gif" alt="Happy cat">
        <img v-if="submitted[question.id] && message[question.id] === 'Wrong!'" src="../assets/cat-sad.gif" alt="Sad cat">
        <input type="hidden" :name="`question_id_${question.id}`" :value="question.id">
      </div>
      <button class="button" id= "submit" type="button" v-if="!quizSubmitted" @click="calculatePercentage">Submit Quiz</button>
    </div>
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
      percentageCorrect: 0,
      timerSeconds: 60, // number of seconds for the timer
      timerInterval: null
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
  // Check if quiz has already been submitted
  const quizResult = JSON.parse(localStorage.getItem(`quizResult_${quizId}`))
  if (quizResult) {
  this.quizSubmitted = true
  this.correctAnswers = quizResult.correctAnswers
  this.percentageCorrect = quizResult.percentageCorrect
  this.quizMessage = `You answered ${this.correctAnswers} out of ${this.quiz.questions.length} questions correctly (${this.percentageCorrect}%).`
  }},

  computed: {
    timerDisplay() {
      const minutes = Math.floor(this.timerSeconds / 60)
      const seconds = this.timerSeconds % 60
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }
  },

  mounted() {
    this.timerInterval = setInterval(() => {
      this.timerSeconds--
      if (this.timerSeconds <= 0) {
        clearInterval(this.timerInterval)
        this.calculatePercentage()
      }
    }, 1000)
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
      // Save quiz id and percentage to local storage
      const quizId = this.$route.params.quizId
      const result = {
        correctAnswers: this.correctAnswers,
        totalQuestions: numQuestions,
        percentageCorrect: this.percentageCorrect
      }
      localStorage.setItem(`quizResult_${quizId}`, JSON.stringify(result))
}}}
</script>