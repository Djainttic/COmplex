import React from 'react';
import { Invoice, Bungalow, Client } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatDateDDMMYYYY } from '../../constants';

interface InvoiceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceData: {
        invoice: Invoice;
        bungalow: Bungalow;
        client: Client;
    };
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ isOpen, onClose, invoiceData }) => {
    const { settings } = useAuth();
    const { invoice, client } = invoiceData;
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Facture ${invoice.id}`}
            size="3xl"
            footer={
                <>
                    <Button variant="secondary" onClick={() => window.print()}>Imprimer</Button>
                    <Button onClick={onClose}>Fermer</Button>
                </>
            }
        >
            <div className="printable-area text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-8">
                {/* Header */}
                <div className="flex justify-between items-start pb-4 border-b dark:border-gray-600">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{settings.general.complexName}</h2>
                        <p>{settings.financial.fiscalInfo.RC}</p>
                        <p>{`NIF: ${settings.financial.fiscalInfo.NIF}`}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-lg font-semibold uppercase">Facture</h3>
                        <p># {invoice.id}</p>
                    </div>
                </div>

                {/* Client & Dates Info */}
                <div className="grid grid-cols-2 gap-4 py-6">
                    <div>
                        <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-1">FACTURÉ À</h4>
                        <p className="font-bold">{client.name}</p>
                        <p>{client.email}</p>
                        <p>{client.phone}</p>
                    </div>
                     <div className="text-right">
                        <p><span className="font-semibold">Date d'émission :</span> {formatDateDDMMYYYY(invoice.issueDate)}</p>
                        <p><span className="font-semibold">Date d'échéance :</span> {formatDateDDMMYYYY(invoice.dueDate)}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="p-2 font-semibold">Description</th>
                                <th className="p-2 text-right font-semibold">Qté</th>
                                <th className="p-2 text-right font-semibold">Prix Unitaire</th>
                                <th className="p-2 text-right font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="border-b dark:border-gray-700">
                                    <td className="p-2">{item.description}</td>
                                    <td className="p-2 text-right">{item.quantity}</td>
                                    <td className="p-2 text-right">{item.unitPrice.toLocaleString('fr-FR')}</td>
                                    <td className="p-2 text-right">{item.total.toLocaleString('fr-FR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                 <div className="flex justify-end pt-6">
                    <div className="w-full max-w-sm space-y-2">
                         <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                            <span>Total à Payer</span>
                            <span>{invoice.totalAmount.toLocaleString('fr-FR')} {settings.financial.currency}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-8 mt-8 border-t dark:border-gray-600 text-center text-xs text-gray-500 dark:text-gray-400">
                    <p>Merci pour votre confiance.</p>
                </div>
            </div>
        </Modal>
    );
};

export default InvoiceDetailsModal;