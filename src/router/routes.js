const routes = [{
    path: '/',
    component: () =>
        import ('layouts/Main.vue'),
    children: [
        { path: 'line', component: () =>
                import ('components/Line.vue') },
        { path: 'scatter', component: () =>
                import ('components/Scatter.vue') },
        { path: 'bar', component: () =>
                import ('components/Bar.vue') },
        { path: 'radar', component: () =>
                import ('components/Radar.vue') },
        { path: 'pie', component: () =>
                import ('components/Pie.vue') },
        { path: 'heat', component: () =>
                import ('components/Heat.vue') },
        { path: 'bar2', component: () =>
                import ('components/Bar2.vue') },
    ]
}]
if (process.env.MODE !== 'ssr') {
    routes.push({
        path: '*',
        component: () =>
            import ('pages/Error404.vue')
    })
}

export default routes