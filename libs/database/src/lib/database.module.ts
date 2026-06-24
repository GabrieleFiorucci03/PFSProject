import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';

/**
 * Legge una variabile d'ambiente obbligatoria; se manca interrompe l'avvio con
 * un errore chiaro, invece di proseguire con una configurazione DB incompleta.
 */
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Variabile d'ambiente obbligatoria mancante: ${name}`);
  return v;
}

/**
 * Modulo di accesso al database. Configura la connessione TypeORM a PostgreSQL
 * leggendo i parametri dal `.env`. `autoLoadEntities` registra automaticamente le
 * entità dichiarate dai feature module; `synchronize: true` allinea lo schema al
 * codice all'avvio (comodo in sviluppo, da NON usare in produzione).
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: requireEnv('PG_HOST'),
      port: Number(requireEnv('PG_PORT')),
      username: requireEnv('PG_USERNAME'),
      password: requireEnv('PG_PASSWORD'),
      database: requireEnv('PG_DATABASE'),
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
