import ArchitectureExplained from '../pages/ArchitectureExplained.vue'

const routes = [
  {
    path: "/ArchitectureExplained",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/ArchitectureExplained.vue")
      }
    ]
  },
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/PageElect.vue")
      }
    ]
  },
  {
    path: "/OrdinosExplained/:pageName*",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/OrdinosExplained.vue")
      }
    ]
  },
  {
    path: "/CreateElection",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/CreateElection.vue"),
      }
    ]
  },
  {
    path: "/CurrentElections",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/CurrentElections.vue")
      }
    ]
  },
];

// Always leave this as last one
if (process.env.MODE !== "ssr") {
  routes.push({
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue")
  });
}

export default routes;
