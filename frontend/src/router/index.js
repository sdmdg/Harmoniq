// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import HomeView from '../views/HomeView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import ForbiddenView from '../views/ForbiddenView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      component: LoginPage,
      meta: {
        hideSidebar: true,
        hideTopNav: true,
        hidePlayer: true,
        requiresAuth: false // Login page doesn't require authentication
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: {
        hideSidebar: true,
        hideTopNav: true,
        hidePlayer: true,
        requiresAuth: false // Login page doesn't require authentication
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
      meta: {
        hideSidebar: true,
        hideTopNav: true,
        hidePlayer: true,
        requiresAuth: false // Login page doesn't require authentication
      }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true, // This page requires authentication
        allowedRoles: ['artist', 'listener', 'admin'] // Example: Both user and admin can access home
      }
    },
    {
      path: '/search',
      name: 'search',
      component: HomeView,
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['artist', 'listener', 'admin']
      }
    },
    {
      path: '/library',
      name: 'library',
      component: HomeView,
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['artist', 'listener', 'admin']
      }
    },
    // Example of an admin-only route
    {
      path: '/admin-dashboard',
      name: 'admin-dashboard',
      // component: AdminDashboardView,
      component: HomeView, // Using HomeView as a placeholder for now
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['admin'] // Only admin can access this route
      }
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView,
      meta: {
        hideSidebar: true,
        hideTopNav: true,
        hidePlayer: true,
        requiresAuth: false // NotFound page doesn't require authentication
      }
    },

    // The CATCH-ALL ROUTE
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
      meta: {
        hideSidebar: true,
        hideTopNav: true,
        hidePlayer: true,
        requiresAuth: false // NotFound page doesn't require authentication
      }
    }
  ]
});

// Global Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('jwt_token'); // Check if token exists
  const userDataString = localStorage.getItem('user_data');
  let userRole = null;

  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      userRole = userData.role; // Get user role from stored data
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
      // Handle corrupted data, maybe clear it
      localStorage.removeItem('user_data');
    }
  }

  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // If not authenticated, redirect to login page
      console.log(`Access denied: Route ${to.path} requires authentication. Redirecting to login.`);
      next({ name: 'login' });
    } else {
      // If authenticated, check roles
      if (to.meta.allowedRoles && to.meta.allowedRoles.length > 0) {
        if (userRole && to.meta.allowedRoles.includes(userRole)) {
          // User has the required role, proceed
          console.log(`Access granted: User role '${userRole}' is allowed on ${to.path}.`);
          next();
        } else {
          // User does not have the required role, redirect to unauthorized or home
          console.warn(`Access denied: User role '${userRole}' not allowed on ${to.path}. Redirecting to home.`);
          // 403 Forbidden page or a more appropriate fallback
          next({ name: 'forbidden' });
        }
      } else {
        // Route requires authentication but doesn't specify roles, just proceed
        console.log(`Access granted: Route ${to.path} requires authentication, no specific roles needed.`);
        next();
      }
    }
  } else {
    // If the route does NOT require authentication (e.g., login, public pages)
    if (to.name === 'login' && isAuthenticated) {
        // If user is already authenticated and tries to go to login page, redirect to home
        console.log(`Already authenticated. Redirecting from login page to home.`);
        next({ name: 'home' });
    } else {
        // For all other public routes or if not authenticated and trying to access login, proceed
        console.log(`Proceeding to public route: ${to.path}.`);
        next();
    }
  }
});

export default router;