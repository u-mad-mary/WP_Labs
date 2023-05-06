import { createRouter, createWebHistory } from 'vue-router'
const ACCESS_TOKEN = 'b81364cf2fa55b6311ec1d3ae7234dee199de02986e0b90270aa89b8a79d4514'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home'
    },
    {
      path: '/quizzes',
      name: 'quizzes',
      component: () => import('../components/QuizzesView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/quizzes/:quizId',
      name: 'quiz',
      component: () => import('../components/QuizView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../components/UserView.vue')
    }
  ]
})

// Function to make API calls with X-Access-Token header
async function makeApiCall(method, url, data = {}) {
  let options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Token': ACCESS_TOKEN  
    }
  };
  
  if (method === 'POST' || method === 'PUT') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to fetch.');
  }
  return responseData;
}

// Function to get all quizzes
export async function getAllQuizzes() {
  return await makeApiCall('GET', 'https://late-glitter-4431.fly.dev/api/v54/quizzes');
}

// Function to create a quiz
export async function createQuiz(data) {
  return await makeApiCall('POST', 'https://late-glitter-4431.fly.dev/api/v54/quizzes', data);
}

// Function to delete a quiz
export async function deleteQuiz(quizId) {
  return await makeApiCall('DELETE', `https://late-glitter-4431.fly.dev/api/v54/quizzes/${quizId}`);
}

// Function to get a quiz by id
export async function getQuizById(quizId) {
  return await makeApiCall('GET', `https://late-glitter-4431.fly.dev/api/v54/quizzes/${quizId}`);
}

// Function to submit a quiz
export async function submitQuiz(quizId, data) {
  return await makeApiCall('POST', `https://late-glitter-4431.fly.dev/api/v54/quizzes/${quizId}/submit`, data);
}

// Function to create a user
export async function createUser(data) {
  return await makeApiCall('POST', 'https://late-glitter-4431.fly.dev/api/v54/users', data);
}

// Function to get all users
export async function getAllUsers() {
  return await makeApiCall('GET', 'https://late-glitter-4431.fly.dev/api/v54/users');
}

// Function to delete a user
export async function deleteUser(userId) {
  return await makeApiCall('DELETE', `https://late-glitter-4431.fly.dev/api/v54/users/${userId}`);
}

// Navigation guard to check if the user is logged in
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('userId') !== null
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isLoggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router
