import { RuleTester } from 'eslint'
import { noTopLevelSideEffects } from '../rules/noTopLevelSideEffects'
import { markAsPure, wrapWithIIFE } from '../messages'

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2015,
		sourceType: 'module',
	},
})

// IMP = imported object
// GLOB = implicit global object

const expr = (line: string) => `
import {IMP} from 'foo'
export const test = ${line};
`

const expectValid = (expression: string) => {
	return {
		code: expr(expression),
	}
}

const expectInvalid = (expression: string, ...errorMessages: string[]) => {
	return {
		code: expr(expression),
		errors: errorMessages.map(m => ({ message: m })),
	}
}

tester.run('no-implicit-side-effects', noTopLevelSideEffects, {
	valid: [
		// accessing object
		expectValid('IMP'),
		// accessing member
		expectValid('IMP.foo'),
		// accessing member's - in pure IIFE
		expectValid('/* @__PURE__ */ (() => IMP.foo.bar)();'),
		// using member as computed property name
		expectValid(`{ [IMP.x]: 'foo' }`),
		// calling function - marked as pure
		expectValid('/* @__PURE__ */ IMP()'),
		expectValid('/* @__PURE__ */ IMP() ? bar : bazz'),
		// using expression with side-effect as computed property name - in pure IIFE
		expectValid(`/* @__PURE__ */(() => ({ [IMP.x.y]: 'foo' }))`),
		// accessing implicit global object's member - in pure IIFE
		expectValid('/* @__PURE__ */(() => GLOB.foo)()'),
	],
	invalid: [
		// calling method - method marked as pure
		expectInvalid('/* @__PURE__ */ IMP.foo()', wrapWithIIFE),
		// calling method's method - method marked as pure
		expectInvalid(
			'/* @__PURE__ */ IMP.bar().bazz()',
			wrapWithIIFE,
			wrapWithIIFE
		),
		// expectInvalid('/* @__PURE__ */ GLOB.bar()'),
		expectInvalid(
			'/* @__PURE__ */GLOB.bar().bazz()',
			wrapWithIIFE,
			wrapWithIIFE
		),

		// accessing member's member
		expectInvalid('IMP.bar.baz', wrapWithIIFE),
		expectInvalid('(() => IMP.bar.bazz)();', markAsPure),
		expectInvalid('/* @__PURE__ */ IMP.bar.baz', wrapWithIIFE),
		// calling method
		expectInvalid('IMP.bar()', wrapWithIIFE),
		expectInvalid('IMP.bar().bazz()', wrapWithIIFE, wrapWithIIFE),
		expectInvalid(
			'/* @__PURE__ */ IMP.bar(IMP.bazz())',
			wrapWithIIFE,
			wrapWithIIFE
		),
		// accessing member from a method call
		expectInvalid(
			'IMP.bar().bazz().xyz()',
			wrapWithIIFE,
			wrapWithIIFE,
			wrapWithIIFE
		),
		expectInvalid(
			'/* @__PURE__ */ IMP.bar().bazz().xyz',
			wrapWithIIFE,
			wrapWithIIFE,
			wrapWithIIFE
		),
		// calling function
		expectInvalid('bar()', markAsPure),
		expectInvalid('IMP() ? bar : bazz', markAsPure),
		// using expression with side-effect as computed property name
		expectInvalid(`{ [IMP.x.y]: 'foo' }`, wrapWithIIFE),
		expectInvalid(`/* @__PURE__ */{ [IMP.x.y]: 'foo' }`, wrapWithIIFE),
		// accessing implicit global object's member
		expectInvalid('GLOB.foo', wrapWithIIFE),
		expectInvalid('/* @__PURE__ */ GLOB.foo', wrapWithIIFE),
		expectInvalid('GLOB.bar()', wrapWithIIFE),
		expectInvalid('GLOB.bar().bazz', wrapWithIIFE, wrapWithIIFE),
	],
})
