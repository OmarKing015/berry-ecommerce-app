import { MongoClient } from 'mongodb';
import { backendClient } from '../sanity/lib/backendClient';
import type { Logo, ColorSwatch } from '@/lib/models';

const uri = process.env.MONGODB_API_KEY || '';

async function migrateImages() {
  console.log('Starting image migration to Sanity...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ZSHIRT');

    // Migrate Logos
    console.log('Migrating logos...');
    const logosCollection = db.collection<Logo>('logos');
    const logos = await logosCollection.find({}).toArray();

    for (const logo of logos) {
      const existing = await backendClient.fetch(`*[_type == "logo" && name == $name][0]`, { name: logo.name });
      if (existing) {
        console.log(`Logo "${logo.name}" already exists in Sanity. Skipping.`);
        continue;
      }

      console.log(`Migrating logo: ${logo.name}`);
      const imageAsset = await backendClient.assets.upload('image', logo.fileData.buffer, {
        filename: logo.fileName,
        contentType: logo.contentType,
      });

      await backendClient.create({
        _type: 'logo',
        name: logo.name,
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id,
          },
        },
      });
      console.log(`Successfully migrated logo: ${logo.name}`);
    }

    // Migrate Color Swatches
    console.log('Migrating color swatches...');
    const colorSwatchesCollection = db.collection<ColorSwatch>('colorSwatches');
    const swatches = await colorSwatchesCollection.find({}).toArray();

    for (const swatch of swatches) {
      const existing = await backendClient.fetch(`*[_type == "colorSwatch" && name == $name][0]`, { name: swatch.name });
      if (existing) {
        console.log(`Color swatch "${swatch.name}" already exists in Sanity. Skipping.`);
        continue;
      }

      console.log(`Migrating color swatch: ${swatch.name}`);
      const imageAsset = await backendClient.assets.upload('image', swatch.fileData.buffer, {
        filename: swatch.fileName,
        contentType: swatch.contentType,
      });

      await backendClient.create({
        _type: 'colorSwatch',
        name: swatch.name,
        hexCode: swatch.hexCode,
        category: swatch.style,
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id,
          },
        },
      });
      console.log(`Successfully migrated color swatch: ${swatch.name}`);
    }

    console.log('Image migration completed successfully.');
  } catch (error) {
    console.error('An error occurred during image migration:', error);
  } finally {
    await client.close();
  }
}

migrateImages();
