import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProduct1757850276898 implements MigrationInterface {
    name = 'AddProduct1757850276898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL, CONSTRAINT "PK_0806c755e04a9e12b9b2b9b2b9b2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
