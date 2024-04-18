import type { NextConfig } from "next"
import { addAlias } from "./alias"
import { once } from "./utils"
import { useCompiler } from "./useCompiler"

type ParaglideConfig = {
	/**
	 * Where the Inlang Project that defines the languages
	 * and messages is located.
	 *
	 * This should be a relative path starting from the project root.
	 *
	 * @example "./project.inlang"
	 */
	project: string

	/**
	 * Where the paraglide output files should be placed. This is usually
	 * inside a `src/paraglide` folder.
	 *
	 * This should be a relative path starting from the project root.
	 *
	 * @example "./src/paraglide"
	 */
	outdir: string

	/**
	 * If true, the paraglide compiler will only log errors to the console
	 *
	 * @default false
	 */
	silent?: boolean
}

type Config = NextConfig & {
	paraglide: ParaglideConfig
}

/**
 * Add this to your next.config.js to enable Paraglide.
 * It will register any aliases required by the Adapter,
 * aswell as register the build plugin if you're using webpack.
 *
 * @returns
 */
export function paraglide(config: Config): NextConfig {
	addAlias(config, {
		"$paraglide/runtime.js": config.paraglide.outdir + "/runtime.js",
	})

	// Next calls `next.config.js` TWICE. Once in a worker and once in the main process.
	// We only want to compile the Paraglide project once, so we only do it in the main process.
	once(() => {
		useCompiler({
			project: config.paraglide.project,
			outdir: config.paraglide.outdir,
			watch: process.env.NODE_ENV === "development",
			silent: config.paraglide.silent ?? false,
		})
	})

	const nextConfig: NextConfig = { ...config }
	delete nextConfig.paraglide

	return nextConfig
}
