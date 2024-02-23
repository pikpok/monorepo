import type { NextConfig } from "next"
import { addRewrites } from "./rewrites"
import { addAlias } from "./alias"
import { resolve } from "node:path"
import fs from "node:fs/promises"
import { once } from "./utils"
import { useCompiler } from "./useCompiler"

type ParaglideConfig = {
	project: string
	outdir: string
}

type Config = NextConfig & {
	paraglide: ParaglideConfig
	paths?: Record<string, Record<string, string>>
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
		})
	})

	const router = config.i18n ? "pages" : "app"
	if (router === "app") {
		addRewrites(config, async () => {
			const { loadProject } = await import("@inlang/sdk")
			const { openRepository, findRepoRoot } = await import("@lix-js/client")
			const projectPath = resolve(process.cwd(), config.paraglide.project)
			const repoRoot = await findRepoRoot({
				nodeishFs: fs,
				path: projectPath,
			})

			const repo = await openRepository(repoRoot || process.cwd(), {
				nodeishFs: fs,
			})

			const project = await loadProject({
				projectPath,
				repo,
			})

			const { languageTags } = project.settings()

			return [
				{
					source: `/:locale(${languageTags.join("|")})/:path*`,
					destination: "/:path*",
				},
			]
		})
	}

	const nextConfig: NextConfig = { ...config }
	delete nextConfig.paraglide

	return nextConfig
}
