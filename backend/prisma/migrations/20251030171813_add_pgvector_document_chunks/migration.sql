-- CreateExtension (skip if already exists or no permissions)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Extension vector already exists or insufficient privileges';
    WHEN duplicate_object THEN
        RAISE NOTICE 'Extension vector already exists';
END
$$;

-- CreateTable (only if not exists)
CREATE TABLE IF NOT EXISTS "DocumentChunk" (
    "id" SERIAL NOT NULL,
    "document_name" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(768),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'DocumentChunk' 
        AND indexname = 'DocumentChunk_embedding_idx'
    ) THEN
        CREATE INDEX "DocumentChunk_embedding_idx" ON "DocumentChunk" USING ivfflat ("embedding" vector_cosine_ops);
    END IF;
END
$$;

-- CreateIndex (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'DocumentChunk' 
        AND indexname = 'DocumentChunk_document_name_idx'
    ) THEN
        CREATE INDEX "DocumentChunk_document_name_idx" ON "DocumentChunk"("document_name");
    END IF;
END
$$;