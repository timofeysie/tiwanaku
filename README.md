# Tiwanaku

Examples of managing application state using Angular with Redux.

UI state management [from an artilce](https://www.pluralsight.com/guides/ui-state-management-with-redux-in-angular-4) by [Hristo Georgiev](https://github.com/hggeorgiev).

A [working example](https://github.com/SantiagoGdaR/angular-ngrx) from the [tutorial](https://medium.com/frontend-fun/angular-ngrx-a-clean-and-clear-introduction-4ed61c89c1fc) by [Santiago García Da Rosa](https://medium.com/@santiagogarcadarosa).

Other options for Angular that need to be looked at in this project are:
```
NGXS (where reducer + effects = state)
Akita
Mobx
```

I've heard developers talk about other solutions for the same problem:
```
Behaviour Subject
Angular + Redux + Azure Table (@baskarmib)
Router state and services
Observables and Subjects on services
Services + CQS/CQRS
```

The NgRx community is a lot larger, and sanctioned by the Angular team, so it makes sense to become familiar with that before branching out to other options.  The big problem is a lot of boilerplate code and a steep learning curve for new team members.  I would say that a simpler version of Redux is emerging but not yet a clear front runner.  Still I've enjoyed learning the NgRx implementations used in this project.




## Table of contents


1. [NgRx Working Example](#ngRx-Working-Example)
1. [Redux UI State Management](#redux-UI-state-management)
2. [JQuery and Bootstrap](#JQuery-and-Bootstrap)
3. [Object is possibly 'null'.ts(2531)](#object-is-possibly-'null'.ts(2531))
4. [Getting started](#getting-started)
5. [Redux Layout Tutorial App readme](#redux-Layout-Tutorial-App-readme)



## Switching to entities

The first job was to switch over the user/users functions to entity/entities.  Probably we could have added entities instead of replacing users, but it would be a little easier to just convert the existing.

The entity list from Loranthifolia is a combination of WikiData and WikiMedia lists.  The first is a query from the Conchifolia server.  The second one returns the html sections from the Wikipedia page that has three categories of entities.  This list is then parsed and the resulting data is merged with the WikiData list.  This is why there are two slightly overlapping paramteter lists for the entity model.


### WikiData
```
cognitive_bias: "http://www.wikidata.org/entity/Q29598"
cognitive_biasDescription: "cognitive bias; an preference for the current state of affairs."
cognitive_biasLabel: "status quo bias"
lang: "en"
```

### WikiMedia
```
wikiMedia_label
wikiMedia_description
wikiMedia_category
sortName
detailState
descriptionState
itemState
backupTitle
```

The app now compiles, but the data is not available.   Doing some old school logging on the effect shows the start of the issue.
```
entity.effects.ts:25 action GetEntities {type: "[Entity] Get Entity"}
entity.effects.ts:31 id undefined entities null
```

Console.log may have it's moments, but this is not one of them.  The articles about NgRx always mention debugging tools.  It's time to get some details on those and put them to use.

It says *pure functions and returning new instances of the state has also a great impact on debugging.*  It also says *store-devtools. Some powerful tolling for debugging.*  That's installed already and in the app module. The package says ```"@ngrx/store-devtools": "^6.1.0",```.

[This repo](https://github.com/ngrx/store-devtools) has a last release of v3.2.4.  It links to [another repo](https://github.com/ngrx/platfor) that says it's version 4x.  But the latest release there is v7.2.0.

The only docs on the first repo have configuration info: *Instrumentation with the Chrome / Firefox Extension (Preferred)*.  The second repo has a link to the official [docs site](https://ngrx.io/).  Non of them so far talk much about debugging tools.

Here is the code we need to debug:
```
@Effect()
getEntity$ = this._actions$.pipe(
    ofType<GetEntity>(EEntityActions.GetEntity),
    map(action => action.payload),
    withLatestFrom(this._store.pipe(select(selectEntityList))),
    switchMap(([id, entities]) => {
        console.log('id',id,'entities',entities)
        const selectedEntity = entities.filter(entity => entity.id === +id)[0];
        return of(new GetEntitySuccess(selectedEntity));
    })
);
```

There is an introduction to Effects on the docs site says: *Actions are filtered using a pipeable ofType operator. The ofType operator takes one more action types as arguments to filter on which actions to act upon.*


This is what the article says about this section:
* *We declare our effects using the Effect decorator provided by ngrx/effects.*
* *Using the Actions provided by ngrx/effects we are going to start piping our operator's for this effect.*
* *The next thing is to set the effect action type using the ofType operator.*
* *The following parts are rxjs operators that we use in order to get what we need (we already have the link to rxjs documentation in this article).*
* *Finally, in the last operator, the Effect is going to dispatch another action*
* *In the constructor, we inject the services we are going to use, the actions for ngrx/effects, and in this case also the store (have into consideration that this is a demo and we are getting the selected user from the list of user in our store)*

*This is pretty much the same structure that you are going to see on any effect. In this case, we are only dispatching a success action but we could be dispatching errors or any other kind of state that we want to handle in our application reducers.*

So this is also where we are going to be doing error handling.  It's an important part of the code for sure.  We can compare our code with the example effect from the official docs:
```
@Effect() loadMovies$ = this.actions$
    .pipe(
        ofType('[Movies Page] Load Movies'),
        mergeMap(() => this.moviesService.getAll()
            .pipe(
                map(movies => ({ type: '[Movies API] Movies Loaded Success', payload: movies })),
            catchError(() => EMPTY)
        ))
    )
);
```

Compare our ofType with the docs:
```
ofType<GetEntity>(EEntityActions.GetEntity)
```

vs
```
ofType('[Movies Page] Load Movies'),
```

Like two different languages.  But if you look at ```EEntityActions.GetEntity```, it is a string representing the action we want: ```[Entity] Get Entity```.




## NgRx Working Example


Currently working on the Santiago García Da Rosa [example](https://github.com/SantiagoGdaR/angular-ngrx).


### Containers components and presentation components

Santiago mentions an [article](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) by [Dan Abramov](https://medium.com/@dan_abramov) about the container and presentation components pattern used in this example. There is a disclaimer at the top of this article now that says he doesn't recommend it anymore.  Anyhow, it's already implemented here and can help separate complex stateful logic from other aspects of the component, which is what this project is all about.

There are other names for this patter, for example:
```
Container and Presentational
Fat and Skinny
Smart and Dumb
Stateful and Pure
Screens and Components
```

Hooks let you do the same thing without an arbitrary division, but that's for React.  Since this is an Angular project, we have to make our own.


Some  notes on presentational components:
```
May contain presentational and container components, DOM markup and styles.
Have no dependencies on the rest of the app, such as Flux actions or stores.
Don’t specify how the data is loaded or mutated.
Rarely have their own state (when they do, it’s UI state rather than data).
Are written as functional components unless they need state, lifecycle hooks, or performance optimizations.
```
Examples: Page, Sidebar, Story, UserInfo, List.

Container components:
```
Concerned with how things work.
May have presentational and containers, but don’t have any DOM markup except for wrapping divs, and never have any styles.
Provide the data and behavior to presentational or other container components.
Call Flux actions and provide these as callbacks to the presentational components.
Are often stateful, as they tend to serve as data sources.
Are usually generated using higher order components such as connect() from React Redux, createContainer() from Relay, or Container.create() from Flux Utils, rather than written by hand.
```

Examples: UserPage, FollowersSidebar, StoryContainer, FollowedUserList.



### switchMap/of vs map/Array

Ben Elliott in the comments wondered if there is a specific reason why Santiago uses switchMap and of at the end of the operator chains in Effects because this wraps the value in an Observable and then immediately unwraps it.

For example:
```
switchMap((config: IConfig) => {
```

Santiago replied that you can use map and Array.find as it might be better. The first he felt more comfortable and the second, using Array.filter, was not the best approach. 



## Redux UI State Management

In the georgiev-branch branch of this project is an example of managing application UI layout using Angular with Redux [from an artilce](https://www.pluralsight.com/guides/ui-state-management-with-redux-in-angular-4) by [Hristo Georgiev](https://github.com/hggeorgiev).

It was a failed attempt to update the code but shows promise anyhow for managing the UI state of an Angular app using the Redux pattern implemented with NgRx.

### Upgrading the source

Although the date on the Pluralsight course is Dec 15, 2018, the project from the completed source has not been modified for two years.  What worked for Angular 4 with ngrx then doesn't work now due to breaking changes.

Here are some of the errors when trying to run the sample.

### RxJS

The [migration docs for Ionic 3 to 4](https://ionicframework.com/docs/building/migration#rxjs-changes) link to a [separate page](https://github.com/ReactiveX/rxjs/blob/master/MIGRATION.md) for RxJS which was updated to version 6.  This page then redirects to [another page](https://github.com/ReactiveX/rxjs/blob/master/docs_app/content/guide/v6/migration.md).  The most current release is 6.4.

This is the version we got when installing RxJS in the newly created project.  The relevant parts of the package.json file currently are:
```
    "@ngrx/core": "^1.2.0",
    "@ngrx/effects": "^7.2.0",
    "@ngrx/store": "^7.2.0",
    "ngrx-store-logger": "^0.2.2",
    "rxjs": "^6.4.0",
```

When running ```ng serve``` we are getting this error:
```
$ ng serve
/Users/tim/angular/redux-layout-tutorial-app/node_modules/@angular/cli/lib/cli/index.js:14
async function default_1(options) {
      ^^^^^^^^
SyntaxError: Unexpected token function
    at Object.exports.runInThisContext (vm.js:76:16)
```

Just running ```ng --version``` shows the same error.

The Angular CLI requires Node 8.  But just to be sure, used ```nvm use 10``` (that's using the Node Version Manager for those who don't know).  Not sure what I was using before.  It must be a new terminal which reverts to an old version of Node when it's first opened.  Not sure how to set a default init state version using nvm.

Now we can get back to our ```ng serve``` error:
```
ERROR in node_modules/@ngrx/core/src/operator/enterZone.d.ts(1,10): error TS2305: Module '"../../../../rxjs/Operator"' has no exported member 'Operator'.
```

The first two steps on the upgrade guide go:
1. Update to the latest version of RxJS 5.5 and ensure that you've fixed any issues caused by bug fixes.
2. Install RxJS v6 along with the backward-compatibility package, rxjs-compat.

Looking further down in the error stack, we see:
```
node_modules/rxjs/Observable.d.ts(1,15): error TS2307: Cannot find module 'rxjs-compat/Observable'.
```

So trying this first:
```
npm i rxjs-compat --save
```

After this, the errors change a bit on ```ng serve```:
```
ERROR in ./node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/jit-polyfills.js
Module not found: Error: Can't resolve 'core-js/es7/reflect' in '/Users/tim/angular/redux-layout-tutorial-app/node_modules/@angular-devkit/build-angular/src/angular-cli-files/models'
ERROR in node_modules/@angular/common/src/location/location.d.ts(8,34): error TS2307: Cannot find module 'rxjs'.
node_modules/@angular/common/src/pipes/async_pipe.d.ts(9,28): error TS2307: Cannot find module 'rxjs'.
node_modules/@angular/core/src/application_ref.d.ts(8,28): error TS2307: Cannot find module 'rxjs'.
node_modules/@angular/core/src/event_emitter.d.ts(8,39): error TS2307: Cannot find module 'rxjs'.
node_modules/@angular/core/src/linker/query_list.d.ts(8,28): error TS2307: Cannot find module 'rxjs'.
node_modules/@angular/core/src/util/lang.d.ts(8,28): error TS2307: Cannot find module 'rxjs'.
node_modules/@angular/forms/src/directives/abstract_control_directive.d.ts(8,28): error TS2307: Cannot find module 'rxjs'.
node_modules/@angular/forms/src/directives/validators.d.ts(9,28): error TS2307: Cannot find module 'rxjs'.
node_modules/@angular/forms/src/model.d.ts(8,28): error TS2307: Cannot find module 'rxjs'.
node_modules/@angular/forms/src/validators.d.ts(9,28): error TS2307: Cannot find module 'rxjs'.
node_modules/@ng-bootstrap/ng-bootstrap/datepicker/datepicker-service.d.ts(5,28): error TS2307: Cannot find module 'rxjs'.
node_modules/@ng-bootstrap/ng-bootstrap/typeahead/typeahead.d.ts(3,28): error TS2307: Cannot find module 'rxjs'.
node_modules/@ngrx/core/src/operator/enterZone.d.ts(1,26): error TS2307: Cannot find module 'rxjs/Operator'.
node_modules/@ngrx/core/src/operator/enterZone.d.ts(2,28): error TS2307: Cannot find module 'rxjs/Subscriber'.
node_modules/@ngrx/core/src/operator/enterZone.d.ts(3,28): error TS2307: Cannot find module 'rxjs/Observable'.
node_modules/@ngrx/core/src/operator/leaveZone.d.ts(1,26): error TS2307: Cannot find module 'rxjs/Operator'.
node_modules/@ngrx/core/src/operator/leaveZone.d.ts(2,28): error TS2307: Cannot find module 'rxjs/Subscriber'.
node_modules/@ngrx/core/src/operator/leaveZone.d.ts(3,28): error TS2307: Cannot find module 'rxjs/Observable'.
node_modules/@ngrx/core/src/operator/select.d.ts(1,28): error TS2307: Cannot find module 'rxjs/Observable'.
node_modules/@ngrx/store/src/actions_subject.d.ts(2,33): error TS2307: Cannot find module 'rxjs'.
node_modules/@ngrx/store/src/reducer_manager.d.ts(2,45): error TS2307: Cannot find module 'rxjs'.
node_modules/@ngrx/store/src/scanned_actions_subject.d.ts(2,25): error TS2307: Cannot find module 'rxjs'.
node_modules/@ngrx/store/src/state.d.ts(2,45): error TS2307: Cannot find module 'rxjs'.
node_modules/@ngrx/store/src/store.d.ts(2,48): error TS2307: Cannot find module 'rxjs'.
src/app/app.component.ts(3,28): error TS2307: Cannot find module 'rxjs'.
src/app/app.component.ts(8,1): error TS2354: This syntax requires an imported helper but module 'tslib' cannot be found.
src/app/common/layout/layout.reducer.ts(18,17): error TS2531: Object is possibly 'null'.
```

5.5.12 is the last version shown in the middle of all the 6 version releases.  Ive we need to go back, that might be the version number to use.  So running this ```npm i rxjs@5.5.12```.

After that, the error is much shorter:
```
ERROR in ./node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/jit-polyfills.js
Module not found: Error: Can't resolve 'core-js/es7/reflect' in '/Users/tim/angular/redux-layout-tutorial-app/node_modules/@angular-devkit/build-angular/src/angular-cli-files/models'
ERROR in node_modules/@angular/common/src/location/location.d.ts(8,10): error TS2305: Module '"../../../../rxjs/Rx"' has no exported member 'SubscriptionLike'.
src/app/app.component.ts(8,1): error TS2354: This syntax requires an imported helper but module 'tslib' cannot be found.
src/app/common/layout/layout.reducer.ts(18,17): error TS2531: Object is possibly 'null'.
ℹ ｢wdm｣: Failed to compile.
```

Going with the easy solution again, which is just npm i whatever is shown in the output, starting with tslib.
The output might give us pause:
```
$ npm i tslib --save
npm WARN @angular/common@7.2.5 requires a peer of rxjs@^6.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN @angular/core@7.2.5 requires a peer of rxjs@^6.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN @angular/forms@7.2.5 requires a peer of rxjs@^6.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN @angular/router@7.2.5 requires a peer of rxjs@^6.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN @ng-bootstrap/ng-bootstrap@4.0.3 requires a peer of rxjs@^6.3.0 but none is installed. You must install peer dependencies yourself.
npm WARN @ngrx/effects@7.2.0 requires a peer of rxjs@^6.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN @ngrx/store@7.2.0 requires a peer of rxjs@^6.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN bootstrap@4.3.1 requires a peer of popper.js@^1.14.7 but none is installed. You must install peer dependencies yourself.
npm WARN ngrx-store-logger@0.2.2 requires a peer of @ngrx/store@^4.0.0 || ^5.0.0 || ^6.0.0 but none is installed. You must install peer dependencies yourself.
```

So maybe following the migration instructions was not such a great idea.  Anyhow, trying the serve once again.  And out error list is shrinking.
```
ERROR in ./node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/jit-polyfills.js
Module not found: Error: Can't resolve 'core-js/es7/reflect' in '/Users/tim/angular/redux-layout-tutorial-app/node_modules/@angular-devkit/build-angular/src/angular-cli-files/models'
ERROR in node_modules/@angular/common/src/location/location.d.ts(8,10): error TS2305: Module '"../../../../rxjs/Rx"' has no exported member 'SubscriptionLike'.
src/app/common/layout/layout.reducer.ts(18,17): error TS2531: Object is possibly 'null'.
```


Found [this SO answer](https://github.com/zloirock/core-js/issues/412) which shows a workaround for the core-js error:
```
"paths": {
    "core-js/es7/reflect": [
        "node_modules/core-js/proposals/reflect-metadata"
    ]
}
```

The possibly null error section was commented out and after serve again, the errors are a little different:
```
ERROR in ./node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/jit-polyfills.js
Module not found: Error: Can't resolve 'core-js/es7/reflect' in '/Users/tim/angular/redux-layout-tutorial-app/node_modules/@angular-devkit/build-angular/src/angular-cli-files/models'
ERROR in node_modules/@angular/common/src/location/location.d.ts(8,10): error TS2305: Module '"../../../../rxjs/Rx"' has no exported member 'SubscriptionLike'.
src/app/common/layout/layout.reducer.ts(17,8): error TS2355: A function whose declared type is neither 'void' nor 'any' must return a value.
```



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



### JQuery and Bootstrap

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




### Object is possibly 'null'.ts(2531)

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


### Getting started

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

### Redux Layout Tutorial App readme

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
