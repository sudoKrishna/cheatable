-- CreateEnum
CREATE TYPE "SandboxStatus" AS ENUM ('idle', 'creating', 'running', 'error', 'stopped');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "previewUrl" TEXT,
ADD COLUMN     "sandboxId" TEXT,
ADD COLUMN     "sandboxStatus" "SandboxStatus" NOT NULL DEFAULT 'idle';
