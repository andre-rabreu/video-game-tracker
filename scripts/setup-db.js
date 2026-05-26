/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const RDS_SECRET_ARN = process.env.AWS_SECRET_ARN;
const RDS_HOST = process.env.DB_HOST;
const RDS_PORT = Number(process.env.DB_PORT || 3306);
const DB_NAME = 'tracker_db';

if (!RDS_SECRET_ARN) {
  throw new Error('AWS_SECRET_ARN não definido');
}
if (!RDS_HOST) {
  throw new Error('DB_HOST não definido');
}

async function main() {
  const sm = new SecretsManagerClient({ region: AWS_REGION });
  const res = await sm.send(new GetSecretValueCommand({ SecretId: RDS_SECRET_ARN }));
  if (!res.SecretString) throw new Error('Segredo sem SecretString');
  const { username, password } = JSON.parse(res.SecretString);

  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  const conn = await mysql.createConnection({
    host: RDS_HOST,
    port: RDS_PORT,
    user: username,
    password,
    database: DB_NAME,
    multipleStatements: true,
  });

  try {
    await conn.query(sql);
    console.log('OK: tabelas criadas');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('ERRO:', err);
  process.exit(1);
});
