#!/bin/bash
GOARCH=wasm GOOS=js go build -o app.wasm
go run .