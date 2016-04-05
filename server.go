package main

import (
	"log"
	"net/http"
)

func serve(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Path
	http.ServeFile(w, r, "./"+file)
	log.Print(r.Method, " ", file)
}

func main() {
	
	http.HandleFunc("/", serve)

	err := http.ListenAndServe(":80", nil)
	if err != nil {
		log.Fatal(err)
	}
}
