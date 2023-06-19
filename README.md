# eslint-plugin-better-tree-shaking

<img src="assets/tree-shake-globe.svg" width="200" >

<br/>

## What?

Improve tree-shaking of your app/library by annotating top-level side-effects with `/* @__PURE__ */` comment.

## Examples

```js
import FOO from './foo'

// accessing member's member
export const t1_wrong = FOO.bar.bazz // ❌
export const t1_correct = /* @__PURE__ */ (() => FOO.bar.bazz)() // ✅

// calling method
export const t2_wrong = FOO.bar() // ❌
export const t2_correct = /* @__PURE__ */ FOO.bar() // ✅

// calling function
export const t3_wrong = FOO() // ❌
export const t3_correct = /* @__PURE__ */ FOO() // ✅

// multiple side effects in object
export const t4_wrong = {
	a: FOO(),
	[FOO.bar.bazz]: FOO.bar(),
	c: FOO.bar.bazz,
} // ❌

export const t4_correct = /* @__PURE__ */ (() => ({
	a: FOO(),
	[FOO.bar.bazz]: FOO.bar(),
	c: FOO.bar.bazz,
}))() // ✅

// accessing implicit global variable's member
export const t5_wrong = SOME_GLOBAL.FOO // ❌
export const t5_correct = /* @__PURE__ */ (() => SOME_GLOBAL.FOO)() // ✅

// calling implicit global variable's method
export const t6_wrong = SOME_GLOBAL.FOO() // ❌
export const t6_correct = /* @__PURE__ */ SOME_GLOBAL.FOO() // ✅
```

<br/>

## Install

```bash
npm i -D eslint-plugin-better-tree-shaking
```

<br/>

## Setup with ESLint

### Step 1: Add the plugin in ESLint Config

Add `"eslint-plugin-better-tree-shaking"` to the plugins section of your ESLint configuration file.

```json
{
	"plugins": ["eslint-plugin-better-tree-shaking"]
}
```

### Step 2: Add the Plugin's rule

Add the `"eslint-plugin-better-tree-shaking/no-top-level-side-effects"` rule in your ESLint config file as shown below

```json
"rules": {
	"eslint-plugin-better-tree-shaking/no-top-level-side-effects": "error"
}
```

<br/>

### Licence

MIT
