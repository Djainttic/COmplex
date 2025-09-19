import React from 'react';
import { Invoice, InvoiceStatus, Client } from '../../types';
import Badge from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { formatDateDDMMYYYY } from '../../constants';

interface InvoiceTableProps {
  invoices: Invoice[];
  clients: Client[];
  onView: (invoice: Invoice) => void;
  onUpdateStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, clients, onView, onUpdateStatus }) => {
    const { hasPermission } = useAuth();
    const canWrite = hasPermission('billing:write');
    const clientMap = new Map(clients.map(c => [c.id, c.name]));

    const getStatusBadgeColor = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.Paid: return 'green';
            case InvoiceStatus.Unpaid: return 'yellow';
            case InvoiceStatus.Overdue: return 'red';
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
                            <th scope="col" className="px-6 py-3">Actions</th>
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
                            invoices.map((invoice) => (
                                <tr key={invoice.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{invoice.id}</td>
                                    <td className="px-6 py-4">{clientMap.get(invoice.clientId) || 'Client inconnu'}</td>
                                    <td className="px-6 py-4">{invoice.totalAmount.toLocaleString('fr-FR')} DZD</td>
                                    <td className="px-6 py-4">{formatDateDDMMYYYY(invoice.dueDate)}</td>
                                    <td className="px-6 py-4">
                                        <Badge color={getStatusBadgeColor(invoice.status)}>
                                            {invoice.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-left space-x-4 whitespace-nowrap">
                                        <button onClick={() => onView(invoice)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Voir</button>
                                        {canWrite && invoice.status !== InvoiceStatus.Paid && (
                                            <button onClick={() => onUpdateStatus(invoice.id, InvoiceStatus.Paid)} className="font-medium text-green-600 dark:text-green-500 hover:underline">Marquer Payée</button>
                                        )}
                                        <button disabled className="font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed">Télécharger</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoiceTable;