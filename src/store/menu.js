const state = {
    allMenus: [{
            icon: 'mdi-chart-scatter-plot',
            label: '散点图',
            to: 'scatter'
        },
        {
            icon: 'mdi-chart-bell-curve',
            label: '折线图',
            to: 'line'
        },
        {
            icon: 'mdi-chart-bar',
            label: '柱状图',
            to: 'bar',
            active: true
        },
        {
            icon: 'mdi-radar',
            label: '雷达图',
            to: 'radar'
        },
        {
            icon: 'mdi-pie',
            label: '饼状图',
            to: 'pie'
        },
        {
            icon: 'mdi-grid',
            label: '热力图',
            to: 'heat'
        },
        {
            icon: 'mdi-chart-bar',
            label: '柱状图（对比图）',
            to: 'bar2',
        },
    ]
}

const getters = {
    myMenus: state => () => {
        return state.allMenus
    },
    activeMenu: state => () => {
        for (let i = 0; i < state.allMenus.length; i++) {
            let e = state.allMenus[i]
            if (e.active === true) {
                return e.to
            }
        }
    }
}

const actions = {}

const mutations = {}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}