import { deepmerge } from "deepmerge-ts"
import type { TransformConfig } from "../vite-plugin/inlang-app.js"

type DeepPartial<T> = T extends Record<PropertyKey, unknown>
	? {
	[Key in keyof T]?: DeepPartial<T[Key]>
}
	: T

export const initTestApp = (
	overrides: DeepPartial<TransformConfig> = {},
): TransformConfig =>
	deepmerge(
		{
			debug: false,

			sourceLanguageTag: "en",
			languageTags: ["en"],
			readMessages: async () => [],

			cwdFolderPath: "",
			options: {
				rootRoutesFolder: "",
				isStatic: false,
				languageInUrl: false,
				resourcesCache: "build-time",
				excludedRoutes: [],
			},

			svelteKit: {
				usesTypeScript: false,
				version: undefined,
				files: {
					appTemplate: "src/app.html",
					routes: "src/routes",
					serverHooks: "src/hooks.server",
				},
			},
		} satisfies TransformConfig,
		overrides as any,
	)
