# Introdução

Olá, sou Felipe, e essa é uma backend de autenticação realizada por mim utilizando essas tecnologias:

- Node.js
- Express
- Passport

## Funcionalidades

- JWT
- Refresh Token
- OAuth
- Chaves Assimétricas
- JWKS Endpoint
- Recuperação de senha
- Confirmação de Email
- Envio de email utilizando SMTP

# Lista de Conteúdos
- [Introdução](#introdução)
  - [Funcionalidades](#funcionalidades)
- [Lista de Conteúdos](#lista-de-conteúdos)
- [Instruções](#instruções)
  - [Instalação Padrão](#instalação-padrão)
  - [Instalação com Docker](#instalação-com-docker)
  - [Endpoints](#endpoints)
    - [Login](#login)
    - [Logout](#logout)
    - [Registro](#registro)
    - [Rota Protegida](#rota-protegida)
    - [Redefinir Senha](#redefinir-senha)
    - [Google OAuth](#google-oauth)
    - [JWKS](#jwks)
- [Observações](#observações)

# Instruções

## Instalação Padrão
1. Clonar o Repositório
```bash
git clone https://github.com/FelipeKobra/Auth_API.git
```

2. Instalar os pacotes
```bash
npm install
```

3. Adicionar as variáveis de ambiente necessárias

Deixei um arquivo chamado `env_example.txt` na pasta raiz do diretório, onde possui todas as variáveis de ambiente necessárias. <br>
É necessário somente adicionar suas informações no lugar e trocar o nome do arquivo para `.env`

4. Comandos de Inicialização
   - Desenvolvimento
     ```bash
     npm run dev
     ```
   - Produção
     ```bash
     npm run build
     ```
     ```bash
     npm run start
     ```

## Instalação com Docker
1. Baixar a imagem
```bash
docker pull felipekobra/auth_api
```

2. Criar um arquivo com suas variáveis de ambiente <br>

Deixei um arquivo chamado `env_example.txt` na pasta raiz do diretório onde possui todas as variáveis de ambiente necessárias. <br>
É necessário somente adicionar suas informações no lugar e trocar o nome do arquivo para `.env` 
<br>
*OBS:* Caso seu banco de dados esteja hospedado no `localhost`, troque o valor nas variáveis de ambiente, de `localhost` para `host.docker.internal` 

3. Iniciar o contêiner <br>
   
  - Utilizei o parâmetro `--env-file` pela facilidade de enviar as variáveis de ambiente.
  - Verifique se suas variáveis de ambiente estão formatadas corretamente
    - Sem espaços entre o nome da variável, o `=` e o valor da variável
    - Somente utilizar `""` quando tiver um espaço no valor da variável, já que em muitos momentos ele pode considerar as `""` como parte do valor
  - No meu caso adicionei a porta `3000` como `PORT` em meu `.env`, por isso utilizei o comando abaixo, mas caso queira trocar não há problema, apesar de estar como `EXPOSE` no `Dockerfile`
```bash
docker run --env-file .env -p 3000:3000 felipekobra/auth_api
```

## Endpoints

### Login
`POST`
`http://localhost:3000/user/login`

Campos necessários no `body`
- email
- password

### Logout
`GET`
`http://localhost:3000/user/logout`

### Registro
`POST`
`http://localhost:3000/user/register`

Campos necessários no `body`
- email
- password
- name

### Rota Protegida
`GET`
`http://localhost:3000/protected`

Essa rota pode ser acessada de duas formas:
- Enviando o token recebido no login como `Bearer Token`
- Entrar automaticamente utilizando os cookies após o login

### Redefinir Senha
`POST`
`http://localhost:3000/redefinePassword/email`

Campos necessários no `body`
- email

### Google OAuth
O Google OAuth, por motivos de segurança, é realizado preferencialmente de forma visual, então decidi manter dessa forma <br>
Para acessar esse método de autenticação, basta entrar com o link abaixo no navegador e entrar com sua conta, a resposta será mostrada em forma de `JSON`

`http://localhost:3000/auth/google`

*OBS:* Esse é o link que deve ser acessado por padrão em meu repositório, pois em meu projeto no Google Cloud adicionei como:
- Endpoint Padrão: `http://localhost:3000/auth/google`
- Endpoint de Callback: `http://localhost:3000/auth/google/callback`
<br>

### JWKS
Normalmente quando se cria chaves assimétricas é importante disponibilizar a chave pública para todos os serviços que utilizam nosso `JWT`<br>
Portanto disponibilizei um endpoint padrão, e para acessar basta enviar um:
`GET` `http://localhost:3000/.well-known/jwks.json`

Ou acessá-lo em seu navegador
<br>

# Observações
- Deixei as chaves assimétricas disponíveis para melhor vizualização do funcionamento para quem nunca utilizou na pasta `certs`
- O método que utilizei para criar a `JWK` está em `src/utils/JwkUtils`, foi o método mais simples que consegui achar para realizar.
- Deixei scripts personalizados no projeto para melhor utilização do `Docker`, podem ser observados no `package.json`
