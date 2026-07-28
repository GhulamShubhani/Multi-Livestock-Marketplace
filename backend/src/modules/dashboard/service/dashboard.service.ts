import { Types } from 'mongoose';
import { OrderModel } from '../../order/model/order.model';
import { PaymentModel } from '../../payment/model/payment.model';
import { CatModel } from '../../cat/model/cat.model';
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
    const customerRole = await RoleModel.findOne({ name: ROLES.CUSTOMER }).select('_id').lean().exec();

    const [
      usersTotal,
      customersTotal,
      catsAvailable,
      catsReserved,
      catsSold,
      ordersTotal,
      ordersPending,
      revenueAgg,
      paymentsSucceeded,
      reviewsPending,
      recentOrders,
      salesByDay,
    ] = await Promise.all([
      UserModel.countDocuments().exec(),
      customerRole
        ? UserModel.countDocuments({ role: customerRole._id as Types.ObjectId }).exec()
        : Promise.resolve(0),
      CatModel.countDocuments({ status: 'available' }).exec(),
      CatModel.countDocuments({ status: 'reserved' }).exec(),
      CatModel.countDocuments({ status: 'sold' }).exec(),
      OrderModel.countDocuments().exec(),
      OrderModel.countDocuments({ status: 'pending' }).exec(),
      OrderModel.aggregate<{ total: number; count: number }>([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]).exec(),
      PaymentModel.countDocuments({ status: 'succeeded' }).exec(),
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
        catsAvailable,
        catsReserved,
        catsSold,
        ordersTotal,
        ordersPending,
        paidOrders: revenueAgg[0]?.count ?? 0,
        revenueCents: revenueAgg[0]?.total ?? 0,
        paymentsSucceeded,
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
    const [byStatus, lowStock, featured] = await Promise.all([
      CatModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).exec(),
      CatModel.find({ stock: { $lte: 1 }, status: { $in: ['available', 'reserved'] } })
        .select('name slug stock status price')
        .sort({ stock: 1 })
        .limit(20)
        .lean()
        .exec(),
      CatModel.countDocuments({ featured: true, status: 'available' }).exec(),
    ]);

    return {
      byStatus: byStatus.map((d) => ({ status: d._id as string, count: d.count as number })),
      lowStock,
      featuredAvailable: featured,
    };
  }
}

export const dashboardService = new DashboardService();
