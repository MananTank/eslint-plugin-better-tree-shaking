export const wrapWithIIFE = `\
The Expression has side effects.
If it is pure, Put it in IIFE and annotate it with a leading /* @__PURE__ */ comment to properly tree-shake it from the bundle.

It it has side effects, disable ESLint rule for this line - but that means that bundler will not be able to tree-shake this code from the bundle
`

export const markAsPure = `\
The Expression has side effects.
If it is pure, Annotate it with a leading /* @__PURE__ */ comment to properly tree-shake it from the bundle.

It it has side effects, disable ESLint rule for this line - but that means that bundler will not be able to tree-shake this code from the bundle
`
