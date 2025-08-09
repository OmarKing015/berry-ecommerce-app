// This is a placeholder for the real order fetching logic.
// It returns mock data because we don't have user authentication yet.

export async function getMyOrders(userId: string | null) {
  console.log(`Fetching orders for user: ${userId}`);

  // In a real app, you would fetch from Sanity here.
  // For now, return mock data after a short delay.

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          _id: 'order1',
          orderId: 'XYZ-12345',
          customerName: 'John Doe',
          totalAmount: 250.00,
          paymentStatus: 'Paid',
          orderStatus: 'Shipped',
          createdAt: new Date('2023-10-26T10:00:00Z').toISOString(),
          items: [
            { quantity: 1, price: 250.00, product: { _id: 'prod1', name: 'Classic T-Shirt', image: null } },
          ],
        },
        {
          _id: 'order2',
          orderId: 'ABC-67890',
          customerName: 'John Doe',
          totalAmount: 450.50,
          paymentStatus: 'Paid',
          orderStatus: 'Processing',
          createdAt: new Date('2023-10-28T14:30:00Z').toISOString(),
          items: [
            { quantity: 2, price: 225.25, product: { _id: 'prod2', name: 'Premium Hoodie', image: null } },
          ],
        },
      ]);
    }, 1000); // Simulate network delay
  });
}
