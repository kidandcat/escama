package main

import "net/http"

func main() {
	port := ":8080"
	handler := http.FileServer(http.Dir("."))
	http.ListenAndServe(port, handler)
}
