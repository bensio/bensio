package main

import (
	"github.com/googollee/go-socket.io"
	"log"
	"net/http"
)

func main() {
	server, err := socketio.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}
	server.On("connection", func(so socketio.Socket) {
		log.Println("on connection")
		so.Join("chat")
		so.On("chat message", func(msg string) {
			log.Println("emit:", so.Emit("chat message", msg))
			so.BroadcastTo("chat", "chat message", msg)
		})
		so.On("disconnection", func() {
			log.Println("User Disconnected")
		})
	})
	server.On("error", func(so socketio.Socket, err error) {
		log.Println(err)
	})

	http.Handle("/socket.io/", server)
	http.Handle("/", http.FileServer(http.Dir("./asset")))
	log.Println("Serving at bens.io:5000...")
	log.Fatal(http.ListenAndServe(":5000", nil))
}
