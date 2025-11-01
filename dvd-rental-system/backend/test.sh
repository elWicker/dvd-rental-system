#!/bin/bash
sleep 5
echo "➡️ Probando API Renta de DVD..."
curl -X GET http://localhost:3000/
echo ""
curl -X GET http://localhost:3000/rentas/no-devueltos
