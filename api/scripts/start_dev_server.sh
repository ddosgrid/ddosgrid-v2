#!/bin/bash
export CLIENT_APP_ORIGIN=http://localhost:8081
export OAUTH2_AUTHORIZE=https://www.csg.uzh.ch/ddosgrid/ddosdb/o/authorize/
export OAUTH2_TOKEN=https://www.csg.uzh.ch/ddosgrid/ddosdb/o/token/
export OAUTH2_CLIENTID=NnOKS0FCuGXWHi46cHain6IpbhjFbwN5pBmGmDHk
export OAUTH2_CLIENTSECRET=bHNpzRhgEtjVpibxFApW9ddJ0pZfyNwCM6vQTjwcCysCyVIlsVk12LjCaKmX9cYpuKT8gixqNmFvltpnF93UdBaaNcftjBGX43Boj2TKseNyQR68LYSLrJ4qx4IUqVkT
export OAUTH2_CALLBACK=http://localhost:8080/auth/provider/callback/
export DDOSDB_PROFILEINFO=https://www.csg.uzh.ch/ddosgrid/ddosdb/api/profileinfo
node index.js
