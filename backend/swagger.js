import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "To-Do List Node.js e MongoDB API",
    description:
      "Laboratório de Desenvolvimento Web - Documentação da API com Swagger",
  },
  host: "localhost:5000",
  basePath: "/",
};

// Nome do arquivo que será gerado automaticamente
const outputFile = "./swagger-output.json";
// Caminho para as rotas
const routesFile = ["./index.js"];

swaggerAutogen()(outputFile, routesFile, doc);
