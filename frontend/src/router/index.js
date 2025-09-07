// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import HomeView from '../views/HomeView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import ForbiddenView from '../views/ForbiddenView.vue'
import ProfileView from '../views/Profile.vue'
import LibraryView from '../views/LibraryView.vue'
import AlbumView from '../views/AlbumView.vue'
import ArtistView from '../views/ArtistView.vue'
import UploadView from '../views/UploadView.vue'
import PlaylistView from '../views/PlaylistView.vue'
import AdminDash from '../views/AdminDash.vue'

import ArtistUploadView from '../views/ArtistUploadView.vue'

import ReportView from '../views/ReportView.vue'
import ReportIssue from '../views/ReportIssue.vue'
import ReportingGuide from '../views/ReportingGuide.vue'
import ReportDetail from '../views/ReportDetail.vue'
import AdminUserDetail from '../views/AdminUserDetail.vue'
import AdminSongManage from '../views/AdminSongManage.vue'
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
        requiresAuth: true,
        allowedRoles: ['artist', 'listener']
      }
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportView,
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['admin']
      }
    },
    {
      path: '/reportIssue',
      name: 'reportIssue',
      component: ReportIssue,
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['listener', 'artist']
      }
    },
     {
    path: '/support/reporting-guidelines',
    name: 'ReportingGuidelines',
    component: ReportingGuide
  },

    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        hideSidebar: true,
        hideTopNav: true,
        hidePlayer: true,
        requiresAuth: true,
        allowedRoles: ['artist', 'listener', 'admin']
      }
    },
    {
      path: '/artist/:id',
      name: 'artist',
      component: ArtistView,
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['artist', 'listener', 'admin']
      }
    },
    {
      path: '/album/:id',
      name: 'album',
      component: AlbumView,
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['artist', 'listener', 'admin']
      }
    },
    {
      path: '/playlist/:id',
      name: 'playlist',
      component: PlaylistView,
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['artist', 'listener']
      }
    },
    {
  path: '/reports/:id',
  name: 'report-detail',
  component: ReportDetail,
  meta: { requiresAuth: true, allowedRoles: ['admin'], hideSidebar:false, hideTopNav:false, hidePlayer:false }
}
,
    {
      path: '/liked-songs/',
      name: 'liked',
      component: PlaylistView,
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['artist', 'listener']
      }
    },

     {
      path: '/get_playlist',
      name: 'get_playlist',
      component: PlaylistView,
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['artist', 'listener']
      }
    },
    // src/router/index.js


 {
      path: '/usersignup/:id',
      name: 'AdminUserDetail',
      component: AdminUserDetail,
       meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['artist', 'listener', 'admin']
      }
     },
     {
      path: '/upload',
      name: 'upload',
      component: UploadView,
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
      component: LibraryView,
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['artist', 'listener']
      }
    },
    
{
  path: '/artist/upload',
  name: 'artist-upload',
  component: ArtistUploadView,
  meta: {
    hideSidebar: false,
    hideTopNav: false,
    hidePlayer: false,
    requiresAuth: true,
    allowedRoles: ['artist']
  }
},
    //  {
    //   path: '/upload',
    //   name: 'upload',
    //   component: UploadView,
    //   meta: {
    //     hideSidebar: false,
    //     hideTopNav: false,
    //     hidePlayer: false,
    //     requiresAuth: true,
    //     allowedRoles: ['artist', 'listener', 'admin']
    //   }
    // },

    {
  path: '/upload',
  name: 'upload',
  component: UploadView,
  beforeEnter: (to, from, next) => {
    // read role the same way your global guard does
    const data = localStorage.getItem('user_data')
    let role = null
    try { role = data ? JSON.parse(data).role : null } catch (_) {}
    if (role === 'artist') return next({ name: 'artist-upload' })
    next()
  },
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
      component: AdminDash, // Using HomeView as a placeholder for now
      meta: {
        hideSidebar: false,
        hideTopNav: false,
        hidePlayer: false,
        requiresAuth: true,
        allowedRoles: ['admin'] // Only admin can access this route
      }
    },
    {
      path: '/adminSongsManage',
      name: 'Songs Management',
      // component: AdminDashboardView,
      component:AdminSongManage, // Using HomeView as a placeholder for now
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