import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { PacientesModule } from './pacientes/pacientes.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // Aquí se generará el esquema automáticamente
    }),


    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // Cambia esto si tu usuario en DBeaver es otro
      password: '12345', // <--- ¡PON TU CONTRASEÑA AQUÍ!
      database: 'pacientes_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Buscará nuestras tablas automáticamente
      synchronize: true,
    }),


    PacientesModule,
  ],
})
export class AppModule {}
