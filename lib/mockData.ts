// lib/mockData.ts
import {
  Settings,
  UserRole,
  BungalowType,
  Currency, PricingAdjustmentType, Permission, RoleSetting
} from '../types';

const ALL_PERMISSIONS: Permission[] = [
  'bungalows:read', 'bungalows:create', 'bungalows:update', 'bungalows:delete', 'bungalows:update_status',
  'reservations:read', 'reservations:write',
  'clients:read', 'clients:write',
  'billing:read', 'billing:write',
  'loyalty:read', 'loyalty:write',
  'communication:read', 'communication:write',
  'maintenance:read', 'maintenance:write',
  'reports:read', 'reports:write',
  'users:read', 'users:write',
  'settings:read', 'settings:write'
];

const ADMIN_PERMISSIONS: Permission[] = ALL_PERMISSIONS;
const MANAGER_PERMISSIONS: Permission[] = [
    'bungalows:read', 'bungalows:update_status', 'reservations:read', 'reservations:write', 'clients:read', 'clients:write', 'billing:read',
    'loyalty:read', 'communication:read', 'maintenance:read', 'maintenance:write', 'reports:read'
];
const EMPLOYEE_PERMISSIONS: Permission[] = [
    'bungalows:read', 'bungalows:update_status', 'reservations:read', 'clients:read', 'maintenance:read'
];

const createPermissionsMap = (allowed: Permission[]): { [key in Permission]?: boolean } => {
    const map: { [key in Permission]?: boolean } = {};
    for (const p of ALL_PERMISSIONS) {
        map[p] = allowed.includes(p);
    }
    return map;
};

export const MOCK_ROLES: RoleSetting[] = [
    { roleName: UserRole.SuperAdmin, permissions: createPermissionsMap(ALL_PERMISSIONS) },
    { roleName: UserRole.Admin, permissions: createPermissionsMap(ADMIN_PERMISSIONS) },
    { roleName: UserRole.Manager, permissions: createPermissionsMap(MANAGER_PERMISSIONS) },
    { roleName: UserRole.Employee, permissions: createPermissionsMap(EMPLOYEE_PERMISSIONS) },
];

export const MOCK_SETTINGS: Settings = {
    general: { complexName: 'Syphax B-Resort', logoUrl: 'https://i.ibb.co/2d9y22T/syphax-logo.png', bungalowCount: 10, loginImageUrl: 'https://i.ibb.co/3W81zgx/syphax-bg.jpg', galleryImageUrls: ['https://i.ibb.co/q0zM0gM/gallery1.jpg', 'https://i.ibb.co/pzp5z5T/gallery2.jpg'] },
    financial: {
        currency: Currency.DZD, fiscalInfo: { RC: 'RC/12345/2024', NIF: 'NIF/54321/2024' },
        pricingRules: [
            { id: 'rule-1', name: 'Week-end Haut Tarif', adjustmentType: PricingAdjustmentType.PercentageIncrease, value: 20, daysOfWeek: [4, 5], bungalowTypeIds: [], },
            { id: 'rule-2', name: 'Promotion Été', adjustmentType: PricingAdjustmentType.PercentageDiscount, value: 15, bungalowTypeIds: [], startDate: '2024-07-01', endDate: '2024-08-31' },
        ]
    },
    security: { passwordPolicy: { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSymbols: false }, twoFactorAuth: { enforced: false } },
    bungalows: {
        types: [
            { id: 'type-1', name: BungalowType.Standard, capacity: 2, defaultPrice: 10000, amenities: ['Wi-Fi', 'TV'], description: 'Simple et confortable.' },
            { id: 'type-2', name: BungalowType.Luxe, capacity: 2, defaultPrice: 20000, amenities: ['Wi-Fi', 'TV', 'Climatisation', 'Vue sur mer'], description: 'Luxe et vue imprenable.' },
            { id: 'type-3', name: BungalowType.Familial, capacity: 4, defaultPrice: 18000, amenities: ['Wi-Fi', 'TV', 'Climatisation', 'Cuisine'], description: 'Idéal pour les familles.' },
        ],
        allAmenities: [{ id: 'amen-1', name: 'Wi-Fi' }, { id: 'amen-2', name: 'TV' }, { id: 'amen-3', name: 'Climatisation' }, { id: 'amen-4', name: 'Vue sur mer' }, { id: 'amen-5', name: 'Cuisine' }],
        automation: { enableAutoCleaning: true }
    },
    roles: MOCK_ROLES,
    moduleStatus: { 'bungalows': true, 'reservations': true, 'clients': true, 'facturation': true, 'fidelite': true, 'communication': true, 'maintenance': true, 'rapports': true, 'utilisateurs': true, 'ai': true },
    loyalty: { enabled: true, pointsPerNight: 10, pointsForFirstReservation: 50, pointsToCurrencyValue: 10 },
    license: { key: 'SYPHX-PRO-XXXX-YYYY-ZZZZ', status: 'Active', expiresOn: '2025-12-31T23:59:59Z' }
};
