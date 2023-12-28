import { withParaglide } from "@inlang/paraglide-js-adapter-next/plugin"

/** @type {import('next').NextConfig} */
export default withParaglide(
	{
		project: "./project.inlang",
		outdir: "./src/paraglide",
	},
	{
		i18n: {
			locales: ["en", "de"],
			defaultLocale: "en",
		},
	}
)
