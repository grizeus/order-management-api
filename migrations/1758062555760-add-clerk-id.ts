import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClerkUserIdToUser1758062555760 implements MigrationInterface {
    name = 'AddClerkUserIdToUser1758062555760'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "clerkUserId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_0ced357925bad448df72c2b88f7" UNIQUE ("clerkUserId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_0ced357925bad448df72c2b88f7"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "clerkUserId"`);
    }

}
