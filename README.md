# Redux Layout

An example of managing application UI layout using Angular with Redux [from an artilce](https://www.pluralsight.com/guides/ui-state-management-with-redux-in-angular-4) by [Hristo Georgiev](https://github.com/hggeorgiev).


## Table of contents

1. [Upgrading the source](#upgrading-the-source)
2. [JQuery and Bootstrap](#JQuery-and-Bootstrap)
3. [Object is possibly 'null'.ts(2531)](#object-is-possibly-'null'.ts(2531))
4. [Getting started](#getting-started)
5. [Redux Layout Tutorial App readme](#redux-Layout-Tutorial-App-readme)

## Upgrading the source

Although the date on the Pluralsight course is Dec 15, 2018, the project from the completed source has not been modified for two years.  What worked for Angular 4 with ngrx then doesn't work now due to breaking changes.

Here are some of the errors when trying to run the sample.

### Found version 4, expected 3

A direct clone of the completed code shows this error when running ```ionic serve```:
```
ERROR in Metadata version mismatch for module 
/Users/tim/angular/redux/ngx-redux-ui-management-recipes/node_modules/@ng-bootstrap/ng-bootstrap/index.d.ts, 
found version 4, expected 3, 
resolving symbol AppModule in 
/Users/tim/angular/redux/ngx-redux-ui-management-recipes/src/app/app.module.ts, 
...
```

Also tried out [the DZ Article steps](https://dzone.com/articles/upgrade-to-angular-7-in-5-simple-steps-1) by [Hristo Georgiev](https://github.com/hggeorgiev) for upgrading old Angular projects.

```
sudo npm install -g @angular/cli@latest
+ @angular/cli@7.3.1

```

After the five easy steps, we are still left with these error:
```
ERROR in node_modules/@ngrx/effects/src/bootstrap-listener.d.ts(1,20): error TS2305: Module '"../../../@angular/core/core"' has no exported member 'OpaqueToken'.
node_modules/@ngrx/effects/src/effects-subscription.d.ts(1,10): error TS2305: Module '"../../../@angular/core/core"' has no exported member 'OpaqueToken'.
node_modules/@ngrx/effects/src/effects.module.d.ts(1,16): error TS2305: Module '"../../../@angular/core/core"' has no exported member 'OpaqueToken'.
node_modules/@ngrx/store/src/ng2.d.ts(1,10): error TS2305: Module '"../../../@angular/core/core"' has no exported member 'OpaqueToken'.
src/app/common/games/games.effects.ts(29,29): error TS2339: Property 'of' does not exist on type 'typeof Observable'.
src/app/common/index.ts(18,9): error TS2305: Module '"../../../node_modules/@angular/core/core"' has no exported member 'state’.
```



## JQuery and Bootstrap

Had this issue the last time I installed Bootstrap as well.
```
$ ng serve
...
 ｢wdm｣: Error: ENOENT: no such file or directory, open '/Users/tim/angular/node_modules/jquery/dist/jquery.js'
 ...
 $ yarn add jquery
yarn add v1.13.0
...
warning " > @ngrx/core@1.2.0" has incorrect peer dependency "rxjs@^5.0.0-beta.12".
warning " > bootstrap@4.3.1" has unmet peer dependency "popper.js@^1.14.7".
warning " > ngrx-store-logger@0.2.2" has incorrect peer dependency "@ngrx/store@^4.0.0 || ^5.0.0 || ^6.0.0".
[4/4] 🔨  Building fresh packages...
success Saved lockfile.
success Saved 1 new dependency.
info Direct dependencies
└─ jquery@3.3.1
info All dependencies
└─ jquery@3.3.1
✨  Done in 109.88s.
```

In the script and styles arrays inside angluar.json, removed the step upp path ```../```.
Then the error is looking for something else:
```
Error: ENOENT: no such file or directory, open '/Users/tim/angular/redux-layout-tutorial-app/node_modules/tether/dist/js/tether.js'
```

In this case, tether is not there.  What is tether?  Who cares what dependencies need to be installed when it's just a tut.  I don't usually use Yarn when npm does the same thing.  I didn't think there was much difference in the actual project, but maybe I'm missing a step here?
In node I would just install whatever it was complaining about like this:
```
yarn add tether
ng serve
```

But then we have even more problems:
```

ERROR in node_modules/@ngrx/core/src/operator/enterZone.d.ts(1,10): error TS2305: Module '"../../../../rxjs/Operator"' has no exported member 'Operator'.
node_modules/@ngrx/core/src/operator/enterZone.d.ts(2,10): error TS2305: Module '"../../../../rxjs/Subscriber"' has no exported member 'Subscriber'.
node_modules/@ngrx/core/src/operator/enterZone.d.ts(3,10): error TS2305: Module '"../../../../rxjs/Observable"' has no exported member 'Observable'.
node_modules/@ngrx/core/src/operator/leaveZone.d.ts(1,10): error TS2305: Module '"../../../../rxjs/Operator"' has no exported member 'Operator'.
node_modules/@ngrx/core/src/operator/leaveZone.d.ts(2,10): error TS2305: Module '"../../../../rxjs/Subscriber"' has no exported member 'Subscriber'.
node_modules/@ngrx/core/src/operator/leaveZone.d.ts(3,10): error TS2305: Module '"../../../../rxjs/Observable"' has no exported member 'Observable'.
node_modules/@ngrx/core/src/operator/select.d.ts(1,10): error TS2305: Module '"../../../../rxjs/Observable"' has no exported member 'Observable'.
node_modules/rxjs/Observable.d.ts(1,15): error TS2307: Cannot find module 'rxjs-compat/Observable'.
node_modules/rxjs/Operator.d.ts(1,15): error TS2307: Cannot find module 'rxjs-compat/Operator'.
node_modules/rxjs/Subscriber.d.ts(1,15): error TS2307: Cannot find module 'rxjs-compat/Subscriber'.
src/app/common/layout/layout.reducer.ts(18,17): error TS2531: Object is possibly 'null'.
ℹ ｢wdm｣: Failed to compile.
```


Despite the tut having the date , the repo shows the last commit as two years ago.
Trying out the code from the complete tut now because it's unwise to follow along with a broken project as we might not know if anything was missed since it doesn't work.  Debugging it has proved a little difficult so far.  This also has issues, as shown above.




## Object is possibly 'null'.ts(2531)

The layout reducer has this code:
```
export function reducer (
    state = initialState,
    action: layout.LayoutActions
    ): State {
        switch (action.type) {
            default:
                return state;
    }
}
```

The ```action.type``` line has this TS error:
```
Object is possibly 'null'.ts(2531)
(parameter) action: null
```

This is called "strict null checks".  You can read about it [here](https://stackoverflow.com/questions/40349987/how-to-suppress-typescript-error-ts2533-object-is-possibly-null-or-undefine).

To turn it off turn the --strictNullChecks compiler flag off.

However, the existence of null has been described as The Billion Dollar Mistake and is strongly recommend keeping it on.

One way to fix this is to ensure that the values are never null or undefined.


## Getting started

[This article](https://www.pluralsight.com/guides/building-a-redux-application-with-angular-2-part-1) was one option for getting started.  We can compare this version later.

For the first example, we [followed this artilce](https://www.pluralsight.com/guides/ui-state-management-with-redux-in-angular-4) by [Hristo Georgiev](https://github.com/hggeorgiev) for upgrading old Angular projects. as it seemed more interesting.  Also the first example although more recent, part 2 is not available yet.

The UI State tut includes setting up Bootstrap as well as Redux core dependencies:
```
yarn add @ngrx/core
yarn add @ngrx/store
```

For asynchronous events such as pagination and loading bars, in the layout of the application, there needs to be a middleware:

```
yarn add @ngrx/effects
```

To make selection of the state fast an efficient, add reselect. We are going to use reselect's createSelector function to create efficient selectors that are memoized and only recompute when arguments change.
```
yarn add reselect
```

To make development more convenient and easier to debug, add a store logger, which will log to the console every action and the new state of the state.
```
yarn add ngrx-store-logger
```

## Redux Layout Tutorial App readme

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.2.2.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
