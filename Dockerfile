# Use a imagem oficial do Node.js
FROM node:14-alpine

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /

# Copie o arquivo package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie os arquivos do código-fonte para o diretório de trabalho
COPY . .

# Execute o script de construção
RUN npm run build

# Exponha a porta do aplicativo (ajuste conforme necessário)
EXPOSE 3000

# Comando para iniciar o aplicativo quando o contêiner for iniciado
CMD ["npm", "start"]