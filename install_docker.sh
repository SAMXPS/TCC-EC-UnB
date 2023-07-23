# atualizacao do sistema
sudo apt update -y

# instalacao de dependencias
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# aqui talvez precise de reboot caso o kernel tenha sido atualizado
# opcional: reboot now

# chave do pacote do docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# atualizacao dos pkts do ubuntu...
sudo apt update -y

# aqui podemos ver os candidados pra instalacao do docker
apt-cache policy docker-ce

# deve aparecer algo do tipo, incluindo "jammy" por ser ubuntu 22.04
# docker-ce:
#   Installed: (none)
#   Candidate: 5:24.0.4-1~ubuntu.22.04~jammy

# instalando o docker...
sudo apt install docker-ce docker-compose -y