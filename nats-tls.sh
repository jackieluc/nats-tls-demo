#!/bin/sh

gnatsd --tlsverify --tlscert=./server-certs/server-cert.pem --tlskey=./server-certs/server-key.pem --tlscacert=./server-certs/ca-cert.pem
