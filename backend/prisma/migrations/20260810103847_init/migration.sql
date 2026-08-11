-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SECURITY_SEWADAR', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "FoundItemStatus" AS ENUM ('STORED', 'CLAIMED', 'RETURNED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LostReportStatus" AS ENUM ('OPEN', 'MATCHED', 'RETURNED', 'CLOSED');

-- CreateEnum
CREATE TYPE "IncidentPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SECURITY_SEWADAR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoundItem" (
    "id" SERIAL NOT NULL,
    "itemCode" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "color" TEXT,
    "locationFoundId" INTEGER NOT NULL,
    "foundAt" TIMESTAMP(3) NOT NULL,
    "storageLocation" TEXT NOT NULL,
    "status" "FoundItemStatus" NOT NULL DEFAULT 'STORED',
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoundItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoundItemImage" (
    "id" SERIAL NOT NULL,
    "foundItemId" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoundItemImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostReport" (
    "id" SERIAL NOT NULL,
    "reportCode" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "categoryId" INTEGER,
    "brand" TEXT,
    "color" TEXT,
    "description" TEXT,
    "specialIdentification" TEXT,
    "approximateValue" DECIMAL(65,30),
    "locationLostId" INTEGER,
    "lostAt" TIMESTAMP(3) NOT NULL,
    "status" "LostReportStatus" NOT NULL DEFAULT 'OPEN',
    "photoPath" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LostReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" SERIAL NOT NULL,
    "incidentCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" INTEGER,
    "priority" "IncidentPriority" NOT NULL DEFAULT 'MEDIUM',
    "location" TEXT NOT NULL,
    "incidentAt" TIMESTAMP(3) NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterContact" TEXT NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnHistory" (
    "id" SERIAL NOT NULL,
    "foundItemId" INTEGER NOT NULL,
    "lostReportId" INTEGER,
    "returnedTo" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "identityVerified" BOOLEAN NOT NULL,
    "returnedById" INTEGER NOT NULL,
    "returnedAt" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FoundItem_itemCode_key" ON "FoundItem"("itemCode");

-- CreateIndex
CREATE INDEX "FoundItem_itemName_brand_color_status_idx" ON "FoundItem"("itemName", "brand", "color", "status");

-- CreateIndex
CREATE INDEX "FoundItem_categoryId_status_idx" ON "FoundItem"("categoryId", "status");

-- CreateIndex
CREATE INDEX "FoundItem_foundAt_idx" ON "FoundItem"("foundAt");

-- CreateIndex
CREATE INDEX "FoundItemImage_foundItemId_idx" ON "FoundItemImage"("foundItemId");

-- CreateIndex
CREATE UNIQUE INDEX "LostReport_reportCode_key" ON "LostReport"("reportCode");

-- CreateIndex
CREATE INDEX "LostReport_itemName_brand_color_status_idx" ON "LostReport"("itemName", "brand", "color", "status");

-- CreateIndex
CREATE INDEX "LostReport_phoneNumber_idx" ON "LostReport"("phoneNumber");

-- CreateIndex
CREATE INDEX "LostReport_lostAt_idx" ON "LostReport"("lostAt");

-- CreateIndex
CREATE UNIQUE INDEX "Incident_incidentCode_key" ON "Incident"("incidentCode");

-- CreateIndex
CREATE INDEX "Incident_status_priority_idx" ON "Incident"("status", "priority");

-- CreateIndex
CREATE INDEX "Incident_incidentAt_idx" ON "Incident"("incidentAt");

-- CreateIndex
CREATE INDEX "Incident_categoryId_idx" ON "Incident"("categoryId");

-- CreateIndex
CREATE INDEX "Incident_createdById_idx" ON "Incident"("createdById");

-- CreateIndex
CREATE INDEX "ReturnHistory_foundItemId_idx" ON "ReturnHistory"("foundItemId");

-- CreateIndex
CREATE INDEX "ReturnHistory_lostReportId_idx" ON "ReturnHistory"("lostReportId");

-- CreateIndex
CREATE INDEX "ReturnHistory_returnedAt_idx" ON "ReturnHistory"("returnedAt");

-- CreateIndex
CREATE INDEX "ActivityLog_action_entity_idx" ON "ActivityLog"("action", "entity");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "FoundItem" ADD CONSTRAINT "FoundItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoundItem" ADD CONSTRAINT "FoundItem_locationFoundId_fkey" FOREIGN KEY ("locationFoundId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoundItem" ADD CONSTRAINT "FoundItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoundItemImage" ADD CONSTRAINT "FoundItemImage_foundItemId_fkey" FOREIGN KEY ("foundItemId") REFERENCES "FoundItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostReport" ADD CONSTRAINT "LostReport_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostReport" ADD CONSTRAINT "LostReport_locationLostId_fkey" FOREIGN KEY ("locationLostId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostReport" ADD CONSTRAINT "LostReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnHistory" ADD CONSTRAINT "ReturnHistory_foundItemId_fkey" FOREIGN KEY ("foundItemId") REFERENCES "FoundItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnHistory" ADD CONSTRAINT "ReturnHistory_lostReportId_fkey" FOREIGN KEY ("lostReportId") REFERENCES "LostReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnHistory" ADD CONSTRAINT "ReturnHistory_returnedById_fkey" FOREIGN KEY ("returnedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
