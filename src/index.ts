import { noTopLevelSideEffects } from './rules/noTopLevelSideEffects'

// export = because eslint expects it to be module.exports =
export = {
	rules: {
		'no-top-level-side-effects': noTopLevelSideEffects,
	},
}
