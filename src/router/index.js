import { createRouter, createWebHistory } from 'vue-router'
import TaxCenter from '../components/TaxCenter.vue'
import NoticePage from '../components/NoticePage.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: TaxCenter
    },
    {
        path: '/notice',
        name: 'Notice',
        component: NoticePage
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
