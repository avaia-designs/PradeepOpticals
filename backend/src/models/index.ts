/**
 * Model exports
 * Centralized export of all Mongoose models
 */
export { User } from './User';
export type { IUser, IUserDocument } from './User';
export { UserRole } from '../types';

export { Product } from './Product';
export type { IProduct, IProductDocument } from './Product';

export { Category } from './Category';
export type { ICategory, ICategoryDocument } from './Category';

export { Brand } from './Brand';
export type { IBrand, IBrandDocument } from './Brand';

export { Order, OrderStatus } from './Order';
export type { IOrder, IOrderDocument, IOrderItem, IShippingAddress } from './Order';

export { Appointment, AppointmentStatus } from './Appointment';
export type { IAppointment, IAppointmentDocument } from './Appointment';

export { Quotation, QuotationStatus } from './Quotation';
export type { IQuotation, IQuotationDocument, IQuotationItem } from './Quotation';

export { ShopSettings } from './ShopSettings';
export type { IShopSettings, IShopSettingsDocument } from './ShopSettings';

export { Notification, NotificationType, NotificationPriority } from './Notification';
export type { INotification, INotificationDocument } from './Notification';
