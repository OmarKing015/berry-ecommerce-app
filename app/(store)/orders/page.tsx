import { auth } from "@clerk/nextjs/server";
import { getMyOrders } from "@/sanity/lib/orders/getMyOrders";
import { redirect } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Banknote,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Filter,
  Eye,
  Download,
} from "lucide-react";
import { imageUrl } from "@/lib/imageUrl";
import Image from "next/image";

async function OrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const orders = await getMyOrders(userId);

  // Group orders by status
  const groupedOrders = orders.reduce((acc: any, order: any) => {
    const status = order.orderStatus;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(order);
    return acc;
  }, {});

  const statusOrder = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const sortedStatuses = statusOrder.filter((status) => groupedOrders[status]);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        color: "border-l-yellow-500 bg-yellow-50",
        icon: Clock,
        textColor: "text-yellow-700",
      },
      confirmed: {
        color: "border-l-blue-500 bg-blue-50",
        icon: CheckCircle,
        textColor: "text-blue-700",
      },
      processing: {
        color: "border-l-purple-500 bg-purple-50",
        icon: Package,
        textColor: "text-purple-700",
      },
      shipped: {
        color: "border-l-indigo-500 bg-indigo-50",
        icon: Truck,
        textColor: "text-indigo-700",
      },
      delivered: {
        color: "border-l-green-500 bg-green-50",
        icon: CheckCircle,
        textColor: "text-green-700",
      },
      cancelled: {
        color: "border-l-red-500 bg-red-50",
        icon: XCircle,
        textColor: "text-red-700",
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges = {
      completed: "bg-green-600 text-white",
      pending: "bg-yellow-600 text-white",
      cod_pending: "bg-orange-600 text-white",
      failed: "bg-red-600 text-white",
    };
    return badges[status as keyof typeof badges] || "bg-gray-600 text-white";
  };

  const calculateOrderStats = () => {
    const total = orders.length;
    const completed = orders.filter(
      (o: any) => o.orderStatus === "delivered"
    ).length;
    const pending = orders.filter((o: any) =>
      ["pending", "confirmed", "processing"].includes(o.orderStatus)
    ).length;
    const totalValue = orders.reduce(
      (sum: number, order: any) => sum + order.totalAmount,
      0
    );

    return { total, completed, pending, totalValue };
  };

  const stats = calculateOrderStats();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Track and manage all your orders
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShoppingBag className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Orders
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.total}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Completed
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.completed}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          In Progress
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.pending}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Value
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalValue.toFixed(2)} EGP
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No orders
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by placing your first order.
            </p>
            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Start Shopping
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedStatuses.map((status) => {
              const config = getStatusConfig(status);
              const StatusIcon = config.icon;

              return (
                <div key={status}>
                  <div className="flex items-center mb-4">
                    <StatusIcon
                      className={`h-5 w-5 ${config.textColor} mr-2`}
                    />
                    <h2
                      className={`text-lg font-medium ${config.textColor} capitalize`}
                    >
                      {status.replace("_", " ")} ({groupedOrders[status].length}
                      )
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {groupedOrders[status].map((order: any) => (
                      <div
                        key={order._id}
                        className={`bg-white border-l-4 ${config.color} shadow-sm`}
                      >
                        <div className="px-6 py-4">
                          {/* Order Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-900">
                                  {order.orderId}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {order.paymentMethod === "cod" ? (
                                  <Banknote className="h-4 w-4 text-green-600" />
                                ) : (
                                  <CreditCard className="h-4 w-4 text-blue-600" />
                                )}
                                <span className="text-xs text-gray-600">
                                  {order.paymentMethod === "cod"
                                    ? "COD"
                                    : "Card"}
                                </span>
                              </div>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusBadge(
                                  order.paymentStatus
                                )}`}
                              >
                                {order.paymentStatus
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-lg font-bold text-gray-900">
                                {order.totalAmount.toFixed(2)} EGP
                              </span>
                              <button className="text-gray-400 hover:text-gray-600">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Order Content */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Customer Info */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                Customer
                              </h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center">
                                  <User className="h-3 w-3 mr-2" />
                                  {order.customerName}
                                </div>
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 mr-2" />
                                  {order.customerEmail}
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-2" />
                                  {order.customerPhone}
                                </div>
                              </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                Shipping
                              </h4>
                              {order.shippingAddress && (
                                <div className="text-sm text-gray-600">
                                  <div className="flex items-start">
                                    <MapPin className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p>{order.shippingAddress.street}</p>
                                      <p>
                                        {order.shippingAddress.city},{" "}
                                        {order.shippingAddress.country}{" "}
                                        {order.shippingAddress.postalCode}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                Items ({order.items?.length || 0})
                              </h4>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {order.items?.map(
                                  (item: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-3"
                                    >
                                      <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0">
                                        {item.product?.image ? (
                                          <Image
                                            src={
                                              imageUrl(
                                                item.product.image
                                              ).url() || "/placeholder.svg"
                                            }
                                            alt={item.product.name || "Product"}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover rounded"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                            <Package className="h-3 w-3 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-900 truncate">
                                          {item.product?.name || "Product"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {item.quantity} ×{" "}
                                          {item.price.toFixed(2)} EGP
                                        </p>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>

                          {/* COD Notice */}
                          {order.paymentMethod === "cod" &&
                            order.orderStatus === "confirmed" && (
                              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                <div className="flex">
                                  <Banknote className="h-4 w-4 text-amber-400 mt-0.5" />
                                  <div className="ml-3">
                                    <p className="text-xs font-medium text-amber-800">
                                      Cash on Delivery
                                    </p>
                                    <p className="text-xs text-amber-700 mt-1">
                                      Payment of {order.totalAmount.toFixed(2)}{" "}
                                      EGP due upon delivery
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
