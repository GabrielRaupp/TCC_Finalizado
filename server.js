require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Adicionado para permitir requisições de outras origens
const app = express();
const port = process.env.PORT || 3000;

// Middleware para habilitar CORS
app.use(cors());

// Verificação das variáveis de ambiente
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('Erro: Variáveis de ambiente do banco de dados não configuradas corretamente.');
    process.exit(1); // Encerra o servidor se as variáveis estiverem ausentes
}

// Configuração do banco de dados
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Conectar ao banco de dados
db.connect(err => {
    if (err) {
        console.error('Erro ao conectar no banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados');
});

// Rota para puxar dados de telemetria
app.get('/api/telemetria', (req, res) => {
    const query = `
        SELECT temperatura AS temp, pressao AS pressure, umidade AS humidity, ambiente, caixa9, caixa10, caixa12, timestamp 
        FROM telemetria
        ORDER BY timestamp DESC 
        LIMIT 100;  // Limite de 100 registros para evitar sobrecarga
    `;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Erro ao executar a consulta:', error);
            return res.status(500).json({ error: 'Erro ao puxar dados de telemetria' });
        }
        res.json(results);
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
