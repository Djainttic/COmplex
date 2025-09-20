import React from 'react';
import { Invoice, InvoiceStatus, Client } from '../../types';
import Badge from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { formatDateDDMMYYYY } from '../../constants';
import InvoiceActionsDropdown from './InvoiceActionsDropdown';

interface InvoiceTableProps {
  invoices: Invoice[];
  clients: Client[];
  onView: (invoice: Invoice) => void;
  onUpdateStatus: (invoiceId: string, status: InvoiceStatus) => void;
  onEdit: (invoice: Invoice) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, clients, onView, onUpdateStatus, onEdit }) => {
    const { hasPermission } = useAuth();
    const canWrite = hasPermission('billing:write');
    const clientMap = new Map(clients.map(c => [c.id, c.name]));

    const getStatusBadgeColor = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.Paid: return 'green';
            case InvoiceStatus.Unpaid: return 'yellow';
            case InvoiceStatus.Overdue: return 'red';
            case InvoiceStatus.Cancelled: return 'gray';
            default: return 'gray';
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">N° Facture</th>
                            <th scope="col" className="px-6 py-3">Client</th>
                            <th scope="col" className="px-6 py-3">Montant</th>
                            <th scope="col" className="px-6 py-3">Date d'échéance</th>
                            <th scope="col" className="px-6 py-3">Statut</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    Aucune facture ne correspond aux filtres sélectionnés.
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => {
                                const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status === InvoiceStatus.Overdue;
                                return (
                                <tr key={invoice.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{invoice.id}</td>
                                    <td className="px-6 py-4">{clientMap.get(invoice.clientId) || 'Client inconnu'}</td>
                                    <td className="px-6 py-4">{invoice.totalAmount.toLocaleString('fr-FR')} DZD</td>
                                    <td className={`px-6 py-4 ${isOverdue ? 'text-red-500' : ''}`}>
                                        <div className="flex items-center">
                                          {isOverdue && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                          {formatDateDDMMYYYY(invoice.dueDate)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={getStatusBadgeColor(invoice.status)}>
                                            {invoice.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                       <InvoiceActionsDropdown
                                            invoice={invoice}
                                            onView={onView}
                                            onEdit={onEdit}
                                            onUpdateStatus={onUpdateStatus}
                                            canWrite={canWrite}
                                        />
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoiceTable;