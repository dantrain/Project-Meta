({
    appDir: "public",
    baseUrl: "scripts/lib",
    dir: "public-built",
    paths: {
		app: '../app',
		"jquery": "require-jquery"
    },
    optimizeCss: "standard",
    modules: [
        {
            name: "../main",
            exclude: ["jquery"]
        }
    ]
})