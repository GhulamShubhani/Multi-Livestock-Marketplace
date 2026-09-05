import { Types } from 'mongoose';
import { OrderModel } from '../../order/model/order.model';
import { PaymentModel } from '../../payment/model/payment.model';
import { ListingModel } from '../../listing/model/listing.model';
import { UserModel } from '../../user/model/user.model';
import { ReviewModel } from '../../review/model/review.model';
import { RoleModel } from '../../role/model/role.model';
import { ROLES } from '../../../constants/auth';

function startOfDaysAgo(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

export class DashboardService {
  async overview() {
    const since30 = startOfDaysAgo(30);
    const [customerRole, buyerRole] = await Promise.all([
      RoleModel.findOne({ name: ROLES.CUSTOMER }).select('_id').lean().exec(),
      RoleModel.findOne({ name: ROLES.BUYER }).select('_id').lean().exec(),
    ]);
    const buyerRoleIds = [customerRole?._id, buyerRole?._id].filter(Boolean) as Types.ObjectId[];

    const [
      usersTotal,
      customersTotal,
      listingsAvailable,
      listingsReserved,
      listingsSold,
      ordersTotal,
      ordersPending,
      revenueAgg,
      paymentsVerified,
      reviewsPending,
      recentOrders,
      salesByDay,
    ] = await Promise.all([
      UserModel.countDocuments().exec(),
      buyerRoleIds.length
        ? UserModel.countDocuments({ role: { $in: buyerRoleIds } }).exec()
        : Promise.resolve(0),
      ListingModel.countDocuments({ availabilityStatus: 'available', isActive: true }).exec(),
      ListingModel.countDocuments({ availabilityStatus: 'reserved' }).exec(),
      ListingModel.countDocuments({ availabilityStatus: 'sold' }).exec(),
      OrderModel.countDocuments().exec(),
      OrderModel.countDocuments({ status: 'pending' }).exec(),
      OrderModel.aggregate<{ total: number; count: number }>([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]).exec(),
      PaymentModel.countDocuments({ status: 'verified' }).exec(),
      ReviewModel.countDocuments({ status: 'pending' }).exec(),
      OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select('orderNumber total status paymentStatus createdAt user currency')
        .populate('user', 'email firstName lastName')
        .lean()
        .exec(),
      OrderModel.aggregate<{ _id: string; revenue: number; orders: number }>([
        {
          $match: {
            paymentStatus: 'paid',
            paidAt: { $gte: since30 },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]).exec(),
    ]);

    return {
      cards: {
        usersTotal,
        customersTotal,
        listingsAvailable,
        listingsReserved,
        listingsSold,
        ordersTotal,
        ordersPending,
        paidOrders: revenueAgg[0]?.count ?? 0,
        revenueCents: revenueAgg[0]?.total ?? 0,
        paymentsVerified,
        reviewsPending,
      },
      salesLast30Days: salesByDay.map((d) => ({
        date: d._id,
        revenueCents: d.revenue,
        orders: d.orders,
      })),
      recentOrders,
    };
  }

  async sales(query: Record<string, unknown>) {
    const days = Math.min(90, Math.max(1, Number(query.days) || 30));
    const since = startOfDaysAgo(days);

    const [byDay, byStatus] = await Promise.all([
      OrderModel.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 },
            revenueCents: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]).exec(),
      OrderModel.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).exec(),
    ]);

    return {
      days,
      byDay: byDay.map((d) => ({
        date: d._id as string,
        orders: d.orders as number,
        revenueCents: d.revenueCents as number,
      })),
      byStatus: byStatus.map((d) => ({ status: d._id as string, count: d.count as number })),
    };
  }

  async inventory() {
    const [byStatus, reserved, featured] = await Promise.all([
      ListingModel.aggregate([
        { $group: { _id: '$availabilityStatus', count: { $sum: 1 } } },
      ]).exec(),
      ListingModel.find({ availabilityStatus: 'reserved' })
        .select('title slug listingId availabilityStatus price')
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean()
        .exec(),
      ListingModel.countDocuments({ featured: true, availabilityStatus: 'available' }).exec(),
    ]);

    return {
      byStatus: byStatus.map((d) => ({ status: d._id as string, count: d.count as number })),
      reserved,
      featuredAvailable: featured,
    };
  }
}

export const dashboardService = new DashboardService();
