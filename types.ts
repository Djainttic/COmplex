// types.ts

export type Permission = 
  | 'bungalows:read' | 'bungalows:create' | 'bungalows:update' | 'bungalows:delete' | 'bungalows:update_status'
  | 'reservations:read' | 'reservations:write'
  | 'clients:read' | 'clients:write'
  | 'billing:read' | 'billing:write'
  | 'loyalty:read' | 'loyalty:write'
  | 'communication:read' | 'communication:write'
  | 'maintenance:read' | 'maintenance:write'
  | 'reports:read' | 'reports:write'
  | 'users:read' | 'users:write'
  | 'settings:read' | 'settings:write';

export enum UserRole {
    SuperAdmin = 'Super Administrateur',
    Admin = 'Administrateur',
    Manager = 'Manager',
    Employee = 'Employé'
}

export enum UserStatus {
    Active = 'Actif',
    Inactive = 'Inactif',
    PendingActivation = 'En attente'
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    status: UserStatus;
    avatarUrl: string;
    lastLogin: string;
    isOnline: boolean;
    permissions: Permission[];
}

export interface GeneralSettings {
    complexName: string;
    logoUrl: string;
    bungalowCount: number;
    loginImageUrl: string;
    galleryImageUrls: string[];
}

export enum Currency {
    DZD = 'DZD',
    EUR = 'EUR',
    USD = 'USD'
}

export interface FiscalInfo {
    RC: string;
    NIF: string;
}

export enum PricingAdjustmentType {
    PercentageIncrease = 'PercentageIncrease',
    FixedIncrease = 'FixedIncrease',
    PercentageDiscount = 'PercentageDiscount',
    FixedDiscount = 'FixedDiscount',
    SetPrice = 'SetPrice',
}

export interface PricingRule {
    id: string;
    name: string;
    adjustmentType: PricingAdjustmentType;
    value: number;
    daysOfWeek?: number[]; // 0 for Sunday, 6 for Saturday
    bungalowTypeIds: string[]; // Empty array means applies to all
    startDate?: string;
    endDate?: string;
}

export interface FinancialSettings {
    currency: Currency;
    fiscalInfo: FiscalInfo;
    pricingRules: PricingRule[];
}

export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
}

export interface TwoFactorAuthSettings {
    enforced: boolean;
}

export interface SecuritySettings {
    passwordPolicy: PasswordPolicy;
    twoFactorAuth: TwoFactorAuthSettings;
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
    automation: {
        enableAutoCleaning: boolean;
    };
}

export type PermissionsMap = { [key in Permission]?: boolean };

export interface RoleSetting {
    roleName: UserRole;
    permissions: PermissionsMap;
}

export interface LoyaltySettings {
    enabled: boolean;
    pointsPerNight: number;
    pointsForFirstReservation: number;
    pointsToCurrencyValue: number; // How many currency units one point is worth
}

export interface LicenseSettings {
    key: string;
    status: 'Active' | 'Expired' | 'Trial';
    expiresOn: string;
}

export interface Settings {
    general: GeneralSettings;
    financial: FinancialSettings;
    security: SecuritySettings;
    bungalows: BungalowSettings;
    roles: RoleSetting[];
    moduleStatus: { [key: string]: boolean };
    loyalty: LoyaltySettings;
    license: LicenseSettings;
}

export enum BungalowStatus {
    Available = 'Disponible',
    Occupied = 'Occupé',
    Cleaning = 'Nettoyage',
    Maintenance = 'Maintenance',
}

export enum BungalowType {
    Standard = 'Standard',
    Luxe = 'Luxe',
    Familial = 'Familial',
    Suite = 'Suite',
}

export interface Bungalow {
    id: string;
    name: string;
    type: BungalowType;
    status: BungalowStatus;
    capacity: number;
    pricePerNight: number;
    amenities: string[];
    imageUrl: string;
    description: string;
}

export enum ReservationStatus {
    Confirmed = 'Confirmée',
    Pending = 'En attente',
    Cancelled = 'Annulée'
}

export interface Reservation {
    id: string;
    bungalowId: string;
    clientId: string;
    startDate: string;
    endDate: string;
    status: ReservationStatus;
    totalPrice: number;
}

export interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    registrationDate: string;
    loyaltyPoints: number;
}

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
    createdDate: string;
    reportedBy: string;
    assignedToId?: string;
    resolvedDate?: string;
    resolutionDetails?: string;
}

export enum NotificationType {
    NewReservation,
    UpcomingCheckIn,
    OverdueInvoice,
    MaintenanceAssigned,
}

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: string;
    isRead: boolean;
    relatedId?: string; // e.g., reservation ID or invoice ID
}

export interface AuditLog {
    id: string;
    user: { id: string, name: string };
    action: string;
    timestamp: string;
    details: string;
}

export enum InvoiceStatus {
    Paid = 'Payée',
    Unpaid = 'Non Payée',
    Overdue = 'En Retard',
    Cancelled = 'Annulée',
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
    issueDate: string;
    dueDate: string;
    totalAmount: number;
    status: InvoiceStatus;
    items: InvoiceItem[];
}

export interface CommunicationLog {
    id: string;
    recipients: string[]; // Array of client IDs
    subject: string;
    body: string;
    sentDate: string;
    status: 'Envoyé' | 'Échoué';
    sentBy: string; // User ID
}

export enum LoyaltyLogType {
    Earned = 'Gagnés',
    Redeemed = 'Utilisés',
    ManualAdjustment = 'Ajustement manuel',
    InitialBonus = 'Bonus initial'
}

export interface LoyaltyLog {
    id: string;
    clientId: string;
    type: LoyaltyLogType;
    pointsChange: number;
    reason: string;
    timestamp: string;
    relatedId?: string; // e.g., reservation ID
    adminUserId?: string;
}