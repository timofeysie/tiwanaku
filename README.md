# Tiwanaku

This is an app to get a list of entities from WikiData and provide a detail view of the items from a WikiMedia page.  It currently uses the [Conchifolia](https://github.com/timofeysie/conchifolia) NodeJS server app as a proxy for these calls.

It provides an example of managing application state using Angular with Redux based on [NgRx](https://ngrx.io/) which *provides reactive state management for Angular apps inspired by Redux.*


## Table of contents

1. [Using store values](#using-store-values)
1. [Options for state management in Angular](#options-for-state-management-in-Angular)
1. [The data source](#the-data-source)
1. [Fixing the tests](#fixing-the-tests)
1. [Global error handling](#global-error-handling)
1. [NgRx Working Example](#ngRx-Working-Example)
1. [Redux UI State Management](#redux-UI-state-management)
2. [JQuery and Bootstrap](#JQuery-and-Bootstrap)
3. [Object is possibly 'null'.ts(2531)](#object-is-possibly-'null'.ts(2531))
4. [Getting started](#getting-started)
5. [Redux Layout Tutorial App readme](#redux-Layout-Tutorial-App-readme)



## Using store values

Now that we have the store all set up to get our entities from the server, we have a few places where we want to use data other than the entities list.

* Entity count in the title
* Language config setting used in the API call

The first is in the top level template, the second is in a service.

### The entity count in the title could be considered a memoization.  *In computing, memoization or memoisation is an optimization technique used primarily to speed up computer programs by storing the results of expensive function calls and returning the cached result when the same inputs occur again.*

We may want to use a reducer or selector to get a slice of the entities store state to display next to the title.  I'm not sure this is the correct place for it (when we have a need for an entities selector, it might be more logical to have it there), the entity.selector.ts file can have this:
```
export const selectEntityCount = createSelector(
  selectCount,
  (state: EntityState) => state.count
);
```

This  might however be a naive way of doing things.  A best practice for NgRx says:
*don't store state that can be derived*

Since the count of the entities can be derived, maybe we should just get the entities in the app component and get the length there.  Is there a memory problem with holding the entities in multiple components is the question then that needs to be answered.

So without adding anything to the store, we do this in the top level component to add the number of entities to the title of the app:
```
<span *ngIf="(entities$ | async)">{{ (entities$ | async).length}}</span>
```

The *ngIf* is there to stop errors from showing up before the list arrives from the server.  A shorter more concise version is to use what is sometimes called the Elvis operator *<>*, which in this case is a question mark:
```
{{ (entities$ | async)?.length }}
```

Much better.

Assuming the store is the source of truth and simply getting them there from the store to get the length is not costing us any memory, why not use the entities here to get the count?  That will satisfy the best practice of not storing state that can be derived.


### Language config setting used in the API call

In the entity service, we are doing this:
```
return this._http.get<IEntityHttp>(this.backendListUrl + '/en');
```

The language setting is in the app config.  How do we access the language setting for the API call?  In the template as discussed before, we use the async pipe ```(entities$ | async)?.length```.

How do we do that in our service?  Trying to set the var in the service constructor is not going to work:
```
this.lang = this.config$.language;
```

Causes this error:
```
Property 'language' does not exist on type 'Observable<IConfig>'.
```

This one
```
this.lang$ = this._store.select(selectConfig.language);
```

Gives this error:
```
Property 'language' does not exist on type 'MemoizedSelector<IAppState, IConfig>'.
```

Trial and error here is not working out well.  It's not a straightforward framework to just try things that work.  Using Google to find out how to get a property from the store should be easy also, but the tutorials and examples all go through everything.  We'll get there.

From [this SO answer](https://stackoverflow.com/questions/35633684/how-to-get-current-value-of-state-object-with-ngrx-store), it should be as simple as this:
```
this.lang = this._store.language;
```

or this:
```
this.lang = this._store.config.language;
```

Both cause an error saying that property does not exist on  ```Store<IAppState>```.

So that's a clue at least.  We have three state objects, app, config, and entity.  The app.state is a combination of all of these plus error and router:
```
router?: RouterReducerState;
entities: IEntityState;
config: IConfigState;
error: string;
```

Another part of the answer from above shows this:
```
let x = this._store.value.StateReducer.dataForUpdate;
```

So what reducer should we be using?  Trying this:
```
this.lang = this._store.configReducers.language;
```

Results in this message:
```
Property 'configReducers' does not exist on type 'Store<IAppState>'.
```

Another example out there shows a form like this:
```
this.lang$ = this.store.select((state) => state.config.language);
```

Something like this was tried before, since we were trying to get an async value, it makes sense to access it in a callback like this.  But, no dice.  Do we need to create a new reducer to get this value?

I thought reducers were for mutating the state.  At least that's what our current config reducer does.

If we wanted to set the language, we would need a reducer, no?  We need a selector, no?  Apparently not.  [The answer for this SO question](https://stackoverflow.com/questions/41898827/extracting-specific-data-from-ngrx-store/41900898) puts it pretty clearly.  You need to put a value in the store which requires an action.

You would think that the GetConfig would return the json from the config file in the data directory.  And indeed we get the value in the template.  This is just about using one of it's values in the TypeScript.

```
Property 'language' does not exist on type 'MemoizedSelector<IAppState, IConfig>'.
```

Since the IAppState contains the config class, we should be asking for config.language here.

```
Property 'config' does not exist on type 'Observable<IConfig>'.
```

We just need the appropriate RxJs way of getting the property in a functional manner here.  Sorry it's not so obvious what it is.  This is part of the *steep learning curve* everyone talks about when using Redux.

The basic observable approach is to subscribe to it.  Finally read [an answer by sashoalm here](https://stackoverflow.com/questions/35633684/how-to-get-current-value-of-state-object-with-ngrx-store/43057702) that shows one way that works:
```
this.config$.subscribe(x => {
    console.log(x)
});
```

In the console we get our config object.  But trying to get properties from this fails saying that the object is not defined.
```
ERROR TypeError: Cannot read property 'language' of null
    at SafeSubscriber._next (entity.service.ts:21)
    ...
```

Funny enough, even if we check first for undefined, the error still shows up:
```
if (typeof config.language !== 'undefined') {
    console.log('lang',config.language);
}
```

That is because at first config is null, not undefined, as that is the initial state.  This will work to get our value:
```
this.config$.subscribe(config => {
    if (typeof config !== 'undefined' && config !== null) {
        if (typeof config.language !== 'undefined') {
            this.lang = config.language;
        }
    }
});
```

However, if the language setting is used in the API call, it shows up as undefined since that value is not available right away.  We could check for this an provide a default of en before the call is made, but that is defeating the purpose of having a single source of truth.

So the next challenge is to find our where that default can be set.  Right now, searching the code, there is no where that the initial value of the properties of the config object are set, because the config.json is actually the default set of initial values.

So then another approach would be to delay that API request until the store can provide that value.  What is the normal way to do this?

Looking at other answers to the SO question linked to above, a synchronous .subscirbe() is the accepted answer.  The answer changed for ngrx 1 to 2.  This project has
```
"@ngrx/core": "^1.2.0",
"@ngrx/effects": "^6.1.0",
"@ngrx/router-store": "^6.1.0",
"@ngrx/store": "^6.1.0",
```

So is that version 1 or 6?

Anyhow, the example shown to 2+:
```
store.take(1).subscribe(s => state = s);
```

Causes a compile error:
```
Property 'take' does not exist on type 'Store<any>'.
```

Same with withLatestFrom() or combineLatest() methods.  These are functions in the subscription chain are aligned with the spirit of Observables+Ngrx.  An article by Jim Lynch may be helpful: *The Basics of "ngrx/effects", @Effect, and Async Middleware for "ngrx/store" in Angular 2.*

Another answer shows using the State object like this:
```
let propertyValue = state.getValue().config;
```

However, in the constructor and the get list function, the config is still null.

Going with a different default config state approach, we can try this in state/config.state.ts:
```
export const initialConfigState: IConfigState = {
  config: {
    adminName: 'temp',
    permissions: ['temp'],
    language: 'en'
  }
};
```

And this will work.  Then we don't really need to have the assets/data/config.json file.  Probably this is not where we want to store the user options anyhow.  This demo didn't really address user management.  If we want to support multiple users, then more analysis of how we want to do that is needed.

A simple approach is to just have English set as the default here, and let the user change the value by hand until we can support user login and all that fun OAuth stuff.

Saw this in a Cognito React app article:
```
handleSubmit = async event => {
  event.preventDefault();

  try {
    await Auth.signIn(this.state.email, this.state.password);
    alert("Logged in");
  } catch (e) {
    alert(e.message);
  }
}
```

That's using async/await to get the value of the state.


Another tip on the [NgRx: tips & tricks]() by Adrian Fâciu was about naming the payloads.

The article says something like *when a payload is needed in the action, we can name the property simply payload or have a payload object that has other properties...*

An example is this:
```
constructor(readonly payload: { message: string }) { }
```

In the entity.actions.ts file for example we have this:
```Javascript
export class GetEntity implements Action {
  public readonly type = EEntityActions.GetEntity;
  constructor(public payload: string) {
    console.log('payload',payload);
  }
}
```

Trying out this:
```
constructor(public payload: { entityId: string}) {
```

Causes this error:
```
core.js:1673 ERROR TypeError: Cannot read property 'filter' of null
    at SwitchMapSubscriber.project (entity.effects.ts:26)
    at
```

So there would be more modifications in the boilerplate code to make that work.



## Options for state management in Angular

This app provides an example of managing application state using Redux in an Angular application based on [NgRx](https://ngrx.io/).

There is a UI state management implementation [from an artilce](https://www.pluralsight.com/guides/ui-state-management-with-redux-in-angular-4) by [Hristo Georgiev](https://github.com/hggeorgiev) on the georgiev-branch which currently has some upgrade issues.

The master branch has a [working example](https://github.com/SantiagoGdaR/angular-ngrx) from the [article](https://medium.com/frontend-fun/angular-ngrx-a-clean-and-clear-introduction-4ed61c89c1fc) by [Santiago García Da Rosa](https://medium.com/@santiagogarcadarosa).

Here is a good [boiler plate project](https://github.com/mdbootstrap/Angular-Bootstrap-Boilerplate) which provides an elaborate example of best practices for this kind of setup.

Other options available for state management in Angular that can be looked at are:
```
NGXS (where reducer + effects = state)
Akita
Mobx
```

Developers also talk about other solutions for the same problem such as:
```
Behaviour Subjects
Angular + Redux + Azure Tables (@baskarmib)
Router state and services
Observables and Subjects on services
Services + CQS/CQRS
```

The NgRx community however is a lot larger than any of these, and sanctioned by the Angular team, so it makes sense to become familiar with that before branching out to other options.  The main arguments against using a state management pattern are a lot of boilerplate code and a steep learning curve for new team members.  I would say that a simpler version of Redux is emerging but not yet a clear front runner.  Still I've enjoyed learning the NgRx implementations used in this project.



## The data source

We use the [Conchifolia](https://github.com/timofeysie/conchifolia) NodeJS server app as an endpoint for the entity data, but the data model expected by the entity interface doesn't match, and there is no id value used here.

We want to use the Q-code entity id for this.  Using Rxjs an observable stream needs to be created to massage the results into what can be used by NgRx.  Map can be used to run a function on each item.  We don't actually need the id as the cognitive_bias is the url with the Q-code.  The serve *could* parse the results and create an id from this string, and then find the Q-code from the Wikimedia parsing results but it's still not clear if that is the best way to go.


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

It's not easy to see where this is called from if we didn't already know.  EntityEffects is only used in the app.module.  So how does the observable getEntity$ end up on in the template?  There is no simple way to put it other than reading the docs and looking at lots of examples.

For the entity detail view the order in which the functions would get called looks something like this:
```
entities.component.navigateToEntity(id)
entity.component.ngOnInit()
entity.actions.GetEntity impl. Action {type = EEntityActions.GetEntity; constructor(public payload: number)
entity.effects.@Effect() getEntity$ = this._actions$.pipe
entity.actions.GetEntitySuccess impl. Action {type = EEntityActions.GetEntitySuccess; c(public payload: IEntity)
```


## Fixing the tests

Fixing the tests after this change became a challenge.  The tests were not updated in the Redux example, so 8 out of 9 tests were failing with setup issues.

When running ng test - got a 'router-outlet' is not a known element - error.

Imported the routing module in the spec and then got this:
```
Failed: StaticInjectorError(DynamicTestModule)[AppComponent -> Store]:
```

So, as you can see, this is a WIP.  First will be finishing off the global error handling setup which will also help in testing the app.

After putting the count in the title, running the test shows this problem:
```
ERROR in src/app/app.component.spec.ts(13,23): error TS2339: Property 'provideStore' does not exist on type 'typeof StoreModule'.
07 04 2019 10:05:40.200:WARN [launcher]: Chrome have not captured in 60000 ms, killing.
07 04 2019 10:05:41.184:INFO [launcher]: Trying to start Chrome again (1/2).
07 04 2019 10:06:41.184:WARN [launcher]: Chrome have not captured in 60000 ms, killing.
07 04 2019 10:06:42.106:INFO [launcher]: Trying to start Chrome again (2/2).
07 04 2019 10:07:42.638:WARN [launcher]: Chrome have not captured in 60000 ms, killing.
07 04 2019 10:07:43.450:ERROR [launcher]: Chrome failed 2 times (timeout). Giving up.
```

In the app.module, we have this:
```
imports: [ ... StoreModule.forRoot(appReducers),
```

But the spec is looking for it in app.component.  StoreModule is imported from @ngrx/store.  SO (StackOverflow) says:
*It was deprecated, use "forRoot" instead.  The method "provideStore" has been renamed to "forRoot", so that one better understands what this method does.*

So does that mean that the app.component spec should do this:
```
], imports: [ ... StoreModule.forRoot({}) ]
```

Next run (after killing the watch which couldn't find Chrome anymore), we get this:
```
Chrome 73.0.3683 (Mac OS X 10.14.2): Executed 9 of 9 (7 FAILED) (1.026 secs / 0.823 secs)
```

The brief is:
```
Chrome 73.0.3683 (Mac OS X 10.14.2) AppComponent should have as title 'app' FAILED
	Expected 'angular-ngrx' to equal 'app'.
Chrome 73.0.3683 (Mac OS X 10.14.2) AppComponent should have as title 'app' FAILED
  Expected 'angular-ngrx' to equal 'app'.
Chrome 73.0.3683 (Mac OS X 10.14.2) AppComponent should render title in a h1 tag FAILED
  Failed: Cannot read property 'textContent' of null  
Chrome 73.0.3683 (Mac OS X 10.14.2) EntityDetailsComponent should create FAILED
  TypeError: Cannot read property 'cognitive_biasLabel' of undefined
Chrome 73.0.3683 (Mac OS X 10.14.2) EntityDetailsComponent should create FAILED
  TypeError: Cannot read property 'cognitive_biasLabel' of undefined
Chrome 73.0.3683 (Mac OS X 10.14.2) EntitiesComponent should create FAILED
  	Can't bind to 'entities' since it isn't a known property of 'app-entities'.
  	1. If 'app-entities' is an Angular component and it has 'entities' input, then verify that it is part of this module.
    ... long stack trace
Chrome 73.0.3683 (Mac OS X 10.14.2) ConfigService should be created FAILED
    Error: StaticInjectorError(DynamicTestModule)[ConfigService -> HttpClient]:
```

Since the app is working, we know that these are all just test config problems introduced by the work we've just completed.

After getting some store values working in the app, the test situation has changed a bit.  Currently 6 out of 9 are failing.  We will work through these errors one at a time.

```
Error: StaticInjectorError(DynamicTestModule)[Store -> StateObservable]:
  StaticInjectorError(Platform: core)[Store -> StateObservable]:
    NullInjectorError: No provider for StateObservable!
```

Tried this in the spec:
```
import { StateObservable } from '@ngrx/store';

describe('EntityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityService, Store, StateObservable]
```

But then the error changed to:
```
Error: Can't resolve all parameters for StateObservable: (?).
```

This is the entity.service.spec.  A [SO answer](https://stackoverflow.com/questions/46544604/angular-2-component-with-ngrx-errors-when-run-unit-testing) gives an example of creating an initial state and mocking the store and using it like this:
```
const initialState = {...};
providers:[ {provide:Store, useValue: new MockStore(initialState)} ]
```

The [official testing docs](https://ngrx.io/guide/store/testing) have an example that does a similar thing, but uses a pre-made mock *state*.

```
import { provideMockStore } from '@ngrx/store/testing';
...
let store: MockStore<{ loggedIn: boolean }>;
const initialState = { loggedIn: false };
...
providers:[ provideMockStore({ initialState }) ]
```

But it causes this error:
```
ERROR in src/app/services/entity.service.spec.ts(6,34): error TS2307:
Cannot find module '@ngrx/store/testing'.
src/app/services/entity.service.spec.ts(9,14): error TS2304:
Cannot find name 'MockStore'.
```

Another approach would be to use the Jasmine spy object.
```
const testStore = jasmine.createSpyObj('Store', ['select']);
```

Since the mock store idea didn't work out, we need to do some more searching.  Even with the store spy, we still get the *Can't resolve all parameters for StateObservable* error.

#

After a week working with React, Angular routing testing and AWS Cognito integration, it's time to get a handle on what is happening with Tiwanaku NgRx and apply some of the lessons learned here.

Summing up the current state of the tests:
```
9 specs, 5 failures
AppComponent should render title in a h1 tag
Expected '' to contain ''.
...
Failed: Cannot read property 'entities' of undefined
TypeError: Cannot read property 'entities' of undefined
    at http://localhost:9876/_karma_webpack_/webpack:/src/app/store/selectors/entity.selector.ts:10:34
...
EntitiesComponent should create
[object ErrorEvent] thrown
EntitiesComponent should create
Failed: Template parse errors:
Can't bind to 'entities' since it isn't a known property of 'app-entities'.
...
EntityComponent should create
Failed: Template parse errors:
Can't bind to 'entity' since it isn't a known property of 'app-entity-details'.
...
EntityService should be created
Error: Can't resolve all parameters for StateObservable: (?).
Error: Can't resolve all parameters for StateObservable: (?).
```


Seems like mainly config issues.  Will start with the single entity view, since that is mostly failing in the app right now.  The entities view is doing what it should be at this moment.




## Global error handling

This could be done in various ways, but handling the errors globally seemed like a good idea.  [Here is one way](https://medium.com/calyx/global-error-handling-with-angular-and-ngrx-d895f7df2895) using the httpInterceptor.

Currently, if we turn off the wifi and refresh the page, we get these errors in the console log:
```
zone.js:2969 GET https://radiant-springs-38893.herokuapp.com/api/list/en net::ERR_INTERNET_DISCONNECTED
scheduleTask @ zone.js:2969
...
Error: ...
Headers: ...
message: "Http failure response for (unknown url): 0 Unknown Error"
name: "HttpErrorResponse"
ok: false
status: 0
statusText: "Unknown Error"
url: null
```

Out of the box, the http error shows up in the entity actions, which is good, but it doesn't make it to the app component, which is the 'global' part of this.  If we add the error to the app state like this:
```
export interface IAppState {
  router?: RouterReducerState;
  entities: IEntityState;
  config: IConfigState;
  error: any;
}

export const initialAppState: IAppState = {
  entities: initialEntityState,
  config: initialConfigState,
  error: null
};
```

We also need to add the error to the app reducers.  Then we will get errors reported and handled on global basis.  We might also want to save intercepted errors in the Store and display them in some sort of a error log.

But next, this all came about when considering how to add a loading spinner to hook into the API call actions.  This is a first step towards making that happen.


## NgRx Working Example


The Santiago García Da Rosa [example](https://github.com/SantiagoGdaR/angular-ngrx) provides a great start to implementing Redux in Angular.

### Containers components and presentation components

Santiago mentions an [article](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) by [Dan Abramov](https://medium.com/@dan_abramov) about the container and presentation components pattern used in this example. There is a disclaimer at the top of this article now that says he doesn't recommend it anymore.  Anyhow, it's already implemented here and can help separate complex stateful logic from other aspects of the component, which is what this project is all about.

There are other names for this pattern, for example:
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

This is a great library.  Quoted from the official introduction:
*RxJS is a library for composing asynchronous and event-based programs by using observable sequences. It provides one core type, the Observable, satellite types (Observer, Schedulers, Subjects) and operators inspired by Array#extras (map, filter, reduce, every, etc) to allow handling asynchronous events as collections.*

*Think of RxJS as Lodash for events.*

*ReactiveX combines the Observer pattern with the Iterator pattern and functional programming with collections to fill the need for an ideal way of managing sequences of events.*

However, it has changed over time so looking at older code can be a problem.  The [migration docs for Ionic 3 to 4](https://ionicframework.com/docs/building/migration#rxjs-changes) link to a [separate page](https://github.com/ReactiveX/rxjs/blob/master/MIGRATION.md) for RxJS which was updated to version 6.  This page then redirects to [another page](https://github.com/ReactiveX/rxjs/blob/master/docs_app/content/guide/v6/migration.md).  The most current release is 6.4.

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

In the script and styles arrays inside angluar.json, removed the step up path ```../```.
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
