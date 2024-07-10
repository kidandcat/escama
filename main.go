package main

import (
	"github.com/maxence-charriere/go-app/v10/pkg/app"
)

func main() {
	app.Route("/", func() app.Composer { return &hello{} })
	app.RunWhenOnBrowser()
	app.GenerateStaticWebsite(".", &app.Handler{
		Name:        "Hello",
		Description: "An Hello World! example",
		Resources:   app.GitHubPages("escama"),
	})
}

type hello struct {
	app.Compo
}

func (h *hello) Render() app.UI {
	return app.Div().Body(
		app.Img().
			ID("video").
			Style("width", "100%").
			Src("http://192.168.68.125/stream"),
	)
}
