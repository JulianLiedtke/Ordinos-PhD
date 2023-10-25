const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "/verification",
        component: () => import("pages/Verification.vue")
      },
      {
        path: "/postverification",
        component: () => import("pages/PostVerification.vue")
      },
      {
        path: "",
        component: () => import("pages/PostVerification.vue")
      }
    ]
  }
];

// Always leave this as last one
if (process.env.MODE !== "ssr") {
  routes.push({
    path: '/:catchAll(.*)*',
    component: () => import("pages/Error404.vue")
  });
}

export default routes;
