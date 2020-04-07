import Vue from "vue";
import VueRouter from "vue-router";
import { createLocalVue, mount } from "@vue/test-utils";

const chai = require("chai");
const expect = chai.expect;

describe("router.push", () => {
  it("calls beforeMount only once", async () => {
    let countBeforeMountCalled = 0;

    const localVue = createLocalVue();
    localVue.use(VueRouter);

    const routes = [
      {
        path: "/",
        component: {
          render: h => h("div", "home")
        }
      },
      {
        path: "/user/:id",
        // component: User,
        component: Vue.extend({
          // component: {
          // Component with children, nested router-view.
          render: function (h) {
            return h("router-view");
          },
          beforeMount: function () {
            countBeforeMountCalled += 1;
            console.log("[!] beforeMount Parent");
          },
          beforeRouteUpdate: function (to, from, next) {
            console.log("beforeRouteUpdate Parent");
            next();
          }
        }),
        children: [
          {
            path: ":post_url_slug",
            component: Vue.extend({
              render: function (h) {
                return h("div", "Post Page");
              },
              beforeMount: function () {
                console.log("beforeMount Nested");
              },
              beforeRouteUpdate: function (to, from, next) {
                console.log("beforeRouteUpdate Nested");
                next();
              }
            })
          }
        ]
      }
    ];
    const router = new VueRouter({
      routes
    });
    const wrapper = mount(
      {
        template: `<div><router-view></router-view></div>`,
        beforeMount: function () {
          console.log("beforeMount App");
        }
      },
      { localVue, router }
    );
    expect(wrapper.vm.$route).to.be.an("object");

    expect(wrapper.text()).to.contain("home");

    router.push({ path: "/user/1/post1" });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).to.contain("Post Page");

    router.push({ path: "/user/1/post2" });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).to.contain("Post Page");

    expect(countBeforeMountCalled).to.equal(1);
  });
});
