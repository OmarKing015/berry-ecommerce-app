import { backendClient } from '../sanity/lib/backendClient';

async function migrateProductSizes() {
  console.log('Starting product size migration...');

  try {
    const productsToMigrate = await backendClient.fetch(
      `*[_type == "product" && defined(size) && count(sizes) == 0]`
    );

    if (!productsToMigrate || productsToMigrate.length === 0) {
      console.log('No products to migrate.');
      return;
    }

    console.log(`Found ${productsToMigrate.length} products to migrate.`);

    for (const product of productsToMigrate) {
      console.log(`Migrating product: ${product.name} (_id: ${product._id})`);

      const newSizes = product.size.map((s: string) => ({
        _key: Math.random().toString(36).substring(2, 15), // Generate a random key
        size: s,
        stock: 2,
      }));

      const totalStock = newSizes.reduce((acc: number, curr: any) => acc + curr.stock, 0);

      const patch = backendClient
        .patch(product._id)
        .set({ sizes: newSizes, stock: totalStock })
        .unset(['size']);

      await patch.commit();

      console.log(`Successfully migrated product: ${product.name}`);
    }

    console.log('Product size migration completed successfully.');
  } catch (error) {
    console.error('An error occurred during product size migration:', error);
  }
}

migrateProductSizes();
