# Tiwanaku

This is an app to get a list of entities from WikiData and provide a detail view of the items from a WikiMedia page.  It currently uses the [Conchifolia](https://github.com/timofeysie/conchifolia) NodeJS server app as a proxy for these calls.

It provides an example of managing application state using Angular with Redux based on [NgRx](https://ngrx.io/) which *provides reactive state management for Angular apps inspired by Redux.*


## Table of contents

1. [Workflow](#workflow)
1. [Categories](#categories)
1. [Deploying the PWA](#deploying-the-PWA)
1. [Creating a theme service](#creating-a-theme-service)
1. [Testing Redux in Angular](#testing-Redux-in-Angular)
1. [Upgrading to Angular 7.2 and the entity detail](#upgrading-to-Angular-7.2-and-the-entity-detail)
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


## Workflow

This app uses the usual Angular CLI workflow.

```
ng serve // http://localhost:4200/
ng generate component component-name
ng build // artifacts will be stored in the `dist/` dir
ng test
ng e2e
```

### The PWA workflow

Build the app first, then use [http-server](https://npmjs.com/package/http-server) to serve the app:
```
ng build --prod
npm build --prod
npm run build --prod
http-server -p 8080 -c-1 dist/angular-ngrx
```

The app will be live at
```
http://127.0.0.1:8080
```

*Tip: Use an incognito or private window in your browser to ensure the service worker doesn't end up reading from a previous leftover state.*

*Note: If you are not using HTTPS, the service worker will only be registered when accessing the app on localhost.*




### Lib status


Currently using Angular 8.2.13.
I twas originally started with 7.2.14 and ngrx 8.2.0.



## Categories

Opened issue #14 to cover this.

We need a list of categories with details to support this api call from the [strumosa-pipe](https://github.com/timofeysie/strumosa-pipe):
```
http://strumosa.azurewebsites.net/items?lang=en&category=fallacies&wdt=P31&wd=Q186150
```

Eventually this may be a list and not a select.  What we have currently is a master/detail pattern.  What we need is a master/master/detail pattern, or rather a master/list/detail pattern.  Categories are the master in this pattern.

Created a service to make the call in entity.service:
```
getCategoryList(category: string, wdt: string, wd:string, language: string): Observable<IEntityHttp> {
```

Now, we need a new action, or don't we already have one to kick off fetching the list?

Form actions:
```
export const FORM_CATEGORY_CHANGED = 'FORM_CATEGORY_CHANGED';
export const FORM_SET_VALIDITY = 'FORM_SET_VALIDITY';
```

Entity actions:
```
export enum EEntityActions {
  GetEntities = '[Entity] Get Entities',
  GetEntitiesSuccess = '[Entity] Get Entities Success',
  GetEntity = '[Entity] Get Entity',
  GetEntitySuccess = '[Entity] Get Entity Success'
}
```

Seems like FORM_CATEGORY_CHANGED should call GetEntities.  We will need to add the whole category object with the parameters in the object so that the call can include anything the user wants to try out.

Where does the form category change get kicked off?

In the reducer:
```
export function formReducer(state: IFormState = getDefaultFormState(), action: Action): IFormState {
    switch (action.type) {
        case FORM_CATEGORY_CHANGED: {
            const typedAction = <IFormCategoryChangedAction>action;
            return { ...state, category: typedAction.payload.value, isDirty: true };
        }
```


When running the app, the form select still needs some work.  It doesn't change and I'm thinking show the total number of results and a link to view them would be a decent feature.

After doing a bit of UX thinking, what we want is a list-list-detail pattern that is keyboard navigatable both up and down/left and right, chunked lists and cached nicely with deep comparisons for changed data.  It would also be nice to use variable fonts to dynamically adjust the text for its container.  As well, a kind of pwa dashboard to show cache and its state. Theres a whole list of to do items on a few of the projects, so this list here should be focused on just what is needed to implement the categories selection.  We can get back to inputting a new category ofter our switcher is finished.

The first task is a list of categories.  The selected category shows a list of its items on the right.  Press the right arrow key or select an item in the list with a mouse or a tap, and the categories shift left off screen and the item list shifts left to take the place of the categories and the item descriptions are shown on the right/  If you again move right, the item detail page is shown on the right0

Chunking means that each list shows only a certain number per page.  Seven might be the magic number, but we will add a setting to adjust this.  We have ten fingers so that seems like a good idea to me.

The next thing then is how to show the chunked sections.  Pagination?  Vertical scrolling without chunking?  No one wants to scroll thru a long list.  Currently there are 99 items on the cognitive bias list.  That's about 90 too many.  I think pagination, despite the amount of real estate it takes up on the screen is the go.  We will also want a text search at the top.

So with this changes, we have a good idea of what the UI is going to look like, and what kind of UX we want to support.  Currently what we have is a select on the options page with a half finished form.  I think we should copy the current item list state and create another container component to be the left-most category list.

First, breakfast.

1. Create the categories interface model.
1. Create the categories interface http model.
2. Create the categories component.
2. Create the categories container.
2. Create the categories service.
2. Create the categories actions.
2. Create the categories effects.
2. Create the categories reducers.
2. Create the categories selectors.
2. Create the categories state.

Wow, there is a lot of boilerplate to just sketch it out!  Moving on...
There is also the Category Details Component, and a container component.


Like our Entity actions, we can do this:
```
Get Catagories
Get Categories Success
Get Category
Get Category Success
```

Reducers
```
GetCategoriesSuccess
GetCategorySuccess
```

Selectors
```
selectEntityList
selectSelectedEntity
```

The state
```
categories: ICategory[];
selectedCategory: ICategory;
```


We haven't actually thought about the storage for a while.  It will have to be user specific, so then do we need login, hosting the data, securing the API.  It's all stuff that comes with a simple choice like this.

Firebase is a great option to both host the PWA app as well as provide a framework for user management and auth.

But we're still in development here, so for now we might want to just use a static service to return a static list.

To start the entity functionality can be duplicated as categories.  Then we will change it so that the selected category will become the values used to make the entity list call.

The commit for [all these changes is here](https://github.com/timofeysie/tiwanaku/commit/7759ea84873e014d5791b0c10a9cbee3e34ebefa) and the next one fixed up some typos.


### The category interface

There is a bit of a decision to make regarding the interface.

Right now, it is pre-configured for the cognitive biases query:
```
interface IEntity {
    cognitive_bias: string;
    cognitive_biasDescription: string;
    wikiMedia_description: string;
    cognitive_biasLabel: string;
    lang: string;
}
```

What we really need is for entities itself to be query-agnostic.  Something like this:
```
interface IEntity {
    category: string;
    categoryDescription: string;
    wikiMedia_description: string;
    categoryLabel: string;
    lang: string;
}
```

Why does that look strange?  Then what should the category interface look like?

interface ICategory {
    category: string;
    language: string;
    wdt: string;
    wd: string;
}

This is everything needed to run the query is for a list of items in that category.  So a list of categories should have everything it needs to get it.

There is of course a lot more than that.

[Here is the list of fallacies WikiData page](https://www.wikidata.org/wiki/Q863221).
[Here is the page](https://www.wikidata.org/wiki/Q8218825) for fallacies on WikiData.  

The next thing we would want is an array of available languages.
There is also the list of detail pages for the category in different languages.
A list of translations of the category label in many languages, most of which say "
No label defined", so that's not very useful.
There is also the Wikipedia page which as we know, is split into sub-categories.  For the previous version of this app, we have parsed the Wikipedia pages by hand for the organized items there and merged them with the WikiData list, indicating in some way which items are on both lists, or one or the other.  Until there is a better way to get the info we want from a Wikipedia page (ie until all the information contained in Wikipedia can be available in the WikiData format).

Since our current need is just of items on the list, not details about the list itself, we can ignore all these for now.  We will want the same thing from items on the list, so if we want we could bring that functionality up to the category level later on.

Next, the categories component template needs to be converted into a select and used on the options page.

After a bit of work and typos, there is still a gap in our data model.  In the Chrome developer tools Redux plugin, we see this:
```
categories: {
    categories: [
    {
        "cognitive_bias": "http://www.wikidata.org/entity/Q18570",
        "cognitive_biasLabel": "Hawthorne effect",
        "cognitive_biasDescription": "social phenomenon",
        "lang": "en"
    },
```

The observable state pattern is starting to look real good right now as a simpler alternative to Redux via NgRx!  But then we wouldn't be able to use the wonderful Redux inspector plugin to see the problem in the state clearly.  

The initial property should be list, as it's redundant to write categories.categories.  It should be list.categories.  Anyhow, it is the same for Entities.  

Now that the state is the correct objects, they still are not making it into the select on the options page.  The entities are shown in the container/presenter pattern, which in the case of the for, isn't being used right now.  We do have the unused category container and component classes.




## Deploying the PWA

[The official Ionic/Firebase]
(https://ionicframework.com/docs/publishing/progressive-web-app) lays out the basic steps, some of which are applicable to Ionic only, such as the build system.
```
npm install -g @angular/cli // if you haven't already
ng add @angular/pwa
```

Got this error the first time.  Not sure what the solution was:
```
Installed packages for tooling via npm.
Invalid rule result: Instance of class Promise.
```

This is the Ionic build.
```
ionic build --prod --service-worker

```

Angular would be something like this:
```
ng build --prod --service-worker
ng build --prod
```


For another project we got the following error:
```
chunk {3} styles.79cf99a676d1ea0664db.css (styles) 186 kB [initial] [rendered]
ERROR in Error during template compile of 'AppModule'
  Function expressions are not supported in decorators in 'ɵ0'
    'ɵ0' references 'appReducers' at app/app.module.ts(44,25)
      'appReducers' references 'entityReducers' at app/store/reducers/app.reducers.ts(11,13)
        'entityReducers' contains the error at app/store/reducers/entity.reducers.ts(5,31)
          Consider changing the function expression into an exported function.
```
[This answer](https://stackoverflow.com/questions/49943081/function-expressions-are-not-supported-in-decorators) indicates that need to export the function as decorators don't accept function calls into their properties.  In our case it's a reducer.  This doesn't seem to stop us from running the app.  Still, a prod build can uncover issues that must be addressed to move projects forward.

Line 5 in store/reducers/entity.recuders.ts looks like this.
```
export const entityReducers = (
  state = initialEntityState,
  action: EntityActions
): IEntityState => {
```

In the theme builder Emperor Don Carlos app, the error was the following:
```
ERROR in Module build failed: Error: Missing binding C:\Users\timof\repos\temp\emperor-don-carlos\node_modules\node-sass\vendor\win32-x64-72\binding.node
Node Sass could not find a binding for your current environment: Windows 64-bit with Node.js 12.x
Found bindings for the following environments:
  - Windows 64-bit with Node.js 8.x
....
at NormalModule.build (C:\Users\timof\repos\temp\emperor-don-carlos\node_modules\webpack\lib\NormalModule.js:365:15)[ERROR] An error occurred while running subprocess ng.
```

This was is the usual fix for the Ionic error:
```
$ node rebuild sass
```

create the project in Firebase.
https://console.firebase.google.com/?pli=1

Complete the setup:
```
npm install -g firebase-tools
firebase login
firebase init
ionic build --prod
```

Back to the ng build command in this project (a few other PWA projects are in progress as you can tell).
We are currently getting this error at step two of the PWA setup process:
```
ERROR in Error during template compile of 'AppModule'
  Function expressions are not supported in decorators in 'ɵ0'
    'ɵ0' references 'appReducers' at src\app\app.module.ts(44,25)
      'appReducers' references 'entityReducers' at src\app\store\reducers\app.reducers.ts(11,13)
        'entityReducers' contains the error at src\app\store\reducers\entity.reducers.ts(5,31)
          Consider changing the function expression into an exported function.
```

The first GitHub mention of that error shows this:
This wont work:
```
export const myFunc = (): boolean => true;
```

This will work:
```
export function myFunc(): boolean { return true; }
```

A StackOverflow answer shows this:
```
{path: 'auth', loadChildren: () => AuthModule }
```

This line is your problem. The AoT compilation cannot manage the funciton expression, it needs static references. Replace with this:
```
{path: 'auth', loadChildren: './auth/auth.module#AuthModule' }
```

Entity reducer line 5:
```
export const entityReducers = (
```

However if we try this:
```
export function appReducers(): ActionReducerMap<IAppState, any>  {
```

then every line after has red squigglies with the first one's tool tip saying:
*A function whose declared type is neither 'void' nor 'any' must return a value.ts(2355)*

So obviously TypeScript is not down with that.  [This SO answer](https://stackoverflow.com/questions/50311898/why-do-i-have-to-export-the-function-i-use-in-angular-appmodule-import-module) puts the problem well:
*The issues you are having are due to the Ahead-of-Time (AOT) compiler in Angular.*
*By default, ng serve and ng build use the Just-in-Time (JIT) compiler.*
*However, ng build --prod uses the AOT compiler. You can simulate this same behavior doing ng serve --aot.*
*The AOT Collector does not support the arrow function syntax.
*Angular generates a class factory in a separate module and that factory can only access exported functions.*

What???  There must be close to 100 arrow functions in this app.  Just search for '=>' and you'll see.  So, this could be a deal breaker.

TypeScript is not going to go for it either.

Going thru some other options.  Due to this warning:
```
Your global Angular CLI version (8.3.9) is greater than your local
version (7.3.8). The local Angular CLI version is used.
```

Tried this:
```
npm install --save-dev @angular/cli@latest
```

But then this:
```
>ng build --prod
An unhandled exception occurred: Could not find the implementation for builder @angular-devkit/build-angular:browser
See "C:\Users\timof\AppData\Local\Temp\ng-SExoAs\angular-errors.log" for further details.
```

Doing this didn't help:
```
npm install --save-dev @angular-devkit/build-angular
```

A GitHub issue from the Angular repo says this:
*Angular version 5 and CLI version 1, are not longer supported* *
https://angular.io/guide/releases#support-policy-and-schedule*
*I suggest you update to version 8 by running the update command via ng update @angular/cli @angular/core,*
*This is suggested because when running the update command several migrations will be executed to make your project compatible with the new version which otherwise you'd need to do manually.*

```
ng update @angular/cli @angular/core
...
Package '@angular/cli' is already up to date.
Package "@ngrx/router" has an incompatible peer dependency to "@angular/core" (requires "^2.0.0-rc.3" (extended), would install "8.2.13").
Package "@ngrx/router" has an incompatible peer dependency to "@angular/platform-browser" (requires "^2.0.0-rc.3" (extended), would install "8.2.13").
Package "@ngrx/router" has an incompatible peer dependency to "@angular/common" (requires "^2.0.0-rc.3" (extended), would install "8.2.13").
Package "@ngrx/router" has an incompatible peer dependency to "@angular/compiler" (requires "^2.0.0-rc.3" (extended), would install "8.2.13").
...
Incompatible peer dependencies found.
Peer dependency warnings when installing dependencies means that those dependencies might not work correctly together.
You can use the '--force' option to ignore incompatible peer dependencies and instead address these warnings later.
```

Used the force flage, so now Aunglar is at 8.2.14=3, but the *Could not find the implementation for builder @angular-devkit/build-angular:dev-server* error is still happening, both ng serve and npm start fail with the same message.

Trying [this approach](https://thecodebuzz.com/resolved-could-not-find-the-implementation-for-builder-angular-devkit-build-angularbrowser/):
```
npm uninstall @angular-devkit/build-angular
npm i --save-dev @angular-devkit/build-angular@latest
ng update
ng update @angular/cli @angular/core
```

This approach works, now both npm start and the prod build are back in action!


Next step in the PWA journey is to use [http-server](https://npmjs.com/package/http-server).

Then we serve the app with that:
```
http-server -p 8080 -c-1 dist/angular-ngrx
```

Going to 8080 then caused this error:
```
ERR_INVALID_REDIRECT
```

Had to add /index.html to it and the page loads.

From the official Angular docs:
*Tip: When testing service workers, use an incognito/private window to ensure the*
*service worker doesn't end up reading from a previous leftover state, which can cause unexpected behavior.*

*Note: If you are not using HTTPS, the service worker will only be registered when accessing the app on localhost.*0

### Making changes to the PWA


1. If using an incognito window, open a second blank tab (This will keep the incognito and the cache state alive).
2. Close the application tab, but not the window. This should also close the Developer Tools.
3. Shut down http-server.
4. Build and run the server again.


### The Check for Update Service

Following [the official demo code](https://github.com/angular/angular/blob/master/aio/content/examples/service-worker-getting-started), created these providers.

```
ng g s services/check-for-update
ng g s services/log-update
ng g s services/prompt-update
```


<button id="check" (click)="updateCheck()">Check for Update</button>
<p id="checkResult">{{updateCheckText}}</p>





### The links for the theme project
Project Console: https://console.firebase.google.com/project/emperor-don-carlos/overview
Hosting URL: https://emperor-don-carlos.firebaseapp.com


[This deployment guide](https://itnext.io/build-a-production-ready-pwa-with-angular-and-firebase-8f2a69824fcc) describes a production ready PWA process in decent depth.


### Caching strategies
* performance (resources that don’t change often)
* freshness (resources that change frequently)


### Asset groups
* lazy strategy
* prefetch strategy

10. Configuring a Firebase hosting for your PWA
* configure rewrite as above to point all sources to your index.html file
* the vendorChunk option in angular.json will because you will not update vendor libraries too often.


10.3 Adding HTTP/2 server push with link headers
12. Auditing your PWA with Lighthouse
12.3 Using Lighthouse CLI

iOS 11.3 has PWA support



## Forms with NgRx

Using [this article](https://medium.com/@gasiorowski.piotr/writing-redux-aware-angular-forms-with-ngrx-part-1-cf0981ffc10d) as a starting point for the form.  

```
ng add @angular/material @angular/cdk
ng add @ngrx/store @ngrx/effects
ng generate component form --prefix piotrek
```

A question: what is piotrek?  A diminutive of the male given name Piotr.
Any more questions?  No at this time.

To avoid an *Can't bind to 'formGroup' since it isn't a known property of 'form'* error, we need to import { FormsModule, ReactiveFormsModule } from '@angular/forms' in the app module.

To avoid an *'mat-form-field' is not a known element'* error, import, what?
SO:
*Since 2.0.0-beta.12, md prefix has been removed in favor of mat prefix. See this CHANGELOG for details: All "md" prefixes have been removed. See the deprecation notice in the beta.11 notes for more information. After the update, <md-form-field> should be changed to <mat-form-field>. Also, MdFormFieldModule and MdInputModule should be changed to MatFormFieldModule and MatInputModule*

Had to change Md to Mat in places like this:
```
import { MatFormFieldModule } from '@angular/material/form-field';
import { MdFormFieldModule } from '@angular/material';
```

Thanks for the breaking changes guys!

There are a also a few differences in our current setup such as this:
```
IApplicationState -> IAppState
app-state -> app.state
```

Do we just add these to the app state?
```
export const FORM_CATEGORY_CHANGED = 'FORM_CATEGORY_CHANGED';
export const FORM_SET_VALIDITY = 'FORM_SET_VALIDITY';
```


Getting this error among others:
```
Cannot read property 'config' of undefined
    at config.selector.ts:10
```

maybe state.config is not compiling?  Neither of these files have been modified yet.  Only app.stat.ts has changes so far, just for the name field.

There is a [completed project](https://github.com/GasiorowskiPiotr/redux-form-demo/blob/master/src/app/state/application-state.ts) repo, but is it wise to jump ahead like that?  The example has everything for a full address form.  We have different requirements.  So it would be better to get the framework in place for our three inputs for a SPARQL statement and then move on from there.

The other errors are:
```
ERROR TypeError: Cannot read property 'entities' of undefined
    at entity.selector.ts:10
Cannot read property 'entities' of undefined
    at entity.selector.ts:10
    core.js:19866 ERROR TypeError:
Cannot read property 'config' of undefined
        at config.selector.ts:10
Cannot read property 'config' of undefined
        at config.selector.ts:10
```


The big problem is here?  

config.selector.ts: line 10:
```
  (state: IConfigState) => state.config
```

Since we have added form to the app state, I guess that's why it is not compiling now.

According to [this SO answer](https://stackoverflow.com/questions/42742967/ngrx-state-is-undefined), setting a default case condition is the answer.

IFormState

That was from last week.  This week, changing this file name:
src/app/store/reducers/form-reducer.ts to form.reducer.ts so that it's in line with all the other reducers.  Also, why is there an app/reducers/index.ts file?

It has two empty functions:
```
export interface State { }
export const reducers: ActionReducerMap<State> = { };
```

There is an implemented function like this in the app/store/reducers/app.reducers.ts file:
```
export const appReducers: ActionReducerMap<IAppState, any> = {
```

The article does have that file with the dash:
```
import { formReducer } from './reducers/form-reducer';
```

Add that to the previous list of differences:
```
IApplicationState -> IAppState
app-state -> app.state
```

Using the GitLens plugin for VSCode, I can see that the app/reducers/index.ts file was committed as part of [this issue](https://github.com/timofeysie/tiwanaku/issues/9) 12 days ago.  That issue was created at the start of this section titled when this issue was started called *create a form to input a new category*.

As part of standard workflow, an issue is created for whatever work is going on so that commits are connected to issues to give visibility to what is going on in a project.  So its easy to see that the file was just added for that commit.  We want our Redux stuff all in the store directory, so the  pre-existing app/store/reducers/app.reducers.ts should be where the reducers are kept.  Still, I can't find out where that file came from.

Lets remove that file and start from the beginning again.  Setup the project by adding material, the @angular/cdk, and generate the form component.  Still, what is the freakin metaReducers?

Previously on Desperate Housewives, we had this in the app.module:
```
StoreModule.forRoot(appReducers),
```

During the [second commit](https://github.com/timofeysie/tiwanaku/commit/b1cba2085c9554b5939e5afac9db2a1804195e62) this was added for the file we just deleted:
```
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true
      }
    }),
```

If anyone can explain what meta reducers are and how to use them, that can be put back in.  But for now, just removing that section lets the app build, run and show it's list.  Yay!


This work is going slowly.  After a huge Saturday afternoon nap I'm up at 12 and casually flipping through tv stations just to avoid Redux.  Tattoo competitions, a show called "Ice Road Truckers",  fishing shows, home shopping, unpopular series, horse racing, music videos from the eighties and nineties and now I can hear the first birds popping off at 4:33.

Moving on and making the changes to move IFormState into its own file like the others.  Another successful compilation.  Now that the app is working again, time to get the for state to update the app state.

The state will be altered only in the reducers which are pure functions with the signature of OldState => Action => NewState like formReducer.

The Reactive Form needs to be connected with Redux. The form values are passed as input to the form component (a Presentational Component). Once there is a change of the input (propagated through implementation of OnChanges interface) the FormControls’ values are updated. Later on, we are also subscribing to distinct changes of FormControls’ values that pass the actions to the parent component (to be dispatched later).

In the options component, the formState: IFormState is put to use.  Now the actions are triggered and it's time for validation.   Along with the valid and states, PENDING — async validation is in progress could be put to use to check if there is a list for that category on Wikipedia.

At this point the article says: *Debatable idea — whether we should keep the errors in the form’s state and update the validity of the controls in the same way as we update their values…*

Thats great but the form never becomes valid.  Right now, getting this error from the form:
```
FormComponent.html:6 ERROR TypeError: Cannot read property 'isValid' of undefined
    at Object.eval [as updateRenderer] (FormComponent.html:11)
```

There are two forms, myForm and form
```
Input() form: IFormState;
...
myForm: FormGroup = new FormGroup({ })
```

I guess the input line needs to look like this:
```
@Input() form: IFormState = { isValid: false, isDirty: false };
```

But even with that change the error is still there.  On a different line: (FormComponent.html:18).

What is the line: *Object.eval [as updateRenderer]* all about?

Line 18 in the template:
```
[disabled]="!form.isValid"
```

The error happens about 12 times which indicates maybe that the form is not available when the template loads.  The handy ngIf comes to mind.  And then, since it's on the button div, there is no button, so there is no form.  Follow the money said Denzel.  Oh, and the errors are gone.

The form component is used like this:
```
<piotrek-form [form]="formState" (actionsEmitted)="onFormActions($event)"></piotrek-form>
```

Since the article is done, it's time to look at the completed GitHub project to determine what is missing.  But our OptionsComponent seems to be all good for how it creates the formState object which is passed into the form component.

Another somewhat related issue is that the on blur function gets called twice.
Piotr Gąsiorowski seems to talk about this in the comments.  On Sep 29, 2018 he said:

*you can do it in two ways:*

*valueChanges.pipe(distinctUntilChanged()) which is described in the blog itself. I really prefer this approach, since this is the first place you can attempt to stop the value change propagation.
let the same value update the state again, and in ngOnChanges(…) use setValue on control with emitEvent set to false. This also breaks the loop.*

*Generally approach 2. seems to be easier, since in 1. for non-primitive values you need to provide the function that compares objects, but on the other hand it updates store two times.*

*No matter the choice you make, it’s good to change the ‘updateOn’ option to ‘blur’ in order to emit actions after the whole value was provided.*

When converting the single app/form state class into two separate files left the default form creation state in the form file, and not called in the app state class.

Where does getDefaultFormState get used in the app?  The defaults are set in the app.state like this:
```
export const initialAppState: IAppState = {
  entities: initialEntityState,
  form: this.getDefaultFormState,
  config: initialConfigState,
  error: null
};
```

That form line is my own addition.
That function in question, *getDefaultFormState*, is used in the reducer.  Look at the way the config is initialised and the method is somewhat different.  But my attempt to approximate that style has come to nothing.  Time to watch Start Wars and let the answer *happen*.


The *formReducer* was not configured in the main app.reducers class.  That took quite a while, but there are no errors and we get out form state acting as expected.  Yay!

Next steps, either change the name field to category, and/or and the other options for the backend query:
```
lang=en&category=fallacies&wdt=P31&wd=Q186150
```
The [docs](https://en.wikibooks.org/wiki/SPARQL/Prefixes) say *WDQS understands many shortcut abbreviations, known as prefixes. Some are internal to Wikidata wd, wdt, p, ps, bd, etc. and many others are commonly used external prefixes, like rdf, skos, owl, schema, etc.*

In the following query, we are asking for items where there is a statement of "P279 = Q7725634" or in fuller terms, selecting subjects that have a predicate of "subclass of" with an object of = "literary work".

For simple WDQS (Wikidata Query Service) triples, items should be prefixed with wd:, and properties with wdt:
```
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
...
SELECT ?s ?desc WHERE {
  ?s wdt:P279 wd:Q7725634 .
  OPTIONAL {
      ?s rdfs:label ?desc
      FILTER (LANG(?desc) = "en").
  }
}
```

So, wd = entity, wdt = prop.  Feels like there is a long way to go to actually understand what we are doing here with WikiData.  Anyhow, cracking on.  Time to change name to category, and then add inputs for wd and wdt.

Name changed, and on the verge of adding a new field, second thoughts on that emerge.  Do we *really* want the user to have to find out what kind of codes to use to get a list of items?  Not really.  We need to automate that process or at least offer a list of options, which means a select or .

A more useful feature is a list of categories for which the codes are know, and allow the user to create new ones if they want.  That way we can have our current two lists and use the previously created form to make a new one while someone figures out if we can get the codes from the category in the first place.

So lets create our category list.

One problem is that the old API is not working anymore.
```
Request URL: https://radiant-springs-38893.herokuapp.com/api/list/en
Request Method: GET
Status Code: 503 Service Unavailable
```

Since moving on to pipes with Azure & AWS, old Heroku apps are dropping off.

So what is our new API?

The Azure version is running [at this location](https://github.com/timofeysie/strumosa-pipe).  The [sample API call](http://strumosa.azurewebsites.net/items?lang=en&category=fallacies&wdt=P31&wd=Q186150).

[This is the middleware in Acapana](https://github.com/timofeysie/acapana/blob/master/src/redux/middleware/index.js):
```
    const category = action.payload.title;
    const language = 'en';
    const wdt = '';
    const wd = '';
    const sparql = `
        SELECT ?${category} ?${category}Label ?${category}Description WHERE {
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],${language}".
            }
            ?${category} wdt:${wdt} wd:${wd}.
        }
        LIMIT 1000`
    const url = wdk.sparqlQuery(sparql);
```


http://www.wikidata.org/entity/Q29598


## Creating a theme service

Some call it co-branding, some call it bespoke.  Some just like dark mode.  When it comes to Angular which uses scss compiled css, the vanilla Javascript option is not available.  This old appraoch is well described in the famous W3 [Four Styles, One Page](http://www.w3schools.com/css/demo_default.htm) demo.

This section is about an Angular way to do a similar thing.  The basic approach could be as simple as this:
```
 [ngClass]="setTheme()
```

Us this on the top of components as described in the [answer to this Stack Overflow question]
(https://stackoverflow.com/questions/53077314/angular-bootstrap-4-dark-light-mode-switch)


Here is [a Stack Blitz example of the first answer](https://stackblitz.com/edit/angular-tzxvzf).


The crux is:
```html
<div [ngClass]="setTheme()">
```
```Javascript
  constructor(){
    this.themeVar = 'nightTime' /  'dayTime';
    this.emp_image = 'something';
  }
  setTheme(){
      return this.themeVar;
  }
```
```css
.dayTime{
  background: pink;
  hello{ color:red; }
  p {
    color:#000;
    font-family: Lato;
  }
}
.nightTime{
  background: skyblue;
  hello{ color:blue; }
  p {
    color:brown;
    font-family: Lato;
  }
}
```


### Themes with CSS variables

Taking things further when using something like Bootstrap or Ionic where a decent theme system with tinting and all that is already setup.  So you do you hook into this to create instant themes by just changing the existing base theme of six colors.

It is common to set global vars on the :root because it ensures that they will be picked up by all other elements in the DOM.
```
:root {
  --primary-color: orange;
}
```


Use and provide a fallback value, just in case the variable is undefined.
```
button {
  background: var(--primary-color, green);
}
```


### The theme service

We should create a theme service which will handle that for each component.

Here is a good discussion regarding what the functionality of the theme service  could look like:
https://angularfirebase.com/lessons/css-variables-in-ionic-4/

Even though it's for Ionic (which is based on Angular), I think it's a good pattern to follow.

For the next step we will be making a theme creater page.  Here is a good demo which uses sliders and variables for things other than colors:
https://googlechrome.github.io/samples/css-custom-properties/


First, create the service & install Color:
```
ng g service services/theme
npm i color
npm install @types/color
```


What's Color? A JavaScript library for immutable color conversion and manipulation with support for CSS color strings.

Or more exactly, a utility lib to calculate the tint, shade, and contrast for the base colors.

https://angularfirebase.com/lessons/css-variables-in-ionic-4/

We need an options page in this project.  Use the CLI:
```
ng g component containers/options
```



## Testing Redux in Angular

The problem: TOTAL: 6 FAILED, 3 SUCCESS

After implementing the basics of Redux in the app, the unit tests need the same love.


### Number 1
```
Chrome 75.0.3770 (Mac OS X 10.14.2) AppComponent should render title in a h1 tag FAILED
	Error: Expected '' to contain ''.
```

Love it.  In this case, Google is not going to help.  I will bet it's this one:
```Javascript
it('should render title in a h1 tag', async(() => {
  const fixture = TestBed.createComponent(AppComponent);
  fixture.detectChanges();
  const compiled = fixture.debugElement.nativeElement;
  console.log('sdf',compiled.querySelector('span').textContent);
  expect(compiled.querySelector('span').textContent).toContain('');
}))
```

The span on the first page looks like this:
```html
<span>{{ (entities$ | async)?.length }}</span>
```

Since that variable is using the async pipe, what's the bet that the test is not async, but should?

This is what we are doing in the class:
```Javascript
entities$ = this._store.pipe(select(selectEntityList));
```

And the unit test error:
```
Failed: Cannot read property 'entities' of undefined
```

In the official docs they show this:
```Javascript
items$ = this.store.pipe(select(fromFeature.selectFeatureItems));
```

Very similar.  In the example spec:
```Javascript
import * as fromRoot from '../reducers';
import * as fromFeature from '../feature/reducers';
import * as DataActions from '../actions/data';
...
let component: MyComponent;
let fixture: ComponentFixture<MyComponent>
let store: Store<fromFeature.State>
...

```

Since we have different names, what is *fromRoot*
```Javascript
import * as appReducers from './store/reducers/app.reducers';
import * as entityReducers from './store/reducers/entity.reducers';
import * as EntityActions from './store/actions/entity.actions';
...
let component: AppComponent;
let store: Store<fromFeature.State>
...
StoreModule.forRoot({
...appReducers.entityReducers
```

Nice try, but after that, the situation gets worse: TOTAL: 8 FAILED, 1 SUCCESS
```
AppComponent should have as title 'app' FAILED
	Failed: combineReducers is not defined
```

Fixed a few errors, but now it's back to the initial errors.  This might take some time...

To fix some errors like this:
```
ERROR in src/app/app.component.spec.ts(9,27): error TS2307: Cannot find module '@ngrx/store/testing'.
```

The lib @ngrx/store/testing was added after version 7.  Installed a few libraries that were missing.
```
npm i jasmine-marbles --save-dev
npm install @ngrx/store --save
```

Goes to show you need to read more of that output when debugging tests.  But this actually didn't help.  We have this in the package now:
```json
"@ngrx/core": "^1.2.0",
"@ngrx/effects": "^6.1.0",
"@ngrx/router-store": "^6.1.0",
"@ngrx/store": "^6.1.2",
"@ngrx/store-devtools": "^6.1.0",
```

Despite what the output says, we have store installed, but still get the error.
Trying to update to 7.4.  The current version has just been released:
18 hours ago 8.2.0.  On 5 June it was first introduced with 8.0.0-rc.1.

Had a problem trying to upgrade those so just unistalled and re-installed, now we have this:
```json
"@ngrx/core": "^1.2.0",
"@ngrx/effects": "^8.2.0",
"@ngrx/router": "^1.0.0-beta.2",
"@ngrx/router-store": "^8.2.0",
"@ngrx/store": "^8.2.0",
"@ngrx/store-devtools": "^8.2.0",
```

Have to put fixing this problem on the to-do list:
```
found 669 vulnerabilities (3 moderate, 666 high)
```

### 5 FAILED

After all this the situation has improved a (small) bit:
```
Executed 8 of 8 (5 FAILED) ERROR (0.522 secs / 0.478 secs)
```

Better than six errors!  Anyhow, the last one on the list is not actually a failure, it's an error:
```
Chrome 75.0.3770 (Mac OS X 10.14.2) ERROR
  An error was thrown in afterAll
  ReferenceError: any is not defined
      at <Jasmine>
      at Suite.<anonymous> (http://localhost:9876/_karma_webpack_/webpack:/src/app/components/entities/entities.component.spec.ts:11:36)
```

Oh, that was easy.  The store needs to be configured a little like this:
```Javascript
let store: MockStore<{ entities: any, selectedEntity: any }>;
const initialState = { entities: null, selectedEntity: null };
```

Then we get this error (down to 4 now):
```
Chrome 75.0.3770 (Mac OS X 10.14.2) ERROR
  An error was thrown in afterAll
  Error: Cannot call Promise.then from within a sync test.
```

There is actually no indication of *where* the error happens.

We could look at this error first:
```
AppComponent should render title in a h1 tag FAILED
	Failed: Cannot read property 'entities' of undefined
```

The current issue is the reducers in configuring the test bed.  If we do this:
```Javascript
TestBed.configureTestingModule({
	declarations: [
		AppComponent
	], imports: [
			RouterTestingModule,
			StoreModule.forRoot({
			...appReducers.entityReducers
		}) ]
```

We will get this error:
```
ERROR in src/app/app.component.spec.ts(25,31): error TS2345:
Argument of type
'{ appReducers: ActionReducerMap<IAppState, any>; }'
is not assignable to parameter of type
'ActionReducerMap<{ appReducers: {}; }, Action> | InjectionToken<ActionReducerMap<{ appReducers: {}; }, Action>>'.
  Type '{ appReducers: ActionReducerMap<IAppState, any>; }' is not assignable to type 'InjectionToken<ActionReducerMap<{ appReducers: {}; }, Action>>'.
    Property '_desc' is missing in type '{ appReducers: ActionReducerMap<IAppState, any>; }'.
```		

Using this:
```Javascript
...appReducers.entityReducers
```

which is more like what the sample test showed, results in this error:
```
ERROR in src/app/app.component.spec.ts(26,26): error TS2339: Property 'entityReducers' does not exist on type 'typeof import("/Users/tim/repos/tiwanaku/src/app/store/reducers/app.reducers")'.
```

The reducers look like this:
```Javascript
export const appReducers: ActionReducerMap<IAppState, any> = {
  router: routerReducer,
  entities: entityReducers,
  config: configReducers,
  error: errorReducers
};
```

The error:
```
ERROR in src/app/app.component.spec.ts(25,31): error TS2345: Argument of type '{ entityReducers: typeof import("/Users/tim/repos/tiwanaku/src/app/store/reducers/entity.reducers"); appReducers: ActionReducerMap<IAppState, any>; }' is not assignable to parameter of type 'ActionReducerMap<{ entityReducers: {}; appReducers: {}; }, Action> | InjectionToken<ActionReducerMap<{ entityReducers: {}; appReducers: {}; }, Action>>'.
  Type '{ entityReducers: typeof import("/Users/tim/repos/tiwanaku/src/app/store/reducers/entity.reducers"); appReducers: ActionReducerMap<IAppState, any>; }' is not assignable to type 'InjectionToken<ActionReducerMap<{ entityReducers: {}; appReducers: {}; }, Action>>'.
    Property '_desc' is missing in type '{ entityReducers: typeof import("/Users/tim/repos/tiwanaku/src/app/store/reducers/entity.reducers"); appReducers: ActionReducerMap<IAppState, any>; }'.
```

Or
```
ERROR in src/app/app.component.spec.ts(25,31): error TS2345: Argument of type '{ appReducers: ActionReducerMap<IAppState, any>; }' is not assignable to parameter of type 'ActionReducerMap<{ appReducers: {}; }, Action> | InjectionToken<ActionReducerMap<{ appReducers: {}; }, Action>>'.
  Type '{ appReducers: ActionReducerMap<IAppState, any>; }' is not assignable to type 'InjectionToken<ActionReducerMap<{ appReducers: {}; }, Action>>'.
    Property '_desc' is missing in type '{ appReducers: ActionReducerMap<IAppState, any>; }'.
```

### NgRx Workshop Tests

Not sure what the sample was that the redux unit test setup came from.  Looking at Santiago's GitHut, he has a [workshop project](https://github.com/SantiagoGdaR/ngrx-workshop) with tests for the store.  That's a start.  The last step: *5 - example of unit testing our store*.

In the tests branch, we have a [reducer spec](https://github.com/SantiagoGdaR/ngrx-workshop/blob/feature/ngrx-test/src/app/store/reducers/github.reducer.spec.ts).

There are eleven tests there, and they all pass.  The app itself is a bit different from the Redux intro, it is a basic user page and a list of GitHub users.  Not bad really, as a starting point.  However, the idea was to have a great tutorial available for new users to read and get up to speed on the app code features so they can then join in the open source project with less steep learning curve.

The plan now is to roll back the Redux tests and implement these working tests one at a time and see how that goes.  Failing that, use the working workshop app to replace the current one and add the entities to that instead.


###  FAILED, 1 SUCCESS

After step one, things are worse:
```
TOTAL: 9 FAILED, 1 SUCCESS
```

Some of the fun:
```
Movies I haven't seen in the Marvel universe stories besides the Antman ones are:
1. Thor: The Dark World (2013)
2. Thor: Ragnarok (2017)
```

The last fail then in the list after rolling back the app.component and
```
Chrome 75.0.3770 (Mac OS X 10.14.2) EntitiesComponent should create FAILED
	1. If 'app-entities' is an Angular component and it has 'entities' input, then verify that it is part of this module.
```

```
EntityService should be created FAILED
	Error: StaticInjectorError(DynamicTestModule)[Store -> ActionsSubject]:
		StaticInjectorError(Platform: core)[Store -> ActionsSubject]:
		  NullInjectorError: No provider for ActionsSubject!
```

```
Chrome 75.0.3770 (Mac OS X 10.14.2) EntityComponent should create FAILED
	1. If 'app-entity-details' is an Angular component and it has 'entity' input, then verify that it is part of this module.
```

First off, there are no extra tests in the app.component.spec.  So we don't even need to worry about that.

GithubUserListComponent and the other home component both have no special redux tests.

GithubUsersComponent however does.  That class does a simple fetch:
```Javascript
users$ = this.store.pipe(select(selectGithubUsers));
constructor(private store: Store<AppState>) { }
ngOnInit() {
	this.store.dispatch(new GetUsers());
}
```

Only three lines of anything interesting in the class, but the unit test spec if quite a bit longer:
```Javascript
let component: GithubUsersComponent;
let fixture: ComponentFixture<GithubUsersComponent>;
let store: Store<AppState>;

beforeEach(async(() => {
	TestBed.configureTestingModule({
		imports: [
			StoreModule.forRoot(reducers)
		],
		declarations: [ GithubUsersComponent, GithubUserListComponent ]
	})
	.compileComponents();
}));

beforeEach(() => {
	fixture = TestBed.createComponent(GithubUsersComponent);
	component = fixture.componentInstance;
	store = TestBed.get(Store);
	spyOn(store, 'dispatch').and.callThrough();
	fixture.detectChanges();
	it('should dispatch an action to load github users when created', () => {
	const action = new GetUsers();
	expect(store.dispatch).toHaveBeenCalledWith(action);
});

it('should have a list of github users after the data is loaded', () => {
	const githubUsers: GithubUser[] = [
		{ login: 'login1', avatar_url: ''},
		{ login: 'login2', avatar_url: ''},
		{ login: 'login3', avatar_url: ''}
	];
	const action = new GetUsersSuccess(githubUsers);

	store.dispatch(action);

	component.users$.subscribe(data => {
		expect(data.length).toBe(githubUsers.length);
	});
});
```

There are a few errors before really getting to this.  It would be nice if there were first of all no errors, and then adding the above setup and tests step by step to get it right.

So clearing out the errors, there is this one:
```
AppComponent > should create the app
...
    NullInjectorError: No provider for Store!
```

However, in the code above, there is no store in the provider of the app component.  Normally we would just chuck the store into the provider array in the test bed setup.

Doing that then causes this error:
```
AppComponent > should render title in a h1 tag
...
    NullInjectorError: No provider for StateObservable!
```

Despite the name, we added ```StoreModule.forRoot({})``` in the imports array and that test passed.


### 5 FAILED, 4 SUCCESS

Stutus update:
```
TOTAL: 5 FAILED, 4 SUCCESS
```

The next error for that component then is this:
```
AppComponent > should render title in a h1 tag
Failed: Cannot read property 'entities' of undefined
```

At this point git was hanging when pushing updates to GitHub.  Tried the usual answer for this:
```
git config --global core.askpass "git-gui--askpass"
```

But that didn't help.  Restarting the terminal and doing a push after that worked when the UI popped up for username and password, and the push worked.


### 5 failures

#### AppComponent > should render title in a h1 tag
#### Failed: Cannot read property 'entities' of undefined

Importing and setting up the test bed like in the workshop in the app component gets rid of one error.  Actually no, that's what the console says, but the Chrome debug console shows this:

Executed 6 of 9 (4 FAILED) ERROR or 9 specs, 6 failures

Imported the store and StoreModule in the entity service the same as part of the work done on the app.component.spec.  The test watch seemed to have stalled, so ran them again.

#### (6 FAILED) ERROR

```
EntityService > should be created
Error: Invalid provider for the NgModule 'DynamicTestModule' - only instances of Provider and Type are allowed, got: [EntityService, Store, [object Object], ?[object Object]?, ...]
```

The StoreModule.forRoot({}) was in both imports and providers, but only needs to be in imports.  However, the number of failures is the same.  The last one on the list now has changed to this:
```
AppComponent > should have as title 'app'
Failed: Cannot read property 'entities' of undefined
error properties: Object({ longStack: 'TypeError: Cannot read property 'entities' of undefined
```

Import the entities.component into that class and then:
```
EntityService > should be created
TypeError: source.subscribe is not a function
```

That's the kind of error you get when a mock service doesn't return an observable as explained [here](https://stackoverflow.com/questions/51936445/typeerror-x-subscribe-is-not-a-function).

Do we mock the entity or the entity service?


#
## Upgrading to Angular 7.2 and the entity detail

While trying to fix the entity detail page, which always get's the first element on the list from the state, we decided to upgrade to Angular 7.2 to take advantage of the router improvements.

Since this app was using the ageing Angular 6 deps (and because Angular 7.2 allows us to pass objects to a route so we can display the object on the new page and start the API calls to go thru all the re-directs to get the detail contents), it's time up upgrade?

This turns out to be a lot more than just changing some numbers in the package.  It involves:
* Angular dependencies
* Angular dev dependencies
* Dependencies; Core-js and Zone.js
* Dev dependencies; Types, codelyzer, karma tools, jasmine, protractor and tslint
* The new version 3+ of TypeScript
* Latest version 6+ of RxJS
* Latest version 4+ of Webpack
* Enable Ivy Renderer in the tsconfig.json

p.s.  Watch out for breaking changes in forms which we don't have.

The full article is [here](https://medium.com/@jeroenouw/upgrade-to-angular-7-beta-within-10-minutes-c14fc380edd) if you can afford it.

Then something that wasn't in the Medium article:
```
tsconfig.json(8,5): error TS5023: Unknown compiler option 'enableIvy'.
Error: tsconfig.json(8,5): error TS5023: Unknown compiler option 'enableIvy'.
    at AngularCompilerPlugin._setupOptions (/Users/tim/repos/tiwanaku/node_modules/@ngtools/webpack/src/angular_compiler_plugin.js:94:19)
```

It was a mix up between "compilerOptions" and "angularCompilerOptions".  Details boy!

But that's not all!
```
ERROR in ./node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/jit-polyfills.js
Module not found: Error: Can't resolve 'core-js/es7/reflect' in '/Users/tim/repos/tiwanaku/node_modules/@angular-devkit/build-angular/src/angular-cli-files/models'
ERROR in The Angular Compiler requires TypeScript >=3.1.1 and <3.3.0 but 3.4.5 was found instead.
ℹ ｢wdm｣: Failed to compile.
```

Maybe just using the *latest* of everything is not such a good idea?  What works at one point in time may not work at another.

```
npm i typescript@3.1.6 --save-dev --save-exact
```

Next,
```
ERROR in ./node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/jit-polyfills.js
Module not found: Error: Can't resolve 'core-js/es7/reflect' in '/Users/tim/repos/tiwanaku/node_modules/@angular-devkit/build-angular/src/angular-cli-files/models'
ERROR in ./src/polyfills.ts
Module not found: Error: Can't resolve 'core-js/es7/reflect' in '/Users/tim/repos/tiwanaku/src'
```

SO: add paths to compilerOptions in tsconfig.json.  Again with the compiler options!

Only then did the app run.  Still better of than Hertz and Accentura.

### Router improvements

With the new Angular in place, we should be able to do something like this:
```
navigateWithState() {
  this.router.navigateByUrl('/123', { state: { hello: 'world' } });
}
```

Then on the detail page:
```
ngOnInit() {
  this.state$ = this.activatedRoute.paramMap
    .pipe(map(() => window.history.state))
}
```

Really?  Get it from the window.history?  We wouldn't need any improvements in the router to do that ourselves, would we?  It's a classic global state.

Anyhow, not sure how this changes the routes.  Before we had this:
```
{ path: 'entity/:cognitive_bias', component: EntityComponent },
```

If we can pass the whole entity object through the route, then we don't need to pass the id anymore.  The only problem is that it looks like we need some more TypeScript help:
```
ERROR in src/app/containers/entity/entity.component.ts(20,26): error TS2339: Property 'activatedRoute' does not exist on type 'EntityComponent'.
src/app/containers/entity/entity.component.ts(21,13): error TS2552: Cannot find name 'map'. Did you mean 'Map'?
```

Adding this to the compiler options didn't help:
```
"lib": [
  "es2017",
  "dom",
  "es6",
  "es5"
```

Finally read the comments under the article and discovered to correct import statement to use.  Always read the comments!


### Router as the source of truth

In the [NrWl blog](https://blog.nrwl.io/managing-state-in-angular-applications-22b75ef5625f), we learn that Rule 5 is *Always treat Router as the source of truth*

Why?  *Since the user can always interact with the URL directly, we should treat the router as the source of truth and the initiator of actions. In other words, the router should invoke the reducer, not the other way around.*

How does this work?  *the router parses the URL and creates a router state snapshot. It then invokes the reducer with the snapshot, and only after the reducer is done it proceeds with the navigation.*

*RouterConnectedToStoreModule will set up the router in such a way that right after the URL gets parsed and the future router state gets created, the router will dispatch the ROUTER_NAVIGATION action*

*the router will wait until this observable completes. If the reducer throws an exception, the router will cancel the navigation.*

Got all that?  It all boils down to using something called the *RouterConnectedToStoreModule*.

Create a new reducer: ROUTER_NAVIGATION.  Looking at the project in the monorepo we never actually implemented this part.  That should probably happen next.  For now we can pass the whole entity via the router, but it's not that simple.

Now, the route will change to /entity, without an id, which means that if a person tries to share that link, the app will break.  We want to have both full object and the id in the url.  However, the portion of the app that relies on the object will still break.

We want the user to see the label and description while the WikiMedia content is loading, so even if we have the id in the url, we will have to then get the full list from the store and match the id to the correct item to do this.  That should be pretty quick as no API call would be needed, it's just extra work when it feels like we should be done with this now and moving on to getting the WikiMedia lists and merging them into the WikiData list to have a somewhat complete list.  Oh well, such is a developers side project life.

This awfully long un-lintable line produces what we want:
```
<a routerLink="/entity/{{entity.cognitive_bias.substring(entity.cognitive_bias.lastIndexOf('/'),entity.cognitive_bias.length)}}" [state]="{ data: entity }">{{ entity.cognitive_biasLabel }}</a>
```

```
http://localhost:4200/entity/Q18570
```

Or we could encode and pass the entire string:
```
http://www.wikidata.org/entity/Q18570
```

Not sure which is worse.  Another option is to map the list on load and add the id to each object, but that's another step/layer that makes the app more complicated.  For now, if the user navigates to the detail page, we can use that value to get both the WikiData item and the detail page.  If someone does that work of course.


Pipes let you combine multiple functions into a single function.  You need to call subscribe() to produce a result through the pipe.

Angular prefers combining operators with pipes, rather than chaining. But chaining is used in many RxJS examples.





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


The entity list from Loranthifolia is a combination of WikiData and WikiMedia lists.  The first is a query from the Conchifolia server.  The second one returns the html sections from the Wikipedia page that has three categories of entities.  This list is then parsed and the resulting data is merged with the WikiData list.  This is why there are two slightly overlapping parameter lists for the entity model.




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

One of the problems was the first entity was being chosen each time, no matter which one was actually chosen from the list.

It seems like a good idea: don't store anything in the the state that can be re-produced.  The entity description is such a thing.  But we have it right there; why waste more code getting it again if we can just pass it to the next page?

What was the project where we made the router the source of truth?  That was in our [fledgling monon-repo](https://github.com/timofeysie/quallasuyu) I think.

You're right, whoever you are.  In our notes: *Since the user can always interact with the URL directly, we should treat the router as the source of truth and the initiator of actions. The router should invoke the reducer.  StoreRouterConnectingModule parses the URL and creates a router state snapshot. It then invokes the reducer with the snapshot, and only after the reducer is done it proceeds with the navigation.*

It is an [nx article](https://github.com/vsavkin/state_management_ngrx4).  The impressive article walks readers through an ad-hoc state-management strategy with a few issues, then fixes the issues in ad-hoc way and finally refactors the app using NgRx 4.

Might want to think about doing that here.  The plan actually was to implement what we have going on here in the mono-repo, but since it's only a few weeks old, it would be prudent to get more familiar witch what NrWl is pushing on us with their "power ups".

[This is the blog version](https://blog.nrwl.io/managing-state-in-angular-applications-22b75ef5625f) of the article.


* optimistic updates use a separate action called UNRATE, to handle the case when the server rejects and update.
* change the model to be immutable.
* RouterConnectedToStoreModule will set up the router in such a way that right after the URL gets parsed and the future router state gets created, the router will dispatch the ROUTER_NAVIGATION action



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
