import $ from 'jquery';
import {requestAnimationFrame} from '../util/index';

export default function (UIkit) {

    const DATA = UIkit.data;

    UIkit.prototype.$mount = function (el) {

        var name = this.$options.name;

        if (!el[DATA]) {
            el[DATA] = {};
            UIkit.elements.push(el);
        }

        if (el[DATA][name]) {
            console.warn(`Component "${name}" is already mounted on element: ${el}`);
        }

        el[DATA][name] = this;

        this.$el = $(el);

        this._initProps();

        this._callHook('init');

        requestAnimationFrame(() => {
            this._isReady = true;
            this._callHook('ready');
            this._callUpdate();
        });
    };

    UIkit.prototype.$update = function (e, element) {

        element = element ? $(element)[0] : false;

        UIkit.elements.forEach((el) => {
            if (el[DATA] && $.contains(element || this.$el[0], el)) {
                for (var name in el[DATA]) {
                    el[DATA][name]._callUpdate(e);
                }
            }
        });
    };

    UIkit.prototype.$updateParents = function (e) {
        $(UIkit.elements).each((i, el) => {
            if (el[DATA] && $.contains(el, this.$el[0])) {
                for (var name in el[DATA]) {
                    el[DATA][name]._callUpdate(e);
                }
            }
        });
    };

    UIkit.prototype.$replace = function (el) {

        var $el = $(el), prev = this.$options.el, name = this.$options.name;

        el = $el[0];

        delete prev[DATA][name];

        if (!el[DATA]) {
            el[DATA] = {};
        }

        el[DATA][name] = this;

        UIkit.elements.splice(UIkit.elements.indexOf(prev), 1, el);
        this.$el.replaceWith($el);
        this.$options.el = el;
        this.$el = $el;

        this.__preventDestroy = true;
    };

    UIkit.prototype.$destroy = function () {

        if (this.__preventDestroy) {
            this.__preventDestroy = false;
            return;
        }

        this._callHook('destroy');

        delete UIkit.instances[this._uid];

        var el = this.$options.el;

        if (!el || !el[DATA]) {
            return;
        }

        delete el[DATA][this.$options.name];

        if (!Object.keys(el[DATA]).length) {
            delete el[DATA];
            delete UIkit.elements[UIkit.elements.indexOf(el)];
        }

        this.$el.remove();
    };

}