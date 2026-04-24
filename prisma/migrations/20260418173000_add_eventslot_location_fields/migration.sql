ALTER TABLE "EventSlot"
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "placeName" TEXT,
  ADD COLUMN "formattedAddress" TEXT,
  ADD COLUMN "googleMapsUrl" TEXT;
