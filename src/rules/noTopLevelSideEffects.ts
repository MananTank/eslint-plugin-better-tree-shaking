import type { Rule } from 'eslint'
import { Identifier, Comment, Node } from 'estree'
import { markAsPure, wrapWithIIFE } from '../messages'

function isInsideFunctionScope(node: Rule.Node) {
	let n = node
	while (n) {
		if (
			n.type === 'ArrowFunctionExpression' ||
			n.type === 'FunctionDeclaration' ||
			n.type === 'FunctionExpression'
		)
			return true
		n = n.parent
	}
	return false
}

export const noTopLevelSideEffects: Rule.RuleModule = {
	meta: {
		type: 'problem',
	},
	create(context) {
		let implicitGlobalIdentifiers: Identifier[] = []

		const isGlobalRef = (node: Identifier) => {
			return implicitGlobalIdentifiers.some(id => id === node)
		}

		const commentsByLine: Record<number, Comment[]> = {}

		function getLeadingPureComment(node: Node) {
			if (!node.loc) return
			// get position of the node
			const line = node.loc?.start.line
			const startCol = node.loc.start.column

			const comments = commentsByLine[line]

			// check if comment is before the node
			if (!comments) return
			const commentBeforeNode = comments.find(c => {
				return (
					(c.loc && c.loc.end.column + 1 === startCol) ||
					(c.loc && c.loc.end.column === startCol)
				)
			})

			return commentBeforeNode
		}

		function isMarkedPure(node: Node) {
			return !!getLeadingPureComment(node)
		}

		return {
			Program() {
				implicitGlobalIdentifiers = context
					.getScope()
					.through.map(v => v.identifier)

				const comments = context.getSourceCode().getAllComments()

				const pureComments = comments.filter(
					c => c.type === 'Block' && c.value.trim() === '@__PURE__'
				)

				pureComments.forEach(c => {
					if (!c.loc) return
					if (c.loc.start.line !== c.loc.end.line) {
						return
					}

					const line = c.loc.start.line
					if (!commentsByLine[line]) {
						commentsByLine[line] = []
					}
					commentsByLine[line]!.push(c)
				})
			},

			MemberExpression(node) {
				// inside function - ignore
				if (isInsideFunctionScope(node)) {
					return
				}

				// (obj.foo).? - report
				if (node.object.type === 'MemberExpression') {
					return context.report({
						node,
						message: wrapWithIIFE,
					})
				}

				// foo().?
				if (node.object.type === 'CallExpression') {
					// foo().bar
					if (node.parent.type !== 'CallExpression') {
						return context.report({
							node,
							message: wrapWithIIFE,
						})
					}

					// foo().bar()
					// /* @__PURE__ */ foo().bar()
					// if (isMarkedPure(node.object)) {
					// 	return
					// }

					return context.report({
						node,
						message: wrapWithIIFE,
					})
				}

				// ?.foo();
				if (node.parent.type === 'CallExpression') {
					// /* @__PURE__ */ ?.foo();
					// if (isMarkedPure(node.object)) {
					// 	return
					// }

					return context.report({
						node,
						message: wrapWithIIFE,
					})
				}

				// ImplicitGlobal.foo
				if (node.object.type === 'Identifier' && isGlobalRef(node.object)) {
					return context.report({ node, message: wrapWithIIFE })
				}
			},

			CallExpression(node) {
				// ignore if not iifee or function call
				if (
					node.callee.type !== 'ArrowFunctionExpression' &&
					node.callee.type !== 'Identifier' &&
					node.callee.type !== 'FunctionExpression'
				) {
					return
				}

				if (isInsideFunctionScope(node)) {
					// inside function - ignore
					return
				}

				if (isMarkedPure(node)) {
					return
				}

				return context.report({
					node,
					message: markAsPure,
				})
			},
		}
	},
}
