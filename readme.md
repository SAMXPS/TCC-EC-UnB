# Projeto Final de Engenharia de Computação - Universidade de Brasília
## Infraestrutura de Fog e Cloud para dispositivos IoT considerando otimização de custos e latência

Aluno: Samuel James de Lima Barroso
Orientadora: Aletéia Patrícia Favacho de Araújo

## Sobre o projeto

Meu projeto de TCC consiste em demonstrar a utilização prática de uma 
infraestrutura redundante de FoG Computing para processamento de dados IoT por meio de
uma aplicação tolerante a falhas, otimizando custos financeiros e latência da aplicação. 

# Estrutura da Aplicação

A estrutura da aplicação desenvolvida está dividida em 3 camadas.
- A camada IoT é responsável por gerar dados e enviar para a camada de processamento (Core).
- A camada Core é reponsável por processar, armazenar e disopnibilizar os dados dos dispositivos IoT.
- A camada UI é responsável por conectar na API de dados da camada Core e apresentar para o usuário detalhes dos dados.

## IoT Layer

## Core Layer

A camada Core é a principal camada de aplicação desenvolvida para este projeto, pois aqui estará toda a lógica
de balanceamento de cargas, processamento, armazenamento e recuperação de dados. Para tal, essa camada está dividida
em 3 sub-aplicações, além de biblioteca de utilidades (Utils).

### Data Processor

O processador de dados

### Data Storage

### Data API

### Utils

A cadama Core também disponibiliza um serviço para encontrar o melhor servidor de processamento de dados disponível no momento,
por meio do programa server_finder.js, cuja função é disparar um teste de latência e de conectividade para todos os processadores
disponívels e escolher qual o melhor para se conectar no momento.

## UI Layer