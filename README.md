## Description

There is an issue with vue test utils beta 30 and up: when there are nested components and we use `Vue.extend` to defined components.
The [failing](./tests/unit/router.spec.js) test passes successfully in beta 29, but fails in beta 30:

```
$ npm install @vue/test-utils@1.0.0-beta.29
+ @vue/test-utils@1.0.0-beta.29
```

```
$ npm run test:unit
...
  router.push
beforeMount App
[!] beforeMount Parent
beforeMount Nested
beforeRouteUpdate Parent
beforeRouteUpdate Nested
    ✓ calls beforeMount only once

  2 passing (48ms)

 MOCHA  Tests completed successfully
```

Now, install and run with beta 30:

```
$ npm install @vue/test-utils@1.0.0-beta.30
+ @vue/test-utils@1.0.0-beta.30
```

```
$ npm run test:unit

...
 MOCHA  Testing...

  router.push
beforeMount App
[!] beforeMount Parent
beforeMount Nested
beforeRouteUpdate Parent
beforeRouteUpdate Nested
[!] beforeMount Parent
beforeMount Nested
    1) calls beforeMount only once

  1 failing

  1) router.push
       calls beforeMount only once:

      AssertionError: expected 2 to equal 1
      + expected - actual

      -2
      +1

      at Context.it (dist/js/webpack:/tests/unit/router.spec.js:83:1)
      at process._tickCallback (internal/process/next_tick.js:68:7)
```

The issue was introduced by this [commit](https://github.com/vuejs/vue-test-utils/commit/0c07653ddff92fbbc8852256ee99e1c41476e6ab), changes with `_Ctor = {}` assignments.
If these assignments are commented out, the tests starts working.

It also works if we don't use `Vue.extend` to define the component:

```
  ...
  {
    path: "/user/:id",
    // It works, if we don't use Vue.extend.
    component: {
    // component: Vue.extend({
      // Component with children, nested router-view.
      render: function (h) {
        return h("router-view");
      },
   ...
```

And `Vue.extend` is needed for typescript-based setup, to have the typing working for components (also, I am actually using vue class-based [components](https://vuejs.org/v2/guide/typescript.html#Class-Style-Vue-Components) which is the best setup I found to make use of typescript checks for Vue components).

One more note: I was *not* able to reproduce the issue with vue test utils codebase - the same test passes with beta 30.
There is a [modified version](./vue-test-utils-test-example.spec.js) that runs the same test twice that fails, but I am not sure if this is exactly same issue as described above, but maybe it will be useful too.

## Project setup

Project is generated with vue cli (default settings + unit-mocha, vue router and vue test utils):

```
npm install -g @vue/cli
vue create router-test
vue add unit-mocha
npm install --save @vue/test-utils@1.0.0-beta.30
```
