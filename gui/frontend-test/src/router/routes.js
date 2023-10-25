
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/single', component: () => import('pages/ElectionSingleChoice.vue') },
      { path: '/ranking', component: () => import('pages/ElectionRanking.vue') },
      { path: '/rating', component: () => import('pages/ElectionRating.vue') },
      { path: '/multiple', component: () => import('pages/ElectionMultipleChoice.vue') },
      { path: '/setup', component: () => import('pages/ElectionSetup.vue') },
      { path: '/election', component: () => import('pages/ElectionMain.vue') },
      { path: '/ballot', component: () => import('pages/ComponentBallot.vue') },
      { path: '/dragdrop', component: () => import('pages/RankingDragDrop.vue') },,
      { path: '/ZKP', component: () => import('pages/ZKP.vue') },
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
