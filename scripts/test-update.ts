import dotenv from 'dotenv';
import handler from '../api/update-results';

// Carrega as variáveis do arquivo .env local
dotenv.config();

// Mocks simples para Request e Response do Express
const mockReq = {
  method: 'GET',
  query: {
    secret: process.env.CRON_SECRET
  },
  headers: {}
} as any;

const mockRes = {
  status(statusCode: number) {
    console.log(`\n[Status Code]: ${statusCode}`);
    return this;
  },
  json(data: any) {
    console.log('[Resposta JSON]:');
    console.log(JSON.stringify(data, null, 2));
    return this;
  }
} as any;

async function runLocalSync() {
  console.log('----------------------------------------------------');
  console.log('Iniciando Teste Local de Atualização dos Resultados');
  console.log('----------------------------------------------------');
  console.log(`CRON_SECRET utilizado: ${process.env.CRON_SECRET ? '***' + process.env.CRON_SECRET.slice(-4) : 'Não definido'}`);
  console.log(`API_KEY utilizada: ${process.env.API_KEY ? '***' + process.env.API_KEY.slice(-4) : 'Não definida'}`);
  
  try {
    await handler(mockReq, mockRes);
  } catch (error) {
    console.error('Falha crítica na execução do script:', error);
  }
  console.log('----------------------------------------------------');
}

runLocalSync();
