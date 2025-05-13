#!/bin/bash

# Check if Certs directory exists, create it if it doesn't
if [ ! -d "Certs" ]; then
    mkdir Certs
fi

# Navigate to certs directory
cd certs

# Generate Certificate Authority
openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -out ca.crt \
    -subj "/C=AU/ST=NSW/L=Sydney/O=USYD/OU=Student/CN=DevCA"

# Generate Server Certificate Signing Request
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr \
    -subj "/C=AU/ST=NSW/L=Sydney/O=USYD/OU=Student/CN=localhost"

# Sign Server Certificate with CA
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
    -out server.crt -days 365 -sha256