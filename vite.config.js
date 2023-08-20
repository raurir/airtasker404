import { defineConfig } from "vite";

export default defineConfig({
	base: "http://localhost:4173/airtasker-404",
	build: {
		rollupOptions: {
			output: {
				entryFileNames: "js/[name]-[hash].js",
				chunkFileNames: "js/[name]-[hash].js",
				assetFileNames: (assetInfo) => {
					let extType = assetInfo.name.split(".").at(1);
					if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
						extType = "images";
					}
					return `${extType}/[name]-[hash][extname]`;
				},
			},
		},
	},
});
