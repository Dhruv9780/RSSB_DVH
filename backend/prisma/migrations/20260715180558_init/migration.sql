-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SECURITY_SEWADAR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FoundItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemCode" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "color" TEXT,
    "locationFoundId" INTEGER NOT NULL,
    "foundAt" DATETIME NOT NULL,
    "storageLocation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STORED',
    "createdById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FoundItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FoundItem_locationFoundId_fkey" FOREIGN KEY ("locationFoundId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FoundItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FoundItemImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "foundItemId" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoundItemImage_foundItemId_fkey" FOREIGN KEY ("foundItemId") REFERENCES "FoundItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LostReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportCode" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "categoryId" INTEGER,
    "brand" TEXT,
    "color" TEXT,
    "description" TEXT,
    "specialIdentification" TEXT,
    "approximateValue" DECIMAL,
    "locationLostId" INTEGER,
    "lostAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "photoPath" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LostReport_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LostReport_locationLostId_fkey" FOREIGN KEY ("locationLostId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LostReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReturnHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "foundItemId" INTEGER NOT NULL,
    "lostReportId" INTEGER,
    "returnedTo" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "identityVerified" BOOLEAN NOT NULL,
    "returnedById" INTEGER NOT NULL,
    "returnedAt" DATETIME NOT NULL,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReturnHistory_foundItemId_fkey" FOREIGN KEY ("foundItemId") REFERENCES "FoundItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReturnHistory_lostReportId_fkey" FOREIGN KEY ("lostReportId") REFERENCES "LostReport" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReturnHistory_returnedById_fkey" FOREIGN KEY ("returnedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
CREATE INDEX "ReturnHistory_foundItemId_idx" ON "ReturnHistory"("foundItemId");

-- CreateIndex
CREATE INDEX "ReturnHistory_lostReportId_idx" ON "ReturnHistory"("lostReportId");

-- CreateIndex
CREATE INDEX "ReturnHistory_returnedAt_idx" ON "ReturnHistory"("returnedAt");

-- CreateIndex
CREATE INDEX "ActivityLog_action_entity_idx" ON "ActivityLog"("action", "entity");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
