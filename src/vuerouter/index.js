/**
 * @name 注册router中install静态方法
 *  1.判断插件是否已经被安装，如果已经安装，不需要重复安装
 *  2.把 Vue 的构造函数记录到全局变量中，在vue-router vue-link 要用
 *  3.把创建 Vue 实例时传入的 router 对象，注入到所有的 Vue 实例上
 */

 let _Vue = null

export default class VueRouter {
    static install (Vue) {
        //  1. 判断当前插件是否已经安装
        if (VueRouter.install.installed) {
            return
        }
        VueRouter.install.installed = true
        //  2. 把 Vue 构造函数记录到全局变量
        _Vue = Vue
        //  3. 把创建 Vue 实例时传入的 router 对象注入到 Vue 实例上
        // 使用混入
        _Vue.mixin({
            beforeCreate() { // 以后所有Vue 实例中都会有， 也包括所有的组件也会执行 beforeCreate 这个钩子函数
                // 因为这样，注入这个方法会执行很多次，所以我们要判断下，如果是组件就不执行注入，因为只有 Vue 实例中$options 有router这个属性，在组件中 $options 没有router 这个属性
                if (this.$options.router) {
                    _Vue.prototype.$router = this.$options.router
                    this.$options.router.init()
                }
            }
        })

    }

    constructor (options) {
        this.options = options // 作用： 用于记录构造函数中传入的options
        // routeMap是一个对象 作用，把传入的options中的routes（路由规则）解析出来，存储到routeMap中，键为路由地址，值为路由组件
        this.routeMap = {}
        // data 是一个响应式的对象，用来存储路由地址，当路由发生变化时，用来加载组件，所以要设置成响应式对象
        this.data = _Vue.observable({
            current: '/'
        })
    }

    init () {
        this.createRouteMap()
        this.initComponents(_Vue)
    }

    createRouteMap () {
        // 作用：遍历所有的路由规则，把路由规则解析成键值对的形式，存储到routeMap中
        this.options.routes.forEach(route => {
            this.routeMap[route.path] = route.component
        })
    }

    initComponents (Vue) {
        Vue.component('router-link', {
            props: {
                to: String
            },
            template: '<a :href="to"><slot></slot></a>'
        })
    }
}