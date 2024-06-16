# Use a imagem oficial do Node.js
FROM node:current-alpine

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app/src

# Copie o arquivo package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências
RUN npm ci --production

# Copie os arquivos do código-fonte para o diretório de trabalho
COPY dist/ dist
COPY certs/ certs

# Exponha a porta do aplicativo (ajuste conforme necessário)
EXPOSE 3000

# Comando para iniciar o aplicativo quando o contêiner for iniciado
CMD ["npm", "start"]