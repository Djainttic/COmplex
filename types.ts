// types.ts

// Notifications
export enum NotificationType {
  NewReservation = 'new_reservation',
  OverdueInvoice = 'overdue_invoice',
  UpcomingCheckIn = 'upcoming_checkin',
  MaintenanceAssigned = 'maintenance_assigned',
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string; // ISO date string
  isRead: boolean;
  relatedId?: string; // e.g., reservationId, invoiceId
}


// Permissions & Roles
export type Permission =
  | 'bungalows:read'
  | 'bungalows:create'
  | 'bungalows:update'
  | 'bungalows:update_status'
  | 'bungalows:delete'
  | 'reservations:read'
  | 'reservations:write'
  | 'clients:read'
  | 'clients:write'
  | 'maintenance:read'
  | 'maintenance:write'
  | 'reports:read'
  | 'reports:write'
  | 'users:read'
  | 'users:write'
  | 'settings:read'
  | 'settings:write'
  | 'billing:read'
  | 'billing:write';

export enum UserRole {
  Admin = 'Administrateur',
  Manager = 'Manager',
  Employee = 'Employé',
}

export type RolePermissions = Partial<Record<Permission, boolean>>;

export interface RoleSetting {
    roleName: UserRole;
    permissions: RolePermissions;
}

export enum UserStatus {
    Active = 'Actif',
    Inactive = 'Inactif',
    PendingActivation = 'En attente d\'activation',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  lastLogin: string; // ISO date string
  isOnline: boolean;
}

// Bungalows
export enum BungalowStatus {
  Available = 'Disponible',
  Occupied = 'Occupé',
  Cleaning = 'Nettoyage',
  Maintenance = 'Maintenance',
}

export enum BungalowType {
  Standard = 'Standard',
  Deluxe = 'Deluxe',
  Suite = 'Suite',
  Family = 'Familial',
}

export interface Bungalow {
  id: string;
  name:string;
  type: BungalowType;
  status: BungalowStatus;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  imageUrl: string;
  description: string;
}

// Clients
export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    registrationDate: string; // ISO date string
    loyaltyPoints: number;
}

// Reservations
export enum ReservationStatus {
    Confirmed = 'Confirmée',
    Pending = 'En attente',
    Cancelled = 'Annulée',
}

export interface Reservation {
    id: string;
    bungalowId: string;
    clientId: string;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    status: ReservationStatus;
    totalPrice: number;
}


// Invoices
export enum InvoiceStatus {
    Paid = 'Payée',
    Unpaid = 'Non payée',
    Overdue = 'En retard',
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: string;
    reservationId: string;
    clientId: string;
    issueDate: string; // ISO date string
    dueDate: string; // ISO date string
    totalAmount: number;
    status: InvoiceStatus;
    items: InvoiceItem[];
}

// Maintenance
export enum MaintenanceStatus {
    Pending = 'En attente',
    InProgress = 'En cours',
    Resolved = 'Résolu',
    Cancelled = 'Annulé',
}

export enum MaintenancePriority {
    Low = 'Basse',
    Medium = 'Moyenne',
    High = 'Haute',
}

export interface MaintenanceRequest {
    id: string;
    bungalowId: string;
    description: string;
    status: MaintenanceStatus;
    priority: MaintenancePriority;
    reportedBy: string; // Can be a user ID or a client name string
    assignedToId?: string; // User ID
    createdDate: string; // ISO date string
    resolvedDate?: string; // ISO date string
    resolutionDetails?: string;
}


// Settings
export enum Currency {
    DZD = 'DZD',
    EUR = 'EUR',
    USD = 'USD',
}

export interface FiscalInfo {
    NIF: string;
    NIS: string;
    RC: string;
    AI: string;
}

// Pricing Rules
export enum PricingAdjustmentType {
    PercentageDiscount = 'percentage_discount',
    FixedDiscount = 'fixed_discount',
    PercentageIncrease = 'percentage_increase',
    FixedIncrease = 'fixed_increase',
    SetPrice = 'set_price',
}

export interface PricingRule {
  id: string;
  name: string;
  adjustmentType: PricingAdjustmentType;
  value: number;
  daysOfWeek?: number[]; // 0 for Sunday, ..., 6 for Saturday
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  bungalowTypeIds: string[]; // Array of bungalow type IDs. Empty array means applies to all.
}

export interface FinancialSettings {
    currency: Currency;
    fiscalInfo: FiscalInfo;
    pricingRules: PricingRule[];
}

export interface AmenitySetting {
    id: string;
    name: string;
}

export interface BungalowTypeSetting {
    id: string;
    name: string;
    capacity: number;
    defaultPrice: number;
    amenities: string[];
    description: string;
}

export interface BungalowSettings {
    types: BungalowTypeSetting[];
    allAmenities: AmenitySetting[];
}

export interface LoyaltySettings {
    enabled: boolean;
    pointsPerNight: number;
    pointsForFirstReservation: number;
}

export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
}

export interface SecuritySettings {
    passwordPolicy: PasswordPolicy;
    twoFactorAuth: {
        enforced: boolean;
    };
}

export interface Settings {
    general: {
        complexName: string;
        logoUrl: string;
        bungalowCount: number;
    };
    financial: FinancialSettings;
    bungalows: BungalowSettings;
    security: SecuritySettings;
    roles: RoleSetting[];
    loyalty: LoyaltySettings;
}

// Audit Logs
export interface AuditLog {
  id: string;
  user: {
    id: string;
    name: string;
  };
  action: string;
  timestamp: string; // ISO date string
  details?: string;
}