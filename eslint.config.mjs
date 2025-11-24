/* eslint-disable import/no-extraneous-dependencies */
// @ts-check
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import checkFile from 'eslint-plugin-check-file';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

const compat = new FlatCompat({
	allConfig: js.configs.all,
	baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
	recommendedConfig: js.configs.recommended,
});

export default defineConfig([
	globalIgnores(['dist']),

	{ extends: compat.extends('airbnb-base', 'airbnb-typescript/base') },

	boundaries.configs.recommended,
	perfectionist.configs['recommended-natural'],
	prettierRecommended,

	{
		languageOptions: {
			ecmaVersion: 'latest',
			globals: {
				...globals.jest,
				...globals.node,
			},
			parserOptions: {
				project: './tsconfig.json',
			},
			sourceType: 'module',
		},
		plugins: {
			boundaries,
			'check-file': checkFile,
		},
		rules: {
			'@typescript-eslint/await-thenable': 2,
			'@typescript-eslint/no-base-to-string': 2,
			'@typescript-eslint/no-loop-func': 0,
			'@typescript-eslint/no-unnecessary-condition': 2,
			'@typescript-eslint/no-unnecessary-type-assertion': 1,
			'@typescript-eslint/no-use-before-define': 0,
			'@typescript-eslint/prefer-optional-chain': 2,
			'boundaries/element-types': [
				'error',
				{
					default: 'allow',
					rules: [
						{ disallow: ['presentation', 'application', 'infrastructure'], from: 'domain' },
						{ disallow: ['presentation', 'application'], from: 'infrastructure' },
						{ disallow: ['presentation'], from: 'application' },
					],
				},
			],
			'check-file/filename-naming-convention': [
				2,
				{ '**/*.{js,ts}': 'KEBAB_CASE' },
				{ ignoreMiddleExtensions: true },
			],
			'class-methods-use-this': 0,
			'consistent-return': 0,
			'guard-for-in': 0,
			'import/prefer-default-export': 0,
			'max-len': [1, { code: 120, ignoreStrings: true, ignoreTemplateLiterals: true, tabWidth: 3 }],
			'no-inner-declarations': 0,
			'no-nested-ternary': 0,
			'no-param-reassign': 0,
			'no-plusplus': 0,
			'no-restricted-exports': 0,
			'no-restricted-syntax': 0,
			'no-return-assign': 0,
			'no-unreachable': 2,
			'no-unsafe-optional-chaining': [2, { disallowArithmeticOperators: false }],
			'perfectionist/sort-classes': [2, { type: 'unsorted' }],
			'perfectionist/sort-decorators': 0,
			'perfectionist/sort-imports': [2, { newlinesBetween: 'never', type: 'natural' }],
			'perfectionist/sort-intersection-types': [
				2,
				{
					groups: ['unknown', 'conditional', 'intersection', 'union', 'literal', 'keyword', 'nullish'],
					type: 'natural',
				},
			],
			'perfectionist/sort-modules': 0,
			'perfectionist/sort-named-exports': 0,
			'perfectionist/sort-union-types': [
				2,
				{
					groups: ['unknown', 'conditional', 'intersection', 'union', 'literal', 'keyword', 'nullish'],
					type: 'natural',
				},
			],
			'prefer-const': [1, { destructuring: 'all', ignoreReadBeforeAssign: false }],
			'prefer-template': 0,
			'prettier/prettier': 1,
			'require-await': 2,
			yoda: 1,
		},
		settings: {
			'boundaries/elements': [
				{ pattern: 'application', type: 'application' },
				{ pattern: 'domain', type: 'domain' },
				{ pattern: 'infrastructure', type: 'infrastructure' },
				{ pattern: 'presentation', type: 'presentation' },
			],
			'import/resolver': {
				typescript: {
					alwaysTryTypes: false,
				},
			},
		},
	},
	{
		files: ['**/*.{controller,repository,resolver,service}.ts'],
		rules: {
			'@typescript-eslint/explicit-function-return-type': 2,
		},
	},
	{
		files: ['**/*.{entity,module,service}.ts'],
		rules: {
			'import/no-cycle': 0,
		},
	},
	{
		files: ['**/migrations/*'],
		rules: {
			'check-file/filename-naming-convention': 0,
		},
	},
]);
